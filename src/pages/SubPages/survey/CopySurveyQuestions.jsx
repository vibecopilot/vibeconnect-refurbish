import React, { useState } from "react";
import { Link } from "react-router-dom";
import { BiMessageRounded } from "react-icons/bi";
import { RxArrowRight } from "react-icons/rx";
import { IoMdStar } from "react-icons/io";
import { FaCheck } from "react-icons/fa";
import {
  PiQuestionDuotone,
} from "react-icons/pi";
import Breadcrumb from "../../../components/ui/Breadcrumb";
import TemplateCommentSurvey from "./TemplateCommentSurvey";
import LibrarySurveyModal from "./LibrarySurveyModal";
import TemplateEditQuestionSurvey from "./TemplateEditQuestionSurvey";
import TemplateOptionQuestionSurvey from "./TemplateOptionQuestionSurvey";
import TemplateLogicQuestionSurvey from "./TemplateLogicQuestionSurvey";
import TemplateMoveQuestionSurvey from "./TemplateMoveQuestionSurvey";
import TemplateCopyQuestionSurvey from "./TemplateCopyQuestionSurvey";
import SurveySetting from "./SurveySetting";

function CopySurveyQuestions() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isSidebar, setIsSidebar] = useState("setting");
  const [libraryModal, setLibraryModal] = useState(false);
  const [activeButton, setActiveButton] = useState("Edit");
  const [activeQuestionId, setActiveQuestionId] = useState(null);
  const updateQuestionButton = ["Edit", "Options", "Logic", "Move", "Copy"];
  const question = [
    {
      id: 1,
      questionName:
        "Is this the first time you are using our Products and services?",
      questType: "radioButton",
      option: ["Yes", "No"],
    },
    {
      id: 2,
      questionName: " Would you recommend it to your friends and colleagues? ",
      questType: "radioButton",
      option: ["True", "False"],
    },
    {
      id: 3,
      questionName:
        "Do you have any suggestions to improve our product and service? ",
      questType: "textArea",
    },
    {
      id: 4,
      questionName: " How satisfied are you with our company overall? ",
      questType: "checkBox",
      option: [
        "Very satisfied",
        "Satisfied",
        "undecided",
        "unsatisfied",
        "Very unsatisfied",
      ],
    },
    {
      id: 5,
      questionName: "How do you prefer to be contacted?",
      questType: "select",
      option: ["Email", "Phone", "SMS", "None"],
    },
  ];

  const [responses, setResponses] = useState({});
  const [isFavorites, setIsFavorites] = useState(false);

  const handleRadioChange = (questionId, value) => {
    setResponses((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleCheckboxChange = (questionId, value) => {
    setResponses((prev) => {
      const currentValues = prev[questionId] || [];
      return {
        ...prev,
        [questionId]: currentValues.includes(value)
          ? currentValues.filter((item) => item !== value)
          : [...currentValues, value],
      };
    });
  };

  const handleTextAreaChange = (questionId, value) => {
    setResponses((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSelectChange = (questionId, value) => {
    setResponses((prev) => ({ ...prev, [questionId]: value }));
  };

  return (
    <section className="w-full flex flex-col overflow-hidden">
      <div className="p-4 md:p-6 bg-background">
        <div className="mx-auto max-w-[1400px] xl:max-w-[1600px] space-y-6">
          <Breadcrumb
            items={[
              { label: "FM Module" },
              { label: "Surveys" },
              { label: "Copy Survey Questions" },
            ]}
          />

          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-semibold text-foreground">
              Customer Satisfaction Template
            </h1>
            <p className="text-sm text-muted-foreground">
              Adjust questions, logic, and options before copying.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-card border border-border rounded-2xl shadow-sm p-4">
                <div className="flex items-center justify-between border-b border-border pb-3 mb-3">
                  <div className="flex items-center gap-2">
                    <PiQuestionDuotone size={20} className="text-muted-foreground" />
                    <span className="text-sm font-semibold text-foreground">Question Controls</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setIsSidebar("setting")}
                      className={`px-3 py-2 rounded-md text-sm font-medium ${
                        isSidebar === "setting"
                          ? "bg-primary text-primary-foreground"
                          : "border border-border hover:bg-accent"
                      }`}
                    >
                      Settings
                    </button>
                    <button
                      onClick={() => setIsSidebar("themes")}
                      className={`px-3 py-2 rounded-md text-sm font-medium ${
                        isSidebar === "themes"
                          ? "bg-primary text-primary-foreground"
                          : "border border-border hover:bg-accent"
                      }`}
                    >
                      Themes
                    </button>
                    <button
                      onClick={() => setLibraryModal(true)}
                      className="px-3 py-2 rounded-md text-sm font-medium border border-border hover:bg-accent"
                    >
                      Library
                    </button>
                    <Link
                      to="/admin/copy-survey-view-page"
                      className="px-3 py-2 rounded-md text-sm font-medium border border-border hover:bg-accent"
                    >
                      Back
                    </Link>
                  </div>
                </div>
                {isSidebar === "setting" && <SurveySetting />}
              </div>

              <div className="space-y-4">
                {question.map((q) => (
                  <div
                    key={q.id}
                    className="relative group bg-card border border-border rounded-2xl shadow-sm p-5"
                  >
                    {activeQuestionId === q.id ? (
                      <div className="bg-background border border-border rounded-xl p-4">
                        <div className="flex flex-wrap gap-3 mb-4">
                          {updateQuestionButton.map((buttonName) => (
                            <button
                              key={buttonName}
                              className={`px-3 py-2 rounded-md text-sm font-medium ${
                                activeButton === buttonName
                                  ? "bg-primary text-primary-foreground"
                                  : "border border-border hover:bg-accent"
                              }`}
                              onClick={() => setActiveButton(buttonName)}
                            >
                              {buttonName}
                            </button>
                          ))}
                        </div>

                        {activeButton === "Edit" && (
                          <TemplateEditQuestionSurvey
                            question={q}
                            setActiveQuestionId={setActiveQuestionId}
                          />
                        )}
                        {activeButton === "Options" && (
                          <TemplateOptionQuestionSurvey setActiveQuestionId={setActiveQuestionId} />
                        )}
                        {activeButton === "Logic" && (
                          <TemplateLogicQuestionSurvey question={q} setActiveQuestionId={setActiveQuestionId} />
                        )}
                        {activeButton === "Move" && (
                          <TemplateMoveQuestionSurvey
                            questionId={q}
                            question={question}
                            setActiveQuestionId={setActiveQuestionId}
                          />
                        )}
                        {activeButton === "Copy" && (
                          <TemplateCopyQuestionSurvey
                            questionId={q}
                            question={question}
                            setActiveQuestionId={setActiveQuestionId}
                          />
                        )}
                      </div>
                    ) : (
                      <>
                        <div className="flex items-start justify-between gap-3 mb-4">
                          <h2 className="text-lg font-semibold text-foreground">
                            {q.id}. {q.questionName}
                          </h2>
                          <div className="hidden group-hover:flex space-x-2">
                            <button
                              className="px-3 py-1 rounded-md border border-border text-sm flex items-center gap-2 bg-background hover:bg-accent"
                              onClick={() => setDrawerOpen(true)}
                            >
                              <BiMessageRounded size={18} />
                              <span>1</span>
                            </button>
                            <button
                              onClick={() => {
                                setActiveQuestionId(q.id);
                                setActiveButton("Edit");
                              }}
                              className="px-3 py-1 rounded-md border border-border text-sm bg-background hover:bg-accent"
                            >
                              Options
                            </button>
                          </div>
                        </div>

                        {q.questType === "radioButton" && (
                          <div className="grid grid-cols-1 gap-3">
                            {q.option.map((option, index) => (
                              <label
                                key={index}
                                className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                                  responses[q.id] === option
                                    ? "border-primary/50 bg-primary/5"
                                    : "border-border hover:border-primary/40 hover:bg-accent"
                                }`}
                              >
                                <input
                                  type="radio"
                                  name={`question-${q.id}`}
                                  value={option}
                                  checked={responses[q.id] === option}
                                  onChange={() => handleRadioChange(q.id, option)}
                                  className="hidden"
                                />
                                <div
                                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                    responses[q.id] === option ? "border-primary bg-primary/10" : "border-border"
                                  }`}
                                >
                                  {responses[q.id] === option && <div className="w-2.5 h-2.5 bg-primary rounded-full" />}
                                </div>
                                <span className="text-sm text-foreground">{option}</span>
                              </label>
                            ))}
                          </div>
                        )}

                        {q.questType === "checkBox" && (
                          <div className="grid grid-cols-1 gap-3 mt-2">
                            {q.option.map((option) => (
                              <label
                                key={option}
                                className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                                  (responses[q.id] || []).includes(option)
                                    ? "border-primary/50 bg-primary/5"
                                    : "border-border hover:border-primary/40 hover:bg-accent"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  name={`question-${q.id}`}
                                  value={option}
                                  checked={(responses[q.id] || []).includes(option)}
                                  onChange={() => handleCheckboxChange(q.id, option)}
                                  className="hidden"
                                />
                                <div
                                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${
                                    (responses[q.id] || []).includes(option)
                                      ? "border-primary bg-primary"
                                      : "border-border"
                                  }`}
                                >
                                  {(responses[q.id] || []).includes(option) && (
                                    <FaCheck className="text-primary-foreground w-3 h-3" />
                                  )}
                                </div>
                                <span className="text-sm text-foreground">{option}</span>
                              </label>
                            ))}
                          </div>
                        )}

                        {q.questType === "textArea" && (
                          <div className="w-full mt-2">
                            <textarea
                              className="w-full px-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                              placeholder="Type your message here..."
                              value={responses[q.id] || ""}
                              onChange={(e) => handleTextAreaChange(q.id, e.target.value)}
                            ></textarea>
                          </div>
                        )}

                        {q.questType === "select" && (
                          <div className="w-full mt-2">
                            <select
                              className="w-full px-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                              value={responses[q.id] || ""}
                              onChange={(e) => handleSelectChange(q.id, e.target.value)}
                            >
                              <option value="" disabled>
                                Select an option
                              </option>
                              {q.option.map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-end">
                <button
                  className="px-5 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                  onClick={() => console.log(responses)}
                >
                  Submit
                </button>
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl shadow-sm p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Survey Stats</h2>
                  <p className="text-xs text-muted-foreground">Snapshot of this survey</p>
                </div>
                <button
                  className="p-2 rounded-lg hover:bg-accent"
                  onClick={() => setIsFavorites((prev) => !prev)}
                >
                  <IoMdStar
                    className={
                      isFavorites ? "text-yellow-500 w-5 h-5" : "text-muted-foreground w-5 h-5"
                    }
                  />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-accent/50 border border-border">
                  <p className="text-xs text-muted-foreground">Questions</p>
                  <p className="text-xl font-semibold text-foreground">5</p>
                </div>
                <div className="p-3 rounded-lg bg-accent/50 border border-border">
                  <p className="text-xs text-muted-foreground">Responses</p>
                  <p className="text-xl font-semibold text-foreground">0</p>
                </div>
                <div className="p-3 rounded-lg bg-accent/50 border border-border">
                  <p className="text-xs text-muted-foreground">Time to complete</p>
                  <p className="text-xl font-semibold text-foreground">2 minutes</p>
                </div>
                <div className="p-3 rounded-lg bg-accent/50 border border-border">
                  <p className="text-xs text-muted-foreground">Completion rate</p>
                  <p className="text-xl font-semibold text-foreground">79%</p>
                </div>
              </div>

              <Link
                to="/admin/copy-survey-question"
                className="bg-primary text-primary-foreground rounded-lg w-full py-3 px-6 flex justify-center items-center gap-2 hover:bg-primary/90 transition-colors"
              >
                <span className="font-medium">Copy This Survey</span>
                <RxArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <TemplateCommentSurvey isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
      {libraryModal && <LibrarySurveyModal onclose={() => setLibraryModal(false)} />}
    </section>
  );
}

export default CopySurveyQuestions;
