import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import FormInput from '../../../components/ui/FormInput';
import FormGrid from '../../../components/ui/FormGrid';

const PaymentAttachments: React.FC = () => {
  const [paymentMethods, setPaymentMethods] = useState({
    cash: true,
    card: true,
    upi: true,
    sodexo: false,
    credit: false,
  });
  const [googlePay, setGooglePay] = useState('');
  const [phonePe, setPhonePe] = useState('');
  const [paytm, setPaytm] = useState('');
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [gallery, setGallery] = useState<File | null>(null);
  const [menuPdf, setMenuPdf] = useState<File | null>(null);
  const [otherFiles, setOtherFiles] = useState<File | null>(null);

  const togglePaymentMethod = (method: keyof typeof paymentMethods) => {
    setPaymentMethods({ ...paymentMethods, [method]: !paymentMethods[method] });
  };

  const handleSave = () => {
    // TODO: Replace with actual API call
    // await savePaymentAttachments({ paymentMethods, googlePay, phonePe, paytm, coverImage, gallery, menuPdf, otherFiles });
    console.log('Payment & Attachments:', { paymentMethods, googlePay, phonePe, paytm, coverImage, gallery, menuPdf, otherFiles });
  };

  return (
    <div className="space-y-6">
      {/* Payment Methods */}
      <div>
        <h4 className="font-semibold text-foreground mb-3">Payment Methods Accepted</h4>
        <div className="space-y-2">
          {[
            { key: 'cash', label: 'Cash' },
            { key: 'card', label: 'Card (Credit/Debit)' },
            { key: 'upi', label: 'UPI/Digital Wallets' },
            { key: 'sodexo', label: 'Sodexo/Meal Cards' },
            { key: 'credit', label: 'Credit Account (Pay Later)' },
          ].map((method) => (
            <label key={method.key} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={paymentMethods[method.key as keyof typeof paymentMethods]}
                onChange={() => togglePaymentMethod(method.key as keyof typeof paymentMethods)}
                className="w-4 h-4 rounded text-primary accent-primary"
              />
              <span className="text-sm text-foreground">{method.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* UPI Details */}
      <div>
        <h4 className="font-semibold text-foreground mb-3">UPI Details (Optional)</h4>
        <FormGrid columns={3}>
          <FormInput
            label="Google Pay"
            name="googlePay"
            value={googlePay}
            onChange={(e) => setGooglePay(e.target.value)}
            placeholder="UPI ID"
          />
          <FormInput
            label="PhonePe"
            name="phonePe"
            value={phonePe}
            onChange={(e) => setPhonePe(e.target.value)}
            placeholder="UPI ID"
          />
          <FormInput
            label="Paytm"
            name="paytm"
            value={paytm}
            onChange={(e) => setPaytm(e.target.value)}
            placeholder="UPI ID"
          />
        </FormGrid>
      </div>

      {/* Upload Documents */}
      <div>
        <h4 className="font-semibold text-foreground mb-3">Upload Documents</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { key: 'cover', label: 'Cover Image', state: coverImage, setState: setCoverImage, accept: 'image/*' },
            { key: 'gallery', label: 'Gallery', state: gallery, setState: setGallery, accept: 'image/*' },
            { key: 'menu', label: 'Menu PDF', state: menuPdf, setState: setMenuPdf, accept: '.pdf' },
            { key: 'other', label: 'Other Files', state: otherFiles, setState: setOtherFiles, accept: '*' },
          ].map((doc) => (
            <div key={doc.key}>
              <label className="block text-sm font-medium text-foreground mb-1">{doc.label}</label>
              <label className="flex flex-col items-center justify-center h-24 border border-dashed border-border rounded-lg bg-background cursor-pointer hover:bg-accent/30 transition-colors">
                <Upload className="w-6 h-6 text-muted-foreground mb-1" />
                <span className="text-xs text-muted-foreground text-center px-2">
                  {doc.state ? doc.state.name : 'Click to Upload'}
                </span>
                <input
                  type="file"
                  accept={doc.accept}
                  onChange={(e) => doc.setState(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>
            </div>
          ))}
        </div>
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

export default PaymentAttachments;
