import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import FormInput from '../../../components/ui/FormInput';

interface Floor {
  id: number;
  name: string;
}

const FloorsAreas: React.FC = () => {
  const [hasMultipleAreas, setHasMultipleAreas] = useState(true);
  const [floors, setFloors] = useState<Floor[]>([
    { id: 1, name: 'Ground Floor' },
    { id: 2, name: 'First Floor' },
    { id: 3, name: 'Garden Area' },
  ]);

  const addFloor = () => {
    const newId = Math.max(...floors.map(f => f.id), 0) + 1;
    setFloors([...floors, { id: newId, name: '' }]);
  };

  const removeFloor = (id: number) => {
    setFloors(floors.filter(f => f.id !== id));
  };

  const updateFloorName = (id: number, name: string) => {
    setFloors(floors.map(f => f.id === id ? { ...f, name } : f));
  };

  const handleSave = () => {
    // TODO: Replace with actual API call
    // await saveFloorsAreas({ hasMultipleAreas, floors });
    console.log('Floors/Areas:', { hasMultipleAreas, floors });
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Do you have multiple floors or areas?</label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="multipleAreas"
              checked={!hasMultipleAreas}
              onChange={() => setHasMultipleAreas(false)}
              className="w-4 h-4 text-primary accent-primary"
            />
            <span className="text-sm text-foreground">Single area</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="multipleAreas"
              checked={hasMultipleAreas}
              onChange={() => setHasMultipleAreas(true)}
              className="w-4 h-4 text-primary accent-primary"
            />
            <span className="text-sm text-foreground">Multiple areas</span>
          </label>
        </div>
      </div>

      {hasMultipleAreas && (
        <div className="space-y-3">
          {floors.map((floor) => (
            <div key={floor.id} className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground w-24">Floor Name:</span>
              <input
                type="text"
                value={floor.name}
                onChange={(e) => updateFloorName(floor.id, e.target.value)}
                placeholder="Enter floor name"
                className="flex-1 px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <button
                onClick={() => removeFloor(floor.id)}
                className="flex items-center gap-1 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
                Remove
              </button>
            </div>
          ))}
          <button
            onClick={addFloor}
            className="flex items-center gap-2 px-4 py-2 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Floor/Area
          </button>
        </div>
      )}

      <div className="flex justify-end pt-4">
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-error text-error-foreground rounded-lg hover:bg-error/90 transition-colors text-sm font-medium"
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default FloorsAreas;
