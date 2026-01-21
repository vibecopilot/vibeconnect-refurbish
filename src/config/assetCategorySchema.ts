export type FieldOption = {
  value: string;
  label: string;
};

export type CategoryField = {
  name: string;
  label: string;
  type?: "text" | "number" | "select" | "date" | "textarea";
  placeholder?: string;
  required?: boolean;
  options?: FieldOption[];
};

export type CategorySection = {
  title: string;
  columns?: number;
  fields: CategoryField[];
};

export type AssetCategory = {
  id: string;
  label: string;
  sections: CategorySection[];
};

// Static schema for now; aligns with the categories the user listed.
export const assetCategories: AssetCategory[] = [
  {
    id: "land",
    label: "Land",
    sections: [
      {
        title: "Basic Identification",
        fields: [
          { name: "asset_name", label: "Asset Name", required: true, placeholder: "Enter asset name" },
          { name: "asset_code", label: "Asset Id/Code", placeholder: "Enter asset ID" },
          {
            name: "land_type",
            label: "Land Type",
            type: "select",
            options: [
              { value: "agricultural", label: "Agricultural" },
              { value: "commercial", label: "Commercial" },
              { value: "industrial", label: "Industrial" },
            ],
          },
        ],
      },
      {
        title: "Location & Ownership",
        fields: [
          { name: "location", label: "Location", required: true, placeholder: "Enter location" },
          {
            name: "ownership_type",
            label: "Ownership Type",
            type: "select",
            options: [
              { value: "owned", label: "Owned" },
              { value: "leased", label: "Leased" },
            ],
          },
          { name: "legal_ref_no", label: "Legal Document Ref No.", placeholder: "Enter reference number" },
          {
            name: "zoning",
            label: "Zoning Classification",
            type: "select",
            options: [
              { value: "residential", label: "Residential" },
              { value: "commercial", label: "Commercial" },
              { value: "industrial", label: "Industrial" },
            ],
          },
          {
            name: "encumbrance",
            label: "Encumbrance Status",
            type: "select",
            options: [
              { value: "free", label: "Free" },
              { value: "encumbered", label: "Encumbered" },
            ],
          },
        ],
      },
      {
        title: "Land Size & Value",
        fields: [
          { name: "area", label: "Area", required: true, placeholder: "Enter area" },
          {
            name: "unit",
            label: "Unit",
            type: "select",
            options: [
              { value: "sqft", label: "Sq. Ft." },
              { value: "acre", label: "Acre" },
              { value: "sqm", label: "Sq. M." },
            ],
          },
          { name: "acquisition_date", label: "Date of Acquisition", type: "date" },
          { name: "currency", label: "Currency", placeholder: "INR" },
          { name: "acquisition_cost", label: "Acquisition Cost", placeholder: "Enter cost" },
          { name: "market_value", label: "Current Market Value", placeholder: "Enter current value" },
        ],
      },
    ],
  },
  {
    id: "building",
    label: "Building",
    sections: [
      {
        title: "Basic Identification",
        fields: [
          { name: "asset_name", label: "Asset Name", required: true, placeholder: "Enter asset name" },
          { name: "asset_code", label: "Asset ID / Code", placeholder: "Enter asset ID" },
          {
            name: "building_type",
            label: "Building Type",
            type: "select",
            options: [
              { value: "residential", label: "Residential" },
              { value: "commercial", label: "Commercial" },
            ],
          },
        ],
      },
      {
        title: "Location & Ownership",
        fields: [
          { name: "location", label: "Location", required: true, placeholder: "Enter location" },
          {
            name: "ownership_type",
            label: "Ownership Type",
            type: "select",
            options: [
              { value: "owned", label: "Owned" },
              { value: "leased", label: "Leased" },
            ],
          },
          { name: "linked_land", label: "Linked Land Asset", placeholder: "Enter linked asset" },
        ],
      },
      {
        title: "Construction Details",
        fields: [
          {
            name: "construction_type",
            label: "Construction Type",
            type: "select",
            options: [
              { value: "rcc", label: "RCC" },
              { value: "steel", label: "Steel" },
              { value: "other", label: "Other" },
            ],
          },
          { name: "floors", label: "Number of Floors", placeholder: "Enter floors" },
          { name: "area", label: "Area", required: true, placeholder: "Enter area" },
          {
            name: "unit",
            label: "Unit",
            type: "select",
            options: [
              { value: "sqft", label: "Sq. Ft." },
              { value: "sqm", label: "Sq. M." },
            ],
          },
          { name: "construction_date", label: "Date of Construction", type: "date" },
        ],
      },
    ],
  },
  {
    id: "leasehold_improvement",
    label: "Leasehold Improvement",
    sections: [
      {
        title: "Basic Identification",
        fields: [
          { name: "asset_name", label: "Asset Name", required: true, placeholder: "Enter asset name" },
          { name: "asset_code", label: "Asset ID / Code", placeholder: "Enter asset ID / code" },
        ],
      },
      {
        title: "Location & Association",
        fields: [
          { name: "location", label: "Location / Site", required: true, placeholder: "Enter location / site" },
          { name: "leased_property_id", label: "Leased Property ID", placeholder: "Enter leased property ID" },
        ],
      },
      {
        title: "Improvement Details",
        fields: [
          { name: "description", label: "Improvement Description", type: "textarea", required: true },
          { name: "improvement_type", label: "Type of Improvement", placeholder: "Enter type" },
          { name: "vendor", label: "Vendor / Contractor Name", placeholder: "Enter vendor / contractor" },
          { name: "invoice_number", label: "Invoice Number", placeholder: "Enter invoice number" },
          { name: "improvement_date", label: "Date of Improvement", type: "date" },
          { name: "improvement_cost", label: "Improvement Cost", placeholder: "Enter cost" },
        ],
      },
    ],
  },
  {
    id: "vehicle",
    label: "Vehicle",
    sections: [
      {
        title: "Basic Identification",
        fields: [
          { name: "asset_name", label: "Asset Name", required: true, placeholder: "Enter asset name" },
          { name: "asset_code", label: "Asset ID / Code", placeholder: "Enter asset ID" },
          { name: "vehicle_type", label: "Vehicle Type", placeholder: "Enter vehicle type" },
          { name: "make_model", label: "Make & Model", placeholder: "Enter make & model" },
          { name: "registration_number", label: "Registration Number", placeholder: "Enter registration number" },
        ],
      },
      {
        title: "Technical Specifications",
        fields: [
          { name: "chassis_number", label: "Chassis Number", placeholder: "Enter chassis number" },
          { name: "engine_number", label: "Engine Number", placeholder: "Enter engine number" },
          { name: "fuel_type", label: "Fuel Type", placeholder: "Enter fuel type" },
        ],
      },
      {
        title: "Ownership & Usage",
        fields: [
          { name: "ownership_type", label: "Ownership Type", placeholder: "Enter ownership type" },
          { name: "department", label: "Assigned To / Department", placeholder: "Enter department" },
          { name: "usage_type", label: "Usage Type", placeholder: "Enter usage type" },
          { name: "permit_type", label: "Permit Type", placeholder: "Enter permit type" },
        ],
      },
    ],
  },
  {
    id: "furniture_fixtures",
    label: "Furniture & Fixtures",
    sections: [
      {
        title: "Asset Details",
        fields: [
          { name: "asset_name", label: "Asset Name", required: true, placeholder: "Enter asset name" },
          { name: "asset_number", label: "Asset No.", placeholder: "Enter asset number" },
          { name: "serial_number", label: "Serial No.", placeholder: "Enter serial number" },
          { name: "model_number", label: "Model No.", placeholder: "Enter model number" },
          { name: "manufacturer", label: "Manufacturer", placeholder: "Enter manufacturer" },
          { name: "vendor_name", label: "Vendor Name", placeholder: "Enter vendor name" },
          { name: "group", label: "Group", placeholder: "Enter group" },
          { name: "subgroup", label: "Subgroup", placeholder: "Enter subgroup" },
        ],
      },
      {
        title: "Location",
        fields: [
          { name: "location", label: "Location", required: true, placeholder: "Enter location" },
          { name: "building", label: "Building", placeholder: "Enter building" },
          { name: "wing", label: "Wing", placeholder: "Enter wing" },
          { name: "floor", label: "Floor", placeholder: "Enter floor" },
          { name: "area", label: "Area", placeholder: "Enter area" },
          { name: "room", label: "Room", placeholder: "Enter room" },
        ],
      },
    ],
  },
  {
    id: "it_equipment",
    label: "IT Equipment",
    sections: [
      {
        title: "Asset Details",
        fields: [
          { name: "asset_name", label: "Asset Name", required: true, placeholder: "Enter asset name" },
          { name: "asset_code", label: "Asset ID / Code", placeholder: "Enter asset ID" },
          { name: "model_number", label: "Model Number", placeholder: "Enter model number" },
          { name: "serial_number", label: "Serial Number", placeholder: "Enter serial number" },
          { name: "manufacturer", label: "Manufacturer", placeholder: "Enter manufacturer" },
        ],
      },
      {
        title: "Location",
        fields: [
          { name: "location", label: "Location", required: true, placeholder: "Enter location" },
          { name: "building", label: "Building", placeholder: "Enter building" },
          { name: "floor", label: "Floor", placeholder: "Enter floor" },
          { name: "room", label: "Room", placeholder: "Enter room" },
        ],
      },
      {
        title: "System Details",
        fields: [
          { name: "os", label: "OS", placeholder: "Enter OS" },
          { name: "memory", label: "Total Memory", placeholder: "Enter memory" },
          { name: "processor", label: "Processor", placeholder: "Enter processor" },
        ],
      },
    ],
  },
  {
    id: "machinery_equipment",
    label: "Machinery & Equipment",
    sections: [
      {
        title: "Asset Details",
        fields: [
          { name: "asset_name", label: "Asset Name", required: true, placeholder: "Enter asset name" },
          { name: "asset_code", label: "Asset ID / Code", placeholder: "Enter asset ID or code" },
          { name: "model_number", label: "Model Number", placeholder: "Enter model number" },
          { name: "serial_number", label: "Serial Number", placeholder: "Enter serial number" },
          { name: "manufacturer", label: "Manufacturer", placeholder: "Enter manufacturer" },
          { name: "vendor_name", label: "Vendor Name", placeholder: "Enter vendor name" },
        ],
      },
      {
        title: "Location",
        fields: [
          { name: "location", label: "Location", required: true, placeholder: "Enter location" },
          { name: "building", label: "Building", placeholder: "Enter building" },
          { name: "floor", label: "Floor", placeholder: "Enter floor" },
          { name: "room", label: "Room", placeholder: "Enter room" },
        ],
      },
    ],
  },
  {
    id: "tools_instruments",
    label: "Tools & Instruments",
    sections: [
      {
        title: "Asset Details",
        fields: [
          { name: "asset_name", label: "Asset Name", required: true, placeholder: "Enter asset name" },
          { name: "asset_code", label: "Asset ID / Code", placeholder: "Enter asset ID or code" },
          { name: "model_number", label: "Model Number", placeholder: "Enter model number" },
          { name: "serial_number", label: "Serial Number", placeholder: "Enter serial number" },
          { name: "manufacturer", label: "Manufacturer", placeholder: "Enter manufacturer" },
        ],
      },
      {
        title: "Location",
        fields: [
          { name: "location", label: "Location", required: true, placeholder: "Enter location" },
          { name: "building", label: "Building", placeholder: "Enter building" },
          { name: "floor", label: "Floor", placeholder: "Enter floor" },
          { name: "room", label: "Room", placeholder: "Enter room" },
        ],
      },
    ],
  },
  {
    id: "meter",
    label: "Meter",
    sections: [
      {
        title: "Asset Details",
        fields: [
          { name: "asset_name", label: "Asset Name", required: true, placeholder: "Enter asset name" },
          { name: "asset_number", label: "Asset No.", placeholder: "Enter asset number" },
          { name: "serial_number", label: "Serial No.", placeholder: "Enter serial number" },
          { name: "model_number", label: "Model No.", placeholder: "Enter model number" },
          { name: "manufacturer", label: "Manufacturer", placeholder: "Enter manufacturer" },
        ],
      },
      {
        title: "Location",
        fields: [
          { name: "location", label: "Location", required: true, placeholder: "Enter location" },
          { name: "building", label: "Building", placeholder: "Enter building" },
          { name: "floor", label: "Floor", placeholder: "Enter floor" },
          { name: "room", label: "Room", placeholder: "Enter room" },
        ],
      },
      {
        title: "Meter Details",
        fields: [
          { name: "meter_type", label: "Meter Type", placeholder: "Enter meter type" },
          { name: "meter_number", label: "Meter Number", placeholder: "Enter meter number" },
          { name: "meter_capacity", label: "Meter Capacity", placeholder: "Enter capacity" },
          { name: "installation_date", label: "Installation Date", type: "date" },
          { name: "calibration_date", label: "Next Calibration Date", type: "date" },
        ],
      },
    ],
  },
];

export const findCategoryById = (id: string) =>
  assetCategories.find((category) => category.id === id);
