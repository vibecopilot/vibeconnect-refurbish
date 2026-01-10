import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getAllUnits,
  getBuildings,
  getFloors,
  postNewUnit,
} from '../../../api';
import { getItemInLocalStorage } from '../../../utils/localStorage';
import Table from '../../../components/table/Table';
import EditUnitModal from '../../../containers/modals/EditUnitModal';
import FormSection from '../../../components/ui/FormSection';
import FormInput from '../../../components/ui/FormInput';
import FormGrid from '../../../components/ui/FormGrid';
import Button from '../../../components/ui/Button';
import { BiEdit } from 'react-icons/bi';

const UnitPage: React.FC = () => {
  const [building, setBuilding] = useState('');
  const [floor, setFloor] = useState('');
  const [unit, setUnit] = useState('');
  const [units, setUnits] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [floors, setFloors] = useState([]);
  const [unitAdded, setUnitAdded] = useState(false);
  const [showFields, setShowFields] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [id, setId] = useState('');

  useEffect(() => {
    const fetchBuilding = async () => {
      try {
        const buildingResp = await getBuildings();
        setBuildings(buildingResp.data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchBuilding();
  }, []);

  useEffect(() => {
    const fetchAllUnits = async () => {
      try {
        const unitsResp = await getAllUnits();
        const sortedUnits = unitsResp.data.sort((a: any, b: any) => {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
        setUnits(sortedUnits);
      } catch (error) {
        console.log(error);
      }
    };
    fetchAllUnits();
  }, [unitAdded]);

  const handleBuildingChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const buildingId = e.target.value;
    setBuilding(buildingId);
    setFloor(''); // Reset floor when building changes

    if (buildingId) {
      try {
        const floorsResp = await getFloors(Number(buildingId));
        setFloors(floorsResp.data.map((item: any) => ({ name: item.name, id: item.id })));
      } catch (error) {
        console.log(error);
        setFloors([]);
      }
    } else {
      setFloors([]);
    }
  };

  const handleEditClick = (id: string) => {
    setEditModal(true);
    setId(id);
  };

  const unitColumns = [
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
      selector: (row: any) => row.floor_name,
      sortable: true,
    },
    {
      name: 'Units',
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

    if (!building || !floor || !unit) {
      toast.error('Please fill all required fields');
      return;
    }

    const formData = new FormData();
    formData.append('unit[site_id]', String(siteId));
    formData.append('unit[building_id]', building);
    formData.append('unit[floor_id]', floor);
    formData.append('unit[name]', unit);

    try {
      await postNewUnit(formData);
      setUnitAdded(!unitAdded);
      toast.success('Unit created successfully');
      setBuilding('');
      setFloor('');
      setUnit('');
      setFloors([]);
      setShowFields(false);
    } catch (error) {
      console.log(error);
      toast.error('Failed to create unit');
    }
  };

  const buildingOptions = buildings.map((build: any) => ({
    value: String(build.id),
    label: build.name,
  }));

  const floorOptions = floors.map((fl: any) => ({
    value: String(fl.id),
    label: fl.name,
  }));

  return (
    <div className="space-y-6">
      {/* Add Unit Section */}
      <div className="flex justify-end">
        <Button
          onClick={() => setShowFields(!showFields)}
          variant={showFields ? 'outline' : 'primary'}
        >
          <Plus className="w-4 h-4 mr-2" />
          {showFields ? 'Cancel' : 'Add Unit'}
        </Button>
      </div>

      {showFields && (
        <FormSection title="Add New Unit">
          <form onSubmit={handleSubmit}>
            <FormGrid columns={3}>
              <FormInput
                label="Building"
                name="building"
                type="select"
                value={building}
                onChange={handleBuildingChange}
                options={buildingOptions}
                required
                placeholder="Select Building"
              />
              <FormInput
                label="Floor"
                name="floor"
                type="select"
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
                options={floorOptions}
                required
                placeholder="Select Floor"
                disabled={!building}
              />
              <FormInput
                label="Unit Name"
                name="unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                required
                placeholder="Enter Unit Name"
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
                  setUnit('');
                  setFloors([]);
                }}
              >
                Cancel
              </Button>
              <Button type="submit">Submit</Button>
            </div>
          </form>
        </FormSection>
      )}

      {/* Units Table */}
      <FormSection title="Units">
        <Table columns={unitColumns} data={units} />
      </FormSection>

      {/* Edit Modal */}
      {editModal && (
        <EditUnitModal
          onclose={() => {
            setEditModal(false);
            setUnitAdded(!unitAdded);
          }}
          id={id}
        />
      )}
    </div>
  );
};

export default UnitPage;