import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import Navbar from "../../../components/Navbar";
import {
  getAmenitiesBookingById,
  getSetupUsers,
  getFacitilitySetupId,
  getPaymentBookings,
  postPaymentBookings,
  updateAmenityBook,
} from "../../../api";

const BookingDetails = () => {
  const themeColor = useSelector((state) => state.theme.color);
  const { id } = useParams();
  const navigate = useNavigate();

  const [userName, setUserName] = useState("");
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);

  const [bookingDetails, setBookingDetails] = useState(null);
  const [facilityDetails, setFacilityDetails] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    resource_id: id,
    resource_type: "AmenityBooking",
    paid_amount: "",
    user_id: "",
    payment_method: "",
    transaction_id: "",
    payment_date: new Date().toISOString().split("T")[0],
    notes: "",
  });

  // ✅ IMPORTANT: handle both axios response and direct data
  const unwrap = (res) => res?.data ?? res;

  const safeArray = (maybeArray) => (Array.isArray(maybeArray) ? maybeArray : []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      // 1) Booking
      const bookingRaw = unwrap(await getAmenitiesBookingById(id));
      const bookingObj = bookingRaw?.amenity_booking || bookingRaw;

      if (!bookingObj || typeof bookingObj !== "object" || !bookingObj.id) {
        setError("No booking data found.");
        setBookingDetails(null);
        setFacilityDetails(null);
        return;
      }

      setBookingDetails(bookingObj);

      setFormData((prev) => ({
        ...prev,
        resource_id: bookingObj.id,
        user_id: bookingObj.user_id ?? "",
      }));

      // 2) Facility (fallback to bookingObj.amenity if facility API fails)
      const amenityId = bookingObj.amenity_id;
      let facilityObj = bookingObj.amenity || null;

      if (amenityId) {
        try {
          const facilityRaw = unwrap(await getFacitilitySetupId(amenityId));
          const fd = facilityRaw?.amenity || facilityRaw;
          if (fd && typeof fd === "object") facilityObj = fd;
        } catch (e) {
          // keep fallback
        }
      }

      // ✅ DO NOT block UI if facility missing; show booking at least
      setFacilityDetails(facilityObj);

      // 3) Payments (optional)
      try {
        const paymentRaw = unwrap(await getPaymentBookings());
        const payments =
          safeArray(paymentRaw) ||
          safeArray(paymentRaw?.payments) ||
          safeArray(paymentRaw?.data) ||
          safeArray(paymentRaw?.data?.data);

        const match = payments.find(
          (p) =>
            Number(p?.resource_id) === Number(bookingObj.id) &&
            String(p?.resource_type || "") === "AmenityBooking"
        );

        if (match) {
          setFormData((prev) => ({
            ...prev,
            paid_amount: match.paid_amount ?? "",
            payment_method: match.payment_method ?? "",
            transaction_id: match.transaction_id ?? "",
            payment_date: match.payment_date ?? prev.payment_date,
            notes: match.notes ?? "",
          }));

          setBookingDetails((prev) => ({ ...prev, payment: match }));
        }
      } catch (e) {
        // ignore
      }

      // 4) Users
      try {
        const usersRaw = unwrap(await getSetupUsers());
        const users = safeArray(usersRaw) || safeArray(usersRaw?.users);

        const u = users.find((x) => Number(x?.id) === Number(bookingObj.user_id));
        setUserName(
          u ? `${u.firstname || ""} ${u.lastname || ""}`.trim() : bookingObj.book_by_user || "User"
        );
      } catch (e) {
        setUserName(bookingObj.book_by_user || "User");
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch data. Please try again.");
      setBookingDetails(null);
      setFacilityDetails(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const postPaymentBooking = async () => {
    if (!bookingDetails) return;

    if (!formData.payment_method || !formData.transaction_id || !formData.paid_amount) {
      toast.error("Payment Type, amount, and Transaction Id are mandatory!");
      return;
    }

    if (Number(formData.paid_amount) !== Number(bookingDetails.amount)) {
      toast.error("Paid amount must equal the payable amount!");
      return;
    }

    try {
      const postData = new FormData();
      postData.append("payment[resource_id]", String(bookingDetails.id));
      postData.append("payment[resource_type]", "AmenityBooking");
      postData.append("payment[total_amount]", String(bookingDetails.amount ?? ""));
      postData.append("payment[paid_amount]", String(formData.paid_amount));
      postData.append("payment[payment_method]", String(formData.payment_method).toLowerCase());
      postData.append("payment[transaction_id]", String(formData.transaction_id));
      postData.append("payment[payment_date]", String(formData.payment_date));
      postData.append("payment[notes]", String(formData.notes || ""));

      const res = await postPaymentBookings(postData);

      const status = res?.status ?? 200;
      if (status === 201 || status === 200) {
        try {
          await updateAmenityBook(id, { status: "paid" });
        } catch (e) {}

        setBookingDetails((prev) => ({
          ...prev,
          status: "paid",
          payment: {
            payment_method: formData.payment_method,
            total_amount: bookingDetails.amount,
            paid_amount: formData.paid_amount,
            payment_date: formData.payment_date,
            transaction_id: formData.transaction_id,
            notes: formData.notes || "N/A",
            resource_id: bookingDetails.id,
            resource_type: "AmenityBooking",
          },
        }));

        setShowModal(false);
        toast.success("Payment Captured successfully!");
      } else {
        toast.error("Payment capture failed. Please try again.");
      }
    } catch (err) {
      console.error("Error in payment:", err);
      toast.error("Error in payment. Please try again.");
    }
  };

  const handleConfirmCancel = async () => {
    try {
      const res = await updateAmenityBook(id, { status: "cancelled" });
      const status = res?.status ?? 200;
      if (status === 200) {
        toast.success("Status Cancelled!");
        navigate("/bookings");
      } else {
        toast.error("Failed to cancel booking.");
      }
    } catch (err) {
      console.error("Error cancelling booking:", err);
      toast.error("An error occurred while cancelling.");
    }
  };

  const slotTime = useMemo(() => {
    const amenitySlotId = bookingDetails?.amenity_slot_id;
    const slots = facilityDetails?.amenity_slots || bookingDetails?.amenity?.amenity_slots || [];
    if (!amenitySlotId || !Array.isArray(slots)) return "N/A";

    const selected = slots.find((s) => Number(s.id) === Number(amenitySlotId));
    if (!selected) return "N/A";

    return selected.twelve_hr_slot || selected.slot_str || "N/A";
  }, [bookingDetails?.amenity_slot_id, facilityDetails, bookingDetails?.amenity]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading booking details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>{error}</p>
      </div>
    );
  }

  if (!bookingDetails) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>No booking details available.</p>
      </div>
    );
  }

  const statusText = String(bookingDetails.status || "");
  const facName = facilityDetails?.fac_name || bookingDetails?.amenity?.fac_name || "NA";

  return (
    <section className="flex">
      <Navbar />

      <div className="w-full p-4 mb-5">
        <div
          style={{ background: themeColor || "rgb(17, 24, 39)" }}
          className="flex justify-center m-2 p-2 rounded-md"
        >
          <h2 className="text-xl font-semibold text-center text-white">Booking Details</h2>
        </div>

        <div className="flex justify-end rounded border p-2 items-center w-full">
          <div className="flex justify-end gap-2 w-full">
            {statusText !== "cancelled" && statusText !== "paid" && (
              <button
                className="bg-yellow-500 rounded-md text-white p-2 w-[150px]"
                onClick={() => setShowModal(true)}
              >
                Capture Payment
              </button>
            )}

            {statusText !== "paid" && (
              <button
                className="bg-red-500 rounded-md text-white p-2 w-[100px]"
                onClick={() => setShowConfirmPopup(true)}
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* Confirm Popup */}
        {showConfirmPopup && (
          <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-md shadow-md w-1/3">
              <h3 className="text-xl font-semibold mb-4">Are you sure?</h3>
              <p className="mb-4">Do you want to cancel and go back to bookings?</p>
              <div className="flex justify-end gap-4">
                <button
                  className="bg-green-500 text-white px-4 py-2 rounded-md"
                  onClick={handleConfirmCancel}
                >
                  Yes, Cancel
                </button>
                <button
                  className="bg-gray-500 text-white px-4 py-2 rounded-md"
                  onClick={() => setShowConfirmPopup(false)}
                >
                  No, Stay
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Payment Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-md w-96">
              <h2 className="text-xl font-bold mb-4">Capture Payment</h2>

              <div className="flex flex-col gap-4">
                <label>
                  Total Amount
                  <input
                    type="text"
                    value={bookingDetails.amount ?? ""}
                    className="border p-2 bg-gray-100 rounded-md w-full"
                    disabled
                  />
                </label>

                <label>
                  Paid Amount <span className="text-red-500 font-semibold">*</span>
                  <input
                    type="text"
                    name="paid_amount"
                    value={formData.paid_amount}
                    onChange={handleInputChange}
                    className="border p-2 rounded-md w-full"
                  />
                </label>

                <label>
                  Payment Method <span className="text-red-500 font-semibold">*</span>
                  <select
                    className="border p-2 rounded w-full"
                    value={formData.payment_method}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, payment_method: e.target.value }))
                    }
                  >
                    <option value="">Select Payment Method</option>
                    <option value="CHEQUE">Cheque</option>
                    <option value="UPI">UPI</option>
                    <option value="NEFT">NEFT</option>
                    <option value="CASH">Cash</option>
                  </select>
                </label>

                <label>
                  Transaction ID <span className="text-red-500 font-semibold">*</span>
                  <input
                    type="text"
                    name="transaction_id"
                    value={formData.transaction_id}
                    onChange={handleInputChange}
                    className="border p-2 rounded-md w-full"
                  />
                </label>

                <label>
                  Date
                  <input
                    type="date"
                    name="payment_date"
                    value={formData.payment_date}
                    onChange={handleInputChange}
                    className="border p-2 rounded-md w-full"
                  />
                </label>

                <label>
                  Remarks
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    className="border p-2 rounded-md w-full"
                    rows={2}
                  />
                </label>

                <div className="flex justify-end gap-2">
                  <button className="bg-blue-500 text-white p-2 rounded-md" onClick={postPaymentBooking}>
                    Submit
                  </button>
                  <button className="bg-gray-500 text-white p-2 rounded-md" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Summary */}
        <div className="grid grid-cols-4 w-full gap-5 my-2 bg-blue-50 border rounded-xl p-2">
          <div className="grid grid-cols-2 gap-2 items-center">
            <p className="font-medium">Facility Name</p>
            <p>{facName}</p>
          </div>

          <div className="grid grid-cols-2 gap-2 items-center">
            <p className="font-medium">Booking ID</p>
            <p>{bookingDetails.id}</p>
          </div>

          <div className="grid grid-cols-2 gap-2 items-center">
            <p className="font-medium">Status</p>
            <p>{statusText || "NA"}</p>
          </div>

          <div className="grid grid-cols-2 gap-2 items-center">
            <p className="font-medium">Scheduled Date</p>
            <p>{bookingDetails.booking_date || "NA"}</p>
          </div>

          <div className="grid grid-cols-2 gap-2 items-center">
            <p className="font-medium">Selected Slot</p>
            <p>{slotTime}</p>
          </div>

          <div className="grid grid-cols-2 gap-2 items-center">
            <p className="font-medium">Booked By</p>
            <p>{userName || bookingDetails.book_by_user || "NA"}</p>
          </div>

          <div className="grid grid-cols-2 gap-2 items-center">
            <p className="font-medium">Payable Amount</p>
            <p>{bookingDetails.amount ?? "NA"}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BookingDetails;