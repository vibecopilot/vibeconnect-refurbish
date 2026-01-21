import React from "react";
import { motion } from "framer-motion";
import {
  X,
  Calendar,
  Clock,
  User,
  FileText,
  IndianRupee,
  Tag,
  Layers,
  MessageSquare,
  Star,
} from "lucide-react";

const cn = (...classes: (string | boolean | undefined)[]) => {
  return classes.filter(Boolean).join(" ");
};

interface Booking {
  id: number;
  user_id: number;
  status: string;
  booking_date: string;
  created_at: string;
  total_amount?: number;
  total_price?: number;
  price?: number;
  service_subcategory_id: number;
  unit_configuration_id?: number;
  unit_configuration_name?: string;
  unit_configuration?: { name: string };
  service_slot?: { start_time: string; end_time: string };
  special_instructions?: string;
  rating?: number;
  review?: string;
}

interface Category {
  id: number;
  name: string;
}

interface Subcategory {
  id: number;
  name: string;
  service_category_id: number;
}

interface UnitConfig {
  id: number;
  name: string;
}

interface OnDemandBookingDetailsProps {
  booking: Booking;
  categories: Category[];
  subcategories: Subcategory[];
  unitConfigs: UnitConfig[];
  onClose: () => void;
}

const OnDemandBookingDetails: React.FC<OnDemandBookingDetailsProps> = ({
  booking,
  categories,
  subcategories,
  unitConfigs,
  onClose,
}) => {
  const getSubcategoryName = (subcategoryId: number) => {
    const subcategory = subcategories.find((s) => s.id === subcategoryId);
    return subcategory ? subcategory.name : "Unknown";
  };

  const getCategoryName = (subcategoryId: number) => {
    const subcategory = subcategories.find((s) => s.id === subcategoryId);
    if (!subcategory) return "Unknown";
    const category = categories.find(
      (c) => c.id === subcategory.service_category_id
    );
    return category ? category.name : "Unknown";
  };

  const getUnitConfigName = (unitConfigId?: number) => {
    if (!unitConfigId && unitConfigId !== 0) {
      return "Not Specified";
    }

    if (booking.unit_configuration_name) {
      return booking.unit_configuration_name;
    }
    if (booking.unit_configuration?.name) {
      return booking.unit_configuration.name;
    }

    const unitConfig = unitConfigs.find((u) => u.id == unitConfigId);
    return unitConfig ? unitConfig.name : `Config ${unitConfigId}`;
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-orange-100 text-orange-700 border border-orange-200";
      case "confirmed":
        return "bg-blue-100 text-blue-700 border border-blue-200";
      case "completed":
        return "bg-green-100 text-green-700 border border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-700 border border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border border-gray-200";
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              "h-4 w-4",
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            )}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-card rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Booking #{booking.id}</h2>
              <span
                className={cn(
                  "px-2 py-0.5 rounded-full text-xs font-medium",
                  getStatusBadgeClass(booking.status)
                )}
              >
                {booking.status.toUpperCase()}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[65vh] space-y-6">
          {/* Booking Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                Booking Information
              </h3>

              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="h-8 w-8 rounded-lg bg-background flex items-center justify-center">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Booking ID</p>
                    <p className="font-medium">#{booking.id}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="h-8 w-8 rounded-lg bg-background flex items-center justify-center">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">User ID</p>
                    <p className="font-medium">{booking.user_id}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="h-8 w-8 rounded-lg bg-background flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Booking Date</p>
                    <p className="font-medium">
                      {new Date(booking.booking_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="h-8 w-8 rounded-lg bg-background flex items-center justify-center">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Created At</p>
                    <p className="font-medium">
                      {new Date(booking.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                Service Information
              </h3>

              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="h-8 w-8 rounded-lg bg-background flex items-center justify-center">
                    <Layers className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Category</p>
                    <p className="font-medium">
                      {getCategoryName(booking.service_subcategory_id)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="h-8 w-8 rounded-lg bg-background flex items-center justify-center">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Service</p>
                    <p className="font-medium">
                      {getSubcategoryName(booking.service_subcategory_id)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="h-8 w-8 rounded-lg bg-background flex items-center justify-center">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Unit Type</p>
                    <p className="font-medium">
                      {getUnitConfigName(booking.unit_configuration_id)}
                    </p>
                  </div>
                </div>

                {booking.service_slot && (
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="h-8 w-8 rounded-lg bg-background flex items-center justify-center">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Time Slot</p>
                      <p className="font-medium">
                        {booking.service_slot.start_time} -{" "}
                        {booking.service_slot.end_time}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-primary/5 rounded-xl p-4 border border-primary/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <IndianRupee className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <p className="text-2xl font-bold text-primary">
                    ₹
                    {booking.total_amount ||
                      booking.total_price ||
                      booking.price ||
                      0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Special Instructions */}
          {booking.special_instructions && (
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Special Instructions
              </h3>
              <div className="p-4 bg-muted/50 rounded-xl">
                <p className="text-sm">{booking.special_instructions}</p>
              </div>
            </div>
          )}

          {/* Rating & Review */}
          {booking.rating && (
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Star className="h-4 w-4" />
                Rating & Review
              </h3>
              <div className="p-4 bg-muted/50 rounded-xl space-y-2">
                <div className="flex items-center gap-2">
                  {renderStars(booking.rating)}
                  <span className="text-sm font-medium">
                    {booking.rating}/5
                  </span>
                </div>
                {booking.review && (
                  <p className="text-sm italic text-muted-foreground">
                    "{booking.review}"
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-6 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default OnDemandBookingDetails;
