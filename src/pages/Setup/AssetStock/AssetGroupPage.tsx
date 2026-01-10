import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { BiEdit } from 'react-icons/bi';
import toast from 'react-hot-toast';
import { getAssetGroups, getStockGroupsList, getSubGroupsList } from '../../../api';
import Table from '../../../components/table/Table';
import Button from '../../../components/ui/Button';
import FormSection from '../../../components/ui/FormSection';
import AssetGroupModal from '../../../containers/modals/AssetGroupModal';
import AssetSubGroupModal from '../../../containers/modals/AssetSubGroupModal';
import EditAssetGroup from '../../../containers/modals/EditAssetGroup';

const AssetGroupPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'asset' | 'stock'>('asset');
  const [groupModal, setGroupModal] = useState(false);
  const [subGroupModal, setSubGroupModal] = useState(false);
  const [editGroup, setEditGroup] = useState(false);
  const [assetId, setAssetId] = useState('');

  const [assetGroups, setAssetGroups] = useState<any[]>([]);
  const [stockGroups, setStockGroups] = useState<any[]>([]);
  const [subGroups, setSubGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [assetGroupsResp, stockGroupsResp, subGroupsResp] = await Promise.all([
          getAssetGroups(),
          getStockGroupsList(),
          getSubGroupsList(),
        ]);

        setAssetGroups(assetGroupsResp.data);
        setStockGroups(stockGroupsResp.data);
        setSubGroups(subGroupsResp.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAssetGroupEdit = (id: string) => {
    setEditGroup(true);
    setAssetId(id);
  };

  const handleModalClose = async () => {
    // Refresh data after modal close
    try {
      const [assetGroupsResp, stockGroupsResp, subGroupsResp] = await Promise.all([
        getAssetGroups(),
        getStockGroupsList(),
        getSubGroupsList(),
      ]);

      setAssetGroups(assetGroupsResp.data);
      setStockGroups(stockGroupsResp.data);
      setSubGroups(subGroupsResp.data);
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  };

  const assetGroupColumns = [
    {
      name: 'Sr. No',
      selector: (row: any, index: number) => index + 1,
      sortable: true,
      width: '100px',
    },
    {
      name: 'Group Name',
      selector: (row: any) => row.name,
      sortable: true,
    },
    {
      name: 'Description',
      selector: (row: any) => row.description || 'N/A',
      sortable: true,
    },
    {
      name: 'Action',
      cell: (row: any) => (
        <button
          onClick={() => handleAssetGroupEdit(row.id)}
          className="text-gray-700 hover:text-primary transition-colors"
          title="Edit Group"
        >
          <BiEdit size={16} className="cursor-pointer hover:scale-110 duration-200" />
        </button>
      ),
      width: '100px',
    },
  ];

  const stockGroupColumns = [
    {
      name: 'Sr. No',
      selector: (row: any, index: number) => index + 1,
      sortable: true,
      width: '100px',
    },
    {
      name: 'Group Name',
      selector: (row: any) => row.name,
      sortable: true,
    },
    {
      name: 'Description',
      selector: (row: any) => row.description || 'N/A',
      sortable: true,
    },
  ];

  const subGroupColumns = [
    {
      name: 'Sr. No',
      selector: (row: any, index: number) => index + 1,
      sortable: true,
      width: '100px',
    },
    {
      name: 'Group Name',
      selector: (row: any) => row.group_name,
      sortable: true,
    },
    {
      name: 'Sub Group Name',
      selector: (row: any) => row.name,
      sortable: true,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-border bg-card">
        <div className="flex">
          <button
            onClick={() => setActiveTab('asset')}
            className={`px-6 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
              activeTab === 'asset'
                ? 'border-primary text-primary bg-primary/5'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            Asset
          </button>
          <button
            onClick={() => setActiveTab('stock')}
            className={`px-6 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
              activeTab === 'stock'
                ? 'border-primary text-primary bg-primary/5'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            Stock
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        <Button onClick={() => setGroupModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Group
        </Button>
        <Button variant="outline" onClick={() => setSubGroupModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Sub Group
        </Button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Groups Table */}
          <FormSection title={activeTab === 'asset' ? 'Asset Groups' : 'Stock Groups'}>
            <Table
              columns={activeTab === 'asset' ? assetGroupColumns : stockGroupColumns}
              data={activeTab === 'asset' ? assetGroups : stockGroups}
            />
          </FormSection>

          {/* Sub Groups Table */}
          <FormSection title={activeTab === 'asset' ? 'Asset Sub Groups' : 'Stock Sub Groups'}>
            <Table columns={subGroupColumns} data={subGroups} />
          </FormSection>
        </div>
      )}

      {/* Modals */}
      {groupModal && (
        <AssetGroupModal
          onclose={() => {
            setGroupModal(false);
            handleModalClose();
          }}
        />
      )}
      {subGroupModal && (
        <AssetSubGroupModal
          assetGroup={assetGroups}
          stockGroup={stockGroups}
          onclose={() => {
            setSubGroupModal(false);
            handleModalClose();
          }}
        />
      )}
      {editGroup && (
        <EditAssetGroup
          id={assetId}
          onclose={() => {
            setEditGroup(false);
            handleModalClose();
          }}
        />
      )}
    </div>
  );
};

export default AssetGroupPage;