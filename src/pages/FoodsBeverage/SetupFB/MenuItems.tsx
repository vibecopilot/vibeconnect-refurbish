import React, { useState } from 'react';
import { Edit2 } from 'lucide-react';

interface MenuItem {
  id: number;
  name: string;
  price: number;
  checked: boolean;
  category: string;
}

const MenuItems: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([
    // North Indian
    { id: 1, name: 'Paneer Tikka', price: 250, checked: true, category: 'North Indian' },
    { id: 2, name: 'Butter Chicken', price: 320, checked: true, category: 'North Indian' },
    { id: 3, name: 'Dal Makhani', price: 180, checked: true, category: 'North Indian' },
    { id: 4, name: 'Kadai Paneer', price: 200, checked: false, category: 'North Indian' },
    { id: 5, name: 'Naan', price: 40, checked: true, category: 'North Indian' },
    { id: 6, name: 'Tandoori Roti', price: 30, checked: true, category: 'North Indian' },
    // Chinese
    { id: 7, name: 'Veg Manchurian', price: 200, checked: true, category: 'Chinese' },
    { id: 8, name: 'Chicken Fried Rice', price: 220, checked: true, category: 'Chinese' },
    { id: 9, name: 'Hakka Noodles', price: 200, checked: true, category: 'Chinese' },
    { id: 10, name: 'Spring Rolls', price: 150, checked: false, category: 'Chinese' },
    // South Indian
    { id: 11, name: 'Masala Dosa', price: 120, checked: true, category: 'South Indian' },
    { id: 12, name: 'Idli Sambhar', price: 80, checked: true, category: 'South Indian' },
    { id: 13, name: 'Medu Vada', price: 70, checked: false, category: 'South Indian' },
  ]);
  const [editingItemId, setEditingItemId] = useState<number | null>(null);

  const toggleMenuItem = (id: number) => {
    setMenuItems(menuItems.map(m => m.id === id ? { ...m, checked: !m.checked } : m));
  };

  const updateMenuItemPrice = (id: number, price: number) => {
    setMenuItems(menuItems.map(m => m.id === id ? { ...m, price } : m));
    setEditingItemId(null);
  };

  const selectAllMenuItems = () => {
    setMenuItems(menuItems.map(m => ({ ...m, checked: true })));
  };

  const deselectAllMenuItems = () => {
    setMenuItems(menuItems.map(m => ({ ...m, checked: false })));
  };

  const handleSave = () => {
    // TODO: Replace with actual API call
    // await saveMenuItems({ menuItems });
    console.log('Menu Items:', { menuItems });
  };

  // Grouped menu items by category
  const groupedMenuItems = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Based on your selected categories, common items are listed. Select items you serve and edit prices.
      </p>
      
      <div className="flex gap-3 mb-4">
        <button
          onClick={selectAllMenuItems}
          className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          Select All
        </button>
        <button
          onClick={deselectAllMenuItems}
          className="px-4 py-2 text-sm bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors"
        >
          Deselect All
        </button>
      </div>

      <div className="space-y-6">
        {Object.entries(groupedMenuItems).map(([category, items]) => (
          <div key={category}>
            <h4 className="font-semibold text-foreground mb-3 uppercase">{category}</h4>
            <div className="space-y-2 pl-4">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer flex-1">
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => toggleMenuItem(item.id)}
                      className="w-4 h-4 rounded text-primary accent-primary"
                    />
                    <span className="text-sm text-foreground">{item.name}</span>
                  </label>
                  <span className="text-sm text-muted-foreground">-</span>
                  <span className="text-sm text-muted-foreground">₹</span>
                  {editingItemId === item.id ? (
                    <input
                      type="number"
                      defaultValue={item.price}
                      onBlur={(e) => updateMenuItemPrice(item.id, parseInt(e.target.value) || item.price)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          updateMenuItemPrice(item.id, parseInt((e.target as HTMLInputElement).value) || item.price);
                        }
                      }}
                      className="w-20 px-2 py-1 border border-border rounded bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                      autoFocus
                    />
                  ) : (
                    <span className="text-sm text-foreground w-12">{item.price}</span>
                  )}
                  <button
                    onClick={() => setEditingItemId(item.id)}
                    className="p-1 text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
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

export default MenuItems;
