import React, { useState } from "react";
import { Building, Package, Calendar, FileText, DollarSign, Users } from "lucide-react";
import Breadcrumb from "../../components/ui/Breadcrumb";

const AddAMC = () => {
  const [amcFor, setAmcFor] = useState("asset");
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  const formattedDate = `${year}-${month}-${day}`;
  const [formData, setFormData] = useState({
    asset: "",
    service: "",
    amc_cost: "",
    start_date: formattedDate,
    end_date: formattedDate,
    first_service: formattedDate,
  });

  return (
    <div className="p-4 md:p-6 bg-background">
      <div className="mx-auto max-w-[1400px] xl:max-w-[1600px] space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: "FM Module" },
            { label: "Asset", path: "/asset" },
            { label: "AMC", path: "/asset/amc" },
            { label: "Add AMC" },
          ]}
        />

        {/* Page Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold text-foreground">Add AMC</h1>
          <p className="text-sm text-muted-foreground">
            Create a new Annual Maintenance Contract
          </p>
        </div>

        {/* AMC Type Selection */}
        <div className="bg-card border border-border rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-center gap-4">
            <p className="font-semibold text-foreground">AMC for:</p>
            <button
              className={`font-medium px-6 py-2 rounded-lg transition-all duration-300 ${
                amcFor === "asset"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
              onClick={() => setAmcFor("asset")}
            >
              Asset
            </button>
            <button
              className={`font-medium px-6 py-2 rounded-lg transition-all duration-300 ${
                amcFor === "service"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
              onClick={() => setAmcFor("service")}
            >
              Service
            </button>
          </div>
        </div>

        {/* Details Section */}
        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="bg-primary/5 px-6 py-4 border-b border-border">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Details
            </h2>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {amcFor === "asset" && (
                <div className="flex flex-col">
                  <label htmlFor="asset" className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                    <Package className="w-4 h-4 text-muted-foreground" />
                    Select Asset <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="border border-border p-2.5 rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    name="asset"
                    id="asset"
                  >
                    <option value="">Select Asset</option>
                    <option value="asset 1">Asset 1</option>
                    <option value="asset 2">Asset 2</option>
                    <option value="asset 3">Asset 3</option>
                  </select>
                </div>
              )}
              {amcFor === "service" && (
                <div className="flex flex-col">
                  <label htmlFor="service" className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                    <Building className="w-4 h-4 text-muted-foreground" />
                    Select Service <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="border border-border p-2.5 rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    name="service"
                    id="service"
                  >
                    <option value="">Select Service</option>
                    <option value="service 1">Service 1</option>
                    <option value="service 2">Service 2</option>
                    <option value="service 3">Service 3</option>
                  </select>
                </div>
              )}

              <div className="flex flex-col">
                <label htmlFor="supplier" className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  Select Supplier <span className="text-red-500">*</span>
                </label>
                <select
                  className="border border-border p-2.5 rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  name="supplier"
                  id="supplier"
                >
                  <option value="">Select Supplier</option>
                  <option value="supplier 1">Supplier 1</option>
                  <option value="Supplier 2">Supplier 2</option>
                  <option value="Supplier 3">Supplier 3</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* AMC Details Section */}
        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="bg-primary/5 px-6 py-4 border-b border-border">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              AMC Details
            </h2>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex flex-col">
                <label htmlFor="cost" className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  Cost <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="cost"
                  id="cost"
                  placeholder="Enter Cost"
                  className="border border-border p-2.5 rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div className="flex flex-col">
                <label htmlFor="start_date" className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="start_date"
                  id="start_date"
                  value={formData.start_date}
                  className="border border-border p-2.5 rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div className="flex flex-col">
                <label htmlFor="end_date" className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  End Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="end_date"
                  id="end_date"
                  value={formData.end_date}
                  className="border border-border p-2.5 rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div className="flex flex-col">
                <label htmlFor="first_service" className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  First Service
                </label>
                <input
                  type="date"
                  name="first_service"
                  id="first_service"
                  value={formData.first_service}
                  className="border border-border p-2.5 rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div className="flex flex-col">
                <label htmlFor="payment_term" className="text-sm font-medium text-foreground mb-2">
                  Payment Term
                </label>
                <select
                  className="border border-border p-2.5 rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  name="payment_term"
                  id="payment_term"
                >
                  <option value="">Select Payment Term</option>
                  <option value="yearly">Yearly</option>
                  <option value="half_yearly">Half Yearly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="monthly">Monthly</option>
                  <option value="full_payment">Full Payment</option>
                  <option value="visit_payment">Visit Based Payment</option>
                </select>
              </div>

              <div className="flex flex-col">
                <label htmlFor="visits" className="text-sm font-medium text-foreground mb-2">
                  No. Of Visits
                </label>
                <input
                  type="text"
                  name="visits"
                  id="visits"
                  placeholder="Enter number of visits"
                  className="border border-border p-2.5 rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex flex-col">
              <label htmlFor="remarks" className="text-sm font-medium text-foreground mb-2">
                Remarks
              </label>
              <textarea
                name="text"
                id="remarks"
                placeholder="Enter remarks..."
                rows={4}
                className="border border-border p-2.5 rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium text-foreground">
                  AMC Contracts
                </label>
                <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary transition-colors cursor-pointer">
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    id="amc-contracts"
                  />
                  <label htmlFor="amc-contracts" className="cursor-pointer">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Click to upload or drag and drop
                    </p>
                  </label>
                </div>
              </div>

              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium text-foreground">
                  AMC Invoice
                </label>
                <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary transition-colors cursor-pointer">
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    id="amc-invoice"
                  />
                  <label htmlFor="amc-invoice" className="cursor-pointer">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Click to upload or drag and drop
                    </p>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-3">
          <button
            onClick={() => window.history.back()}
            className="px-6 py-2 border border-border rounded-lg text-foreground hover:bg-accent transition-colors"
          >
            Cancel
          </button>
          <button className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium">
            Save & Show Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddAMC;
