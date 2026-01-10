import React, { useState } from "react";
import FormSection from "../../../../components/ui/FormSection";
import Table from "../../../../components/table/Table";

const ProjectCostApproval: React.FC = () => {
  const [selectedOption, setSelectedOption] = useState("");

  const columns = [
    { name: "Cost Range", selector: (row: any) => row.cost, sortable: true },
    { name: "Levels", selector: (row: any) => row.Levels, sortable: true },
    { name: "Approvers", selector: (row: any) => row.Approvers, sortable: true },
  ];

  const data = [
    { cost: "500-600", Levels: "L1", Approvers: "Deepak Gupta" },
    { cost: "500-600", Levels: "L2", Approvers: "Deepak Gupta" },
    { cost: "500-600", Levels: "L3", Approvers: "Deepak Gupta" },
    { cost: "500-600", Levels: "L4", Approvers: "Deepak Gupta" },
    { cost: "500-600", Levels: "L5", Approvers: "Deepak Gupta" },
  ];

  return (
    <div className="space-y-6">
      <FormSection title="Project Cost Approval">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-3">
            <select
              name="condition"
              value={selectedOption}
              onChange={(e) => setSelectedOption(e.target.value)}
              className="border border-border rounded-lg px-3 py-2 bg-background text-foreground"
            >
              <option value="">Select Unit</option>
              <option value="between">Between</option>
              <option value="greaterThan">Greater than</option>
              <option value="greaterThanEqual">Greater than Equal</option>
            </select>

            {selectedOption === "between" && (
              <>
                <input
                  type="text"
                  className="border border-border rounded-lg px-3 py-2 bg-background text-foreground"
                  placeholder="Enter cost"
                />
                <input
                  type="text"
                  className="border border-border rounded-lg px-3 py-2 bg-background text-foreground"
                  placeholder="Enter cost"
                />
              </>
            )}

            {(selectedOption === "greaterThan" ||
              selectedOption === "greaterThanEqual") && (
              <input
                type="text"
                className="border border-border rounded-lg px-3 py-2 bg-background text-foreground"
                placeholder="Enter cost"
              />
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-secondary/60">
                <tr>
                  <th className="border border-border px-4 py-2 text-left text-xs font-semibold text-muted-foreground uppercase">
                    Levels
                  </th>
                  <th className="border border-border px-4 py-2 text-left text-xs font-semibold text-muted-foreground uppercase">
                    Approvers
                  </th>
                </tr>
              </thead>
              <tbody>
                {["L1", "L2", "L3", "L4", "L5"].map((level) => (
                  <tr key={level} className="border-b border-border">
                    <td className="border border-border px-4 py-2 text-sm text-center">
                      {level}
                    </td>
                    <td className="border border-border px-4 py-2 text-center">
                      <select className="border border-border rounded-lg px-3 py-2 bg-background text-foreground w-full">
                        <option value="">Select Users</option>
                        <option value="">Mittu</option>
                        <option value="">Panda</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end">
            <button className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg">
              Submit
            </button>
          </div>
        </div>
      </FormSection>

      <div className="bg-card border border-border rounded-xl p-4">
        <Table columns={columns} data={data} isPagination />
      </div>
    </div>
  );
};

export default ProjectCostApproval;
