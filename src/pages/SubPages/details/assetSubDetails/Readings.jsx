import React, { useEffect, useState } from "react";
import { BiEdit } from "react-icons/bi";
import { BsEye } from "react-icons/bs";
import { Link, useParams } from "react-router-dom";
import { getAssetReadingDetails } from "../../../../api";
import Table from "../../../../components/table/Table";
import toast from "react-hot-toast";
import { Gauge } from "lucide-react";

const Readings = () => {
  const [readings, setReadings] = useState([]);
  const { id } = useParams();

  useEffect(() => {
    const fetchReading = async () => {
      toast.loading("Please wait");
      try {
        const readingResp = await getAssetReadingDetails(id);
        toast.dismiss();
        toast.success("Reading fetched successfully");
        console.log(readingResp.data);
        setReadings(readingResp.data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchReading();
  }, []);

  const dateFormat = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const TimeFormat = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const column = [
    {
      name: "Date",
      selector: (row) => dateFormat(row.created_at),
      sortable: true,
    },
    {
      name: "Time",
      selector: (row) => TimeFormat(row.created_at),
      sortable: true,
    },
    {
      name: "Parameter",
      selector: (row) => row.asset_param_name,
      sortable: true,
    },
    {
      name: "Opening",
      selector: (row) => row.opening,
      sortable: true,
    },
    {
      name: "Closing",
      selector: (row) => row.value,
      sortable: true,
    },
    {
      name: "Consumption",
      selector: (row) => row.consumption,
      sortable: true,
    },
    {
      name: "Submitted by",
      selector: (row) => row.user_name,
      sortable: true,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="bg-primary/5 px-6 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <Gauge className="w-5 h-5 text-primary" />
            Asset Readings
          </h2>
        </div>
        <div className="p-6">
          <Table columns={column} data={readings} />
        </div>
      </div>
    </div>
  );
};

export default Readings;