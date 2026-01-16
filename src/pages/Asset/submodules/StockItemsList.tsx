import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import DataCard from "../../../components/ui/DataCard";
import DataTable, { TableColumn } from "../../../components/ui/DataTable";
import { stockItemService, StockItem } from "../../../services/assetSubModules.service";
import { Loader2, Package, AlertCircle, RefreshCw, Eye, Edit } from "lucide-react";

interface StockItemsListProps {
  viewMode: "grid" | "table";
  searchValue: string;
  perPage?: number;
}

const StockItemsList: React.FC<StockItemsListProps> = ({
  viewMode,
  searchValue,
  perPage = 10,
}) => {
  const [items, setItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [pagination, setPagination] = useState({
    page: 1,
    perPage,
    total: 0,
    totalPages: 0,
  });

  // Update perPage when prop changes
  useEffect(() => {
    setPagination((prev) => ({ ...prev, perPage, page: 1 }));
  }, [perPage]);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await stockItemService.getStockItems(
        pagination.page,
        pagination.perPage
      );

      const data = response.data;

      // backend shape:
      // { current_page, total_pages, total_count, items: [...] }
      const itemList: StockItem[] = Array.isArray(data)
        ? data
        : (data?.items || data?.data || []) as StockItem[];

      setItems(itemList);

      const total = data?.total_count ?? data?.total ?? itemList.length;
      const totalPages =
        data?.total_pages ?? Math.ceil(total / pagination.perPage);

      setPagination((prev) => ({
        ...prev,
        total,
        totalPages,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch stock items");
      setItems([]);
      setPagination((prev) => ({ ...prev, total: 0, totalPages: 0 }));
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.perPage]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const filteredItems = useMemo(() => {
    const q = (searchValue || "").trim().toLowerCase();
    if (!q) return items;

    return items.filter((item: any) => {
      const name = (item?.name ?? "").toString().toLowerCase();
      const group = (item?.group_name ?? "").toString().toLowerCase();
      const subGroup = (item?.sub_group_name ?? "").toString().toLowerCase();
      const idStr = (item?.id ?? "").toString().toLowerCase();

      return (
        name.includes(q) ||
        group.includes(q) ||
        subGroup.includes(q) ||
        idStr.includes(q)
      );
    });
  }, [items, searchValue]);

  const formatDate = (val: any) => {
    if (!val) return "-";
    const d = new Date(val);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleString(); // shows date+time in user locale
  };

  const formatMoney = (v: any) => {
    if (v === null || v === undefined || v === "") return "-";
    return `₹${v}`;
  };

  const columns: TableColumn<StockItem>[] = [
    {
      key: "action",
      header: "Action",
      width: "100px",
      render: (_, row: any) => (
        <div className="flex items-center gap-3">
          <Link
            to={`/asset/stock-items/${row.id}`}
            className="text-primary hover:text-primary/80"
            title="View"
          >
            <Eye className="w-4 h-4" />
          </Link>
          <Link
            to={`/asset/stock-items/${row.id}/edit`}
            className="text-primary hover:text-primary/80"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </Link>
        </div>
      ),
    },
    { key: "id", header: "S.No", width: "80px", render: (_v, _r, idx) => idx + 1 },

    { key: "name", header: "Name", sortable: true, render: (v) => v || "-" },

    {
      key: "group_name",
      header: "Group",
      render: (_v, row: any) => row?.group_name || "-",
    },
    {
      key: "sub_group_name",
      header: "Sub Group",
      render: (_v, row: any) => row?.sub_group_name || "-",
    },

    {
      key: "available_quantity",
      header: "Available Qty",
      render: (_v, row: any) =>
        row?.available_quantity === null || row?.available_quantity === undefined
          ? "-"
          : row.available_quantity,
    },
    {
      key: "min_stock",
      header: "Min Stock",
      render: (_v, row: any) =>
        row?.min_stock === null || row?.min_stock === undefined ? "-" : row.min_stock,
    },
    {
      key: "max_stock",
      header: "Max Stock",
      render: (_v, row: any) =>
        row?.max_stock === null || row?.max_stock === undefined ? "-" : row.max_stock,
    },

    {
      key: "rate",
      header: "Rate",
      render: (_v, row: any) => formatMoney(row?.rate),
    },

    {
      key: "created_at",
      header: "Created On",
      render: (_v, row: any) => formatDate(row?.created_at),
    },
    {
      key: "updated_at",
      header: "Updated On",
      render: (_v, row: any) => formatDate(row?.updated_at),
    },
  ];

  if (loading && items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading stock items...</p>
      </div>
    );
  }

  if (error && items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="w-12 h-12 text-error mb-4" />
        <h3 className="text-lg font-semibold mb-2">Failed to Load Stock Items</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <button
          onClick={fetchItems}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg"
        >
          <RefreshCw className="w-4 h-4" /> Retry
        </button>
      </div>
    );
  }

  if (filteredItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-card rounded-xl border border-border">
        <Package className="w-16 h-16 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Stock Items Found</h3>
        <p className="text-muted-foreground mb-4">
          {searchValue ? `No items match "${searchValue}"` : "No stock items added yet"}
        </p>
        <Link
          to="/asset/stock-items/create"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium"
        >
          + Add Stock Item
        </Link>
      </div>
    );
  }

  return (
    <>
      {loading && (
        <div className="flex items-center gap-2 mb-4 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Refreshing...</span>
        </div>
      )}

      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredItems.map((item: any) => (
            <DataCard
              key={item.id}
              title={item.name || "-"}
              subtitle={`#${item.id}`}
              // no status (as you requested)
              fields={[
                { label: "Group", value: item.group_name || "-" },
                { label: "Sub Group", value: item.sub_group_name || "-" },
                {
                  label: "Available Qty",
                  value:
                    item.available_quantity === null || item.available_quantity === undefined
                      ? "-"
                      : String(item.available_quantity),
                },
                { label: "Rate", value: formatMoney(item.rate) },
              ]}
              viewPath={`/asset/stock-items/${item.id}`}
              editPath={`/asset/stock-items/${item.id}/edit`}
            />
          ))}
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredItems}
          viewPath={(row: any) => `/asset/stock-items/${row.id}`}
        />
      )}

      {filteredItems.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 p-4 bg-card border border-border rounded-lg">
          <div className="text-sm text-muted-foreground">
            Showing {((pagination.page - 1) * pagination.perPage) + 1} to{" "}
            {Math.min(pagination.page * pagination.perPage, pagination.total)} of{" "}
            {pagination.total} records
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setPagination((prev) => ({ ...prev, page: 1 }))}
              disabled={pagination.page === 1}
              className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent disabled:opacity-50"
            >
              «
            </button>

            <button
              onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
              className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent disabled:opacity-50"
            >
              ‹ Prev
            </button>

            <span className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md">
              {pagination.page}
            </span>

            <button
              onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page >= pagination.totalPages}
              className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent disabled:opacity-50"
            >
              Next ›
            </button>

            <button
              onClick={() => setPagination((prev) => ({ ...prev, page: prev.totalPages }))}
              disabled={pagination.page >= pagination.totalPages}
              className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent disabled:opacity-50"
            >
              »
            </button>
          </div>

          <select
            value={pagination.perPage}
            onChange={(e) =>
              setPagination((prev) => ({
                ...prev,
                perPage: Number(e.target.value),
                page: 1,
              }))
            }
            className="px-2 py-1.5 text-sm border border-border rounded-md bg-background"
          >
            <option value={10}>10 / page</option>
            <option value={12}>12 / page</option>
            <option value={25}>25 / page</option>
            <option value={50}>50 / page</option>
          </select>
        </div>
      )}
    </>
  );
};

export default StockItemsList;
