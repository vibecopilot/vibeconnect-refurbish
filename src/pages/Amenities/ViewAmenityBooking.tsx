import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  DollarSign,
  Building2,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Receipt,
  CreditCard,
  CalendarDays,
} from 'lucide-react';
import { getAmenitiesBookingById, getFacitilitySetup } from '../../api';
import Breadcrumb from '../../components/ui/Breadcrumb';

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

interface AmenityBooking {
  id: number;
  amenity_id?: number;
  amenity_slot_id?: number;
  fac_name?: string;
  fac_type?: string;
  amount?: number;
  status?: string;
  payment?: { payment_method?: string };
  payment_method?: string;
  book_by_user?: string;
  created_at?: string;
  booking_date?: string;
  slot_time?: string;
  description?: string;
  terms?: string;
  notes?: string;
}

interface Facility {
  id: number;
  fac_name: string;
  fac_type: string;
  description?: string;
  terms?: string;
  amenity_slots?: { id: number; start_hr: number; start_min: number; end_hr: number; end_min: number }[];
}

const ViewAmenityBooking: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [bookingDetails, setBookingDetails] = useState<AmenityBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      if (!id) return;

      setLoading(true);
      setError(null);

      try {
        const [bookingRes, facilitiesRes] = await Promise.all([
          getAmenitiesBookingById(id),
          getFacitilitySetup()
        ]);

        const bookingData = bookingRes?.data?.amenity_booking || bookingRes?.data;

        if (!bookingData || !bookingData.id) {
          setError('No booking data found.');
          setBookingDetails(null);
          return;
        }

        // Get facility details
        const facilitiesData: Facility[] = Array.isArray(facilitiesRes?.data?.amenities)
          ? facilitiesRes.data.amenities
          : Array.isArray(facilitiesRes?.data) ? facilitiesRes.data : [];

        const facility = facilitiesData.find((f) => f.id === bookingData.amenity_id);
        const slots = facility?.amenity_slots || [];
        const slot = slots.find((s) => s.id === bookingData.amenity_slot_id);
        const slotTime = slot
          ? `${String(slot.start_hr || 0).padStart(2, '0')}:${String(slot.start_min || 0).padStart(2, '0')} - ${String(slot.end_hr || 0).padStart(2, '0')}:${String(slot.end_min || 0).padStart(2, '0')}`
          : 'N/A';

        setBookingDetails({
          ...bookingData,
          fac_name: facility?.fac_name || 'N/A',
          fac_type: facility?.fac_type || 'N/A',
          description: facility?.description || bookingData.description,
          terms: facility?.terms || bookingData.terms,
          slot_time: slotTime,
        });
      } catch (err) {
        console.error('Error fetching amenity booking:', err);
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

  const getStatusBadge = (status?: string) => {
    const s = status?.toLowerCase() || '';
    if (s === 'paid' || s === 'confirmed' || s === 'approved' || s === 'completed') {
      return {
        label: status || 'Confirmed',
        className: 'bg-success/10 text-success border-success/20',
        icon: CheckCircle,
      };
    }
    if (s === 'cancelled' || s === 'rejected' || s === 'failed') {
      return {
        label: status || 'Cancelled',
        className: 'bg-destructive/10 text-destructive border-destructive/20',
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
          onClick={() => navigate('/amenities')}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          Back to Amenities
        </button>
      </div>
    );
  }

  const statusInfo = getStatusBadge(bookingDetails.status);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="p-6 pb-0">
        <Breadcrumb
          items={[
            { label: 'Booking Management', path: '/amenities' },
            { label: 'Amenities Bookings', path: '/amenities' },
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
                onClick={() => navigate('/amenities')}
                className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <div className="h-8 w-px bg-border" />
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-foreground" />
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
                  <p className="text-xs text-muted-foreground">
                    {bookingDetails.fac_name || 'Amenity Booking'}
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
        className="w-full px-6 py-6 grid grid-cols-12 gap-4 auto-rows-[minmax(120px,auto)]"
      >
        {/* Booking Status Card */}
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
          className="col-span-12 lg:col-span-3 row-span-1 bg-gradient-to-br from-success/10 to-transparent rounded-xl border p-4 shadow-sm"
        >
          <Calendar className="h-8 w-8 text-success mb-2" />
          <p className="text-lg font-bold">{formatDate(bookingDetails.booking_date)}</p>
          <p className="text-sm text-muted-foreground">Booking Date</p>
        </motion.div>

        {/* Slot Time Card */}
        <motion.div
          variants={item}
          className="col-span-12 lg:col-span-3 row-span-1 bg-gradient-to-br from-info/10 to-transparent rounded-xl border p-4 shadow-sm"
        >
          <Clock className="h-8 w-8 text-info mb-2" />
          <p className="text-lg font-bold">{bookingDetails.slot_time || 'N/A'}</p>
          <p className="text-sm text-muted-foreground">Time Slot</p>
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
              <p className="text-lg font-semibold text-primary">
                {bookingDetails.fac_name || 'Not specified'}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Facility Type</p>
                <p className="font-medium text-sm mt-1">
                  {bookingDetails.fac_type || 'N/A'}
                </p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Time Slot</p>
                <p className="font-medium text-sm flex items-center gap-1 mt-1">
                  <Clock className="h-3 w-3" />
                  {bookingDetails.slot_time || 'N/A'}
                </p>
              </div>
            </div>
            {bookingDetails.description && bookingDetails.description !== 'N/A' && (
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
              <span className="font-medium">{bookingDetails.book_by_user || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">Booking Date</span>
              <span className="font-medium">{formatDate(bookingDetails.booking_date)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">Created On</span>
              <span className="font-medium">{formatDate(bookingDetails.created_at)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">Booking ID</span>
              <span className="font-medium">#{bookingDetails.id}</span>
            </div>
            {bookingDetails.notes && (
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">Notes</p>
                <p className="text-sm">{bookingDetails.notes}</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Payment Details */}
        <motion.div
          variants={item}
          className="col-span-12 lg:col-span-6 row-span-2 bg-card rounded-2xl border p-6 shadow-sm"
        >
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" />
            Payment Details
          </h2>
          <div className="space-y-3">
            <div className={cn('rounded-lg p-4 border', statusInfo.className)}>
              <div className="flex items-center gap-2 mb-2">
                <StatusIcon className={cn('h-5 w-5', statusInfo.className.split(' ')[1])} />
                <p className="text-sm font-medium">Payment Status</p>
              </div>
              <p className="text-lg font-bold">{statusInfo.label}</p>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">Payment Method</span>
              <span className="font-medium flex items-center gap-1">
                <CreditCard className="h-3 w-3" />
                {bookingDetails.payment?.payment_method || bookingDetails.payment_method || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg">
              <span className="text-sm text-muted-foreground">Total Amount</span>
              <span className="font-bold text-lg text-primary">
                ₹{bookingDetails.amount?.toLocaleString() || '0'}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Terms & Conditions */}
        {bookingDetails.terms && bookingDetails.terms !== 'N/A' && (
          <motion.div
            variants={item}
            className="col-span-12 lg:col-span-6 row-span-2 bg-card rounded-2xl border p-6 shadow-sm"
          >
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Terms & Conditions
            </h2>
            <div className="bg-muted/50 rounded-lg p-4 max-h-[200px] overflow-y-auto">
              <p className="text-sm whitespace-pre-wrap">{bookingDetails.terms}</p>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default ViewAmenityBooking;