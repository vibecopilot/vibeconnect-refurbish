import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Edit, Clock, Building, User, Phone, Mail, Briefcase } from 'lucide-react';
import PageTitle from '../../components/ui/PageTitle';
import StatusBadge from '../../components/ui/StatusBadge';

const ViewVisitor: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock data - in real app, fetch from API
  const visitor = {
    id: '1',
    name: 'John Smith',
    visitorId: 'VIS-001',
    email: 'john.smith@techcorp.com',
    phone: '+91 98765 43210',
    company: 'Tech Corp',
    idType: 'Aadhar Card',
    idNumber: 'XXXX-XXXX-1234',
    purpose: 'Meeting',
    hostName: 'Rahul Kumar',
    hostDepartment: 'IT Department',
    building: 'Tower A',
    floor: '5',
    status: 'checked-in' as const,
    checkInTime: '09:30 AM',
    checkOutTime: '-',
    expectedDate: '2024-01-15',
    expectedTime: '09:00 AM',
    notes: 'Important client meeting regarding Q1 project deliverables.',
    photo: null,
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <PageTitle
        title={visitor.name}
        breadcrumbs={[
          { label: 'VMS', path: '/vms' },
          { label: 'Visitors', path: '/vms/visitors' },
          { label: visitor.name }
        ]}
        actions={
          <button
            onClick={() => navigate(`/vms/visitors/${id}/edit`)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary-dark transition-colors"
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info Card */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">{visitor.name}</h2>
                <p className="text-sm text-muted-foreground">{visitor.visitorId}</p>
              </div>
            </div>
            <StatusBadge status={visitor.status} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Contact Information</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground">{visitor.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground">{visitor.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Briefcase className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground">{visitor.company}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">ID Details</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">ID Type</span>
                  <span className="text-foreground font-medium">{visitor.idType}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">ID Number</span>
                  <span className="text-foreground font-medium">{visitor.idNumber}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-border">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">Visit Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Purpose</span>
                <span className="text-foreground font-medium">{visitor.purpose}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Host</span>
                <span className="text-foreground font-medium">{visitor.hostName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Department</span>
                <span className="text-foreground font-medium">{visitor.hostDepartment}</span>
              </div>
            </div>
          </div>

          {visitor.notes && (
            <div className="mt-6 pt-6 border-t border-border">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">Notes</h3>
              <p className="text-sm text-foreground">{visitor.notes}</p>
            </div>
          )}
        </div>

        {/* Side Info */}
        <div className="space-y-4">
          {/* Location Card */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Building className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Location</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Building</span>
                <span className="text-foreground font-medium">{visitor.building}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Floor</span>
                <span className="text-foreground font-medium">{visitor.floor}</span>
              </div>
            </div>
          </div>

          {/* Timing Card */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Timing</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Check In</span>
                <span className="text-foreground font-medium">{visitor.checkInTime}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Check Out</span>
                <span className="text-foreground font-medium">{visitor.checkOutTime}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Expected</span>
                <span className="text-foreground font-medium">{visitor.expectedDate} {visitor.expectedTime}</span>
              </div>
            </div>
          </div>

          {/* Actions Card */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-3">
            <button className="w-full px-4 py-2.5 text-sm font-medium bg-success text-white rounded-lg hover:bg-success/90 transition-colors">
              Check Out Visitor
            </button>
            <button className="w-full px-4 py-2.5 text-sm font-medium border border-border rounded-lg hover:bg-secondary transition-colors">
              Print Badge
            </button>
            <button className="w-full px-4 py-2.5 text-sm font-medium text-error border border-error rounded-lg hover:bg-error hover:text-white transition-colors">
              Blacklist Visitor
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewVisitor;