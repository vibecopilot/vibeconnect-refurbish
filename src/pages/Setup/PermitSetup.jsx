import React, { useState } from "react";
import PermitTypeTable from "./SetupSubPages/PermitTypeTable";
import PermitActivityTable from "./SetupSubPages/PermitActivityTable";
import PermitSubActivityTable from "./SetupSubPages/PermitSubActivityTable";
import PermitHazardCategoryTable from "./SetupSubPages/PermitHazardCategoryTable";
import PermitRiskTable from "./SetupSubPages/PermitRiskTable";
import PermitSafetyEquipment from "./SetupSubPages/PermitSafetyEquipment";
import PermitEntity from "./SetupSubPages/PermitEntity";
import FormSection from "../../components/ui/FormSection";
import TabNavigation from "../../components/ui/TabNavigation";
const PermitSetup = () => {
  const [page, setPage] = useState("Permit Type");
  return (
    <section className="space-y-6">
      <FormSection title="Permit Setup">
        <TabNavigation
          tabs={[
            { id: "Permit Type", label: "Permit Type" },
            { id: "Permit Activity", label: "Permit Activity" },
            { id: "Permit Sub Activity", label: "Permit Sub Activity" },
            { id: "Permit Hazard Category", label: "Permit Hazard Category" },
            { id: "Permit Risk", label: "Permit Risk" },
            { id: "Permit Safety Equipment", label: "Permit Safety Equipment" },
            { id: "Permit Entity", label: "Permit Entity" },
          ]}
          activeTab={page}
          onTabChange={setPage}
        />

        {page === "Permit Type" && <PermitTypeTable />}
        {page === "Permit Activity" && <PermitActivityTable />}
        {page === "Permit Sub Activity" && <PermitSubActivityTable />}
        {page === "Permit Hazard Category" && <PermitHazardCategoryTable />}
        {page === "Permit Risk" && <PermitRiskTable />}
        {page === "Permit Safety Equipment" && <PermitSafetyEquipment />}
        {page === "Permit Entity" && <PermitEntity />}
      </FormSection>
    </section>
  );
};

export default PermitSetup;
