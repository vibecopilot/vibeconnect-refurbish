import React, { useMemo, useState } from "react";
import Breadcrumb from "../../../components/ui/Breadcrumb";
import FormSection from "../../../components/ui/FormSection";
import TabNavigation from "../../../components/ui/TabNavigation";
import TemplateSections from "./tabs/TemplateSections";
import PlaceholderTab from "./tabs/PlaceholderTab";

const CommunicationSetupControl: React.FC = () => {
  const [activeTab, setActiveTab] = useState("templates");

  const tabContent = useMemo(
    () => ({
      templates: <TemplateSections />,
      events: <PlaceholderTab title="Events" />,
      notice: <PlaceholderTab title="Notice" />,
      polls: <PlaceholderTab title="Polls" />,
      broadcast: <PlaceholderTab title="Broadcast" />,
      forum: <PlaceholderTab title="Forum" />,
      group: <PlaceholderTab title="Group" />,
      meetings: <PlaceholderTab title="Meetings" />,
      election: <PlaceholderTab title="Election" />,
    }),
    []
  );

  return (
    <section className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Setup", path: "/setup" },
          { label: "Compliance" },
          { label: "Communication Setup Control" },
        ]}
      />
      <FormSection title="Communication Setup Control">
        <TabNavigation
          tabs={[
            { id: "templates", label: "Template Sections" },
            { id: "events", label: "Events" },
            { id: "notice", label: "Notice" },
            { id: "polls", label: "Polls" },
            { id: "broadcast", label: "Broadcast" },
            { id: "forum", label: "Forum" },
            { id: "group", label: "Group" },
            { id: "meetings", label: "Meetings" },
            { id: "election", label: "Election" },
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          fullWidth
        />
        {tabContent[activeTab]}
      </FormSection>
    </section>
  );
};

export default CommunicationSetupControl;
