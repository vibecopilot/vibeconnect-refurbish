import React, { useMemo, useState } from "react";
import {
  Upload,
  X,
  Smartphone,
  Monitor,
  Eye,
  Plus,
  FileText,
  MessageSquare,
  Image as ImageIcon,
  Tag,
} from "lucide-react";
import FormGrid from "../../../../components/ui/FormGrid";
import FormInput from "../../../../components/ui/FormInput";
import Button from "../../../../components/ui/Button";
import DataTable, { TableColumn } from "../../../../components/ui/DataTable";

type TemplateStatus = "active" | "inactive";

interface TemplateForm {
  name: string;
  code: string;
  category: string;
  description: string;
  status: TemplateStatus;
  subject: string;
  preheader: string;
  message: string;
  language: string;
  headerImage: string | null;
  bodyImages: string[];
  ctaText: string;
  ctaLink: string;
  ctaColor: string;
}

interface TemplateItem extends TemplateForm {
  id: string;
  createdAt: string;
}

const defaultForm: TemplateForm = {
  name: "",
  code: "",
  category: "",
  description: "",
  status: "active",
  subject: "",
  preheader: "",
  message: "",
  language: "",
  headerImage: null,
  bodyImages: [],
  ctaText: "",
  ctaLink: "",
  ctaColor: "#6D28D9",
};

const mergeTags = [
  "{FirstName}",
  "{LastName}",
  "{PropertyName}",
  "{UnitNumber}",
  "{BookingID}",
  "{Date}",
  "{Time}",
];

const sampleData: Record<string, string> = {
  "{FirstName}": "John",
  "{LastName}": "Doe",
  "{PropertyName}": "Sky Towers",
  "{UnitNumber}": "A-102",
  "{BookingID}": "BK12345",
  "{Date}": "Jan 15, 2026",
  "{Time}": "10:00 AM",
};

const TemplateSections: React.FC = () => {
  const [previewDevice, setPreviewDevice] = useState<"mobile" | "desktop">(
    "mobile"
  );
  const [templateForm, setTemplateForm] = useState<TemplateForm>(defaultForm);
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [showForm, setShowForm] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setTemplateForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "header" | "body"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      if (type === "header") {
        setTemplateForm((prev) => ({ ...prev, headerImage: result }));
        return;
      }

      setTemplateForm((prev) => ({
        ...prev,
        bodyImages: [...prev.bodyImages, result],
      }));
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (type: "header" | "body", index?: number) => {
    if (type === "header") {
      setTemplateForm((prev) => ({ ...prev, headerImage: null }));
      return;
    }

    setTemplateForm((prev) => ({
      ...prev,
      bodyImages: prev.bodyImages.filter((_, i) => i !== index),
    }));
  };

  const insertMergeTag = (tag: string) => {
    setTemplateForm((prev) => ({
      ...prev,
      message: `${prev.message}${tag}`,
    }));
  };

  const renderPreviewContent = () => {
    let content = templateForm.message || "Your message will appear here...";
    Object.entries(sampleData).forEach(([tag, value]) => {
      content = content.split(tag).join(value);
    });
    return content;
  };

  const handleCreateTemplate = () => {
    const id = `${Date.now()}`;
    const createdAt = new Date().toLocaleDateString("en-GB");
    const newTemplate: TemplateItem = { id, createdAt, ...templateForm };
    setTemplates((prev) => [newTemplate, ...prev]);
    setShowForm(false);
  };

  const handleViewTemplate = (template: TemplateItem) => {
    setTemplateForm({
      name: template.name,
      code: template.code,
      category: template.category,
      description: template.description,
      status: template.status,
      subject: template.subject,
      preheader: template.preheader,
      message: template.message,
      language: template.language,
      headerImage: template.headerImage,
      bodyImages: template.bodyImages,
      ctaText: template.ctaText,
      ctaLink: template.ctaLink,
      ctaColor: template.ctaColor,
    });
    setShowForm(true);
  };

  const columns = useMemo<TableColumn<TemplateItem>[]>(
    () => [
      { key: "name", header: "Template Name" },
      { key: "code", header: "Template ID" },
      { key: "category", header: "Category" },
      {
        key: "status",
        header: "Status",
        render: (value: TemplateStatus) => (
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
              value === "active"
                ? "bg-success-light text-success"
                : "bg-secondary text-muted-foreground"
            }`}
          >
            {value === "active" ? "Active" : "Inactive"}
          </span>
        ),
      },
      { key: "createdAt", header: "Created On" },
      {
        key: "actions",
        header: "Actions",
        render: (_, row) => (
          <button
            type="button"
            onClick={() => handleViewTemplate(row)}
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80"
          >
            <Eye className="w-4 h-4" />
            View
          </button>
        ),
      },
    ],
    []
  );

  const handleStartAdd = () => {
    setTemplateForm(defaultForm);
    setShowForm(true);
  };

  const handleCancel = () => {
    setTemplateForm(defaultForm);
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      {!showForm ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Eye className="w-5 h-5 text-primary" />
              <h3 className="text-base font-semibold text-foreground">
                Templates
              </h3>
            </div>
            <Button
              variant="primary"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={handleStartAdd}
            >
              Add Template
            </Button>
          </div>
          <DataTable columns={columns} data={templates} showActions />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <FileText className="w-5 h-5 text-primary" />
                <h3 className="text-base font-semibold text-foreground">
                  Template Details
                </h3>
              </div>
              <FormGrid columns={2}>
                <FormInput
                  label="Template Name"
                  name="name"
                  value={templateForm.name}
                  onChange={handleChange}
                  placeholder="Welcome Email"
                  required
                />
                <FormInput
                  label="Template ID/Code"
                  name="code"
                  value={templateForm.code}
                  onChange={handleChange}
                  placeholder="WELCOME_001"
                />
                <FormInput
                  label="Template Category/Type"
                  name="category"
                  type="select"
                  value={templateForm.category}
                  onChange={handleChange}
                  options={[
                    { value: "Email", label: "Email" },
                    { value: "SMS", label: "SMS" },
                    { value: "WhatsApp", label: "WhatsApp" },
                    { value: "In-App Notification", label: "In-App Notification" },
                  ]}
                  required
                />
                <FormInput
                  label="Status"
                  name="status"
                  type="select"
                  value={templateForm.status}
                  onChange={handleChange}
                  options={[
                    { value: "active", label: "Active" },
                    { value: "inactive", label: "Inactive" },
                  ]}
                />
                <FormInput
                  label="Description"
                  name="description"
                  value={templateForm.description}
                  onChange={handleChange}
                  placeholder="Describe the purpose of this template"
                  className="col-span-2"
                />
                <FormInput
                  label="Language/Locale"
                  name="language"
                  type="select"
                  value={templateForm.language}
                  onChange={handleChange}
                  options={[
                    { value: "en-IN", label: "English (India)" },
                    { value: "en-US", label: "English (US)" },
                    { value: "hi-IN", label: "Hindi (India)" },
                  ]}
                />
              </FormGrid>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <MessageSquare className="w-5 h-5 text-primary" />
                <h3 className="text-base font-semibold text-foreground">
                  Content
                </h3>
              </div>
              <div className="space-y-4">
                <FormInput
                  label="Subject Line"
                  name="subject"
                  value={templateForm.subject}
                  onChange={handleChange}
                  placeholder="Enter email subject"
                />
                <FormInput
                  label="Preheader Text"
                  name="preheader"
                  value={templateForm.preheader}
                  onChange={handleChange}
                  placeholder="Preview text that appears in inbox"
                />
                <FormInput
                  label="Message Body"
                  name="message"
                  type="textarea"
                  rows={6}
                  value={templateForm.message}
                  onChange={handleChange}
                  placeholder="Write your message here"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Character Count</span>
                  <span>{templateForm.message.length} chars</span>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <ImageIcon className="w-5 h-5 text-primary" />
                <h3 className="text-base font-semibold text-foreground">
                  Media
                </h3>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">
                    Header Image
                  </label>
                  {templateForm.headerImage ? (
                    <div className="relative">
                      <img
                        src={templateForm.headerImage}
                        alt="Header"
                        className="w-full h-32 object-cover rounded-lg border border-border"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage("header")}
                        className="absolute top-2 right-2 bg-error text-white p-1.5 rounded-full"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors">
                      <Upload className="w-5 h-5 text-muted-foreground mb-2" />
                      <span className="text-sm text-muted-foreground">
                        Click to upload header image
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, "header")}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-muted-foreground mb-2">
                    Body Images
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {templateForm.bodyImages.map((img, index) => (
                      <div key={`${img}-${index}`} className="relative">
                        <img
                          src={img}
                          alt={`Body ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border border-border"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage("body", index)}
                          className="absolute top-2 right-2 bg-error text-white p-1.5 rounded-full"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors">
                      <Upload className="w-5 h-5 text-muted-foreground mb-1" />
                      <span className="text-xs text-muted-foreground">
                        Add Image
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, "body")}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <FormGrid columns={3}>
                  <FormInput
                    label="CTA Button Text"
                    name="ctaText"
                    value={templateForm.ctaText}
                    onChange={handleChange}
                    placeholder="Get Started"
                  />
                  <FormInput
                    label="CTA Link"
                    name="ctaLink"
                    value={templateForm.ctaLink}
                    onChange={handleChange}
                    placeholder="https://"
                  />
                  <div className="flex flex-col">
                    <label className="text-sm text-muted-foreground mb-1.5">
                      Button Color
                    </label>
                    <input
                      type="color"
                      name="ctaColor"
                      value={templateForm.ctaColor}
                      onChange={handleChange}
                      className="h-11 w-full rounded-lg border border-border bg-transparent"
                    />
                  </div>
                </FormGrid>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <Tag className="w-5 h-5 text-primary" />
                <h3 className="text-base font-semibold text-foreground">
                  Personalization
                </h3>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-3">
                  Available Merge Tags
                </p>
                <div className="flex flex-wrap gap-2">
                  {mergeTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => insertMergeTag(tag)}
                      className="px-3 py-1.5 text-sm bg-accent text-accent-foreground rounded-md hover:bg-accent/80 transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Click any tag to insert it into your message body.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button
                variant="primary"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={handleCreateTemplate}
              >
                Save Template
              </Button>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-xl p-6 sticky top-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  <h3 className="text-base font-semibold text-foreground">
                    Live Preview
                  </h3>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPreviewDevice("mobile")}
                    className={`p-2 rounded-lg border ${
                      previewDevice === "mobile"
                        ? "border-primary text-primary bg-primary/10"
                        : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Smartphone className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDevice("desktop")}
                    className={`p-2 rounded-lg border ${
                      previewDevice === "desktop"
                        ? "border-primary text-primary bg-primary/10"
                        : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Monitor className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div
                className={`mx-auto w-full transition-all ${
                  previewDevice === "mobile"
                    ? "max-w-[280px]"
                    : "max-w-[520px]"
                }`}
              >
                <div
                  className={`border-8 border-slate-900 shadow-2xl overflow-hidden ${
                    previewDevice === "mobile" ? "rounded-3xl" : "rounded-2xl"
                  }`}
                >
                  {previewDevice === "mobile" && (
                    <div className="bg-slate-900 h-6 flex items-center justify-center">
                      <div className="bg-black w-20 h-3 rounded-full" />
                    </div>
                  )}
                  {previewDevice === "desktop" && (
                    <div className="bg-slate-900 h-7 flex items-center gap-2 px-3">
                      <span className="h-2.5 w-2.5 rounded-full bg-error" />
                      <span className="h-2.5 w-2.5 rounded-full bg-warning" />
                      <span className="h-2.5 w-2.5 rounded-full bg-success" />
                    </div>
                  )}

                  <div
                    className={`bg-white overflow-y-auto ${
                      previewDevice === "mobile" ? "h-[500px]" : "h-[420px]"
                    }`}
                  >
                    {templateForm.headerImage && (
                      <img
                        src={templateForm.headerImage}
                        alt="Header"
                        className="w-full h-32 object-cover"
                      />
                    )}

                    <div className="p-4 space-y-3">
                      {templateForm.subject && (
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">
                            Subject
                          </div>
                          <div className="font-semibold text-sm text-foreground">
                            {templateForm.subject}
                          </div>
                        </div>
                      )}

                      {templateForm.preheader && (
                        <div className="text-xs text-muted-foreground italic">
                          {templateForm.preheader}
                        </div>
                      )}

                      {(templateForm.subject || templateForm.preheader) && (
                        <div className="border-t border-border my-3" />
                      )}

                      <div className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                        {renderPreviewContent()}
                      </div>

                      {templateForm.bodyImages.length > 0 && (
                        <div className="space-y-2">
                          {templateForm.bodyImages.map((img, index) => (
                            <img
                              key={`${img}-${index}`}
                              src={img}
                              alt={`Content ${index + 1}`}
                              className="w-full max-h-40 object-cover rounded-md border border-border"
                            />
                          ))}
                        </div>
                      )}

                      {templateForm.ctaText && (
                        <button
                          type="button"
                          style={{ backgroundColor: templateForm.ctaColor }}
                          className="w-full py-2.5 text-white font-medium rounded-md mt-4"
                        >
                          {templateForm.ctaText}
                        </button>
                      )}

                      <div className="mt-6 pt-4 border-t border-border">
                        <p className="text-xs text-muted-foreground text-center">
                          {"\u00A9"} 2026 {templateForm.name || "Your Company"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {previewDevice === "mobile" && (
                    <div className="bg-slate-900 h-1.5" />
                  )}
                </div>
              </div>

              <p className="text-xs text-muted-foreground text-center mt-4">
                Updates in real time
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateSections;