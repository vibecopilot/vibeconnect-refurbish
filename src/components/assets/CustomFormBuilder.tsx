import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, PlusCircle, Trash2, GripVertical, X, Edit2, FileText } from "lucide-react";
import { CategoryField } from "../../config/assetCategorySchema";

type CustomFormSection = {
  id: string;
  title: string;
  columns: number;
  fields: CategoryField[];
};

type CustomFormTemplate = {
  id: string;
  name: string;
  sections: CustomFormSection[];
};

type CustomFormBuilderProps = {
  onFormChange: (form: CustomFormTemplate | null) => void;
};

const fieldTypeOptions = [
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "date", label: "Date" },
  { value: "textarea", label: "Text Area" },
  { value: "select", label: "Dropdown" },
];

const CustomFormBuilder: React.FC<CustomFormBuilderProps> = ({ onFormChange }) => {
  const [customForm, setCustomForm] = useState<CustomFormTemplate | null>(null);
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [showSectionDialog, setShowSectionDialog] = useState(false);
  const [showFieldDialog, setShowFieldDialog] = useState(false);
  const [currentSectionId, setCurrentSectionId] = useState<string | null>(null);

  const [formName, setFormName] = useState("");
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [newSectionColumns, setNewSectionColumns] = useState(2);

  const [newField, setNewField] = useState<Partial<CategoryField>>({
    name: "",
    label: "",
    type: "text",
    required: false,
    placeholder: "",
  });

  const handleCreateForm = () => {
    if (!formName.trim()) return;

    const form: CustomFormTemplate = {
      id: `custom-form-${Date.now()}`,
      name: formName,
      sections: [],
    };

    setCustomForm(form);
    onFormChange(form);
    setFormName("");
    setShowFormDialog(false);
  };

  const handleDeleteForm = () => {
    setCustomForm(null);
    onFormChange(null);
  };

  const handleAddSection = () => {
    if (!customForm || !newSectionTitle.trim()) return;

    const section: CustomFormSection = {
      id: `section-${Date.now()}`,
      title: newSectionTitle,
      columns: newSectionColumns,
      fields: [],
    };

    const updatedForm = {
      ...customForm,
      sections: [...customForm.sections, section],
    };

    setCustomForm(updatedForm);
    onFormChange(updatedForm);
    setNewSectionTitle("");
    setNewSectionColumns(2);
    setShowSectionDialog(false);
  };

  const handleDeleteSection = (sectionId: string) => {
    if (!customForm) return;

    const updatedForm = {
      ...customForm,
      sections: customForm.sections.filter(s => s.id !== sectionId),
    };

    setCustomForm(updatedForm);
    onFormChange(updatedForm);
  };

  const handleAddField = () => {
    if (!customForm || !currentSectionId || !newField.name || !newField.label) return;

    const updatedForm = {
      ...customForm,
      sections: customForm.sections.map(section => {
        if (section.id === currentSectionId) {
          return {
            ...section,
            fields: [...section.fields, newField as CategoryField],
          };
        }
        return section;
      }),
    };

    setCustomForm(updatedForm);
    onFormChange(updatedForm);
    setNewField({
      name: "",
      label: "",
      type: "text",
      required: false,
      placeholder: "",
    });
    setShowFieldDialog(false);
    setCurrentSectionId(null);
  };

  const handleDeleteField = (sectionId: string, fieldName: string) => {
    if (!customForm) return;

    const updatedForm = {
      ...customForm,
      sections: customForm.sections.map(section => {
        if (section.id === sectionId) {
          return {
            ...section,
            fields: section.fields.filter(f => f.name !== fieldName),
          };
        }
        return section;
      }),
    };

    setCustomForm(updatedForm);
    onFormChange(updatedForm);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="rounded-2xl border border-border bg-card p-6 shadow-sm"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-500/10 text-amber-600 flex items-center justify-center">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">Custom Form Template</h3>
            <p className="text-xs text-muted-foreground">Build your own form from scratch</p>
          </div>
        </div>

        {!customForm && (
          <button
            type="button"
            onClick={() => setShowFormDialog(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-500 text-white rounded-lg hover:from-amber-700 hover:to-amber-600 transition-all text-sm font-medium shadow-lg shadow-amber-500/20"
          >
            <Sparkles className="h-4 w-4" />
            Create Custom Form
          </button>
        )}
      </div>

      {/* Custom Form Display */}
      {!customForm ? (
        <div className="border-2 border-dashed border-border rounded-xl p-12 text-center bg-gradient-to-br from-amber-500/5 to-transparent">
          <div className="flex flex-col items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-500/10 flex items-center justify-center">
              <Sparkles className="h-8 w-8 text-amber-600" />
            </div>
            <div>
              <p className="text-base font-semibold text-foreground mb-1">No Custom Form Created</p>
              <p className="text-sm text-muted-foreground">Create your own form template with custom sections and fields</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Form Header */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-amber-600" />
              <div>
                <h4 className="font-bold text-foreground">{customForm.name}</h4>
                <p className="text-xs text-muted-foreground">{customForm.sections.length} section(s)</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowSectionDialog(true)}
                className="p-2 hover:bg-amber-500/10 rounded-lg transition-colors"
                title="Add Section"
              >
                <PlusCircle className="h-4 w-4 text-amber-600" />
              </button>
              <button
                type="button"
                onClick={handleDeleteForm}
                className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                title="Delete Form"
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </button>
            </div>
          </div>

          {/* Sections List */}
          <AnimatePresence>
            {customForm.sections.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="border-2 border-dashed border-border rounded-xl p-8 text-center"
              >
                <p className="text-sm text-muted-foreground">No sections yet. Click the + button above to add a section.</p>
              </motion.div>
            ) : (
              <div className="space-y-3">
                {customForm.sections.map((section) => (
                  <motion.div
                    key={section.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="border border-border rounded-xl p-4 bg-gradient-to-br from-amber-500/5 to-transparent"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                        <h5 className="font-semibold text-foreground">{section.title}</h5>
                        <span className="text-xs text-muted-foreground">({section.columns} columns)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setCurrentSectionId(section.id);
                            setShowFieldDialog(true);
                          }}
                          className="p-2 hover:bg-muted rounded-lg transition-colors"
                          title="Add Field"
                        >
                          <PlusCircle className="h-4 w-4 text-amber-600" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteSection(section.id)}
                          className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                          title="Delete Section"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </button>
                      </div>
                    </div>

                    {/* Fields */}
                    {section.fields.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic">No fields added yet</p>
                    ) : (
                      <div className="space-y-2">
                        {section.fields.map((field) => (
                          <div
                            key={field.name}
                            className="flex items-center justify-between bg-background rounded-lg px-3 py-2 text-sm"
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-foreground">{field.label}</span>
                              <span className="text-xs text-muted-foreground">({field.type})</span>
                              {field.required && <span className="text-xs text-destructive">*</span>}
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDeleteField(section.id, field.name)}
                              className="p-1 hover:bg-destructive/10 rounded transition-colors"
                            >
                              <X className="h-3 w-3 text-destructive" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Create Form Dialog */}
      <AnimatePresence>
        {showFormDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
            onClick={() => setShowFormDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-2xl border border-border p-6 w-full max-w-md shadow-xl"
            >
              <h3 className="text-lg font-bold text-foreground mb-4">Create Custom Form</h3>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Form Name</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g., Special Equipment Form"
                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowFormDialog(false)}
                  className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateForm}
                  className="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-500 text-white rounded-lg hover:from-amber-700 hover:to-amber-600 transition-all text-sm font-medium"
                >
                  Create Form
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Section Dialog */}
      <AnimatePresence>
        {showSectionDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
            onClick={() => setShowSectionDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-2xl border border-border p-6 w-full max-w-md shadow-xl"
            >
              <h3 className="text-lg font-bold text-foreground mb-4">Add New Section</h3>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Section Title</label>
                  <input
                    type="text"
                    value={newSectionTitle}
                    onChange={(e) => setNewSectionTitle(e.target.value)}
                    placeholder="e.g., Basic Information"
                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Number of Columns</label>
                  <select
                    value={newSectionColumns}
                    onChange={(e) => setNewSectionColumns(Number(e.target.value))}
                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  >
                    <option value={1}>1 Column</option>
                    <option value={2}>2 Columns</option>
                    <option value={3}>3 Columns</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowSectionDialog(false)}
                  className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddSection}
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm font-medium"
                >
                  Add Section
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Field Dialog */}
      <AnimatePresence>
        {showFieldDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
            onClick={() => {
              setShowFieldDialog(false);
              setCurrentSectionId(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-2xl border border-border p-6 w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto"
            >
              <h3 className="text-lg font-bold text-foreground mb-4">Add New Field</h3>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Field Name (ID)</label>
                  <input
                    type="text"
                    value={newField.name}
                    onChange={(e) => setNewField({ ...newField, name: e.target.value })}
                    placeholder="e.g., equipment_type"
                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Field Label</label>
                  <input
                    type="text"
                    value={newField.label}
                    onChange={(e) => setNewField({ ...newField, label: e.target.value })}
                    placeholder="e.g., Equipment Type"
                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Field Type</label>
                  <select
                    value={newField.type}
                    onChange={(e) => setNewField({ ...newField, type: e.target.value as any })}
                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  >
                    {fieldTypeOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Placeholder</label>
                  <input
                    type="text"
                    value={newField.placeholder}
                    onChange={(e) => setNewField({ ...newField, placeholder: e.target.value })}
                    placeholder="e.g., Enter equipment type..."
                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="required-custom"
                    checked={newField.required}
                    onChange={(e) => setNewField({ ...newField, required: e.target.checked })}
                    className="rounded border-border"
                  />
                  <label htmlFor="required-custom" className="text-sm font-medium text-foreground">Required Field</label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowFieldDialog(false);
                    setCurrentSectionId(null);
                  }}
                  className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddField}
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm font-medium"
                >
                  Add Field
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CustomFormBuilder;