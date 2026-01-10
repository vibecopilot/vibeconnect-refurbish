import React, { useEffect, useState } from "react";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import ExportBookingModal from "../../containers/modals/ExportBookingsModal";
import SeatBooking from "../SubPages/SeatBooking";
import DataTable from "react-data-table-component";
import { IoAddCircleOutline } from "react-icons/io5";
import { Link } from "react-router-dom";
import FitOutList from "./FitOutList";
import {
  getAllFloors,
  getAllUnits,
  getAllVendors,
  getBuildings,
  getFitOutCategoriesSetup,
  getFitoutChecklist,
  getFitoutRequest,
  getFitOutStatus,
  getFitoutSubCategoriesSetup,
  getSetupUsers,
} from "../../api";
import { useSelector } from "react-redux";

const FitoutChecklistList = ({ embedded = false }) => {
  const [searchText, setSearchText] = useState("");
  const [modal, showModal] = useState(false);
  const [category, setCategory] = useState([]);
  const [subCat, setSubCat] = useState([]);
  const [units, setUnits] = useState([]);
  const [users, setUsers] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [page, setPage] = useState("meetingBooking");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [bookingFacility, setBookingFacility] = useState([]);
  const [originalBookings, setOriginalBookings] = useState([]);
  const themeColor = useSelector((state) => state.theme.color);

  const userName = useState("Name");
  const LastName = useState("LASTNAME");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const Response = await getFitoutChecklist();
        console.log("Fitout Response:", Response);
        setBookings(Response?.data || []);
        setOriginalBookings(Response?.data || []);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(`Failed to fetch data: ${error.message || error}`);
        setLoading(false);
      }
    };
    fetchData();
    fetchDetails();
  }, []);

  const handleSearch = (event) => {
    const searchValue = event.target.value.toLowerCase();
    setSearchText(searchValue);

    if (!searchValue) {
      setBookings(originalBookings);
      return;
    }

    const filteredResults = originalBookings.filter((item) => {
      const categoryName =
        category.find((c) => c.id === item.snag_audit_category_id)?.name || "";
      const subCatName =
        subCat.find((sub) => sub.id === item.snag_audit_sub_category_id)
          ?.name || "";
      const checklistName = item.name || "";
      const date = item.created_at
        ? new Date(item.created_at)
            .toISOString()
            .slice(2, 10)
            .replace(/-/g, "-")
        : "";

      return (
        checklistName.toLowerCase().includes(searchValue) ||
        categoryName.toLowerCase().includes(searchValue) ||
        subCatName.toLowerCase().includes(searchValue) ||
        date.includes(searchValue)
      );
    });

    setBookings(filteredResults);
  };

  const columns = [
    { name: "Sr. No.", selector: (row, index) => index + 1, sortable: true },
    {
      name: "Title",
      selector: (row) => {
        console.log(row);
        return row.name;
      },
      sortable: true,
    },
    {
      name: "Category",
      selector: (row) => {
        const categoryName = category.find(
          (c) => c.id === row.snag_audit_category_id
        );
        return categoryName ? categoryName.name : "NA";
      },
      sortable: true,
    },
    {
      name: "Sub Category",
      selector: (row) => {
        const subCatName = subCat.find(
          (sub) => sub.id === row.snag_audit_sub_category_id
        );
        return subCatName ? subCatName.name : "NA";
      },
      sortable: true,
    },
    {
      name: "Total Questions",
      selector: (row) => row.total_questions,
      sortable: true,
      cell: (row) => (
        <div style={{ textAlign: "center", width: "50%" }}>
          {row.total_questions}
        </div>
      ),
    },

    {
      name: "Date",
      selector: (row) => {
        if (!row?.created_at) return "NA";
        const date = new Date(row.created_at);
        const yy = String(date.getFullYear()).slice(2);
        const mm = String(date.getMonth() + 1).padStart(2, "0");
        const dd = String(date.getDate()).padStart(2, "0");
        return `${yy}-${mm}-${dd}`;
      },
      sortable: true,
    },
    {
      name: "Action",
      cell: (row) => (
        <div className="flex items-center gap-2"></div>
      ),
      sortable: false,
    },
  ];
  console.log("categ", category);
  const fetchDetails = async () => {
    try {
      const categories = await getFitOutCategoriesSetup();
      setCategory(categories.data);

      const subCategory = await getFitoutSubCategoriesSetup();
      setSubCat(subCategory.data);
    } catch (error) {
      console.error("Error fetching details:", error);
    }
  };

  const content = (
    <div className="w-full flex m-3 flex-col overflow-hidden">
      {page === "meetingBooking" && (
        <div>
          <div className="flex gap-2 items-center">
            <input
              type="text"
              placeholder="Search By Name"
              className="border p-2 w-full border-gray-300 rounded-lg"
              value={searchText}
              onChange={handleSearch}
            />
            <div className="flex justify-end">
              <Link
                to={"/fitout/checklist/create"}
                style={{ background: "rgb(3 19 37)" }}
                className="flex items-center gap-1 px-4 py-2 rounded-lg font-semibold text-white shadow-md transition hover:shadow-lg whitespace-nowrap"
              >
                <IoAddCircleOutline size={20} />
                Create Checklist
              </Link>
            </div>
          </div>
          <div className="flex min-h-screen">
            {loading ? (
              <p className="text-center">Loading bookings...</p>
            ) : error ? (
              <p className="text-center text-red-500">{error}</p>
            ) : (
              <div className="w-full">
                <DataTable columns={columns} data={bookings} pagination />
              </div>
            )}
          </div>
          {modal && <ExportBookingModal onclose={() => showModal(false)} />}
        </div>
      )}

      {page === "seatBooking" && (
        <div>
          <SeatBooking />
        </div>
      )}
    </div>
  );

  if (embedded) {
    return <div className="w-full">{content}</div>;
  }

  return (
    <section className="flex">
      <FitOutList />
      {content}
    </section>
  );
};

export default FitoutChecklistList;
