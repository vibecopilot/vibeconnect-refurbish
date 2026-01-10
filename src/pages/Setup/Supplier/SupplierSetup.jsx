import React, { useEffect, useMemo, useState } from "react";
import { BiEdit, BiTrash } from "react-icons/bi";
import { PiPlusCircle } from "react-icons/pi";
import {
  deleteVendorCategory,
  deleteVendorType,
  getVendorCategory,
  getVendorsType,
} from "../../../api";
import SupplierModal from "./SupplierModal";
import EditSupplierModal from "./EditSupplierModal";
import toast from "react-hot-toast";
import Breadcrumb from "../../../components/ui/Breadcrumb";
import Button from "../../../components/ui/Button";
import DataTable from "../../../components/ui/DataTable";
import FormSection from "../../../components/ui/FormSection";
import TabNavigation from "../../../components/ui/TabNavigation";

const SupplierSetup = () => {
  const [page, setPage] = useState("type");
  const [types, setTypes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [added, setAdded] = useState(false);
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [catId, setCatId] = useState("");
  const [typeId, setTypeId] = useState("");

  const typeColumns = useMemo(
    () => [
    {
      key: "index",
      header: "Sr. no.",
      render: (_val, _row, index) => index + 1,
      width: "80px",
    },
    {
      key: "name",
      header: "Type",
      sortable: true,
      render: (val) => val || "-",
    },
    {
      key: "actions",
      header: "Action",
      render: (_val, row) => (
        <div className="flex items-center gap-4">
          <button onClick={() => handleEditTypeModal(row.id)}>
            <BiEdit size={15} />
          </button>
          <button onClick={() => handleDeleteType(row.id)}>
            <BiTrash size={15} />
          </button>
        </div>
      ),
    },
  ],
    []
  );
  const catColumns = useMemo(
    () => [
    {
      key: "index",
      header: "Sr. no.",
      render: (_val, _row, index) => index + 1,
      width: "80px",
    },
    {
      key: "name",
      header: "Category",
      sortable: true,
      render: (val) => val || "-",
    },

    {
      key: "actions",
      header: "Action",
      render: (_val, row) => (
        <div className="flex items-center gap-4">
          <button onClick={() => handleEditCategoryModal(row.id)}>
            <BiEdit size={15} />
          </button>
          <button onClick={() => handleDeleteCategory(row.id)}>
            <BiTrash size={15} />
          </button>
        </div>
      ),
    },
  ],
    []
  );

  const fetchType = async () => {
    try {
      const typeRes = await getVendorsType();
      setTypes(typeRes.data.suppliers);
    } catch (error) {
      console.log(error);
    }
  };
  const fetchCategory = async () => {
    try {
      const catResp = await getVendorCategory();
      setCategories(catResp.data.categories);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchType();
    fetchCategory();
  }, [added]);
  const handleEditTypeModal = (id) => {
    setTypeId(id);
    setEditModal(true);
  };
  const handleEditCategoryModal = (id) => {
    setCatId(id);
    setEditModal(true);
  };
  const handleDeleteType = async (id) => {
    try {
      const deleteRes = await deleteVendorType(id);
      // if (deleteRes.success) {
      //   toast.success("Supplier Type Delete Successfully");
      //   setAdded(true)
      // }
      toast.success("Supplier Type Delete Successfully");
        setAdded(true)
    } catch (error) {
      console.log(error);
    }
    finally{
      setTimeout(() => {
        setAdded(false)
      }, 500);
    }
  };
  const handleDeleteCategory = async (id) => {
    try {
      const deleteRes = await deleteVendorCategory(id);
      // if (deleteRes.success) {
        toast.success("Supplier Category Delete Successfully");
        setAdded(true)
      // }
    } catch (error) {
      console.log(error);
    }
    finally{
      setTimeout(() => {
        setAdded(false)
      }, 500);
    }
  };
  return (
    <section className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Setup", path: "/setup" },
          { label: "CRM" },
          { label: "Supplier Setup" },
        ]}
      />
      <FormSection title="Supplier Setup">
        <TabNavigation
          tabs={[
            { id: "type", label: "Supplier Type" },
            { id: "category", label: "Supplier Category" },
          ]}
          activeTab={page}
          onTabChange={setPage}
        />

        <div className="flex justify-end">
          <Button
            leftIcon={<PiPlusCircle className="w-4 h-4" />}
            onClick={() => setAddModal(true)}
          >
            {page === "type" ? "Add Type" : "Add Category"}
          </Button>
        </div>

        {page === "type" && <DataTable columns={typeColumns} data={types} />}
        {page === "category" && (
          <DataTable columns={catColumns} data={categories} />
        )}
      </FormSection>
      {addModal && (
        <SupplierModal
          page={page}
          onclose={() => setAddModal(false)}
          setAdded={setAdded}
        />
      )}
      {editModal && (
        <EditSupplierModal
          page={page}
          onclose={() => setEditModal(false)}
          setAdded={setAdded}
          catId={catId}
          typeId={typeId}
        />
      )}
    </section>
  );
};

export default SupplierSetup;
