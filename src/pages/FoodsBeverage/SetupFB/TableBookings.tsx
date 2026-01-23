import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';

interface Floor {
  id: number;
  name: string;
}

interface Table {
  id: number;
  floorId: number;
  tableNumber: number;
  capacity: number;
}

const TableBookings: React.FC = () => {
  const [floors, setFloors] = useState<Floor[]>([
    { id: 1, name: 'Ground Floor' },
    { id: 2, name: 'First Floor' },
    { id: 3, name: 'Garden Area' },
  ]);
  const [tables, setTables] = useState<Table[]>([
    { id: 1, floorId: 1, tableNumber: 1, capacity: 4 },
    { id: 2, floorId: 1, tableNumber: 2, capacity: 2 },
    { id: 3, floorId: 1, tableNumber: 3, capacity: 6 },
    { id: 4, floorId: 2, tableNumber: 4, capacity: 4 },
    { id: 5, floorId: 2, tableNumber: 5, capacity: 8 },
    { id: 6, floorId: 3, tableNumber: 6, capacity: 4 },
  ]);

  const addTable = (floorId: number) => {
    const newId = Math.max(...tables.map(t => t.id), 0) + 1;
    const floorTables = tables.filter(t => t.floorId === floorId);
    const newTableNumber = Math.max(...floorTables.map(t => t.tableNumber), 0) + 1;
    setTables([...tables, { id: newId, floorId, tableNumber: newTableNumber, capacity: 4 }]);
  };

  const removeTable = (id: number) => {
    setTables(tables.filter(t => t.id !== id));
  };

  const updateTableCapacity = (id: number, capacity: number) => {
    setTables(tables.map(t => t.id === id ? { ...t, capacity } : t));
  };

  const handleSave = () => {
    // TODO: Replace with actual API call
    // await saveTableBookings({ tables });
    console.log('Table Bookings:', { tables });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        {floors.map((floor) => (
          <div key={floor.id} className="space-y-3">
            <h4 className="font-semibold text-foreground">{floor.name || `Floor ${floor.id}`}</h4>
            <div className="space-y-2 pl-4">
              {tables
                .filter((t) => t.floorId === floor.id)
                .map((table) => (
                  <div key={table.id} className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">Table {table.tableNumber}:</span>
                    <span className="text-sm text-muted-foreground">Capacity</span>
                    <input
                      type="number"
                      value={table.capacity}
                      onChange={(e) => updateTableCapacity(table.id, parseInt(e.target.value) || 1)}
                      min={1}
                      className="w-20 px-3 py-1.5 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent text-center"
                    />
                    <span className="text-sm text-muted-foreground">seats</span>
                    <button
                      onClick={() => removeTable(table.id)}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Remove
                    </button>
                  </div>
                ))}
              <button
                onClick={() => addTable(floor.id)}
                className="flex items-center gap-2 px-4 py-2 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Table
              </button>
            </div>
          </div>
        ))}
      </div>

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

export default TableBookings;
