import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Edit2, Boxes, X } from 'lucide-react';
import toast from 'react-hot-toast';
import ListToolbar from '../../components/list/ListToolbar';
import DataTable from '../../components/table/DataTable';
import PageHeader from '../../components/layout/PageHeader';
import { getInventory, postInventory, editInventory, getStockGroupsList, getAssetSubGroups } from '../../api';
import { useViewMode } from '../../hooks/useViewMode';

interface Stock {
  id: number;
  name: string;
  description: string;
  available_quantity: number;
  rate: number;
  group_name: string;
  sub_group_name: string;
  min_stock_level: number;
  max_stock_level: number;
  created_at: string;
  group_id?: number;
  sub_group_id?: number;
}

interface StockFormData {
  name: string;
  rate: string;
  available_quantity: string;
  group_id: string;
  sub_group_id: string;
  min_stock_level: string;
  max_stock_level: string;
  description: string;
}

const StocksList: React.FC = () => {
  const navigate = useNavigate();
  const { viewMode, setViewMode, recordsPerPage } = useViewMode();
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [filteredData, setFilteredData] = useState<Stock[]>([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStock, setEditingStock] = useState<Stock | null>(null);
  const [groups, setGroups] = useState<any[]>([]);
  const [subGroups, setSubGroups] = useState<any[]>([]);
  const [formData, setFormData] = useState<StockFormData>({
    name: '',
    rate: '',
    available_quantity: '',
    group_id: '',
    sub_group_id: '',
    min_stock_level: '',
    max_stock_level: '',
    description: '',
  });
  const [saving, setSaving] = useState(false);

  const fetchStocks = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getInventory();
      const data = Array.isArray(response?.data) ? response.data : [];
      setStocks(data);
      setFilteredData(data);
    } catch (error) {
      console.error('Error fetching stocks:', error);
      toast.error('Failed to fetch stocks');
      setStocks([]);
      setFilteredData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await getStockGroupsList();
      setGroups(Array.isArray(response?.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  const fetchSubGroups = async (groupId: string | number) => {
    try {
      const response = await getAssetSubGroups(groupId);
      setSubGroups(Array.isArray(response?.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching sub groups:', error);
      setSubGroups([]);
    }
  };

  useEffect(() => {
    fetchStocks();
    fetchGroups();
  }, [fetchStocks]);

  const handleSearch = (value: string) => {
    setSearchText(value);
    const dataToFilter = Array.isArray(stocks) ? stocks : [];
    const filtered = dataToFilter.filter((item) =>
      item.name?.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredData(filtered);
  };

  const openAddModal = () => {
    setEditingStock(null);
    setFormData({
      name: '',
      rate: '',
      available_quantity: '',
      group_id: '',
      sub_group_id: '',
      min_stock_level: '',
      max_stock_level: '',
      description: '',
    });
    setSubGroups([]);
    setShowModal(true);
  };

  const openEditModal = (stock: Stock) => {
    setEditingStock(stock);
    setFormData({
      name: stock.name || '',
      rate: stock.rate?.toString() || '',
      available_quantity: stock.available_quantity?.toString() || '',
      group_id: stock.group_id?.toString() || '',
      sub_group_id: stock.sub_group_id?.toString() || '',
      min_stock_level: stock.min_stock_level?.toString() || '',
      max_stock_level: stock.max_stock_level?.toString() || '',
      description: stock.description || '',
    });
    if (stock.group_id) {
      fetchSubGroups(stock.group_id);
    }
    setShowModal(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'group_id' && value) {
      fetchSubGroups(value);
      setFormData(prev => ({ ...prev, sub_group_id: '' }));
    }
  };

  const handleSave = async () => {
    if (!formData.name) {
      toast.error('Name is required');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        item: {
          name: formData.name,
          rate: formData.rate ? Number(formData.rate) : null,
          available_quantity: formData.available_quantity ? Number(formData.available_quantity) : null,
          group_id: formData.group_id ? Number(formData.group_id) : null,
          sub_group_id: formData.sub_group_id ? Number(formData.sub_group_id) : null,
          min_stock_level: formData.min_stock_level ? Number(formData.min_stock_level) : null,
          max_stock_level: formData.max_stock_level ? Number(formData.max_stock_level) : null,
          description: formData.description,
        }
      };

      if (editingStock) {
        await editInventory(editingStock.id, payload);
        toast.success('Stock updated successfully');
      } else {
        await postInventory(payload);
        toast.success('Stock created successfully');
      }
      setShowModal(false);
      fetchStocks();
    } catch (error) {
      console.error('Error saving stock:', error);
      toast.error(editingStock ? 'Failed to update stock' : 'Failed to create stock');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      name: 'ACTION',
      width: '100px',
      cell: (row: Stock) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/inventory/stocks/${row.id}`)}
            className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-primary transition-colors"
            title="View"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={() => openEditModal(row)}
            className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-primary transition-colors"
            title="Edit"
          >
            <Edit2 size={16} />
          </button>
        </div>
      ),
    },
    { name: 'NAME', selector: (row: Stock) => row.name || '-', sortable: true },
    { name: 'DESCRIPTION', selector: (row: Stock) => row.description || '-', sortable: true },
    { name: 'AVAILABLE QUANTITY', selector: (row: Stock) => row.available_quantity || 0, sortable: true },
    { name: 'RATE', selector: (row: Stock) => row.rate || 0, sortable: true },
    { name: 'GROUP', selector: (row: Stock) => row.group_name || '-', sortable: true },
    { name: 'SUB GROUP', selector: (row: Stock) => row.sub_group_name || '-', sortable: true },
    { name: 'MIN ORDER LEVEL', selector: (row: Stock) => row.min_stock_level || 0, sortable: true },
    { name: 'MAX ORDER LEVEL', selector: (row: Stock) => row.max_stock_level || 0, sortable: true },
    { 
      name: 'ADDED ON', 
      selector: (row: Stock) => row.created_at ? new Date(row.created_at).toLocaleDateString() : '-', 
      sortable: true 
    },
  ];

  const StockCard = ({ stock }: { stock: Stock }) => (
    <div className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Boxes className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{stock.name || 'N/A'}</h3>
            <p className="text-sm text-muted-foreground">Rate: {stock.rate || 0}</p>
          </div>
        </div>
      </div>
      <div className="space-y-1 text-sm text-muted-foreground mb-4">
        <p>Available Qty: {stock.available_quantity || 0}</p>
        <p>Group: {stock.group_name || '-'}</p>
        <p>Sub Group: {stock.sub_group_name || '-'}</p>
        <p className="line-clamp-2">{stock.description || '-'}</p>
      </div>
      <div className="flex justify-end gap-2 pt-3 border-t border-border">
        <button
          onClick={() => navigate(`/inventory/stocks/${stock.id}`)}
          className="p-2 rounded hover:bg-accent text-muted-foreground hover:text-primary transition-colors"
          title="View"
        >
          <Eye size={16} />
        </button>
        <button
          onClick={() => openEditModal(stock)}
          className="p-2 rounded hover:bg-accent text-muted-foreground hover:text-primary transition-colors"
          title="Edit"
        >
          <Edit2 size={16} />
        </button>
      </div>
    </div>
  );

  const safeFilteredData = Array.isArray(filteredData) ? filteredData : [];

  return (
    <div className="p-6">
      <PageHeader
        title=""
        breadcrumbs={[
          { label: 'FM Module', path: '/inventory/stocks' },
          { label: 'Inventory', path: '/inventory/stocks' },
          { label: 'Stocks' },
        ]}
      />

      <ListToolbar
        searchPlaceholder="Search by Stock name"
        searchValue={searchText}
        onSearchChange={handleSearch}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        showViewToggle
        showAddButton
        addButtonLabel="Add"
        onAddClick={openAddModal}
        showFilter={false}
        showExport={false}
      />

      {viewMode === 'grid' ? (
        <div className="mt-4">
          {loading ? (
            <div className="text-center py-10 text-muted-foreground">Loading...</div>
          ) : safeFilteredData.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">No stocks found</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {safeFilteredData.slice(0, recordsPerPage).map((stock) => (
                <StockCard key={stock.id} stock={stock} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={safeFilteredData}
          loading={loading}
          pagination
          paginationPerPage={recordsPerPage}
        />
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card border border-border rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">
                {editingStock ? 'Edit Stock' : 'Add Stock'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded hover:bg-accent text-muted-foreground"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Rate</label>
                  <input
                    type="number"
                    name="rate"
                    value={formData.rate}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter rate"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Available Quantity</label>
                  <input
                    type="number"
                    name="available_quantity"
                    value={formData.available_quantity}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter quantity"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Group</label>
                  <select
                    name="group_id"
                    value={formData.group_id}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select Group</option>
                    {groups.map((group: any) => (
                      <option key={group.id} value={group.id}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Sub Group</label>
                  <select
                    name="sub_group_id"
                    value={formData.sub_group_id}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select Sub Group</option>
                    {subGroups.map((sub: any) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Min Stock Level</label>
                  <input
                    type="number"
                    name="min_stock_level"
                    value={formData.min_stock_level}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter min stock level"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Max Stock Level</label>
                  <input
                    type="number"
                    name="max_stock_level"
                    value={formData.max_stock_level}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter max stock level"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  placeholder="Enter description"
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 p-4 border-t border-border">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2 border border-border text-foreground rounded-lg hover:bg-accent transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StocksList;
