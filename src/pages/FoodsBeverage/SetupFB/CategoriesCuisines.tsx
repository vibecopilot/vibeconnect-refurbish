import React, { useState } from 'react';
import { Plus } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  checked: boolean;
}

const CategoriesCuisines: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([
    { id: 'starters', name: 'Starters', checked: true },
    { id: 'main-course', name: 'Main Course', checked: true },
    { id: 'beverages', name: 'Beverages', checked: true },
    { id: 'desserts', name: 'Desserts', checked: true },
    { id: 'chinese', name: 'Chinese', checked: true },
    { id: 'south-indian', name: 'South Indian', checked: true },
    { id: 'north-indian', name: 'North Indian', checked: true },
    { id: 'continental', name: 'Continental', checked: false },
    { id: 'italian', name: 'Italian', checked: false },
    { id: 'mexican', name: 'Mexican', checked: false },
    { id: 'biryani', name: 'Biryani & Rice', checked: true },
    { id: 'bread', name: 'Bread & Roti', checked: true },
    { id: 'salads', name: 'Salads', checked: false },
    { id: 'snacks', name: 'Snacks', checked: true },
    { id: 'fastfood', name: 'Fast Food', checked: true },
    { id: 'combos', name: 'Combos/Thalis', checked: true },
  ]);

  const [cuisines, setCuisines] = useState<Category[]>([
    { id: 'north-indian', name: 'North Indian', checked: true },
    { id: 'south-indian', name: 'South Indian', checked: true },
    { id: 'chinese', name: 'Chinese', checked: true },
    { id: 'continental', name: 'Continental', checked: false },
    { id: 'italian', name: 'Italian', checked: false },
    { id: 'mexican', name: 'Mexican', checked: false },
    { id: 'thai', name: 'Thai', checked: false },
    { id: 'mughlai', name: 'Mughlai', checked: true },
    { id: 'tandoori', name: 'Tandoori', checked: true },
  ]);

  const toggleCategory = (id: string) => {
    setCategories(categories.map(c => c.id === id ? { ...c, checked: !c.checked } : c));
  };

  const toggleCuisine = (id: string) => {
    setCuisines(cuisines.map(c => c.id === id ? { ...c, checked: !c.checked } : c));
  };

  const handleSave = () => {
    // TODO: Replace with actual API call
    // await saveCategoriesCuisines({ categories, cuisines });
    console.log('Categories & Cuisines:', { categories, cuisines });
  };

  return (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h4 className="font-semibold text-foreground mb-3">Categories Selection</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {categories.map((cat) => (
            <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={cat.checked}
                onChange={() => toggleCategory(cat.id)}
                className="w-4 h-4 rounded text-primary accent-primary"
              />
              <span className="text-sm text-foreground">{cat.name}</span>
            </label>
          ))}
        </div>
        <button className="flex items-center gap-2 px-4 py-2 mt-3 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors">
          <Plus className="w-4 h-4" />
          Add Custom Category
        </button>
      </div>

      {/* Cuisines */}
      <div>
        <h4 className="font-semibold text-foreground mb-3">Cuisines Selection</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {cuisines.map((cuisine) => (
            <label key={cuisine.id} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={cuisine.checked}
                onChange={() => toggleCuisine(cuisine.id)}
                className="w-4 h-4 rounded text-primary accent-primary"
              />
              <span className="text-sm text-foreground">{cuisine.name}</span>
            </label>
          ))}
        </div>
        <button className="flex items-center gap-2 px-4 py-2 mt-3 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors">
          <Plus className="w-4 h-4" />
          Add Custom Cuisine
        </button>
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

export default CategoriesCuisines;
