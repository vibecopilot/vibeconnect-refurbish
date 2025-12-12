import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Hotel, Users, ChevronDown, ChevronUp } from 'lucide-react';
import { postHotelRequest } from '../../api';
import { getItemInLocalStorage } from '../../utils/localStorage';
import toast from 'react-hot-toast';
import Select from 'react-select';

interface UserOption {
  value: string;
  label: string;
}

const BookHotel: React.FC = () => {
  const navigate = useNavigate();
  const userId = getItemInLocalStorage('UserId');
  const siteId = getItemInLocalStorage('SITEID');

  const [users, setUsers] = useState<UserOption[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserOption | null>(null);
  const [checkInDate, setCheckInDate] = useState(new Date().toISOString().split('T')[0]);
  const [checkOutDate, setCheckOutDate] = useState('');
  const [paymentMode, setPaymentMode] = useState('postpaid');

  const [formData, setFormData] = useState({
    destination: '',
    hotelPreferences: '',
    numberOfRooms: 1,
    roomType: '',
    bookingConfirmationNumber: '',
    bookingCertificationEmail: '',
  });

  const [members, setMembers] = useState({
    member: { adult: 0, child: 0 },
    guest: { adult: 0, child: 0 },
    tenant: { adult: 0, child: 0 },
  });

  const [gst, setGst] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  const [cancellationOpen, setCancellationOpen] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setUsers([
      { value: userId || '1', label: 'Current User' },
    ]);
  }, [userId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMemberChange = (category: 'member' | 'guest' | 'tenant', type: 'adult' | 'child', value: number) => {
    setMembers(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [type]: Math.max(0, value),
      },
    }));
  };

  const handleSubmit = async () => {
    if (!formData.destination) {
      toast.error('Please enter destination');
      return;
    }
    if (!checkInDate) {
      toast.error('Please select check-in date');
      return;
    }
    if (!checkOutDate) {
      toast.error('Please select check-out date');
      return;
    }
    if (new Date(checkOutDate) <= new Date(checkInDate)) {
      toast.error('Check-out date must be after check-in date');
      return;
    }

    setSubmitting(true);
    try {
      const postData = new FormData();
      postData.append('hotel[destination]', formData.destination);
      postData.append('hotel[hotel_preferences]', formData.hotelPreferences);
      postData.append('hotel[check_in_date]', checkInDate);
      postData.append('hotel[check_out_date]', checkOutDate);
      postData.append('hotel[number_of_rooms]', String(formData.numberOfRooms));
      postData.append('hotel[room_type]', formData.roomType);
      postData.append('hotel[booking_confirmation_number]', formData.bookingConfirmationNumber);
      postData.append('hotel[booking_certification_email]', formData.bookingCertificationEmail);
      postData.append('hotel[booking_status]', 'pending');
      postData.append('hotel[manager_approval]', 'false');
      postData.append('hotel[site_id]', siteId || '');
      postData.append('hotel[payment_mode]', paymentMode);
      postData.append('hotel[gst]', String(gst));
      postData.append('hotel[amount]', String(totalAmount));

      await postHotelRequest(postData);
      toast.success('Hotel booking created successfully');
      navigate('/amenities/hotel');
    } catch (error) {
      console.error('Booking error:', error);
      toast.error('Failed to create hotel booking');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <button onClick={() => navigate('/amenities/hotel')} className="flex items-center gap-1 hover:text-foreground">
          <ChevronLeft className="w-4 h-4" />
          Hotel Bookings
        </button>
        <span>/</span>
        <span className="text-foreground">Book Hotel</span>
      </div>

      {/* Form Card */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Hotel className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">Book Hotel</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Destination */}
          <div>
            <label className="block text-sm font-medium mb-1">Destination <span className="text-destructive">*</span></label>
            <input
              type="text"
              name="destination"
              value={formData.destination}
              onChange={handleChange}
              placeholder="Enter destination"
              className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>

          {/* Hotel Preferences */}
          <div>
            <label className="block text-sm font-medium mb-1">Hotel Preferences</label>
            <input
              type="text"
              name="hotelPreferences"
              value={formData.hotelPreferences}
              onChange={handleChange}
              placeholder="Enter hotel preferences"
              className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>

          {/* Select User */}
          <div>
            <label className="block text-sm font-medium mb-1">Select User</label>
            <Select
              options={users}
              value={selectedUser}
              onChange={(selected) => setSelectedUser(selected)}
              placeholder="Search and select user..."
              className="react-select-container"
              classNamePrefix="react-select"
              isClearable
            />
          </div>

          {/* Number of Rooms */}
          <div>
            <label className="block text-sm font-medium mb-1">Number of Rooms</label>
            <input
              type="number"
              name="numberOfRooms"
              min={1}
              value={formData.numberOfRooms}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>

          {/* Check-in Date */}
          <div>
            <label className="block text-sm font-medium mb-1">Check-in Date <span className="text-destructive">*</span></label>
            <input
              type="date"
              value={checkInDate}
              onChange={(e) => setCheckInDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>

          {/* Check-out Date */}
          <div>
            <label className="block text-sm font-medium mb-1">Check-out Date <span className="text-destructive">*</span></label>
            <input
              type="date"
              value={checkOutDate}
              onChange={(e) => setCheckOutDate(e.target.value)}
              min={checkInDate || new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>

          {/* Room Type */}
          <div>
            <label className="block text-sm font-medium mb-1">Room Type</label>
            <select
              name="roomType"
              value={formData.roomType}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="">Select room type</option>
              <option value="single">Single</option>
              <option value="double">Double</option>
              <option value="suite">Suite</option>
              <option value="deluxe">Deluxe</option>
            </select>
          </div>

          {/* Contact Number */}
          <div>
            <label className="block text-sm font-medium mb-1">Contact Number</label>
            <input
              type="text"
              name="bookingConfirmationNumber"
              value={formData.bookingConfirmationNumber}
              onChange={handleChange}
              placeholder="Enter contact number"
              className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>

          {/* Email */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              name="bookingCertificationEmail"
              value={formData.bookingCertificationEmail}
              onChange={handleChange}
              placeholder="Enter email"
              className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>
        </div>

        {/* Payment Mode */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Payment Mode</label>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="paymentMode"
                value="postpaid"
                checked={paymentMode === 'postpaid'}
                onChange={(e) => setPaymentMode(e.target.value)}
                className="w-4 h-4 text-primary"
              />
              <span>Post Paid</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="paymentMode"
                value="prepaid"
                checked={paymentMode === 'prepaid'}
                onChange={(e) => setPaymentMode(e.target.value)}
                className="w-4 h-4 text-primary"
              />
              <span>Prepaid</span>
            </label>
          </div>
        </div>

        {/* Members Section */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="w-4 h-4 text-primary" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">Members</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Member */}
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-medium mb-3">Member</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Adult</span>
                  <input
                    type="number"
                    min={0}
                    value={members.member.adult}
                    onChange={(e) => handleMemberChange('member', 'adult', parseInt(e.target.value) || 0)}
                    className="w-20 px-2 py-1 text-sm border border-border rounded bg-background text-right"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Child</span>
                  <input
                    type="number"
                    min={0}
                    value={members.member.child}
                    onChange={(e) => handleMemberChange('member', 'child', parseInt(e.target.value) || 0)}
                    className="w-20 px-2 py-1 text-sm border border-border rounded bg-background text-right"
                  />
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <span className="text-sm font-medium">Total</span>
                  <span className="font-semibold">{members.member.adult + members.member.child}</span>
                </div>
              </div>
            </div>

            {/* Guest */}
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-medium mb-3">Guest</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Adult</span>
                  <input
                    type="number"
                    min={0}
                    value={members.guest.adult}
                    onChange={(e) => handleMemberChange('guest', 'adult', parseInt(e.target.value) || 0)}
                    className="w-20 px-2 py-1 text-sm border border-border rounded bg-background text-right"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Child</span>
                  <input
                    type="number"
                    min={0}
                    value={members.guest.child}
                    onChange={(e) => handleMemberChange('guest', 'child', parseInt(e.target.value) || 0)}
                    className="w-20 px-2 py-1 text-sm border border-border rounded bg-background text-right"
                  />
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <span className="text-sm font-medium">Total</span>
                  <span className="font-semibold">{members.guest.adult + members.guest.child}</span>
                </div>
              </div>
            </div>

            {/* Tenant */}
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-medium mb-3">Tenant</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Adult</span>
                  <input
                    type="number"
                    min={0}
                    value={members.tenant.adult}
                    onChange={(e) => handleMemberChange('tenant', 'adult', parseInt(e.target.value) || 0)}
                    className="w-20 px-2 py-1 text-sm border border-border rounded bg-background text-right"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Child</span>
                  <input
                    type="number"
                    min={0}
                    value={members.tenant.child}
                    onChange={(e) => handleMemberChange('tenant', 'child', parseInt(e.target.value) || 0)}
                    className="w-20 px-2 py-1 text-sm border border-border rounded bg-background text-right"
                  />
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <span className="text-sm font-medium">Total</span>
                  <span className="font-semibold">{members.tenant.adult + members.tenant.child}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* GST and Total */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-1">GST (%)</label>
            <input
              type="number"
              min={0}
              value={gst}
              onChange={(e) => setGst(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-right focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Total Amount</label>
            <input
              type="number"
              min={0}
              value={totalAmount}
              onChange={(e) => setTotalAmount(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-right focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center mb-6">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-8 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>

        {/* Cancellation Policy Accordion */}
        <div className="border border-border rounded-lg mb-3">
          <button
            onClick={() => setCancellationOpen(!cancellationOpen)}
            className="w-full flex items-center justify-between p-4 text-left"
          >
            <span className="font-medium">Cancellation Policy</span>
            {cancellationOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
          {cancellationOpen && (
            <div className="px-4 pb-4 text-sm text-muted-foreground">
              <p>Cancellations made 48 hours before check-in are eligible for a full refund. Cancellations made less than 48 hours before will incur a one-night charge. No refunds for no-shows.</p>
            </div>
          )}
        </div>

        {/* Terms & Conditions Accordion */}
        <div className="border border-border rounded-lg">
          <button
            onClick={() => setTermsOpen(!termsOpen)}
            className="w-full flex items-center justify-between p-4 text-left"
          >
            <span className="font-medium">Terms & Conditions</span>
            {termsOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
          {termsOpen && (
            <div className="px-4 pb-4 text-sm text-muted-foreground">
              <p>By booking this hotel, you agree to the hotel's policies and regulations. Standard check-in time is 2:00 PM and check-out time is 11:00 AM. Early check-in and late check-out are subject to availability and may incur additional charges.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookHotel;
