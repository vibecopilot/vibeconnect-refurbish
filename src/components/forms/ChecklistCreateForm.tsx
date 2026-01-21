import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Settings, ClipboardList, Calendar, Plus, X, Clock } from "lucide-react";
import Select from "react-select";
import Cron from "react-js-cron";
import "react-js-cron/dist/styles.css";

import FormSection from "../ui/FormSection";
import FormInput from "../ui/FormInput";
import FormGrid from "../ui/FormGrid";
import FormToggle from "../ui/FormToggle";
import Button from "../ui/Button";

import { getItemInLocalStorage } from "../../utils/localStorage";
import {
  getAssignedTo,
  getChecklistDetails,
  getChecklistGroupReading,
  getHostList,
  getMasterChecklist,
  getVendors,
  postChecklist,
  editChecklist,
} from "../../api";

// ƒo. same behavior, but safe number conversions
const toNum = (v: any) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

type ChecklistType = "routine" | "ppm";

interface ChecklistCreateFormProps {
  checklistType?: ChecklistType;
  isEditMode?: boolean;
  existingData?: any;
  checklistId?: string;
  prefillData?: any;
  prefillMode?: "copy" | null;
  ctypeOverride?: string;
}

const AddChecklist: React.FC<ChecklistCreateFormProps> = ({
  checklistType = "routine",
  isEditMode = false,
  existingData,
  checklistId,
  prefillData,
  prefillMode = null,
  ctypeOverride,
}) => {
  const navigate = useNavigate();

  const siteId = getItemInLocalStorage("SITEID");
  const userId = getItemInLocalStorage("UserId");
  const categories = getItemInLocalStorage("categories") || [];

  const todayObj = new Date();
  const formattedDate = todayObj.toISOString().split("T")[0];

  // ---- existing states (same)
  const [assignedUser, setAssignedUser] = useState<any[]>([]);
  const [optionssupervisior, setOptionssupervisior] = useState<any[]>([]);
  const [selectedOptionssupervisior, setSelectedOptionssupervisior] = useState<
    any[]
  >([]);

  const [site, setSites] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [masters, setMasters] = useState<any[]>([]);

  const [catid, setcatid] = useState("");
  const [assignid, setassignid] = useState("");
  const [supplierid, setsupplierid] = useState("");
  const [masterid, setmasterid] = useState("");

  const [name, setName] = useState("");
  const [frequency, setFrequency] = useState("");
  const [startDate, setStartDate] = useState(formattedDate);
  const [endDate, setEndDate] = useState(formattedDate);

  const [lockOverdueTask, setLockOverdueTask] = useState("");
  const [ticketType, setTicketType] = useState("Question");

  const [cronExpression, setCronExpression] = useState("0 0 * * *");
  const [cronPeriod, setCronPeriod] = useState<"daily" | "weekly" | "monthly" | "yearly">("daily");
  const [cronHour, setCronHour] = useState("0");
  const [cronMinute, setCronMinute] = useState("0");
  const [cronDayOfWeek, setCronDayOfWeek] = useState("1"); // Monday

  const [createNew, setCreateNew] = useState(false);
  const [createTicket, setCreateTicket] = useState(false);
  const [weightage, setWeightage] = useState(false);

  // schedule inputs (string state so clearing works in the UI)
  const [submitDays, setSubmitDays] = useState<string>("");
  const [submitHours, setSubmitHours] = useState<string>("");
  const [submitMinutes, setSubmitMinutes] = useState<string>("");
  const [extensionDays, setExtensionDays] = useState<string>("");
  const [extensionHours, setExtensionHours] = useState<string>("");
  const [extensionMinutes, setExtensionMinutes] = useState<string>("");

  const convertedSubmitMinutes =
    toNum(submitDays) * 1440 + toNum(submitHours) * 60 + toNum(submitMinutes);

  const convertedExtensionMinutes =
    toNum(extensionDays) * 1440 +
    toNum(extensionHours) * 60 +
    toNum(extensionMinutes);

  const [sections, setSections] = useState<any[]>([
    {
      group: "",
      questions: [
        {
          name: "",
          type: "",
          options: ["", "", "", ""],
          value_types: ["", "", "", ""],
          question_mandatory: false,
          mandatory: false,
          reading: false,
          help_text: "",
          showHelpText: false,
          image_for_question: [],
          weightage: "",
          rating: false,
        },
      ],
    },
  ]);

  // -------------------------------
  // Fetch dropdowns - same APIs
  // -------------------------------
  useEffect(() => {
    const fetchAssignedTo = async () => {
      try {
        const response = await getAssignedTo();
        setAssignedUser(response.data || []);
        const supervisors =
          (response.data || []).map((u: any) => ({
            value: u.id,
            label: `${u.firstname} ${u.lastname}`,
          })) || [];
        setOptionssupervisior(supervisors);
      } catch (error) {
        console.error("Error fetching assigned users:", error);
      }
    };
    fetchAssignedTo();
  }, []);

  useEffect(() => {
    const fetchSiteOwners = async () => {
      try {
        const resp = await getChecklistGroupReading();
        setSites(resp.data || []);
      } catch (error) {
        console.log("Error fetching site owners:", error);
      }
    };
    fetchSiteOwners();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        await getHostList(siteId);
      } catch (e) {
        // ignore
      }
    };
    if (siteId) fetchUsers();
  }, [siteId]);

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const supplierResp = await getVendors();
        setSuppliers(supplierResp.data || []);
      } catch (error) {
        console.error("Error fetching suppliers:", error);
        toast.error("Failed to load suppliers");
      }
    };
    fetchSuppliers();
  }, []);

  useEffect(() => {
    const fetchMasters = async () => {
      try {
        const masterResp = await getMasterChecklist();
        const mastershow =
          masterResp.data?.checklists?.map((check: any) => ({
            value: check.id,
            label: check.name,
          })) || [];
        setMasters(mastershow);
      } catch (error) {
        console.error("Error fetching masters:", error);
        toast.error("Failed to load templates");
      }
    };
    fetchMasters();
  }, []);

  // -------------------------------
  // Template load (Create New)
  // -------------------------------
  useEffect(() => {
    const fetchServicesChecklistDetails = async () => {
      if (!masterid || !createNew) return;
      try {
        const checklistDetailsResponse = await getChecklistDetails(masterid);
        const data = checklistDetailsResponse.data;

        setName(data.name || "");
        setFrequency(data.frequency || "");
        setStartDate(data.start_date || formattedDate);
        setEndDate(data.end_date || formattedDate);
        setWeightage(Boolean(data.weightage_enabled));

        setSections(
          (data.groups || []).map((group: any) => ({
            group: group.group_id,
            questions: (group.questions || []).map((q: any) => ({
              name: q.name,
              type: q.qtype,
              options: [q.option1, q.option2, q.option3, q.option4],
              value_types: [
                q.value_type1,
                q.value_type2,
                q.value_type3,
                q.value_type4,
              ],
              question_mandatory: q.question_mandatory,
              mandatory: q.question_mandatory,
              reading: q.reading,
              showHelpText: q.help_text_enbled,
              help_text: q.help_text,
              rating: q.rating,
              weightage: q.weightage,
              image_for_question: [],
            })),
          }))
        );
      } catch (e) {
        console.error(e);
        toast.error("Failed to load template checklist");
      }
    };
    fetchServicesChecklistDetails();
  }, [masterid, createNew, formattedDate]);

  // -------------------------------
  // Section/Question helpers (same)
  // -------------------------------
  const addSection = () => {
    setSections((prev) => [
      ...prev,
      {
        group: "",
        questions: [
          {
            name: "",
            type: "",
            options: ["", "", "", ""],
            value_types: ["", "", "", ""],
            question_mandatory: false,
            mandatory: false,
            reading: false,
            help_text: "",
            showHelpText: false,
            image_for_question: [],
            weightage: "",
            rating: false,
          },
        ],
      },
    ]);
  };

  const removeSection = (index: number) => {
    setSections((prev) => prev.filter((_: any, i: number) => i !== index));
  };

  const addQuestion = (sectionIndex: number) => {
    setSections((prev) => {
      const updated = [...prev];
      updated[sectionIndex] = { ...updated[sectionIndex] };
      updated[sectionIndex].questions = [...updated[sectionIndex].questions];
      updated[sectionIndex].questions.push({
        name: "",
        type: "",
        options: ["", "", "", ""],
        value_types: ["", "", "", ""],
        question_mandatory: false,
        mandatory: false,
        reading: false,
        help_text: "",
        showHelpText: false,
        image_for_question: [],
        weightage: "",
        rating: false,
      });
      return updated;
    });
  };

  const removeQuestion = (sectionIndex: number, questionIndex: number) => {
    setSections((prev) => {
      const updated = [...prev];
      const section = { ...updated[sectionIndex] };
      const questions = [...section.questions];
      const q = { ...questions[questionIndex] };

      if (q.id) {
        q._destroy = "1";
        questions[questionIndex] = q;
      } else {
        questions.splice(questionIndex, 1);
      }

      section.questions = questions;
      updated[sectionIndex] = section;
      return updated;
    });
  };

  const handleSectionChange = (
    index: number,
    field: string,
    value: any
  ) => {
    setSections((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleQuestionChange = (
    sectionIndex: number,
    questionIndex: number,
    field: string,
    value: any,
    optionIndex: number | null = null
  ) => {
    setSections((prev) => {
      const updated = [...prev];
      const section = { ...updated[sectionIndex] };
      const questions = [...section.questions];
      const q = { ...questions[questionIndex] };

      if (field === "name" || field === "type") {
        q[field] = value;
      } else if (field === "option") {
        const opts = [...q.options];
        opts[optionIndex as number] = value;
        q.options = opts;
      } else if (field === "value_type") {
        const vts = [...q.value_types];
        vts[optionIndex as number] = value;
        q.value_types = vts;
      } else if (field === "mandatory") {
        q.mandatory = value;
      } else if (field === "reading") {
        q.reading = value;
      } else if (field === "showHelpText") {
        q.showHelpText = value;
      } else if (field === "rating") {
        q.rating = value;
      } else if (field === "help_text") {
        q.help_text = value;
      } else if (field === "image_for_question") {
        q.image_for_question = Array.isArray(value) ? [...value] : [];
      } else if (field === "weightage") {
        q.weightage = value;
      }

      questions[questionIndex] = q;
      section.questions = questions;
      updated[sectionIndex] = section;
      return updated;
    });
  };

  // -------------------------------
  // Submit (same FormData keys)
  // -------------------------------
  const handleSubmit = async () => {
    if (!name || !frequency) {
      return toast.error("Name and Frequency are required");
    }
    if (startDate >= endDate) {
      return toast.error("Start date must be before End date");
    }

    try {
      const formData = new FormData();

      formData.append("checklist[site_id]", siteId);
      formData.append("checklist[weightage_enabled]", String(weightage));
      formData.append("checklist[occurs]", "");
      formData.append("checklist[name]", name);
      formData.append("checklist[start_date]", startDate);
      formData.append("checklist[end_date]", endDate);
      formData.append("checklist[user_id]", userId);
      formData.append("checklist[cron_expression]", cronExpression);
      formData.append("checklist[grace_period]", String(convertedSubmitMinutes));
      formData.append(
        "checklist[grace_period_unit]",
        String(convertedExtensionMinutes)
      );
      formData.append("checklist[supplier_id]", supplierid);
      formData.append(
        "checklist[lock_overdue]",
        String(lockOverdueTask === "true")
      );
      formData.append("checklist[ctype]", ctypeOverride || checklistType);
      formData.append("checklist[ticket_enabled]", String(createTicket));
      formData.append("checklist[ticket_level_type]", ticketType);
      formData.append("checklist[category_id]", catid);
      formData.append("assigned_to", assignid);

      selectedOptionssupervisior.forEach((opt: any) => {
        formData.append(`checklist[supervisior_id][]`, String(opt.value));
      });

      formData.append("frequency", frequency);

      sections.forEach((section: any) => {
        formData.append(`groups[][group]`, section.group);

        section.questions.forEach((q: any, questionIndex: number) => {
          if (q.id) {
            formData.append(`groups[][questions][][id]`, String(q.id));
          }
          formData.append(`groups[][questions][][name]`, q.name);
          formData.append(`groups[][questions][][type]`, q.type);
          formData.append(`groups[][questions][][reading]`, String(q.reading));
          formData.append(
            `groups[][questions][][question_mandatory]`,
            String(q.mandatory)
          );
          formData.append(
            `groups[][questions][][help_text_enbled]`,
            String(q.showHelpText)
          );
          formData.append(`groups[][questions][][help_text]`, q.help_text || "");
          formData.append(`groups[][questions][][weightage]`, String(q.weightage));
          formData.append(`groups[][questions][][rating]`, String(q.rating));

          q.options.forEach((option: any, optionIndex: number) => {
            formData.append(`groups[][questions][][options][]`, option || "");
            formData.append(
              `groups[][questions][][value_types][]`,
              q.value_types[optionIndex] || ""
            );
          });

          if (q._destroy) {
            formData.append(`groups[][questions][][_destroy]`, q._destroy);
          }

          if (q.image_for_question && q.image_for_question.length > 0) {
            q.image_for_question.forEach((file: File) => {
              formData.append(
                `groups[][questions][][image_for_question_${questionIndex + 1}][]`,
                file
              );
            });
          }
        });
      });

      let resp;
      if (isEditMode && checklistId) {
        resp = await editChecklist(formData, checklistId);
        toast.success("Checklist updated");
      } else {
        resp = await postChecklist(formData);
        toast.success("New Checklist Created");
      }
      console.log(resp);
      navigate("/asset/master-checklist");
    } catch (error) {
      console.error("Error:", error);
      toast.error(isEditMode ? "Failed to update checklist" : "Failed to create checklist");
    }
  };

  // -------------------------------
  // Options (UI)
  // -------------------------------
  const routineFrequencies = [
    { value: "hourly", label: "Hourly" },
    { value: "daily", label: "Daily" },
  ];

  const ppmFrequencies = [
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
    { value: "quarterly", label: "Quarterly" },
    { value: "half yearly", label: "Half Yearly" },
    { value: "yearly", label: "Yearly" },
  ];

  const frequencyOptions =
    checklistType === "ppm" ? ppmFrequencies : routineFrequencies;

  // Ensure frequency always valid for current type
  useEffect(() => {
    if (!frequencyOptions.find((opt) => opt.value === frequency)) {
      setFrequency(frequencyOptions[0]?.value || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checklistType]);

  const questionTypeOptions = [
    { value: "multiple", label: "Multiple Choice Question" },
    { value: "inbox", label: "Input box" },
    { value: "description", label: "Description box" },
    { value: "Numeric", label: "Numeric" },
  ];

  const siteOptions = (site || []).map((s: any) => ({
    value: String(s.id),
    label: s.name,
  }));
  const supplierOptions = (suppliers || []).map((s: any) => ({
    value: String(s.id),
    label: s.company_name,
  }));
  const categoryOptions = (categories || []).map((c: any) => ({
    value: String(c.id),
    label: c.name,
  }));
  const assignedOptions = (assignedUser || []).map((u: any) => ({
    value: String(u.id),
    label: `${u.firstname} ${u.lastname}`,
  }));

  const hours = Array.from({ length: 24 }, (_, i) => ({
    value: String(i),
    label: `${i.toString().padStart(2, "0")}:00`,
  }));
  const minutes = Array.from({ length: 60 }, (_, i) => ({
    value: String(i),
    label: i.toString().padStart(2, "0"),
  }));
  const daysOfWeek = [
    { value: "0", label: "Sunday" },
    { value: "1", label: "Monday" },
    { value: "2", label: "Tuesday" },
    { value: "3", label: "Wednesday" },
    { value: "4", label: "Thursday" },
    { value: "5", label: "Friday" },
    { value: "6", label: "Saturday" },
  ];

  const syncCronExpression = (
    period: "daily" | "weekly" | "monthly" | "yearly",
    hourVal: string,
    minuteVal: string,
    dowVal: string
  ) => {
    if (period === "yearly") {
      // Jan 1st
      setCronExpression(`${minuteVal} ${hourVal} 1 1 *`);
    } else if (period === "monthly") {
      setCronExpression(`${minuteVal} ${hourVal} 1 * *`);
    } else if (period === "weekly") {
      setCronExpression(`${minuteVal} ${hourVal} * * ${dowVal}`);
    } else {
      setCronExpression(`${minuteVal} ${hourVal} * * *`);
    }
  };

  useEffect(() => {
    syncCronExpression(cronPeriod, cronHour, cronMinute, cronDayOfWeek);
  }, [cronPeriod, cronHour, cronMinute, cronDayOfWeek]);

  // preload data when editing or copying
  useEffect(() => {
    const data = existingData || (prefillMode === "copy" ? prefillData : null);
    if (!data) return;

    setName(data.name || "");
    setFrequency(data.frequency || "");
    setStartDate(data.start_date || formattedDate);
    setEndDate(data.end_date || formattedDate);
    setsupplierid(data.supplier_id ? String(data.supplier_id) : "");
    setLockOverdueTask(
      data.lock_overdue === true || data.lock_overdue === "true" ? "true" : "false"
    );
    setTicketType(data.ticket_level_type || "Question");
    setCreateTicket(Boolean(data.ticket_enabled));
    setWeightage(Boolean(data.weightage_enabled));
    setassignid(data.assigned_to ? String(data.assigned_to) : "");
    setcatid(data.category_id ? String(data.category_id) : "");

    if (data.checklist_cron?.expression) {
      const expr = data.checklist_cron.expression;
      setCronExpression(expr);
      const parts = expr.split(" ");
      if (parts.length >= 5) {
        const [m, h, dom, mon, dow] = parts;
        setCronMinute(m);
        setCronHour(h);

        if (dom === "1" && mon === "1") {
          setCronPeriod("yearly");
        } else if (dom === "1" && mon === "*") {
          setCronPeriod("monthly");
        } else if (dow && dow !== "*" && dow !== "?") {
          setCronPeriod("weekly");
          setCronDayOfWeek(dow);
        } else {
          setCronPeriod("daily");
        }
      }
    }

    setSelectedOptionssupervisior(
      (data.supervisors || []).map((sup: any) => ({
        value: sup,
        label: String(sup),
      }))
    );

    setSections(
      (data.groups || []).map((group: any) => ({
        group: group.group_id,
        questions: (group.questions || []).map((q: any) => ({
          id: isEditMode ? q.id : undefined, // drop ids when copying
          name: q.name,
          type: q.qtype,
          options: [q.option1, q.option2, q.option3, q.option4],
          value_types: [q.value_type1, q.value_type2, q.value_type3, q.value_type4],
          question_mandatory: q.question_mandatory,
          mandatory: q.question_mandatory,
          reading: q.reading,
          showHelpText: q.help_text_enbled,
          help_text: q.help_text,
          rating: q.rating,
          weightage: q.weightage,
          image_for_question: [],
          _destroy: "0",
        })),
      }))
    );

    const totalMinutes = toNum(data.grace_period);
    const submitDaysLocal = Math.floor(totalMinutes / (24 * 60));
    const submitHoursLocal = Math.floor((totalMinutes % (24 * 60)) / 60);
    const submitMinutesLocal = totalMinutes % 60;
    setSubmitDays(String(submitDaysLocal));
    setSubmitHours(String(submitHoursLocal));
    setSubmitMinutes(String(submitMinutesLocal));

    const totalExtensionMinutes = toNum(data.grace_period_unit);
    const extDays = Math.floor(totalExtensionMinutes / (24 * 60));
    const extHours = Math.floor((totalExtensionMinutes % (24 * 60)) / 60);
    const extMinutes = totalExtensionMinutes % 60;
    setExtensionDays(String(extDays));
    setExtensionHours(String(extHours));
    setExtensionMinutes(String(extMinutes));
  }, [existingData, prefillData, prefillMode, formattedDate, isEditMode]);

  const handleCronChange = (val: string | undefined) => {
    if (!val) {
      // Reset to defaults when user presses Clear in the cron widget
      setCronPeriod("daily");
      setCronHour("0");
      setCronMinute("0");
      setCronDayOfWeek("1");
      setCronExpression("0 0 * * *");
      return;
    }
    setCronExpression(val);
  };

  return (
    <div className="space-y-6">
      {/* Source */}
      {!isEditMode ? (
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Source</h3>
              <p className="text-sm text-muted-foreground">
                Start from scratch or reuse an existing template
              </p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setCreateNew(false)}
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                  !createNew
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-foreground border-border hover:bg-accent"
                }`}
              >
                Start Fresh
              </button>
              <button
                type="button"
                onClick={() => setCreateNew(true)}
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                  createNew
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-foreground border-border hover:bg-accent"
                }`}
              >
                Use Template
              </button>
            </div>
          </div>
          {createNew && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">
                  Template
                </label>
                <Select
                  options={masters}
                  value={
                    masters.find((m: any) => String(m.value) === String(masterid)) ||
                    null
                  }
                  onChange={(selected: any) =>
                    setmasterid(selected?.value || "")
                  }
                  placeholder="Select from existing template"
                  className="react-select-container"
                  classNamePrefix="react-select"
                />
              </div>
              <div className="text-sm text-muted-foreground flex items-end">
                Selecting a template will load its groups and questions.
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">
            Editing existing checklist – source/template is locked.
          </p>
        </div>
      )}

      {/* Settings */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Settings className="w-4 h-4" /> Settings
        </h3>
        <div className="flex flex-wrap gap-4">
          <FormToggle
            label="Create Ticket"
            checked={createTicket}
            onChange={setCreateTicket}
          />
          <FormToggle
            label="Weightage"
            checked={weightage}
            onChange={setWeightage}
          />
          <FormToggle
            label="Lock Overdue"
            checked={lockOverdueTask === "true"}
            onChange={(v: any) => setLockOverdueTask(v ? "true" : "false")}
          />
        </div>

        {createTicket && (
          <div className="space-y-3">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">
                Create Ticket At
              </label>
              <div className="flex gap-4">
                {["Checklist", "Question"].map((type) => (
                  <label key={type} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="ticketType"
                      value={type}
                      checked={ticketType === type}
                      onChange={(e: any) => setTicketType(e.target.value)}
                      className="accent-primary"
                    />
                    <span>{type} Level</span>
                  </label>
                ))}
              </div>
            </div>
            <FormGrid columns={2}>
              <FormInput
                label="Select Assigned To"
                name="assigned_to_ticket"
                type="select"
                value={assignid}
                onChange={(e: any) => setassignid(e.target.value)}
                options={assignedOptions}
                placeholder="Select Assigned To"
              />
              <FormInput
                label="Select Category"
                name="category_ticket"
                type="select"
                value={catid}
                onChange={(e: any) => setcatid(e.target.value)}
                options={categoryOptions}
                placeholder="Select Category"
              />
            </FormGrid>
          </div>
        )}
      </div>

      {/* Details */}
      <FormSection title="Checklist Details" icon={ClipboardList}>
        <FormGrid columns={2}>
          <FormInput
            label="Checklist Name"
            name="name"
            value={name}
            onChange={(e: any) => setName(e.target.value)}
            required
            placeholder="Enter Checklist Name"
          />
          <FormInput
            label="Frequency"
            name="frequency"
            type="select"
            value={frequency}
            onChange={(e: any) => setFrequency(e.target.value)}
            options={frequencyOptions}
            required
            placeholder="Select Frequency"
          />
          <FormInput
            label="Start Date"
            name="start_date"
            type="date"
            value={startDate}
            onChange={(e: any) => setStartDate(e.target.value)}
            min={formattedDate}
          />
          <FormInput
            label="End Date"
            name="end_date"
            type="date"
            value={endDate}
            onChange={(e: any) => setEndDate(e.target.value)}
            min={formattedDate}
          />
        </FormGrid>

        <FormGrid columns={2} className="mt-4">
          <FormInput
            label="Categories"
            name="categories"
            type="select"
            value={catid}
            onChange={(e: any) => setcatid(e.target.value)}
            options={categoryOptions}
            placeholder="Select Category"
          />
          <FormInput
            label="Supplier"
            name="supplier"
            type="select"
            value={supplierid}
            onChange={(e: any) => setsupplierid(e.target.value)}
            options={supplierOptions}
            placeholder="Select Supplier"
          />
        </FormGrid>

        <FormGrid columns={2} className="mt-4">
          <FormInput
            label="Assign To"
            name="assign_to"
            type="select"
            value={assignid}
            onChange={(e: any) => setassignid(e.target.value)}
            options={assignedOptions}
            placeholder="Assign To"
          />
          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">
              Supervisors
            </label>
            <Select
              isMulti
              options={optionssupervisior}
              value={selectedOptionssupervisior}
              onChange={(selected: any) =>
                setSelectedOptionssupervisior(selected || [])
              }
              placeholder="Select Supervisors"
              className="react-select-container"
              classNamePrefix="react-select"
            />
          </div>
        </FormGrid>
      </FormSection>

      {/* Schedule */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Schedule</h3>
        <FormGrid columns={3}>
          <FormInput
            label="Submit Days"
            name="submit_days"
            type="number"
            value={submitDays}
            onChange={(e: any) => setSubmitDays(e.target.value)}
            placeholder="Days (0 if none)"
          />
          <FormInput
            label="Submit Hours"
            name="submit_hours"
            type="number"
            value={submitHours}
            onChange={(e: any) => setSubmitHours(e.target.value)}
            placeholder="Hours (0-23)"
          />
          <FormInput
            label="Submit Minutes"
            name="submit_minutes"
            type="number"
            value={submitMinutes}
            onChange={(e: any) => setSubmitMinutes(e.target.value)}
            placeholder="Minutes (0-59)"
          />
          <FormInput
            label="Extension Days"
            name="extension_days"
            type="number"
            value={extensionDays}
            onChange={(e: any) => setExtensionDays(e.target.value)}
            placeholder="Days (0 if none)"
          />
          <FormInput
            label="Extension Hours"
            name="extension_hours"
            type="number"
            value={extensionHours}
            onChange={(e: any) => setExtensionHours(e.target.value)}
            placeholder="Hours (0-23)"
          />
          <FormInput
            label="Extension Minutes"
            name="extension_minutes"
            type="number"
            value={extensionMinutes}
            onChange={(e: any) => setExtensionMinutes(e.target.value)}
            placeholder="Minutes (0-59)"
          />
        </FormGrid>
      </div>

      {/* Cron Setting */}
      <FormSection title="Cron Setting" icon={Clock}>
        <div className="border border-border rounded-2xl p-4 bg-muted/20 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <FormInput
              label="Every"
              name="cron_period"
              type="select"
              value={cronPeriod}
              onChange={(e: any) => setCronPeriod(e.target.value)}
              options={[
                { value: "daily", label: "Day" },
                { value: "weekly", label: "Week" },
                { value: "monthly", label: "Month (1st)" },
                { value: "yearly", label: "Year (Jan 1)" },
              ]}
              placeholder="Choose period"
            />
            <FormInput
              label="At Hour"
              name="cron_hour"
              type="select"
              value={cronHour}
              onChange={(e: any) => setCronHour(e.target.value)}
              options={hours}
              placeholder="Select hour"
            />
            <FormInput
              label="Minute"
              name="cron_minute"
              type="select"
              value={cronMinute}
              onChange={(e: any) => setCronMinute(e.target.value)}
              options={minutes}
              placeholder="Select minute"
            />
          </div>

          {cronPeriod === "weekly" && (
            <FormInput
              label="Day of Week"
              name="cron_dow"
              type="select"
              value={cronDayOfWeek}
              onChange={(e: any) => setCronDayOfWeek(e.target.value)}
              options={daysOfWeek}
              placeholder="Select day"
              className="max-w-xs"
            />
          )}

          <div className="text-sm text-muted-foreground">
            Cron Expression:{" "}
            <span className="font-mono text-foreground">{cronExpression}</span>
          </div>

          <div className="border border-dashed border-border rounded-lg p-3 bg-muted/30">
            <Cron value={cronExpression} setValue={handleCronChange} />
          </div>
        </div>
      </FormSection>

      {/* Questions / Groups */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <ClipboardList className="w-4 h-4" /> Groups & Questions
          </h3>
          <Button type="button" variant="outline" size="sm" onClick={addSection}>
            <Plus className="w-4 h-4 mr-2" /> Add Group
          </Button>
        </div>

        {sections.map((section: any, sectionIndex: number) => (
          <div
            key={sectionIndex}
            className="border border-border rounded-xl p-4 space-y-3 bg-muted/30"
          >
            <div className="flex items-center gap-3 justify-between">
              <FormInput
                label={`Group ${sectionIndex + 1}`}
                name={`group_${sectionIndex}`}
                type="select"
                value={section.group}
                onChange={(e: any) =>
                  handleSectionChange(sectionIndex, "group", e.target.value)
                }
                options={siteOptions}
                placeholder="Select Group"
                className="flex-1"
              />
              {sections.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeSection(sectionIndex)}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>

            <div className="space-y-3">
              {section.questions
                .filter((q: any) => q._destroy !== "1")
                .map((question: any, questionIndex: number) => (
                <div
                  key={questionIndex}
                  className="bg-background border border-border rounded-lg p-3 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Question {questionIndex + 1}
                    </span>
                    {section.questions.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          removeQuestion(sectionIndex, questionIndex)
                        }
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  <FormGrid columns={2}>
                    <FormInput
                      label="Question"
                      name={`question_${sectionIndex}_${questionIndex}`}
                      value={question.name}
                      onChange={(e: any) =>
                        handleQuestionChange(
                          sectionIndex,
                          questionIndex,
                          "name",
                          e.target.value
                        )
                      }
                      placeholder="Enter Question"
                    />

                    <FormInput
                      label="Type"
                      name={`type_${sectionIndex}_${questionIndex}`}
                      type="select"
                      value={question.reading ? "Numeric" : question.type}
                      onChange={(e: any) =>
                        handleQuestionChange(
                          sectionIndex,
                          questionIndex,
                          "type",
                          e.target.value
                        )
                      }
                      options={questionTypeOptions}
                      placeholder="Select Type"
                      disabled={question.reading}
                    />
                  </FormGrid>

                  {question.type === "multiple" && !question.reading && (
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">
                        Options
                      </label>
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        {[0, 1, 2, 3].map((optionIndex) => (
                          <div
                            key={optionIndex}
                            className="flex flex-col gap-2"
                          >
                            <FormInput
                              label=""
                              name={`option_${sectionIndex}_${questionIndex}_${optionIndex}`}
                              value={question.options[optionIndex]}
                              onChange={(e: any) =>
                                handleQuestionChange(
                                  sectionIndex,
                                  questionIndex,
                                  "option",
                                  e.target.value,
                                  optionIndex
                                )
                              }
                              placeholder={`Option ${optionIndex + 1}`}
                            />

                            <select
                              name={`value_type_${sectionIndex}_${questionIndex}_${optionIndex}`}
                              value={question.value_types[optionIndex]}
                              onChange={(e: any) =>
                                handleQuestionChange(
                                  sectionIndex,
                                  questionIndex,
                                  "value_type",
                                  e.target.value,
                                  optionIndex
                                )
                              }
                              className={`w-full px-3 py-2 border rounded-lg bg-background text-foreground border-border
                                ${
                                  question.value_types[optionIndex] === "P"
                                    ? "bg-green-100"
                                    : ""
                                }
                                ${
                                  question.value_types[optionIndex] === "N"
                                    ? "bg-red-100"
                                    : ""
                                }`}
                            >
                              <option value="">Select</option>
                              <option value="P">P</option>
                              <option value="N">N</option>
                            </select>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-4">
                    <FormToggle
                      label="Mandatory"
                      checked={Boolean(question.mandatory)}
                      onChange={(v: any) =>
                        handleQuestionChange(
                          sectionIndex,
                          questionIndex,
                          "mandatory",
                          v
                        )
                      }
                    />
                    <FormToggle
                      label="Reading"
                      checked={question.reading}
                      onChange={(v: any) =>
                        handleQuestionChange(
                          sectionIndex,
                          questionIndex,
                          "reading",
                          v
                        )
                      }
                    />
                    <FormToggle
                      label="Help Text"
                      checked={question.showHelpText}
                      onChange={(v: any) =>
                        handleQuestionChange(
                          sectionIndex,
                          questionIndex,
                          "showHelpText",
                          v
                        )
                      }
                    />

                    {weightage && (
                      <>
                        <FormToggle
                          label="Rating"
                          checked={question.rating}
                          onChange={(v: any) =>
                            handleQuestionChange(
                              sectionIndex,
                              questionIndex,
                              "rating",
                              v
                            )
                          }
                        />
                        <FormInput
                          label="Weightage"
                          name={`weightage_${sectionIndex}_${questionIndex}`}
                          type="number"
                          value={question.weightage}
                          onChange={(e: any) =>
                            handleQuestionChange(
                              sectionIndex,
                              questionIndex,
                              "weightage",
                              e.target.value
                            )
                          }
                          placeholder="Weightage"
                          className="w-28"
                        />
                      </>
                    )}
                  </div>

                  {question.showHelpText && (
                    <div className="space-y-3">
                      <FormInput
                        label="Help Text"
                        name={`help_text_${sectionIndex}_${questionIndex}`}
                        type="textarea"
                        value={question.help_text}
                        onChange={(e: any) =>
                          handleQuestionChange(
                            sectionIndex,
                            questionIndex,
                            "help_text",
                            e.target.value
                          )
                        }
                        placeholder="Enter help text"
                      />

                      <FormInput
                        label="Attachments"
                        name={`help_files_${sectionIndex}_${questionIndex}`}
                        type="file"
                        accept="image/*"
                        multiple
                        onFileChange={(files: FileList | null) =>
                          handleQuestionChange(
                            sectionIndex,
                            questionIndex,
                            "image_for_question",
                            files ? Array.from(files) : []
                          )
                        }
                      />
                    </div>
                  )}
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addQuestion(sectionIndex)}
              >
                <Plus className="w-4 h-4 mr-2" /> Add Question
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4">
        <Button variant="outline" onClick={() => navigate(-1)}>
          Cancel
        </Button>
        <Button onClick={handleSubmit}>Save</Button>
      </div>
    </div>
  );
};

export default AddChecklist;
