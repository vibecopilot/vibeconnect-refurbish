import React, { useEffect, useState } from "react";
import { BiEdit } from "react-icons/bi";
import { FaCheck, FaTrash } from "react-icons/fa";
import { PiPlusCircle } from "react-icons/pi";
import { MdClose } from "react-icons/md";
import Table from "../../../components/table/Table";
import { getItemInLocalStorage } from "../../../utils/localStorage";
import toast from "react-hot-toast";
// TODO: Import API functions when available
// import { getComplianceTasks, postComplianceTask, deleteComplianceTask, updateComplianceTask, getComplianceCategories } from "../../../api";

interface ComplianceTask {
  id: number;
  name: string;
  description?: string;
  category_id: number;
  category_name?: string;
  weightage: number;
  mandatory: boolean;
  photo_required: boolean;
  document_required: boolean;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

const ComplianceTasksSetup: React.FC = () => {
  const [addTask, setAddTask] = useState(false);
  const [editTask, setEditTask] = useState<ComplianceTask | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category_id: "",
    weightage: 0,
    mandatory: false,
    photo_required: false,
    document_required: false,
  });
  const companyId = getItemInLocalStorage("COMPANYID");
  const [tasks, setTasks] = useState<ComplianceTask[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCategories = async () => {
    try {
      // TODO: Replace with actual API call
      // const res = await getComplianceCategories();
      // setCategories(res.data);
      
      // Static placeholder - remove when API is ready
      setCategories([]);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchTasks = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const res = await getComplianceTasks();
      // setTasks(res.data);
      
      // Static placeholder - remove when API is ready
      setTasks([]);
    } catch (error) {
      console.log(error);
      toast.error("Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchTasks();
  }, []);

  const handleAddTask = async () => {
    if (!formData.name.trim()) {
      toast.error("Task name is required");
      return;
    }
    if (!formData.category_id) {
      toast.error("Category is required");
      return;
    }
    if (formData.weightage < 0 || formData.weightage > 100) {
      toast.error("Weightage must be between 0 and 100");
      return;
    }

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim() || null,
      category_id: Number(formData.category_id),
      weightage: formData.weightage,
      mandatory: formData.mandatory,
      photo_required: formData.photo_required,
      document_required: formData.document_required,
      active: true,
      resource_id: companyId,
      resource_type: "Pms::CompanySetup",
    };

    try {
      // TODO: Replace with actual API call
      // if (editTask) {
      //   await updateComplianceTask(editTask.id, payload);
      //   toast.success("Task updated successfully!");
      // } else {
      //   await postComplianceTask(payload);
      //   toast.success("Task created successfully!");
      // }
      
      // Static placeholder - add to local state
      const selectedCategory = categories.find(cat => cat.id === Number(formData.category_id));
      if (editTask) {
        setTasks(tasks.map(task => 
          task.id === editTask.id 
            ? { ...task, ...formData, category_name: selectedCategory?.name }
            : task
        ));
        toast.success("Task updated successfully!");
      } else {
        const newTask: ComplianceTask = {
          id: tasks.length + 1,
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          category_id: Number(formData.category_id),
          category_name: selectedCategory?.name,
          weightage: formData.weightage,
          mandatory: formData.mandatory,
          photo_required: formData.photo_required,
          document_required: formData.document_required,
          active: true,
        };
        setTasks([...tasks, newTask]);
        toast.success("Task created successfully!");
      }
      
      // Reset form
      setFormData({
        name: "",
        description: "",
        category_id: "",
        weightage: 0,
        mandatory: false,
        photo_required: false,
        document_required: false,
      });
      setAddTask(false);
      setEditTask(null);
    } catch (error) {
      console.log(error);
      toast.error(editTask ? "Failed to update task" : "Failed to create task");
    }
  };

  const handleDeleteTask = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this task?")) {
      return;
    }

    try {
      // TODO: Replace with actual API call
      // await deleteComplianceTask(id);
      // toast.success("Task deleted successfully");
      // fetchTasks();
      
      // Static placeholder - remove from local state
      setTasks(tasks.filter(task => task.id !== id));
      toast.success("Task deleted successfully");
    } catch (error) {
      console.log(error);
      toast.error("Failed to delete task");
    }
  };

  const handleEditTask = (task: ComplianceTask) => {
    setEditTask(task);
    setFormData({
      name: task.name,
      description: task.description || "",
      category_id: String(task.category_id),
      weightage: task.weightage,
      mandatory: task.mandatory,
      photo_required: task.photo_required,
      document_required: task.document_required,
    });
    setAddTask(true);
  };

  const handleCancel = () => {
    setAddTask(false);
    setEditTask(null);
    setFormData({
      name: "",
      description: "",
      category_id: "",
      weightage: 0,
      mandatory: false,
      photo_required: false,
      document_required: false,
    });
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
      name: "Task Name", 
      selector: (row: ComplianceTask) => row.name, 
      sortable: true 
    },
    { 
      name: "Category", 
      selector: (row: ComplianceTask) => row.category_name || "-", 
      sortable: true 
    },
    { 
      name: "Weightage (%)", 
      selector: (row: ComplianceTask) => `${row.weightage}%`, 
      sortable: true 
    },
    { 
      name: "Mandatory", 
      selector: (row: ComplianceTask) => row.mandatory ? "Yes" : "No", 
      sortable: true 
    },
    { 
      name: "Photo Required", 
      selector: (row: ComplianceTask) => row.photo_required ? "Yes" : "No", 
      sortable: true 
    },
    { 
      name: "Document Required", 
      selector: (row: ComplianceTask) => row.document_required ? "Yes" : "No", 
      sortable: true 
    },
    { 
      name: "Status", 
      selector: (row: ComplianceTask) => row.active ? "Active" : "Inactive", 
      sortable: true 
    },
    {
      name: "Action",
      cell: (row: ComplianceTask) => (
        <div className="flex items-center gap-2">
          <button 
            onClick={() => handleEditTask(row)} 
            className="text-blue-500 hover:text-blue-700"
          >
            <BiEdit size={15} />
          </button>
          <button 
            onClick={() => handleDeleteTask(row.id)} 
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
          {addTask && (
            <div className="flex flex-col gap-3 w-full border border-border rounded-lg p-4 bg-card">
              <h3 className="text-lg font-semibold text-foreground">
                {editTask ? "Edit Task" : "Add Task"}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Task Name <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter task name"
                    className="border p-2 w-full border-border rounded-lg bg-background text-foreground"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Category <span className="text-destructive">*</span>
                  </label>
                  <select
                    name="category_id"
                    className="border p-2 w-full border-border rounded-lg bg-background text-foreground"
                    value={formData.category_id}
                    onChange={handleChange}
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Weightage (%) <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="number"
                    name="weightage"
                    min="0"
                    max="100"
                    placeholder="0-100"
                    className="border p-2 w-full border-border rounded-lg bg-background text-foreground"
                    value={formData.weightage}
                    onChange={handleChange}
                  />
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

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="mandatory"
                    id="mandatory"
                    className="w-4 h-4"
                    checked={formData.mandatory}
                    onChange={handleChange}
                  />
                  <label htmlFor="mandatory" className="text-sm text-foreground">
                    Mandatory
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="photo_required"
                    id="photo_required"
                    className="w-4 h-4"
                    checked={formData.photo_required}
                    onChange={handleChange}
                  />
                  <label htmlFor="photo_required" className="text-sm text-foreground">
                    Photo Required
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="document_required"
                    id="document_required"
                    className="w-4 h-4"
                    checked={formData.document_required}
                    onChange={handleChange}
                  />
                  <label htmlFor="document_required" className="text-sm text-foreground">
                    Document Required
                  </label>
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
                  onClick={handleAddTask}
                >
                  <FaCheck /> {editTask ? "Update" : "Submit"}
                </button>
              </div>
            </div>
          )}
          {!addTask && (
            <button
              className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg inline-flex items-center gap-2"
              onClick={() => setAddTask(true)}
            >
              <PiPlusCircle /> Add Task
            </button>
          )}
        </div>
        <div>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : (
            <Table columns={columns} data={tasks} isPagination={true} />
          )}
        </div>
      </div>
    </section>
  );
};

export default ComplianceTasksSetup;
