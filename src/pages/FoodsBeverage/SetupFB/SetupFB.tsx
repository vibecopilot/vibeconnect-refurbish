import React, { useState } from 'react';
import FormSection from '../../../components/ui/FormSection';
import TabNavigation from '../../../components/ui/TabNavigation';
import BasicDetails from './BasicDetails';
import RestaurantDetails from './RestaurantDetails';
import FloorsAreas from './FloorsAreas';
import TableBookings from './TableBookings';
import CategoriesCuisines from './CategoriesCuisines';
import MenuItems from './MenuItems';
import PaymentAttachments from './PaymentAttachments';

const SetupFB: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Basic Details');

  return (
    <section className="space-y-6">
      <FormSection title="F&B Setup">
        <TabNavigation
          tabs={[
            { id: 'Basic Details', label: 'Basic Details' },
            { id: 'Restaurant Details', label: 'Restaurant Details' },
            { id: 'Floors/Areas', label: 'Floors/Areas' },
            { id: 'Table Bookings', label: 'Table Bookings' },
            { id: 'Categories & Cuisines', label: 'Categories & Cuisines' },
            { id: 'Menu Items', label: 'Menu Items' },
            { id: 'Payment & Attachments', label: 'Payment & Attachments' },
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {activeTab === 'Basic Details' && <BasicDetails />}
        {activeTab === 'Restaurant Details' && <RestaurantDetails />}
        {activeTab === 'Floors/Areas' && <FloorsAreas />}
        {activeTab === 'Table Bookings' && <TableBookings />}
        {activeTab === 'Categories & Cuisines' && <CategoriesCuisines />}
        {activeTab === 'Menu Items' && <MenuItems />}
        {activeTab === 'Payment & Attachments' && <PaymentAttachments />}
      </FormSection>
    </section>
  );
};

export default SetupFB;
