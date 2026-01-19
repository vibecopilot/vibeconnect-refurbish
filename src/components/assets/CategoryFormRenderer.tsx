import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, AlertCircle } from "lucide-react";
import { AssetCategory, CategoryField } from "../../config/assetCategorySchema";

type CategoryFormRendererProps = {
  category?: AssetCategory;
  values: Record<string, any>;
  onChange: (name: string, value: any) => void;
};

const cn = (...classes: (string | boolean | undefined)[]) => {
  return classes.filter(Boolean).join(' ');
};

const renderField = (field: CategoryField, value: any, onChange: (name: string, value: any) => void) => {
  const baseInputClass = "w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary";

  if (field.type === "textarea") {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground flex items-center gap-2">
          {field.label}
          {field.required && <span className="text-destructive">*</span>}
        </label>
        <textarea
          name={field.name}
          value={value || ""}
          onChange={(e) => onChange(field.name, e.target.value)}
          placeholder={field.placeholder}
          className={baseInputClass}
          rows={3}
        />
      </div>
    );
  }

  if (field.type === "select") {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground flex items-center gap-2">
          {field.label}
          {field.required && <span className="text-destructive">*</span>}
        </label>
        <select
          name={field.name}
          value={value || ""}
          onChange={(e) => onChange(field.name, e.target.value)}
          className={baseInputClass}
        >
          <option value="">{field.placeholder || "Select"}</option>
          {field.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground flex items-center gap-2">
        {field.label}
        {field.required && <span className="text-destructive">*</span>}
      </label>
      <input
        type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
        name={field.name}
        value={value || ""}
        onChange={(e) => onChange(field.name, e.target.value)}
        placeholder={field.placeholder}
        className={baseInputClass}
      />
    </div>
  );
};

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const CategoryFormRenderer: React.FC<CategoryFormRendererProps> = ({ category, values, onChange }) => {
  if (!category) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl border-2 border-dashed border-border bg-muted/30 p-12 text-center"
      >
        <div className="flex flex-col items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <p className="text-lg font-semibold text-foreground mb-1">No Category Selected</p>
            <p className="text-sm text-muted-foreground">Please select a category above to start filling in the details</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={category.id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="space-y-6"
      >
        {category.sections.map((section, idx) => (
          <motion.div
            key={section.title}
            variants={sectionVariants}
            initial="hidden"
            animate="show"
            transition={{ delay: idx * 0.1 }}
            className="rounded-2xl border border-border bg-card p-6 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground">{section.title}</h3>
                <p className="text-xs text-muted-foreground">Fill in the required information</p>
              </div>
            </div>

            <div className={cn(
              "grid gap-6",
              section.columns === 1 ? "grid-cols-1" :
              section.columns === 2 ? "grid-cols-1 md:grid-cols-2" :
              "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            )}>
              {section.fields.map((field) => (
                <div key={field.name}>{renderField(field, values[field.name], onChange)}</div>
              ))}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </AnimatePresence>
  );
};

export default CategoryFormRenderer;
