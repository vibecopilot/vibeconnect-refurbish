import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users as UsersIcon, Plus, Eye, Edit, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { getSetupUsers, sendMailToUsers } from '../../../api';
import { getItemInLocalStorage } from '../../../utils/localStorage';
import Table from '../../../components/table/Table';
import Button from '../../../components/ui/Button';
import FormInput from '../../../components/ui/FormInput';

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [searchText, setSearchText] = useState('');
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const siteId = getItemInLocalStorage('SITEID');

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const setupUsers = await getSetupUsers();

        // Format user data for the table
        const formattedUsers = setupUsers.data.map((user: any) => ({
          id: user.id,
          firstname: user.firstname || '',
          lastname: user.lastname || '',
          mobile: user.mobile || '',
          email: user.email || '',
          Ownership_Types: user.user_sites?.[0]?.ownership_type || 'N/A',
          Phase: user.user_phase || 'N/A',
          Occupied: user.lives_here ? 'Yes' : 'No',
          Status: user.user_status ? 'Active' : 'Inactive',
          Vehical: user.vehicle || 'N/A',
          App_Downloaded: user.is_downloaded ? 'Yes' : 'No',
          Alternate_Address: user.user_address || '',
          Alternate_Email_1: user.email_1 || '',
          Landline_Number: user.landline_number || '',
          Intercom_Number: user.intercom_number || '',
          GST_Number: user.gst_number || 'N/A',
          PAN_Number: user.pan_number || 'N/A',
          Created_On: user.created_at
            ? new Date(user.created_at).toLocaleDateString()
            : '',
          Updated_On: user.updated_at
            ? new Date(user.updated_at).toLocaleDateString()
            : '',
          user_type:
            user.user_type === ''
              ? 'N/A'
              : user.user_type === 'pms_admin'
              ? 'Admin'
              : user.user_type === 'employee'
              ? 'Employee'
              : user.user_type,
        }));

        setUsers(formattedUsers);
        setFilteredData(formattedUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error('Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Derived counts
  const totalUsers = users.length;
  const activeCount = users.filter((u) => u.Status === 'Active').length;
  const pendingCount = users.filter((u) => u.Status === 'Inactive').length;
  const appDownloadedCount = users.filter((u) => u.App_Downloaded === 'Yes').length;

  // Search functionality
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const searchValue = e.target.value;
    setSearchText(searchValue);

    if (searchValue.trim() === '') {
      setFilteredData(users);
    } else {
      const filteredResults = users.filter(
        (item) =>
          (item.firstname &&
            item.firstname.toLowerCase().includes(searchValue.toLowerCase())) ||
          (item.lastname &&
            item.lastname.toLowerCase().includes(searchValue.toLowerCase())) ||
          (item.email &&
            item.email.toLowerCase().includes(searchValue.toLowerCase()))
      );
      setFilteredData(filteredResults);
    }
  };

  // Send Mail
  const handleSendMail = async (userId: string, first: string, last: string) => {
    try {
      toast.loading(`Sending Mail to ${first} ${last}...`);
      await sendMailToUsers(userId);
      toast.dismiss();
      toast.success('Welcome Mail Sent');
    } catch (error) {
      toast.dismiss();
      toast.error('Something went wrong');
      console.error(error);
    }
  };

  // Table columns
  const userColumns = [
    {
      name: 'Action',
      cell: (row: any) => (
        <div className="flex items-center gap-3">
          <Link
            to={`/setup/users-details/${siteId}/${row.id}`}
            className="text-gray-700 hover:text-primary transition-colors"
            title="View User Details"
          >
            <Eye size={16} className="cursor-pointer hover:scale-110 duration-200" />
          </Link>
          <Link
            to={`/setup/users-edit/${siteId}/${row.id}`}
            state={{ user: row }}
            className="text-gray-700 hover:text-blue-600 transition-colors"
            title="Edit User"
          >
            <Edit size={16} className="cursor-pointer hover:scale-110 duration-200" />
          </Link>
        </div>
      ),
      width: '120px',
    },
    { name: 'Name', selector: (row: any) => `${row.firstname} ${row.lastname}` },
    { name: 'Mobile', selector: (row: any) => row.mobile },
    { name: 'Email', selector: (row: any) => row.email },
    { name: 'Ownership Type', selector: (row: any) => row.Ownership_Types },
    { name: 'Phase', selector: (row: any) => row.Phase },
    { name: 'Occupied', selector: (row: any) => row.Occupied },
    { name: 'Status', selector: (row: any) => row.Status },
    { name: 'App Downloaded', selector: (row: any) => row.App_Downloaded },
    { name: 'PAN', selector: (row: any) => row.PAN_Number },
    { name: 'GST', selector: (row: any) => row.GST_Number },
    { name: 'Created On', selector: (row: any) => row.Created_On },
    { name: 'Updated On', selector: (row: any) => row.Updated_On },
    { name: 'User Type', selector: (row: any) => row.user_type },
    {
      name: 'Send Email',
      cell: (row: any) => (
        <Button
          size="sm"
          onClick={() => handleSendMail(row.id, row.firstname, row.lastname)}
        >
          <Send className="w-3 h-3 mr-1" />
          Send
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Users</p>
              <p className="text-2xl font-bold text-foreground mt-1">{totalUsers}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <UsersIcon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Users</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{activeCount}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <UsersIcon className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pending Users</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">{pendingCount}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <UsersIcon className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">App Downloaded</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">{appDownloadedCount}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <UsersIcon className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search & Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="w-full sm:w-96">
          <FormInput
            label="Search"
            name="search"
            value={searchText}
            onChange={handleSearch}
            placeholder="Search by name or email"
          />
        </div>

        <div className="flex gap-3">
          <Link to="/setup/users/create">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </Link>
          {siteId === 10 && (
            <Link to="/setup/users/create">
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Admin User
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <p className="text-muted-foreground">Loading users...</p>
        </div>
      ) : filteredData.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <UsersIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No users found</h3>
          <p className="text-sm text-muted-foreground">
            {searchText ? 'Try adjusting your search criteria' : 'Get started by adding your first user'}
          </p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <Table columns={userColumns} data={filteredData} />
        </div>
      )}
    </div>
  );
};

export default UsersPage;