import React, { useMemo, useState } from "react";
import Breadcrumb from "../../components/ui/Breadcrumb";
import Button from "../../components/ui/Button";
import DataTable from "../../components/ui/DataTable";
import FormGrid from "../../components/ui/FormGrid";
import FormInput from "../../components/ui/FormInput";
import FormSection from "../../components/ui/FormSection";
import TabNavigation from "../../components/ui/TabNavigation";

type Department = {
  id: string;
  name: string;
  code: string;
  description?: string;
  owner?: string;
  status: "active" | "inactive";
};

type Role = {
  id: string;
  name: string;
  departmentId: string;
  description?: string;
  roleType: string;
  status: "active" | "inactive";
};

type PermissionSet = {
  all: boolean;
  add: boolean;
  view: boolean;
  edit: boolean;
  disable: boolean;
};

const accessModules = [
  { type: "category", label: "General" },
  { type: "module", label: "Account" },
  { type: "module", label: "Users" },
  { type: "module", label: "User Roles" },
  { type: "module", label: "FM User" },
  { type: "category", label: "FM Module" },
  { type: "module", label: "Assets" },
  { type: "module", label: "Master Checklist" },
  { type: "module", label: "Meter Category Type" },
  { type: "category", label: "Service Desk" },
  { type: "module", label: "Ticket" },
  { type: "category", label: "CRM" },
  { type: "module", label: "Contact Category" },
  { type: "module", label: "Supplier" },
  { type: "module", label: "Visitor" },
  { type: "module", label: "Visitor Alerts" },
  { type: "category", label: "Value Added Services" },
  { type: "module", label: "Workspace Booking" },
  { type: "module", label: "F&B" },
  { type: "category", label: "Finance" },
  { type: "module", label: "Invoice Approval" },
  { type: "module", label: "Billing" },
  { type: "module", label: "Addresses" },
  { type: "module", label: "SAC/HSN Setup" },
  { type: "category", label: "Booking Management" },
  { type: "module", label: "Parking" },
  { type: "category", label: "Transitioning" },
  { type: "module", label: "Permit" },
  { type: "category", label: "Compliance" },
  { type: "module", label: "Incidents Setup" },
  { type: "module", label: "Compliance Setup" },
  { type: "module", label: "Communication Setup Control" },
];

const createEmptyPermissions = (): PermissionSet => ({
  all: false,
  add: false,
  view: false,
  edit: false,
  disable: false,
});

const UserRolesSetup: React.FC = () => {
  const [activeTab, setActiveTab] = useState("department");
  const [departments, setDepartments] = useState<Department[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");
  const [selectedRoleId, setSelectedRoleId] = useState("");

  const [departmentForm, setDepartmentForm] = useState({
    name: "",
    code: "",
    description: "",
    owner: "",
    status: "active",
  });

  const [roleForm, setRoleForm] = useState({
    name: "",
    departmentId: "",
    description: "",
    roleType: "Custom",
    status: "active",
  });

  const [permissionsByRole, setPermissionsByRole] = useState<
    Record<string, Record<string, PermissionSet>>
  >({});

  const departmentColumns = useMemo(
    () => [
      {
        key: "index",
        header: "Sr. No.",
        render: (_val: unknown, _row: Department, index: number) => index + 1,
        width: "80px",
      },
      { key: "name", header: "Department", render: (val: string) => val || "-" },
      { key: "code", header: "Code", render: (val: string) => val || "-" },
      {
        key: "owner",
        header: "Owner",
        render: (val: string) => val || "-",
      },
      {
        key: "status",
        header: "Status",
        render: (val: string) => (val === "active" ? "Active" : "Inactive"),
      },
    ],
    []
  );

  const roleList = useMemo(() => {
    if (!selectedDepartmentId) return roles;
    return roles.filter((role) => role.departmentId === selectedDepartmentId);
  }, [roles, selectedDepartmentId]);

  const handleDepartmentChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setDepartmentForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setRoleForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddDepartment = () => {
    if (!departmentForm.name || !departmentForm.code) {
      return;
    }
    const newDepartment: Department = {
      id: `${Date.now()}`,
      name: departmentForm.name,
      code: departmentForm.code,
      description: departmentForm.description,
      owner: departmentForm.owner,
      status: departmentForm.status === "inactive" ? "inactive" : "active",
    };
    setDepartments((prev) => [newDepartment, ...prev]);
    setDepartmentForm({
      name: "",
      code: "",
      description: "",
      owner: "",
      status: "active",
    });
  };

  const handleAddRole = () => {
    if (!roleForm.name || !roleForm.departmentId) {
      return;
    }
    const newRole: Role = {
      id: `${Date.now()}`,
      name: roleForm.name,
      departmentId: roleForm.departmentId,
      description: roleForm.description,
      roleType: roleForm.roleType,
      status: roleForm.status === "inactive" ? "inactive" : "active",
    };
    setRoles((prev) => [newRole, ...prev]);
    setSelectedRoleId(newRole.id);
    const moduleList = accessModules
      .filter((item) => item.type === "module")
      .map((item) => item.label);
    setPermissionsByRole((prev) => ({
      ...prev,
      [newRole.id]: moduleList.reduce((acc, moduleName) => {
        acc[moduleName] = createEmptyPermissions();
        return acc;
      }, {} as Record<string, PermissionSet>),
    }));
    setRoleForm({
      name: "",
      departmentId: "",
      description: "",
      roleType: "Custom",
      status: "active",
    });
  };

  const handlePermissionChange = (
    moduleName: string,
    field: keyof PermissionSet
  ) => {
    if (!selectedRoleId) return;
    setPermissionsByRole((prev) => {
      const rolePermissions = prev[selectedRoleId] || {};
      const current = rolePermissions[moduleName] || createEmptyPermissions();
      const updated = { ...current, [field]: !current[field] };
      if (field === "all") {
        updated.add = !current.all;
        updated.view = !current.all;
        updated.edit = !current.all;
        updated.disable = !current.all;
      } else {
        updated.all =
          updated.add && updated.view && updated.edit && updated.disable;
      }
      return {
        ...prev,
        [selectedRoleId]: {
          ...rolePermissions,
          [moduleName]: updated,
        },
      };
    });
  };

  const currentPermissions = permissionsByRole[selectedRoleId] || {};

  return (
    <section className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Setup", path: "/setup" },
          { label: "General" },
          { label: "User Roles" },
        ]}
      />
      <FormSection title="User Roles">
        <TabNavigation
          tabs={[
            { id: "department", label: "Department" },
            { id: "roles", label: "User Roles" },
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {activeTab === "department" && (
          <div className="space-y-6">
            <FormGrid columns={3}>
              <FormInput
                label="Department Name"
                name="name"
                value={departmentForm.name}
                onChange={handleDepartmentChange}
                placeholder="Enter Department Name"
              />
              <FormInput
                label="Department Code"
                name="code"
                value={departmentForm.code}
                onChange={handleDepartmentChange}
                placeholder="Enter Department Code"
              />
              <FormInput
                label="Owner / Head"
                name="owner"
                value={departmentForm.owner}
                onChange={handleDepartmentChange}
                placeholder="Enter Owner Name"
              />
              <FormInput
                label="Description"
                name="description"
                value={departmentForm.description}
                onChange={handleDepartmentChange}
                placeholder="Enter Description"
              />
              <FormInput
                label="Status"
                name="status"
                type="select"
                value={departmentForm.status}
                onChange={handleDepartmentChange}
                options={[
                  { value: "active", label: "Active" },
                  { value: "inactive", label: "Inactive" },
                ]}
              />
              <div className="flex items-end">
                <Button onClick={handleAddDepartment}>Create Department</Button>
              </div>
            </FormGrid>

            <DataTable columns={departmentColumns} data={departments} />
          </div>
        )}

        {activeTab === "roles" && (
          <div className="space-y-6">
            <FormGrid columns={3}>
              <FormInput
                label="Role Name"
                name="name"
                value={roleForm.name}
                onChange={handleRoleChange}
                placeholder="Enter Role Name"
              />
              <FormInput
                label="Department"
                name="departmentId"
                type="select"
                value={roleForm.departmentId}
                onChange={handleRoleChange}
                options={departments.map((dept) => ({
                  value: dept.id,
                  label: dept.name,
                }))}
                placeholder="Select Department"
              />
              <FormInput
                label="Role Type"
                name="roleType"
                type="select"
                value={roleForm.roleType}
                onChange={handleRoleChange}
                options={[
                  { value: "Admin", label: "Admin" },
                  { value: "Manager", label: "Manager" },
                  { value: "Staff", label: "Staff" },
                  { value: "Custom", label: "Custom" },
                ]}
              />
              <FormInput
                label="Description"
                name="description"
                value={roleForm.description}
                onChange={handleRoleChange}
                placeholder="Enter Description"
              />
              <FormInput
                label="Status"
                name="status"
                type="select"
                value={roleForm.status}
                onChange={handleRoleChange}
                options={[
                  { value: "active", label: "Active" },
                  { value: "inactive", label: "Inactive" },
                ]}
              />
              <div className="flex items-end">
                <Button onClick={handleAddRole}>Create Role</Button>
              </div>
            </FormGrid>

            <FormGrid columns={2}>
              <FormInput
                label="Filter by Department"
                name="selectedDepartmentId"
                type="select"
                value={selectedDepartmentId}
                onChange={(e) => setSelectedDepartmentId(e.target.value)}
                options={[
                  { value: "", label: "All Departments" },
                  ...departments.map((dept) => ({
                    value: dept.id,
                    label: dept.name,
                  })),
                ]}
              />
            </FormGrid>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-4 border border-border rounded-lg bg-card">
                <div className="px-4 py-3 border-b border-border font-semibold">
                  Roles
                </div>
                <div className="p-3 space-y-2">
                  {roleList.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      No roles created yet.
                    </p>
                  )}
                  {roleList.map((role) => (
                    <button
                      key={role.id}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        selectedRoleId === role.id
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      }`}
                      onClick={() => setSelectedRoleId(role.id)}
                    >
                      {role.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-8 border border-border rounded-lg bg-card">
                <div className="px-4 py-3 border-b border-border font-semibold">
                  Access Rights
                </div>
                <div className="p-3 overflow-x-auto">
                  {!selectedRoleId ? (
                    <p className="text-sm text-muted-foreground">
                      Select a role to assign access rights.
                    </p>
                  ) : (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-xs uppercase text-muted-foreground">
                          <th className="py-2 px-3">Module</th>
                          <th className="py-2 px-3">All</th>
                          <th className="py-2 px-3">Add</th>
                          <th className="py-2 px-3">View</th>
                          <th className="py-2 px-3">Edit</th>
                          <th className="py-2 px-3">Disable</th>
                        </tr>
                      </thead>
                      <tbody>
                        {accessModules.map((item) => {
                          if (item.type === "category") {
                            return (
                              <tr
                                key={`cat-${item.label}`}
                                className="border-t border-border bg-muted/40"
                              >
                                <td
                                  className="py-2 px-3 font-semibold text-foreground"
                                  colSpan={6}
                                >
                                  {item.label}
                                </td>
                              </tr>
                            );
                          }
                          const perms =
                            currentPermissions[item.label] ||
                            createEmptyPermissions();
                          return (
                            <tr
                              key={item.label}
                              className="border-t border-border"
                            >
                              <td className="py-2 px-3">{item.label}</td>
                              {(["all", "add", "view", "edit", "disable"] as const).map(
                                (field) => (
                                  <td key={field} className="py-2 px-3">
                                    <input
                                      type="checkbox"
                                      checked={perms[field]}
                                      onChange={() =>
                                        handlePermissionChange(item.label, field)
                                      }
                                    />
                                  </td>
                                )
                              )}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </FormSection>
    </section>
  );
};

export default UserRolesSetup;
