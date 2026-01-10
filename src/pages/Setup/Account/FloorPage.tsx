import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { getAllFloors, getBuildings, postNewFloor } from '../../../api';
import { getItemInLocalStorage } from '../../../utils/localStorage';
import Table from '../../../components/table/Table';
import EditFloorModal from '../../../containers/modals/EditFloorModal';
import FormSection from '../../../components/ui/FormSection';
import FormInput from '../../../components/ui/FormInput';
import FormGrid from '../../../components/ui/FormGrid';
import Button from '../../../components/ui/Button';
import { BiEdit } from 'react-icons/bi';

const FloorPage: React.FC = () => {
  const [building, setBuilding] = useState('');
  const [floor, setFloor] = useState('');
  const [floors, setFloors] = useState([]);
  const [floorAdded, setFloorAdded] = useState(false);
  const [showFields, setShowFields] = useState(false);
  const [buildings, setBuildings] = useState([]);
  const [editModal, setEditModal] = useState(false);
  const [id, setId] = useState('');

  useEffect(() => {
    const fetchAllFloors = async () => {
      try {
        const floorsResp = await getAllFloors();
        const sortedFloor = floorsResp.data.sort((a: any, b: any) => {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
        setFloors(sortedFloor);
      } catch (error) {
        console.log(error);
      }
    };

    const fetchBuilding = async () => {
      try {
        const buildingResp = await getBuildings();
        setBuildings(buildingResp.data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchBuilding();
    fetchAllFloors();
  }, [floorAdded]);

  const handleEditClick = (id: string) => {
    setEditModal(true);
    setId(id);
  };

  const floorColumns = [
    {
      name: 'Site',
      selector: (row: any) => row.site_name,
      sortable: true,
    },
    {
      name: 'Building',
      selector: (row: any) => row.building_name,
      sortable: true,
    },
    {
      name: 'Floors',
      selector: (row: any) => row.name,
      sortable: true,
    },
    {
      name: 'Action',
      cell: (row: any) => (
        <div className="flex items-center gap-4">
          <button onClick={() => handleEditClick(row.id)}>
            <BiEdit size={15} />
          </button>
        </div>
      ),
    },
  ];

  const siteId = getItemInLocalStorage('SITEID');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!building || !floor) {
      toast.error('Please fill all required fields');
      return;
    }

    const formData = new FormData();
    formData.append('floor[name]', floor);
    formData.append('floor[site_id]', String(siteId));
    formData.append('floor[building_id]', building);

    try {
      await postNewFloor(formData);
      toast.success('Floor created successfully');
      setFloorAdded(!floorAdded);
      setBuilding('');
      setFloor('');
      setShowFields(false);
    } catch (error) {
      console.log(error);
      toast.error('Failed to create floor');
    }
  };

  const buildingOptions = buildings.map((build: any) => ({
    value: String(build.id),
    label: build.name,
  }));

  return (
    <div className="space-y-6">
      {/* Add Floor Button */}
      <div className="flex justify-end">
        <Button
          onClick={() => setShowFields(!showFields)}
          variant={showFields ? 'outline' : 'primary'}
        >
          <Plus className="w-4 h-4 mr-2" />
          {showFields ? 'Cancel' : 'Add Floor'}
        </Button>
      </div>

      {showFields && (
        <FormSection title="Add New Floor">
          <form onSubmit={handleSubmit}>
            <FormGrid columns={2}>
              <FormInput
                label="Building"
                name="building"
                type="select"
                value={building}
                onChange={(e) => setBuilding(e.target.value)}
                options={buildingOptions}
                required
                placeholder="Select Building"
              />
              <FormInput
                label="Floor Name"
                name="floor"
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
                required
                placeholder="Enter Floor Name"
              />
            </FormGrid>

            <div className="flex justify-end gap-3 mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowFields(false);
                  setBuilding('');
                  setFloor('');
                }}
              >
                Cancel
              </Button>
              <Button type="submit">Submit</Button>
            </div>
          </form>
        </FormSection>
      )}

      {/* Floors Table */}
      <FormSection title="Floors">
        <Table columns={floorColumns} data={floors} />
      </FormSection>

      {/* Edit Modal */}
      {editModal && (
        <EditFloorModal
          id={id}
          onclose={() => {
            setEditModal(false);
            setFloorAdded(!floorAdded);
          }}
        />
      )}
    </div>
  );
};

export default FloorPage;