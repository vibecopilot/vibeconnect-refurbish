import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const ScheduledListView: React.FC = () => {
  const [scheduleFor, setScheduleFor] = useState<"asset" | "services" | "vendor">("asset");
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-muted p-4">
      {/* ===== Header =====
      <div className="te text-center py-3 font-semibold text-lg mb-6">
        Schedule Audit Details
      </div> */}

      {/* ===== Main Card ===== */}
      <div className="bg-white border rounded-xl p-6 max-w-7xl mx-auto">
        {/* Top Actions */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-6 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" />
              Create Task
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" />
              Weightage
            </label>
          </div>

          <div className="flex gap-2">
            <button className="px-3 py-1.5 border rounded text-sm">
              View Performance
            </button>
            <button className="px-3 py-1.5 border rounded text-sm"  onClick={() =>
                      navigate(`/audit/operational/scheduled/edit`)
                    }>
              Edit
            </button>
            <button className="px-3 py-1.5 bg-indigo-600 text-white rounded text-sm">
              Set Approval
            </button>
          </div>
        </div>

        {/* ===== Basic Info ===== */}
        <SectionTitle title="Basic Info" />

        {/* Schedule For */}
        <div className="mb-6">
          <p className="font-medium mb-2">Schedule For :</p>
          <div className="flex gap-3">
            {["asset", "services", "vendor"].map((type) => (
              <button
                key={type}
                onClick={() => setScheduleFor(type as any)}
                className={`px-4 py-1.5 rounded-full border text-sm capitalize ${
                  scheduleFor === type
                    ? "bg-black text-white"
                    : "bg-white text-gray-700"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <SectionTitle title="Activity Name" />

        {/* Activity Form */}
        <div className="grid grid-cols-1 gap-4 mb-6">
          <Input label="Activity Name" placeholder="Enter Activity Name" />
          <Textarea label="Description" placeholder="Enter Description" />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" />
            Allow Observations
          </label>
        </div>

        <SectionTitle title="Task" />

        {/* Task Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select label="Checklist Group" />
          <Select label="Checklist SubGroup" />
          <Input label="Task" placeholder="Enter Task" />
          <div>
            <Select label="Input Type" />
            <div className="flex gap-4 mt-2 text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" /> Mandatory
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" /> Reading
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduledListView;

const SectionTitle = ({ title }: { title: string }) => (
  <div className="text-center my-6">
    <h2 className="font-semibold mb-2">{title}</h2>
    <div className="border-t" />
  </div>
);

const Input = ({ label, placeholder }: any) => (
  <div>
    <label className="block text-sm font-medium mb-1">{label}</label>
    <input
      placeholder={placeholder}
      className="w-full border rounded-md px-3 py-2 text-sm"
    />
  </div>
);

const Textarea = ({ label, placeholder }: any) => (
  <div>
    <label className="block text-sm font-medium mb-1">{label}</label>
    <textarea
      placeholder={placeholder}
      rows={3}
      className="w-full border rounded-md px-3 py-2 text-sm"
    />
  </div>
);

const Select = ({ label }: any) => (
  <div>
    <label className="block text-sm font-medium mb-1">{label}</label>
    <select className="w-full border rounded-md px-3 py-2 text-sm bg-white">
      <option>Select</option>
    </select>
  </div>
);
