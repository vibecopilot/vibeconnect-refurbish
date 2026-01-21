import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  DollarSign,
  CreditCard,
  Hotel,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Receipt,
  MapPin,
  Bed,
  Mail,
  CheckSquare,
  XSquare,
} from 'lucide-react';
import { getHotelRequestDetails } from '../../api';
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

interface HotelBooking {
  id: number;
  employee_name?: string;
  destination?: string;
  hotel_preferences?: string;
  check_in_date?: string;
  check_out_date?: string;
  number_of_rooms?: number;
  room_type?: string;
  booking_status?: string;
  booking_confirmation_number?: string;
  booking_certification_email?: string;
  manager_approval?: boolean;
  created_at?: string;
  amount?: number;
  payment_status?: string;
  payment_method?: string;
  description?: string;
  terms?: string;
}

const ViewHotelBooking: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [bookingDetails, setBookingDetails] = useState<HotelBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      if (!id) return;

      setLoading(true);
      setError(null);

      try {
        const response = await getHotelRequestDetails(id);
        const data = response?.data?.hotel || response?.data;
        
        if (!data || !data.id) {
          setError('No booking data found.');
          setBookingDetails(null);
          return;
        }

        setBookingDetails(data);
      } catch (err) {
        console.error('Error fetching hotel booking:', err);
        setError('Failed to fetch booking details. Please try again.');
        setBookingDetails(null);
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [id]);

  const formatDate = (dateString?: string): string => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yy = date.getFullYear();
    return `${dd}/${mm}/${yy}`;
  };

  const calculateNights = (checkIn?: string, checkOut?: string): number => {
    if (!checkIn || !checkOut) return 0;
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusBadge = (status?: string | boolean) => {
    if (typeof status === 'boolean') {
      return status
        ? {
            label: 'Approved',
            className: 'bg-success/10 text-success border-success/20',
            icon: CheckCircle,
          }
        : {
            label: 'Rejected',
            className: 'bg-error/10 text-error border-error/20',
            icon: XCircle,
          };
    }

    const s = status?.toLowerCase() || '';
    if (s === 'paid' || s === 'confirmed' || s === 'approved' || s === 'true') {
      return {
        label: status === 'true' ? 'Approved' : status || 'Confirmed',
        className: 'bg-success/10 text-success border-success/20',
        icon: CheckCircle,
      };
    }
    if (s === 'cancelled' || s === 'rejected' || s === 'false') {
      return {
        label: status === 'false' ? 'Rejected' : status || 'Cancelled',
        className: 'bg-error/10 text-error border-error/20',
        icon: XCircle,
      };
    }
    if (s === 'pending') {
      return {
        label: 'Pending',
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
        <p className="text-muted-foreground">Loading hotel booking details...</p>
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
          onClick={() => navigate('/amenities/hotel')}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          Back to Hotel Bookings
        </button>
      </div>
    );
  }

  const bookingStatusInfo = getStatusBadge(bookingDetails.booking_status);
  const paymentStatusInfo = getStatusBadge(bookingDetails.payment_status);
  const managerApprovalInfo = getStatusBadge(bookingDetails.manager_approval);
  const BookingStatusIcon = bookingStatusInfo.icon;
  const PaymentStatusIcon = paymentStatusInfo.icon;
  const ManagerApprovalIcon = managerApprovalInfo.icon;

  const nights = calculateNights(bookingDetails.check_in_date, bookingDetails.check_out_date);

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="p-6 pb-0">
        <Breadcrumb
          items={[
            { label: 'Booking Management', path: '/amenities' },
            { label: 'Hotel Bookings', path: '/amenities/hotel' },
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
                onClick={() => navigate('/amenities/hotel')}
                className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <div className="h-8 w-px bg-border" />
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                  <Hotel className="h-5 w-5 text-foreground" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold text-foreground">
                      Booking #{bookingDetails.id}
                    </h1>
                    <span className={cn('px-2 py-0.5 text-xs font-medium rounded-full border', bookingStatusInfo.className)}>
                      {bookingStatusInfo.label}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {bookingDetails.hotel_preferences || bookingDetails.destination || 'Hotel Booking'}
                  </p>
                </div>
              </div>
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
        {/* Booking Status Card */}
        <motion.div
          variants={item}
          className={cn(
            'col-span-12 lg:col-span-3 row-span-1 rounded-xl border p-4 shadow-sm',
            bookingStatusInfo.className
          )}
        >
          <BookingStatusIcon className={cn('h-8 w-8 mb-2', bookingStatusInfo.className.split(' ')[1])} />
          <p className="text-2xl font-bold">{bookingStatusInfo.label}</p>
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

        {/* Check-in Date Card */}
        <motion.div
          variants={item}
          className="col-span-12 lg:col-span-3 row-span-1 bg-gradient-to-br from-success/10 to-transparent rounded-xl border p-4 shadow-sm"
        >
          <Calendar className="h-8 w-8 text-success mb-2" />
          <p className="text-lg font-bold">{formatDate(bookingDetails.check_in_date)}</p>
          <p className="text-sm text-muted-foreground">Check-in Date</p>
        </motion.div>

        {/* Check-out Date Card */}
        <motion.div
          variants={item}
          className="col-span-12 lg:col-span-3 row-span-1 bg-gradient-to-br from-info/10 to-transparent rounded-xl border p-4 shadow-sm"
        >
          <Calendar className="h-8 w-8 text-info mb-2" />
          <p className="text-lg font-bold">{formatDate(bookingDetails.check_out_date)}</p>
          <p className="text-sm text-muted-foreground">Check-out Date</p>
        </motion.div>

        {/* Hotel Details */}
        <motion.div
          variants={item}
          className="col-span-12 lg:col-span-6 row-span-2 bg-card rounded-2xl border p-6 shadow-sm"
        >
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Hotel className="h-5 w-5 text-primary" />
            Hotel Details
          </h2>
          <div className="space-y-3">
            <div className="bg-primary/10 rounded-lg p-4">
              <p className="text-xs text-muted-foreground mb-1">Hotel Preferences</p>
              <p className="text-lg font-semibold text-primary">
                {bookingDetails.hotel_preferences || 'Not specified'}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Destination</p>
                <p className="font-medium text-sm flex items-center gap-1 mt-1">
                  <MapPin className="h-3 w-3" />
                  {bookingDetails.destination || 'N/A'}
                </p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Room Type</p>
                <p className="font-medium text-sm">{bookingDetails.room_type || 'N/A'}</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Number of Rooms</p>
                <p className="font-medium text-sm flex items-center gap-1 mt-1">
                  <Bed className="h-3 w-3" />
                  {bookingDetails.number_of_rooms || 'N/A'}
                </p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Duration</p>
                <p className="font-medium text-sm">{nights} {nights === 1 ? 'night' : 'nights'}</p>
              </div>
            </div>
            {bookingDetails.description && (
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">Description</p>
                <p className="text-sm">{bookingDetails.description}</p>
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
              <span className="font-medium">{bookingDetails.employee_name || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">Booked On</span>
              <span className="font-medium">{formatDate(bookingDetails.created_at)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">Check-in Date</span>
              <span className="font-medium">{formatDate(bookingDetails.check_in_date)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">Check-out Date</span>
              <span className="font-medium">{formatDate(bookingDetails.check_out_date)}</span>
            </div>
            {bookingDetails.booking_confirmation_number && (
              <div className="bg-primary/10 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">Confirmation Number</p>
                <p className="font-medium text-sm text-primary">
                  {bookingDetails.booking_confirmation_number}
                </p>
              </div>
            )}
            {bookingDetails.booking_certification_email && (
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  Certification Email
                </p>
                <p className="text-sm">{bookingDetails.booking_certification_email}</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Payment Details */}
        {bookingDetails.payment_status && (
          <motion.div
            variants={item}
            className="col-span-12 lg:col-span-6 row-span-2 bg-card rounded-2xl border p-6 shadow-sm"
          >
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <Receipt className="h-5 w-5 text-primary" />
              Payment Details
            </h2>
            <div className="space-y-3">
              <div className={cn('rounded-lg p-4 border', paymentStatusInfo.className)}>
                <div className="flex items-center gap-2 mb-2">
                  <PaymentStatusIcon className={cn('h-5 w-5', paymentStatusInfo.className.split(' ')[1])} />
                  <p className="text-sm font-medium">Payment Status</p>
                </div>
                <p className="text-lg font-bold">{paymentStatusInfo.label}</p>
              </div>
              {bookingDetails.payment_method && (
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm text-muted-foreground">Payment Method</span>
                  <span className="font-medium">{bookingDetails.payment_method}</span>
                </div>
              )}
              {bookingDetails.amount && (
                <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg">
                  <span className="text-sm text-muted-foreground">Total Amount</span>
                  <span className="font-bold text-lg text-primary">
                    ₹{bookingDetails.amount.toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Manager Approval */}
        {bookingDetails.manager_approval !== undefined && (
          <motion.div
            variants={item}
            className="col-span-12 lg:col-span-6 row-span-2 bg-card rounded-2xl border p-6 shadow-sm"
          >
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-primary" />
              Manager Approval
            </h2>
            <div className={cn('rounded-lg p-4 border', managerApprovalInfo.className)}>
              <div className="flex items-center gap-2 mb-2">
                <ManagerApprovalIcon className={cn('h-5 w-5', managerApprovalInfo.className.split(' ')[1])} />
                <p className="text-sm font-medium">Approval Status</p>
              </div>
              <p className="text-lg font-bold">{managerApprovalInfo.label}</p>
            </div>
          </motion.div>
        )}

        {/* Terms & Conditions */}
        {bookingDetails.terms && (
          <motion.div
            variants={item}
            className="col-span-12 row-span-1 bg-card rounded-2xl border p-6 shadow-sm"
          >
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Terms & Conditions
            </h2>
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm whitespace-pre-wrap">{bookingDetails.terms}</p>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default ViewHotelBooking;