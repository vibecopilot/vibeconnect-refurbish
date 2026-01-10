import React, { useEffect, useMemo, useState } from "react";
import { BiEdit } from "react-icons/bi";
import { RiDeleteBin5Line } from "react-icons/ri";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import AddInvoiceSetupModal from "./AddInvoiceSetupModal";
import EditInvoiceSetupModal from "./EditInvoiceSetupModal";
import FileInputBox from "../../../containers/Inputs/FileInputBox";
import { Switch } from "../../../Buttons";
import {
  getAddressSetup,
  deleteAddressSetup,
  postInvoiceNumber,
  postReceiptNumber,
  getInvoiceTypeSetup,
  postLogoCamBillingSetup,
} from "../../../api";
import Breadcrumb from "../../../components/ui/Breadcrumb";
import Button from "../../../components/ui/Button";
import DataTable from "../../../components/ui/DataTable";
import FormGrid from "../../../components/ui/FormGrid";
import FormInput from "../../../components/ui/FormInput";
import FormSection from "../../../components/ui/FormSection";

function BillingSetup() {
  const [invoiceOption, setInvoiceOption] = useState("invoiceAuto");
  const [receiptOption, setReceiptOption] = useState("receiptAuto");
  const [addInvoiceModal, setAddInvoiceModal] = useState(false);
  const [editInvoiceModal, setEditInvoiceModal] = useState(false);
  const [addressSetup, setAddressSetup] = useState([]);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);
  const [invoiceNumberSetup, setInvoiceNumberSetup] = useState({
    prefix: "",
    nextNumber: "",
  });
  const [receiptNumberSetup, setReceiptNumberSetup] = useState({
    prefix: "",
    nextNumber: "",
  });
  const [invoiceType, setInvoiceType] = useState([]);
  const [logo, setLogo] = useState(null);

  useEffect(() => {
    const fetchAddressSetup = async () => {
      try {
        const response = await getAddressSetup();
        setAddressSetup(response.data);
      } catch (err) {
        console.error("Failed to fetch Address Setup data:", err);
      }
    };
    fetchAddressSetup();
    fetchInvoiceTypeSetup();
  }, []);

  const fetchInvoiceTypeSetup = async () => {
    try {
      const response = await getInvoiceTypeSetup();
      setInvoiceType(response.data);
    } catch (err) {
      console.error("Failed to fetch Address Setup data:", err);
    }
  };

  const navigate = useNavigate();

  const handleAddressSetupDelete = async (id) => {
    try {
      const deleteRes = await deleteAddressSetup(id);
      toast.success("Address setup Deleted Successfully");
      console.log(deleteRes);
    } catch (error) {
      console.log(error);
    } finally {
      setTimeout(() => {
        navigate(0);
      }, 500);
    }
  };

  const handleChange = (event) => {
    setInvoiceOption(event.target.value);
  };

  const handleChangeInvoiceNumber = (e) => {
    const { name, value } = e.target;
    setInvoiceNumberSetup((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleInvoiceNumberSubmit = async () => {
    if (!invoiceNumberSetup.prefix) {
      toast.error("prefix is required ");
      return;
    }
    if (!invoiceNumberSetup.nextNumber) {
      toast.error("Next Number is required ");
      return;
    }
    const sendData = new FormData();
    sendData.append("invoice_setup[auto_generate]", invoiceOption);
    sendData.append("invoice_setup[prefix]", invoiceNumberSetup.prefix);
    sendData.append("invoice_setup[next_number]", invoiceNumberSetup.nextNumber);
    try {
      const invoiceNum = await postInvoiceNumber(sendData);
      toast.success("Invoice Number Added Successfully");
      console.log(invoiceNum);
    } catch (error) {
      console.log(error);
    }
  };
  const handleChangeReceiptOption = (event) => {
    setReceiptOption(event.target.value);
  };
  const handleChangeReceiptNumber = (e) => {
    const { name, value } = e.target;
    setReceiptNumberSetup((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleReceiptNumberSubmit = async () => {
    if (!receiptNumberSetup.prefix) {
      toast.error("prefix is required");
      return;
    }
    if (!receiptNumberSetup.nextNumber) {
      toast.error("Next Number is required");
      return;
    }
    const sendData = new FormData();
    sendData.append("receipt_setup[auto_generate]", receiptOption);
    sendData.append("receipt_setup[prefix]", receiptNumberSetup.prefix);
    sendData.append("receipt_setup[next_number]", receiptNumberSetup.nextNumber);
    try {
      const ReceiptNum = await postReceiptNumber(sendData);
      toast.success("Receipt Number Added Successfully");
      console.log(ReceiptNum);
    } catch (error) {
      console.log(error);
    }
  };

  const columns = useMemo(
    () => [
      {
        key: "id",
        header: "Id",
        sortable: true,
        render: (val) => val ?? "-",
      },
      {
        key: "name",
        header: "Name",
        sortable: true,
        render: (val) => val || "-",
      },
      {
        key: "actions",
        header: "Action",
        render: (_val, row) => (
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setEditInvoiceModal(true);
                setSelectedInvoiceId(row.id);
              }}
            >
              <BiEdit size={15} />
            </button>
          </div>
        ),
      },
    ],
    []
  );

  const addressColumns = useMemo(
    () => [
      {
        key: "id",
        header: "Id",
        sortable: true,
        render: (val) => val ?? "-",
      },
      {
        key: "title",
        header: "Name",
        sortable: true,
        render: (val) => val || "-",
      },
      {
        key: "organization",
        header: "Organization",
        sortable: true,
        render: (val) => val || "-",
      },
      {
        key: "registration_no",
        header: "Registration No",
        sortable: true,
        render: (val) => val || "-",
      },
      {
        key: "gst_number",
        header: "GST.No",
        sortable: true,
        render: (val) => val || "-",
      },
      {
        key: "address",
        header: "Address",
        sortable: true,
        render: (val) => val || "-",
      },
      {
        key: "actions",
        header: "Action",
        render: (_val, row) => (
          <div className="flex items-center gap-4">
            <Link to={`/admin/edit-billing-address/${row.id}`}>
              <BiEdit size={15} />
            </Link>
            <button>
              <RiDeleteBin5Line
                size={15}
                onClick={() => handleAddressSetupDelete(row.id)}
              />
            </button>
          </div>
        ),
      },
    ],
    []
  );

  const handleFileChange = (files) => {
    if (files && files[0]) {
      setLogo(files[0]);
      console.log("Selected file:", files[0]);
    }
  };

  const handleChangeLogo = async () => {
    if (!logo) {
      toast.error("Please select a logo before uploading");
      return;
    }

    const sendData = new FormData();
    sendData.append("attachment", logo);

    try {
      const uploadLogo = await postLogoCamBillingSetup(sendData);
      toast.success("Logo added successfully");
      console.log("Uploaded logo response:", uploadLogo);
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast.error("Failed to add logo");
    }
  };

  return (
    <section className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Setup", path: "/setup" },
          { label: "Finance" },
          { label: "Billing" },
        ]}
      />
      <FormSection title="Billing Setup">
        <div className="space-y-6">
          <div className="space-y-4">
            <p className="text-md font-semibold">Invoice Number Setup</p>
            <div className="space-y-3">
              <div className="grid md:grid-cols-2 gap-4 items-center">
                <label className="flex items-center space-x-3 text-sm text-foreground">
                  <input
                    type="radio"
                    id="invoiceAuto"
                    value="invoiceAuto"
                    checked={invoiceOption === "invoiceAuto"}
                    onChange={handleChange}
                  />
                  <span>Continue auto-generating invoice numbers</span>
                </label>
                <div className="flex gap-2">
                  <FormInput
                    label="Prefix"
                    name="prefix"
                    value={invoiceNumberSetup.prefix}
                    onChange={handleChangeInvoiceNumber}
                    placeholder="Prefix"
                    disabled={invoiceOption === "invoiceManual"}
                  />
                  <FormInput
                    label="Next Number"
                    name="nextNumber"
                    value={invoiceNumberSetup.nextNumber}
                    onChange={handleChangeInvoiceNumber}
                    placeholder="Next Number"
                    disabled={invoiceOption === "invoiceManual"}
                  />
                </div>
              </div>
              <label className="flex items-center space-x-3 text-sm text-foreground">
                <input
                  type="radio"
                  id="invoiceManual"
                  value="invoiceManual"
                  checked={invoiceOption === "invoiceManual"}
                  onChange={handleChange}
                />
                <span>I will add them manually each time</span>
              </label>
              <div className="flex justify-start">
                <Button variant="outline" onClick={handleInvoiceNumberSubmit}>
                  Submit
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-4 border-t border-border pt-6">
            <p className="text-md font-semibold">Receipt Number Setup</p>
            <div className="space-y-3">
              <div className="grid md:grid-cols-2 gap-4 items-center">
                <label className="flex items-center space-x-3 text-sm text-foreground">
                  <input
                    type="radio"
                    id="receiptAuto"
                    value="receiptAuto"
                    checked={receiptOption === "receiptAuto"}
                    onChange={handleChangeReceiptOption}
                  />
                  <span>Continue auto-generating receipt numbers</span>
                </label>
                <div className="flex gap-2">
                  <FormInput
                    label="Prefix"
                    name="prefix"
                    value={receiptNumberSetup.prefix}
                    onChange={handleChangeReceiptNumber}
                    placeholder="Prefix"
                    disabled={receiptOption === "receiptManual"}
                  />
                  <FormInput
                    label="Next Number"
                    name="nextNumber"
                    value={receiptNumberSetup.nextNumber}
                    onChange={handleChangeReceiptNumber}
                    placeholder="Next Number"
                    disabled={receiptOption === "receiptManual"}
                  />
                </div>
              </div>
              <label className="flex items-center space-x-3 text-sm text-foreground">
                <input
                  type="radio"
                  id="receiptManual"
                  value="receiptManual"
                  checked={receiptOption === "receiptManual"}
                  onChange={handleChangeReceiptOption}
                />
                <span>I will add them manually each time</span>
              </label>
              <div className="flex justify-start">
                <Button variant="outline" onClick={handleReceiptNumberSubmit}>
                  Submit
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-3 border-t border-border pt-6">
            <div className="flex justify-between items-center">
              <p className="text-md font-semibold">Invoice Setup</p>
              <Button
                variant="outline"
                onClick={() => setAddInvoiceModal(true)}
              >
                Add
              </Button>
            </div>
            <DataTable columns={columns} data={invoiceType} />
          </div>

          <div className="space-y-3 border-t border-border pt-6">
            <div className="flex justify-between items-center">
              <p className="text-md font-semibold">Address Setup</p>
              <Link to={`/admin/billing-address`}>
                <Button variant="outline">Add</Button>
              </Link>
            </div>
            <DataTable columns={addressColumns} data={addressSetup} />
          </div>

          <div className="space-y-3 border-t border-border pt-6">
            <p className="text-md font-semibold">Upload Logo</p>
            <FileInputBox handleChange={handleFileChange} />
            <div className="flex justify-end">
              <Button variant="outline" onClick={handleChangeLogo}>
                Submit
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-4 border-t border-border pt-6">
            <span className="text-sm text-foreground">Online Payment Allowed</span>
            <Switch />
          </div>
        </div>
      </FormSection>
      {addInvoiceModal && (
        <AddInvoiceSetupModal
          onclose={() => setAddInvoiceModal(false)}
          fetchInvoiceTypeSetup={fetchInvoiceTypeSetup}
        />
      )}
      {editInvoiceModal && (
        <EditInvoiceSetupModal
          id={selectedInvoiceId}
          onclose={() => setEditInvoiceModal(false)}
          fetchInvoiceTypeSetup={fetchInvoiceTypeSetup}
        />
      )}
    </section>
  );
}

export default BillingSetup;
