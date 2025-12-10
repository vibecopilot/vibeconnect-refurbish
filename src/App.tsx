import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// Layout
import AppHeader from "./components/layout/AppHeader";

// Pages
import Dashboard from "./pages/Dashboard/Dashboard";
import { VisitorList, CreateVisitor, ViewVisitor } from "./pages/VMS";

// Placeholder pages for other modules
const PlaceholderPage: React.FC<{ title: string }> = ({ title }) => (
  <div className="p-6">
    <h1 className="text-2xl font-bold text-foreground mb-4">{title}</h1>
    <p className="text-muted-foreground">This module is under development.</p>
  </div>
);

function App() {
  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-right" />
      <AppHeader />
      
      <main>
        <Routes>
          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Dashboard */}
          <Route path="/dashboard" element={<Dashboard />} />

          {/* VMS - Visitor Management */}
          <Route path="/vms" element={<Navigate to="/vms/visitors" replace />} />
          <Route path="/vms/visitors" element={<VisitorList />} />
          <Route path="/vms/visitors/create" element={<CreateVisitor />} />
          <Route path="/vms/visitors/:id" element={<ViewVisitor />} />
          <Route path="/vms/visitors/:id/edit" element={<CreateVisitor />} />
          <Route path="/vms/pre-approved" element={<PlaceholderPage title="Pre-Approved Visitors" />} />
          <Route path="/vms/blacklist" element={<PlaceholderPage title="Blacklist" />} />
          <Route path="/vms/reports" element={<PlaceholderPage title="VMS Reports" />} />
          <Route path="/vms/configuration" element={<PlaceholderPage title="VMS Configuration" />} />

          {/* Asset Module */}
          <Route path="/asset" element={<PlaceholderPage title="Assets" />} />
          <Route path="/asset/amc" element={<PlaceholderPage title="AMC" />} />
          <Route path="/asset/meter" element={<PlaceholderPage title="Meter" />} />
          <Route path="/asset/ppm" element={<PlaceholderPage title="PPM" />} />
          <Route path="/asset/depreciation" element={<PlaceholderPage title="Depreciation" />} />
          <Route path="/asset/design-insight" element={<PlaceholderPage title="Design Insight" />} />
          <Route path="/asset/configuration" element={<PlaceholderPage title="Asset Configuration" />} />

          {/* Soft Services */}
          <Route path="/soft-services" element={<PlaceholderPage title="Soft Services" />} />

          {/* Service Desk */}
          <Route path="/service-desk" element={<PlaceholderPage title="Service Desk" />} />

          {/* Incident Management */}
          <Route path="/incident" element={<PlaceholderPage title="Incident Management" />} />

          {/* Booking Management */}
          <Route path="/amenities" element={<PlaceholderPage title="Amenities Booking" />} />
          <Route path="/space-booking" element={<PlaceholderPage title="Space Booking" />} />
          <Route path="/fb" element={<PlaceholderPage title="F&B" />} />

          {/* Documents */}
          <Route path="/documents" element={<PlaceholderPage title="Documents" />} />

          {/* Fitout */}
          <Route path="/fitout" element={<PlaceholderPage title="Fitout" />} />

          {/* Calendar */}
          <Route path="/calendar" element={<PlaceholderPage title="Calendar" />} />

          {/* Catch all - redirect to dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;