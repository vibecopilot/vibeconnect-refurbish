import React, { useEffect, useState } from "react";
import { BiEdit } from "react-icons/bi";
import { FaCheck, FaTrash } from "react-icons/fa";
import { PiPlusCircle } from "react-icons/pi";
import { MdClose } from "react-icons/md";
import Table from "../../../components/table/Table";
import { getItemInLocalStorage } from "../../../utils/localStorage";
import toast from "react-hot-toast";
// TODO: Import API functions when available
// import { getRiskLevels, postRiskLevel, deleteRiskLevel, updateRiskLevel } from "../../../api";

interface RiskLevel {
  id: number;
  name: string;
  description?: string;
  score_min: number;
  score_max: number;
  priority: string; // Low, Medium, High, Critical
  color_code?: string;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

const RiskAssessmentSetup: React.FC = () => {
  const [addRiskLevel, setAddRiskLevel] = useState(false);
  const [editRiskLevel, setEditRiskLevel] = useState<RiskLevel | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    score_min: 0,
    score_max: 100,
    priority: "Low",
    color_code: "#3b82f6",
  });
  const companyId = getItemInLocalStorage("COMPANYID");
  const [riskLevels, setRiskLevels] = useState<RiskLevel[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRiskLevels = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const res = await getRiskLevels();
      // setRiskLevels(res.data);
      
      // Static placeholder - remove when API is ready
      setRiskLevels([]);
    } catch (error) {
      console.log(error);
      toast.error("Failed to fetch risk levels");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRiskLevels();
  }, []);

  const handleAddRiskLevel = async () => {
    if (!formData.name.trim()) {
      toast.error("Risk level name is required");
      return;
    }
    if (formData.score_min < 0 || formData.score_max > 100 || formData.score_min >= formData.score_max) {
      toast.error("Score range must be between 0-100 and min must be less than max");
      return;
    }

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim() || null,
      score_min: formData.score_min,
      score_max: formData.score_max,
      priority: formData.priority,
      color_code: formData.color_code,
      active: true,
      resource_id: companyId,
      resource_type: "Pms::CompanySetup",
    };

    try {
      // TODO: Replace with actual API call
      // if (editRiskLevel) {
      //   await updateRiskLevel(editRiskLevel.id, payload);
      //   toast.success("Risk level updated successfully!");
      // } else {
      //   await postRiskLevel(payload);
      //   toast.success("Risk level created successfully!");
      // }
      
      // Static placeholder - add to local state
      if (editRiskLevel) {
        setRiskLevels(riskLevels.map(level => 
          level.id === editRiskLevel.id 
            ? { ...level, ...formData }
            : level
        ));
        toast.success("Risk level updated successfully!");
      } else {
        const newRiskLevel: RiskLevel = {
          id: riskLevels.length + 1,
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          score_min: formData.score_min,
          score_max: formData.score_max,
          priority: formData.priority,
          color_code: formData.color_code,
          active: true,
        };
        setRiskLevels([...riskLevels, newRiskLevel]);
        toast.success("Risk level created successfully!");
      }
      
      // Reset form
      setFormData({
        name: "",
        description: "",
        score_min: 0,
        score_max: 100,
        priority: "Low",
        color_code: "#3b82f6",
      });
      setAddRiskLevel(false);
      setEditRiskLevel(null);
    } catch (error) {
      console.log(error);
      toast.error(editRiskLevel ? "Failed to update risk level" : "Failed to create risk level");
    }
  };

  const handleDeleteRiskLevel = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this risk level?")) {
      return;
    }

    try {
      // TODO: Replace with actual API call
      // await deleteRiskLevel(id);
      // toast.success("Risk level deleted successfully");
      // fetchRiskLevels();
      
      // Static placeholder - remove from local state
      setRiskLevels(riskLevels.filter(level => level.id !== id));
      toast.success("Risk level deleted successfully");
    } catch (error) {
      console.log(error);
      toast.error("Failed to delete risk level");
    }
  };

  const handleEditRiskLevel = (level: RiskLevel) => {
    setEditRiskLevel(level);
    setFormData({
      name: level.name,
      description: level.description || "",
      score_min: level.score_min,
      score_max: level.score_max,
      priority: level.priority,
      color_code: level.color_code || "#3b82f6",
    });
    setAddRiskLevel(true);
  };

  const handleCancel = () => {
    setAddRiskLevel(false);
    setEditRiskLevel(null);
    setFormData({
      name: "",
      description: "",
      score_min: 0,
      score_max: 100,
      priority: "Low",
      color_code: "#3b82f6",
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "score_min" || name === "score_max" ? Number(value) : value
    }));
  };

  const columns = [
    { 
      name: "Risk Level", 
      selector: (row: RiskLevel) => row.name, 
      sortable: true 
    },
    { 
      name: "Score Range", 
      selector: (row: RiskLevel) => `${row.score_min} - ${row.score_max}`, 
      sortable: true 
    },
    { 
      name: "Priority", 
      selector: (row: RiskLevel) => row.priority, 
      sortable: true 
    },
    { 
      name: "Color", 
      selector: (row: RiskLevel) => (
        <div className="flex items-center gap-2">
          <div 
            className="w-6 h-6 rounded border border-border"
            style={{ backgroundColor: row.color_code || "#3b82f6" }}
          />
          <span>{row.color_code || "#3b82f6"}</span>
        </div>
      ), 
      sortable: false 
    },
    { 
      name: "Status", 
      selector: (row: RiskLevel) => row.active ? "Active" : "Inactive", 
      sortable: true 
    },
    {
      name: "Action",
      cell: (row: RiskLevel) => (
        <div className="flex items-center gap-2">
          <button 
            onClick={() => handleEditRiskLevel(row)} 
            className="text-blue-500 hover:text-blue-700"
          >
            <BiEdit size={15} />
          </button>
          <button 
            onClick={() => handleDeleteRiskLevel(row.id)} 
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
          {addRiskLevel && (
            <div className="flex flex-col gap-3 w-full border border-border rounded-lg p-4 bg-card">
              <h3 className="text-lg font-semibold text-foreground">
                {editRiskLevel ? "Edit Risk Level" : "Add Risk Level"}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Risk Level Name <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    placeholder="e.g., Low Risk, Medium Risk"
                    className="border p-2 w-full border-border rounded-lg bg-background text-foreground"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Priority <span className="text-destructive">*</span>
                  </label>
                  <select
                    name="priority"
                    className="border p-2 w-full border-border rounded-lg bg-background text-foreground"
                    value={formData.priority}
                    onChange={handleChange}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Minimum Score <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="number"
                    name="score_min"
                    min="0"
                    max="100"
                    className="border p-2 w-full border-border rounded-lg bg-background text-foreground"
                    value={formData.score_min}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Maximum Score <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="number"
                    name="score_max"
                    min="0"
                    max="100"
                    className="border p-2 w-full border-border rounded-lg bg-background text-foreground"
                    value={formData.score_max}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Color Code
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      name="color_code"
                      className="w-12 h-10 border border-border rounded-lg"
                      value={formData.color_code}
                      onChange={handleChange}
                    />
                    <input
                      type="text"
                      name="color_code"
                      placeholder="#3b82f6"
                      className="border p-2 flex-1 border-border rounded-lg bg-background text-foreground"
                      value={formData.color_code}
                      onChange={handleChange}
                    />
                  </div>
                </div>

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
                  onClick={handleAddRiskLevel}
                >
                  <FaCheck /> {editRiskLevel ? "Update" : "Submit"}
                </button>
              </div>
            </div>
          )}
          {!addRiskLevel && (
            <button
              className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg inline-flex items-center gap-2"
              onClick={() => setAddRiskLevel(true)}
            >
              <PiPlusCircle /> Add Risk Level
            </button>
          )}
        </div>
        <div>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : (
            <Table columns={columns} data={riskLevels} isPagination={true} />
          )}
        </div>
      </div>
    </section>
  );
};

export default RiskAssessmentSetup;
