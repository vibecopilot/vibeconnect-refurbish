import React from "react";
import { motion } from "framer-motion";
import { AssetCategory } from "../../config/assetCategorySchema";
import {
  Landmark,
  Building2,
  Layers,
  Car,
  Sofa,
  MonitorSmartphone,
  Cog,
  Wrench,
  Gauge,
  CheckCircle,
  Sparkles,
} from "lucide-react";

type CategorySelectorProps = {
  categories: AssetCategory[];
  selectedId?: string;
  onSelect: (categoryId: string) => void;
  onCustomFormSelect?: () => void;
  isCustomFormActive?: boolean;
};

const iconMap: Record<string, React.ReactNode> = {
  land: <Landmark className="h-6 w-6" />,
  building: <Building2 className="h-6 w-6" />,
  leasehold_improvement: <Layers className="h-6 w-6" />,
  vehicle: <Car className="h-6 w-6" />,
  furniture_fixtures: <Sofa className="h-6 w-6" />,
  it_equipment: <MonitorSmartphone className="h-6 w-6" />,
  machinery_equipment: <Cog className="h-6 w-6" />,
  tools_instruments: <Wrench className="h-6 w-6" />,
  meter: <Gauge className="h-6 w-6" />,
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const item = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1 }
};

const CategorySelector: React.FC<CategorySelectorProps> = ({ categories, selectedId, onSelect, onCustomFormSelect, isCustomFormActive }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-border bg-card p-6 shadow-sm"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 text-primary flex items-center justify-center">
          <Layers className="h-4 w-4" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-foreground">ASSET CATEGORY</h2>
          <p className="text-xs text-muted-foreground">Select a category to customize your form</p>
        </div>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4"
      >
        {categories.map((cat) => {
          const isActive = cat.id === selectedId;
          return (
            <motion.button
              key={cat.id}
              variants={item}
              type="button"
              onClick={() => onSelect(cat.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`relative flex flex-col items-center gap-3 rounded-xl border p-4 text-center transition-all duration-200 ${
                isActive
                  ? "border-primary bg-gradient-to-br from-primary/10 to-primary/5 shadow-lg shadow-primary/20"
                  : "border-border bg-background hover:bg-muted/60 hover:border-primary/50"
              }`}
            >
              {isActive && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-2 right-2"
                >
                  <CheckCircle className="h-5 w-5 text-primary fill-primary/20" />
                </motion.div>
              )}

              <div
                className={`h-14 w-14 rounded-xl flex items-center justify-center transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-br from-primary to-primary/80 text-white shadow-lg"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {iconMap[cat.id] || <Layers className="h-6 w-6" />}
              </div>

              <div className="flex-1">
                <p className={`text-sm font-semibold ${isActive ? "text-primary" : "text-foreground"}`}>
                  {cat.label}
                </p>
              </div>

              <div
                className={`h-1.5 w-full rounded-full transition-all duration-200 ${
                  isActive ? "bg-primary" : "bg-border"
                }`}
              />
            </motion.button>
          );
        })}

        {/* Custom Form Template Button */}
        {onCustomFormSelect && (
          <motion.button
            variants={item}
            type="button"
            onClick={onCustomFormSelect}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`relative flex flex-col items-center gap-3 rounded-xl border p-4 text-center transition-all duration-200 ${
              isCustomFormActive
                ? "border-amber-500 bg-gradient-to-br from-amber-500/10 to-amber-500/5 shadow-lg shadow-amber-500/20"
                : "border-border bg-background hover:bg-muted/60 hover:border-amber-500/50"
            }`}
          >
            {isCustomFormActive && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-2 right-2"
              >
                <CheckCircle className="h-5 w-5 text-amber-600 fill-amber-500/20" />
              </motion.div>
            )}

            <div
              className={`h-14 w-14 rounded-xl flex items-center justify-center transition-all duration-200 ${
                isCustomFormActive
                  ? "bg-gradient-to-br from-amber-600 to-amber-500 text-white shadow-lg"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              <Sparkles className="h-6 w-6" />
            </div>

            <div className="flex-1">
              <p className={`text-sm font-semibold ${isCustomFormActive ? "text-amber-600" : "text-foreground"}`}>
                Custom Form
              </p>
            </div>

            <div
              className={`h-1.5 w-full rounded-full transition-all duration-200 ${
                isCustomFormActive ? "bg-amber-600" : "bg-border"
              }`}
            />
          </motion.button>
        )}
      </motion.div>
    </motion.div>
  );
};

export default CategorySelector;
