import React, { useEffect, useState } from "react";
import { FaCheck, FaRegFileAlt } from "react-icons/fa";
import { IoDocumentAttach } from "react-icons/io5";
import { LuStamp } from "react-icons/lu";
import { MdClose, MdOutlinePendingActions } from "react-icons/md";
import { useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import ComplianceAudit from "./ComplianceAudit";
import { GrCertificate } from "react-icons/gr";
import Breadcrumb from "../../components/ui/Breadcrumb";
import {
  domainPrefix,
  getComplianceConfigurationDetails,
  getReviewerAssignments,
} from "../../api";
import {
  dateFormat,
  dateFormatSTD,
  dateTimeFormat,
} from "../../utils/dateUtils";
import { getItemInLocalStorage } from "../../utils/localStorage";

const ComplianceDetails = () => {
  const themeColor = useSelector((state) => state.theme.color);
  const [modal, setModal] = useState(false);
  const { id } = useParams();
  const userId = getItemInLocalStorage("UserId");
  const [details, setDetails] = useState({});
  const [assignments, setAssignments] = useState([]);
  useEffect(() => {
    const fetchComplianceDetails = async () => {
      try {
        const res = await getComplianceConfigurationDetails(id);
        setDetails(res?.data);
        setAssignments(res?.data?.compliance_trackers);
      } catch (error) {
        console.log(error);
      }
    };
    // const fetchReviewerAssignments = async () => {
    //   try {
    //     const res = await getReviewerAssignments(userId);
    //   } catch (error) {
    //     console.log(error);
    //   }
    // };
    // fetchReviewerAssignments();
    fetchComplianceDetails();
  }, []);
  console.log(assignments);
  const isImage = (filePath) => {
    const imageExtensions = ["jpg", "jpeg", "png", "gif", "bmp", "svg"];
    const extension = filePath.split(".").pop().split("?")[0].toLowerCase();
    return imageExtensions.includes(extension);
  };
  const getFileName = (filePath) => {
    return filePath.split("/").pop().split("?")[0];
  };
  const [complianceTrackerId, setComplianceTrackerId] = useState("");
  const [complianceTagId, setComplianceTagId] = useState("");
  const [complianceTagTaskId, setComplianceTagTaskId] = useState("");

  const handleComplianceAuditModal = (trackerId, TagId, TagTaskId) => {
    console.log("tracker: ", trackerId, "Tag :", TagId, "task:", TagTaskId);
    setModal(true);
    setComplianceTrackerId(trackerId);
    setComplianceTagId(TagId);
    setComplianceTagTaskId(TagTaskId);
  };

  return (
    <div className="p-6">
      <Breadcrumb items={[{ label: 'FM Module' }, { label: 'Compliance', path: '/compliance' }, { label: 'Compliance Details' }]} />
      
      <div className="mt-6 bg-card border border-border rounded-lg overflow-hidden">
        <div className="border-b border-border px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold text-foreground">{details.name}</h1>
              <p className="text-muted-foreground">{details.site_name}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-green-100 text-green-800">
                <span className="text-sm font-medium">100% Completed</span>
              </div>
              <button className="flex items-center gap-2 bg-violet-500 text-white px-4 py-2 rounded-md hover:bg-violet-600 transition-colors">
                <GrCertificate /> Generate Certificate
              </button>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4 text-foreground">Basic Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-muted-foreground mb-1">Auditor</span>
                <span className="text-foreground">{details?.reviewer_name || 'N/A'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-muted-foreground mb-1">Vendor</span>
                <span className="text-foreground">{details?.assign_to_name || 'N/A'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-muted-foreground mb-1">Frequency</span>
                <span className="text-foreground">{details?.frequency || 'N/A'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-muted-foreground mb-1">Start Date</span>
                <span className="text-foreground">{dateFormatSTD(details?.start_date) || 'N/A'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-muted-foreground mb-1">End Date</span>
                <span className="text-foreground">{dateFormatSTD(details?.end_date) || 'N/A'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-muted-foreground mb-1">Target Days</span>
                <span className="text-foreground">{details?.due_in_days} days</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-muted-foreground mb-1">Priority</span>
                <span className="text-foreground">{details?.priority || 'N/A'}</span>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4 text-foreground">Compliance for</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {details?.compliance_config_tags?.map((category, index) => (
                <div key={index} className="border border-border rounded-lg p-3 bg-muted">
                  <span className="text-sm font-medium text-muted-foreground">Category</span>
                  <p className="text-foreground mt-1">{category.compliance_tag_name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-card border border-border rounded-lg overflow-hidden">
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold text-foreground">Tasks</h2>
        </div>
        <div className="p-6 flex flex-col gap-4">
          {assignments?.map((assignment) =>
            assignment?.compliance_tracker_tags_by_category?.map((category) =>
              category?.compliance_tracker_tags?.map((tags) => (
                <div
                  className="border border-border rounded-lg p-4 bg-background"
                  key={category?.id || category?.name}
                >
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 border-b border-border pb-3">
                    <h3 className="font-semibold text-green-600">
                      {category?.name}
                    </h3>
                    <p className="text-foreground">
                      Weightage : {tags?.task?.weightage}%
                    </p>
                    <p className="text-foreground">
                      Mandatory : {tags?.task?.mandatory ? "Yes" : "No"}
                    </p>
                    <div className="flex items-center justify-end gap-3">
                      <span
                        className={`flex items-center gap-2 font-medium ${
                          assignment?.status === "pending"
                            ? "text-red-500"
                            : "text-green-600"
                        }`}
                      >
                        {assignment?.status === "pending" ? (
                          <MdOutlinePendingActions />
                        ) : (
                          <FaCheck />
                        )}
                        {assignment?.status &&
                          assignment?.status.charAt(0).toUpperCase() +
                            assignment?.status.slice(1)}
                      </span>
                      <button
                        className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2"
                        onClick={() =>
                          handleComplianceAuditModal(
                            tags.compliance_tracker_id,
                            tags.compliance_tag_id,
                            tags.compliance_tag_task_id
                          )
                        }
                      >
                        <LuStamp /> Verify
                      </button>
                    </div>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2 text-foreground">Answer</h4>
                    <p className="bg-violet-100 p-3 rounded-md text-foreground mb-4">
                      Remark: {tags?.comment || 'No remarks provided'}
                    </p>
                    <div className="flex flex-wrap gap-4 mb-4">
                      {tags?.attachments?.map((other, index) => (
                        <div key={other.id} className="flex flex-col items-center">
                          {isImage(domainPrefix + other.image_url) ? (
                            <img
                              src={domainPrefix + other.image_url}
                              alt={`Attachment ${index + 1}`}
                              className="w-40 h-28 object-cover rounded-md border border-border cursor-pointer"
                              onClick={() =>
                                window.open(
                                  domainPrefix + other.image_url,
                                  "_blank"
                                )
                              }
                            />
                          ) : (
                            <a
                              href={domainPrefix + other.image_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-primary transition-colors text-center flex flex-col items-center"
                            >
                              <IoDocumentAttach
                                size={40}
                                className="text-yellow-500"
                              />
                              <span className="text-sm mt-1">{getFileName(other.image_url)}</span>
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-2 border-t border-border">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-muted-foreground">Submitted by:</span>
                        <span className="text-foreground">{tags?.submitted_by_name || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-muted-foreground">Submitted on:</span>
                        <span className="text-foreground">{dateTimeFormat(tags?.submitted_on) || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )
          )}
        </div>
      </div>

      {modal && (
        <ComplianceAudit
          onClose={() => setModal(false)}
          tagId={complianceTagId}
          taskId={complianceTagTaskId}
          trackerId={complianceTrackerId}
        />
      )}
    </div>
  );
};

export default ComplianceDetails;
