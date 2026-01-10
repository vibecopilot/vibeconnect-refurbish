import React, { useState } from "react";
import Breadcrumb from "../../components/ui/Breadcrumb";
import Button from "../../components/ui/Button";
import FormGrid from "../../components/ui/FormGrid";
import FormInput from "../../components/ui/FormInput";
import FormSection from "../../components/ui/FormSection";

const EditFMUserSetupNew: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    gender: "",
    companyCluster: "",
    mobile: "",
    email: "",
    userCategory: "",
    employee: "",
    lastWorkingDay: "",
    site: "",
    baseUnit: "",
    department: "",
    designation: "",
    userType: "",
    role: "",
    accessLevel: "",
    access: "",
    emailPreference: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <section className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Setup", path: "/setup" },
          { label: "General" },
          { label: "FM User", path: "/admin/fm-user" },
          { label: "Edit" },
        ]}
      />
      <FormSection title="FM User Edit Details">
        <div className="space-y-6">
          <div className="flex justify-center">
            <img
              src="/profile.png"
              alt="Profile"
              className="h-32 w-32 rounded-full border border-border object-cover"
            />
          </div>
          <FormGrid columns={3}>
            <FormInput
              label="First Name"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="First Name"
            />
            <FormInput
              label="Last Name"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Last Name"
            />
            <FormInput
              label="Gender"
              name="gender"
              type="select"
              value={formData.gender}
              onChange={handleChange}
              options={[
                { value: "", label: "Select Gender" },
                { value: "Male", label: "Male" },
                { value: "Female", label: "Female" },
              ]}
            />
            <FormInput
              label="Company Cluster"
              name="companyCluster"
              value={formData.companyCluster}
              onChange={handleChange}
              placeholder="Company Cluster"
            />
            <FormInput
              label="Mobile"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              placeholder="Enter Mobile"
            />
            <FormInput
              label="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter Email"
            />
            <FormInput
              label="User Category"
              name="userCategory"
              type="select"
              value={formData.userCategory}
              onChange={handleChange}
              options={[
                { value: "", label: "Select Category" },
                { value: "Internal", label: "Internal" },
                { value: "External", label: "External" },
              ]}
            />
            <FormInput
              label="Employee"
              name="employee"
              value={formData.employee}
              onChange={handleChange}
              placeholder="Enter Employee"
            />
            <FormInput
              label="Last Working Day"
              name="lastWorkingDay"
              type="date"
              value={formData.lastWorkingDay}
              onChange={handleChange}
              placeholder="Last Working Day"
            />
            <FormInput
              label="Site"
              name="site"
              value={formData.site}
              onChange={handleChange}
              placeholder="Site"
            />
            <FormInput
              label="Base Unit"
              name="baseUnit"
              value={formData.baseUnit}
              onChange={handleChange}
              placeholder="Base Unit"
            />
            <FormInput
              label="Department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              placeholder="Department"
            />
            <FormInput
              label="Designation"
              name="designation"
              value={formData.designation}
              onChange={handleChange}
              placeholder="Designation"
            />
            <FormInput
              label="User Type"
              name="userType"
              type="select"
              value={formData.userType}
              onChange={handleChange}
              options={[
                { value: "", label: "Select User Type" },
                { value: "Admin", label: "Admin (web & app)" },
                { value: "Technician", label: "Technician (app)" },
                { value: "SiteEngineer", label: "Site Engineer" },
              ]}
            />
            <FormInput
              label="Role"
              name="role"
              type="select"
              value={formData.role}
              onChange={handleChange}
              options={[
                { value: "", label: "Select Role" },
                { value: "Account Manager", label: "Account Manager" },
                { value: "Executive", label: "Executive" },
                { value: "Manager", label: "Manager" },
                { value: "Admin", label: "Admin" },
              ]}
            />
            <FormInput
              label="Access Level"
              name="accessLevel"
              type="select"
              value={formData.accessLevel}
              onChange={handleChange}
              options={[
                { value: "", label: "Select Access Level" },
                { value: "Company", label: "Company" },
                { value: "Region", label: "Region" },
                { value: "Site", label: "Site" },
              ]}
            />
            <FormInput
              label="Access"
              name="access"
              type="select"
              value={formData.access}
              onChange={handleChange}
              options={[
                { value: "", label: "Select Access" },
                { value: "All", label: "All" },
                { value: "Limited", label: "Limited" },
              ]}
            />
            <FormInput
              label="Email Preference"
              name="emailPreference"
              type="select"
              value={formData.emailPreference}
              onChange={handleChange}
              options={[
                { value: "", label: "Select Email Preference" },
                { value: "All", label: "All Emails" },
                { value: "Critical", label: "Critical Email Only" },
                { value: "None", label: "No Emails" },
              ]}
            />
          </FormGrid>

          <div className="flex justify-end">
            <Button>Update</Button>
          </div>
        </div>
      </FormSection>
    </section>
  );
};

export default EditFMUserSetupNew;
