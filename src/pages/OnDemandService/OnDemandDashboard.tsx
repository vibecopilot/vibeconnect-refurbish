import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutGrid,
  CalendarCheck,
  Clock,
  IndianRupee,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  ArrowRight,
  Layers,
} from "lucide-react";
import {
  serviceBookingService,
  serviceCategoryService,
} from "../OSR/additionalServices";

const cn = (...classes: (string | boolean | undefined)[]) => {
  return classes.filter(Boolean).join(" ");
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1 },
};

interface Stats {
  totalCategories: number;
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  monthlyRevenue: number;
}

interface Category {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  status?: string;
  is_active?: boolean;
  created_at?: string;
}

interface Booking {
  id: number;
  status: string;
  booking_date: string;
  created_at: string;
  total_amount?: number;
  total_price?: number;
  service_subcategory?: { name: string };
  service_name?: string;
  user?: { name: string };
  customer_name?: string;
  user_name?: string;
}

const OnDemandDashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats>({
    totalCategories: 0,
    totalBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [availableCategories, setAvailableCategories] = useState<Category[]>([]);

  const currentUserId = 1;

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      const [categoriesRes, userBookingsRes] = await Promise.all([
        serviceCategoryService.getAll(),
        serviceBookingService.getUserBookings(currentUserId),
      ]);

      const categories = categoriesRes.data || [];
      const userBookings = userBookingsRes.data || [];

      let allSystemBookings = userBookings;
      try {
        const allBookingsRes = await serviceBookingService.getAll();
        allSystemBookings = allBookingsRes.data?.service_bookings || allBookingsRes.data || [];
      } catch (error) {
        console.log("Admin data not available, using user data only");
      }

      const pendingCount = allSystemBookings.filter(
        (b: Booking) => b.status === "pending"
      ).length;
      const confirmedCount = allSystemBookings.filter(
        (b: Booking) => b.status === "confirmed"
      ).length;
      const completedCount = allSystemBookings.filter(
        (b: Booking) => b.status === "completed"
      ).length;
      const cancelledCount = allSystemBookings.filter(
        (b: Booking) => b.status === "cancelled"
      ).length;

      const totalRevenue = allSystemBookings
        .filter((b: Booking) => b.status === "completed")
        .reduce(
          (sum: number, booking: Booking) =>
            sum + (parseFloat(String(booking.total_price || 0)) || 0),
          0
        );

      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthlyRevenue = allSystemBookings
        .filter((b: Booking) => {
          const bookingDate = new Date(b.created_at);
          return (
            bookingDate.getMonth() === currentMonth &&
            bookingDate.getFullYear() === currentYear &&
            b.status === "completed"
          );
        })
        .reduce(
          (sum: number, booking: Booking) =>
            sum + (parseFloat(String(booking.total_price || 0)) || 0),
          0
        );

      setStats({
        totalCategories: categories.length,
        totalBookings: allSystemBookings.length,
        pendingBookings: pendingCount,
        confirmedBookings: confirmedCount,
        completedBookings: completedCount,
        cancelledBookings: cancelledCount,
        totalRevenue: totalRevenue,
        monthlyRevenue: monthlyRevenue,
      });

      setAvailableCategories(categories);

      const recent = allSystemBookings
        .sort(
          (a: Booking, b: Booking) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        .slice(0, 5);
      setRecentBookings(recent);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          variants={item}
          className="bg-gradient-to-br from-primary/10 to-transparent rounded-xl border p-5 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Service Categories</p>
              <p className="text-3xl font-bold mt-1">{stats.totalCategories}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
              <LayoutGrid className="h-6 w-6 text-primary" />
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={item}
          className="bg-gradient-to-br from-green-500/10 to-transparent rounded-xl border p-5 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Bookings</p>
              <p className="text-3xl font-bold mt-1">{stats.totalBookings}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center">
              <CalendarCheck className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={item}
          className="bg-gradient-to-br from-orange-500/10 to-transparent rounded-xl border p-5 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pending Requests</p>
              <p className="text-3xl font-bold mt-1">{stats.pendingBookings}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-orange-500/20 flex items-center justify-center">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={item}
          className="bg-gradient-to-br from-purple-500/10 to-transparent rounded-xl border p-5 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Monthly Revenue</p>
              <p className="text-3xl font-bold mt-1">
                ₹{stats.monthlyRevenue.toLocaleString()}
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-purple-500/20 flex items-center justify-center">
              <IndianRupee className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Secondary Stats */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.confirmedBookings}</p>
              <p className="text-xs text-muted-foreground">Confirmed</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl border p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.completedBookings}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl border p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.cancelledBookings}</p>
              <p className="text-xs text-muted-foreground">Cancelled</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl border p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center">
              <IndianRupee className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                ₹{stats.totalRevenue.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">Total Revenue</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Service Categories */}
      <motion.div
        variants={item}
        className="bg-card rounded-2xl border p-6 shadow-sm"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            Available Service Categories
          </h2>
        </div>

        {availableCategories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableCategories.map((category) => (
              <div
                key={category.id}
                className="border border-border rounded-xl p-4 hover:shadow-md transition-all hover:border-primary/30 cursor-pointer"
              >
                <div className="flex items-center gap-3 mb-3">
                  {category.icon && (
                    <span className="text-2xl">{category.icon}</span>
                  )}
                  <h3 className="font-semibold text-foreground">
                    {category.name}
                  </h3>
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded-full text-xs font-medium ml-auto",
                      category.status === "ACTIVE" || category.is_active
                        ? "bg-green-100 text-green-700 border border-green-200"
                        : "bg-red-100 text-red-700 border border-red-200"
                    )}
                  >
                    {category.status ||
                      (category.is_active ? "Active" : "Inactive")}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {category.description || "No description provided"}
                </p>
                <div className="text-xs text-muted-foreground">
                  Created:{" "}
                  {category.created_at
                    ? new Date(category.created_at).toLocaleDateString()
                    : "N/A"}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <LayoutGrid className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              No service categories available
            </p>
          </div>
        )}
      </motion.div>

      {/* Recent Bookings */}
      <motion.div
        variants={item}
        className="bg-card rounded-2xl border p-6 shadow-sm"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold flex items-center gap-2">
            <CalendarCheck className="h-5 w-5 text-primary" />
            Recent Bookings
          </h2>
        </div>

        {recentBookings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    ID
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    Service
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((booking) => (
                  <tr
                    key={booking.id}
                    className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm font-medium">
                      #{booking.id}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {booking.service_subcategory?.name ||
                        booking.service_name ||
                        "N/A"}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {booking.user?.name ||
                        booking.customer_name ||
                        booking.user_name ||
                        "N/A"}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {booking.booking_date
                        ? new Date(booking.booking_date).toLocaleDateString()
                        : booking.created_at
                        ? new Date(booking.created_at).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "px-2 py-1 rounded-full text-xs font-medium",
                          getStatusBadgeClass(booking.status)
                        )}
                      >
                        {(booking.status || "unknown").toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">
                      ₹
                      {booking.total_amount
                        ? parseFloat(String(booking.total_amount)).toLocaleString()
                        : "0"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <CalendarCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No recent bookings found</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default OnDemandDashboard;
