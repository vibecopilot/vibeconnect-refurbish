import React, { useMemo, useState } from "react";
import { BiFilterAlt } from "react-icons/bi";
import { IoAddCircleOutline } from "react-icons/io5";
import { Link } from "react-router-dom";
import Breadcrumb from "../../components/ui/Breadcrumb";
import Button from "../../components/ui/Button";
import DataTable from "../../components/ui/DataTable";
import FormGrid from "../../components/ui/FormGrid";
import FormInput from "../../components/ui/FormInput";
import FormSection from "../../components/ui/FormSection";

const FMUserSetupNew: React.FC = () => {
  const [showFilter, setShowFilter] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filterName, setFilterName] = useState("");
  const [filterEmail, setFilterEmail] = useState("");

  const data = [
    {
      id: 1,
      active: true,
      userId: "99991",
      userName: "Vivek singhROR",
      gender: "Male",
      mobileNumber: "9988009988",
      email: "venderportal5@gmail.com",
      unit: "TCS B Unit",
      role: "QA",
      cluster: "-",
      employeeId: "-",
      accessLevel: "Site",
      type: "Admin",
      status: "Approved",
      faceRecognition: "No",
      appDownloaded: "Yes",
    },
  ];

  const filteredUsers = useMemo(() => {
    const searchNeedle = searchText.toLowerCase();
    const nameNeedle = filterName.toLowerCase();
    const emailNeedle = filterEmail.toLowerCase();

    return data.filter((user) => {
      const matchesSearch =
        !searchNeedle ||
        user.userName.toLowerCase().includes(searchNeedle) ||
        user.email.toLowerCase().includes(searchNeedle) ||
        user.mobileNumber.toLowerCase().includes(searchNeedle);

      const matchesName =
        !nameNeedle || user.userName.toLowerCase().includes(nameNeedle);

      const matchesEmail =
        !emailNeedle || user.email.toLowerCase().includes(emailNeedle);

      return matchesSearch && matchesName && matchesEmail;
    });
  }, [data, searchText, filterName, filterEmail]);

  const columns = [
    {
      key: "actions",
      header: "Actions",
      render: (_val: unknown, row: typeof data[0]) => (
        <Link to={`/admin/fm-user-details/${row.id}`}>View</Link>
      ),
    },
    {
      key: "active",
      header: "Active",
      render: (val: boolean) => (
        <input type="checkbox" checked={val} readOnly />
      ),
    },
    { key: "userId", header: "Id", render: (val: string) => val || "-" },
    { key: "userName", header: "User Name", render: (val: string) => val || "-" },
    { key: "gender", header: "Gender", render: (val: string) => val || "-" },
    {
      key: "mobileNumber",
      header: "Mobile Number",
      render: (val: string) => val || "-",
    },
    { key: "email", header: "Email", render: (val: string) => val || "-" },
    { key: "unit", header: "Unit", render: (val: string) => val || "-" },
    { key: "role", header: "Role", render: (val: string) => val || "-" },
    { key: "cluster", header: "Cluster", render: (val: string) => val || "-" },
    {
      key: "employeeId",
      header: "Employee ID",
      render: (val: string) => val || "-",
    },
    {
      key: "accessLevel",
      header: "Access Level",
      render: (val: string) => val || "-",
    },
    { key: "type", header: "Type", render: (val: string) => val || "-" },
    { key: "status", header: "Status", render: (val: string) => val || "-" },
    {
      key: "faceRecognition",
      header: "Face Recognition",
      render: (val: string) => val || "-",
    },
    {
      key: "appDownloaded",
      header: "App Downloaded",
      render: (val: string) => val || "-",
    },
  ];

  return (
    <section className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Setup", path: "/setup" },
          { label: "General" },
          { label: "FM User" },
        ]}
      />
      <FormSection title="FM User">
        <div className="space-y-4">
          <FormGrid columns={2}>
            <FormInput
              label="Search"
              name="search"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search by name, email, or mobile"
            />
            <div className="flex items-end justify-end gap-2">
              <Link to="/admin/add-fm-user">
                <Button leftIcon={<IoAddCircleOutline className="w-4 h-4" />}>
                  Add FM User
                </Button>
              </Link>
              <Button variant="outline">Import</Button>
              <Button
                variant="outline"
                leftIcon={<BiFilterAlt className="w-4 h-4" />}
                onClick={() => setShowFilter((prev) => !prev)}
              >
                Filter
              </Button>
            </div>
          </FormGrid>

          {showFilter && (
            <div className="border border-border rounded-lg p-4 bg-card">
              <FormGrid columns={3}>
                <FormInput
                  label="Name"
                  name="filterName"
                  value={filterName}
                  onChange={(e) => setFilterName(e.target.value)}
                  placeholder="Enter Name"
                />
                <FormInput
                  label="Email"
                  name="filterEmail"
                  value={filterEmail}
                  onChange={(e) => setFilterEmail(e.target.value)}
                  placeholder="Enter Email"
                />
                <div className="flex items-end gap-2">
                  <Button onClick={() => setShowFilter(true)}>Apply</Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setFilterName("");
                      setFilterEmail("");
                    }}
                  >
                    Reset
                  </Button>
                </div>
              </FormGrid>
            </div>
          )}

          <DataTable columns={columns} data={filteredUsers} />
        </div>
      </FormSection>
    </section>
  );
};

export default FMUserSetupNew;
