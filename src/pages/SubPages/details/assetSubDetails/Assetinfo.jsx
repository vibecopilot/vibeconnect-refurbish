import React, { useState } from "react";
import { BiEdit } from "react-icons/bi";
import { FaRegFileAlt } from "react-icons/fa";
import AssetQrCode from "./AssetQrCode";
import { Link, useParams } from "react-router-dom";
import {
  domainPrefix,
  postAssetparams,
} from "../../../../api";
import toast from "react-hot-toast";
import Table from "../../../../components/table/Table";
import EditAssetParams from "./EditAssetParams";
import {
  MapPin,
  Package,
  FileText,
  Edit,
  QrCode,
  Shield
} from "lucide-react";

const initialFormData = {
  name: "",
  order: "",
  digit: "",
  below: "",
  above: "",
  dashboard_view: false,
  consumption_view: false,
};

const Assetinfo = ({ assetData }) => {
  const { id } = useParams();
  const [assetBreakdown, setAssetBreakdown] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    order: "",
    digit: "",
    dashboard_view: false,
    consumption_view: false,
    asset_id: id,
    alert_below: "",
    alert_above: "",
    min_val: "",
    max_val: "",
    check_prev: false,
    unit_type: "",
    multiplier_factor: "",
  });

  const {
    floor_name,
    building_name,
    longitude,
    name,
    latitude,
    asset_number,
    equipemnt_id,
    unit_name,
    serial_number,
    model_number,
    purchased_on,
    purchase_cost,
    warranty_expiry,
    critical,
    breakdown,
    is_meter,
    active,
    remarks,
    created_at,
    updated_at,
    description,
    capacity,
    warranty_start,
    asset_params,
    installation,
    group_name,
    sub_group_name,
    uom,
  } = assetData;
  const [qrCode, setQrCode] = useState(false);
  const [paramsId, setParamsId] = useState("");
  const [page, setPage] = useState("consumption");
  console.log("AssetData:", assetData);

  const isImage = (filePath) => {
    const imageExtensions = ["jpg", "jpeg", "png", "gif", "bmp", "svg"];
    const extension = filePath.split(".").pop().split("?")[0].toLowerCase();
    return imageExtensions.includes(extension);
  };
  const getFileName = (filePath) => {
    return filePath.split("/").pop().split("?")[0];
  };

  const dateFormat = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const handleToggle = () => {
    setAssetBreakdown(!breakdown);
  };

  const [editParams, setEditParams] = useState(false);

  const handleEditParameter = async (id) => {
    setEditParams(true);
    setParamsId(id);
  };

  const assetParmsColumn = [
    {
      name: "Action",
      cell: (row) => (
        <div className="flex items-center gap-4">
          <button onClick={() => handleEditParameter(row.id)}>
            <BiEdit size={15} />
          </button>
        </div>
      ),
    },
    { name: "Name", selector: (row) => row.name },
    { name: "Sequence", selector: (row) => row.order },
    { name: "Unit Type", selector: (row) => row.unit_type },
    { name: "Charactor Limit", selector: (row) => row.digit },
    { name: "Alert Below", selector: (row) => row.alert_below },
    { name: "Alert Above", selector: (row) => row.alert_above },
    { name: "Min", selector: (row) => row.min_val },
    { name: "Max", selector: (row) => row.max_val },
    { name: "Multiplier Factor", selector: (row) => row.multiplier_factor },
    {
      name: "Dashboard view",
      selector: (row) => (row.dashboard_view ? "Yes" : "No"),
    },
    {
      name: "Consumption view",
      selector: (row) => (row.consumption_view ? "Yes" : "No"),
    },
    {
      name: "Check prev Readings",
      selector: (row) => (row.check_prev ? "Yes" : "No"),
    },
    {
      name: "created on",
      selector: (row) => dateFormat(row.created_at),
    },
    {
      name: "Updated on",
      selector: (row) => dateFormat(row.updated_at),
    },
  ];

  const handleAssetParamsChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddConsumptionMeasure = async (e) => {
    e.preventDefault();
    try {
      toast.loading("Adding Asset params Please wait!");
      const response = await postAssetparams(formData);
      console.log("Asset Created successfully:", response);
      toast.dismiss();
      toast.success("Asset Params added successfully");
      window.location.reload();
    } catch (error) {
      console.error("Error submitting complaint:", error);
      toast.error("Error Creating Asset!");
    }
  };

  const InfoItem = ({ label, value }) => (
    <div className="flex flex-col">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{value || "-"}</span>
    </div>
  );

  return (
    <section className="space-y-6">
      {/* Action Buttons */}
      <div className="flex justify-end gap-2">
        <button
          className="inline-flex items-center gap-2 px-4 py-2 border border-border bg-card text-foreground rounded-lg hover:bg-muted transition-colors"
          onClick={() => setQrCode(true)}
        >
          <QrCode className="w-4 h-4" />
          QR Code
        </button>
        <Link
          to={`/assets/edit-asset/${id}`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Edit className="w-4 h-4" />
          Edit Details
        </Link>
      </div>

      {/* Location Details */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="bg-primary/5 px-6 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Location Details
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <InfoItem label="Building" value={building_name} />
            <InfoItem label="Floor" value={floor_name} />
            <InfoItem label="Unit" value={unit_name} />
            <InfoItem label="Latitude" value={latitude} />
            <InfoItem label="Longitude" value={longitude} />
          </div>
        </div>
      </div>

      {/* Asset Information */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="bg-primary/5 px-6 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            Asset Information
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <InfoItem label="Asset Name" value={name} />
            <InfoItem label="Asset Number" value={asset_number} />
            <InfoItem label="Equipment Id" value={equipemnt_id} />
            <InfoItem label="Model Number" value={model_number} />
            <InfoItem label="Serial Number" value={serial_number} />
            <InfoItem label="Purchased on" value={purchased_on} />
            <InfoItem label="Date Of Installation" value={installation} />
            <InfoItem label="Breakdown" value={breakdown ? "Yes" : "No"} />
            <InfoItem label="Capacity" value={capacity} />
            <InfoItem label="UOM" value={uom} />
            <InfoItem label="Purchase Cost" value={purchase_cost} />
            <InfoItem label="Group" value={group_name} />
            <InfoItem label="Subgroup" value={sub_group_name} />
            <InfoItem label="Critical" value={critical ? "Yes" : "No"} />
            <InfoItem label="Meter Applicable" value={is_meter ? "Yes" : "No"} />
            <InfoItem label="Created On" value={dateFormat(created_at)} />
            <InfoItem label="Updated On" value={dateFormat(updated_at)} />
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="bg-primary/5 px-6 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground">Additional Info</h2>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Comments</p>
            <div className="bg-muted p-3 rounded-md">
              <p className="text-sm text-foreground">
                {remarks && remarks !== "null" ? remarks : "No Comments"}
              </p>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Description</p>
            <div className="bg-muted p-3 rounded-md">
              <p className="text-sm text-foreground">
                {description && description !== "null" ? description : "No Description"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Warranty Details */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="bg-primary/5 px-6 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Warranty Details
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <InfoItem label="Warranty Start Date" value={warranty_start} />
            <InfoItem label="Expiry Date" value={warranty_expiry} />
          </div>
        </div>
      </div>

      {/* Attachments */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="bg-primary/5 px-6 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Attachments
          </h2>
        </div>
        <div className="p-6">
          <div className="grid md:grid-cols-3 gap-4">
            {/* Purchase Invoice */}
            <div className="bg-muted rounded-lg p-4">
              <p className="text-center font-medium text-foreground mb-3">Purchase Invoice</p>
              <div className="flex flex-col gap-2 items-center">
                {assetData.purchase_invoices && assetData.purchase_invoices.length > 0 ? (
                  assetData.purchase_invoices.map((invoice, index) => (
                    <div key={invoice.id}>
                      {isImage(domainPrefix + invoice.document) ? (
                        <img
                          src={domainPrefix + invoice.document}
                          alt={`Attachment ${index + 1}`}
                          className="w-full h-auto cursor-pointer rounded"
                          onClick={() => window.open(domainPrefix + invoice.document, "_blank")}
                        />
                      ) : (
                        <a
                          href={domainPrefix + invoice.document}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex flex-col items-center gap-2 text-primary hover:text-primary/80 transition-colors"
                        >
                          <FaRegFileAlt size={40} />
                          <span className="text-sm">{getFileName(invoice.document)}</span>
                        </a>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No Attachments</p>
                )}
              </div>
            </div>

            {/* Insurance */}
            <div className="bg-muted rounded-lg p-4">
              <p className="text-center font-medium text-foreground mb-3">Insurance</p>
              <div className="flex flex-col gap-2 items-center">
                {assetData.insurances && assetData.insurances.length > 0 ? (
                  assetData.insurances.map((insurance, index) => (
                    <div key={insurance.id}>
                      {isImage(domainPrefix + insurance.document) ? (
                        <img
                          src={domainPrefix + insurance.document}
                          alt={`Attachment ${index + 1}`}
                          className="w-40 h-28 object-cover rounded-md cursor-pointer"
                          onClick={() => window.open(domainPrefix + insurance.document, "_blank")}
                        />
                      ) : (
                        <a
                          href={domainPrefix + insurance.document}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex flex-col items-center gap-2 text-primary hover:text-primary/80 transition-colors"
                        >
                          <FaRegFileAlt size={40} />
                          <span className="text-sm">{getFileName(insurance.document)}</span>
                        </a>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No Attachments</p>
                )}
              </div>
            </div>

            {/* Manuals */}
            <div className="bg-muted rounded-lg p-4">
              <p className="text-center font-medium text-foreground mb-3">Manuals</p>
              <div className="flex flex-col gap-2 items-center">
                {assetData.manuals && assetData.manuals.length > 0 ? (
                  assetData.manuals.map((manual, index) => (
                    <div key={manual.id}>
                      {isImage(domainPrefix + manual.document) ? (
                        <img
                          src={domainPrefix + manual.document}
                          alt={`Attachment ${index + 1}`}
                          className="w-40 h-28 object-cover rounded-md cursor-pointer"
                          onClick={() => window.open(domainPrefix + manual.document, "_blank")}
                        />
                      ) : (
                        <a
                          href={domainPrefix + manual.document}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex flex-col items-center gap-2 text-primary hover:text-primary/80 transition-colors"
                        >
                          <FaRegFileAlt size={40} />
                          <span className="text-sm">{getFileName(manual.document)}</span>
                        </a>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No Attachments</p>
                )}
              </div>
            </div>
          </div>

          {/* Other Files */}
          <div className="bg-muted rounded-lg p-4 mt-4">
            <p className="text-center font-medium text-foreground mb-3">Other Files</p>
            <div className="flex gap-4 flex-wrap justify-center">
              {assetData.other_files && assetData.other_files.length > 0 ? (
                assetData.other_files.map((other, index) => (
                  <div key={other.id}>
                    {isImage(domainPrefix + other.document) ? (
                      <img
                        src={domainPrefix + other.document}
                        alt={`Attachment ${index + 1}`}
                        className="w-40 h-28 object-cover rounded-md cursor-pointer"
                        onClick={() => window.open(domainPrefix + other.document, "_blank")}
                      />
                    ) : (
                      <a
                        href={domainPrefix + other.document}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center gap-2 text-primary hover:text-primary/80 transition-colors"
                      >
                        <FaRegFileAlt size={40} />
                        <span className="text-sm">{getFileName(other.document)}</span>
                      </a>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No Attachments</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Asset Parameters Section */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="bg-primary/5 px-6 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground">Asset Parameters</h2>
        </div>
        <div className="p-6">
          {/* Tab Navigation */}
          <div className="flex gap-4 border-b border-border mb-6">
            <button
              className={`pb-2 px-4 font-medium transition-colors ${
                page === "consumption"
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setPage("consumption")}
            >
              Consumption Asset Measure
            </button>
            <button
              className={`pb-2 px-4 font-medium transition-colors ${
                page === "nonconsumption"
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setPage("nonconsumption")}
            >
              Non Consumption Asset Measure
            </button>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground">
              {page === "consumption" ? "Consumption" : "Non Consumption"} Parameter
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex flex-col">
                <label htmlFor="name" className="text-sm font-medium text-foreground mb-1">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name || ""}
                  onChange={handleAssetParamsChange}
                  placeholder="Name"
                  className="border border-border p-2 rounded-md bg-card text-foreground"
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="order" className="text-sm font-medium text-foreground mb-1">
                  Sequence
                </label>
                <input
                  type="text"
                  name="order"
                  id="order"
                  value={formData.order || ""}
                  onChange={handleAssetParamsChange}
                  placeholder="Enter Sequence"
                  className="border border-border p-2 rounded-md bg-card text-foreground"
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="unit" className="text-sm font-medium text-foreground mb-1">
                  Unit Type
                </label>
                <input
                  type="text"
                  name="unit_type"
                  id="unit"
                  value={formData.unit_type || ""}
                  onChange={handleAssetParamsChange}
                  placeholder="Enter Unit Type"
                  className="border border-border p-2 rounded-md bg-card text-foreground"
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="charactorLimit" className="text-sm font-medium text-foreground mb-1">
                  Input Character Limit
                </label>
                <input
                  type="text"
                  name="digit"
                  value={formData.digit || ""}
                  onChange={handleAssetParamsChange}
                  id="charactorLimit"
                  placeholder="Input Character Limit"
                  className="border border-border p-2 rounded-md bg-card text-foreground"
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="below" className="text-sm font-medium text-foreground mb-1">
                  Alert Below
                </label>
                <input
                  type="text"
                  name="alert_below"
                  id="below"
                  value={formData.alert_below}
                  onChange={handleAssetParamsChange}
                  placeholder="Alert Below Value"
                  className="border border-border p-2 rounded-md bg-card text-foreground"
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="above" className="text-sm font-medium text-foreground mb-1">
                  Alert Above
                </label>
                <input
                  type="text"
                  name="alert_above"
                  id="above"
                  value={formData.alert_above}
                  onChange={handleAssetParamsChange}
                  placeholder="Alert Above Value"
                  className="border border-border p-2 rounded-md bg-card text-foreground"
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="min" className="text-sm font-medium text-foreground mb-1">
                  Min
                </label>
                <input
                  type="text"
                  name="min_val"
                  id="min"
                  value={formData.min_val}
                  onChange={handleAssetParamsChange}
                  placeholder="Min Value"
                  className="border border-border p-2 rounded-md bg-card text-foreground"
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="max" className="text-sm font-medium text-foreground mb-1">
                  Max
                </label>
                <input
                  type="text"
                  name="max_val"
                  id="max"
                  value={formData.max_val}
                  onChange={handleAssetParamsChange}
                  placeholder="Max Value"
                  className="border border-border p-2 rounded-md bg-card text-foreground"
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="Multiplier" className="text-sm font-medium text-foreground mb-1">
                  Multiplier Factor
                </label>
                <input
                  type="text"
                  name="multiplier_factor"
                  id="Multiplier"
                  value={formData.multiplier_factor}
                  onChange={handleAssetParamsChange}
                  placeholder="Multiplier Factor"
                  className="border border-border p-2 rounded-md bg-card text-foreground"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="dashboard_view"
                  id="dashboard_view"
                  checked={formData.dashboard_view || false}
                  onChange={() =>
                    setFormData((prevState) => ({
                      ...prevState,
                      dashboard_view: !prevState.dashboard_view,
                    }))
                  }
                  className="rounded border-border"
                />
                <label htmlFor="dashboard_view" className="text-sm text-foreground">
                  Dashboard View
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="consumption_view"
                  id="consumption_view"
                  checked={formData.consumption_view || false}
                  onChange={() =>
                    setFormData((prevState) => ({
                      ...prevState,
                      consumption_view: !prevState.consumption_view,
                    }))
                  }
                  className="rounded border-border"
                />
                <label htmlFor="consumption_view" className="text-sm text-foreground">
                  Consumption View
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="check_prev"
                  id="check_prev"
                  checked={formData.check_prev || false}
                  onChange={() =>
                    setFormData((prevState) => ({
                      ...prevState,
                      check_prev: !prevState.check_prev,
                    }))
                  }
                  className="rounded border-border"
                />
                <label htmlFor="check_prev" className="text-sm text-foreground">
                  Check previous Reading
                </label>
              </div>
            </div>
            <div className="flex justify-center pt-4">
              <button
                className="bg-primary text-primary-foreground px-6 py-2 rounded-md hover:bg-primary/90 transition-colors"
                onClick={handleAddConsumptionMeasure}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Parameters Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-6">
          <Table
            columns={assetParmsColumn}
            data={asset_params}
            isPagination={true}
          />
        </div>
      </div>

      {/* Modals */}
      {qrCode && (
        <AssetQrCode
          assetId={id}
          assetName={name}
          building={building_name}
          floor={floor_name}
          unit={unit_name}
          onClose={() => setQrCode(false)}
          QR={domainPrefix + assetData.qr_code_image_url}
        />
      )}
      {editParams && (
        <EditAssetParams
          id={paramsId}
          assetId={id}
          onclose={() => setEditParams(false)}
        />
      )}
    </section>
  );
};

export default Assetinfo;