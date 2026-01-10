import React, { useEffect, useState } from "react";
import { BsEye } from "react-icons/bs";
import { BiEdit } from "react-icons/bi";
import { Link } from "react-router-dom";
import Table from "../../../components/table/Table";
import { RiDeleteBinLine } from "react-icons/ri";
import IncidenceStatusSetupModal from "../../../containers/modals/IncidentSetupModal.jsx/IncidentStatusSetupModal";
import { FaCheck, FaTrash } from "react-icons/fa";
import { MdClose } from "react-icons/md";
import { PiPlusCircle } from "react-icons/pi";
import { getItemInLocalStorage } from "../../../utils/localStorage";
import { getIncidentTags, postIncidentTags } from "../../../api";
import toast from "react-hot-toast";

const IncidenceStatusSetup = () => {
  const [modal, showModal] = useState(false);
  const column = [
    { name: "Status", selector: (row) => row.name, sortable: true },
    {
      name: "action",

      cell: (row) => (
        <div className="flex items-center gap-4">
          <button onClick={() => showModal(true)} className="text-blue-500">
            <BiEdit size={15} />
          </button>

          <button className="text-muted-foreground hover:text-foreground">
            <FaTrash size={15} />
          </button>
        </div>
      ),
    },
  ];
  const [addStatus, setAddStatus] = useState(false);
  const [status, setStatus] = useState("")
  const companyId = getItemInLocalStorage("COMPANYID");
  const handleAddStatus = async () => {
    const payload = {
      name: status,
      active: true,
      // "parent_id": null,
      tag_type: "IncidentStatus",
      resource_id: companyId,
      resource_type: "Pms::CompanySetup",
      // "comment": "Covers all types of plumbing problems."
    };
    try {
      const res = await postIncidentTags(payload);
      toast.success("Incident Status Created successfully!");
      fetchIncidentStatus();
      setStatus("");
      setAddStatus(false);
    } catch (error) {
      console.log(error);
    }
  };
  const [statuses, setStatuses] = useState([]);
  const fetchIncidentStatus = async () => {
    try {
      const res = await getIncidentTags("IncidentStatus");
      setStatuses(res.data);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    fetchIncidentStatus();
  }, []);
  return (
    <section className="mx-2">
      <div className="w-full flex flex-col gap-2 overflow-hidden">
        <div className="flex justify-end">
          {addStatus && (
            <div className="flex items-center gap-2 w-full">
              <input
                type="text"
                placeholder="Status"
                className="border p-2 w-full border-gray-300 rounded-lg"
                value={status}
                onChange={(e)=>setStatus(e.target.value)}
              />
              <button className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg inline-flex items-center gap-2" onClick={handleAddStatus}>
                <FaCheck /> Submit
              </button>
              <button
                className="px-4 py-2 text-sm border border-border rounded-lg text-foreground hover:bg-muted inline-flex items-center gap-2"
                onClick={() => setAddStatus(false)}
              >
                <MdClose /> Cancel
              </button>
            </div>
          )}
          {!addStatus && (
            <button
              className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg inline-flex items-center gap-2"
              onClick={() => setAddStatus(true)}
            >
              <PiPlusCircle /> Add
            </button>
          )}
        </div>
        <div>
          <Table columns={column} data={statuses} isPagination={true} />
        </div>
      </div>
      {modal && <IncidenceStatusSetupModal onclose={() => showModal(false)} />}
    </section>
  );
};

export default IncidenceStatusSetup;

