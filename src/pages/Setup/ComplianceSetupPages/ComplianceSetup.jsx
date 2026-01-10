import React, { useState } from "react";
import ComplianceCategories from "./ComplianceCategories";
import ComplianceChecklist from "./ComplianceChecklist";
import FormSection from "../../../components/ui/FormSection";
import TabNavigation from "../../../components/ui/TabNavigation";

const ComplianceSetup = () => {
  const [page, setPage] = useState("category");
  return (
    <section className="space-y-6">
      <FormSection title="Compliance Setup">
        <TabNavigation
          tabs={[
            { id: "category", label: "Category" },
            { id: "checklist", label: "Checklist" },
          ]}
          activeTab={page}
          onTabChange={setPage}
        />

        {page === "category" && <ComplianceCategories />}
        {page === "checklist" && <ComplianceChecklist />}
      </FormSection>
    </section>
  );
};

export default ComplianceSetup;
