import React, { useState } from 'react';
import FormInput from '../../../components/ui/FormInput';
import FormGrid from '../../../components/ui/FormGrid';

const RestaurantDetails: React.FC = () => {
  const [licenseNumber, setLicenseNumber] = useState('LIC123456789');
  const [fssaiNumber, setFssaiNumber] = useState('12345678901234');
  const [location, setLocation] = useState('Main Branch');
  const [deliveryZone, setDeliveryZone] = useState('Downtown, Suburb Area');
  const [serviceRadius, setServiceRadius] = useState('10');
  const [avgPrepTime, setAvgPrepTime] = useState('30');
  const [taxType, setTaxType] = useState('gst');
  const [serviceCharge, setServiceCharge] = useState('5');

  const handleSave = () => {
    // TODO: Replace with actual API call
    // await saveRestaurantDetails({ licenseNumber, fssaiNumber, location, deliveryZone, serviceRadius, avgPrepTime, taxType, serviceCharge });
    console.log('Restaurant Details:', { licenseNumber, fssaiNumber, location, deliveryZone, serviceRadius, avgPrepTime, taxType, serviceCharge });
  };

  return (
    <div className="space-y-6">
      <FormGrid columns={2}>
        <FormInput
          label="License Number"
          name="licenseNumber"
          value={licenseNumber}
          onChange={(e) => setLicenseNumber(e.target.value)}
          placeholder="Enter License Number"
        />
        <FormInput
          label="FSSAI Number"
          name="fssaiNumber"
          value={fssaiNumber}
          onChange={(e) => setFssaiNumber(e.target.value)}
          placeholder="Enter FSSAI Number"
        />
        <FormInput
          label="Location/Branch"
          name="location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Enter Location/Branch"
        />
        <FormInput
          label="Delivery Zone"
          name="deliveryZone"
          value={deliveryZone}
          onChange={(e) => setDeliveryZone(e.target.value)}
          placeholder="Enter Delivery Zone"
        />
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Service Radius</label>
          <div className="relative">
            <input
              type="text"
              name="serviceRadius"
              value={serviceRadius}
              onChange={(e) => setServiceRadius(e.target.value)}
              className="w-full px-3 py-2 pr-12 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">km</span>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Average Prep Time</label>
          <div className="relative">
            <input
              type="text"
              name="avgPrepTime"
              value={avgPrepTime}
              onChange={(e) => setAvgPrepTime(e.target.value)}
              className="w-full px-3 py-2 pr-16 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">minutes</span>
          </div>
        </div>
        <FormInput
          label="Tax Type"
          name="taxType"
          type="select"
          value={taxType}
          onChange={(e) => setTaxType(e.target.value)}
          options={[
            { value: 'gst', label: 'GST' },
            { value: 'vat', label: 'VAT' },
            { value: 'none', label: 'None' },
          ]}
        />
        <FormInput
          label="Service Charge %"
          name="serviceCharge"
          value={serviceCharge}
          onChange={(e) => setServiceCharge(e.target.value)}
          placeholder="Enter Service Charge %"
        />
      </FormGrid>

      <div className="flex justify-end pt-4">
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-error text-error-foreground rounded-lg hover:bg-error/90 transition-colors text-sm font-medium"
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default RestaurantDetails;
