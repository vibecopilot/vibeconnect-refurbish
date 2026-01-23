import React, { useEffect, useState } from "react";
import { BiEdit } from "react-icons/bi";
import { FaCheck, FaTrash, FaPlus } from "react-icons/fa";
import { PiPlusCircle } from "react-icons/pi";
import { MdClose } from "react-icons/md";
import Table from "../../../components/table/Table";
import { getItemInLocalStorage } from "../../../utils/localStorage";
import toast from "react-hot-toast";
// TODO: Import API functions when available
// import { getWorkflowRules, postWorkflowRule, deleteWorkflowRule, updateWorkflowRule, getFilteredUsers } from "../../../api";

interface ApprovalLevel {
  id: number;
  level: number;
  approver_type: string; // "user", "role", "department"
  approver_id?: number;
  approver_name?: string;
  is_mandatory: boolean;
}

interface WorkflowRule {
  id: number;
  name: string;
  description?: string;
  approval_levels: ApprovalLevel[];
  escalation_enabled: boolean;
  escalation_days?: number;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

const WorkflowRulesSetup: React.FC = () => {
  const [addWorkflow, setAddWorkflow] = useState(false);
  const [editWorkflow, setEditWorkflow] = useState<WorkflowRule | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    escalation_enabled: false,
    escalation_days: 3,
  });
  const [approvalLevels, setApprovalLevels] = useState<ApprovalLevel[]>([]);
  const companyId = getItemInLocalStorage("COMPANYID");
  const [workflowRules, setWorkflowRules] = useState<WorkflowRule[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchWorkflowRules = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const res = await getWorkflowRules();
      // setWorkflowRules(res.data);
      
      // Static placeholder - remove when API is ready
      setWorkflowRules([]);
    } catch (error) {
      console.log(error);
      toast.error("Failed to fetch workflow rules");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflowRules();
  }, []);

  const handleAddApprovalLevel = () => {
    const newLevel: ApprovalLevel = {
      id: Date.now(),
      level: approvalLevels.length + 1,
      approver_type: "user",
      is_mandatory: true,
    };
    setApprovalLevels([...approvalLevels, newLevel]);
  };

  const handleRemoveApprovalLevel = (id: number) => {
    setApprovalLevels(approvalLevels.filter(level => level.id !== id));
  };

  const handleApprovalLevelChange = (id: number, field: keyof ApprovalLevel, value: any) => {
    setApprovalLevels(approvalLevels.map(level => 
      level.id === id ? { ...level, [field]: value } : level
    ));
  };

  const handleAddWorkflow = async () => {
    if (!formData.name.trim()) {
      toast.error("Workflow name is required");
      return;
    }
    if (approvalLevels.length === 0) {
      toast.error("At least one approval level is required");
      return;
    }
    if (formData.escalation_enabled && (!formData.escalation_days || formData.escalation_days < 1)) {
      toast.error("Escalation days must be at least 1");
      return;
    }

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim() || null,
      approval_levels: approvalLevels.map(level => ({
        level: level.level,
        approver_type: level.approver_type,
        approver_id: level.approver_id || null,
        is_mandatory: level.is_mandatory,
      })),
      escalation_enabled: formData.escalation_enabled,
      escalation_days: formData.escalation_enabled ? formData.escalation_days : null,
      active: true,
      resource_id: companyId,
      resource_type: "Pms::CompanySetup",
    };

    try {
      // TODO: Replace with actual API call
      // if (editWorkflow) {
      //   await updateWorkflowRule(editWorkflow.id, payload);
      //   toast.success("Workflow rule updated successfully!");
      // } else {
      //   await postWorkflowRule(payload);
      //   toast.success("Workflow rule created successfully!");
      // }
      
      // Static placeholder - add to local state
      if (editWorkflow) {
        setWorkflowRules(workflowRules.map(rule => 
          rule.id === editWorkflow.id 
            ? { ...rule, ...formData, approval_levels: approvalLevels }
            : rule
        ));
        toast.success("Workflow rule updated successfully!");
      } else {
        const newWorkflow: WorkflowRule = {
          id: workflowRules.length + 1,
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          approval_levels: approvalLevels,
          escalation_enabled: formData.escalation_enabled,
          escalation_days: formData.escalation_enabled ? formData.escalation_days : undefined,
          active: true,
        };
        setWorkflowRules([...workflowRules, newWorkflow]);
        toast.success("Workflow rule created successfully!");
      }
      
      // Reset form
      setFormData({
        name: "",
        description: "",
        escalation_enabled: false,
        escalation_days: 3,
      });
      setApprovalLevels([]);
      setAddWorkflow(false);
      setEditWorkflow(null);
    } catch (error) {
      console.log(error);
      toast.error(editWorkflow ? "Failed to update workflow rule" : "Failed to create workflow rule");
    }
  };

  const handleDeleteWorkflow = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this workflow rule?")) {
      return;
    }

    try {
      // TODO: Replace with actual API call
      // await deleteWorkflowRule(id);
      // toast.success("Workflow rule deleted successfully");
      // fetchWorkflowRules();
      
      // Static placeholder - remove from local state
      setWorkflowRules(workflowRules.filter(rule => rule.id !== id));
      toast.success("Workflow rule deleted successfully");
    } catch (error) {
      console.log(error);
      toast.error("Failed to delete workflow rule");
    }
  };

  const handleEditWorkflow = (workflow: WorkflowRule) => {
    setEditWorkflow(workflow);
    setFormData({
      name: workflow.name,
      description: workflow.description || "",
      escalation_enabled: workflow.escalation_enabled,
      escalation_days: workflow.escalation_days || 3,
    });
    setApprovalLevels(workflow.approval_levels || []);
    setAddWorkflow(true);
  };

  const handleCancel = () => {
    setAddWorkflow(false);
    setEditWorkflow(null);
    setFormData({
      name: "",
      description: "",
      escalation_enabled: false,
      escalation_days: 3,
    });
    setApprovalLevels([]);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : 
              type === "number" ? Number(value) : value
    }));
  };

  const columns = [
    { 
      name: "Workflow Name", 
      selector: (row: WorkflowRule) => row.name, 
      sortable: true 
    },
    { 
      name: "Approval Levels", 
      selector: (row: WorkflowRule) => row.approval_levels?.length || 0, 
      sortable: true 
    },
    { 
      name: "Escalation", 
      selector: (row: WorkflowRule) => row.escalation_enabled ? `Yes (${row.escalation_days} days)` : "No", 
      sortable: true 
    },
    { 
      name: "Status", 
      selector: (row: WorkflowRule) => row.active ? "Active" : "Inactive", 
      sortable: true 
    },
    {
      name: "Action",
      cell: (row: WorkflowRule) => (
        <div className="flex items-center gap-2">
          <button 
            onClick={() => handleEditWorkflow(row)} 
            className="text-blue-500 hover:text-blue-700"
          >
            <BiEdit size={15} />
          </button>
          <button 
            onClick={() => handleDeleteWorkflow(row.id)} 
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
          {addWorkflow && (
            <div className="flex flex-col gap-3 w-full border border-border rounded-lg p-4 bg-card">
              <h3 className="text-lg font-semibold text-foreground">
                {editWorkflow ? "Edit Workflow Rule" : "Add Workflow Rule"}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Workflow Name <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter workflow name"
                    className="border p-2 w-full border-border rounded-lg bg-background text-foreground"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="escalation_enabled"
                    id="escalation_enabled"
                    className="w-4 h-4"
                    checked={formData.escalation_enabled}
                    onChange={handleChange}
                  />
                  <label htmlFor="escalation_enabled" className="text-sm text-foreground">
                    Enable Escalation
                  </label>
                </div>

                {formData.escalation_enabled && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Escalation Days
                    </label>
                    <input
                      type="number"
                      name="escalation_days"
                      min="1"
                      placeholder="3"
                      className="border p-2 w-full border-border rounded-lg bg-background text-foreground"
                      value={formData.escalation_days}
                      onChange={handleChange}
                    />
                  </div>
                )}

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    placeholder="Enter description (optional)"
                    className="border p-2 w-full border-border rounded-lg bg-background text-foreground"
                    rows={3}
                    value={formData.description}
                    onChange={handleChange}
                  />
                </div>

                <div className="md:col-span-2">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-foreground">
                      Approval Levels <span className="text-destructive">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleAddApprovalLevel}
                      className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-lg inline-flex items-center gap-2"
                    >
                      <FaPlus size={12} /> Add Level
                    </button>
                  </div>

                  {approvalLevels.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground border border-border rounded-lg">
                      No approval levels added. Click "Add Level" to add one.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {approvalLevels.map((level, index) => (
                        <div key={level.id} className="border border-border rounded-lg p-3 bg-muted/30">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-foreground">
                              Level {level.level}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveApprovalLevel(level.id)}
                              className="text-destructive hover:text-destructive/80"
                            >
                              <FaTrash size={12} />
                            </button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                              <label className="block text-xs text-muted-foreground mb-1">
                                Approver Type
                              </label>
                              <select
                                className="border p-2 w-full border-border rounded-lg bg-background text-foreground text-sm"
                                value={level.approver_type}
                                onChange={(e) => handleApprovalLevelChange(level.id, "approver_type", e.target.value)}
                              >
                                <option value="user">User</option>
                                <option value="role">Role</option>
                                <option value="department">Department</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs text-muted-foreground mb-1">
                                Approver ID/Name
                              </label>
                              <input
                                type="text"
                                placeholder="Enter approver ID or name"
                                className="border p-2 w-full border-border rounded-lg bg-background text-foreground text-sm"
                                value={level.approver_name || ""}
                                onChange={(e) => handleApprovalLevelChange(level.id, "approver_name", e.target.value)}
                              />
                            </div>
                            <div className="flex items-center gap-2 pt-6">
                              <input
                                type="checkbox"
                                className="w-4 h-4"
                                checked={level.is_mandatory}
                                onChange={(e) => handleApprovalLevelChange(level.id, "is_mandatory", e.target.checked)}
                              />
                              <label className="text-xs text-foreground">Mandatory</label>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  className="px-4 py-2 text-sm border border-border rounded-lg text-foreground hover:bg-muted inline-flex items-center gap-2"
                  onClick={handleCancel}
                >
                  <MdClose /> Cancel
                </button>
                <button
                  className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg inline-flex items-center gap-2"
                  onClick={handleAddWorkflow}
                >
                  <FaCheck /> {editWorkflow ? "Update" : "Submit"}
                </button>
              </div>
            </div>
          )}
          {!addWorkflow && (
            <button
              className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg inline-flex items-center gap-2"
              onClick={() => setAddWorkflow(true)}
            >
              <PiPlusCircle /> Add Workflow Rule
            </button>
          )}
        </div>
        <div>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : (
            <Table columns={columns} data={workflowRules} isPagination={true} />
          )}
        </div>
      </div>
    </section>
  );
};

export default WorkflowRulesSetup;
