import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "../../components/ui/Breadcrumb";
import FormSection from "../../components/ui/FormSection";
import FormInput from "../../components/ui/FormInput";
import FormGrid from "../../components/ui/FormGrid";
import FormToggle from "../../components/ui/FormToggle";

import Select from "react-select";
import toast from "react-hot-toast";

import Cron from "react-js-cron";
import "react-js-cron/dist/styles.css";

import FileInputBox from "../../containers/Inputs/FileInputBox";
import { getItemInLocalStorage } from "../../utils/localStorage";

import {
  postChecklist,
  getAssignedTo,
  getChecklistGroupReading,
  getVendors,
  getMasterChecklist,
  getChecklistDetails,
} from "../../api";

import { ClipboardList, Plus, X, Calendar, Save, Settings } from "lucide-react";

/** ---------------- types (match old structure) ---------------- */
type OptionPN = "" | "P" | "N";

interface Question {
  name: string;
  type: string; // multiple | inbox | description | Numeric
  options: string[]; // 4 options
  value_types: OptionPN[]; // 4 value types
  question_mandatory: boolean;
  reading: boolean;
  showHelpText: boolean;
  help_text: string;
  image_for_question: File[];
  weightage: string;
  rating: boolean;
}

interface Section {
  group: string; // group_id as string
  questions: Question[];
}

/** ---------------- constants (EXACT like old) ---------------- */
const frequencyOptions = [
  { value: "hourly", label: "Hourly" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "half yearly", label: "Half yearly" },
  { value: "yearly", label: "Yearly" },
];

const priorityOptions = [
  { value: "High", label: "High" },
  { value: "Medium", label: "Medium" },
  { value: "Low", label: "Low" },
];

const answerTypes = [
  { value: "multiple", label: "Multiple Choice Question" },
  { value: "inbox", label: "Input box" },
  { value: "description", label: "Description box" },
  { value: "Numeric", label: "Numeric" },
];

const toNum = (v: any) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const emptyQuestion = (): Question => ({
  name: "",
  type: "",
  options: ["", "", "", ""],
  value_types: ["", "", "", ""],
  question_mandatory: false,
  reading: false,
  showHelpText: false,
  help_text: "",
  image_for_question: [],
  weightage: "",
  rating: false,
});

const CreateChecklist: React.FC = () => {
  const navigate = useNavigate();

  const today = new Date().toISOString().split("T")[0];

  /** --------- toggles (EXACT like old) --------- */
  const [createNew, setCreateNew] = useState(false);
  const [createTicket, setCreateTicket] = useState(false);
  const [weightageEnabled, setWeightageEnabled] = useState(false);

  /** --------- template + ticket fields (EXACT like old) --------- */
  const categories = getItemInLocalStorage("categories") || [];
  const [masters, setMasters] = useState<{ value: string; label: string }[]>(
    []
  );
  const [masterid, setMasterid] = useState("");

  const [ticketType, setTicketType] = useState<"Checklist" | "Question">(
    "Question"
  );
  const [assignedToId, setAssignedToId] = useState("");
  const [categoryId, setCategoryId] = useState("");

  /** --------- checklist basics --------- */
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState("");
  const [frequency, setFrequency] = useState("");
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [priorityLevel, setPriorityLevel] = useState("");

  const [supplierId, setSupplierId] = useState("");

  /** --------- schedules (EXACT like old) --------- */
  const [submitDays, setSubmitDays] = useState("");
  const [submitHours, setSubmitHours] = useState("");
  const [submitMinutes, setSubmitMinutes] = useState("");

  const [extensionDays, setExtensionDays] = useState("");
  const [extensionHours, setExtensionHours] = useState("");
  const [extensionMinutes, setExtensionMinutes] = useState("");

  const [lockOverdue, setLockOverdue] = useState(""); // "true" | "false" | ""

  /** --------- CRON FIRST (EXACT like old) --------- */
  const [cronExpression, setCronExpression] = useState("0 0 * * *");

  /** --------- supervisors + dropdowns --------- */
  const [assignedUsers, setAssignedUsers] = useState<any[]>([]);
  const [supervisorOptions, setSupervisorOptions] = useState<any[]>([]);
  const [selectedSupervisors, setSelectedSupervisors] = useState<any[]>([]);

  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [groupOptionsRaw, setGroupOptionsRaw] = useState<any[]>([]); // same as old: resp.data

  /** --------- sections/questions (EXACT like old) --------- */
  const [sections, setSections] = useState<Section[]>([
    { group: "", questions: [emptyQuestion()] },
  ]);

  /** ---------------- fetch dropdowns (same as old) ---------------- */
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const results = await Promise.allSettled([
          getAssignedTo(),
          getVendors(),
          getChecklistGroupReading(),
          getMasterChecklist(),
        ]);

        const assignedRes =
          results[0].status === "fulfilled" ? results[0].value : null;
        const vendorsRes =
          results[1].status === "fulfilled" ? results[1].value : null;
        const groupsRes =
          results[2].status === "fulfilled" ? results[2].value : null;
        const masterRes =
          results[3].status === "fulfilled" ? results[3].value : null;

        // ✅ Assigned users
        const assignedData = assignedRes?.data || [];
        setAssignedUsers(assignedData);
        setSupervisorOptions(
          assignedData.map((u: any) => ({
            value: u.id,
            label: `${u.firstname || ""} ${u.lastname || ""}`.trim(),
          }))
        );

        // ✅ Vendors
        setSuppliers(vendorsRes?.data || []);

        // ✅ Groups (handle multiple response shapes)
        const rawGroups = groupsRes?.data;
        const groupsList = Array.isArray(rawGroups)
          ? rawGroups
          : rawGroups?.groups || rawGroups?.data || [];

        setGroupOptionsRaw(groupsList);

        // ✅ Masters
        const masterList = (masterRes?.data?.checklists || []).map(
          (c: any) => ({
            value: String(c.id),
            label: c.name,
          })
        );
        setMasters(masterList);
      } catch (e) {
        console.error(e);
      }
    };

    fetchAll();
  }, []);

  /** ---------------- when template selected, preload checklist (same as old) ---------------- */
  useEffect(() => {
    const loadTemplate = async () => {
      if (!masterid) return;
      try {
        const res = await getChecklistDetails(masterid);
        const data = res.data;

        setName(data.name || "");
        setFrequency(data.frequency || "");
        setStartDate(data.start_date || today);
        setEndDate(data.end_date || today);

        // groups -> sections (same as old mapping)
        const mapped: Section[] = (data.groups || []).map((g: any) => ({
          group: String(g.group_id || ""),
          questions: (g.questions || []).map((q: any) => ({
            name: q.name || "",
            type: q.qtype || "",
            options: [q.option1, q.option2, q.option3, q.option4].map(
              (x: any) => x || ""
            ),
            value_types: [
              q.value_type1,
              q.value_type2,
              q.value_type3,
              q.value_type4,
            ].map((x: any) => (x || "") as OptionPN),
            question_mandatory: !!q.question_mandatory,
            reading: !!q.reading,
            showHelpText: !!q.help_text_enbled,
            help_text: q.help_text || "",
            rating: !!q.rating,
            weightage: q.weightage ? String(q.weightage) : "",
            image_for_question: [],
          })),
        })) || [{ group: "", questions: [emptyQuestion()] }];

        setSections(mapped);
      } catch (e) {
        console.error(e);
        toast.error("Failed to load template checklist");
      }
    };

    if (createNew) loadTemplate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [masterid, createNew]);

  /** ---------------- section helpers ---------------- */
  const addSection = () => {
    setSections((prev) => [
      ...prev,
      { group: "", questions: [emptyQuestion()] },
    ]);
  };

  const removeSection = (idx: number) => {
    setSections((prev) =>
      prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev
    );
  };

  const addQuestion = (sectionIdx: number) => {
    setSections((prev) => {
      const copy = [...prev];
      copy[sectionIdx] = {
        ...copy[sectionIdx],
        questions: [...copy[sectionIdx].questions, emptyQuestion()],
      };
      return copy;
    });
  };

  const removeQuestion = (sectionIdx: number, qIdx: number) => {
    setSections((prev) => {
      const copy = [...prev];
      const qs = copy[sectionIdx].questions;
      if (qs.length <= 1) return prev;
      copy[sectionIdx] = {
        ...copy[sectionIdx],
        questions: qs.filter((_, i) => i !== qIdx),
      };
      return copy;
    });
  };

  const setSectionGroup = (sectionIdx: number, value: string) => {
    setSections((prev) => {
      const copy = [...prev];
      copy[sectionIdx] = { ...copy[sectionIdx], group: value };
      return copy;
    });
  };

  const setQuestionField = (
    sectionIdx: number,
    qIdx: number,
    field: keyof Question,
    value: any,
    optionIndex?: number
  ) => {
    setSections((prev) => {
      const copy = [...prev];
      const q = { ...copy[sectionIdx].questions[qIdx] };

      if (field === "options" && typeof optionIndex === "number") {
        const opts = [...q.options];
        opts[optionIndex] = value;
        q.options = opts;
      } else if (field === "value_types" && typeof optionIndex === "number") {
        const vts = [...q.value_types];
        vts[optionIndex] = value;
        q.value_types = vts as OptionPN[];
      } else {
        (q as any)[field] = value;
      }

      // if reading true, lock type to Numeric like old UI behavior
      if (field === "reading" && value === true) {
        q.type = "Numeric";
      }

      const qs = [...copy[sectionIdx].questions];
      qs[qIdx] = q;
      copy[sectionIdx] = { ...copy[sectionIdx], questions: qs };
      return copy;
    });
  };

  /** ---------------- SUBMIT (EXACT old payload keys) ---------------- */
  const handleSubmit = async () => {
    if (!name) return toast.error("Name is required");
    if (!frequency) return toast.error("Frequency is required");
    if (startDate >= endDate)
      return toast.error("Start date must be before End date");

    const siteId = getItemInLocalStorage("SITEID");
    const userId = getItemInLocalStorage("UserId");

    const convertedSubmitMinutes =
      toNum(submitDays) * 1440 + toNum(submitHours) * 60 + toNum(submitMinutes);

    const convertedExtensionMinutes =
      toNum(extensionDays) * 1440 +
      toNum(extensionHours) * 60 +
      toNum(extensionMinutes);

    setSubmitting(true);
    try {
      const formData = new FormData();

      // checklist core (same as old)
      formData.append("checklist[site_id]", String(siteId));
      formData.append("checklist[user_id]", String(userId));
      formData.append("checklist[name]", name);
      formData.append("checklist[start_date]", startDate);
      formData.append("checklist[end_date]", endDate);
      formData.append("checklist[ctype]", "soft_service");

      // toggles (same as old)
      formData.append("checklist[weightage_enabled]", String(weightageEnabled));
      formData.append("checklist[ticket_enabled]", String(createTicket));
      formData.append("checklist[ticket_level_type]", ticketType);

      // priority (same key as old)
      formData.append("checklist[priority_level]", priorityLevel);

      // supplier
      if (supplierId) formData.append("checklist[supplier_id]", supplierId);

      // lock overdue (same key as old)
      if (lockOverdue !== "") {
        formData.append(
          "checklist[lock_overdue]",
          String(lockOverdue === "true")
        );
      }

      // cron FIRST + same key as old
      formData.append("checklist[cron_expression]", cronExpression);

      // grace period (same keys as old)
      formData.append(
        "checklist[grace_period]",
        String(convertedSubmitMinutes)
      );
      formData.append(
        "checklist[grace_period_unit]",
        String(convertedExtensionMinutes)
      );

      // create ticket extra fields (same as old)
      if (createTicket) {
        if (categoryId) formData.append("checklist[category_id]", categoryId);
        if (assignedToId) formData.append("assigned_to", assignedToId);
      }

      // supervisors (same key/spelling as old)
      selectedSupervisors.forEach((s: any) => {
        formData.append("checklist[supervisior_id][]", String(s.value));
      });

      // frequency separate (same as old)
      formData.append("frequency", frequency);

      // groups + questions (same as old)
      sections.forEach((section, sectionIndex) => {
        formData.append("groups[][group]", section.group);

        section.questions.forEach((q, questionIndex) => {
          formData.append("groups[][questions][][name]", q.name);
          formData.append("groups[][questions][][type]", q.type);
          formData.append(
            "groups[][questions][][reading]",
            String(!!q.reading)
          );
          formData.append(
            "groups[][questions][][question_mandatory]",
            String(!!q.question_mandatory)
          );
          formData.append(
            "groups[][questions][][help_text_enbled]",
            String(!!q.showHelpText)
          );
          formData.append(
            "groups[][questions][][help_text]",
            q.help_text || ""
          );
          formData.append(
            "groups[][questions][][weightage]",
            q.weightage || ""
          );
          formData.append("groups[][questions][][rating]", String(!!q.rating));

          // multiple choice options + P/N types
          q.options.forEach((opt, i) => {
            formData.append("groups[][questions][][options][]", opt || "");
            formData.append(
              "groups[][questions][][value_types][]",
              q.value_types[i] || ""
            );
          });

          // images per question (same key format as old)
          if (q.image_for_question && q.image_for_question.length > 0) {
            q.image_for_question.forEach((file) => {
              formData.append(
                `groups[][questions][][image_for_question_${
                  questionIndex + 1
                }][]`,
                file
              );
            });
          }
        });
      });

      await postChecklist(formData);
      toast.success("Checklist created successfully");

      // route as per your new module
      navigate("/soft-services/checklist");
    } catch (e) {
      console.error(e);
      toast.error("Failed to create checklist");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <Breadcrumb
        items={[
          { label: "FM Module" },
          { label: "Soft Services", path: "/soft-services" },
          { label: "Checklist", path: "/soft-services/checklist" },
          { label: "Add Checklist" },
        ]}
      />

      <div className="bg-card rounded-xl border border-border overflow-hidden mt-6">
        {/* TOP toggles */}
        <div className="flex items-center gap-6 p-6 border-b border-border">
          <FormToggle
            label="Create New"
            checked={createNew}
            onChange={setCreateNew}
          />
          <FormToggle
            label="Create Ticket"
            checked={createTicket}
            onChange={setCreateTicket}
          />
          <FormToggle
            label="Weightage"
            checked={weightageEnabled}
            onChange={setWeightageEnabled}
          />
        </div>

        {/* CREATE NEW -> template select (same as old) */}
        {createNew && (
          <FormSection title="Select Template" icon={Settings}>
            <div className="max-w-xl">
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Select from the existing Template
              </label>
              <select
                value={masterid}
                onChange={(e) => setMasterid(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
              >
                <option value="">Select Template</option>
                {masters.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
          </FormSection>
        )}

        {/* CREATE TICKET -> fields (same as old) */}
        {createTicket && (
          <FormSection title="Ticket Settings" icon={Settings}>
            <div className="space-y-4">
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="ticketType"
                    value="Checklist"
                    checked={ticketType === "Checklist"}
                    onChange={() => setTicketType("Checklist")}
                  />
                  Checklist Level
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="ticketType"
                    value="Question"
                    checked={ticketType === "Question"}
                    onChange={() => setTicketType("Question")}
                  />
                  Question Level
                </label>
              </div>

              <FormGrid columns={3}>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Select Assigned To
                  </label>
                  <select
                    value={assignedToId}
                    onChange={(e) => setAssignedToId(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                  >
                    <option value="">Select Assigned To</option>
                    {assignedUsers.map((u: any) => (
                      <option key={u.id} value={u.id}>
                        {u.firstname} {u.lastname}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Select Category
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                  >
                    <option value="">Select Category</option>
                    {categories.map((c: any) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </FormGrid>
            </div>
          </FormSection>
        )}

        {/* BASIC DETAILS */}
        <FormSection title="Add Checklist" icon={ClipboardList}>
          <FormGrid columns={3}>
            <FormInput
              label="Name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Frequency
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
              >
                <option value="">Select Frequency</option>
                {frequencyOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <FormInput
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <FormInput
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Priority Level
              </label>
              <select
                value={priorityLevel}
                onChange={(e) => setPriorityLevel(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
              >
                <option value="">Select Priority level</option>
                {priorityOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Supplier
              </label>
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
              >
                <option value="">Select Supplier</option>
                {suppliers.map((s: any) => (
                  <option key={s.id} value={s.id}>
                    {s.company_name || s.name || s.vendor_name}
                  </option>
                ))}
              </select>
            </div>
          </FormGrid>
        </FormSection>

        {/* ✅ CRON FIRST */}
        <FormSection title="Cron Setting" icon={Settings}>
          <div className="border border-dashed border-border rounded-lg p-3 bg-background">
            <Cron value={cronExpression} setValue={setCronExpression} />
          </div>
        </FormSection>

        {/* GROUPS + QUESTIONS (same as old) */}
        {sections.map((section, sectionIdx) => (
          <FormSection
            key={sectionIdx}
            title={`Add New Group ${sectionIdx + 1}`}
            icon={Plus}
          >
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Group
                  </label>
                  <select
                    value={section.group}
                    onChange={(e) =>
                      setSectionGroup(sectionIdx, e.target.value)
                    }
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                  >
                    <option value="">Select Group</option>
                    {groupOptionsRaw.map((g: any) => {
                      const id = g.id ?? g.group_id;
                      const label =
                        g.name ?? g.group_name ?? g.title ?? `Group ${id}`;
                      return (
                        <option key={String(id)} value={String(id)}>
                          {label}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {sections.length > 1 && (
                  <button
                    onClick={() => removeSection(sectionIdx)}
                    className="mt-6 p-2 text-destructive hover:bg-destructive/10 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {section.questions.map((q, qIdx) => (
                <div
                  key={qIdx}
                  className="p-4 bg-accent/30 rounded-lg space-y-3"
                >
                  <div className="grid md:grid-cols-3 gap-4">
                    <FormInput
                      label="Question Name"
                      value={q.name}
                      onChange={(e) =>
                        setQuestionField(
                          sectionIdx,
                          qIdx,
                          "name",
                          e.target.value
                        )
                      }
                      placeholder="Enter Question Name"
                    />

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">
                        Answer Type
                      </label>
                      <select
                        value={q.reading ? "Numeric" : q.type}
                        onChange={(e) =>
                          setQuestionField(
                            sectionIdx,
                            qIdx,
                            "type",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                        disabled={q.reading}
                      >
                        <option value="">Select Answer Type</option>
                        {answerTypes.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-6 mt-7">
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={q.question_mandatory}
                          onChange={(e) =>
                            setQuestionField(
                              sectionIdx,
                              qIdx,
                              "question_mandatory",
                              e.target.checked
                            )
                          }
                        />
                        Mandatory
                      </label>

                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={q.reading}
                          onChange={(e) =>
                            setQuestionField(
                              sectionIdx,
                              qIdx,
                              "reading",
                              e.target.checked
                            )
                          }
                        />
                        Reading
                      </label>

                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={q.showHelpText}
                          onChange={(e) =>
                            setQuestionField(
                              sectionIdx,
                              qIdx,
                              "showHelpText",
                              e.target.checked
                            )
                          }
                        />
                        Help Text
                      </label>
                    </div>
                  </div>

                  {/* multiple choice options exactly like old */}
                  {q.type === "multiple" && !q.reading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {[0, 1, 2, 3].map((i) => (
                        <div key={i} className="flex gap-2 items-center">
                          <input
                            type="text"
                            className="flex-1 px-3 py-2 border border-border rounded-lg bg-background"
                            placeholder={`option ${i + 1}`}
                            value={q.options[i]}
                            onChange={(e) =>
                              setQuestionField(
                                sectionIdx,
                                qIdx,
                                "options",
                                e.target.value,
                                i
                              )
                            }
                          />
                          <select
                            className="w-24 px-2 py-2 border border-border rounded-lg bg-background"
                            value={q.value_types[i]}
                            onChange={(e) =>
                              setQuestionField(
                                sectionIdx,
                                qIdx,
                                "value_types",
                                e.target.value,
                                i
                              )
                            }
                          >
                            <option value="">Select</option>
                            <option value="P">P</option>
                            <option value="N">N</option>
                          </select>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* help text + files exactly like old */}
                  {q.showHelpText && (
                    <div className="space-y-2">
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                        placeholder="Enter Help text"
                        value={q.help_text}
                        onChange={(e) =>
                          setQuestionField(
                            sectionIdx,
                            qIdx,
                            "help_text",
                            e.target.value
                          )
                        }
                      />
                      <FileInputBox
                        handleChange={(files: File[]) =>
                          setQuestionField(
                            sectionIdx,
                            qIdx,
                            "image_for_question",
                            files
                          )
                        }
                        fieldName={`image_for_question_${qIdx + 1}`}
                        isMulti={true}
                      />
                    </div>
                  )}

                  {/* weightage + rating exactly like old */}
                  {weightageEnabled && (
                    <div className="grid md:grid-cols-4 gap-4 items-center">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">
                          Weightage
                        </label>
                        <input
                          type="number"
                          className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                          value={q.weightage}
                          onChange={(e) =>
                            setQuestionField(
                              sectionIdx,
                              qIdx,
                              "weightage",
                              e.target.value
                            )
                          }
                          placeholder="Enter weightage"
                        />
                      </div>

                      <label className="flex items-center gap-2 mt-7 text-sm">
                        <input
                          type="checkbox"
                          checked={q.rating}
                          onChange={(e) =>
                            setQuestionField(
                              sectionIdx,
                              qIdx,
                              "rating",
                              e.target.checked
                            )
                          }
                        />
                        Rating
                      </label>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => addQuestion(sectionIdx)}
                      className="px-3 py-2 text-sm bg-primary text-primary-foreground rounded-lg"
                    >
                      Add Question
                    </button>

                    {section.questions.length > 1 && (
                      <button
                        onClick={() => removeQuestion(sectionIdx, qIdx)}
                        className="p-2 text-destructive hover:bg-destructive/10 rounded-lg"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </FormSection>
        ))}

        <div className="px-6 pb-4">
          <button
            onClick={addSection}
            className="flex items-center gap-2 px-4 py-2 text-sm border border-primary text-primary rounded-lg hover:bg-primary hover:text-primary-foreground"
          >
            <Plus className="w-4 h-4" />
            Add Group
          </button>
        </div>

        {/* Schedules (same as old) */}
        <FormSection title="Schedules" icon={Calendar}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Allowed time to submit
                </label>
                <div className="flex gap-2">
                  <input
                    className="w-24 px-2 py-2 border rounded-lg bg-background"
                    placeholder="Days"
                    value={submitDays}
                    onChange={(e) => setSubmitDays(e.target.value)}
                  />
                  <input
                    className="w-24 px-2 py-2 border rounded-lg bg-background"
                    placeholder="Hours"
                    value={submitHours}
                    onChange={(e) => setSubmitHours(e.target.value)}
                  />
                  <input
                    className="w-24 px-2 py-2 border rounded-lg bg-background"
                    placeholder="Minutes"
                    value={submitMinutes}
                    onChange={(e) => setSubmitMinutes(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Extension Time
                </label>
                <div className="flex gap-2">
                  <input
                    className="w-24 px-2 py-2 border rounded-lg bg-background"
                    placeholder="Days"
                    value={extensionDays}
                    onChange={(e) => setExtensionDays(e.target.value)}
                  />
                  <input
                    className="w-24 px-2 py-2 border rounded-lg bg-background"
                    placeholder="Hours"
                    value={extensionHours}
                    onChange={(e) => setExtensionHours(e.target.value)}
                  />
                  <input
                    className="w-24 px-2 py-2 border rounded-lg bg-background"
                    placeholder="Minutes"
                    value={extensionMinutes}
                    onChange={(e) => setExtensionMinutes(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Lock Overdue Task
                </label>
                <select
                  value={lockOverdue}
                  onChange={(e) => setLockOverdue(e.target.value)}
                  className="w-40 px-3 py-2 border border-border rounded-lg bg-background"
                >
                  <option value="">Select Lock Status</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Supervisors
                </label>
                <Select
                  value={selectedSupervisors}
                  onChange={(val) => setSelectedSupervisors(val as any[])}
                  options={supervisorOptions}
                  isMulti
                  isSearchable
                  placeholder="Select Supervisors"
                />
              </div>
            </div>
          </div>
        </FormSection>

        {/* Submit */}
        <div className="p-6 border-t border-border">
          <div className="flex justify-center">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-lg font-medium disabled:opacity-50"
            >
              {submitting ? (
                <span className="animate-spin">⏳</span>
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateChecklist;
