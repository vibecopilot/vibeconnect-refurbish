import React, { useEffect, useState } from "react";
import { domainPrefix, getAssetPPMs } from "../../../../api";
import { Link, useParams } from "react-router-dom";
import Table from "../../../../components/table/Table";
import { BsEye } from "react-icons/bs";
import { dateTimeFormat } from "../../../../utils/dateUtils";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { HiArrowLeft, HiArrowRight } from "react-icons/hi";
import toast from "react-hot-toast";

const PPM = () => {
  const { id } = useParams();
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [ppmDetails, setPPMDetails] = useState([]);
  const [ppmFor, setPPMFor] = useState("schedule");
  const [ppmData, setPPMData] = useState([]);
  const [filteredPPMData, setFilteredPPMData] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [searchText, setSearchText] = useState("");

  const fetchPPMData = async () => {
    toast.loading("Please wait");
    try {
      const ppmRes = await getAssetPPMs(id);
      toast.dismiss();
      toast.success("PPM Schedule fetched successfully");
      setFilteredPPMData(ppmRes.data.activities);
      setPPMData(ppmRes.data.activities);
      console.log(ppmRes.data.activities);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchPPMDetails = async () => {
    const PPMDetailsResp = await getAssetPPMs(id);
    const filteredData = PPMDetailsResp.data.activities.filter((activity) => {
      const activityDate = formatDate(activity.start_time);
      console.log("show date", activityDate);
      return (
        activityDate === selectedDate &&
        activity.status !== "pending" &&
        activity.status !== "overdue"
      );
    });

    console.log("logs data", filteredData);
    setPPMDetails(filteredData);
  };

  useEffect(() => {
    fetchPPMData();
    fetchPPMDetails();
  }, [id]);

  useEffect(() => {
    fetchPPMDetails();
  }, [selectedDate]);

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const handlePrevDate = () => {
    const prevDate = new Date(selectedDate);
    prevDate.setDate(prevDate.getDate() - 1);
    setSelectedDate(prevDate.toISOString().split("T")[0]);
  };

  const handleNextDate = () => {
    const nextDate = new Date(selectedDate);
    nextDate.setDate(nextDate.getDate() + 1);
    setSelectedDate(nextDate.toISOString().split("T")[0]);
  };

  const formatDate = (isoString) => {
    return isoString.split("T")[0];
  };

  const dateFormat = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const filterByDateRange = (data) => {
    if (startDate && endDate) {
      console.log(data);
      return data.filter((item) => {
        console.log(item.start_time);
        const itemDate = new Date(item.start_time).setHours(0, 0, 0, 0);
        const start = startDate.setHours(0, 0, 0, 0);
        const end = endDate.setHours(23, 59, 59, 999);
        return itemDate >= start && itemDate <= end;
      });
    }
    return data;
  };

  const PPMColumn = [
    {
      name: "View",
      cell: (row) => (
        <div className="flex items-center gap-4">
          <Link to={`/assets/routine-task-details/${id}/${row.id}`}>
            <BsEye size={15} />
          </Link>
        </div>
      ),
      maxWidth: "2rem",
    },
    {
      name: "Checklist",
      selector: (row) => row.checklist?.name,
      sortable: true,
    },
    {
      name: "Start Date",
      selector: (row) => dateFormat(row.start_time),
      sortable: true,
    },
    {
      name: "Status",
      selector: (row) => row.status,
      sortable: true,
    },
    {
      name: "Assigned To",
      selector: (row) => row.assigned_name,
      sortable: true,
    },
  ];

  const handleSearch = (e) => {
    const searchValue = e.target.value;
    setSearchText(searchValue);
    if (searchText.trim() === "") {
      setFilteredPPMData(ppmData);
    } else {
      const filteredResult = ppmData.filter((item) =>
        item.assigned_name.toLowerCase().includes(searchValue.toLowerCase())
      );
      setFilteredPPMData(filteredResult);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="flex gap-4 border-b border-border px-6">
          <button
            className={`py-4 px-4 font-medium transition-colors ${
              ppmFor === "schedule"
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setPPMFor("schedule")}
          >
            Schedule
          </button>
          <button
            className={`py-4 px-4 font-medium transition-colors ${
              ppmFor === "logs"
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setPPMFor("logs")}
          >
            Logs
          </button>
        </div>

        {ppmFor === "schedule" && (
          <div className="p-6">
            <div className="flex gap-2 justify-between md:flex-row flex-col mb-4">
              <input
                type="text"
                value={searchText}
                onChange={handleSearch}
                placeholder="Search by assigned to"
                className="p-2 border border-border rounded-md flex-1 outline-none bg-card text-foreground"
              />
              <DatePicker
                selectsRange={true}
                startDate={startDate}
                endDate={endDate}
                onChange={(update) => {
                  setStartDate(update[0]);
                  setEndDate(update[1]);
                  setFilteredPPMData(filterByDateRange(ppmData));
                }}
                isClearable={true}
                placeholderText="Search by Date range"
                className="p-2 border border-border rounded-md w-64 outline-none bg-card text-foreground"
              />
            </div>
            <Table columns={PPMColumn} data={filteredPPMData} />
          </div>
        )}

        {ppmFor === "logs" && (
          <div className="p-6">
            <div className="flex gap-4 justify-end mb-4">
              <button
                onClick={handlePrevDate}
                className="bg-muted px-3 rounded-md py-2 hover:bg-muted/80 transition-colors"
              >
                <HiArrowLeft />
              </button>
              <input
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                className="p-2 border border-border rounded-md w-64 outline-none bg-card text-foreground"
              />
              <button
                onClick={handleNextDate}
                className="bg-muted px-3 rounded-md py-2 hover:bg-muted/80 transition-colors"
              >
                <HiArrowRight />
              </button>
            </div>

            <div className="space-y-4">
              {ppmDetails.map((task, index) => {
                const hasSubmissions = task.activity_log?.submissions?.length > 0;

                return (
                  hasSubmissions && (
                    <div
                      key={task.id}
                      className="bg-muted border border-border p-4 rounded-lg space-y-3"
                    >
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Checklist Name</p>
                        <p className="text-foreground">{task.checklist?.name || "No Checklist Name"}</p>
                      </div>

                      {task.activity_log.submissions.map(
                        (submission, subIndex) =>
                          submission && (
                            <div key={submission.id} className="space-y-2">
                              <div className="bg-purple-100/50 dark:bg-purple-900/20 p-2 rounded-md">
                                <span className="text-sm font-medium text-foreground">Group Name: </span>
                                <span className="text-sm text-foreground">{submission.question?.group_name || "No Group"}</span>
                              </div>
                              <div className="bg-green-100/50 dark:bg-green-900/20 p-2 rounded-md">
                                <span className="text-sm font-medium text-foreground">Question: </span>
                                <span className="text-sm text-foreground">{submission.question?.name || "No Question"}</span>
                              </div>
                              <div className="bg-blue-100/50 dark:bg-blue-900/20 p-2 rounded-md">
                                <span className="text-sm font-medium text-foreground">Answer: </span>
                                <span className="text-sm text-foreground">{submission.value || "No Answer"}</span>
                              </div>

                              <div>
                                <span className="text-sm font-medium text-muted-foreground">Attachments:</span>
                                <div className="flex gap-4 flex-wrap mt-2">
                                  {submission.question_attachments?.length > 0 ? (
                                    submission.question_attachments.map((attachment, i) => (
                                      <img
                                        key={i}
                                        src={domainPrefix + attachment.document}
                                        alt={`Attachment ${i + 1}`}
                                        className="w-40 h-28 object-cover rounded-md cursor-pointer"
                                        onClick={() =>
                                          window.open(domainPrefix + attachment.document, "_blank")
                                        }
                                      />
                                    ))
                                  ) : (
                                    <p className="text-sm text-muted-foreground">No Attachments</p>
                                  )}
                                </div>
                              </div>

                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">
                                  Performed by: <span className="text-foreground font-medium">{task.assigned_name || "Unknown"}</span>
                                </span>
                                <span className="text-muted-foreground">
                                  {dateTimeFormat(submission.updated_at) || "No timestamp available"}
                                </span>
                              </div>
                            </div>
                          )
                      )}

                      <div className="pt-2 border-t border-border">
                        <span className="text-sm font-medium text-muted-foreground">Comment: </span>
                        <span className="text-sm text-primary">{task.comment ? task.comment : "No Comment"}</span>
                      </div>
                    </div>
                  )
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PPM;