import React, { useEffect, useMemo, useState } from "react";
import Table from "../../components/table/Table";
import { PiPlusCircle } from "react-icons/pi";
import { Link, useNavigate } from "react-router-dom";
import { BsEye } from "react-icons/bs";
import { getComplianceConfiguration } from "../../api";
import { getItemInLocalStorage } from "../../utils/localStorage";
import Breadcrumb from "../../components/ui/Breadcrumb";
import ListToolbar from "../../components/ui/ListToolbar";
import DataCard from "../../components/ui/DataCard";

const Compliance = () => {
  const [viewMode, setViewMode] = useState("table");
  const [filter, setFilter] = useState(false);
  const [compliances, setCompliances] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    perPage: 10,
    total: 0,
    totalPages: 0,
  });
  const navigate = useNavigate();

  const fetchCompliances = async () => {
    try {
      const res = await getComplianceConfiguration();
      const sortedData = res?.data?.sort((a, b) => {
        return b.created_at - a.created_at;
      });
      console.log("sortedData:",sortedData)
      setCompliances(sortedData);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchCompliances();
  }, []);

  const columns = [
    {
      name: "View",
      selector: (row) => (
        <div>
          <Link to={`/compliance/compliance-details/${row.id}`}>
            <BsEye />
          </Link>
        </div>
      ),
      sortable: true,
    },
    {
      name: "Site",
      selector: (row) => row.site_name || "N/A",
      sortable: true,
      width: "200px",
    },
    {
      name: "Compliance Name",
      selector: (row) => row.name || "N/A",
      sortable: true,
    },
    {
      name: "Vendor",
      selector: (row) => row.assign_to_name || "N/A",
      sortable: true,
    },
    {
      name: "Auditor",
      selector: (row) => row.reviewer_name|| "N/A",
      sortable: true,
    },
    // {
    //   name: "Category",
    //   selector: (row) => row.category,
    //   sortable: true,
    // },
    {
      name: "Due days",
      selector: (row) => `${row.due_in_days} days` || "N/A",
      sortable: true,
    },
    {
      name: "Priority",
      selector: (row) => row.priority || "N/A",
      sortable: true,
    },
    {
      name: "Status",
      selector: (row) => (
        <div>
          <p
            className={`font-medium ${
              row.status === "100% Completed"
                ? "text-green-500"
                : row.status === "50% Completed"
                ? "text-green-400"
                : row.status === "25% Completed"
                ? " text-yellow-400"
                : row.status === "5% Completed"
                ? "text-orange-400"
                : ""
            }`}
          >
            {row.status}
          </p>
        </div>
      ),
      sortable: true,
    },
    // {
    //   name: "Risk Level",
    //   selector: (row) => row.riskLevel,
    //   sortable: true,
    // },
  ];
 

  const userType = getItemInLocalStorage("USERTYPE");

  const filteredCompliances = useMemo(
    () =>
      compliances.filter((item) => {
        const term = searchValue.toLowerCase().trim();
        if (!term) return true;
        return (
          (item.name || "").toLowerCase().includes(term) ||
          (item.site_name || "").toLowerCase().includes(term)
        );
      }),
    [compliances, searchValue]
  );

  useEffect(() => {
    const total = filteredCompliances.length;
    const totalPages = total > 0 ? Math.ceil(total / pagination.perPage) : 1;
    setPagination((prev) => ({
      ...prev,
      total,
      totalPages,
      page: Math.min(prev.page, totalPages),
    }));
  }, [filteredCompliances, pagination.perPage]);

  const paginatedCompliances = useMemo(() => {
    const startIndex = (pagination.page - 1) * pagination.perPage;
    const endIndex = startIndex + pagination.perPage;
    return filteredCompliances.slice(startIndex, endIndex);
  }, [filteredCompliances, pagination.page, pagination.perPage]);

  return (
    <div className="p-6">
      <Breadcrumb
        items={[
          { label: "FM Module" },
          { label: "Compliance", path: "/compliance" },
        ]}
      />

      <ListToolbar
        searchPlaceholder="Search compliance..."
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onFilter={() => setFilter((prev) => !prev)}
        onAdd={
          userType === "pms_admin"
            ? () => navigate("/compliance/add-compliance")
            : undefined
        }
        addLabel="Add Compliance"
      />

      {filter && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-5xl rounded-xl bg-card shadow-xl border border-border">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h2 className="text-lg font-semibold">Filter Compliance</h2>
              <button
                className="text-xl leading-none"
                onClick={() => setFilter(false)}
              >
                ×
              </button>
            </div>

            <div className="px-6 py-4 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Main Company
                  </label>
                  <select
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                    name=""
                    id=""
                  >
                    <option value="">Select Main Company</option>
                    <option value="">Company A</option>
                    <option value="">Company B</option>
                    <option value="">Company C</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Select Unit
                  </label>
                  <select
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                    name=""
                    id=""
                  >
                    <option value="">Select Unit</option>
                    <option value="">Unit A</option>
                    <option value="">Unit B</option>
                    <option value="">Unit C</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Unit
                  </label>
                  <select
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                    name=""
                    id=""
                  >
                    <option value="">Select Unit Type</option>
                    <option value="">Unit Type A</option>
                    <option value="">Unit Type B</option>
                    <option value="">Unit Type C</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    State
                  </label>
                  <select
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                    name=""
                    id=""
                  >
                    <option value="">Select State</option>
                    <option value="">State A</option>
                    <option value="">State Type B</option>
                    <option value="">State C</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Select Location
                  </label>
                  <select
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                    name=""
                    id=""
                  >
                    <option value="">Select Location</option>
                    <option value="">Location A</option>
                    <option value="">Location B</option>
                    <option value="">Location C</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Audit Start Date
                  </label>
                  <input
                    type="date"
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                    name=""
                    id=""
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Audit End Date
                  </label>
                  <input
                    type="date"
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                    name=""
                    id=""
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Audit Month
                  </label>
                  <input
                    type="month"
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                    name=""
                    id=""
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Vendor Category
                  </label>
                  <select
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                    name=""
                    id=""
                  >
                    <option value="">Select vendor Category</option>
                    <option value="">Vendor Category 1</option>
                    <option value="">Vendor Category 2</option>
                    <option value="">Vendor Category 3</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Vendor
                  </label>
                  <select
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                    name=""
                    id=""
                  >
                    <option value="">Select vendor</option>
                    <option value="">Vendor 1</option>
                    <option value="">Vendor 2</option>
                    <option value="">Vendor 3</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Compliance Name
                  </label>
                  <input
                    type="text"
                    placeholder="Compliance Name"
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                    name=""
                    id=""
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Display Score Option
                  </label>
                  <select
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                    name=""
                    id=""
                  >
                    <option value="">Select Score option</option>
                    <option value="">Score option 1</option>
                    <option value="">Score option 2</option>
                    <option value="">Score option 3</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Seal submitted audit
                  </label>
                  <select
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                    name=""
                    id=""
                  >
                    <option value="">Select</option>
                    <option value="">Option 1</option>
                    <option value="">Option 2</option>
                    <option value="">Option 3</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Business vertical
                  </label>
                  <select
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                    name=""
                    id=""
                  >
                    <option value="">Select Business vertical</option>
                    <option value="">Vertical option 1</option>
                    <option value="">Vertical option 2</option>
                    <option value="">Vertical option 3</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-border px-6 py-4">
              <button
                className="rounded-md border border-border px-4 py-2 text-sm"
                onClick={() => setFilter(false)}
              >
                Reset
              </button>
              <button
                className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"
                onClick={() => setFilter(false)}
              >
                Filter
              </button>
            </div>
          </div>
        </div>
      )}
      {viewMode === "grid" && paginatedCompliances.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {paginatedCompliances.map((item) => (
            <DataCard
              key={item.id}
              title={item.name}
              subtitle={item.site_name || "N/A"}
              status={
                item.status === "100% Completed" ? "checked-out" :
                item.status === "50% Completed" ? "maintenance" :
                item.status === "25% Completed" ? "in-store" :
                item.status === "5% Completed" ? "breakdown" : "pending"
              }
              fields={[                
                { label: "Vendor", value: item.assign_to_name || "N/A" },
                { label: "Auditor", value: item.reviewer_name || "N/A" },
                { label: "Due Days", value: `${item.due_in_days} days` || "N/A" },
                { label: "Priority", value: item.priority || "N/A" },
              ]}
              viewPath={`/compliance/compliance-details/${item.id}`}
            />
          ))}
        </div>
      ) : (
        paginatedCompliances.length > 0 && (
          <div>
            <Table
              columns={columns}
              data={paginatedCompliances}
              pagination={false}
              responsive
              highlightOnHover
              pointerOnHover
            />
            
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 p-4 bg-card border border-border rounded-lg">
              <div className="text-sm text-muted-foreground">
                Showing {(pagination.page - 1) * pagination.perPage + 1} to{" "}
                {Math.min(pagination.page * pagination.perPage, pagination.total)}{" "}
                of {pagination.total} records
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPagination((prev) => ({ ...prev, page: 1 }))}
                  disabled={pagination.page === 1}
                  className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent disabled:opacity-50"
                >
                  «
                </button>
                <button
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                  }
                  disabled={pagination.page === 1}
                  className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent disabled:opacity-50"
                >
                  ‹ Prev
                </button>
                <span className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md">
                  {pagination.page}
                </span>
                <button
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                  }
                  disabled={pagination.page >= pagination.totalPages}
                  className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent disabled:opacity-50"
                >
                  Next ›
                </button>
                <button
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, page: prev.totalPages }))
                  }
                  disabled={pagination.page >= pagination.totalPages}
                  className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent disabled:opacity-50"
                >
                  »
                </button>
                <select
                  value={pagination.perPage}
                  onChange={(e) =>
                    setPagination((prev) => ({
                      ...prev,
                      perPage: Number(e.target.value),
                      page: 1,
                    }))
                  }
                  className="px-2 py-1.5 text-sm border border-border rounded-md bg-background"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>
          </div>
        )
      )}
      
      {/* Empty State */}
      {paginatedCompliances.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 bg-card rounded-xl border border-border">
          <div className="w-16 h-16 text-muted-foreground/50 mb-4 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-clipboard-list">
              <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
              <path d="M16 8H8" />
              <path d="M16 12H8" />
              <path d="M16 16H8" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">No Compliance Records Found</h3>
          <p className="text-muted-foreground mb-4">
            {searchValue ? "No compliance records match your search criteria" : "No compliance records have been created yet"}
          </p>
          {userType === "pms_admin" && (
            <button
              onClick={() => navigate("/compliance/add-compliance")}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium"
            >
              + Add Compliance
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Compliance;
