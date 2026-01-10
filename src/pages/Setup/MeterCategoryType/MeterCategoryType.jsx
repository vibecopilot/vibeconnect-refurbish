import React, { useMemo, useState } from "react";
import { PiPlusCircle } from "react-icons/pi";
import { BiEdit } from "react-icons/bi";
import AddGroupMeterCategoryTypeModal from "./AddGroupMeterCategoryTypeModal";
import EditGroupMeterCategoryTypeModal from "./EditGroupMeterCategoryTypeModal";
import AddSubGroupMeterCategoryTypeModal from "./AddSubGroupMeterCategoryTypeModal";
import EditSubGroupMeterCategoryTypeModal from "./EditSubGroupMeterCategoryTypeModal";
import AddSubSubGroupMeterCategoryTypeModal from "./AddSubSubGroupMeterCategoryTypeModal";
import EditSubSubGroupMeterCategoryTypeModal from "./EditSubSubGroupMeterCategoryTypeModal";
import Breadcrumb from "../../../components/ui/Breadcrumb";
import Button from "../../../components/ui/Button";
import DataTable from "../../../components/ui/DataTable";
import FormSection from "../../../components/ui/FormSection";

function MeterCategoryType() {
  const [addGroupModal, setAddGroupModal] = useState(false);
  const [editGroupModal, setEditGroupModal] = useState(false);
  const [addSubGroupModal, setAddSubGroupModal] = useState(false);
  const [editSubGroupModal, setEditSubGroupModal] = useState(false);
  const [addSubSubGroupModal, setAddSubSubGroupModal] = useState(false);
  const [editSubSubGroupModal, setEditSubSubGroupModal] = useState(false);
  const meterColumns = useMemo(
    () => [
    {
      key: "srNo",
      header: "Sr. No",
      sortable: true,
      render: (val) => val ?? "-",
      width: "80px",
    },
    {
      key: "name",
      header: "Group Name",
      sortable: true,
      render: (val) => val || "-",
    },
    // {
    //   name: "Description",
    //   selector: (row) => row.description,
    //   sortable: true,
    // },
    {
      key: "actions",
      header: "Action",
      render: (_val, row) => (
        <div className="flex items-center gap-4">
          <button onClick={() => setEditGroupModal(!editGroupModal)}>
            <BiEdit size={15} />
          </button>
        </div>
      ),
    },
  ],
    [editGroupModal]
  );

  const meterData = [
    {
      srNo: 1,
      name: "Board",
    },
    {
      srNo: 2,
      name: "DG",
    },
    {
      srNo: 3,
      name: "Renewable",
    },
    {
      srNo: 4,
      name: "Fresh Water",
    },
    {
      srNo: 5,
      name: "Recycled",
    },
  ];

  const subMeterColumns = useMemo(
    () => [
    {
      key: "srNo",
      header: "Sr. No",
      sortable: true,
      render: (val) => val ?? "-",
      width: "80px",
    },
    {
      key: "name",
      header: "Group Name",
      sortable: true,
      render: (val) => val || "-",
    },
    {
      key: "subGroupName",
      header: "Sub Group Name",
      sortable: true,
      render: (val) => val || "-",
    },
    // {
    //   name: "Description",
    //   selector: (row) => row.description,
    //   sortable: true,
    // },
    {
      key: "actions",
      header: "Action",
      render: (_val, row) => (
        <div className="flex items-center gap-4">
          <button onClick={() => setEditSubGroupModal(!editSubGroupModal)}>
            <BiEdit size={15} />
          </button>
        </div>
      ),
    },
  ],
    [editSubGroupModal]
  );

  const subMeterData = [
    {
      srNo: 1,
      name: "Board",
      subGroupName: "HT",
    },
    {
      srNo: 2,
      name: "Board",
      subGroupName: "VCB",
    },
    {
      srNo: 3,
      name: "Board",
      subGroupName: "Transformer",
    },
    {
      srNo: 4,
      name: "Board",
      subGroupName: "LT",
    },
    {
      srNo: 5,
      name: "DG",
      subGroupName: "Solar",
    },
    {
      srNo: 6,
      name: "DG",
      subGroupName: "Bio Methanol",
    },
    {
      srNo: 7,
      name: "DG",
      subGroupName: "Wind",
    },
    {
      srNo: 8,
      name: "Fresh Water",
      subGroupName: "Source (Input)",
    },
    {
      srNo: 9,
      name: "Fresh Water",
      subGroupName: "Destination (Output)",
    },
  ];
  const subSubMeterColumns = useMemo(
    () => [
    {
      key: "srNo",
      header: "Sr. No",
      sortable: true,
      render: (val) => val ?? "-",
      width: "80px",
    },
    {
      key: "name",
      header: "Group Name",
      sortable: true,
      render: (val) => val || "-",
    },
    {
      key: "subGroupName",
      header: "Sub Group Name",
      sortable: true,
      render: (val) => val || "-",
    },
    {
      key: "subSubGroupName",
      header: "Sub Sub Group Name",
      sortable: true,
      render: (val) => val || "-",
    },
    // {
    //   name: "Description",
    //   selector: (row) => row.description,
    //   sortable: true,
    // },
    {
      key: "actions",
      header: "Action",
      render: (_val, row) => (
        <div className="flex items-center gap-4">
          <button
            onClick={() => setEditSubSubGroupModal(!editSubSubGroupModal)}
          >
            <BiEdit size={15} />
          </button>
        </div>
      ),
    },
  ],
    [editSubSubGroupModal]
  );

  const subSubMeterData = [
    {
      srNo: 1,
      name: "Fresh Water",
      subGroupName: "Source (Input)",
      subSubGroupName: "Municipal Corporation",
    },
    {
      srNo: 2,
      name: "Fresh Water",
      subGroupName: "Source (Input)",
      subSubGroupName: "Tanker",
    },
    {
      srNo: 3,
      name: "Fresh Water",
      subGroupName: "Source (Input)",
      subSubGroupName: "Borewell",
    },
    {
      srNo: 4,
      name: "Fresh Water",
      subGroupName: "Source (Input)",
      subSubGroupName: "Rainwater",
    },
  ];
  return (
    <section className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Setup", path: "/setup" },
          { label: "FM Module" },
          { label: "Meter Category Type" },
        ]}
      />
      <FormSection title="Meter Category Type">
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h2 className="font-medium text-lg">Category Type</h2>
              <Button
                leftIcon={<PiPlusCircle className="w-4 h-4" />}
                onClick={() => setAddGroupModal(!addGroupModal)}
              >
                Add Category Type
              </Button>
            </div>
            <DataTable columns={meterColumns} data={meterData} />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h2 className="font-medium text-lg">Sub Category Type</h2>
              <Button
                leftIcon={<PiPlusCircle className="w-4 h-4" />}
                onClick={() => setAddSubGroupModal(!addSubGroupModal)}
              >
                Add Sub Category Type
              </Button>
            </div>
            <DataTable columns={subMeterColumns} data={subMeterData} />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h2 className="font-medium text-lg">Sub Sub Meter Type Category</h2>
              <Button
                leftIcon={<PiPlusCircle className="w-4 h-4" />}
                onClick={() => setAddSubSubGroupModal(!addSubSubGroupModal)}
              >
                Add Sub Sub Category Type
              </Button>
            </div>
            <DataTable columns={subSubMeterColumns} data={subSubMeterData} />
          </div>
        </div>
      </FormSection>

      {addGroupModal && (
        <AddGroupMeterCategoryTypeModal
          onclose={() => setAddGroupModal(false)}
        />
      )}
      {editGroupModal && (
        <EditGroupMeterCategoryTypeModal
          onclose={() => setEditGroupModal(false)}
        />
      )}
      {addSubGroupModal && (
        <AddSubGroupMeterCategoryTypeModal
          onclose={() => setAddSubGroupModal(false)}
        />
      )}
      {editSubGroupModal && (
        <EditSubGroupMeterCategoryTypeModal
          onclose={() => setEditSubGroupModal(false)}
        />
      )}
      {addSubSubGroupModal && (
        <AddSubSubGroupMeterCategoryTypeModal
          onclose={() => setAddSubSubGroupModal(false)}
        />
      )}
      {editSubSubGroupModal && (
        <EditSubSubGroupMeterCategoryTypeModal
          onclose={() => setEditSubSubGroupModal(false)}
        />
      )}
    </section>
  );
}

export default MeterCategoryType;
