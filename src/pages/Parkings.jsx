import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Breadcrumb from "../components/ui/Breadcrumb";
import ListToolbar from "../components/ui/ListToolbar";
import DataCard from "../components/ui/DataCard";
import DataTable from "../components/ui/DataTable";
import { Car as CarIcon, Loader2, Eye, AlertCircle, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import { getBookParking } from "../api";
import { formatTime } from "../utils/dateUtils";



const Parkings = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState("table");
  const [bookingdata, setBookingData] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    perPage: 10,
    total: 0,
    totalPages: 0,
  });

  // Stats for allotment and vacancy (kept separate)
  const [stats, setStats] = useState({
    total_allotted_slots: 0,
    total_vacant_slots: 0,
  });

  // New state to count vehicle types
  const [vehicleCounts, setVehicleCounts] = useState({
    total_2_wheeler: 0,
    total_4_wheeler: 0,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getBookParking(pagination.page, pagination.perPage, searchValue);

      // Check if response has data
      if (!res || !res.data) {
        setBookingData([]);
        setFilteredData([]);
        setPagination((prev) => ({ ...prev, total: 0, totalPages: 0 }));
        return;
      }

      // The API returns: { booking_parkings: [...], total_count, current_page, total_pages }
      const apiData = Array.isArray(res.data.booking_parkings) ? res.data.booking_parkings : [];

      // Set pagination info
      setPagination((prev) => ({
        ...prev,
        total: res.data.total_count || 0,
        totalPages: res.data.total_pages || 1,
      }));

      const bookingReqData = apiData.map((item, index) => ({
        unique_id: `${item.id || 'no-id'}-${item.parking_id || 'no-parking'}-${item.user_id || 'no-user'}-${item.booking_date || 'no-date'}-${index}`, // Create truly unique ID
        id: item.id || null,
        parking_id: item.parking_id || item.id || null,
        name: item.user_name || 'N/A',
        status: item.status !== undefined ? item.status : '',
        booked_by: item.created_by || item.booked_by || 'N/A',
        booking_date: item.booking_date || new Date(item.created_at).toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
        parking_name: item.parking_name || 'N/A',
        vehicle_type: item.vehicle_type || 'N/A',
        slot_id: item.slot_id || 'N/A',
        created_at: item.created_at || new Date().toISOString(),
        total_allotted_slots: item.total_allotted_slots || 0,
        total_vacant_slots: item.total_vacant_slots || 0,
      }));

      setBookingData(bookingReqData);
      setFilteredData(bookingReqData);

      if (bookingReqData.length > 0) {
        // Assume all records have same allotment/vacancy values;
        // take from first record.
        setStats({
          total_allotted_slots: bookingReqData[0].total_allotted_slots || 0,
          total_vacant_slots: bookingReqData[0].total_vacant_slots || 0,
        });

        // Compute vehicle counts by iterating over bookingReqData
        let count2 = 0;
        let count4 = 0;
        bookingReqData.forEach((item) => {
          if (
            item.vehicle_type &&
            typeof item.vehicle_type === 'string' &&
            (item.vehicle_type.toLowerCase().includes("2-wheeler") || item.vehicle_type.toLowerCase().includes("2 wheeler"))
          ) {
            count2++;
          } else if (
            item.vehicle_type &&
            typeof item.vehicle_type === 'string' &&
            (item.vehicle_type.toLowerCase().includes("4-wheeler") || item.vehicle_type.toLowerCase().includes("car") || item.vehicle_type.toLowerCase().includes("4 wheeler"))
          ) {
            count4++;
          }
        });
        setVehicleCounts({
          total_2_wheeler: count2,
          total_4_wheeler: count4,
        });
      }
    } catch (error) {
      console.error("Error fetching booking request data:", error);
      setError(error.message || 'Failed to fetch data');
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when pagination changes
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, pagination.perPage]);

  // Handle search with debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      setPagination((prev) => ({ ...prev, page: 1 }));
      fetchData();
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue]);

const columns = [
  {
    key: "view",
    header: "View",
    render: (value, row) => (
      <Link to={`/parking/${row.parking_id || row.id}`} className="text-primary hover:text-primary/80">
        <Eye className="w-4 h-4" />
      </Link>
    ),
  },
  { 
    key: "name", 
    header: "Booked For"
  },
  {
    key: "status",
    header: "Status",
    render: (value, row) => row.status ? "Booked" : "Not Booked",
  },
  { 
    key: "parking_name", 
    header: "Parking Number"
  },
  { 
    key: "vehicle_type", 
    header: "Parking Type"
  },
  { 
    key: "slot_id", 
    header: "Parking Slot"
  },
  { 
    key: "booking_date", 
    header: "Booking Date"
  },
  { 
    key: "created_at", 
    header: "Created Time", 
    render: (value, row) => formatTime(row.created_at)
  },
];



  if (loading && filteredData.length === 0) {
    return (
      <div className="p-6">
        <Breadcrumb items={[{ label: 'FM Module' }, { label: 'Parking', path: '/parking' }, { label: 'Parking List' }]} />
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading parking data...</p>
        </div>
      </div>
    );
  }

  if (error && filteredData.length === 0) {
    return (
      <div className="p-6">
        <Breadcrumb items={[{ label: 'FM Module' }, { label: 'Parking', path: '/parking' }, { label: 'Parking List' }]} />
        <div className="flex flex-col items-center justify-center py-20">
          <AlertCircle className="w-12 h-12 text-error mb-4" />
          <h3 className="text-lg font-semibold mb-2">Failed to Load Parking Data</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg"
          >
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Breadcrumb items={[{ label: 'FM Module' }, { label: 'Parking', path: '/parking' }, { label: 'Parking List' }]} />
      
      {/* Dashboard Statistics - Matching Service Desk style */}
      {bookingdata.length > 0 && (
        <div className="mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg border-2 flex flex-col items-center justify-center bg-card text-blue-500 border-blue-500">
              <CarIcon className="w-8 h-8 mb-2" />
              <span className="text-sm font-medium">Total Allotted Slots</span>
              <span className="text-2xl font-bold mt-1 text-foreground">
                {stats.total_allotted_slots}
              </span>
            </div>
            <div className="p-4 rounded-lg border-2 flex flex-col items-center justify-center bg-card text-green-600 border-green-500">
              <CarIcon className="w-8 h-8 mb-2" />
              <span className="text-sm font-medium">Four Wheelers</span>
              <span className="text-2xl font-bold mt-1 text-foreground">
                {vehicleCounts.total_4_wheeler}
              </span>
            </div>
            <div className="p-4 rounded-lg border-2 flex flex-col items-center justify-center bg-card text-red-600 border-red-500">
              <CarIcon className="w-8 h-8 mb-2" />
              <span className="text-sm font-medium">Two Wheelers</span>
              <span className="text-2xl font-bold mt-1 text-foreground">
                {vehicleCounts.total_2_wheeler}
              </span>
            </div>
            <div className="p-4 rounded-lg border-2 flex flex-col items-center justify-center bg-card text-orange-600 border-orange-500">
              <CarIcon className="w-8 h-8 mb-2" />
              <span className="text-sm font-medium">Vacant Slots</span>
              <span className="text-2xl font-bold mt-1 text-foreground">
                {stats.total_vacant_slots}
              </span>
            </div>
          </div>
        </div>
      )}
      
      {/* Empty State */}
      {!loading && filteredData.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 bg-card rounded-xl border border-border">
          <CarIcon className="w-16 h-16 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Parking Records Found</h3>
          <p className="text-muted-foreground mb-4">
            {searchValue ? "No parking records match your search criteria" : "No parking records have been created yet"}
          </p>
          <button
            onClick={() => navigate("/admin/book-parking")}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium"
          >
            + Book Parking
          </button>
        </div>
      )}
      
      {/* List Toolbar - Matching Service Desk style */}
      <ListToolbar
        searchPlaceholder="Search by parking number, booked name"
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onAdd={() => navigate("/admin/book-parking")}
        addLabel="Book Parking"
      />
      
      {viewMode === "grid" && filteredData.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {filteredData.map((item) => (
            <DataCard
              key={item.unique_id}
              title={item.parking_name}
              subtitle={`Slot: ${item.slot_id}`}
              status={item.status ? "checked-out" : "in-store"}
              fields={[                
                { label: "Booked For", value: item.name },
                { label: "Vehicle Type", value: item.vehicle_type },
                { label: "Status", value: item.status ? "Booked" : "Available" },
                { label: "Date", value: item.booking_date },
              ]}
              viewPath={`/parking/${item.parking_id || item.id}`}
            />
          ))}
        </div>
      ) : (
        filteredData.length > 0 && (
          <div className="mt-6 bg-card border border-border rounded-lg overflow-hidden">
            <DataTable
              columns={columns}
              data={filteredData}
              loading={loading}
              getRowId={(row) => row.unique_id}
            />
          </div>
        )
      )}

      {/* Pagination Controls */}
      {filteredData.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 p-4 bg-card border border-border rounded-lg">
          <div className="text-sm text-muted-foreground">
            Showing {(pagination.page - 1) * pagination.perPage + 1} to{" "}
            {Math.min(pagination.page * pagination.perPage, pagination.total)}{" "}
            of {pagination.total} records
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
              onClick={() =>
                setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
              }
              disabled={pagination.page === 1}
              className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent disabled:opacity-50"
            >
              ‹ Prev
            </button>
            <span className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md">
              {pagination.page}
            </span>
            <button
              onClick={() =>
                setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
              }
              disabled={pagination.page >= pagination.totalPages}
              className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent disabled:opacity-50"
            >
              Next ›
            </button>
            <button
              onClick={() =>
                setPagination((prev) => ({ ...prev, page: prev.totalPages }))
              }
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
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>
      )}
    </div>
  );
};



export default Parkings;
