import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlusCircle, Settings2, Trash2, GripVertical, X } from "lucide-react";
import { CategoryField } from "../../config/assetCategorySchema";

type CustomSection = {
  id: string;
  title: string;
  columns: number;
  fields: CategoryField[];
};

type CustomSectionBuilderProps = {
  onSectionsChange: (sections: CustomSection[]) => void;
};

const fieldTypeOptions = [
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "date", label: "Date" },
  { value: "textarea", label: "Text Area" },
  { value: "select", label: "Dropdown" },
];

const CustomSectionBuilder: React.FC<CustomSectionBuilderProps> = ({ onSectionsChange }) => {
  const [customSections, setCustomSections] = useState<CustomSection[]>([]);
  const [showSectionDialog, setShowSectionDialog] = useState(false);
  const [showFieldDialog, setShowFieldDialog] = useState(false);
  const [currentSectionId, setCurrentSectionId] = useState<string | null>(null);

  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [newSectionColumns, setNewSectionColumns] = useState(2);

  const [newField, setNewField] = useState<Partial<CategoryField>>({
    name: "",
    label: "",
    type: "text",
    required: false,
    placeholder: "",
  });

  const handleAddSection = () => {
    if (!newSectionTitle.trim()) return;

    const section: CustomSection = {
      id: `custom-${Date.now()}`,
      title: newSectionTitle,
      columns: newSectionColumns,
      fields: [],
    };

    const updated = [...customSections, section];
    setCustomSections(updated);
    onSectionsChange(updated);
    setNewSectionTitle("");
    setNewSectionColumns(2);
    setShowSectionDialog(false);
  };

  const handleDeleteSection = (sectionId: string) => {
    const updated = customSections.filter(s => s.id !== sectionId);
    setCustomSections(updated);
    onSectionsChange(updated);
  };

  const handleAddField = () => {
    if (!currentSectionId || !newField.name || !newField.label) return;

    const updated = customSections.map(section => {
      if (section.id === currentSectionId) {
        return {
          ...section,
          fields: [...section.fields, newField as CategoryField],
        };
      }
      return section;
    });

    setCustomSections(updated);
    onSectionsChange(updated);
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
    const updated = customSections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          fields: section.fields.filter(f => f.name !== fieldName),
        };
      }
      return section;
    });

    setCustomSections(updated);
    onSectionsChange(updated);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="rounded-2xl border border-border bg-card p-6 shadow-sm"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-500/10 text-purple-600 flex items-center justify-center">
            <Settings2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">Custom Sections</h3>
            <p className="text-xs text-muted-foreground">Add your own sections and fields</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowSectionDialog(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
        >
          <PlusCircle className="h-4 w-4" />
          Add Section
        </button>
      </div>

      {/* Custom Sections List */}
      <AnimatePresence>
        {customSections.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="border-2 border-dashed border-border rounded-xl p-8 text-center"
          >
            <p className="text-sm text-muted-foreground">No custom sections yet. Click "Add Section" to create one.</p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {customSections.map((section) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="border border-border rounded-xl p-4 bg-gradient-to-br from-purple-500/5 to-transparent"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    <h4 className="font-semibold text-foreground">{section.title}</h4>
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
                    >
                      <PlusCircle className="h-4 w-4 text-purple-600" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteSection(section.id)}
                      className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
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
                    placeholder="e.g., Additional Details"
                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Number of Columns</label>
                  <select
                    value={newSectionColumns}
                    onChange={(e) => setNewSectionColumns(Number(e.target.value))}
                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
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
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
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
                    placeholder="e.g., custom_field_1"
                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Field Label</label>
                  <input
                    type="text"
                    value={newField.label}
                    onChange={(e) => setNewField({ ...newField, label: e.target.value })}
                    placeholder="e.g., Custom Field"
                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Field Type</label>
                  <select
                    value={newField.type}
                    onChange={(e) => setNewField({ ...newField, type: e.target.value as any })}
                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
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
                    placeholder="e.g., Enter value..."
                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="required"
                    checked={newField.required}
                    onChange={(e) => setNewField({ ...newField, required: e.target.checked })}
                    className="rounded border-border"
                  />
                  <label htmlFor="required" className="text-sm font-medium text-foreground">Required Field</label>
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
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
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

export default CustomSectionBuilder;