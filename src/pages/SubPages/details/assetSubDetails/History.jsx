import React from "react";
import DataTable from "react-data-table-component";
import { History as HistoryIcon, FileText } from "lucide-react";

const History = () => {
  const column = [
    {
      name: "Date",
      selector: (row) => row.date,
      sortable: true,
    },
    {
      name: "Type Of Activity",
      selector: (row) => row.activity,
      sortable: true,
    },
    {
      name: "Description",
      selector: (row) => (
        <div className="flex flex-col my-2 space-y-1">
          <div className="flex gap-1">
            <h2 className="font-medium text-foreground">Model Number:</h2>
            <p className="text-muted-foreground">Changed From: MH02 To: 7801</p>
          </div>
          <div className="flex gap-1">
            <h2 className="font-medium text-foreground">Purchased On:</h2>
            <p className="text-muted-foreground">Changed From: MH02 To: 7801</p>
          </div>
          <div className="flex gap-1">
            <h2 className="font-medium text-foreground">Wing ID:</h2>
            <p className="text-muted-foreground">Changed From: MH02 To: 7801</p>
          </div>
        </div>
      ),
      sortable: true,
    },
    { name: "Performed By", selector: (row) => row.performed, sortable: true },
  ];

  const data = [
    {
      id: 1,
      date: "16/08/2024, 02:32PM",
      activity: "Update",
      description: "Desc A",
      performed: "Karan Singh",
    },
  ];

  const customStyle = {
    headRow: {
      style: {
        backgroundColor: "hsl(var(--primary))",
        color: "hsl(var(--primary-foreground))",
        fontSize: "12px",
      },
    },
  };

  const InfoItem = ({ label, value }) => (
    <div className="grid grid-cols-2">
      <p className="font-medium text-foreground">{label}:</p>
      <p className="text-muted-foreground">{value || "-"}</p>
    </div>
  );

  return (
    <section className="space-y-6">
      {/* History Details */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="bg-primary/5 px-6 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <HistoryIcon className="w-5 h-5 text-primary" />
            History in Details
          </h2>
        </div>
        <div className="p-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <InfoItem label="Equipment Name" value="Diesel generator" />
            <InfoItem label="Manufacturer" value="" />
            <InfoItem label="Supplier" value="" />
            <InfoItem label="Date of Purchase" value="01/08/2024" />
            <InfoItem label="Capacity" value="1 gallons" />
            <InfoItem label="Date of installation" value="" />
            <InfoItem label="Date of Commisioning" value="" />
            <InfoItem label="Model Number" value="7801" />
            <InfoItem label="Serial Number" value="535" />
            <InfoItem label="Asset Code" value="8dd5571a0f7277cae6b2" />
            <InfoItem label="Manufacturer" value="" />
            <InfoItem label="Supplier" value="Haven infoline" />
            <InfoItem label="Date of Purchase" value="01/08/2024" />
            <InfoItem label="Capacity" value="" />
            <InfoItem label="Date of installation" value="" />
            <InfoItem label="Date of Commisioning" value="" />
            <InfoItem label="Model Number" value="7801" />
            <InfoItem label="Serial Number" value="MUM-CREST-9090" />
            <InfoItem label="Asset Code" value="8dd5571a0f7277cae6b2" />
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <InfoItem
              label="Location of Asset"
              value="Site - Lockated Site 1 / Building - Decker Bldg / Wing - A / Floor - NA / Area - NA / Room - NA"
            />
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="bg-primary/5 px-6 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            History Log
          </h2>
        </div>
        <div className="p-6">
          <DataTable columns={column} data={data} customStyles={customStyle} />
        </div>
      </div>
    </section>
  );
};

export default History;