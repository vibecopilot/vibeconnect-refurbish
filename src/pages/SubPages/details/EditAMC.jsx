import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Calendar, FileText, Loader2, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import FormSection from "../../../components/ui/FormSection";
import FormInput from "../../../components/ui/FormInput";
import Button from "../../../components/ui/Button";
import PageTitle from "../../../components/ui/PageTitle";
import { EditAMCDetails, getEditAMCDetails, getVendors } from "../../../api";

const toInputDate = (v) => {
  if (!v) return "";
  if (typeof v === "string" && v.length >= 10 && v.includes("-")) return v.slice(0, 10);
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
};

const toAbsoluteDocUrl = (doc) => {
  if (!doc) return "";
  return doc.startsWith("http") ? doc : `https://admin.vibecopilot.ai${doc}`;
};

const fileNameFromPath = (p) => {
  if (!p) return "Document";
  const parts = p.split("/");
  return parts[parts.length - 1] || "Document";
};

const EditAssetAMC = () => {
  const { id } = useParams(); // AMC id
  const navigate = useNavigate();

  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // existing attachments from backend
  const [existingAttachments, setExistingAttachments] = useState([]);
  // new files selected by user
  const [newFiles, setNewFiles] = useState([]);

  const [formData, setFormData] = useState({
    vendor_id: "",
    asset_id: "",
    start_date: "",
    end_date: "",
    frequency: "",
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const [vendorResp, amcResp] = await Promise.all([
          getVendors(),
          getEditAMCDetails(id),
        ]);

        setVendors(vendorResp.data || []);

        const data = amcResp.data || {};

        setFormData({
          vendor_id: String(data.vendor_id ?? ""),
          asset_id: String(data.asset_id ?? ""),
          start_date: toInputDate(data.start_date),
          end_date: toInputDate(data.end_date),
          frequency: data.frequency ?? "",
        });

        const attachments =
          (Array.isArray(data.attachments) && data.attachments) ||
          (Array.isArray(data.terms) && data.terms) ||
          [];

        setExistingAttachments(attachments);
        setNewFiles([]);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to fetch AMC details");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    setNewFiles(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.vendor_id) return toast.error("Please select Vendor");
    if (!formData.start_date) return toast.error("Please select Start Date");
    if (!formData.end_date) return toast.error("Please select End Date");
    if (!formData.frequency) return toast.error("Please select Frequency");

    if (formData.start_date >= formData.end_date) {
      toast.error("Start Date must be before End Date");
      return;
    }

    setIsSubmitting(true);
    try {
      const dataToSend = new FormData();
      dataToSend.append("asset_amc[vendor_id]", formData.vendor_id);
      dataToSend.append("asset_amc[asset_id]", formData.asset_id);
      dataToSend.append("asset_amc[start_date]", formData.start_date);
      dataToSend.append("asset_amc[end_date]", formData.end_date);
      dataToSend.append("asset_amc[frequency]", formData.frequency);

      // only new selected files
      newFiles.forEach((file) => dataToSend.append("asset_amc[terms][]", file));


      await EditAMCDetails(dataToSend, id);
      toast.success("AMC Updated Successfully");
      navigate("/asset/amc");
    } catch (error) {
      console.error("Error updating AMC:", error);
      toast.error("Failed to update AMC");
    } finally {
      setIsSubmitting(false);
    }
  };

  const vendorOptions = vendors.map((vendor) => ({
    value: String(vendor.id),
    label: vendor.vendor_name || vendor.company_name || `Vendor ${vendor.id}`,
  }));

  const frequencyOptions = [
    { value: "", label: "Select Frequency" },
    { value: "one Time", label: "One Time" },
    { value: "hourly", label: "Hourly" },
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
    { value: "quarterly", label: "Quarterly" },
    { value: "half yearly", label: "Half Yearly" },
    { value: "yearly", label: "Yearly" },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading AMC details...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <button
          onClick={() => navigate("/asset/amc")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to AMC List
        </button>

        <PageTitle title="Edit AMC" subtitle="Update Annual Maintenance Contract details" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <FormSection title="AMC DETAILS" icon={Calendar}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <FormInput
              label="Vendor"
              name="vendor_id"
              type="select"
              value={formData.vendor_id}
              onChange={handleChange}
              options={vendorOptions}
              required
              placeholder="Select Vendor"
            />

            <FormInput
              label="Start Date"
              name="start_date"
              type="date"
              value={formData.start_date}
              onChange={handleChange}
              required
            />

            <FormInput
              label="End Date"
              name="end_date"
              type="date"
              value={formData.end_date}
              onChange={handleChange}
              required
            />

            <FormInput
              label="Frequency"
              name="frequency"
              type="select"
              value={formData.frequency}
              onChange={handleChange}
              options={frequencyOptions}
              required
              placeholder="Select Frequency"
            />
          </div>
        </FormSection>

        {/* Existing Attachments */}
        <FormSection title="Existing AMC Terms" icon={FileText}>
          {existingAttachments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No existing documents.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {existingAttachments.map((att, idx) => {
                const href = toAbsoluteDocUrl(att?.document || att?.url);
                const label = att?.document
                  ? fileNameFromPath(att.document)
                  : att?.name || `Document ${idx + 1}`;

                return (
                  <li key={att?.id || idx}>
                    {href ? (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {label}
                      </a>
                    ) : (
                      <span>{label}</span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </FormSection>

        {/* Upload New Terms */}
        <FormSection title="Upload New AMC Terms" icon={FileText}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">AMC Terms Documents</label>
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Supported formats: PDF, DOC, DOCX, JPG, PNG
              </p>
            </div>

            {newFiles.length > 0 && (
              <div className="text-sm text-muted-foreground">
                {newFiles.length} file(s) selected
              </div>
            )}
          </div>
        </FormSection>

        <div className="flex items-center justify-end gap-4 pt-6 border-t border-border">
          <Button type="button" variant="outline" onClick={() => navigate("/asset/amc")} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              "Update AMC"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditAssetAMC;
