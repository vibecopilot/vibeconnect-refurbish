import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import {
  X,
  ChevronRight,
  ChevronLeft,
  Calendar,
  Clock,
  IndianRupee,
  CheckCircle,
  Loader2,
  FileText,
  Layers,
} from "lucide-react";
import {
  serviceCategoryService,
  serviceSubcategoryService,
  serviceSlotService,
  servicePricingQueryService,
  serviceBookingService,
} from "../OSR/additionalServices";

const cn = (...classes: (string | boolean | undefined)[]) => {
  return classes.filter(Boolean).join(" ");
};

interface Category {
  id: number;
  name: string;
}

interface Subcategory {
  id: number;
  name: string;
}

interface Slot {
  id: number;
  display_time: string;
  available_spots: number;
  max_bookings: number;
  start_time?: string;
  end_time?: string;
}

interface Pricing {
  id: number;
  unit_configuration_name?: string;
  original_price?: number;
  price?: number;
  discount_percentage?: number;
  discount_amount?: number;
  tax_percentage?: number;
  tax_amount?: number;
  final_price?: number;
  total_price?: number;
}

interface OnDemandBookingFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

const OnDemandBookingForm: React.FC<OnDemandBookingFormProps> = ({
  onClose,
  onSuccess,
}) => {
  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [availableSlots, setAvailableSlots] = useState<Slot[]>([]);
  const [pricings, setPricings] = useState<Pricing[]>([]);
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [pricingLoading, setPricingLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  // Form data
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [specialInstructions, setSpecialInstructions] = useState("");

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await serviceCategoryService.getAll();
      const categoriesData = Array.isArray(response.data) ? response.data : [];
      setCategories(categoriesData);
    } catch (error) {
      console.error("Error loading categories:", error);
      toast.error("Failed to load service categories");
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const loadSubcategories = async (categoryId: string) => {
    try {
      const response = await serviceSubcategoryService.getByCategoryId(categoryId);
      const subcategoriesData = Array.isArray(response.data) ? response.data : [];
      setSubcategories(subcategoriesData);
    } catch (error) {
      console.error("Error loading subcategories:", error);
      toast.error("Failed to load subcategories");
      setSubcategories([]);
    }
  };

  const loadAvailableSlots = async (subcategoryId: string, date: string) => {
    try {
      setSlotsLoading(true);
      const response = await serviceSlotService.getAvailableSlots(subcategoryId, date);
      const slotsData = response.data?.available_slots || [];
      setAvailableSlots(slotsData);
    } catch (error) {
      console.error("Error loading available slots:", error);
      toast.error("Failed to load available slots");
      setAvailableSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  };

  const loadPricing = async (subcategoryId: string) => {
    try {
      setPricingLoading(true);
      const response = await servicePricingQueryService.getBySubcategory(subcategoryId);
      const pricingData = Array.isArray(response.data) ? response.data : [];
      setPricings(pricingData);
    } catch (error) {
      console.error("Error loading pricing:", error);
      toast.error("Failed to load pricing information");
      setPricings([]);
    } finally {
      setPricingLoading(false);
    }
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedSubcategory("");
    setSelectedDate("");
    setSelectedSlot(null);
    setSubcategories([]);
    setAvailableSlots([]);
    setPricings([]);

    if (categoryId) {
      loadSubcategories(categoryId);
    }
  };

  const handleSubcategoryChange = (subcategoryId: string) => {
    setSelectedSubcategory(subcategoryId);
    setSelectedDate("");
    setSelectedSlot(null);
    setAvailableSlots([]);

    if (subcategoryId) {
      loadPricing(subcategoryId);
    }
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    setSelectedSlot(null);
    setAvailableSlots([]);

    if (date && selectedSubcategory) {
      loadAvailableSlots(selectedSubcategory, date);
    }
  };

  const handleSlotSelect = (slot: Slot) => {
    setSelectedSlot(slot);
  };

  const handleBookService = async () => {
    if (!selectedSubcategory || !selectedDate || !selectedSlot) {
      toast.error("Please complete all required fields");
      return;
    }

    try {
      setBookingLoading(true);

      const bookingData = {
        booking_date: selectedDate,
        service_subcategory_id: parseInt(selectedSubcategory),
        service_slot_id: selectedSlot.id,
        special_instructions: specialInstructions || "",
      };

      await serviceBookingService.create(bookingData);
      toast.success("Service booked successfully!");
      onSuccess();
    } catch (error) {
      console.error("Error booking service:", error);
      toast.error("Failed to book service. Please try again.");
    } finally {
      setBookingLoading(false);
    }
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const canProceedToStep2 = selectedCategory && selectedSubcategory;
  const canProceedToStep3 = canProceedToStep2 && selectedDate && selectedSlot;

  const getCategoryName = () => {
    const cat = categories.find((c) => c.id === parseInt(selectedCategory));
    return cat?.name || "";
  };

  const getSubcategoryName = () => {
    const sub = subcategories.find((s) => s.id === parseInt(selectedSubcategory));
    return sub?.name || "";
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
          <div>
            <h2 className="text-xl font-semibold">Book a Service</h2>
            <p className="text-sm text-muted-foreground">
              Select your preferred service and time slot
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="px-6 py-4 border-b border-border">
          <div className="flex items-center justify-between">
            {[
              { num: 1, label: "Select Service" },
              { num: 2, label: "Schedule" },
              { num: 3, label: "Confirm" },
            ].map((s, idx) => (
              <React.Fragment key={s.num}>
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                      step >= s.num
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {step > s.num ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      s.num
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-sm hidden sm:block",
                      step >= s.num ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {s.label}
                  </span>
                </div>
                {idx < 2 && (
                  <div
                    className={cn(
                      "flex-1 h-0.5 mx-4",
                      step > s.num ? "bg-primary" : "bg-border"
                    )}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[50vh]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Loading...</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {/* Step 1: Select Service */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        <Layers className="inline h-4 w-4 mr-1" />
                        Service Category *
                      </label>
                      <select
                        value={selectedCategory}
                        onChange={(e) => handleCategoryChange(e.target.value)}
                        className="w-full px-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        <option value="">Select a category</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        <FileText className="inline h-4 w-4 mr-1" />
                        Service Subcategory *
                      </label>
                      <select
                        value={selectedSubcategory}
                        onChange={(e) => handleSubcategoryChange(e.target.value)}
                        disabled={!selectedCategory}
                        className="w-full px-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="">Select a subcategory</option>
                        {subcategories.map((subcategory) => (
                          <option key={subcategory.id} value={subcategory.id}>
                            {subcategory.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Pricing Information */}
                  {selectedSubcategory && (
                    <div>
                      <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                        <IndianRupee className="h-4 w-4" />
                        Pricing Information
                      </h3>

                      {pricingLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                      ) : pricings.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {pricings.map((pricing) => (
                            <div
                              key={pricing.id}
                              className="border border-border rounded-xl p-4 bg-muted/30"
                            >
                              <h4 className="font-semibold text-sm mb-2">
                                {pricing.unit_configuration_name || "Standard"}
                              </h4>
                              <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">
                                    Original:
                                  </span>
                                  <span>
                                    ₹{pricing.original_price || pricing.price || 0}
                                  </span>
                                </div>
                                {(pricing.discount_percentage || 0) > 0 && (
                                  <div className="flex justify-between text-green-600">
                                    <span>
                                      Discount ({pricing.discount_percentage}%):
                                    </span>
                                    <span>-₹{pricing.discount_amount || 0}</span>
                                  </div>
                                )}
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">
                                    Tax ({pricing.tax_percentage || 0}%):
                                  </span>
                                  <span>₹{pricing.tax_amount || 0}</span>
                                </div>
                                <hr className="my-2 border-border" />
                                <div className="flex justify-between font-bold">
                                  <span>Final:</span>
                                  <span className="text-primary">
                                    ₹
                                    {pricing.final_price ||
                                      pricing.total_price ||
                                      pricing.price ||
                                      0}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-sm py-4">
                          No pricing information available
                        </p>
                      )}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Step 2: Schedule */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <Calendar className="inline h-4 w-4 mr-1" />
                      Select Date *
                    </label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => handleDateChange(e.target.value)}
                      min={getMinDate()}
                      className="w-full md:w-1/2 px-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  {/* Available Slots */}
                  {selectedDate && (
                    <div>
                      <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Available Time Slots
                      </h3>

                      {slotsLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                      ) : availableSlots.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                          {availableSlots.map((slot) => (
                            <button
                              key={slot.id}
                              onClick={() => handleSlotSelect(slot)}
                              className={cn(
                                "border-2 rounded-xl p-4 text-center transition-all",
                                selectedSlot?.id === slot.id
                                  ? "border-primary bg-primary/10"
                                  : "border-border hover:border-primary/50 hover:bg-muted/50"
                              )}
                            >
                              <div className="font-semibold text-sm">
                                {slot.display_time}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {slot.available_spots} / {slot.max_bookings} spots
                              </div>
                              {selectedSlot?.id === slot.id && (
                                <div className="text-primary text-xs mt-2 flex items-center justify-center gap-1">
                                  <CheckCircle className="h-3 w-3" />
                                  Selected
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-sm py-4">
                          No slots available for the selected date
                        </p>
                      )}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Step 3: Confirm */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {/* Booking Summary */}
                  <div className="bg-muted/30 rounded-xl p-4 space-y-3">
                    <h3 className="font-semibold mb-2">Booking Summary</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-muted-foreground">Category:</div>
                      <div className="font-medium">{getCategoryName()}</div>
                      <div className="text-muted-foreground">Service:</div>
                      <div className="font-medium">{getSubcategoryName()}</div>
                      <div className="text-muted-foreground">Date:</div>
                      <div className="font-medium">
                        {new Date(selectedDate).toLocaleDateString()}
                      </div>
                      <div className="text-muted-foreground">Time:</div>
                      <div className="font-medium">
                        {selectedSlot?.display_time}
                      </div>
                    </div>
                  </div>

                  {/* Special Instructions */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Special Instructions (Optional)
                    </label>
                    <textarea
                      value={specialInstructions}
                      onChange={(e) => setSpecialInstructions(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                      placeholder="Any special requirements or instructions for the service provider..."
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-border">
          <button
            onClick={() => (step > 1 ? setStep(step - 1) : onClose())}
            className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            {step > 1 ? "Back" : "Cancel"}
          </button>

          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={step === 1 ? !canProceedToStep2 : !canProceedToStep3}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleBookService}
              disabled={bookingLoading}
              className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {bookingLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Booking...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Book Service
                </>
              )}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default OnDemandBookingForm;