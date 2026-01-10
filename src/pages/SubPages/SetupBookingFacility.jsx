import React, { useEffect, useMemo, useState } from "react";
import { BiEdit, BiExport } from "react-icons/bi";
import { BsEye } from "react-icons/bs";
import { IoAddCircleOutline } from "react-icons/io5";
import { Link } from "react-router-dom";
import { getFacitilitySetup, getHotelSetup, getTurfSetup } from "../../api";
import Button from "../../components/ui/Button";
import DataTable from "../../components/ui/DataTable";
import FormGrid from "../../components/ui/FormGrid";
import FormInput from "../../components/ui/FormInput";
import FormSection from "../../components/ui/FormSection";
import TabNavigation from "../../components/ui/TabNavigation";
import SetupSeatBooking from "./SetupSeatBooking";

const SetupBookingFacility = () => {
  const [activeTab, setActiveTab] = useState("facility");
  const [facilityData, setFacilityData] = useState([]);
  const [hotelData, setHotelData] = useState([]);
  const [turfData, setTurfData] = useState([]);
  const [facilitySearch, setFacilitySearch] = useState("");
  const [hotelSearch, setHotelSearch] = useState("");
  const [turfSearch, setTurfSearch] = useState("");
  const [loadingFacility, setLoadingFacility] = useState(true);
  const [loadingHotel, setLoadingHotel] = useState(true);
  const [loadingTurf, setLoadingTurf] = useState(true);
  const [errorFacility, setErrorFacility] = useState("");
  const [errorHotel, setErrorHotel] = useState("");
  const [errorTurf, setErrorTurf] = useState("");
  const [pageNo] = useState(1);
  const [perPage] = useState(10);

  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        setLoadingFacility(true);
        const res = await getFacitilitySetup();
        const amenities = res.data.amenities || [];
        const filteredAmenities = amenities.filter(
          (facility) =>
            facility.is_hotel !== true && facility.type_of_facility !== "turf"
        );
        setFacilityData(filteredAmenities);
      } catch (error) {
        console.error(error);
        setErrorFacility("Failed to fetch booking facilities. Please try again.");
      } finally {
        setLoadingFacility(false);
      }
    };

    fetchFacilities();
  }, []);

  useEffect(() => {
    const fetchHotelBooking = async () => {
      try {
        setLoadingHotel(true);
        const response = await getHotelSetup(true, pageNo, perPage);
        setHotelData(response.data.amenities || []);
      } catch (error) {
        console.error("Error fetching hotel bookings", error);
        setErrorHotel("Failed to fetch hotel bookings. Please try again.");
      } finally {
        setLoadingHotel(false);
      }
    };
    fetchHotelBooking();
  }, [pageNo, perPage]);

  useEffect(() => {
    const fetchTurfBooking = async () => {
      try {
        setLoadingTurf(true);
        const response = await getTurfSetup("turf", pageNo, perPage);
        setTurfData(response.data.amenities || []);
      } catch (error) {
        console.error("Error fetching turf bookings", error);
        setErrorTurf("Failed to fetch turf bookings. Please try again.");
      } finally {
        setLoadingTurf(false);
      }
    };
    fetchTurfBooking();
  }, [pageNo, perPage]);

  const bookByName = useMemo(() => {
    const userName = localStorage.getItem("Name")?.replace(/"/g, "");
    const lastName = localStorage.getItem("LASTNAME")?.replace(/"/g, "");
    return `${userName || "Unknown"} ${lastName || ""}`.trim();
  }, []);

  const formatOffset = (offset) => {
    const data = Array.isArray(offset) ? offset[1] : offset;
    if (!data) return "Not Available";
    const days = data.days ?? 0;
    const hours = data.hours ?? 0;
    const minutes = data.minutes ?? 0;
    return `${days} days, ${hours} hours, ${minutes} minutes`;
  };

  const formatDate = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    const yy = date.getFullYear().toString();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${dd}/${mm}/${yy}`;
  };

  const columns = useMemo(
    () => [
      {
        key: "action",
        header: "Action",
        render: (_val, row) => {
          if (activeTab === "hotel") {
            return (
              <div className="flex items-center gap-2">
                <Link to={`/setup/hotel-details/${row.id}`}>
                  <BsEye size={16} />
                </Link>
                <Link to={`/setup/hotel-details/edit/${row.id}`}>
                  <BiEdit size={16} />
                </Link>
              </div>
            );
          }
          if (activeTab === "turf") {
            return (
              <div className="flex items-center gap-2">
                <Link to={`/setup/turf-details/${row.id}`}>
                  <BsEye size={16} />
                </Link>
                <Link to={`/setup/turf-details/edit/${row.id}`}>
                  <BiEdit size={16} />
                </Link>
              </div>
            );
          }
          return (
            <div className="flex items-center gap-2">
              <Link to={`/setup/facility-details/${row.id}`}>
                <BsEye size={16} />
              </Link>
              <Link to={`/setup/facility-details/edit/${row.id}`}>
                <BiEdit size={16} />
              </Link>
            </div>
          );
        },
      },
      {
        key: "id",
        header: "ID",
        sortable: true,
        render: (val) => val ?? "-",
      },
      {
        key: "fac_name",
        header: "Name",
        sortable: true,
        render: (val) => val || "-",
      },
      {
        key: "fac_type",
        header: "Type",
        sortable: true,
        render: (val) => val || "-",
      },
      {
        key: "department",
        header: "Department",
        sortable: true,
        render: (val) => val || "-",
      },
      {
        key: "book_by",
        header: "Book By",
        sortable: true,
        render: () => bookByName,
      },
      {
        key: "book_before",
        header: "Book Before",
        sortable: true,
        render: (_val, row) => formatOffset(row.book_before),
      },
      {
        key: "advance_booking",
        header: "Advance Booking",
        sortable: true,
        render: (_val, row) => formatOffset(row.advance_booking),
      },
      {
        key: "created_at",
        header: "Created On",
        sortable: true,
        render: (val) => formatDate(val),
      },
    ],
    [activeTab, bookByName]
  );

  const facilityRows = useMemo(() => {
    if (!facilitySearch) return facilityData;
    return facilityData.filter((item) =>
      item.fac_name?.toLowerCase().includes(facilitySearch.toLowerCase())
    );
  }, [facilityData, facilitySearch]);

  const hotelRows = useMemo(() => {
    if (!hotelSearch) return hotelData;
    return hotelData.filter((item) =>
      item.fac_name?.toLowerCase().includes(hotelSearch.toLowerCase())
    );
  }, [hotelData, hotelSearch]);

  const turfRows = useMemo(() => {
    if (!turfSearch) return turfData;
    return turfData.filter((item) =>
      item.fac_name?.toLowerCase().includes(turfSearch.toLowerCase())
    );
  }, [turfData, turfSearch]);

  const renderTable = (loading, error, data) => {
    if (loading) {
      return (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <p className="text-muted-foreground">Loading bookings...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <p className="text-error">{error}</p>
        </div>
      );
    }

    return <DataTable columns={columns} data={data} />;
  };

  const tabs = [
    { id: "facility", label: "Workspace booking" },
    { id: "seatBooking", label: "Seat" },
    { id: "hotel", label: "Hotel" },
    { id: "turf", label: "Turf" },
  ];
  return (
    <section className="space-y-6">
      <FormSection title="Workspace Booking">
        <TabNavigation
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {activeTab === "facility" && (
          <div className="space-y-4">
            <FormGrid columns={2}>
              <FormInput
                label="Search"
                name="facilitySearch"
                placeholder="Search by name"
                value={facilitySearch}
                onChange={(e) => setFacilitySearch(e.target.value)}
              />
              <div className="flex items-end justify-end gap-2">
                <Link to="/setup/facility/setup-facility">
                  <Button leftIcon={<IoAddCircleOutline className="w-4 h-4" />}>
                    Add
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  leftIcon={<BiExport className="w-4 h-4" />}
                >
                  Export
                </Button>
              </div>
            </FormGrid>

            {renderTable(loadingFacility, errorFacility, facilityRows)}
          </div>
        )}

        {activeTab === "seatBooking" && (
          <div className="space-y-4">
            <SetupSeatBooking />
          </div>
        )}

        {activeTab === "hotel" && (
          <div className="space-y-4">
            <FormGrid columns={2}>
              <FormInput
                label="Search"
                name="hotelSearch"
                placeholder="Search by name"
                value={hotelSearch}
                onChange={(e) => setHotelSearch(e.target.value)}
              />
              <div className="flex items-end justify-end gap-2">
                <Link to="/setup/facility/create-hotelbooking">
                  <Button leftIcon={<IoAddCircleOutline className="w-4 h-4" />}>
                    Add
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  leftIcon={<BiExport className="w-4 h-4" />}
                >
                  Export
                </Button>
              </div>
            </FormGrid>

            {renderTable(loadingHotel, errorHotel, hotelRows)}
          </div>
        )}

        {activeTab === "turf" && (
          <div className="space-y-4">
            <FormGrid columns={2}>
              <FormInput
                label="Search"
                name="turfSearch"
                placeholder="Search by name"
                value={turfSearch}
                onChange={(e) => setTurfSearch(e.target.value)}
              />
              <div className="flex items-end justify-end gap-2">
                <Link to="/setup/facility/create-turfbooking">
                  <Button leftIcon={<IoAddCircleOutline className="w-4 h-4" />}>
                    Add
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  leftIcon={<BiExport className="w-4 h-4" />}
                >
                  Export
                </Button>
              </div>
            </FormGrid>

            {renderTable(loadingTurf, errorTurf, turfRows)}
          </div>
        )}
      </FormSection>
    </section>
  );
};

export default SetupBookingFacility;
