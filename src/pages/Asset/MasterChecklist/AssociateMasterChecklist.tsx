import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Select from "react-select";
import {
  getAssignedTo,
  getAssociationList,
  getSiteAsset,
  postAssetAssociation,
  getAssetGroups,
  getAssetSubGroups,
  deleteAssetAssociation,
  updateActivity,
  getChecklistDetails,
} from "../../../api";
import Table from "../../../components/table/Table";
import toast from "react-hot-toast";
import { Loader2, Edit, Trash2, Users, Package, ListChecks, ArrowLeft, ClipboardList, ClipboardCheck } from "lucide-react";
import { BsPencilSquare, BsTrash } from "react-icons/bs";
import Breadcrumb from "../../../components/ui/Breadcrumb";

const AssociateMasterChecklist: React.FC = () => {
  const [assets, setAssets] = useState<any[]>([]);
  const [selectedOption, setSelectedOption] = useState<any[]>([]);
  const [selectedUserOption, setSelectedUserOption] = useState<any[]>([]);
  const [assignedTo, setAssignedTo] = useState<any[]>([]);
  const [association, setAssociation] = useState<any[]>([]);
  const [added, setAdded] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(false);
  const [checklistDetails, setChecklistDetails] = useState<any>(null);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [checklistType, setChecklistType] = useState("individual");
  const [groupId, setGroupId] = useState("");
  const [subgroupId, setSubgroupId] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [subgroups, setSubgroups] = useState<any[]>([]);

  const isPPM = checklistDetails?.ctype === 'ppm';

  const breadcrumbs = [
    { label: 'FM Module' },
    { label: 'Asset', path: '/asset' },
    { label: 'Master Checklist', path: '/asset/master-checklist' },
    { label: 'Associate Checklist' },
  ];

  // Fetch checklist details to determine type
  useEffect(() => {
    const fetchChecklistDetails = async () => {
      try {
        const response = await getChecklistDetails(id);
        setChecklistDetails(response.data);
      } catch (error) {
        console.error('Error fetching checklist details:', error);
      }
    };
    if (id) fetchChecklistDetails();
  }, [id]);

  useEffect(() => {
    const fetchChecklistGroup = async () => {
      try {
        const ChecklistGroupsResp = await getAssetGroups();
        setGroups(ChecklistGroupsResp.data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchChecklistGroup();
  }, []);

  useEffect(() => {
    if (groupId) {
      const fetchSubGroup = async () => {
        try {
          const subCatResp = await getAssetSubGroups(groupId);
          setSubgroups(
            subCatResp.map((subCat: any) => ({
              label: subCat.name,
              value: subCat.id,
            }))
          );
        } catch (error) {
          console.log(error);
        }
      };
      fetchSubGroup();
    }
  }, [groupId]);

  const deleteActivity = async (activity: any) => {
    const confirmDelete = window.confirm("Please Confirm To Delete Activity?");
    if (!confirmDelete) return;

    const { asset_id } = activity;
    const checklist_id = id;

    try {
      await deleteAssetAssociation({ checklist_id, asset_id });
      toast.success("Deleted successfully!");
      setAssociation((prev) => prev.filter((a) => a.id !== activity.id));
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Failed to delete.");
    }
  };

  const column = [
    {
      name: "Asset Name",
      selector: (row: any) => row.asset_name,
      sortable: true,
    },
    {
      name: "Assigned To",
      selector: (row: any) => row.assigned_to,
      sortable: true,
    },
    {
      name: "Action",
      cell: (row: any) => (
        <div className="flex gap-2">
          <button
            className="text-primary hover:text-primary/80"
            onClick={() => {
              setEditData(row);
              setShowEditModal(true);
            }}
          >
            <BsPencilSquare size={16} />
          </button>
          <button
            className="text-red-500 hover:text-red-700"
            onClick={() => deleteActivity(row)}
          >
            <BsTrash size={16} />
          </button>
        </div>
      ),
    },
  ];

  useEffect(() => {
    const fetchAssetsList = async () => {
      const assetListResp = await getSiteAsset();
      const asset = assetListResp.data.site_assets;
      const assetList = asset.map((a: any) => ({
        value: a.id,
        label: a.name,
      }));
      setAssets(assetList);
    };

    const fetchAssignedTo = async () => {
      const assignedToList = await getAssignedTo();
      const user = assignedToList.data.map((u: any) => ({
        value: u.id,
        label: `${u.firstname} ${u.lastname}`,
      }));
      setAssignedTo(user);
    };

    const fetchAssociationList = async () => {
      setListLoading(true);
      try {
        const assoResp = await getAssociationList(id);
        const sortedData = assoResp.data.associated_with.sort(
          (a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        setAssociation(
          sortedData.map((item: any) => ({
            ...item,
            id: item.id || item.asset_id,
          }))
        );
      } catch (error) {
        console.log(error);
        toast.error("Failed to fetch associated checklist data.");
      } finally {
        setListLoading(false);
      }
    };

    fetchAssetsList();
    fetchAssignedTo();
    fetchAssociationList();
  }, [added, id]);

  const associatedAssetIds = association.map((a) => a.asset_id);
  const availableAssets = assets.filter(
    (asset) => !associatedAssetIds.includes(asset.value)
  );

  const handleChangeSelect = (selectedOption: any) => {
    setSelectedOption(selectedOption);
  };

  const handleUserChangeSelect = (selectedUserOption: any) => {
    setSelectedUserOption(selectedUserOption);
  };

  const handleAddAssociate = async () => {
    const payload = {
      asset_ids: selectedOption.map((option: any) => option.value),
      activity: {
        checklist_id: id,
      },
      assigned_to: selectedUserOption.map((opt: any) => opt.value),
    };

    try {
      setLoading(true);
      toast.loading("Associating Checklist");
      await postAssetAssociation(payload);
      toast.dismiss();
      toast.success("Checklist Associated");
      setAdded(true);
      setAssets([]);
      setSelectedOption([]);
      setSelectedUserOption([]);
    } catch (error) {
      console.error("Checklist creation failed:", error);
      toast.dismiss();
      toast.error("Failed to create checklist");
    } finally {
      setLoading(false);
      setTimeout(() => {
        setAdded(false);
      }, 500);
    }
  };

  const EditAssociationModal = ({
    show,
    onClose,
    associationData,
    assets,
    assignedTo,
    onUpdate,
  }: any) => {
    const [selectedAssets, setSelectedAssets] = useState<any[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<any[]>([]);

    useEffect(() => {
      if (associationData) {
        setSelectedAssets(
          associationData.asset_id
            ? [
                {
                  label: associationData.asset_name,
                  value: associationData.asset_id,
                },
              ]
            : []
        );
        setSelectedUsers(
          associationData.users_with_ids
            ? associationData.users_with_ids.map((user: any) => ({
                label: user.user_name,
                value: user.user_id,
              }))
            : []
        );
      }
    }, [associationData]);

    const checklist_id = associationData?.checklist_id || id;

    const handleSubmit = async () => {
      const assetIds = selectedAssets.map((asset: any) => asset.value);
      const userIds = selectedUsers.map((user: any) => user.value);

      const payload = {
        asset_ids: assetIds,
        assigned_to: userIds,
        checklist_id: checklist_id,
      };

      try {
        await updateActivity(id, payload);
        toast.success("Association updated successfully.");
        onUpdate();
        onClose();
      } catch (err) {
        console.error("Failed to update association:", err);
        toast.error("Failed to update association.");
      }
    };

    if (!show) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-card border border-border rounded-2xl shadow-xl p-6 w-full max-w-md"
        >
          <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
            <Edit className="w-5 h-5 text-primary" />
            Edit Association
          </h2>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block flex items-center gap-2">
                <Package className="w-4 h-4 text-muted-foreground" />
                Asset
              </label>
              <Select
                isMulti
                options={assets}
                value={selectedAssets}
                onChange={setSelectedAssets}
                className="text-sm"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                Assigned To
              </label>
              <Select
                isMulti
                options={assignedTo}
                value={selectedUsers}
                onChange={setSelectedUsers}
                className="text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-border rounded-lg text-foreground hover:bg-accent transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Update
            </button>
          </div>
        </motion.div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 bg-background/95 backdrop-blur-sm border-b z-20">
        <div className="w-full px-6 py-3">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <div className="h-8 w-px bg-border" />
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                isPPM ? 'bg-purple-500/10 text-purple-600' : 'bg-blue-500/10 text-blue-600'
              }`}>
                {isPPM ? <ClipboardCheck className="h-5 w-5" /> : <ClipboardList className="h-5 w-5" />}
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">Associate Checklist</h1>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {checklistDetails?.name || `Checklist #${id}`}
                  </span>
                  {checklistDetails && (
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                      isPPM
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                        : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    }`}>
                      {isPPM ? 'PPM' : 'Routine'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-6 space-y-6">
        <Breadcrumb items={breadcrumbs} />

        {/* Form Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-2xl shadow-sm p-6 space-y-6"
        >
          {/* Checklist Type */}
          <div>
            <label className="text-sm font-medium text-foreground mb-3 block">
              Assignment Type
            </label>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="checklistType"
                  value="individual"
                  checked={checklistType === "individual"}
                  onChange={(e) => setChecklistType(e.target.value)}
                  className="w-4 h-4 text-primary focus:ring-primary"
                />
                <span className="text-sm text-foreground">Individual Assets</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="checklistType"
                  value="assetGroup"
                  checked={checklistType === "assetGroup"}
                  onChange={(e) => setChecklistType(e.target.value)}
                  className="w-4 h-4 text-primary focus:ring-primary"
                />
                <span className="text-sm text-foreground">Asset Group</span>
              </label>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid md:grid-cols-3 gap-4">
            {checklistType === "individual" ? (
              <div className="flex flex-col">
                <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                  <Package className="w-4 h-4 text-muted-foreground" />
                  Asset <span className="text-red-500">*</span>
                </label>
                <Select
                  isClearable={false}
                  closeMenuOnSelect={false}
                  isMulti
                  onChange={handleChangeSelect}
                  options={availableAssets}
                  noOptionsMessage={() => "No Assets Available"}
                  placeholder="Select Assets"
                  value={selectedOption}
                />
              </div>
            ) : (
              <>
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-foreground mb-2">
                    Group <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="border border-border p-2.5 rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    value={groupId}
                    onChange={(e) => setGroupId(e.target.value)}
                  >
                    <option>Select Group</option>
                    {groups.map((group: any) => (
                      <option value={group.id} key={group.id}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col">
                  <label className="text-sm font-medium text-foreground mb-2">
                    Subgroup
                  </label>
                  <Select
                    isMulti
                    isSearchable
                    placeholder="Select Subgroup"
                    options={subgroups}
                    value={subgroupId}
                    onChange={(selected: any) => setSubgroupId(selected)}
                  />
                </div>
              </>
            )}

            <div className="flex flex-col">
              <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                Assign to <span className="text-red-500">*</span>
              </label>
              <Select
                closeMenuOnSelect={false}
                isMulti
                onChange={handleUserChangeSelect}
                options={assignedTo}
                noOptionsMessage={() => "No Users Available"}
                placeholder="Select Users"
                value={selectedUserOption}
              />
            </div>
          </div>

          {/* Action Button */}
          <div className="flex justify-end">
            <button
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              onClick={handleAddAssociate}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Create Activity"
              )}
            </button>
          </div>
        </motion.div>

        {/* Table Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border rounded-2xl shadow-sm p-6"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Associated Assets
          </h3>

          {listLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <Table columns={column} data={association} />
          )}
        </motion.div>
      </div>

      <EditAssociationModal
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
        associationData={editData}
        assets={assets}
        assignedTo={assignedTo}
        onUpdate={() => setAdded(true)}
      />
    </div>
  );
};

export default AssociateMasterChecklist;