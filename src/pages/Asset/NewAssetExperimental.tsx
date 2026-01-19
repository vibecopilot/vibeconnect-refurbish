import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, PlusCircle } from "lucide-react";
import CategorySelector from "../../components/assets/CategorySelector";
import CategoryFormRenderer from "../../components/assets/CategoryFormRenderer";
import NewAssetAttachments from "../../components/assets/NewAssetAttachments";
import CustomSectionBuilder from "../../components/assets/CustomSectionBuilder";
import CustomFormBuilder from "../../components/assets/CustomFormBuilder";
import { assetCategories, findCategoryById, AssetCategory } from "../../config/assetCategorySchema";

const NewAssetExperimental: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMeterPath = location.pathname.includes("/asset/meter/create");

  const defaultCategoryId = useMemo(() => {
    if (isMeterPath) return "meter";
    return assetCategories[0]?.id;
  }, [isMeterPath]);

  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(defaultCategoryId);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [customSections, setCustomSections] = useState<any[]>([]);
  const [customFormTemplate, setCustomFormTemplate] = useState<any>(null);
  const [isCustomFormMode, setIsCustomFormMode] = useState(false);

  const category = findCategoryById(selectedCategory || "");

  // Merge predefined category with custom sections
  const enhancedCategory = category ? {
    ...category,
    sections: [...category.sections, ...customSections]
  } : undefined;

  // Use custom form if it exists, otherwise use enhanced category
  const activeFormCategory = customFormTemplate ? {
    id: customFormTemplate.id,
    label: customFormTemplate.name,
    sections: customFormTemplate.sections
  } : enhancedCategory;

  const handleSelectCategory = (id: string) => {
    setSelectedCategory(id);
    setFormValues({});
    setIsCustomFormMode(false);
    setCustomFormTemplate(null);
  };

  const handleCustomFormSelect = () => {
    setIsCustomFormMode(true);
    setSelectedCategory(undefined);
  };

  const handleChange = (name: string, value: any) => {
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const pageTitle = "Create New Asset";
  const handleCancel = () => navigate(-1);

  const handleSave = () => {
    // Placeholder: integrate API once ready
    console.log("Submit payload", {
      category: category?.id,
      values: formValues,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 bg-background/95 backdrop-blur-sm border-b z-20">
        <div className="w-full px-6 py-3">
          <div className="flex items-center gap-4">
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <div className="h-8 w-px bg-border" />
            <div>
              <h1 className="text-lg font-bold text-foreground">{pageTitle}</h1>
              <p className="text-xs text-muted-foreground">
                {category ? `Creating ${category.label} asset` : "Select a category to begin"}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-4 space-y-4">
        {/* Category selector with custom form option */}
        <CategorySelector
          categories={assetCategories}
          selectedId={selectedCategory}
          onSelect={handleSelectCategory}
          onCustomFormSelect={handleCustomFormSelect}
          isCustomFormActive={isCustomFormMode}
        />

        {/* Show custom form builder only when custom form mode is active */}
        {isCustomFormMode && (
          <CustomFormBuilder onFormChange={setCustomFormTemplate} />
        )}

        {/* Render the active form (custom or category-based) */}
        <CategoryFormRenderer category={activeFormCategory} values={formValues} onChange={handleChange} />

        {/* Only show custom section builder if using a category-based form, not custom form */}
        {!isCustomFormMode && (
          <CustomSectionBuilder onSectionsChange={setCustomSections} />
        )}

        <NewAssetAttachments />

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pb-6">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors text-sm font-medium"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
          >
            <Save className="h-4 w-4" />
            Save & Show Details
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors text-sm font-medium"
          >
            <PlusCircle className="h-4 w-4" />
            Save & Create New
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewAssetExperimental;
