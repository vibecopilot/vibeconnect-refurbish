import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2, Package, Save, X } from "lucide-react";
import toast from "react-hot-toast";
import PageTitle from "../../components/ui/PageTitle";
import FormSection from "../../components/ui/FormSection";
import FormInput from "../../components/ui/FormInput";
import FormGrid from "../../components/ui/FormGrid";
import Button from "../../components/ui/Button";
import { stockItemService, StockItem } from "../../services/assetSubModules.service";

type StockItemDetail = StockItem & {
  description?: string | null;
  group_name?: string | null;
  sub_group_name?: string | null;
  available_quantity?: number | null;
  min_stock?: number | null;
  max_stock?: number | null;
  rate?: number | null;
};

const EditStockItem: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [item, setItem] = useState<StockItemDetail | null>(null);

  const [name, setName] = useState("");
  const [groupName, setGroupName] = useState("");
  const [subGroupName, setSubGroupName] = useState("");
  const [availableQty, setAvailableQty] = useState<number | "">("");
  const [minStock, setMinStock] = useState<number | "">("");
  const [maxStock, setMaxStock] = useState<number | "">("");
  const [rate, setRate] = useState<number | "">("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (id) fetchItemDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchItemDetails = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const response = await stockItemService.getStockItemById(id);
      const data: StockItemDetail = response.data;

      if (data) {
        setItem(data);
        setName(data.name ?? "");
        setGroupName((data.group_name ?? "") as string);
        setSubGroupName((data.sub_group_name ?? "") as string);
        setAvailableQty(data.available_quantity ?? "");
        setMinStock(data.min_stock ?? "");
        setMaxStock(data.max_stock ?? "");
        setRate(data.rate ?? "");
        setDescription((data.description ?? "") as string);
      }
    } catch (error) {
      console.error("Failed to fetch item:", error);
      toast.error("Failed to load stock item");
    } finally {
      setLoading(false);
    }
  };

  const toNumberOrNull = (v: number | "") => {
    if (v === "") return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Item name is required");

    setSaving(true);
    try {
      await stockItemService.updateStockItem(id!, {
        name: name.trim(),
        available_quantity: toNumberOrNull(availableQty),
        min_stock: toNumberOrNull(minStock),
        max_stock: toNumberOrNull(maxStock),
        rate: toNumberOrNull(rate),
        description: description?.trim() || "",
      });

      toast.success("Stock item updated successfully");
      navigate(`/asset/stock-items/${id}`);
    } catch (error) {
      console.error("Failed to update item:", error);
      toast.error("Failed to update stock item");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading stock item...</p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh]">
        <Package className="w-12 h-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Stock Item Not Found</h3>
        <Button onClick={() => navigate("/asset/stock-items")}>Back to List</Button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <PageTitle
        title="Edit Stock Item"
        breadcrumbs={[
          { label: "Asset", path: "/asset" },
          { label: "Stock Items", path: "/asset/stock-items" },
          { label: item.name || `Item #${id}`, path: `/asset/stock-items/${id}` },
          { label: "Edit" },
        ]}
      />

      <form onSubmit={handleSubmit} className="space-y-6 max-w-full">
        <FormSection title="Item Details" icon={Package}>
          <FormGrid columns={2}>
            <FormInput
              label="Item Name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Enter item name"
            />

            <FormInput label="Group" name="group_name" value={groupName} onChange={() => {}} placeholder="-" readOnly />
            <FormInput label="Sub Group" name="sub_group_name" value={subGroupName} onChange={() => {}} placeholder="-" readOnly />
          </FormGrid>
        </FormSection>

        <FormSection title="Stock Information" icon={Package}>
          <FormGrid columns={2}>
            <FormInput
              label="Available Quantity"
              name="available_quantity"
              type="number"
              value={availableQty}
              onChange={(e) => setAvailableQty(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="0"
            />

            <FormInput
              label="Rate (₹)"
              name="rate"
              type="number"
              value={rate}
              onChange={(e) => setRate(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="0.00"
            />

            <FormInput
              label="Minimum Stock"
              name="min_stock"
              type="number"
              value={minStock}
              onChange={(e) => setMinStock(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="0"
            />

            <FormInput
              label="Maximum Stock"
              name="max_stock"
              type="number"
              value={maxStock}
              onChange={(e) => setMaxStock(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="0"
            />

            <FormInput
              label="Description"
              name="description"
              type="textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter description"
              rows={3}
              className="md:col-span-2"
            />
          </FormGrid>
        </FormSection>

        <div className="flex items-center gap-3 pt-4">
          <Button type="submit" disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            {saving ? "Saving..." : "Save Changes"}
          </Button>

          <Button type="button" variant="outline" onClick={() => navigate(`/asset/stock-items/${id}`)}>
            <X className="w-4 h-4 mr-2" /> Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditStockItem;
