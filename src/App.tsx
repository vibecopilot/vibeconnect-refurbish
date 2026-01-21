// App.tsx - Main routing configuration
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import AppHeader from "./components/layout/AppHeader";

// Auth
import Login from "./components/Authentication/Login";

// Pages
import Dashboard from "./pages/Dashboard/Dashboard";
import {
  VMSLayout,
  VMSVisitors,
  VMSRegisteredVehicles,
  VMSStaff,
  VMSPatrolling,
  VMSGoodsInOut,
  CreateVisitor,
  ViewVisitor,
  StaffCreate,
  StaffView,
  GoodsCreate,
  GoodsView,
  VehicleCreate
} from "./pages/VMS";
import {
  SecurityLayout,
  SecurityVisitors,
  SecurityVisitorCreate,
  SecurityVisitorView,
  SecuritySelfRegistration,
} from "./pages/Security";
import {
  FBLayout,
  RestaurantManagement,
  PantryManagement,
  CreateRestaurant,
  CreatePantry,
  ViewPantry,
  EditPantry,
  ViewRestaurant,
  EditRestaurant,
  RestaurantPOS
} from "./pages/FoodsBeverage";
import AssetList from "./pages/Asset/AssetList";
import NewAssetExperimental from "./pages/Asset/NewAssetExperimental";
import AddAMC from "./pages/SubPages/AddAMC";
import CreateChecklist from "./pages/Asset/CreateChecklist";
import EditChecklist from "./pages/Asset/EditChecklist";
import CreatePPMActivity from "./pages/Asset/CreatePPMActivity";
import CreatePPMChecklist from "./pages/Asset/CreatePPMChecklist";
import EditPPMChecklist from "./pages/SubPages/EditPPMChecklist";
import CopyChecklist from "./pages/SubPages/CopyChecklist";
import CopyChecklistPPM from "./pages/SubPages/CopyChecklistPPM";
import CopyChecklistService from "./pages/SubPages/CopyChecklistService";
import AssociateAssetChecklist from "./pages/SubPages/AssociateAssetChecklist";
import AssociateServiceChecklist from "./pages/SubPages/AssociateServiceChecklist";
import AssetDetails from "./pages/SubPages/details/AssetDetails";
import AssetDetailsBentoView from "./pages/SubPages/details/AssetDetailsBentoView";
import { AssetDetailsFullScreen, TimelineFullScreen } from "./pages/SubPages/details/fullscreen";
import EditAsset from "./pages/Asset/EditAsset";
import EditStockItem from "./pages/Asset/EditStockItem";
import EditAMC from "./pages/SubPages/details/EditAMC";
import { ViewAMC, ViewMeter, ViewChecklist as ViewAssetChecklist, ViewRoutineTask, ViewPPMChecklist, ViewPPMActivity, ViewStockItem } from "./pages/Asset/submodules";
import { MasterChecklistCreate, MasterChecklistView, MasterChecklistEdit, MasterChecklistCopy, AssociateMasterChecklist } from "./pages/Asset/MasterChecklist";
import { TicketList, TicketCreate, TicketView, TicketEdit } from "./pages/ServiceDesk";
import { ServiceList, CreateService, ViewService, ChecklistList, CreateChecklist as SoftServiceCreateChecklist, ViewChecklist as ViewSoftServiceChecklist, TaskList, SoftServicesOverview } from "./pages/SoftService";
import ServiceUsageAnalytics from "./pages/SoftService/ServiceUsageAnalytics";
import SoftServiceTaskDetails from "./pages/SoftService/SoftServiceTaskDetails";
import {
  AmenitiesList,
  HotelBookingsList,
  BookAmenity,
  BookHotel,
} from "./pages/Amenities";
import ViewHotelBooking from "./pages/Amenities/ViewHotelBooking";
import { SpaceBookingsList, BookSpace } from "./pages/SpaceBooking";
import ViewSpaceBooking from "./pages/SpaceBooking/ViewSpaceBooking";
import FitoutHub from "./pages/FitOut/FitoutHub";
import { DocumentsList } from "./pages/Documents";
import { IncidentList, CreateIncident, ViewIncident } from "./pages/Incident";
import { PermitList, CreatePermit, ViewPermit } from "./pages/Permit/index";
import { CalendarPage, PlanMyCalendar } from "./pages/Calendar/index";
import { MailRoomLayout, DeliveryVendorList, CreateVendor, ViewVendor, InboundList, CreateInboundPackage, ViewInbound, OutboundList, CreateOutboundPackage, ViewOutbound } from "./pages/MailRoom/index";
import { SupplierList, CreateSupplier, ViewSupplier } from "./pages/Supplier";
import { AuditLayout, OperationalScheduled, OperationalConducted, OperationalChecklists, VendorScheduled, VendorConducted, ScheduleAuditForm, ChecklistAuditForm } from "./pages/Audit";
import { CommunicationsLayout, EventsList, CreateEvent, ViewEvent, BroadcastList, CreateBroadcast, ViewBroadcast, PollsList, CreatePoll, ForumFeed, CreateForum, GroupsList } from "./pages/Communications";
import { CAMLayout, CamBillingList, AddCamBilling, ViewCamBilling, ReceiptInvoiceList, AddReceiptInvoice, ViewReceiptInvoice } from "./pages/CAM";
import { OtherBillsList, CreateOtherBill, ViewOtherBill } from "./pages/OtherBills";
import { MastersList, CreateMaster, ViewMaster, StocksList, ViewStock, GRNList, CreateGRN, ViewGRN, GDNList, CreateGDN, ViewGDN } from "./pages/Inventory";
import { OnDemandServiceHub } from "./pages/OnDemandService";
import {
  ProcurementLayout,
  MaterialPRList,
  CreateMaterialPR,
  ServicePRList,
  POList,
  WOList,
  GRNSRNList,
  AutoSavedPRList,
  PendingApprovalsList,
  DeletionRequestsList,
  DeletedPRsList,
} from "./pages/Procurement";
import Compliance from "./pages/Compliance/Compliance";
import AddCompliance from "./pages/Compliance/AddCompliance";
import ComplianceDetails from "./pages/Compliance/ComplianceDetails";
import Parkings from "./pages/Parkings";
import AddParking from "./pages/SubPages/AddParking";
import ParkingDetails from "./pages/SubPages/details/ParkingDetails";
import Survey from "./pages/SubPages/survey/Survey";
import AddSurvey from "./pages/SubPages/survey/AddSurvey";
import SurveyDetails from "./pages/SubPages/survey/SurveyDetails";
import EditSurvey from "./pages/SubPages/survey/EditSurvey";
import CreateScratchSurvey from "./pages/SubPages/survey/CreateScratchSurvey";
import CopySurvey from "./pages/SubPages/survey/CopySurvey";
import CopySurveyViewPage from "./pages/SubPages/survey/CopySurveyViewPage.tsx";
import TemplateDetailsSurvey from "./pages/SubPages/survey/TemplateDetailsSurvey.tsx";
import SampleResultSurvey from "./pages/SubPages/survey/SampleResultSurvey.tsx";
import EditTemplateSurvey from "./pages/SubPages/survey/EditTemplateSurvey.tsx";
import CreateTemplateSurvey from "./pages/SubPages/survey/CreateTemplateSurvey.tsx";
import SurveyResponseForm from "./pages/SubPages/survey/SurveyResponseForm";
import SetupPage from "./pages/Setup/SetupPage";
import AccountPage from "./pages/Setup/Account/AccountPage";
import UsersPage from "./pages/Setup/users/UsersPage";
import CreateUserPage from "./pages/Setup/users/CreateUserPage";
import AddressesSetup from "./pages/Setup/AddressSetup/AddressSetup";
import AddAddressesSetup from "./pages/Setup/AddressSetup/AddAddressSetup";
import EditAddressesSetup from "./pages/Setup/AddressSetup/EditAddressSetup";
import FMUserSetupNew from "./pages/Setup/FMUserSetupNew";
import AddFMUserSetupNew from "./pages/Setup/AddFMUserSetupNew";
import EditFMUserSetupNew from "./pages/Setup/EditFMUserSetupNew";
import InvoiceApprovalSetup from "./pages/Setup/InvoiceApprovalSetupPages/InvoiceApprovalSetup";
import AddInvoiceApprovalsSetup from "./pages/Setup/InvoiceApprovalSetupPages/AddInvoiceApprovalSetup";
import EditInvoiceApprovalsSetup from "./pages/Setup/InvoiceApprovalSetupPages/EditInvoiceApprovalSet";
// Placeholder pages for other modules
// Coming Soon placeholder for modules not yet available
const PlaceholderPage: React.FC<{ title: string }> = ({ title }) => (
  <div className="flex flex-col items-center justify-center min-h-[400px] p-6">
    <h1 className="text-2xl font-bold text-foreground mb-4">{title}</h1>
    <p className="text-lg text-muted-foreground">Coming Soon</p>
  </div>
);

// Import ProtectedRoute
import { ProtectedRoute } from './routes';
import { ContactBook, ContactBookCreate, ContactBookEdit, ContactBookView } from "./pages/ContactBook";
import ScheduledListView from "./pages/Audit/Operational/ScheduledListView";
import ScheduledListEdit from "./pages/Audit/Operational/ScheduledListEdit";
import ChecklistsList from "./pages/Audit/Operational/ChecklistsList.tsx";
import ChecklistView from "./pages/Audit/Operational/ChecklistsView.tsx";

// Layout wrapper for authenticated pages - now includes protection
const AuthenticatedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute>
    <AppHeader />
    <main>{children}</main>
  </ProtectedRoute>
);

function App() {
  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-right" />

      <Routes>
        {/* Login Route - No header */}
        <Route path="/login" element={<Login />} />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Dashboard */}
        <Route path="/dashboard" element={<AuthenticatedLayout><Dashboard /></AuthenticatedLayout>} />

        {/* Security Module - New with proper sub-tabs */}
        <Route path="/security" element={<AuthenticatedLayout><SecurityLayout /></AuthenticatedLayout>}>
          <Route index element={<Navigate to="/security/visitors" replace />} />
          <Route path="visitors" element={<SecurityVisitors />} />
          <Route path="registered-vehicles" element={<VMSRegisteredVehicles />} />
          <Route path="staff" element={<VMSStaff />} />
          <Route path="patrolling" element={<VMSPatrolling />} />
          <Route path="goods-in-out" element={<VMSGoodsInOut />} />
        </Route>

        {/* Security Detail/Create/Edit routes */}
        <Route path="/security/visitors/create" element={<AuthenticatedLayout><SecurityVisitorCreate /></AuthenticatedLayout>} />
        <Route path="/security/visitors/self-register" element={<AuthenticatedLayout><SecuritySelfRegistration /></AuthenticatedLayout>} />
        <Route path="/security/visitors/:id" element={<AuthenticatedLayout><SecurityVisitorView /></AuthenticatedLayout>} />
        <Route path="/security/visitors/:id/edit" element={<AuthenticatedLayout><SecurityVisitorCreate /></AuthenticatedLayout>} />

        {/* VMS - Visitor Management with Tabbed Layout (legacy) */}
        <Route path="/vms" element={<AuthenticatedLayout><VMSLayout /></AuthenticatedLayout>}>
          {/* Redirect legacy VMS Visitors to new Security Visitors (7 sub-tabs) */}
          <Route index element={<Navigate to="/security/visitors" replace />} />
          <Route path="visitors" element={<Navigate to="/security/visitors" replace />} />
          <Route path="registered-vehicles" element={<VMSRegisteredVehicles />} />
          <Route path="staff" element={<VMSStaff />} />
          <Route path="patrolling" element={<VMSPatrolling />} />
          <Route path="goods-in-out" element={<VMSGoodsInOut />} />
        </Route>

        {/* VMS Detail/Create/Edit routes - outside the tabbed layout */}
        <Route path="/vms/visitors/create" element={<AuthenticatedLayout><CreateVisitor /></AuthenticatedLayout>} />
        <Route path="/vms/visitors/:id" element={<AuthenticatedLayout><ViewVisitor /></AuthenticatedLayout>} />
        <Route path="/vms/visitors/:id/edit" element={<AuthenticatedLayout><CreateVisitor /></AuthenticatedLayout>} />
        <Route path="/vms/registered-vehicles/create" element={<AuthenticatedLayout><VehicleCreate /></AuthenticatedLayout>} />
        <Route path="/vms/registered-vehicles/:id" element={<AuthenticatedLayout><PlaceholderPage title="Vehicle Details" /></AuthenticatedLayout>} />
        <Route path="/vms/registered-vehicles/:id/edit" element={<AuthenticatedLayout><VehicleCreate /></AuthenticatedLayout>} />
        <Route path="/vms/staff/create" element={<AuthenticatedLayout><StaffCreate /></AuthenticatedLayout>} />
        <Route path="/vms/staff/:id" element={<AuthenticatedLayout><StaffView /></AuthenticatedLayout>} />
        <Route path="/vms/staff/:id/edit" element={<AuthenticatedLayout><StaffCreate /></AuthenticatedLayout>} />
        <Route path="/vms/patrolling/:id" element={<AuthenticatedLayout><PlaceholderPage title="Patrolling Details" /></AuthenticatedLayout>} />
        <Route path="/vms/patrolling/:id/edit" element={<AuthenticatedLayout><PlaceholderPage title="Edit Patrolling" /></AuthenticatedLayout>} />
        <Route path="/vms/goods-in-out/create" element={<AuthenticatedLayout><GoodsCreate /></AuthenticatedLayout>} />
        <Route path="/vms/goods-in-out/:id" element={<AuthenticatedLayout><GoodsView /></AuthenticatedLayout>} />
        <Route path="/vms/goods-in-out/:id/edit" element={<AuthenticatedLayout><GoodsCreate /></AuthenticatedLayout>} />

        {/* Asset Module */}
        <Route path="/asset" element={<AuthenticatedLayout><AssetList /></AuthenticatedLayout>} />
        <Route path="/asset/create" element={<AuthenticatedLayout><NewAssetExperimental /></AuthenticatedLayout>} />
        <Route path="/asset/:id" element={<AuthenticatedLayout><AssetDetailsBentoView /></AuthenticatedLayout>} />
        <Route path="/asset/:id/edit" element={<AuthenticatedLayout><EditAsset /></AuthenticatedLayout>} />
        
        {/* AMC */}
        <Route path="/asset/amc" element={<AuthenticatedLayout><AssetList /></AuthenticatedLayout>} />
        <Route path="/asset/amc/create" element={<AuthenticatedLayout><AddAMC /></AuthenticatedLayout>} />
        <Route path="/asset/amc/:id" element={<AuthenticatedLayout><ViewAMC /></AuthenticatedLayout>} />
        <Route path="/asset/amc/:id/edit" element={<AuthenticatedLayout><EditAMC /></AuthenticatedLayout>} />

        {/* Meter */}
        <Route path="/asset/meter" element={<AuthenticatedLayout><AssetList /></AuthenticatedLayout>} />
        <Route path="/asset/meter/create" element={<AuthenticatedLayout><NewAssetExperimental /></AuthenticatedLayout>} />
        <Route path="/asset/meter/:id" element={<AuthenticatedLayout><ViewMeter /></AuthenticatedLayout>} />
        <Route path="/asset/meter/:id/edit" element={<AuthenticatedLayout><EditAsset /></AuthenticatedLayout>} />

        {/* Checklist */}
        <Route path="/asset/checklist" element={<AuthenticatedLayout><AssetList /></AuthenticatedLayout>} />
        <Route path="/asset/checklist/create" element={<AuthenticatedLayout><CreateChecklist /></AuthenticatedLayout>} />
        <Route path="/asset/checklist/:id" element={<AuthenticatedLayout><ViewAssetChecklist /></AuthenticatedLayout>} />
        <Route path="/asset/checklist/:id/edit" element={<AuthenticatedLayout><EditChecklist /></AuthenticatedLayout>} />
        <Route path="/admin/copy-checklist/:id" element={<AuthenticatedLayout><CopyChecklist /></AuthenticatedLayout>} />
        <Route path="/assets/associate-checklist/:id" element={<AuthenticatedLayout><AssociateAssetChecklist /></AuthenticatedLayout>} />

        {/* Routine Task */}
        <Route path="/asset/routine-task" element={<AuthenticatedLayout><AssetList /></AuthenticatedLayout>} />
        <Route path="/asset/routine-task/:assetId/:id" element={<AuthenticatedLayout><ViewRoutineTask /></AuthenticatedLayout>} />

        {/* PPM Checklist */}
        <Route path="/asset/ppm-checklist" element={<AuthenticatedLayout><AssetList /></AuthenticatedLayout>} />
        <Route path="/asset/ppm-checklist/create" element={<AuthenticatedLayout><CreatePPMChecklist /></AuthenticatedLayout>} />
        <Route path="/asset/ppm-checklist/:id" element={<AuthenticatedLayout><ViewPPMChecklist /></AuthenticatedLayout>} />
        <Route path="/asset/ppm-checklist/:id/edit" element={<AuthenticatedLayout><EditPPMChecklist /></AuthenticatedLayout>} />
        <Route path="/admin/copy-ppm-checklist/:id" element={<AuthenticatedLayout><CopyChecklistPPM /></AuthenticatedLayout>} />
        <Route path="/assets/associate-ppm-checklist/:id" element={<AuthenticatedLayout><AssociateAssetChecklist /></AuthenticatedLayout>} />

        {/* PPM Activity */}
        <Route path="/asset/ppm-activity" element={<AuthenticatedLayout><AssetList /></AuthenticatedLayout>} />
        <Route path="/asset/ppm-activity/create" element={<AuthenticatedLayout><CreatePPMActivity /></AuthenticatedLayout>} />
        <Route path="/asset/ppm-activity/:assetId/:id" element={<AuthenticatedLayout><ViewPPMActivity /></AuthenticatedLayout>} />

        {/* PPM Calendar */}
        <Route path="/asset/ppm-calendar" element={<AuthenticatedLayout><AssetList /></AuthenticatedLayout>} />
        
        {/* Stock Items */}
        <Route path="/asset/stock-items" element={<AuthenticatedLayout><AssetList /></AuthenticatedLayout>} />
        <Route path="/asset/stock-items/:id" element={<AuthenticatedLayout><ViewStockItem /></AuthenticatedLayout>} />
        <Route path="/asset/stock-items/:id/edit" element={<AuthenticatedLayout><EditStockItem /></AuthenticatedLayout>} />

        <Route path="/asset/overview" element={<AuthenticatedLayout><AssetList /></AuthenticatedLayout>} />

        {/* QR Code */}
        <Route path="/asset/qr-code" element={<AuthenticatedLayout><AssetList /></AuthenticatedLayout>} />

        {/* Soft Services - Service Tab */}
        <Route path="/soft-services" element={<AuthenticatedLayout><ServiceList /></AuthenticatedLayout>} />
        <Route path="/soft-services/create" element={<AuthenticatedLayout><CreateService /></AuthenticatedLayout>} />
        <Route path="/soft-services/:id" element={<AuthenticatedLayout><ViewService /></AuthenticatedLayout>} />
        <Route path="/soft-services/:id/usage" element={<AuthenticatedLayout><ServiceUsageAnalytics /></AuthenticatedLayout>} />
        <Route path="/soft-services/:id/edit" element={<AuthenticatedLayout><CreateService /></AuthenticatedLayout>} />

        {/* Soft Services - Checklist Tab */}
        <Route path="/soft-services/checklist" element={<AuthenticatedLayout><ChecklistList /></AuthenticatedLayout>} />
        <Route path="/soft-services/checklist/create" element={<AuthenticatedLayout><SoftServiceCreateChecklist /></AuthenticatedLayout>} />
        <Route path="/soft-services/checklist/:id" element={<AuthenticatedLayout><ViewSoftServiceChecklist /></AuthenticatedLayout>} />
        <Route path="/soft-services/checklist/:id/edit" element={<AuthenticatedLayout><SoftServiceCreateChecklist /></AuthenticatedLayout>} />
        <Route path="/soft-services/associate-checklist/:id" element={<AuthenticatedLayout><AssociateServiceChecklist /></AuthenticatedLayout>} />
        <Route path="/services/associate-checklist/:id" element={<AuthenticatedLayout><AssociateServiceChecklist /></AuthenticatedLayout>} />

        {/* Soft Services - Task Tab */}
        <Route path="/soft-services/task" element={<AuthenticatedLayout><TaskList /></AuthenticatedLayout>} />
        <Route path="/soft-services/:serviceId/task/:taskId" element={<AuthenticatedLayout><SoftServiceTaskDetails /></AuthenticatedLayout>} />
        <Route path="/soft-services/task/:taskId" element={<AuthenticatedLayout><SoftServiceTaskDetails /></AuthenticatedLayout>} />

        {/* Soft Services - Overview Tab */}
        <Route path="/soft-services/overview" element={<AuthenticatedLayout><SoftServicesOverview viewMode="table" searchValue="" perPage={10} /></AuthenticatedLayout>} />

        {/* Soft Services - Copy Checklist */}
        <Route path="/admin/copy-checklist/service/:id" element={<AuthenticatedLayout><CopyChecklistService /></AuthenticatedLayout>} />

        <Route path="/soft-service" element={<Navigate to="/soft-services" replace />} />

        {/* Service Desk */}
        <Route path="/service-desk" element={<AuthenticatedLayout><TicketList /></AuthenticatedLayout>} />
        <Route path="/service-desk/create" element={<AuthenticatedLayout><TicketCreate /></AuthenticatedLayout>} />
        <Route path="/service-desk/:id" element={<AuthenticatedLayout><TicketView /></AuthenticatedLayout>} />
        <Route path="/service-desk/:id/edit" element={<AuthenticatedLayout><TicketEdit /></AuthenticatedLayout>} />

        {/* Contact Book */}
        <Route path="/contact-book" element={<AuthenticatedLayout><ContactBook /></AuthenticatedLayout>} />
        <Route path="/contact-book/create" element={<AuthenticatedLayout><ContactBookCreate /></AuthenticatedLayout>} />
        <Route path="/contact-book/view/:id" element={<AuthenticatedLayout><ContactBookView /></AuthenticatedLayout>} />
        <Route path="/contact-book/edit/:id" element={<AuthenticatedLayout><ContactBookEdit /></AuthenticatedLayout>} />

        {/* Incident Management - Safety Module */}
        <Route path="/incident" element={<AuthenticatedLayout><IncidentList /></AuthenticatedLayout>} />
        <Route path="/incident/create" element={<AuthenticatedLayout><CreateIncident /></AuthenticatedLayout>} />
        <Route path="/incident/:id" element={<AuthenticatedLayout><ViewIncident /></AuthenticatedLayout>} />
        <Route path="/incident/:id/edit" element={<AuthenticatedLayout><CreateIncident /></AuthenticatedLayout>} />

        {/* Amenities Booking - standalone pages */}
        <Route path="/amenities" element={<AuthenticatedLayout><AmenitiesList /></AuthenticatedLayout>} />
        <Route path="/amenities/book" element={<AuthenticatedLayout><BookAmenity /></AuthenticatedLayout>} />
        <Route path="/amenities/bookings/:id" element={<AuthenticatedLayout><PlaceholderPage title="Booking Details" /></AuthenticatedLayout>} />

        {/* Hotel Bookings */}
        <Route path="/amenities/hotel" element={<AuthenticatedLayout><HotelBookingsList /></AuthenticatedLayout>} />
        <Route path="/amenities/hotel/book" element={<AuthenticatedLayout><BookHotel /></AuthenticatedLayout>} />
        <Route path="/amenities/hotel/:id" element={<AuthenticatedLayout><ViewHotelBooking /></AuthenticatedLayout>} />


        {/* Space Booking */}
        <Route path="/space-booking" element={<AuthenticatedLayout><SpaceBookingsList /></AuthenticatedLayout>} />
        <Route path="/space-booking/book" element={<AuthenticatedLayout><BookSpace /></AuthenticatedLayout>} />
        <Route path="/space-booking/:id" element={<AuthenticatedLayout><ViewSpaceBooking /></AuthenticatedLayout>} />


        {/* F&B - Restaurant & Pantry Management */}
        <Route path="/fb" element={<AuthenticatedLayout><FBLayout /></AuthenticatedLayout>}>
          <Route index element={<Navigate to="/fb/restaurant" replace />} />
          <Route path="restaurant" element={<RestaurantManagement />} />
          <Route path="restaurant/pos" element={<RestaurantPOS />} />
          <Route path="pantry" element={<PantryManagement />} />
        </Route>
        <Route path="/fb/restaurant/create" element={<AuthenticatedLayout><CreateRestaurant /></AuthenticatedLayout>} />
        <Route path="/fb/restaurant/:id" element={<AuthenticatedLayout><ViewRestaurant /></AuthenticatedLayout>} />
        <Route path="/fb/restaurant/:id/edit" element={<AuthenticatedLayout><EditRestaurant /></AuthenticatedLayout>} />
        <Route path="/fb/pantry/create" element={<AuthenticatedLayout><CreatePantry /></AuthenticatedLayout>} />
        <Route path="/fb/pantry/:id" element={<AuthenticatedLayout><ViewPantry /></AuthenticatedLayout>} />
        <Route path="/fb/pantry/:id/edit" element={<AuthenticatedLayout><EditPantry /></AuthenticatedLayout>} />

        {/* Documents */}
        <Route path="/documents" element={<AuthenticatedLayout><DocumentsList /></AuthenticatedLayout>} />
        <Route path="/documents/common" element={<AuthenticatedLayout><DocumentsList /></AuthenticatedLayout>} />
        <Route path="/documents/shared" element={<AuthenticatedLayout><DocumentsList /></AuthenticatedLayout>} />

        {/* Fitout */}
        <Route path="/fitout" element={<AuthenticatedLayout><FitoutHub /></AuthenticatedLayout>} />
        <Route path="/fitout/setup/page" element={<AuthenticatedLayout><FitoutHub initialTab="setup" /></AuthenticatedLayout>} />
        <Route path="/fitout/request/list" element={<AuthenticatedLayout><FitoutHub initialTab="requests" /></AuthenticatedLayout>} />
        <Route path="/fitout/checklist/list" element={<AuthenticatedLayout><FitoutHub initialTab="checklist" /></AuthenticatedLayout>} />
        <Route path="/fitout/create" element={<AuthenticatedLayout><PlaceholderPage title="Create Fitout Request" /></AuthenticatedLayout>} />
        <Route path="/fitout/:id" element={<AuthenticatedLayout><PlaceholderPage title="Fitout Details" /></AuthenticatedLayout>} />
        <Route path="/fitout/:id/edit" element={<AuthenticatedLayout><PlaceholderPage title="Edit Fitout Request" /></AuthenticatedLayout>} />

        {/* Calendar */}
        <Route path="/calendar" element={<AuthenticatedLayout><CalendarPage /></AuthenticatedLayout>} />
        <Route path="/calendar/plan" element={<AuthenticatedLayout><PlanMyCalendar /></AuthenticatedLayout>} />

        {/* Mail Room - FM Module */}
        <Route path="/mail-room" element={<AuthenticatedLayout><MailRoomLayout /></AuthenticatedLayout>}>
          <Route index element={<Navigate to="/mail-room/delivery-vendor" replace />} />
          <Route path="delivery-vendor" element={<DeliveryVendorList />} />
          <Route path="inbound" element={<InboundList />} />
          <Route path="outbound" element={<OutboundList />} />
        </Route>
        <Route path="/mail-room/delivery-vendor/create" element={<AuthenticatedLayout><CreateVendor /></AuthenticatedLayout>} />
        <Route path="/mail-room/delivery-vendor/:id" element={<AuthenticatedLayout><ViewVendor /></AuthenticatedLayout>} />
        <Route path="/mail-room/delivery-vendor/:id/edit" element={<AuthenticatedLayout><CreateVendor /></AuthenticatedLayout>} />
        <Route path="/mail-room/inbound/create" element={<AuthenticatedLayout><CreateInboundPackage /></AuthenticatedLayout>} />
        <Route path="/mail-room/inbound/:id" element={<AuthenticatedLayout><ViewInbound /></AuthenticatedLayout>} />
        <Route path="/mail-room/inbound/:id/edit" element={<AuthenticatedLayout><CreateInboundPackage /></AuthenticatedLayout>} />
        <Route path="/mail-room/outbound/create" element={<AuthenticatedLayout><CreateOutboundPackage /></AuthenticatedLayout>} />
        <Route path="/mail-room/outbound/:id" element={<AuthenticatedLayout><ViewOutbound /></AuthenticatedLayout>} />
        <Route path="/mail-room/outbound/:id/edit" element={<AuthenticatedLayout><CreateOutboundPackage /></AuthenticatedLayout>} />

        {/* Supplier/Vendor - FM Module */}
        <Route path="/supplier" element={<AuthenticatedLayout><SupplierList /></AuthenticatedLayout>} />
        <Route path="/supplier/create" element={<AuthenticatedLayout><CreateSupplier /></AuthenticatedLayout>} />
        <Route path="/supplier/:id" element={<AuthenticatedLayout><ViewSupplier /></AuthenticatedLayout>} />
        <Route path="/supplier/:id/edit" element={<AuthenticatedLayout><CreateSupplier /></AuthenticatedLayout>} />

        {/* Audit - FM Module */}
        <Route path="/audit" element={<AuthenticatedLayout><AuditLayout /></AuthenticatedLayout>}>
          <Route index element={<Navigate to="/audit/operational/scheduled" replace />} />
          <Route path="operational/scheduled" element={<OperationalScheduled />} />
          <Route path="operational/conducted" element={<OperationalConducted />} />
          <Route path="operational/checklists" element={<OperationalChecklists />} />
          <Route path="vendor/scheduled" element={<VendorScheduled />} />
          <Route path="vendor/conducted" element={<VendorConducted />} />
        </Route>
        <Route path="/audit/operational/scheduled/create" element={<AuthenticatedLayout><ScheduleAuditForm /></AuthenticatedLayout>} />
        <Route path="/audit/operational/scheduled/view/:id" element={<AuthenticatedLayout><ScheduledListView /></AuthenticatedLayout>} />
        <Route path="/audit/operational/scheduled/edit/:id" element={<AuthenticatedLayout><ScheduledListEdit /></AuthenticatedLayout>} />
        <Route path="/audit/operational/checklists/create" element={<AuthenticatedLayout><ChecklistAuditForm /></AuthenticatedLayout>} />
        <Route path="/audit/operational/checklists/view/:id" element={<AuthenticatedLayout><ChecklistView/></AuthenticatedLayout>} />
        <Route path="/audit/operational/checklists/edit/:id" element={<AuthenticatedLayout><ChecklistsList/></AuthenticatedLayout>} />
        <Route path="/audit/vendor/scheduled/create" element={<AuthenticatedLayout><ScheduleAuditForm /></AuthenticatedLayout>} />

        {/* Compliance - FM Module */}
        <Route path="/compliance" element={<AuthenticatedLayout><Compliance /></AuthenticatedLayout>} />
        <Route path="/compliance/add-compliance" element={<AuthenticatedLayout><AddCompliance /></AuthenticatedLayout>} />
        <Route path="/compliance/compliance-details/:id" element={<AuthenticatedLayout><ComplianceDetails /></AuthenticatedLayout>} />

        {/* Parking - FM Module */}
        <Route path="/parking" element={<AuthenticatedLayout><Parkings /></AuthenticatedLayout>} />
        <Route path="/admin/book-parking" element={<AuthenticatedLayout><AddParking /></AuthenticatedLayout>} />
        <Route path="/parking/:id" element={<AuthenticatedLayout><ParkingDetails /></AuthenticatedLayout>} />

        {/* Survey - FM Module */}
        <Route path="/survey" element={<AuthenticatedLayout><Survey /></AuthenticatedLayout>} />
        <Route path="/admin/add-survey" element={<AuthenticatedLayout><AddSurvey /></AuthenticatedLayout>} />
        <Route path="/admin/create-scratch-survey" element={<AuthenticatedLayout><CreateScratchSurvey /></AuthenticatedLayout>} />
        <Route path="/admin/copy-survey" element={<AuthenticatedLayout><CopySurvey /></AuthenticatedLayout>} />
        <Route path="/admin/copy-survey-view-page" element={<AuthenticatedLayout><CopySurveyViewPage /></AuthenticatedLayout>} />
        <Route path="/admin/create-template-survey" element={<AuthenticatedLayout><CreateTemplateSurvey /></AuthenticatedLayout>} />
        <Route path="/admin/template-detail-survey" element={<AuthenticatedLayout><TemplateDetailsSurvey /></AuthenticatedLayout>} />
        <Route path="/admin/edit-template-survey" element={<AuthenticatedLayout><EditTemplateSurvey /></AuthenticatedLayout>} />
        <Route path="/admin/sample-result-survey" element={<AuthenticatedLayout><SampleResultSurvey /></AuthenticatedLayout>} />
        <Route path="/admin/survey-details/:id" element={<AuthenticatedLayout><SurveyDetails /></AuthenticatedLayout>} />
        <Route path="/survey/:id/edit" element={<AuthenticatedLayout><EditSurvey /></AuthenticatedLayout>} />

        {/* Public Survey Response Form - No Auth Required */}
        <Route path="/survey/:id/respond" element={<SurveyResponseForm />} />

        {/* Setup - System Configuration */}
        <Route path="/setup" element={<AuthenticatedLayout><SetupPage /></AuthenticatedLayout>} />
        <Route path="/setup/account" element={<AuthenticatedLayout><AccountPage /></AuthenticatedLayout>} />
        <Route path="/setup/users" element={<AuthenticatedLayout><UsersPage /></AuthenticatedLayout>} />
        <Route path="/setup/users/create" element={<AuthenticatedLayout><CreateUserPage /></AuthenticatedLayout>} />
        <Route path="/admin/addresses-setup" element={<AuthenticatedLayout><AddressesSetup /></AuthenticatedLayout>} />
        <Route path="/admin/add-addresses-setup" element={<AuthenticatedLayout><AddAddressesSetup /></AuthenticatedLayout>} />
        <Route path="/admin/edit-addresses-setup/:id" element={<AuthenticatedLayout><EditAddressesSetup /></AuthenticatedLayout>} />
        <Route path="/admin/fm-user" element={<AuthenticatedLayout><FMUserSetupNew /></AuthenticatedLayout>} />
        <Route path="/admin/add-fm-user" element={<AuthenticatedLayout><AddFMUserSetupNew /></AuthenticatedLayout>} />
        <Route path="/admin/fm-user-details/:id" element={<AuthenticatedLayout><EditFMUserSetupNew /></AuthenticatedLayout>} />
        <Route path="/admin/invoice-approval-setup" element={<AuthenticatedLayout><InvoiceApprovalSetup /></AuthenticatedLayout>} />
        <Route path="/admin/add-invoice-approval-setup" element={<AuthenticatedLayout><AddInvoiceApprovalsSetup /></AuthenticatedLayout>} />
        <Route path="/admin/edit-invoice-approval-setup/:id" element={<AuthenticatedLayout><EditInvoiceApprovalsSetup /></AuthenticatedLayout>} />

        {/* Safety Module - Under Development Pages */}
        <Route path="/safety/module" element={<AuthenticatedLayout><PlaceholderPage title="Safety Module" /></AuthenticatedLayout>} />
        <Route path="/safety/training" element={<AuthenticatedLayout><PlaceholderPage title="Training" /></AuthenticatedLayout>} />

        {/* Permit - Safety Module */}
        <Route path="/safety/permit" element={<AuthenticatedLayout><PermitList /></AuthenticatedLayout>} />
        <Route path="/safety/permit/create" element={<AuthenticatedLayout><CreatePermit /></AuthenticatedLayout>} />
        <Route path="/safety/permit/:id" element={<AuthenticatedLayout><ViewPermit /></AuthenticatedLayout>} />
        <Route path="/safety/permit/:id/edit" element={<AuthenticatedLayout><CreatePermit /></AuthenticatedLayout>} />

        {/* Procurement Module - Tabbed Layout */}
        <Route path="/finance/procurement" element={<AuthenticatedLayout><ProcurementLayout /></AuthenticatedLayout>}>
          <Route index element={<Navigate to="/finance/procurement/material-pr" replace />} />
          <Route path="material-pr" element={<MaterialPRList />} />
          <Route path="material-pr/create" element={<CreateMaterialPR />} />
          <Route path="material-pr/:id" element={<CreateMaterialPR />} />
          <Route path="material-pr/:id/edit" element={<CreateMaterialPR />} />
          <Route path="service-pr" element={<ServicePRList />} />
          <Route path="po" element={<POList />} />
          <Route path="wo" element={<WOList />} />
          <Route path="grn-srn" element={<GRNSRNList />} />
          <Route path="auto-saved-pr" element={<AutoSavedPRList />} />
          <Route path="pending-approvals" element={<PendingApprovalsList />} />
          <Route path="deletion-requests" element={<DeletionRequestsList />} />
          <Route path="deleted-prs" element={<DeletedPRsList />} />
        </Route>
        
        {/* Other Bills - Finance Module */}
        <Route path="/finance/other-bills" element={<AuthenticatedLayout><OtherBillsList /></AuthenticatedLayout>} />
        <Route path="/finance/other-bills/create" element={<AuthenticatedLayout><CreateOtherBill /></AuthenticatedLayout>} />
        <Route path="/finance/other-bills/:id" element={<AuthenticatedLayout><ViewOtherBill /></AuthenticatedLayout>} />
        <Route path="/finance/other-bills/:id/edit" element={<AuthenticatedLayout><CreateOtherBill /></AuthenticatedLayout>} />
        {/* Finance CAM - Tabbed Layout */}
        <Route path="/finance/cam" element={<AuthenticatedLayout><CAMLayout /></AuthenticatedLayout>}>
          <Route index element={<Navigate to="/finance/cam/billing" replace />} />
          <Route path="billing" element={<CamBillingList />} />
          <Route path="receipt-invoice" element={<ReceiptInvoiceList />} />
        </Route>
        <Route path="/finance/cam/billing/add" element={<AuthenticatedLayout><AddCamBilling /></AuthenticatedLayout>} />
        <Route path="/finance/cam/billing/:id" element={<AuthenticatedLayout><ViewCamBilling /></AuthenticatedLayout>} />
        <Route path="/finance/cam/receipt-invoice/add" element={<AuthenticatedLayout><AddReceiptInvoice /></AuthenticatedLayout>} />
        <Route path="/finance/cam/receipt-invoice/:id" element={<AuthenticatedLayout><ViewReceiptInvoice /></AuthenticatedLayout>} />
        <Route path="/finance/wallet" element={<AuthenticatedLayout><PlaceholderPage title="Wallet" /></AuthenticatedLayout>} />
        <Route path="/finance/wbs" element={<AuthenticatedLayout><PlaceholderPage title="WBS" /></AuthenticatedLayout>} />

        {/* CRM Module - Under Development Pages */}
        <Route path="/crm/opportunity" element={<AuthenticatedLayout><PlaceholderPage title="Opportunity" /></AuthenticatedLayout>} />
        <Route path="/crm/campaign" element={<AuthenticatedLayout><PlaceholderPage title="Campaign" /></AuthenticatedLayout>} />

        {/* CRM Communications - Tabbed Layout */}
        <Route path="/crm/communications" element={<AuthenticatedLayout><CommunicationsLayout /></AuthenticatedLayout>}>
          <Route index element={<Navigate to="/crm/communications/events" replace />} />
          <Route path="events" element={<EventsList />} />
          <Route path="broadcast" element={<BroadcastList />} />
          <Route path="polls" element={<PollsList />} />
          <Route path="forum" element={<ForumFeed />} />
          <Route path="groups" element={<GroupsList />} />
        </Route>
        {/* Events Detail Routes */}
        <Route path="/crm/communications/events/create" element={<AuthenticatedLayout><CreateEvent /></AuthenticatedLayout>} />
        <Route path="/crm/communications/events/:id" element={<AuthenticatedLayout><ViewEvent /></AuthenticatedLayout>} />
        <Route path="/crm/communications/events/:id/edit" element={<AuthenticatedLayout><CreateEvent /></AuthenticatedLayout>} />
        {/* Broadcast Detail Routes */}
        <Route path="/crm/communications/broadcast/create" element={<AuthenticatedLayout><CreateBroadcast /></AuthenticatedLayout>} />
        <Route path="/crm/communications/broadcast/:id" element={<AuthenticatedLayout><ViewBroadcast /></AuthenticatedLayout>} />
        <Route path="/crm/communications/broadcast/:id/edit" element={<AuthenticatedLayout><CreateBroadcast /></AuthenticatedLayout>} />
        {/* Polls Detail Routes */}
        <Route path="/crm/communications/polls/create" element={<AuthenticatedLayout><CreatePoll /></AuthenticatedLayout>} />
        {/* Forum Detail Routes */}
        <Route path="/crm/communications/forum/create" element={<AuthenticatedLayout><CreateForum /></AuthenticatedLayout>} />
        <Route path="/crm/communications/forum/saved" element={<AuthenticatedLayout><PlaceholderPage title="Saved Forum" /></AuthenticatedLayout>} />
        <Route path="/crm/communications/forum/reported" element={<AuthenticatedLayout><PlaceholderPage title="Reported Forum" /></AuthenticatedLayout>} />
        <Route path="/crm/communications/forum/hidden" element={<AuthenticatedLayout><PlaceholderPage title="Hidden Forum" /></AuthenticatedLayout>} />

        {/* Booking Management - On Demand Service */}
        <Route path="/booking/on-demand-service" element={<AuthenticatedLayout><OnDemandServiceHub /></AuthenticatedLayout>} />

        {/* Inventory - FM Module */}
        <Route path="/inventory" element={<Navigate to="/inventory/masters" replace />} />
        <Route path="/inventory/masters" element={<AuthenticatedLayout><MastersList /></AuthenticatedLayout>} />
        <Route path="/inventory/masters/create" element={<AuthenticatedLayout><CreateMaster /></AuthenticatedLayout>} />
        <Route path="/inventory/masters/:id" element={<AuthenticatedLayout><ViewMaster /></AuthenticatedLayout>} />
        <Route path="/inventory/masters/:id/edit" element={<AuthenticatedLayout><CreateMaster /></AuthenticatedLayout>} />
        <Route path="/inventory/stocks" element={<AuthenticatedLayout><StocksList /></AuthenticatedLayout>} />
        <Route path="/inventory/stocks/:id" element={<AuthenticatedLayout><ViewStock /></AuthenticatedLayout>} />
        <Route path="/inventory/grn" element={<AuthenticatedLayout><GRNList /></AuthenticatedLayout>} />
        <Route path="/inventory/grn/create" element={<AuthenticatedLayout><CreateGRN /></AuthenticatedLayout>} />
        <Route path="/inventory/grn/:id" element={<AuthenticatedLayout><ViewGRN /></AuthenticatedLayout>} />
        <Route path="/inventory/grn/:id/edit" element={<AuthenticatedLayout><CreateGRN /></AuthenticatedLayout>} />
        <Route path="/inventory/gdn" element={<AuthenticatedLayout><GDNList /></AuthenticatedLayout>} />
        <Route path="/inventory/gdn/create" element={<AuthenticatedLayout><CreateGDN /></AuthenticatedLayout>} />
        <Route path="/inventory/gdn/:id" element={<AuthenticatedLayout><ViewGDN /></AuthenticatedLayout>} />
        <Route path="/inventory/gdn/:id/edit" element={<AuthenticatedLayout><CreateGDN /></AuthenticatedLayout>} />

        {/* Catch all - redirect to dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  );
}

export default App;
