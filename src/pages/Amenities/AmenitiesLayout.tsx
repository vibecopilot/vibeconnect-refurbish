import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Breadcrumb from '../../components/ui/Breadcrumb';

const AmenitiesLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isHotelTab = location.pathname.startsWith('/amenities/hotel');
  const [activeTab, setActiveTab] = useState(isHotelTab ? 'hotel' : 'amenities');

  React.useEffect(() => {
    const isHotel = location.pathname.startsWith('/amenities/hotel');
    setActiveTab(isHotel ? 'hotel' : 'amenities');
  }, [location.pathname]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'amenities') {
      navigate('/amenities');
    } else {
      navigate('/amenities/hotel');
    }
  };

  return (
    <div className="p-6">
      <Breadcrumb 
        items={[
          { label: 'Booking Management' }, 
          { label: 'Amenities Booking', path: '/amenities' },
          ...(isHotelTab ? [{ label: 'Hotel Bookings' }] : [])
        ]} 
      />

      {/* Toggle Navigation */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex bg-muted rounded-full p-1">
          <button
            onClick={() => handleTabChange('amenities')}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
              activeTab === 'amenities'
                ? 'bg-card text-primary shadow-md'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Amenities Bookings
          </button>
          <button
            onClick={() => handleTabChange('hotel')}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
              activeTab === 'hotel'
                ? 'bg-card text-primary shadow-md'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Hotel Bookings
          </button>
        </div>
      </div>

      <Outlet />
    </div>
  );
};

export default AmenitiesLayout;
