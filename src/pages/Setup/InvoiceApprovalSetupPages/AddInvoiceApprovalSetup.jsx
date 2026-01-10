import React, { useState } from "react";
import { FaTrash } from "react-icons/fa";
import { IoMdAdd } from "react-icons/io";
import Select from "react-select";
import Breadcrumb from "../../../components/ui/Breadcrumb";
import Button from "../../../components/ui/Button";
import FormGrid from "../../../components/ui/FormGrid";
import FormInput from "../../../components/ui/FormInput";
import FormSection from "../../../components/ui/FormSection";

function AddInvoiceApprovalsSetup() {
  const [invoiceApproval, setInvoiceApproval] = useState([
    { nameLevel: "", order: "" },
  ]);
  const handleAddInvoiceApproval = (event) => {
    event.preventDefault();
    setInvoiceApproval([...invoiceApproval, { nameLevel: "", order: "" }]);
  };
  const handleInputChange = (index, event) => {
    const { name, value } = event.target;
    const newInvoiceApproval = [...incident];
    newInvoiceApproval[index][name] = value;
    setInvoiceApproval(newInvoiceApproval);
  };
  const handleRemoveInvoiceApproval = (index) => {
    const newInvoiceApproval = [...invoiceApproval];
    newInvoiceApproval.splice(index, 1);
    setInvoiceApproval(newInvoiceApproval);
  };
  const [formData, setFormData] = useState({
    users: [],
    repeat: false,
  });
  const options = [
    {
      value: "Akshat",
      label: "Akshat",
      email: "akshat.shrawat@vibecopilot.ai",
    },
    { value: "Kunal", label: "Kunal", email: "kunal.sah@vibecopilot.ai" },
    { value: "Anurag", label: "Anurag", email: "anurag.sharma@vibecopilot.ai" },
  ];

  return (
    <section className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Setup", path: "/setup" },
          { label: "Finance" },
          { label: "Invoice Approval", path: "/admin/invoice-approval-setup" },
          { label: "Add" },
        ]}
      />
      <FormSection title="Add Invoice Approval">
        <div className="space-y-6">
          <FormGrid columns={4}>
            <FormInput
              label="Function"
              name="function"
              type="select"
              options={[
                { value: "", label: "Select Function" },
                { value: "Purchase Order", label: "Purchase Order" },
                { value: "GRN", label: "GRN" },
                { value: "Work Order", label: "Work Order" },
                { value: "Work Order Invoice", label: "Work Order Invoice" },
              ]}
            />
          </FormGrid>

          <div className="border-t border-border pt-4">
            <h2 className="text-lg font-semibold mb-4">Approval Levels</h2>
            <div className="space-y-4">
              {invoiceApproval.map((invoiceApproval1, index) => (
                <div key={index}>
                  <FormGrid columns={2}>
                    <FormInput
                      label="Order"
                      name="order"
                      value={invoiceApproval.order}
                      onChange={(event) => handleInputChange(index, event)}
                      placeholder="Enter Order"
                    />
                    <FormInput
                      label="Name of Level"
                      name="nameLevel"
                      value={invoiceApproval.levelName}
                      onChange={(event) => handleInputChange(index, event)}
                      placeholder="Enter Name of Level"
                    />
                    <div className="flex flex-col">
                      <label className="text-sm text-muted-foreground mb-1.5">
                        Users
                      </label>
                      <div className="flex gap-3">
                        <Select
                          className="w-full"
                          options={options}
                          isMulti
                          value={formData.users}
                          onChange={(selectedOption) =>
                            setFormData({ ...formData, users: selectedOption })
                          }
                        />
                        <Button
                          variant="outline"
                          onClick={() => handleRemoveInvoiceApproval(index)}
                        >
                          <FaTrash />
                        </Button>
                      </div>
                    </div>
                  </FormGrid>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Button
              variant="outline"
              leftIcon={<IoMdAdd className="w-4 h-4" />}
              onClick={handleAddInvoiceApproval}
            >
              Add Level
            </Button>
          </div>

          <div className="flex justify-end">
            <Button>Create</Button>
          </div>
        </div>
      </FormSection>
    </section>
  );
}

export default AddInvoiceApprovalsSetup;
