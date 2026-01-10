import React, { useState } from "react";
import Breadcrumb from "../../components/ui/Breadcrumb";
import Button from "../../components/ui/Button";
import FormGrid from "../../components/ui/FormGrid";
import FormInput from "../../components/ui/FormInput";
import FormSection from "../../components/ui/FormSection";

const AddFMUserSetupNew: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    mobileNumber: "",
    email: "",
    gender: "",
    userCategory: "",
    employeeId: "",
    baseUnit: "",
    department: "",
    employeeEmails: "",
    designation: "",
    userType: "",
    role: "",
    accessLevel: "",
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
          { label: "Add" },
        ]}
      />
      <FormSection title="Add FM User">
        <div className="space-y-6">
          <FormGrid columns={4}>
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
              label="Mobile Number"
              name="mobileNumber"
              value={formData.mobileNumber}
              onChange={handleChange}
              placeholder="Mobile Number"
            />
            <FormInput
              label="Email Address"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter Email"
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
              label="Employee Id"
              name="employeeId"
              value={formData.employeeId}
              onChange={handleChange}
              placeholder="Employee Id"
            />
            <FormInput
              label="Base Unit"
              name="baseUnit"
              type="select"
              value={formData.baseUnit}
              onChange={handleChange}
              options={[
                { value: "", label: "Select Base Unit" },
                { value: "TCS B Unit", label: "TCS B Unit" },
                { value: "Clone Unit", label: "Clone Unit" },
                { value: "HDFC Ergo", label: "HDFC Ergo Bhandup- Floor1-101" },
                { value: "Unit A 01", label: "Unit A 01" },
              ]}
            />
            <FormInput
              label="Department"
              name="department"
              type="select"
              value={formData.department}
              onChange={handleChange}
              options={[
                { value: "", label: "Select Department" },
                { value: "Electrical", label: "Electrical dept" },
                { value: "Security", label: "Security" },
                { value: "Operations", label: "Operations Dept" },
                { value: "Accounts", label: "Accounts" },
              ]}
            />
            <FormInput
              label="Employee Emails"
              name="employeeEmails"
              type="select"
              value={formData.employeeEmails}
              onChange={handleChange}
              options={[
                { value: "", label: "Select Emails Preference" },
                { value: "All", label: "All Emails" },
                { value: "Critical", label: "Critical Email Only" },
                { value: "None", label: "No Emails" },
              ]}
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
          </FormGrid>

          <div className="flex justify-end">
            <Button>Submit</Button>
          </div>
        </div>
      </FormSection>
    </section>
  );
};

export default AddFMUserSetupNew;
