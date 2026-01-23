import React, { useEffect, useState } from "react";
import { BiEdit } from "react-icons/bi";
import { FaCheck, FaTrash } from "react-icons/fa";
import { PiPlusCircle } from "react-icons/pi";
import { MdClose } from "react-icons/md";
import Table from "../../../components/table/Table";
import { getItemInLocalStorage } from "../../../utils/localStorage";
import toast from "react-hot-toast";
// TODO: Import API functions when available
// import { getComplianceCategories, postComplianceCategory, deleteComplianceCategory, updateComplianceCategory } from "../../../api";

interface ComplianceCategory {
  id: number;
  name: string;
  description?: string;
  active: boolean;
  parent_id?: number | null;
  level: number; // 1 = Category, 2 = SubCategory, 3 = SubSubCategory
  created_at?: string;
  updated_at?: string;
}

const ComplianceCategoriesSetup: React.FC = () => {
  const [addCategory, setAddCategory] = useState(false);
  const [editCategory, setEditCategory] = useState<ComplianceCategory | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [parentCategory, setParentCategory] = useState<number | null>(null);
  const [level, setLevel] = useState<number>(1);
  const companyId = getItemInLocalStorage("COMPANYID");
  const [categories, setCategories] = useState<ComplianceCategory[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const res = await getComplianceCategories();
      // setCategories(res.data);
      
      // Static placeholder - remove when API is ready
      setCategories([]);
    } catch (error) {
      console.log(error);
      toast.error("Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = async () => {
    if (!name.trim()) {
      toast.error("Category name is required");
      return;
    }

    const payload = {
      name: name.trim(),
      description: description.trim() || null,
      active: true,
      parent_id: parentCategory || null,
      level: level,
      resource_id: companyId,
      resource_type: "Pms::CompanySetup",
    };

    try {
      // TODO: Replace with actual API call
      // if (editCategory) {
      //   await updateComplianceCategory(editCategory.id, payload);
      //   toast.success("Category updated successfully!");
      // } else {
      //   await postComplianceCategory(payload);
      //   toast.success("Category created successfully!");
      // }
      
      // Static placeholder - add to local state
      if (editCategory) {
        setCategories(categories.map(cat => 
          cat.id === editCategory.id 
            ? { ...cat, name, description: description || undefined, parent_id: parentCategory, level }
            : cat
        ));
        toast.success("Category updated successfully!");
      } else {
        const newCategory: ComplianceCategory = {
          id: categories.length + 1,
          name: name.trim(),
          description: description.trim() || undefined,
          active: true,
          parent_id: parentCategory,
          level: level,
        };
        setCategories([...categories, newCategory]);
        toast.success("Category created successfully!");
      }
      
      // Reset form
      setName("");
      setDescription("");
      setParentCategory(null);
      setLevel(1);
      setAddCategory(false);
      setEditCategory(null);
    } catch (error) {
      console.log(error);
      toast.error(editCategory ? "Failed to update category" : "Failed to create category");
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this category?")) {
      return;
    }

    try {
      // TODO: Replace with actual API call
      // await deleteComplianceCategory(id);
      // toast.success("Category deleted successfully");
      // fetchCategories();
      
      // Static placeholder - remove from local state
      setCategories(categories.filter(cat => cat.id !== id));
      toast.success("Category deleted successfully");
    } catch (error) {
      console.log(error);
      toast.error("Failed to delete category");
    }
  };

  const handleEditCategory = (category: ComplianceCategory) => {
    setEditCategory(category);
    setName(category.name);
    setDescription(category.description || "");
    setParentCategory(category.parent_id || null);
    setLevel(category.level);
    setAddCategory(true);
  };

  const handleCancel = () => {
    setAddCategory(false);
    setEditCategory(null);
    setName("");
    setDescription("");
    setParentCategory(null);
    setLevel(1);
  };

  // Get parent categories for dropdown (only categories at level 1 and 2 can be parents)
  const parentCategories = categories.filter(cat => cat.level < 3);

  const columns = [
    { 
      name: "Name", 
      selector: (row: ComplianceCategory) => row.name, 
      sortable: true 
    },
    { 
      name: "Level", 
      selector: (row: ComplianceCategory) => {
        if (row.level === 1) return "Category";
        if (row.level === 2) return "SubCategory";
        if (row.level === 3) return "SubSubCategory";
        return `Level ${row.level}`;
      }, 
      sortable: true 
    },
    { 
      name: "Parent Category", 
      selector: (row: ComplianceCategory) => {
        if (!row.parent_id) return "-";
        const parent = categories.find(cat => cat.id === row.parent_id);
        return parent?.name || "-";
      }, 
      sortable: false 
    },
    { 
      name: "Status", 
      selector: (row: ComplianceCategory) => row.active ? "Active" : "Inactive", 
      sortable: true 
    },
    {
      name: "Action",
      cell: (row: ComplianceCategory) => (
        <div className="flex items-center gap-2">
          <button 
            onClick={() => handleEditCategory(row)} 
            className="text-blue-500 hover:text-blue-700"
          >
            <BiEdit size={15} />
          </button>
          <button 
            onClick={() => handleDeleteCategory(row.id)} 
            className="text-muted-foreground hover:text-destructive"
          >
            <FaTrash size={15} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <section className="mx-2">
      <div className="w-full flex flex-col gap-2 overflow-hidden">
        <div className="flex justify-end">
          {addCategory && (
            <div className="flex flex-col gap-3 w-full border border-border rounded-lg p-4 bg-card">
              <h3 className="text-lg font-semibold text-foreground">
                {editCategory ? "Edit Category" : "Add Category"}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Category Name <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter category name"
                    className="border p-2 w-full border-border rounded-lg bg-background text-foreground"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Level
                  </label>
                  <select
                    className="border p-2 w-full border-border rounded-lg bg-background text-foreground"
                    value={level}
                    onChange={(e) => setLevel(Number(e.target.value))}
                  >
                    <option value={1}>Category</option>
                    <option value={2}>SubCategory</option>
                    <option value={3}>SubSubCategory</option>
                  </select>
                </div>

                {level > 1 && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Parent Category
                    </label>
                    <select
                      className="border p-2 w-full border-border rounded-lg bg-background text-foreground"
                      value={parentCategory || ""}
                      onChange={(e) => setParentCategory(e.target.value ? Number(e.target.value) : null)}
                    >
                      <option value="">Select Parent Category</option>
                      {parentCategories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Description
                  </label>
                  <textarea
                    placeholder="Enter description (optional)"
                    className="border p-2 w-full border-border rounded-lg bg-background text-foreground"
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  className="px-4 py-2 text-sm border border-border rounded-lg text-foreground hover:bg-muted inline-flex items-center gap-2"
                  onClick={handleCancel}
                >
                  <MdClose /> Cancel
                </button>
                <button
                  className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg inline-flex items-center gap-2"
                  onClick={handleAddCategory}
                >
                  <FaCheck /> {editCategory ? "Update" : "Submit"}
                </button>
              </div>
            </div>
          )}
          {!addCategory && (
            <button
              className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg inline-flex items-center gap-2"
              onClick={() => setAddCategory(true)}
            >
              <PiPlusCircle /> Add Category
            </button>
          )}
        </div>
        <div>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : (
            <Table columns={columns} data={categories} isPagination={true} />
          )}
        </div>
      </div>
    </section>
  );
};

export default ComplianceCategoriesSetup;
