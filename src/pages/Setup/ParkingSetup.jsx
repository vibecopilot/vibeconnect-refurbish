import React, { useState } from "react";
import ParkingTag from "./ParkingSetupPages/ParkingTag";
import ParkingCategoriesSetup from "./ParkingSetupPages/ParkingCategoriesSetup";
import ParkingSlotSetup from "./ParkingSetupPages/ParkingSlotSetup";
import ParkingConfigurationSetup from "./ParkingSetupPages/ParkingConfigurationSetup";
import FormSection from "../../components/ui/FormSection";
import TabNavigation from "../../components/ui/TabNavigation";

const ParkingSetup = () => {
  const [page, setPage] = useState("Parking Configurations");
  return (
    <section className="space-y-6">
      <FormSection title="Parking">
        <TabNavigation
          tabs={[
            { id: "Parking Configurations", label: "Parking Configurations" },
            { id: "Parking Slots", label: "Parking Slots" },
          ]}
          activeTab={page}
          onTabChange={setPage}
        />

        {page === "Tag" && <ParkingTag />}
        {page === "Parking Categories" && <ParkingCategoriesSetup />}
        {page === "Parking Configurations" && <ParkingConfigurationSetup />}
        {page === "Parking Slots" && <ParkingSlotSetup />}
      </FormSection>
    </section>
  );
};

export default ParkingSetup
