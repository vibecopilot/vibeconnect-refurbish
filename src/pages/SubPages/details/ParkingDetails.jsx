import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Car,
  Loader2,
  AlertCircle,
  Calendar,
  Building2,
  MapPin,
  User,
  Clock,
  FileText,
} from "lucide-react";
import { fetchParkingDetail } from "../../../api/index";
import Breadcrumb from "../../../components/ui/Breadcrumb";

// cn utility function
const cn = (...classes) => {
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

const ParkingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [parkingData, setParkingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchParkingDetails = async () => {
      if (!id) return;

      setLoading(true);
      setError(null);

      try {
        const res = await fetchParkingDetail(id);
        const item = res.data;
        const bookingReqData = {
          id: item.id,
          floor_id: item.floor_id,
          booked_by: item.created_by,
          parking_name: item.name,
          site_id: item.site_id,
          site_name: item.site_name,
          created_at: item.created_at,
          booking_date: item.booking_date,
          building_name: item.building_name,
          floor_name: item.floor_name,
          vehicle_type: item.vehicle_type,
        };
        setParkingData(bookingReqData);
      } catch (err) {
        console.log("Error fetching booking request data:", err);
        setError(err.message || 'Failed to load parking details');
        setParkingData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchParkingDetails();
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      const dd = String(date.getDate()).padStart(2, '0');
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const yy = date.getFullYear();
      return `${dd}/${mm}/${yy}`;
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading parking details...</p>
      </div>
    );
  }

  if (error || !parkingData) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh]">
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <h3 className="text-lg font-semibold mb-2">Failed to Load Parking Details</h3>
        <p className="text-muted-foreground mb-4">{error || 'No parking details available'}</p>
        <button
          onClick={() => navigate('/parking')}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          Back to Parking
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="p-6 pb-0">
        <Breadcrumb
          items={[
            { label: 'FM Module', path: '/parking' },
            { label: 'Parking', path: '/parking' },
            { label: `Parking #${parkingData.id}` },
          ]}
        />
      </div>

      {/* Header */}
      <header className="sticky top-0 bg-background/95 backdrop-blur-sm border-b z-20">
        <div className="w-full px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/parking')}
                className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <div className="h-8 w-px bg-border" />
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                  <Car className="h-5 w-5 text-foreground" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold text-foreground">
                      {parkingData.parking_name || `Parking #${parkingData.id}`}
                    </h1>
                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-success/10 text-success border border-success/20">
                      Active
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">Parking Details</p>
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
        {/* Parking Name Card */}
        <motion.div
          variants={item}
          className="col-span-12 lg:col-span-4 row-span-1 bg-gradient-to-br from-primary/10 to-transparent rounded-xl border p-4 shadow-sm"
        >
          <Car className="h-8 w-8 text-primary mb-2" />
          <p className="text-lg font-bold">{parkingData.parking_name || 'N/A'}</p>
          <p className="text-sm text-muted-foreground">Parking Name</p>
        </motion.div>

        {/* Vehicle Type Card */}
        <motion.div
          variants={item}
          className="col-span-12 lg:col-span-4 row-span-1 bg-gradient-to-br from-success/10 to-transparent rounded-xl border p-4 shadow-sm"
        >
          <Car className="h-8 w-8 text-success mb-2" />
          <p className="text-lg font-bold">{parkingData.vehicle_type || 'N/A'}</p>
          <p className="text-sm text-muted-foreground">Vehicle Type</p>
        </motion.div>

        {/* Booking Date Card */}
        <motion.div
          variants={item}
          className="col-span-12 lg:col-span-4 row-span-1 bg-gradient-to-br from-info/10 to-transparent rounded-xl border p-4 shadow-sm"
        >
          <Calendar className="h-8 w-8 text-info mb-2" />
          <p className="text-lg font-bold">{formatDate(parkingData.booking_date)}</p>
          <p className="text-sm text-muted-foreground">Booking Date</p>
        </motion.div>

        {/* Location Details */}
        <motion.div
          variants={item}
          className="col-span-12 lg:col-span-6 row-span-2 bg-card rounded-2xl border p-6 shadow-sm"
        >
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Location Details
          </h2>
          <div className="space-y-3">
            <div className="bg-primary/10 rounded-lg p-4">
              <p className="text-xs text-muted-foreground mb-1">Site Name</p>
              <p className="text-lg font-semibold text-primary">
                {parkingData.site_name || 'N/A'}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Site ID</p>
                <p className="font-medium text-sm mt-1">{parkingData.site_id || 'N/A'}</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Building</p>
                <p className="font-medium text-sm flex items-center gap-1 mt-1">
                  <Building2 className="h-3 w-3" />
                  {parkingData.building_name || 'N/A'}
                </p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 col-span-2">
                <p className="text-xs text-muted-foreground">Floor</p>
                <p className="font-medium text-sm">{parkingData.floor_name || 'N/A'}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Booking Information */}
        <motion.div
          variants={item}
          className="col-span-12 lg:col-span-6 row-span-2 bg-card rounded-2xl border p-6 shadow-sm"
        >
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Booking Information
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">Parking ID</span>
              <span className="font-medium">#{parkingData.id}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">Booked By</span>
              <span className="font-medium">{parkingData.booked_by || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">Booking Date</span>
              <span className="font-medium">{formatDate(parkingData.booking_date)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">Created On</span>
              <span className="font-medium">{formatDate(parkingData.created_at)}</span>
            </div>
            <div className="bg-primary/10 rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1">Floor ID</p>
              <p className="font-medium text-sm text-primary">{parkingData.floor_id || 'N/A'}</p>
            </div>
          </div>
        </motion.div>

        {/* Summary Card */}
        <motion.div
          variants={item}
          className="col-span-12 row-span-1 bg-card rounded-2xl border p-6 shadow-sm"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Parking Summary</p>
              <p className="text-lg font-semibold mt-1">
                {parkingData.parking_name || `Parking #${parkingData.id}`} - {parkingData.vehicle_type || 'Vehicle'}
              </p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="text-sm font-medium mt-1">
                  {parkingData.building_name || 'N/A'}, {parkingData.floor_name || 'N/A'}
                </p>
              </div>
              <div className="h-12 w-px bg-border" />
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Site</p>
                <p className="text-sm font-medium mt-1">{parkingData.site_name || 'N/A'}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ParkingDetails;