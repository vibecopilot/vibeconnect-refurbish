import React, { useEffect, useRef, useState } from "react";
import { BsEye } from "react-icons/bs";
import { Link } from "react-router-dom";
import { IoAddCircleOutline } from "react-icons/io5";
import { useSelector } from "react-redux";
import { HiChevronDown } from "react-icons/hi";
import { Loader2, Edit, QrCode, X } from "lucide-react";
import toast from "react-hot-toast";
import { QRCodeSVG } from "qrcode.react";
import Breadcrumb from "../../../components/ui/Breadcrumb";
import Table from "../../../components/table/Table";
import ListToolbar from "../../../components/ui/ListToolbar";
import DataCard from "../../../components/ui/DataCard";
import { getSurveys } from "../../../api";

function Survey() {
  const themeColor = useSelector((state) => state.theme.color);
  const [viewMode, setViewMode] = useState("table");
  const [isStatus, setIsStatus] = useState(false);
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const [showQrModal, setShowQrModal] = useState(false);
  const [selectedSurvey, setSelectedSurvey] = useState(null);

  const statusRef = useRef(null);

  // Status options state
  const [statusOptions, setStatusOptions] = useState({
    selectAll: false,
    active: false,
    draft: false,
    closed: false,
  });

  // Fetch surveys from API
  useEffect(() => {
    fetchSurveys();
  }, []);

  const fetchSurveys = async () => {
    setLoading(true);
    try {
      const response = await getSurveys();
      console.log('Survey API Response:', response.data); // Debug log

      // Handle different response formats
      const surveysData = Array.isArray(response.data) ? response.data :
                         Array.isArray(response.data.survey) ? response.data.survey :
                         Array.isArray(response.data.surveys) ? response.data.surveys : [];

      console.log('Parsed surveys data:', surveysData); // Debug log
      setSurveys(surveysData);
    } catch (error) {
      console.error("Error fetching surveys:", error);
      toast.error("Failed to load surveys");
    } finally {
      setLoading(false);
    }
  };

  // Handle "Select All" for Status dropdown
  const handleStatusChange = (key) => {
    if (key === "selectAll") {
      const newValue = !statusOptions.selectAll;
      setStatusOptions({
        selectAll: newValue,
        active: newValue,
        draft: newValue,
        closed: newValue,
      });
    } else {
      const updatedOptions = { ...statusOptions, [key]: !statusOptions[key] };
      updatedOptions.selectAll =
        updatedOptions.active &&
        updatedOptions.draft &&
        updatedOptions.closed;
      setStatusOptions(updatedOptions);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (statusRef.current && !statusRef.current.contains(event.target)) {
        setIsStatus(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter surveys based on search and status
  const filteredSurveys = surveys.filter(survey => {
    const matchesSearch = !searchValue ||
      (survey.survey_title || '').toLowerCase().includes(searchValue.toLowerCase());

    // Status filter
    const selectedStatuses = Object.keys(statusOptions).filter(
      key => key !== 'selectAll' && statusOptions[key]
    );
    const matchesStatus = selectedStatuses.length === 0 ||
      selectedStatuses.includes((survey.status || '').toLowerCase());

    return matchesSearch && matchesStatus;
  });

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Get status badge color
  const getStatusBadge = (status) => {
    const statusLower = (status || '').toLowerCase();
    if (statusLower === 'active') return 'in-store';
    if (statusLower === 'draft') return 'pending';
    if (statusLower === 'closed') return 'breakdown';
    return 'available';
  };

  // Handle QR code modal
  const handleShowQr = (survey) => {
    setSelectedSurvey(survey);
    setShowQrModal(true);
  };

  const handleCloseQr = () => {
    setShowQrModal(false);
    setSelectedSurvey(null);
  };

  // Generate survey response URL
  const getSurveyUrl = (surveyId) => {
    return `${window.location.origin}/survey/${surveyId}/respond`;
  };

  const columns = [
    {
      name: "Action",
      cell: (row) => (
        <div className="flex items-center gap-4">
          <Link to={`/admin/survey-details/${row.id}`}>
            <BsEye size={15} />
          </Link>
          <Link to={`/survey/${row.id}/edit`}>
            <Edit size={15} />
          </Link>
          <button
            onClick={() => handleShowQr(row)}
            className="text-primary hover:text-primary/80 transition-colors"
            title="View QR Code"
          >
            <QrCode size={15} />
          </button>
        </div>
      ),
      width: "150px",
    },
    {
      name: "Survey Name",
      selector: (row) => row.survey_title || '-',
      sortable: true,
    },
    {
      name: "No. of Questions",
      selector: (row) => (row.survey_questions || []).length,
      sortable: true,
      cell: (row) => (
        <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
          {(row.survey_questions || []).length}
        </span>
      ),
      width: "150px",
    },
    {
      name: "Start Date",
      selector: (row) => formatDate(row.start_date),
      sortable: true,
    },
    {
      name: "End Date",
      selector: (row) => formatDate(row.end_date),
      sortable: true,
    },
    {
      name: "Description",
      selector: (row) => row.description || '-',
      sortable: true,
    },
    {
      name: "Status",
      selector: (row) => row.status || '-',
      sortable: true,
      cell: (row) => (
        <span className={`px-2 py-1 text-xs rounded-full ${
          (row.status || '').toLowerCase() === 'active' ? 'bg-green-100 text-green-700' :
          (row.status || '').toLowerCase() === 'draft' ? 'bg-yellow-100 text-yellow-700' :
          (row.status || '').toLowerCase() === 'closed' ? 'bg-red-100 text-red-700' :
          'bg-gray-100 text-gray-700'
        }`}>
          {row.status || 'Unknown'}
        </span>
      ),
    },
  ];

  return (
    <div className="p-6">
      <Breadcrumb items={[{ label: 'FM Module' }, { label: 'Survey', path: '/survey' }, { label: 'Survey List' }]} />

      <div className="mt-6 bg-card border border-border rounded-lg shadow-sm">
        <ListToolbar
          searchPlaceholder="Search By Survey Name"
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          additionalButtons={
            <div className="flex flex-wrap gap-2">
              <div className="relative inline-block" ref={statusRef}>
                <button
                  onClick={() => setIsStatus(!isStatus)}
                  className="flex items-center px-3 py-2 border border-border rounded-md bg-background text-foreground hover:bg-accent transition-colors"
                >
                  Status <HiChevronDown className="w-4 h-4 ml-2" />
                </button>
                {isStatus && (
                  <div className="absolute left-0 mt-1 w-52 bg-card shadow-lg rounded-md border border-border z-10">
                    {Object.keys(statusOptions).map((key) => (
                      <label
                        key={key}
                        className="flex items-center gap-2 px-3 py-2 hover:bg-accent cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          className="w-4 h-4"
                          checked={statusOptions[key]}
                          onChange={() => handleStatusChange(key)}
                        />
                        {key === "selectAll"
                          ? "Select all"
                          : key.charAt(0).toUpperCase() + key.slice(1)}
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <Link
                to={`/admin/add-survey`}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md flex gap-2 items-center justify-center hover:bg-primary/90 transition-colors"
              >
                <IoAddCircleOutline />
                Add
              </Link>
            </div>
          }
        />

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading surveys...</p>
          </div>
        ) : filteredSurveys.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-muted-foreground text-lg mb-2">
              {searchValue ? `No surveys match "${searchValue}"` : 'No surveys found'}
            </p>
            <p className="text-muted-foreground text-sm">
              Create your first survey to get started
            </p>
          </div>
        ) : (
          <div className="p-4">
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSurveys.map((item) => (
                  <DataCard
                    key={item.id}
                    title={item.survey_title || `Survey #${item.id}`}
                    subtitle={`Status: ${item.status || 'Unknown'}`}
                    status={getStatusBadge(item.status)}
                    fields={[
                      { label: "Questions", value: `${(item.survey_questions || []).length} questions` },
                      { label: "Start Date", value: formatDate(item.start_date) },
                      { label: "End Date", value: formatDate(item.end_date) },
                      { label: "Description", value: item.description || '-' },
                    ]}
                    viewPath={`/admin/survey-details/${item.id}`}
                  />
                ))}
              </div>
            ) : (
              <Table columns={columns} data={filteredSurveys} selectableRow={true} />
            )}
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      {showQrModal && selectedSurvey && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={handleCloseQr}
        >
          <div
            className="bg-card border border-border rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">
                Survey QR Code
              </h3>
              <button
                onClick={handleCloseQr}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm font-medium text-foreground mb-1">
                  {selectedSurvey.survey_title}
                </p>
                <p className="text-xs text-muted-foreground mb-4">
                  Scan to fill survey
                </p>
              </div>

              <div className="flex justify-center p-6 bg-white rounded-lg">
                <QRCodeSVG
                  value={getSurveyUrl(selectedSurvey.id)}
                  size={200}
                  level="H"
                  includeMargin={true}
                />
              </div>

              <div className="text-center">
                <p className="text-xs text-muted-foreground break-all px-2">
                  {getSurveyUrl(selectedSurvey.id)}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(getSurveyUrl(selectedSurvey.id));
                    toast.success('Survey URL copied to clipboard!');
                  }}
                  className="flex-1 px-4 py-2 border border-border rounded-lg text-foreground hover:bg-accent transition-colors"
                >
                  Copy Link
                </button>
                <button
                  onClick={handleCloseQr}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Survey;