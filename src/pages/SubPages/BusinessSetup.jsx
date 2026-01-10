import React, { useEffect, useMemo, useState } from "react";
import { BiEdit } from "react-icons/bi";
import { BsEye } from "react-icons/bs";
import toast from "react-hot-toast";
import {
  getGenericCategory,
  getGenericCategoryDetails,
  getGenericSubCategory,
  postGenericCategory,
  postGenericSubCategory,
} from "../../api";
import { getItemInLocalStorage } from "../../utils/localStorage";
import ContactSetupModal from "../../containers/modals/ContactSetupModal";
import TabNavigation from "../../components/ui/TabNavigation";
import FormSection from "../../components/ui/FormSection";
import FormGrid from "../../components/ui/FormGrid";
import FormInput from "../../components/ui/FormInput";
import DataTable from "../../components/ui/DataTable";

const BusinessSetup = () => {
  const [selectedFiled, setSelectedField] = useState("category");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [catModal, setCatModal] = useState(false);
  const [catId, setCatId] = useState("");
  const [subCategories, setSubCategories] = useState([]);
  const [catAdded, setCatAdded] = useState(false);
  const [selectedCatId, setSelectedCatId] = useState("");
  const [subCategory, setSubCategory] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      const categoryResp = await getGenericCategory();
      const filteredCategory = categoryResp.data.filter(
        (item) => item.info_type === "contact"
      );
      setCategories(filteredCategory);
    };
    const fetchGenericSubCat = async () => {
      try {
        const subResp = await getGenericSubCategory();
        setSubCategories(subResp.data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchCategories();
    fetchGenericSubCat();
  }, [catModal, catAdded]);
  const companyID = getItemInLocalStorage("COMPANYID");
  const siteId = getItemInLocalStorage("SITEID");
  const HandleAddCategory = async () => {
    if (!category) {
      return toast.error("Please Enter a Category");
    }
    const formData = new FormData();
    formData.append("generic_info[name]", category);
    formData.append("generic_info[company_id]", companyID);
    formData.append("generic_info[site_id]", siteId);
    formData.append("generic_info[info_type]", "contact");
    try {
      await postGenericCategory(formData);
      setCatAdded(true);
      setCategory("");
      toast.success("Category Added Successfully");
    } catch (error) {
      console.log(error);
      toast.error("Failed to add category");
    }
  };
  const HandleAddSubCategory = async () => {
    if (!subCategory) {
      return toast.error("Please Enter a Sub Category");
    }
    const formData = new FormData();
    formData.append("generic_sub_info[generic_info_id]", selectedCatId);
    formData.append("generic_sub_info[name]", subCategory);

    try {
      await postGenericSubCategory(formData);
      setCatAdded(true);
      setSubCategory("");
      toast.success("Sub Category Added Successfully");
    } catch (error) {
      console.log(error);
      toast.error("Failed to add sub category");
    }
  };

  const handleCatModal = async (id) => {
    setCatModal(true);
    setCatId(id);
  };

  const categoryColumn = useMemo(
    () => [
      {
        key: "index",
        header: "Sr. No.",
        render: (_val, _row, index) => index + 1,
        width: "80px",
      },
      { key: "name", header: "Category", render: (val) => val || "-" },
      {
        key: "actions",
        header: "Actions",
        render: (_val, row) => (
          <button onClick={() => handleCatModal(row.id)}>
            <BiEdit size={15} />
          </button>
        ),
      },
    ],
    []
  );

  const subColumn = useMemo(
    () => [
      {
        key: "index",
        header: "Sr. No.",
        render: (_val, _row, index) => index + 1,
        width: "80px",
      },
      {
        key: "generic_info_name",
        header: "Category",
        render: (val) => val || "-",
      },
      {
        key: "name",
        header: "Sub Category",
        render: (val) => val || "-",
      },
      {
        key: "actions",
        header: "Actions",
        render: () => (
          <button className="text-muted-foreground">
            <BsEye size={15} />
          </button>
        ),
      },
    ],
    []
  );

  return (
    <section className="flex">
      <div className="w-full flex mx-3 flex-col overflow-hidden">
        <div className="flex flex-col gap-6 w-full">
          <FormSection title="Setup Categories">
            <TabNavigation
              tabs={[
                { id: "category", label: "Category" },
                { id: "subCategory", label: "Sub Category" },
              ]}
              activeTab={selectedFiled}
              onTabChange={setSelectedField}
            />

            {selectedFiled === "category" && (
              <div className="space-y-4">
                <FormGrid columns={2}>
                  <FormInput
                    label="Category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Enter Category"
                  />
                  <div className="flex items-end">
                    <button
                      className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg"
                      onClick={HandleAddCategory}
                    >
                      Add Category
                    </button>
                  </div>
                </FormGrid>

                <DataTable columns={categoryColumn} data={categories} />
              </div>
            )}

            {selectedFiled === "subCategory" && (
              <div className="space-y-4">
                <FormGrid columns={3}>
                  <FormInput
                    label="Select Category"
                    type="select"
                    value={selectedCatId}
                    onChange={(e) => setSelectedCatId(e.target.value)}
                    options={categories.map((cat) => ({
                      value: String(cat.id),
                      label: cat.name,
                    }))}
                    placeholder="Select Category"
                  />
                  <FormInput
                    label="Sub Category"
                    value={subCategory}
                    onChange={(e) => setSubCategory(e.target.value)}
                    placeholder="Enter Sub Category"
                  />
                  <div className="flex items-end">
                    <button
                      className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg"
                      onClick={HandleAddSubCategory}
                    >
                      Add Sub Category
                    </button>
                  </div>
                </FormGrid>

                <DataTable columns={subColumn} data={subCategories} />
              </div>
            )}
          </FormSection>
        </div>
      </div>
      {catModal && (
        <ContactSetupModal id={catId} onClose={() => setCatModal(false)} />
      )}
    </section>
  );
};

export default BusinessSetup;
