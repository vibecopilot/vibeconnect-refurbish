import React, { useEffect, useMemo, useState } from "react";
import { IoAddCircleOutline } from "react-icons/io5";
import { BiEdit } from "react-icons/bi";
import { RiDeleteBin5Line } from "react-icons/ri";
import AddVisitorSetupModal from "../../containers/modals/AddVisitorSetupModal";
import EditVisitorSetupModal from "../../containers/modals/EditVisitorSetupModal";
import { getVisitorCategory, deleteVisitorCategory } from "../../api";
import toast from "react-hot-toast";
import VehicleParkingSetup from "./VehicleParkingSetupModal/VehicleParkingSetup";
import DeviceConfiguration from "./VehicleParkingSetupModal/DeviceConfiguration";
import Breadcrumb from "../../components/ui/Breadcrumb";
import Button from "../../components/ui/Button";
import DataTable from "../../components/ui/DataTable";
import FormGrid from "../../components/ui/FormGrid";
import FormInput from "../../components/ui/FormInput";
import FormSection from "../../components/ui/FormSection";
import TabNavigation from "../../components/ui/TabNavigation";
function VisitorSetup() {
  const [page, setPage] = useState("deviceConfig");
  const [searchText, setSearchText] = useState("");
  const [visitorSetupModal, setVisitorSetupModal] = useState(false);
  const [editVisitorSetupModal, setEditVisitorSetupModal] = useState(false);
  const [categories, setCategories] = useState([]);
  const [catId, setCatId] = useState("");
  const [added, setAdded] = useState(false);
  const columns = useMemo(
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
            <button onClick={() => handleEditCategory(row.id)}>
              <BiEdit size={15} />
            </button>
            <button onClick={() => handleCategoryDelete(row.id)}>
              <RiDeleteBin5Line size={15} />
            </button>
          </div>
        ),
      },
    ],
    []
  );
  const [filteredData, setFilteredData] = useState([]);

  const getVisitor = async () => {
    try {
      const visitorRes = await getVisitorCategory();
      setCategories(visitorRes.data.categories);
      setFilteredData(visitorRes.data.categories);
      console.log(visitorRes);
    } catch (error) {
      console.log(error);
    }
  };

  const filteredCategories = useMemo(() => {
    if (!searchText) return filteredData;
    const needle = searchText.toLowerCase();
    return filteredData.filter((items) =>
      items.name?.toLowerCase().includes(needle)
    );
  }, [filteredData, searchText]);

  const handleCategoryDelete = async (id) => {
    try {
      const deleteRes = await deleteVisitorCategory(id);
      toast.success("Visitor Category Delete Successfully");
      setAdded(true);
    } catch (error) {
      console.log(error);
    } finally {
      setTimeout(() => {
        setAdded(false);
      }, 500);
    }
  };

  useEffect(() => {
    getVisitor();
  }, [added]);

  const handleEditCategory = (id) => {
    setCatId(id);
    setEditVisitorSetupModal(true);
  };
  return (
    <section className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Setup", path: "/setup" },
          { label: "CRM" },
          { label: "Visitor Setup" },
        ]}
      />
      <FormSection title="Visitor Setup">
        <TabNavigation
          tabs={[
            { id: "deviceConfig", label: "Device Configuration" },
            { id: "visitor", label: "Staff Category" },
            { id: "vehicleParking", label: "Parking Slot" },
          ]}
          activeTab={page}
          onTabChange={setPage}
        />

        {page === "visitor" ? (
          <div className="space-y-4">
            <FormGrid columns={2}>
              <FormInput
                label="Search"
                name="search"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search by name or category"
              />
              <div className="flex items-end justify-end">
                <Button
                  leftIcon={<IoAddCircleOutline className="w-4 h-4" />}
                  onClick={() => setVisitorSetupModal(true)}
                >
                  Add
                </Button>
              </div>
            </FormGrid>
            <DataTable columns={columns} data={filteredCategories} />
            {visitorSetupModal && (
              <AddVisitorSetupModal
                setAdded={setAdded}
                onclose={() => setVisitorSetupModal(false)}
              />
            )}
            {editVisitorSetupModal && (
              <EditVisitorSetupModal
                catId={catId}
                setAdded={setAdded}
                onclose={() => setEditVisitorSetupModal(false)}
              />
            )}
          </div>
        ) : page === "vehicleParking" ? (
          <VehicleParkingSetup />
        ) : (
          <DeviceConfiguration />
        )}
      </FormSection>
    </section>
  );
}

export default VisitorSetup;
