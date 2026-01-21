import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import {
  Plus,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  CalendarCheck,
} from "lucide-react";
import {
  serviceBookingService,
  serviceCategoryService,
  serviceSubcategoryService,
  unitConfigurationService,
} from "../OSR/additionalServices";
import OnDemandBookingForm from "./OnDemandBookingForm";
import OnDemandBookingDetails from "./OnDemandBookingDetails";

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

interface Filters {
  status: string;
  category: string;
  subcategory: string;
  dateFrom: string;
  dateTo: string;
}

const OnDemandBookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [unitConfigs, setUnitConfigs] = useState<UnitConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showBookingDetails, setShowBookingDetails] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [filters, setFilters] = useState<Filters>({
    status: "",
    category: "",
    subcategory: "",
    dateFrom: "",
    dateTo: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const applyFilters = useCallback(() => {
    let filtered = [...bookings];

    if (filters.status) {
      filtered = filtered.filter((booking) => booking.status === filters.status);
    }

    if (filters.category) {
      const categorySubcategories = subcategories
        .filter((sub) => sub.service_category_id === parseInt(filters.category))
        .map((sub) => sub.id);
      filtered = filtered.filter((booking) =>
        categorySubcategories.includes(booking.service_subcategory_id)
      );
    }

    if (filters.subcategory) {
      filtered = filtered.filter(
        (booking) =>
          booking.service_subcategory_id === parseInt(filters.subcategory)
      );
    }

    if (filters.dateFrom) {
      filtered = filtered.filter(
        (booking) =>
          new Date(booking.booking_date) >= new Date(filters.dateFrom)
      );
    }

    if (filters.dateTo) {
      filtered = filtered.filter(
        (booking) => new Date(booking.booking_date) <= new Date(filters.dateTo)
      );
    }

    setFilteredBookings(filtered);
  }, [bookings, filters, subcategories]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    applyFilters();
  }, [applyFilters]);

  const indexOfLastItem = currentPage * perPage;
  const indexOfFirstItem = indexOfLastItem - perPage;
  const currentBookings = filteredBookings.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredBookings.length / perPage);

  const loadData = async () => {
    try {
      setLoading(true);

      const [bookingsRes, subcategoriesRes, categoriesRes, unitConfigsRes] =
        await Promise.all([
          serviceBookingService.getAll(currentPage, perPage),
          serviceSubcategoryService.getAll(),
          serviceCategoryService.getAll(),
          unitConfigurationService.getAll(),
        ]);

      setBookings(bookingsRes?.data?.service_bookings || []);
      setTotalCount(bookingsRes?.data?.total_count || 0);
      setSubcategories(subcategoriesRes.data || []);
      setCategories(categoriesRes.data || []);

      if (Array.isArray(unitConfigsRes.data) && unitConfigsRes.data.length > 0) {
        setUnitConfigs(unitConfigsRes.data);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (bookingId: number, newStatus: string) => {
    try {
      if (newStatus === "cancelled") {
        await serviceBookingService.cancel(bookingId);
      } else if (newStatus === "completed") {
        await serviceBookingService.complete(bookingId);
      } else {
        await serviceBookingService.update(bookingId, { status: newStatus });
      }

      toast.success(`Booking ${newStatus} successfully`);
      loadData();
    } catch (error) {
      console.error("Error updating booking status:", error);
      toast.error("Failed to update booking status");
    }
  };

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      status: "",
      category: "",
      subcategory: "",
      dateFrom: "",
      dateTo: "",
    });
  };

  const viewBookingDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowBookingDetails(true);
  };

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

  const getUnitConfigName = (unitConfigId?: number, booking?: Booking) => {
    if (!unitConfigId && unitConfigId !== 0) {
      return "Not Specified";
    }

    if (booking) {
      if (booking.unit_configuration_name) {
        return booking.unit_configuration_name;
      }
      if (booking.unit_configuration?.name) {
        return booking.unit_configuration.name;
      }
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

  const getAvailableSubcategories = () => {
    if (!filters.category) return subcategories;
    return subcategories.filter(
      (sub) => sub.service_category_id === parseInt(filters.category)
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading bookings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">All Service Bookings</h2>
          <p className="text-sm text-muted-foreground">
            Manage and track all service booking requests
          </p>
        </div>
        <button
          onClick={() => setShowBookingForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Book Service
        </button>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-xl border p-4 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-medium">Filters</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div>
            <label className="block text-xs text-muted-foreground mb-1.5">
              Status
            </label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-muted-foreground mb-1.5">
              Category
            </label>
            <select
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-muted-foreground mb-1.5">
              Subcategory
            </label>
            <select
              name="subcategory"
              value={filters.subcategory}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">All Subcategories</option>
              {getAvailableSubcategories().map((subcategory) => (
                <option key={subcategory.id} value={subcategory.id}>
                  {subcategory.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-muted-foreground mb-1.5">
              Date From
            </label>
            <input
              type="date"
              name="dateFrom"
              value={filters.dateFrom}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="block text-xs text-muted-foreground mb-1.5">
              Date To
            </label>
            <input
              type="date"
              name="dateTo"
              value={filters.dateTo}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors text-sm w-full justify-center"
            >
              <RotateCcw className="h-4 w-4" />
              Clear
            </button>
          </div>
        </div>
      </motion.div>

      {/* Results Summary */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredBookings.length > 0 ? indexOfFirstItem + 1 : 0} -{" "}
        {Math.min(indexOfLastItem, filteredBookings.length)} of{" "}
        {filteredBookings.length} bookings
      </div>

      {/* Bookings Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-card rounded-xl border shadow-sm overflow-hidden"
      >
        {currentBookings.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                      ID
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                      User
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                      Category
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                      Service
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                      Date & Time
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                      Unit Type
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                      Price
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentBookings.map((booking) => (
                    <tr
                      key={booking.id}
                      className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm font-medium">
                        #{booking.id}
                      </td>
                      <td className="px-4 py-3 text-sm">{booking.user_id}</td>
                      <td className="px-4 py-3 text-sm">
                        {getCategoryName(booking.service_subcategory_id)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {getSubcategoryName(booking.service_subcategory_id)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div>
                          {new Date(booking.booking_date).toLocaleDateString()}
                        </div>
                        {booking.service_slot && (
                          <div className="text-xs text-muted-foreground">
                            {booking.service_slot.start_time} -{" "}
                            {booking.service_slot.end_time}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {getUnitConfigName(
                          booking.unit_configuration_id,
                          booking
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium">
                        ₹{booking.total_amount || booking.price || 0}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "px-2 py-1 rounded-full text-xs font-medium",
                            getStatusBadgeClass(booking.status)
                          )}
                        >
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => viewBookingDetails(booking)}
                            className="p-1.5 hover:bg-muted rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          </button>

                          {booking.status === "pending" && (
                            <>
                              <button
                                onClick={() =>
                                  handleStatusUpdate(booking.id, "confirmed")
                                }
                                className="p-1.5 hover:bg-green-100 rounded-lg transition-colors"
                                title="Confirm"
                              >
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              </button>
                              <button
                                onClick={() =>
                                  handleStatusUpdate(booking.id, "cancelled")
                                }
                                className="p-1.5 hover:bg-red-100 rounded-lg transition-colors"
                                title="Cancel"
                              >
                                <XCircle className="h-4 w-4 text-red-600" />
                              </button>
                            </>
                          )}

                          {booking.status === "confirmed" && (
                            <button
                              onClick={() =>
                                handleStatusUpdate(booking.id, "completed")
                              }
                              className="p-1.5 hover:bg-blue-100 rounded-lg transition-colors"
                              title="Complete"
                            >
                              <CheckCircle className="h-4 w-4 text-blue-600" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-border">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Rows per page:
                </span>
                <select
                  value={perPage}
                  onChange={(e) => {
                    setPerPage(parseInt(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-2 py-1 border border-border rounded text-sm bg-background"
                >
                  {[10, 25, 50, 100].map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages || 1}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 hover:bg-muted rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() =>
                      setCurrentPage((prev) =>
                        prev < totalPages ? prev + 1 : prev
                      )
                    }
                    disabled={currentPage >= totalPages}
                    className="p-1.5 hover:bg-muted rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <CalendarCheck className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              No bookings found matching the current filters
            </p>
            <button
              onClick={clearFilters}
              className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors text-sm"
            >
              Clear Filters
            </button>
          </div>
        )}
      </motion.div>

      {/* Booking Form Modal */}
      {showBookingForm && (
        <OnDemandBookingForm
          onClose={() => setShowBookingForm(false)}
          onSuccess={() => {
            setShowBookingForm(false);
            loadData();
          }}
        />
      )}

      {/* Booking Details Modal */}
      {showBookingDetails && selectedBooking && (
        <OnDemandBookingDetails
          booking={selectedBooking}
          categories={categories}
          subcategories={subcategories}
          unitConfigs={unitConfigs}
          onClose={() => {
            setShowBookingDetails(false);
            setSelectedBooking(null);
          }}
        />
      )}
    </div>
  );
};

export default OnDemandBookings;
