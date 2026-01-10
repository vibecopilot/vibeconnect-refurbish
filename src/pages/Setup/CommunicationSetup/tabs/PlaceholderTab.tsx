import React from "react";

interface PlaceholderTabProps {
  title: string;
}

const PlaceholderTab: React.FC<PlaceholderTabProps> = ({ title }) => {
  return (
    <div className="text-center py-16 bg-card border border-border rounded-lg">
      <p className="text-lg font-medium text-foreground mb-2">{title}</p>
      <p className="text-sm text-muted-foreground">Under construction</p>
    </div>
  );
};

export default PlaceholderTab;
