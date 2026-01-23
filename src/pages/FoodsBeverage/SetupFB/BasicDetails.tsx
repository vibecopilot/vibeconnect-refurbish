import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import FormInput from '../../../components/ui/FormInput';
import FormGrid from '../../../components/ui/FormGrid';

const BasicDetails: React.FC = () => {
  const [restaurantName, setRestaurantName] = useState('Sample Restaurant');
  const [address, setAddress] = useState('123 Main Street, City - 400001');
  const [phone, setPhone] = useState('+91 9876543210');
  const [email, setEmail] = useState('contact@samplerestaurant.com');
  const [restaurantType, setRestaurantType] = useState('all');
  const [opensAt, setOpensAt] = useState('10:00');
  const [closesAt, setClosesAt] = useState('23:00');
  const [gstNumber, setGstNumber] = useState('27ABCDE1234F1ZH');
  const [logo, setLogo] = useState<File | null>(null);

  const handleSave = () => {
    // TODO: Replace with actual API call
    // await saveBasicDetails({ restaurantName, address, phone, email, restaurantType, opensAt, closesAt, gstNumber, logo });
    console.log('Basic Details:', { restaurantName, address, phone, email, restaurantType, opensAt, closesAt, gstNumber, logo });
  };

  return (
    <div className="space-y-6">
      <FormGrid columns={3}>
        <FormInput
          label="Restaurant Name"
          name="restaurantName"
          value={restaurantName}
          onChange={(e) => setRestaurantName(e.target.value)}
          required
          placeholder="Enter Restaurant Name"
        />
        <FormInput
          label="Phone"
          name="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Enter Phone Number"
        />
        <FormInput
          label="Email"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter Email"
        />
        <FormInput
          label="Opens at"
          name="opensAt"
          type="time"
          value={opensAt}
          onChange={(e) => setOpensAt(e.target.value)}
        />
        <FormInput
          label="Closes at"
          name="closesAt"
          type="time"
          value={closesAt}
          onChange={(e) => setClosesAt(e.target.value)}
        />
        <FormInput
          label="GST Number"
          name="gstNumber"
          value={gstNumber}
          onChange={(e) => setGstNumber(e.target.value)}
          placeholder="Enter GST Number"
        />
      </FormGrid>

      <FormInput
        label="Address"
        name="address"
        type="textarea"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="Enter Address"
        rows={2}
        className="col-span-3"
      />

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Restaurant Type</label>
        <div className="flex flex-wrap gap-4">
          {[
            { value: 'dine-in', label: 'Dine-in only' },
            { value: 'takeaway', label: 'Takeaway/Delivery only' },
            { value: 'cloud', label: 'Cloud Kitchen' },
            { value: 'all', label: 'All of the above' },
          ].map((option) => (
            <label key={option.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="restaurantType"
                value={option.value}
                checked={restaurantType === option.value}
                onChange={(e) => setRestaurantType(e.target.value)}
                className="w-4 h-4 text-primary accent-primary"
              />
              <span className="text-sm text-foreground">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Upload Logo</label>
        <label className="flex items-center gap-2 px-3 py-2 border border-dashed border-border rounded-lg bg-background cursor-pointer hover:bg-accent/30 transition-colors">
          <Upload className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {logo ? logo.name : 'Click to Upload'}
          </span>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setLogo(e.target.files?.[0] || null)}
            className="hidden"
          />
        </label>
      </div>

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

export default BasicDetails;
