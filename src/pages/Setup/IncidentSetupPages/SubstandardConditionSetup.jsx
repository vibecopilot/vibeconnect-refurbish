import React, { useEffect, useState } from "react";
import { BiEdit } from "react-icons/bi";
import { FaCheck, FaTrash } from "react-icons/fa";
import { PiPlusCircle } from "react-icons/pi";
import { MdClose } from "react-icons/md";
import Table from "../../../components/table/Table";
import { getItemInLocalStorage } from "../../../utils/localStorage";
import toast from "react-hot-toast";
import { getIncidentTags, postIncidentTags, deleteIncidentTags } from "../../../api";

const SubstandardConditionSetup = () => {
  const [addItem, setAddItem] = useState(false);
  const [name, setName] = useState("");
  const companyId = getItemInLocalStorage("COMPANYID");
  const [items, setItems] = useState([]);

  const handleAddItem = async () => {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    const payload = {
      name: name,
      active: true,
      tag_type: "IncidentSubstandardCondition",
      resource_id: companyId,
      resource_type: "Pms::CompanySetup",
    };
    try {
      // TODO: Replace with actual API call
      // const res = await postIncidentTags(payload);
      // toast.success("Substandard Condition created successfully!");
      // fetchItems();
      // setName("");
      // setAddItem(false);
      
      // Static placeholder - add to local state
      const newItem = {
        id: items.length + 1,
        name: name,
        active: true,
      };
      setItems([...items, newItem]);
      toast.success("Substandard Condition created successfully!");
      setName("");
      setAddItem(false);
    } catch (error) {
      console.log(error);
      toast.error("Failed to create Substandard Condition");
    }
  };

  const handleDeleteItem = async (id) => {
    try {
      // TODO: Replace with actual API call
      // await deleteIncidentTags(id);
      // toast.success("Substandard Condition deleted successfully");
      // fetchItems();
      
      // Static placeholder - remove from local state
      setItems(items.filter(item => item.id !== id));
      toast.success("Substandard Condition deleted successfully");
    } catch (error) {
      console.log(error);
      toast.error("Failed to delete Substandard Condition");
    }
  };

  const fetchItems = async () => {
    try {
      // TODO: Replace with actual API call
      // const res = await getIncidentTags("IncidentSubstandardCondition");
      // setItems(res.data);
      
      // Static placeholder data
      setItems([]);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const columns = [
    { name: "Name", selector: (row) => row.name, sortable: true },
    {
      name: "Action",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <button 
            onClick={() => {
              // TODO: Implement edit functionality
              toast.info("Edit functionality will be implemented");
            }} 
            className="text-blue-500 hover:text-blue-700"
          >
            <BiEdit size={15} />
          </button>
          <button 
            onClick={() => handleDeleteItem(row.id)} 
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
          {addItem && (
            <div className="flex items-center gap-2 w-full">
              <input
                type="text"
                placeholder="Substandard Condition Name"
                className="border p-2 w-full border-gray-300 rounded-lg"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <button
                className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg inline-flex items-center gap-2"
                onClick={handleAddItem}
              >
                <FaCheck /> Submit
              </button>
              <button
                className="px-4 py-2 text-sm border border-border rounded-lg text-foreground hover:bg-muted inline-flex items-center gap-2"
                onClick={() => {
                  setAddItem(false);
                  setName("");
                }}
              >
                <MdClose /> Cancel
              </button>
            </div>
          )}
          {!addItem && (
            <button
              className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg inline-flex items-center gap-2"
              onClick={() => setAddItem(true)}
            >
              <PiPlusCircle /> Add
            </button>
          )}
        </div>
        <div>
          <Table columns={columns} data={items} isPagination={true} />
        </div>
      </div>
    </section>
  );
};

export default SubstandardConditionSetup;
