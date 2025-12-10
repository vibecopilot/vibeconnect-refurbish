import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageTitle from '../../components/ui/PageTitle';
import ListToolbar from '../../components/ui/ListToolbar';
import DataCard from '../../components/ui/DataCard';
import DataTable, { TableColumn } from '../../components/ui/DataTable';
import StatusBadge, { StatusType } from '../../components/ui/StatusBadge';

interface Visitor {
  id: string;
  serialNo: number;
  name: string;
  visitorId: string;
  phone: string;
  company: string;
  hostName: string;
  purpose: string;
  status: StatusType;
  checkInTime: string;
  checkOutTime: string;
  building: string;
  floor: string;
}

// Mock data
const mockVisitors: Visitor[] = [
  {
    id: '1',
    serialNo: 1,
    name: 'John Smith',
    visitorId: 'VIS-001',
    phone: '+91 98765 43210',
    company: 'Tech Corp',
    hostName: 'Rahul Kumar',
    purpose: 'Meeting',
    status: 'checked-in',
    checkInTime: '09:30 AM',
    checkOutTime: '-',
    building: 'Tower A',
    floor: '5',
  },
  {
    id: '2',
    serialNo: 2,
    name: 'Sarah Johnson',
    visitorId: 'VIS-002',
    phone: '+91 87654 32109',
    company: 'Design Studio',
    hostName: 'Priya Sharma',
    purpose: 'Interview',
    status: 'checked-out',
    checkInTime: '10:00 AM',
    checkOutTime: '11:30 AM',
    building: 'Tower B',
    floor: '3',
  },
  {
    id: '3',
    serialNo: 3,
    name: 'Michael Chen',
    visitorId: 'VIS-003',
    phone: '+91 76543 21098',
    company: 'Acme Inc',
    hostName: 'Amit Patel',
    purpose: 'Delivery',
    status: 'pending',
    checkInTime: '-',
    checkOutTime: '-',
    building: 'Tower A',
    floor: '2',
  },
  {
    id: '4',
    serialNo: 4,
    name: 'Emily Davis',
    visitorId: 'VIS-004',
    phone: '+91 65432 10987',
    company: 'Marketing Pro',
    hostName: 'Sneha Reddy',
    purpose: 'Vendor Meeting',
    status: 'checked-in',
    checkInTime: '11:15 AM',
    checkOutTime: '-',
    building: 'Tower C',
    floor: '7',
  },
];

const VisitorList: React.FC = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchValue, setSearchValue] = useState('');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  const filteredVisitors = mockVisitors.filter(visitor =>
    visitor.name.toLowerCase().includes(searchValue.toLowerCase()) ||
    visitor.visitorId.toLowerCase().includes(searchValue.toLowerCase()) ||
    visitor.company.toLowerCase().includes(searchValue.toLowerCase())
  );

  const handleSelectRow = (id: string) => {
    setSelectedRows(prev =>
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedRows.length === filteredVisitors.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(filteredVisitors.map(v => v.id));
    }
  };

  const columns: TableColumn<Visitor>[] = [
    { key: 'serialNo', header: 'Serial No', sortable: true, width: '100px' },
    { key: 'name', header: 'Visitor Name', sortable: true },
    { key: 'visitorId', header: 'Visitor ID', sortable: true },
    { key: 'phone', header: 'Phone' },
    { 
      key: 'status', 
      header: 'Status', 
      render: (value) => <StatusBadge status={value} showDropdown />
    },
    { key: 'hostName', header: 'Host', sortable: true },
    { key: 'building', header: 'Building', sortable: true },
    { key: 'floor', header: 'Floor' },
  ];

  return (
    <div className="p-6">
      <PageTitle
        title="Visitors"
        breadcrumbs={[
          { label: 'VMS', path: '/vms' },
          { label: 'Visitors' }
        ]}
      />

      <ListToolbar
        searchPlaceholder="Search by Name, ID, or Company..."
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onFilter={() => console.log('Filter clicked')}
        onExport={() => console.log('Export clicked')}
        onAdd={() => navigate('/vms/visitors/create')}
        addLabel="Add Visitor"
        showQrCode
        onQrCode={() => console.log('QR Code clicked')}
      />

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredVisitors.map((visitor) => (
            <DataCard
              key={visitor.id}
              title={visitor.name}
              subtitle={visitor.visitorId}
              status={visitor.status}
              fields={[
                { label: 'Company', value: visitor.company },
                { label: 'Host', value: visitor.hostName },
                { label: 'Building', value: visitor.building },
                { label: 'Floor', value: visitor.floor },
              ]}
              viewPath={`/vms/visitors/${visitor.id}`}
              editPath={`/vms/visitors/${visitor.id}/edit`}
            />
          ))}
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredVisitors}
          selectable
          selectedRows={selectedRows}
          onSelectRow={handleSelectRow}
          onSelectAll={handleSelectAll}
          viewPath={(row) => `/vms/visitors/${row.id}`}
        />
      )}
    </div>
  );
};

export default VisitorList;