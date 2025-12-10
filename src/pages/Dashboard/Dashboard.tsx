import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Wrench, 
  Building2, 
  CalendarDays, 
  FileText, 
  HardHat,
  Ticket,
  AlertTriangle,
  Coffee
} from 'lucide-react';

const modules = [
  { name: 'Service Desk', icon: Ticket, path: '/service-desk', color: 'bg-blue-500' },
  { name: 'Asset', icon: Wrench, path: '/asset', color: 'bg-emerald-500' },
  { name: 'Soft Services', icon: Building2, path: '/soft-services', color: 'bg-purple-500' },
  { name: 'VMS', icon: Users, path: '/vms/visitors', color: 'bg-orange-500' },
  { name: 'Amenities Booking', icon: CalendarDays, path: '/amenities', color: 'bg-pink-500' },
  { name: 'Space Booking', icon: Building2, path: '/space-booking', color: 'bg-indigo-500' },
  { name: 'F&B', icon: Coffee, path: '/fb', color: 'bg-amber-500' },
  { name: 'Incident', icon: AlertTriangle, path: '/incident', color: 'bg-red-500' },
  { name: 'Documents', icon: FileText, path: '/documents', color: 'bg-teal-500' },
  { name: 'Fitout', icon: HardHat, path: '/fitout', color: 'bg-cyan-500' },
  { name: 'Calendar', icon: CalendarDays, path: '/calendar', color: 'bg-violet-500' },
];

const Dashboard: React.FC = () => {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to FM Module</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {modules.map((module) => (
          <Link
            key={module.name}
            to={module.path}
            className="bg-card border border-border rounded-xl p-6 hover:shadow-card-hover hover:border-primary/30 transition-all group"
          >
            <div className={`w-12 h-12 ${module.color} rounded-lg flex items-center justify-center mb-4`}>
              <module.icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
              {module.name}
            </h3>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;