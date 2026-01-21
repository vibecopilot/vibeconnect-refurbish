import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, Plus, Calendar, X, RotateCcw, Save, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Breadcrumb from '../../components/ui/Breadcrumb';

import { getAssignedTo, getVendors, getVendorCategory, postAuditScheduled ,getChecklist } from '../../api';
import { getItemInLocalStorage } from '../../utils/localStorage';

const scheduleTypes = ['Asset', 'Services', 'Vendor', 'Training', 'Compliance'];
const checklistTypes = ['Individual', 'Asset Group'];
const frequencies = ['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Yearly', 'One Time'];
const priorities = ['Low', 'Medium', 'High', 'Critical'];
const scanTypes = ['QR Code', 'NFC', 'Manual'];

const API_BASE = "https://admin.vibecopilot.ai";
const API_TOKEN = getItemInLocalStorage("TOKEN");
const SITEID = getItemInLocalStorage("SITEID");

interface FormData {
  audit_for: string;
  activity_name: string;
  description: string;
  allow_observations: boolean;
  checklist_type: string;
  asset_name: string;
  service_name: string;
  vendor_name: string;
  training_name: string;
  assign_to: string;
  scan_type: string;
  plan_duration: string;
  priority: string;
  email_trigger_rule: string;
  supervisors: string;
  category_id: string;
  look_overdue_task: string;
  frequency: string;
  start_from: string;
  end_at: string;
  supplier_id: string;
  create_new: boolean;
  create_task: boolean;
  weightage: boolean;
}
interface TaskItem {
  id: number;
  group: string;
  subgroup: string;
  task: string;
  input_type: string;
  mandatory: boolean;
  reading: boolean;
  help_text: boolean;
}

const ScheduleAuditForm: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [formData, setFormData] = useState<FormData>({
    audit_for: 'Asset',
    activity_name: '',
    description: '',
    allow_observations: false,

    checklist_type: 'Individual',

    asset_name: '',
    service_name: '',
    vendor_name: '',
    training_name: '',

    assign_to: '',
    scan_type: '',
    plan_duration: '',
    priority: 'Medium',
    email_trigger_rule: '',
    supervisors: '',
    category_id: '',
    look_overdue_task: '',
    frequency: 'Daily',
    start_from: '',
    end_at: '',
    supplier_id: '',

    create_new: true,
    create_task: false,
    weightage: false,
  });

  const [assignedUsers, setAssignedUsers] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const forTypes = ['Asset', 'Services', 'Vendor', 'Training'];
  const inputTypes = ['Text', 'Number', 'Dropdown', 'Checkbox', 'Date', 'File Upload', 'Rating'];


  useEffect(() => {
    fetchDropdownData();
  }, []);
  const fetchDropdownData = async () => {
    try {
      const [usersRes, categoriesRes, suppliersRes] = await Promise.all([
        getAssignedTo(),
        getVendorCategory(),
        getVendors(),
        getChecklist(),
      ]);

      setAssignedUsers(
        Array.isArray(usersRes?.data) ? usersRes.data : usersRes?.data?.data || []
      );

      setCategories(
        Array.isArray(categoriesRes?.data)
          ? categoriesRes.data
          : categoriesRes?.data?.data || []
      );

      setSuppliers(
        Array.isArray(suppliersRes?.data)
          ? suppliersRes.data
          : suppliersRes?.data?.data || []
      );
    } catch (err) {
      console.error(err);
      setCategories([]); // safety fallback
    }
  };


  const addTask = () => {
    setFormData(prev => ({
      ...prev,
      create_task: true, // FORCE true
    }));

    setTasks(prev => [
      ...prev,
      {
        id: Date.now(),
        group: '',
        subgroup: '',
        task: '',
        input_type: 'Text',
        mandatory: false,
        reading: false,
        help_text: false,
      },
    ]);
  };


  const updateTask = (id: number, field: keyof TaskItem, value: any) => {
    setTasks(prev => prev.map(task =>
      task.id === id ? { ...task, [field]: value } : task
    ));
  };

  const removeTask = (id: number) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  const handleScheduleTypeChange = (type: string) => {
    setFormData(prev => ({
      ...prev,
      audit_for: type,
      asset_name: '',
      service_name: '',
      vendor_name: '',
      training_name: '',
    }));
  };
  const handleReset = () => {
    setFormData({
      audit_for: 'Asset',
      activity_name: '',
      description: '',
      allow_observations: false,
      checklist_type: 'Individual',

      asset_name: '',
      service_name: '',
      vendor_name: '',
      training_name: '',

      assign_to: '',
      scan_type: '',
      plan_duration: '',
      priority: 'Medium',
      email_trigger_rule: '',
      supervisors: '',
      category_id: '',
      look_overdue_task: '',
      frequency: 'Daily',
      start_from: '',
      end_at: '',
      supplier_id: '',

      create_new: true,
      create_task: false,
      weightage: false,
    });

    setTasks([]); // IMPORTANT: clear tasks also
  };


  const handleChecklistTypeChange = (type: string) => {
    setFormData(prev => ({ ...prev, checklist_type: type }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.activity_name.trim()) {
      toast.error('Activity Name is required');
      return;
    }

    if (formData.create_task && tasks.length === 0) {
      toast.error('At least one task is required');
      return;
    }
    if (formData.create_task) {
      const invalidTask = tasks.some(
        t => !t.group || !t.task || !t.input_type
      );

      if (invalidTask) {
        toast.error('Please fill all required task fields');
        return;
      }
    }


    setLoading(true);

    try {
      const payload = new FormData();

      // -------------------------
      // BASE FIELDS (always send)
      // -------------------------
      const baseFields = [
        'audit_for',
        'activity_name',
        'description',
        'allow_observations',
        'checklist_type',
        'assign_to',
        'scan_type',
        'plan_duration',
        'priority',
        'email_trigger_rule',
        'supervisors',
        'frequency',
        'start_from',
        'end_at',
        'create_new',
        'create_task',
        'weightage',
      ];

      baseFields.forEach((key) => {
        const value = (formData as any)[key];
        if (value !== '' && value !== null && value !== undefined) {
          payload.append(
            `audit[${key}]`,
            typeof value === 'boolean' ? (value ? '1' : '0') : String(value)
          );
        }
      });

      payload.append('audit[asset_name]', formData.asset_name || '');
      payload.append('audit[service_name]', formData.service_name || '');
      payload.append('audit[vendor_name]', formData.vendor_name || '');
      payload.append('audit[training_name]', formData.training_name || '');

      payload.append('audit[site_id]', SITEID || '');
      if (formData.category_id) {
        payload.append('audit[category]', formData.category_id);
      }

      if (formData.supplier_id) {
        payload.append('audit[select_supplier]', formData.supplier_id);
      }

      if (formData.look_overdue_task) {
        payload.append('audit[look_overdue_task]', formData.look_overdue_task);
      }
      if (tasks.length > 0) {
        payload.append('audit[create_task]', '1');
      }

      if (tasks.length > 0) {
        tasks.forEach((task, index) => {
          payload.append(`audit[audit_tasks][][${index}][group]`, task.group);
          payload.append(`audit[audit_tasks][][${index}][sub_group]`, task.sub_group);
          payload.append(`audit[audit_tasks][][${index}][task]`, task.task);
          payload.append(`audit[audit_tasks][][${index}][input_type]`, task.input_type);

          payload.append(
            `audit[audit_tasks][][${index}][mandatory]`,
            task.mandatory ? '1' : '0'
          );

          payload.append(
            `audit[audit_tasks][][${index}][reading]`,
            task.reading ? '1' : '0'
          );

          payload.append(
            `audit[audit_tasks][][${index}][help_text]`,
            task.help_text ? '1' : '0'
          );
        });
      }


      // Optional: still keep logic clear
      if (formData.audit_for === 'Asset' && !formData.asset_name) {
        payload.set('audit[asset_name]', '');
      }

      // DEBUG (remove later)
      for (const pair of payload.entries()) {
        console.log(pair[0], pair[1]);
      }

      await postAuditScheduled(payload);


      toast.success('Audit scheduled successfully');
      navigate('/audit/operational/scheduled');

    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="p-6">
      <Breadcrumb
        items={[
          { label: "FM Module", path: "/audit" },
          { label: "Audit", path: "/audit" },
          { label: "Operational",path:"/audit" },
          { label: "Scheduled", path: "/audit/operational/scheduled" },
          { label: "Edit" },
        ]}
      />

      <form onSubmit={handleSubmit}>
        {/* Toggle Section */}
        <div className="flex gap-6 mb-6 mt-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="create_new"
              checked={formData.create_new}
              onChange={handleInputChange}
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
            />
            <span className="text-sm font-medium text-foreground">Create New</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="create_task"
              checked={formData.create_task}
              onChange={handleInputChange}
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
            />
            <span className="text-sm font-medium text-foreground">Create Task</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="weightage"
              checked={formData.weightage}
              onChange={handleInputChange}
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
            />
            <span className="text-sm font-medium text-foreground">Weightage</span>
          </label>
        </div>

        {/* Basic Info Section */}
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-lg">
              <ClipboardList className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Basic Info</h2>
          </div>

          {/* Schedule For Buttons */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-foreground mb-3">Schedule For</label>
            <div className="flex flex-wrap gap-2">
              {scheduleTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleScheduleTypeChange(type)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${formData.audit_for === type
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-accent'
                    }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Activity Name *</label>
              <input
                type="text"
                name="activity_name"
                value={formData.activity_name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter Activity Name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                placeholder="Enter Description"
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="allow_observations"
                checked={formData.allow_observations}
                onChange={handleInputChange}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
              />
              <span className="text-sm font-medium text-foreground">Allow Observations</span>
            </label>
          </div>
        </div>

        {/* Task Section */}
        {/* Task Section */}
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-foreground">Task</h2>
            <button
              type="button"
              onClick={addTask}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm"
            >
              <Plus size={16} />
              Add Section
            </button>
          </div>

          {tasks.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No tasks added yet. Click "Add Section" to add tasks.</p>
          ) : (
            <div className="space-y-6">
              {tasks.map((task, index) => (
                <div key={task.id} className="p-4 border border-border rounded-lg">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-medium text-foreground">Task {index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeTask(task.id)}
                      className="text-sm text-destructive hover:underline"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Group</label>
                      <select
                        value={task.group}
                        onChange={(e) => updateTask(task.id, 'group', e.target.value)}
                        className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="">Select Group</option>
                        <option value="general">General</option>
                        <option value="safety">Safety</option>
                        <option value="maintenance">Maintenance</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">SubGroup</label>
                      <select
                        value={task.subgroup}
                        onChange={(e) => updateTask(task.id, 'subgroup', e.target.value)}
                        className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="">Select SubGroup</option>
                        <option value="sub1">SubGroup 1</option>
                        <option value="sub2">SubGroup 2</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Task</label>
                      <input
                        type="text"
                        value={task.task}
                        onChange={(e) => updateTask(task.id, 'task', e.target.value)}
                        className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Enter Task"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Input Type</label>
                      <select
                        value={task.input_type}
                        onChange={(e) => updateTask(task.id, 'input_type', e.target.value)}
                        className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        {inputTypes.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={task.mandatory}
                        onChange={(e) => updateTask(task.id, 'mandatory', e.target.checked)}
                        className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-foreground">Mandatory</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={task.reading}
                        onChange={(e) => updateTask(task.id, 'reading', e.target.checked)}
                        className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-foreground">Reading</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={task.help_text}
                        onChange={(e) => updateTask(task.id, 'help_text', e.target.checked)}
                        className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-foreground">Help Text</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Schedule Section */}
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Schedule</h2>
          </div>

          {/* Checklist Type Radio */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-foreground mb-3">Checklist Type</label>
            <div className="flex gap-4">
              {checklistTypes.map((type) => (
                <label key={type} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="checklist_type"
                    checked={formData.checklist_type === type}
                    onChange={() => handleChecklistTypeChange(type)}
                    className="w-4 h-4 text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-foreground">{type}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Assign To</label>
              <select
                name="assign_to"
                value={formData.assign_to}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select</option>
                {assignedUsers.map((user) => (
                  <option key={user.id} value={user.id}>{user.firstname} {user.lastname}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Scan Type</label>
              <select
                name="scan_type"
                value={formData.scan_type}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select</option>
                {scanTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Plan Duration</label>
              <select
                name="plan_duration"
                value={formData.plan_duration}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select</option>
                <option value="15">15 mins</option>
                <option value="30">30 mins</option>
                <option value="60">1 hour</option>
                <option value="120">2 hours</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Priority</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {priorities.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Email Trigger Rule</label>
              <select
                name="email_trigger_rule"
                value={formData.email_trigger_rule}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select</option>
                <option value="on_create">On Create</option>
                <option value="on_complete">On Complete</option>
                <option value="on_overdue">On Overdue</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Supervisors</label>
              <select
                name="supervisors"
                value={formData.supervisors}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select</option>
                {assignedUsers.map((user) => (
                  <option key={user.id} value={user.id}>{user.firstname} {user.lastname}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Category</label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Lock Overdue Task</label>
              <select
                name="look_overdue_task"
                value={formData.look_overdue_task}
                onChange={handleInputChange}

                className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Frequency</label>
              <select
                name="frequency"
                value={formData.frequency}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {frequencies.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Start From</label>
              <input
                type="date"
                name="start_from"
                value={formData.start_from}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">End At</label>
              <input
                type="date"
                name="end_at"
                value={formData.end_at}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Select Supplier</label>
              <select
                name="supplier_id"
                value={formData.supplier_id}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>{s.vendor_name || s.company_name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-border">
          <button
            type="button"
            onClick={() => navigate('/audit/operational/scheduledaudit')}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-black  hover:bg-primary/90 rounded-lg  border border-gray-300 transition-colors"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2  text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Submit
              </>
            )}
          </button>
        </div>
      </form >
    </div >
  );
};

export default ScheduleAuditForm;