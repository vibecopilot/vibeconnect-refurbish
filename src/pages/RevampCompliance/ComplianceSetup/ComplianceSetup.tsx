import React, { useState } from "react";
import ComplianceCategoriesSetup from "./ComplianceCategoriesSetup";
import ComplianceTasksSetup from "./ComplianceTasksSetup";
import RegulatoryRequirementsSetup from "./RegulatoryRequirementsSetup";
import RiskAssessmentSetup from "./RiskAssessmentSetup";
import DocumentTypesSetup from "./DocumentTypesSetup";
import WorkflowRulesSetup from "./WorkflowRulesSetup";
import FormSection from "../../../components/ui/FormSection";
import TabNavigation from "../../../components/ui/TabNavigation";

const ComplianceSetup: React.FC = () => {
  const [page, setPage] = useState("categories");
  
  return (
    <section className="space-y-6">
      <FormSection title="Compliance Setup">
        <TabNavigation
          tabs={[
            { id: "categories", label: "Categories" },
            { id: "tasks", label: "Tasks" },
            { id: "regulatory", label: "Regulatory Requirements" },
            { id: "risk", label: "Risk Assessment" },
            { id: "documentTypes", label: "Document Types" },
            { id: "workflow", label: "Workflow Rules" },
          ]}
          activeTab={page}
          onTabChange={setPage}
        />

        {page === "categories" && <ComplianceCategoriesSetup />}
        {page === "tasks" && <ComplianceTasksSetup />}
        {page === "regulatory" && <RegulatoryRequirementsSetup />}
        {page === "risk" && <RiskAssessmentSetup />}
        {page === "documentTypes" && <DocumentTypesSetup />}
        {page === "workflow" && <WorkflowRulesSetup />}
      </FormSection>
    </section>
  );
};

export default ComplianceSetup;
