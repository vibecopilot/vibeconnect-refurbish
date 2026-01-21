import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  DollarSign,
  CreditCard,
  Building2,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Receipt,
  MapPin,
  Phone,
  Mail,
} from 'lucide-react';
import {
  getAmenitiesBookingById,
  getSetupUsers,
  getFacitilitySetupId,
  getPaymentBookings,
  postPaymentBookings,
  updateAmenityBook,
} from '../../api';
import Breadcrumb from '../../components/ui/Breadcrumb';
import toast from 'react-hot-toast';

// cn utility function
const cn = (...classes: (string | boolean | undefined)[]) => {
  return classes.filter(Boolean).join(' ');
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const item = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1 }
};

const ViewSpaceBooking: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [userName, setUserName] = useState('');
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const [facilityDetails, setFacilityDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    resource_id: id,
    resource_type: 'AmenityBooking',
    paid_amount: '',
    user_id: '',
    payment_method: '',
    transaction_id: '',
    payment_date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const unwrap = (res: any) => res?.data ?? res;
  const safeArray = (maybeArray: any) => (Array.isArray(maybeArray) ? maybeArray : []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      // 1) Booking
      const bookingRaw = unwrap(await getAmenitiesBookingById(id));
      const bookingObj = bookingRaw?.amenity_booking || bookingRaw;

      if (!bookingObj || typeof bookingObj !== 'object' || !bookingObj.id) {
        setError('No booking data found.');
        setBookingDetails(null);
        setFacilityDetails(null);
        return;
      }

      setBookingDetails(bookingObj);

      setFormData((prev) => ({
        ...prev,
        resource_id: bookingObj.id,
        user_id: bookingObj.user_id ?? '',
      }));

      // 2) Facility
      const amenityId = bookingObj.amenity_id;
      let facilityObj = bookingObj.amenity || null;

      if (amenityId) {
        try {
          const facilityRaw = unwrap(await getFacitilitySetupId(amenityId));
          const fd = facilityRaw?.amenity || facilityRaw;
          if (fd && typeof fd === 'object') facilityObj = fd;
        } catch (e) {
          // keep fallback
        }
      }

      setFacilityDetails(facilityObj);

      // 3) Payments
      try {
        const paymentRaw = unwrap(await getPaymentBookings());
        const payments =
          safeArray(paymentRaw) ||
          safeArray(paymentRaw?.payments) ||
          safeArray(paymentRaw?.data) ||
          safeArray(paymentRaw?.data?.data);

        const match = payments.find(
          (p: any) =>
            Number(p?.resource_id) === Number(bookingObj.id) &&
            String(p?.resource_type || '') === 'AmenityBooking'
        );

        if (match) {
          setFormData((prev) => ({
            ...prev,
            paid_amount: match.paid_amount ?? '',
            payment_method: match.payment_method ?? '',
            transaction_id: match.transaction_id ?? '',
            payment_date: match.payment_date ?? prev.payment_date,
            notes: match.notes ?? '',
          }));

          setBookingDetails((prev: any) => ({ ...prev, payment: match }));
        }
      } catch (e) {
        // ignore
      }

      // 4) Users
      try {
        const usersRaw = unwrap(await getSetupUsers());
        const users = safeArray(usersRaw) || safeArray(usersRaw?.users);

        const u = users.find((x: any) => Number(x?.id) === Number(bookingObj.user_id));
        setUserName(
          u ? `${u.firstname || ''} ${u.lastname || ''}`.trim() : bookingObj.book_by_user || 'User'
        );
      } catch (e) {
        setUserName(bookingObj.book_by_user || 'User');
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch data. Please try again.');
      setBookingDetails(null);
      setFacilityDetails(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const postPaymentBooking = async () => {
    if (!bookingDetails) return;

    if (!formData.payment_method || !formData.transaction_id || !formData.paid_amount) {
      toast.error('Payment Type, amount, and Transaction Id are mandatory!');
      return;
    }

    if (Number(formData.paid_amount) !== Number(bookingDetails.amount)) {
      toast.error('Paid amount must equal the payable amount!');
      return;
    }

    try {
      const postData = new FormData();
      postData.append('payment[resource_id]', String(bookingDetails.id));
      postData.append('payment[resource_type]', 'AmenityBooking');
      postData.append('payment[total_amount]', String(bookingDetails.amount ?? ''));
      postData.append('payment[paid_amount]', String(formData.paid_amount));
      postData.append('payment[payment_method]', String(formData.payment_method).toLowerCase());
      postData.append('payment[transaction_id]', String(formData.transaction_id));
      postData.append('payment[payment_date]', String(formData.payment_date));
      postData.append('payment[notes]', String(formData.notes || ''));

      const res = await postPaymentBookings(postData);

      const status = res?.status ?? 200;
      if (status === 201 || status === 200) {
        try {
          await updateAmenityBook(id, { status: 'paid' });
        } catch (e) {}

        setBookingDetails((prev: any) => ({
          ...prev,
          status: 'paid',
          payment: {
            payment_method: formData.payment_method,
            total_amount: bookingDetails.amount,
            paid_amount: formData.paid_amount,
            payment_date: formData.payment_date,
            transaction_id: formData.transaction_id,
            notes: formData.notes || 'N/A',
            resource_id: bookingDetails.id,
            resource_type: 'AmenityBooking',
          },
        }));

        setShowModal(false);
        toast.success('Payment Captured successfully!');
      } else {
        toast.error('Payment capture failed. Please try again.');
      }
    } catch (err) {
      console.error('Error in payment:', err);
      toast.error('Error in payment. Please try again.');
    }
  };

  const handleConfirmCancel = async () => {
    try {
      const res = await updateAmenityBook(id, { status: 'cancelled' });
      const status = res?.status ?? 200;
      if (status === 200) {
        toast.success('Status Cancelled!');
        navigate('/space-booking');
      } else {
        toast.error('Failed to cancel booking.');
      }
    } catch (err) {
      console.error('Error cancelling booking:', err);
      toast.error('An error occurred while cancelling.');
    }
  };

  const slotTime = useMemo(() => {
    const amenitySlotId = bookingDetails?.amenity_slot_id;
    const slots = facilityDetails?.amenity_slots || bookingDetails?.amenity?.amenity_slots || [];
    if (!amenitySlotId || !Array.isArray(slots)) return 'N/A';

    const selected = slots.find((s: any) => Number(s.id) === Number(amenitySlotId));
    if (!selected) return 'N/A';

    return selected.twelve_hr_slot || selected.slot_str || 'N/A';
  }, [bookingDetails?.amenity_slot_id, facilityDetails, bookingDetails?.amenity]);

  const formatDate = (dateString?: string): string => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yy = date.getFullYear();
    return `${dd}/${mm}/${yy}`;
  };

  const getStatusBadge = (status?: string) => {
    const s = status?.toLowerCase() || '';
    if (s === 'paid' || s === 'confirmed' || s === 'approved') {
      return {
        label: status || 'Paid',
        className: 'bg-success/10 text-success border-success/20',
        icon: CheckCircle,
      };
    }
    if (s === 'cancelled' || s === 'rejected') {
      return {
        label: status || 'Cancelled',
        className: 'bg-error/10 text-error border-error/20',
        icon: XCircle,
      };
    }
    if (s === 'pending') {
      return {
        label: status || 'Pending',
        className: 'bg-warning/10 text-warning border-warning/20',
        icon: Clock,
      };
    }
    return {
      label: status || 'Unknown',
      className: 'bg-muted text-muted-foreground border-border',
      icon: AlertCircle,
    };
  };

  if (loading) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading booking details...</p>
      </div>
    );
  }

  if (error || !bookingDetails) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh]">
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <h3 className="text-lg font-semibold mb-2">Failed to Load Booking</h3>
        <p className="text-muted-foreground mb-4">{error || 'No booking details available'}</p>
        <button
          onClick={() => navigate('/space-booking')}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          Back to Bookings
        </button>
      </div>
    );
  }

  const statusInfo = getStatusBadge(bookingDetails.status);
  const StatusIcon = statusInfo.icon;
  const facName = facilityDetails?.fac_name || bookingDetails?.amenity?.fac_name || 'N/A';

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="p-6 pb-0">
        <Breadcrumb
          items={[
            { label: 'Booking Management', path: '/space-booking' },
            { label: 'Space Booking', path: '/space-booking' },
            { label: `Booking #${bookingDetails.id}` },
          ]}
        />
      </div>

      {/* Header */}
      <header className="sticky top-0 bg-background/95 backdrop-blur-sm border-b z-20">
        <div className="w-full px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/space-booking')}
                className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <div className="h-8 w-px bg-border" />
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-foreground" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold text-foreground">
                      Booking #{bookingDetails.id}
                    </h1>
                    <span className={cn('px-2 py-0.5 text-xs font-medium rounded-full border', statusInfo.className)}>
                      {statusInfo.label}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{facName}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {bookingDetails.status !== 'cancelled' && bookingDetails.status !== 'paid' && (
                <button
                  onClick={() => setShowModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-warning text-white rounded-lg hover:bg-warning/90 transition-colors text-sm"
                >
                  <CreditCard className="h-4 w-4" />
                  Capture Payment
                </button>
              )}
              {bookingDetails.status !== 'paid' && (
                <button
                  onClick={() => setShowConfirmPopup(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-error text-white rounded-lg hover:bg-error/90 transition-colors text-sm"
                >
                  <XCircle className="h-4 w-4" />
                  Cancel Booking
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Bento Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="w-full px-6 pb-6 grid grid-cols-12 gap-4 auto-rows-[minmax(120px,auto)]"
      >
        {/* Status Card */}
        <motion.div
          variants={item}
          className={cn(
            'col-span-12 lg:col-span-3 row-span-1 rounded-xl border p-4 shadow-sm',
            statusInfo.className
          )}
        >
          <StatusIcon className={cn('h-8 w-8 mb-2', statusInfo.className.split(' ')[1])} />
          <p className="text-2xl font-bold">{statusInfo.label}</p>
          <p className="text-sm text-muted-foreground mt-1">Booking Status</p>
        </motion.div>

        {/* Amount Card */}
        <motion.div
          variants={item}
          className="col-span-12 lg:col-span-3 row-span-1 bg-gradient-to-br from-primary/10 to-transparent rounded-xl border p-4 shadow-sm"
        >
          <DollarSign className="h-8 w-8 text-primary mb-2" />
          <p className="text-3xl font-bold">₹{bookingDetails.amount?.toLocaleString() || '0'}</p>
          <p className="text-sm text-muted-foreground">Total Amount</p>
        </motion.div>

        {/* Booking Date Card */}
        <motion.div
          variants={item}
          className="col-span-12 lg:col-span-3 row-span-1 bg-gradient-to-br from-info/10 to-transparent rounded-xl border p-4 shadow-sm"
        >
          <Calendar className="h-8 w-8 text-info mb-2" />
          <p className="text-lg font-bold">{formatDate(bookingDetails.booking_date)}</p>
          <p className="text-sm text-muted-foreground">Scheduled Date</p>
        </motion.div>

        {/* Slot Time Card */}
        <motion.div
          variants={item}
          className="col-span-12 lg:col-span-3 row-span-1 bg-gradient-to-br from-success/10 to-transparent rounded-xl border p-4 shadow-sm"
        >
          <Clock className="h-8 w-8 text-success mb-2" />
          <p className="text-lg font-bold">{slotTime}</p>
          <p className="text-sm text-muted-foreground">Scheduled Time</p>
        </motion.div>

        {/* Facility Details */}
        <motion.div
          variants={item}
          className="col-span-12 lg:col-span-6 row-span-2 bg-card rounded-2xl border p-6 shadow-sm"
        >
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Facility Details
          </h2>
          <div className="space-y-3">
            <div className="bg-primary/10 rounded-lg p-4">
              <p className="text-xs text-muted-foreground mb-1">Facility Name</p>
              <p className="text-lg font-semibold text-primary">{facName}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Facility Type</p>
                <p className="font-medium text-sm">{facilityDetails?.fac_type || bookingDetails?.amenity?.fac_type || 'N/A'}</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Booking ID</p>
                <p className="font-medium text-sm">#{bookingDetails.id}</p>
              </div>
            </div>
            {facilityDetails?.description && (
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">Description</p>
                <p className="text-sm">{facilityDetails.description}</p>
              </div>
            )}
            {facilityDetails?.terms && (
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">Terms & Conditions</p>
                <p className="text-sm">{facilityDetails.terms}</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Booking Information */}
        <motion.div
          variants={item}
          className="col-span-12 lg:col-span-6 row-span-2 bg-card rounded-2xl border p-6 shadow-sm"
        >
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Booking Information
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">Booked By</span>
              <span className="font-medium">{userName || bookingDetails.book_by_user || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">Booked On</span>
              <span className="font-medium">{formatDate(bookingDetails.created_at)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">Scheduled Date</span>
              <span className="font-medium">{formatDate(bookingDetails.booking_date)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg">
              <span className="text-sm text-muted-foreground">Scheduled Time</span>
              <span className="font-medium text-primary">{slotTime}</span>
            </div>
          </div>
        </motion.div>

        {/* Payment Details */}
        {bookingDetails.payment && (
          <motion.div
            variants={item}
            className="col-span-12 lg:col-span-6 row-span-2 bg-card rounded-2xl border p-6 shadow-sm"
          >
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <Receipt className="h-5 w-5 text-primary" />
              Payment Details
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <span className="text-sm text-muted-foreground">Payment Method</span>
                <span className="font-medium">{bookingDetails.payment.payment_method || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <span className="text-sm text-muted-foreground">Transaction ID</span>
                <span className="font-medium">{bookingDetails.payment.transaction_id || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <span className="text-sm text-muted-foreground">Payment Date</span>
                <span className="font-medium">{formatDate(bookingDetails.payment.payment_date)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg">
                <span className="text-sm text-muted-foreground">Paid Amount</span>
                <span className="font-bold text-lg text-primary">
                  ₹{bookingDetails.payment.paid_amount?.toLocaleString() || '0'}
                </span>
              </div>
              {bookingDetails.payment.notes && (
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Notes</p>
                  <p className="text-sm">{bookingDetails.payment.notes}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Confirm Cancel Modal */}
      {showConfirmPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div
            className="w-full max-w-md bg-card border border-border rounded-xl shadow-xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-error/10 flex items-center justify-center">
                <XCircle className="h-5 w-5 text-error" />
              </div>
              <h3 className="text-lg font-semibold">Cancel Booking</h3>
            </div>
            <p className="text-muted-foreground mb-6">
              Are you sure you want to cancel this booking? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
                onClick={() => setShowConfirmPopup(false)}
              >
                No, Stay
              </button>
              <button
                className="px-4 py-2 bg-error text-white rounded-lg hover:bg-error/90 transition-colors"
                onClick={handleConfirmCancel}
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Capture Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div
            className="w-full max-w-md bg-card border border-border rounded-xl shadow-xl p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Capture Payment
              </h2>
              <button
                className="text-2xl leading-none text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Total Amount</label>
                <input
                  type="text"
                  value={bookingDetails.amount ?? ''}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-muted"
                  disabled
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Paid Amount <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  name="paid_amount"
                  value={formData.paid_amount}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-border rounded-lg"
                  placeholder="Enter paid amount"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Payment Method <span className="text-error">*</span>
                </label>
                <select
                  className="w-full px-3 py-2 border border-border rounded-lg"
                  value={formData.payment_method}
                  onChange={handleInputChange}
                  name="payment_method"
                >
                  <option value="">Select Payment Method</option>
                  <option value="CHEQUE">Cheque</option>
                  <option value="UPI">UPI</option>
                  <option value="NEFT">NEFT</option>
                  <option value="CASH">Cash</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Transaction ID <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  name="transaction_id"
                  value={formData.transaction_id}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-border rounded-lg"
                  placeholder="Enter transaction ID"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Payment Date</label>
                <input
                  type="date"
                  name="payment_date"
                  value={formData.payment_date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Remarks</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-border rounded-lg"
                  rows={3}
                  placeholder="Enter any remarks"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  onClick={postPaymentBooking}
                >
                  Submit Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewSpaceBooking;