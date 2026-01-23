import React, { useState } from "react";
import IncidentCategorySetup from "./IncidentCategorySetup";
import IncidentSubCategorySetup from "./IncidentSubCategorySetup";
import SubSubCategorysetup from "./IncidentSubSubCat";
import SubSubSubCategorySetup from "./IncidentSubSubSubCatSetup";
import IncidenceStatusSetup from "./IncidentStatusSetup";
import IncidenceLevelSetup from "./IncidentLevelSteup";
import IncidentEscalationSetup from "./IncidentEscalationSetup";
import IncidentApprovalSetup from "./IncidentApprovalSetup";
import IncidentSecondaryCategorySetup from "./IncidentSecCatSetup";
import SecondarySubCategorysetup from "./IncidentSecSubCatSetup";
import InjurySetup from "./InjurySetup";
import PropertyDamageCategorySetup from "./PropertyDamageCategory";
import RCACategorySetup from "./RCACategorySetup";
import SecondarySubCategorySetup from "./IncidentSecSubCatSetup";
import SecondarySubSubCategorySetup from "./SecondarySubSubCategorySetup";
import SecondarySubSubSubCat from "./SecondarySubSubSubCat";
import CAPASetup from "./CAPASetup";
import SubstandardActSetup from "./SubstandardActSetup";
import SubstandardConditionSetup from "./SubstandardConditionSetup";
import PreventiveActionSetup from "./PreventiveActionSetup";
import CorrectiveActionSetup from "./CorrectiveActionSetup";
import FormSection from "../../../components/ui/FormSection";
import TabNavigation from "../../../components/ui/TabNavigation";

const IncidentSetup = () => {
  const [page, setPage] = useState("category");
  return (
    <section className="space-y-6">
      <FormSection title="Incident Setup">
        <TabNavigation
          tabs={[
            { id: "category", label: "Category" },
            { id: "incidenceStatus", label: "Incidence status" },
            { id: "incidenceLevel", label: "Incidence level" },
            { id: "escalations", label: "Escalations" },
            { id: "approvalSetup", label: "Approval Setup" },
            { id: "secondaryCategory", label: "Secondary Category" },
            { id: "injured", label: "Who got injured" },
            { id: "damageCategory", label: "Property Damage Category" },
            { id: "rcaCategory", label: "RCA Category" },
            { id: "substandardAct", label: "Substandard Act" },
            { id: "substandardCondition", label: "Substandard Condition" },
            { id: "preventiveAction", label: "Preventive Action" },
            { id: "correctiveAction", label: "Corrective Action" },
            { id: "capa", label: "CAPA" },
          ]}
          activeTab={page}
          onTabChange={setPage}
        />

        {page === "category" && <IncidentCategorySetup />}
        {page === "subCategory1" && <IncidentSubCategorySetup />}
        {page === "subCategory2" && <SubSubCategorysetup />}
        {page === "subCategory3" && <SubSubSubCategorySetup />}
        {page === "incidenceStatus" && <IncidenceStatusSetup />}
        {page === "incidenceLevel" && <IncidenceLevelSetup />}
        {page === "escalations" && <IncidentEscalationSetup />}
        {page === "approvalSetup" && <IncidentApprovalSetup />}
        {page === "secondaryCategory" && <IncidentSecondaryCategorySetup />}
        {page === "secondarySubCategory" && <SecondarySubCategorySetup />}
        {page === "secondarySubSubCategory" && (
          <SecondarySubSubCategorySetup />
        )}
        {page === "secondarySubSubSubCategory" && <SecondarySubSubSubCat />}
        {page === "injured" && <InjurySetup />}
        {page === "damageCategory" && <PropertyDamageCategorySetup />}
        {page === "rcaCategory" && <RCACategorySetup />}
        {page === "substandardAct" && <SubstandardActSetup />}
        {page === "substandardCondition" && <SubstandardConditionSetup />}
        {page === "preventiveAction" && <PreventiveActionSetup />}
        {page === "correctiveAction" && <CorrectiveActionSetup />}
        {page === "capa" && <CAPASetup />}
      </FormSection>
    </section>
  );
};

export default IncidentSetup;
