import React, { useEffect, useMemo, useState } from "react";
import DataTable, { TableColumn } from "../../../../components/ui/DataTable";
import FormGrid from "../../../../components/ui/FormGrid";
import FormInput from "../../../../components/ui/FormInput";
import FormSection from "../../../../components/ui/FormSection";
import TabNavigation from "../../../../components/ui/TabNavigation";
import {
  deleteHelpDeskCategorySetup,
  editHelpDeskCategoriesSetupDetails,
  getHelpDeskCategoriesSetup,
  getHelpDeskCategoriesSetupDetails,
  getHelpDeskSubCategoriesSetup,
  getSetupUsers,
  postHelpDeskCategoriesSetup,
  postHelpDeskSubCategoriesSetup,
} from "../../../../api";
import { getItemInLocalStorage } from "../../../../utils/localStorage";
import toast from "react-hot-toast";

interface Engineer {
  id: number;
  firstname?: string;
  lastname?: string;
  user_type?: string;
}

interface Category {
  id: number;
  name?: string;
  tat?: string | number;
  assigned_to_name?: string;
  assigned_to?: string;
  Assignee?: string;
}

interface SubCategory {
  id: number;
  name?: string;
  helpdesk_category_name?: string;
}

const TicketCategoryType: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"category" | "sub-category">(
    "category"
  );
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showSubCategoryForm, setShowSubCategoryForm] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [engineers, setEngineers] = useState<Engineer[]>([]);
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(
    null
  );

  const [categoryForm, setCategoryForm] = useState({
    category: "",
    engineer: "",
    minTat: "",
  });
  const [subCategoryForm, setSubCategoryForm] = useState({
    category: "",
    tags: [] as string[],
  });
  const [tagInput, setTagInput] = useState("");

  const siteId = getItemInLocalStorage("SITEID");

  useEffect(() => {
    const fetchBaseData = async () => {
      try {
        const [catResp, subCatResp, userResp] = await Promise.all([
          getHelpDeskCategoriesSetup(),
          getHelpDeskSubCategoriesSetup(),
          getSetupUsers(),
        ]);

        setCategories(catResp?.data || []);

        const rawSub = subCatResp?.data?.sub_categories || subCatResp?.data || [];
        const sorted = Array.isArray(rawSub)
          ? [...rawSub].sort(
              (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            )
          : [];
        setSubCategories(sorted);

        const techs = (userResp?.data || []).filter(
          (user: Engineer) => user.user_type === "pms_technician"
        );
        setEngineers(techs);
      } catch (error) {
        console.error(error);
      }
    };

    fetchBaseData();
  }, []);

  const refreshCategories = async () => {
    const catResp = await getHelpDeskCategoriesSetup();
    setCategories(catResp?.data || []);
  };

  const refreshSubCategories = async () => {
    const subCatResp = await getHelpDeskSubCategoriesSetup();
    const rawSub = subCatResp?.data?.sub_categories || subCatResp?.data || [];
    setSubCategories(Array.isArray(rawSub) ? rawSub : []);
  };

  const handleCategoryInput = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setCategoryForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubCategoryInput = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setSubCategoryForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddTag = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return;
    const value = tagInput.trim();
    if (!value) return;
    event.preventDefault();
    setSubCategoryForm((prev) => ({
      ...prev,
      tags: [...prev.tags, value],
    }));
    setTagInput("");
  };

  const handleRemoveTag = (index: number) => {
    setSubCategoryForm((prev) => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index),
    }));
  };

  const handleSubmitCategory = async () => {
    if (!categoryForm.category) {
      toast.error("Please provide category");
      return;
    }

    const payload = new FormData();
    payload.append("helpdesk_category[society_id]", siteId);
    payload.append("helpdesk_category[of_phase]", "pms");
    payload.append("helpdesk_category[name]", categoryForm.category);
    payload.append("helpdesk_category[tat]", categoryForm.minTat);
    if (categoryForm.engineer) {
      payload.append("complaint_worker[assign_to][]", categoryForm.engineer);
    }

    try {
      if (isEditingCategory && editingCategoryId) {
        await editHelpDeskCategoriesSetupDetails(editingCategoryId, payload);
        toast.success("Category updated");
      } else {
        await postHelpDeskCategoriesSetup(payload);
        toast.success("Category added");
      }
      await refreshCategories();
      setShowCategoryForm(false);
      setIsEditingCategory(false);
      setEditingCategoryId(null);
      setCategoryForm({ category: "", engineer: "", minTat: "" });
    } catch (error) {
      console.error(error);
      toast.error("Failed to save category");
    }
  };

  const handleEditCategory = async (id: number) => {
    try {
      const resp = await getHelpDeskCategoriesSetupDetails(id);
      setCategoryForm({
        category: resp?.data?.name || "",
        engineer: String(resp?.data?.assigned_id || ""),
        minTat: String(resp?.data?.tat || ""),
      });
      setEditingCategoryId(id);
      setIsEditingCategory(true);
      setShowCategoryForm(true);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load category");
    }
  };

  const handleDeleteCategory = async (id: number) => {
    try {
      const payload = new FormData();
      payload.append("helpdesk_category[active]", "0");
      payload.append("id", String(id));
      await deleteHelpDeskCategorySetup(id, payload);
      toast.success("Category deleted");
      await refreshCategories();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete category");
    }
  };

  const handleSubmitSubCategory = async () => {
    if (!subCategoryForm.category || subCategoryForm.tags.length === 0) {
      toast.error("All fields are required");
      return;
    }

    const payload = new FormData();
    payload.append(
      "helpdesk_sub_category[helpdesk_category_id]",
      subCategoryForm.category
    );
    payload.append("sub_category_tags[]", subCategoryForm.tags.join(","));

    try {
      await postHelpDeskSubCategoriesSetup(payload);
      toast.success("Sub category added");
      await refreshSubCategories();
      setShowSubCategoryForm(false);
      setSubCategoryForm({ category: "", tags: [] });
      setTagInput("");
    } catch (error) {
      console.error(error);
      toast.error("Failed to add sub category");
    }
  };

  const categoryColumns: TableColumn<Category>[] = useMemo(
    () => [
      {
        key: "index",
        header: "S.No",
        render: (_val, _row, index) => index + 1,
        width: "70px",
      },
      { key: "name", header: "Category Type", render: (val) => val || "-" },
      {
        key: "assignee",
        header: "Assignee",
        render: (_val, row) =>
          row.assigned_to_name || row.assigned_to || row.Assignee || "-",
      },
      {
        key: "tat",
        header: "Response Time (Min)",
        render: (val) => val ?? "-",
      },
      {
        key: "actions",
        header: "Actions",
        render: (_val, row) => (
          <div className="flex items-center gap-2">
            <button
              className="text-primary text-sm"
              onClick={() => handleEditCategory(row.id)}
            >
              Edit
            </button>
            <button
              className="text-destructive text-sm"
              onClick={() => handleDeleteCategory(row.id)}
            >
              Delete
            </button>
          </div>
        ),
      },
    ],
    []
  );

  const subCategoryColumns: TableColumn<SubCategory>[] = useMemo(
    () => [
      {
        key: "index",
        header: "S.No",
        render: (_val, _row, index) => index + 1,
        width: "70px",
      },
      {
        key: "helpdesk_category_name",
        header: "Category Type",
        render: (val) => val || "-",
      },
      { key: "name", header: "Sub Category Type", render: (val) => val || "-" },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <TabNavigation
        tabs={[
          { id: "category", label: "Category" },
          { id: "sub-category", label: "Sub Category" },
        ]}
        activeTab={activeTab}
        onTabChange={(tabId) =>
          setActiveTab(tabId === "category" ? "category" : "sub-category")
        }
      />

      {activeTab === "category" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg"
              onClick={() => {
                setShowCategoryForm((prev) => !prev);
                setIsEditingCategory(false);
                setEditingCategoryId(null);
                setCategoryForm({ category: "", engineer: "", minTat: "" });
              }}
            >
              {showCategoryForm ? "Close" : "Add Category"}
            </button>
          </div>

          {showCategoryForm && (
            <FormSection title="Category Details">
              <FormGrid columns={3}>
                <FormInput
                  label="Category Name"
                  name="category"
                  value={categoryForm.category}
                  onChange={handleCategoryInput}
                  placeholder="Enter Category"
                />
                <FormInput
                  label="Select Engineer"
                  name="engineer"
                  type="select"
                  value={categoryForm.engineer}
                  onChange={handleCategoryInput}
                  options={engineers.map((engineer) => ({
                    value: String(engineer.id),
                    label: `${engineer.firstname || ""} ${engineer.lastname || ""}`.trim(),
                  }))}
                  placeholder="Select Engineer"
                />
                <FormInput
                  label="Response Time (Min)"
                  name="minTat"
                  type="number"
                  value={categoryForm.minTat}
                  onChange={handleCategoryInput}
                  placeholder="Response Time"
                />
              </FormGrid>
              <div className="flex items-center justify-end gap-3 mt-4">
                <button
                  type="button"
                  className="px-4 py-2 text-sm border border-border rounded-lg"
                  onClick={() => {
                    setShowCategoryForm(false);
                    setIsEditingCategory(false);
                    setEditingCategoryId(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg"
                  onClick={handleSubmitCategory}
                >
                  {isEditingCategory ? "Update" : "Save"}
                </button>
              </div>
            </FormSection>
          )}

          <DataTable columns={categoryColumns} data={categories} />
        </div>
      )}

      {activeTab === "sub-category" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg"
              onClick={() => setShowSubCategoryForm((prev) => !prev)}
            >
              {showSubCategoryForm ? "Close" : "Add Sub Category"}
            </button>
          </div>

          {showSubCategoryForm && (
            <FormSection title="Sub Category Details">
              <FormGrid columns={2}>
                <FormInput
                  label="Select Category"
                  name="category"
                  type="select"
                  value={subCategoryForm.category}
                  onChange={handleSubCategoryInput}
                  options={categories.map((category) => ({
                    value: String(category.id),
                    label: category.name || `Category ${category.id}`,
                  }))}
                  placeholder="Select Category"
                />
                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 block">
                    Sub Category Tags
                  </label>
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    placeholder="Type and press Enter"
                    className="w-full px-4 py-2.5 border rounded-lg bg-background text-foreground border-border"
                  />
                  <div className="flex flex-wrap gap-2 mt-2">
                    {subCategoryForm.tags.map((tag, index) => (
                      <span
                        key={`${tag}-${index}`}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-secondary rounded-full"
                      >
                        {tag}
                        <button
                          type="button"
                          className="text-destructive"
                          onClick={() => handleRemoveTag(index)}
                        >
                          x
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </FormGrid>

              <div className="flex items-center justify-end gap-3 mt-4">
                <button
                  type="button"
                  className="px-4 py-2 text-sm border border-border rounded-lg"
                  onClick={() => setShowSubCategoryForm(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg"
                  onClick={handleSubmitSubCategory}
                >
                  Save
                </button>
              </div>
            </FormSection>
          )}

          <DataTable columns={subCategoryColumns} data={subCategories} />
        </div>
      )}
    </div>
  );
};

export default TicketCategoryType;
