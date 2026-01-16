import React, { useState, useEffect } from "react";
import { MdOutlineSignalCellularAlt2Bar } from "react-icons/md";
import { Link, NavLink, useSearchParams } from "react-router-dom";
import { RxArrowRight } from "react-icons/rx";
import { Loader2, AlertTriangle } from "lucide-react";
import Breadcrumb from "../../../components/ui/Breadcrumb";
import { getSurveys } from "../../../api";
import toast from "react-hot-toast";

interface Survey {
  id: number;
  survey_title: string;
  description: string;
  survey_questions: any[];
  is_premium?: boolean;
}

function TemplateDetailsSurvey() {
  const [searchParams] = useSearchParams();
  const templateId = searchParams.get('templateId');

  const [template, setTemplate] = useState<Survey | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [responses, setResponses] = useState<{ [key: number]: any }>({});

  useEffect(() => {
    if (templateId) {
      fetchTemplateDetails();
    } else {
      setError("No template ID provided");
      setLoading(false);
    }
  }, [templateId]);

  const fetchTemplateDetails = async () => {
    setLoading(true);
    try {
      const response = await getSurveys();
      const surveysData = Array.isArray(response.data) ? response.data :
                         Array.isArray(response.data.survey) ? response.data.survey :
                         Array.isArray(response.data.surveys) ? response.data.surveys : [];

      const foundTemplate = surveysData.find((s: any) => String(s.id) === String(templateId));

      if (foundTemplate) {
        setTemplate(foundTemplate);
      } else {
        setError('Template not found');
      }
    } catch (err) {
      console.error('Error fetching template:', err);
      setError('Failed to load template');
      toast.error('Failed to load template');
    } finally {
      setLoading(false);
    }
  };

  const handleRadioChange = (questionId: number, value: any) => {
    setResponses((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleCheckboxChange = (questionId: number, value: string) => {
    setResponses((prev) => {
      const currentValues = prev[questionId] || [];
      return {
        ...prev,
        [questionId]: currentValues.includes(value)
          ? currentValues.filter((item: string) => item !== value)
          : [...currentValues, value],
      };
    });
  };

  const handleTextAreaChange = (questionId: number, value: string) => {
    setResponses((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleRangeChange = (questionId: number, value: number) => {
    setResponses((prev) => ({ ...prev, [questionId]: value }));
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading template...</p>
        </div>
      </div>
    );
  }

  if (error || !template) {
    return (
      <div className="p-6">
        <Breadcrumb items={[
          { label: 'FM Module' },
          { label: 'Surveys', path: '/survey' },
          { label: 'Template Survey' }
        ]} />
        <div className="flex flex-col items-center justify-center py-20">
          <AlertTriangle className="w-12 h-12 text-destructive mb-4" />
          <h3 className="text-lg font-semibold mb-2">Failed to Load Template</h3>
          <p className="text-muted-foreground mb-4">{error || 'Template not found'}</p>
          <Link
            to="/admin/create-template-survey"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Back to Templates
          </Link>
        </div>
      </div>
    );
  }

  const questions = template.survey_questions || [];
  const answeredCount = Object.keys(responses).length;
  const totalQuestions = questions.length;
  const percentage = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

  return (
    <section className="w-full flex flex-col overflow-hidden">
      <div className="p-4 md:p-6 bg-background">
        <div className="mx-auto max-w-[1400px] xl:max-w-[1600px] space-y-6">
          <Breadcrumb
            items={[
              { label: "FM Module" },
              { label: "Surveys", path: "/survey" },
              { label: "Template Survey" },
            ]}
          />

          <div className="flex flex-wrap justify-center gap-4">
            <NavLink
              to={`/admin/template-detail-survey?templateId=${templateId}`}
              className={({ isActive }) =>
                `px-4 py-2 rounded-md text-sm font-medium ${
                  isActive ? "bg-primary text-primary-foreground" : "border border-border hover:bg-accent"
                }`
              }
            >
              Preview
            </NavLink>
            <NavLink
              to={`/admin/sample-result-survey?templateId=${templateId}`}
              className={({ isActive }) =>
                `px-4 py-2 rounded-md text-sm font-medium ${
                  isActive ? "bg-primary text-primary-foreground" : "border border-border hover:bg-accent"
                }`
              }
            >
              Sample Result
            </NavLink>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-semibold text-foreground">
                  {template.survey_title}
                </h2>
                <p className="text-sm text-muted-foreground">
                  Preview the questions and structure before using this template.
                </p>
              </div>

              {questions.length === 0 ? (
                <div className="text-center py-10 bg-card border border-border rounded-2xl">
                  <p className="text-muted-foreground">No questions in this template</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {questions.map((q: any, index: number) => (
                    <div key={q.id} className="bg-card border border-border rounded-2xl shadow-sm p-5">
                      <h2 className="text-lg font-semibold text-foreground mb-4">
                        {index + 1}. {q.q_title}
                      </h2>

                      {/* Rating (1-10) or Scale (1-5) */}
                      {(q.question_type === "rating" || q.question_type === "scale") && (
                        <div className="flex flex-wrap gap-3">
                          {Array.from(
                            { length: (q.max_value || 10) - (q.min_value || 1) + 1 },
                            (_, i) => (q.min_value || 1) + i
                          ).map((option) => (
                            <label
                              key={option}
                              className={`px-3 py-2 rounded-lg border cursor-pointer transition-all ${
                                responses[q.id] === option
                                  ? "border-primary/60 bg-primary/5"
                                  : "border-border hover:border-primary/40 hover:bg-accent"
                              }`}
                            >
                              <input
                                type="radio"
                                name={`question-${q.id}`}
                                value={option}
                                checked={responses[q.id] === option}
                                onChange={() => handleRangeChange(q.id, option)}
                                className="hidden"
                              />
                              <span className="text-sm font-semibold text-foreground">{option}</span>
                            </label>
                          ))}
                        </div>
                      )}

                      {/* Single Choice or True/False */}
                      {(q.question_type === "single_choice" || q.question_type === "true_false") && (
                        <div className="grid grid-cols-1 gap-3">
                          {q.question_type === "true_false" ? (
                            <>
                              {["True", "False"].map((option) => (
                                <label
                                  key={option}
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
                            </>
                          ) : (
                            (q.options_attributes || []).map((option: any, idx: number) => (
                              <label
                                key={idx}
                                className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                                  responses[q.id] === option.label
                                    ? "border-primary/50 bg-primary/5"
                                    : "border-border hover:border-primary/40 hover:bg-accent"
                                }`}
                              >
                                <input
                                  type="radio"
                                  name={`question-${q.id}`}
                                  value={option.label}
                                  checked={responses[q.id] === option.label}
                                  onChange={() => handleRadioChange(q.id, option.label)}
                                  className="hidden"
                                />
                                <div
                                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                    responses[q.id] === option.label ? "border-primary bg-primary/10" : "border-border"
                                  }`}
                                >
                                  {responses[q.id] === option.label && <div className="w-2.5 h-2.5 bg-primary rounded-full" />}
                                </div>
                                <span className="text-sm text-foreground">{option.label}</span>
                              </label>
                            ))
                          )}
                        </div>
                      )}

                      {/* Multiple Choice */}
                      {q.question_type === "multiple_choice" && (
                        <div className="grid grid-cols-1 gap-3 mt-2">
                          {(q.options_attributes || []).map((option: any) => (
                            <label
                              key={option.label}
                              className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                                (responses[q.id] || []).includes(option.label)
                                  ? "border-primary/50 bg-primary/5"
                                  : "border-border hover:border-primary/40 hover:bg-accent"
                              }`}
                            >
                              <input
                                type="checkbox"
                                name={`question-${q.id}`}
                                value={option.label}
                                checked={(responses[q.id] || []).includes(option.label)}
                                onChange={() => handleCheckboxChange(q.id, option.label)}
                                className="hidden"
                              />
                              <div
                                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${
                                  (responses[q.id] || []).includes(option.label) ? "border-primary bg-primary" : "border-border"
                                }`}
                              >
                                {(responses[q.id] || []).includes(option.label) && (
                                  <svg
                                    className="w-3 h-3 text-primary-foreground"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <polyline points="20 6 9 17 4 12" />
                                  </svg>
                                )}
                              </div>
                              <span className="text-sm text-foreground">{option.label}</span>
                            </label>
                          ))}
                        </div>
                      )}

                      {/* Text Answer */}
                      {q.question_type === "text" && (
                        <div className="w-full mt-2">
                          <textarea
                            className="w-full px-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder="Type your message here..."
                            value={responses[q.id] || ""}
                            onChange={(e) => handleTextAreaChange(q.id, e.target.value)}
                            rows={4}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between bg-accent/60 border border-border rounded-xl p-4">
                <div className="flex items-center gap-3 w-full">
                  <div className="relative w-1/2 h-3 bg-background rounded-full overflow-hidden border border-border">
                    <div className="h-full bg-primary" style={{ width: `${percentage}%` }}></div>
                  </div>
                  <div className="text-sm font-medium text-foreground">
                    <span>{answeredCount}</span> of <span>{totalQuestions}</span> answered
                  </div>
                </div>
                <button
                  className="px-5 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                  onClick={() => console.log(responses)}
                >
                  Submit
                </button>
              </div>
            </div>

            {/* Sidebar */}
            <div className="bg-card border border-border rounded-2xl shadow-sm p-5 space-y-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-accent flex justify-center items-center">
                  <MdOutlineSignalCellularAlt2Bar size={22} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground">
                    {template.survey_title}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {questions.length} question{questions.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {template.description || 'Preview this template and customize it to fit your needs. You can always make changes to the theme and template.'}
              </p>
              <p className="text-sm text-muted-foreground">
                You can always make changes to the theme and template.
              </p>

              <div className="border-t pt-4 space-y-4">
                {template.is_premium && (
                  <div className="border p-3 space-y-2 rounded-md">
                    <h2 className="text-sm font-medium">Premium features</h2>
                    <p className="text-xs text-muted-foreground">This template contains paid features</p>
                  </div>
                )}
                <Link
                  to={`/admin/edit-template-survey?templateId=${templateId}`}
                  className="bg-primary text-primary-foreground rounded-lg w-full py-3 px-6 flex justify-center items-center gap-2 hover:bg-primary/90 transition-colors"
                >
                  <span className="font-medium">Use This Template</span>
                  <RxArrowRight size={18} />
                </Link>
                <div>
                  <p className="text-sm font-normal text-muted-foreground">Didn't find what you're looking for?</p>
                  <Link
                    to={`/admin/create-scratch-survey`}
                    className="font-medium text-sm text-primary hover:text-primary/80"
                  >
                    Start with a blank survey
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default TemplateDetailsSurvey;