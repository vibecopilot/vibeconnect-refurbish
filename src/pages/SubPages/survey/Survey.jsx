import React, { useEffect, useRef, useState } from "react";
import { BsEye } from "react-icons/bs";
import { Link } from "react-router-dom";
import { IoAddCircleOutline } from "react-icons/io5";
import { useSelector } from "react-redux";
import { HiChevronDown } from "react-icons/hi";
import Breadcrumb from "../../../components/ui/Breadcrumb";
import Table from "../../../components/table/Table";
import ListToolbar from "../../../components/ui/ListToolbar";
import DataCard from "../../../components/ui/DataCard";

function Survey() {
  const themeColor = useSelector((state) => state.theme.color);
  const [viewMode, setViewMode] = useState("table");
  const [isStatus, setIsStatus] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  const statusRef = useRef(null);
  const ownerRef = useRef(null);

  // Status options state
  const [statusOptions, setStatusOptions] = useState({
    selectAll: false,
    open: false,
    closeShared: false,
    draftYou: false,
  });

  // Owner options state
  const [ownerOptions, setOwnerOptions] = useState({
    selectAll: false,
    youOwn: false,
    youOwnShared: false,
    sharedWith: false,
  });

  // Handle "Select All" for Status dropdown
  const handleStatusChange = (key) => {
    if (key === "selectAll") {
      const newValue = !statusOptions.selectAll;
      setStatusOptions({
        selectAll: newValue,
        open: newValue,
        closeShared: newValue,
        draftYou: newValue,
      });
    } else {
      const updatedOptions = { ...statusOptions, [key]: !statusOptions[key] };
      updatedOptions.selectAll =
        updatedOptions.open &&
        updatedOptions.closeShared &&
        updatedOptions.draftYou;
      setStatusOptions(updatedOptions);
    }
  };

  // Handle "Select All" for Owner dropdown
  const handleOwnerChange = (key) => {
    if (key === "selectAll") {
      const newValue = !ownerOptions.selectAll;
      setOwnerOptions({
        selectAll: newValue,
        youOwn: newValue,
        youOwnShared: newValue,
        sharedWith: newValue,
      });
    } else {
      const updatedOptions = { ...ownerOptions, [key]: !ownerOptions[key] };
      updatedOptions.selectAll =
        updatedOptions.youOwn &&
        updatedOptions.youOwnShared &&
        updatedOptions.sharedWith;
      setOwnerOptions(updatedOptions);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (statusRef.current && !statusRef.current.contains(event.target)) {
        setIsStatus(false);
      }
      if (ownerRef.current && !ownerRef.current.contains(event.target)) {
        setIsOwner(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const columns = [
    {
      name: "Action",
      cell: (row) => (
        <div className="flex items-center gap-4">
          <Link to={`/admin/survey-details/${row.id}`}>
            <BsEye size={15} />
          </Link>
        </div>
      ),
    },
    {
      name: "Survey Name",
      selector: (row, index) => row.survey_name,
      sortable: true,
    },
    {
      name: "Start Date",
      selector: (row) => row.start_date,
      sortable: true,
    },
    {
      name: "End Date",
      selector: (row) => row.end_date,
      sortable: true,
    },
    {
      name: "No Of Response",
      selector: (row) => row.response,
      sortable: true,
    },
    {
      name: "Status",
      selector: (row) => row.status,
      sortable: true,
    },
  ];

  const data = [
    {
      Id: 1,
      survey_name: "Customer Feedback Survey",
      frequency: "Daily",
      start_date: "2024-12-24",
      end_date: "2024-12-31",
      response: "12/25",
      status: "Close",
    },
  ];
  return (
    <div className="p-6">
      <Breadcrumb items={[{ label: 'FM Module' }, { label: 'Survey', path: '/survey' }, { label: 'Survey List' }]} />
      
      <div className="mt-6 bg-card border border-border rounded-lg shadow-sm">
        <ListToolbar
        searchPlaceholder="Search By Survey Name"
        searchValue={""}
        onSearchChange={() => {}}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onAdd={() => {}}
        addLabel="Add"
        additionalButtons={
          <div className="flex flex-wrap gap-2">
            <div className="flex gap-2">
              <div className="relative inline-block" ref={statusRef}>
                <button
                  onClick={() => setIsStatus(!isStatus)}
                  className="flex items-center px-3 py-2 border border-border rounded-md bg-background text-foreground hover:bg-accent transition-colors"
                >
                  Status <HiChevronDown className="w-4 h-4 ml-2" />
                </button>
                {isStatus && (
                  <div className="absolute left-0 mt-1 w-52 bg-card shadow-lg rounded-md border border-border z-10">
                    {Object.keys(statusOptions).map((key) => (
                      <label
                        key={key}
                        className="flex items-center gap-2 px-3 py-2 hover:bg-accent cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          className="w-4 h-4"
                          checked={statusOptions[key]}
                          onChange={() => handleStatusChange(key)}
                        />
                        {key === "selectAll"
                          ? "Select all"
                          : key.replace(/([A-Z])/g, " $1").trim()}
                      </label>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="relative inline-block" ref={ownerRef}>
                <button
                  onClick={() => setIsOwner(!isOwner)}
                  className="flex items-center px-3 py-2 border border-border rounded-md bg-background text-foreground hover:bg-accent transition-colors"
                >
                  Owner <HiChevronDown size={16} />
                </button>
                {isOwner && (
                  <div className="absolute left-0 mt-1 w-52 bg-card shadow-lg rounded-md border border-border z-10">
                    {Object.keys(ownerOptions).map((key) => (
                      <label
                        key={key}
                        className="flex items-center gap-2 px-3 py-2 hover:bg-accent cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          className="w-4 h-4"
                          checked={ownerOptions[key]}
                          onChange={() => handleOwnerChange(key)}
                        />{" "}
                        {key === "selectAll"
                          ? "Select all"
                          : key.replace(/([A-Z])/g, " $1").trim()}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <Link
              to={`/admin/add-survey`}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md flex gap-2 items-center justify-center hover:bg-primary/90 transition-colors"
            >
              <IoAddCircleOutline />
              Add
            </Link>
          </div>
        }
      />
        
        <div className="p-4">
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.map((item) => (
                <DataCard
                  key={item.Id}
                  title={item.survey_name}
                  subtitle={`Status: ${item.status}`}
                  status={item.status === "Close" ? "breakdown" : "in-store"}
                  fields={[                
                    { label: "Start Date", value: item.start_date },
                    { label: "End Date", value: item.end_date },
                    { label: "Responses", value: item.response },
                    { label: "Frequency", value: item.frequency },
                  ]}
                  viewPath={`/admin/survey-details/${item.id}`}
                />
              ))}
            </div>
          ) : (
            <Table columns={columns} data={data} selectableRow={true} />
          )}
        </div>
      </div>
    </div>
  );
}

export default Survey;
