import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { IoIosCloseCircleOutline } from "react-icons/io";
import { Loader2, AlertTriangle, Plus, Trash2, Calendar, FileText } from "lucide-react";
import toast from "react-hot-toast";
import { getSurveys, createSurvey } from "../../../api";
import { getItemInLocalStorage } from "../../../utils/localStorage";

interface QuestionOption {
  label: string;
  position: number;
}

interface Question {
  id?: number;
  q_title: string;
  question_type: "rating" | "single_choice" | "multiple_choice" | "true_false" | "text" | "scale" | "";
  position: number;
  required: boolean;
  min_value?: number;
  max_value?: number;
  options_attributes: QuestionOption[];
}

interface Survey {
  id: number;
  survey_title: string;
  description: string;
  start_date: string;
  end_date: string;
  status: string;
  survey_questions: any[];
}

function CopySurveyViewPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const surveyId = searchParams.get('surveyId');

  const [survey, setSurvey] = useState<Survey | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form data
  const [surveyTitle, setSurveyTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    if (surveyId) {
      fetchSurveyDetails();
    } else {
      setError("No survey ID provided");
      setLoading(false);
    }
  }, [surveyId]);

  const fetchSurveyDetails = async () => {
    setLoading(true);
    try {
      const response = await getSurveys();
      const surveysData = Array.isArray(response.data) ? response.data :
                         Array.isArray(response.data.survey) ? response.data.survey :
                         Array.isArray(response.data.surveys) ? response.data.surveys : [];

      const foundSurvey = surveysData.find((s: any) => String(s.id) === String(surveyId));

      if (foundSurvey) {
        setSurvey(foundSurvey);

        // Pre-fill form with survey data (for copying)
        setSurveyTitle(foundSurvey.survey_title + " (Copy)");
        setDescription(foundSurvey.description || "");
        setStartDate(foundSurvey.start_date ? foundSurvey.start_date.split('T')[0] : "");
        setEndDate(foundSurvey.end_date ? foundSurvey.end_date.split('T')[0] : "");

        // Copy questions
        const copiedQuestions: Question[] = (foundSurvey.survey_questions || []).map((q: any, index: number) => ({
          q_title: q.q_title || "",
          question_type: q.question_type || "",
          position: index + 1,
          required: q.required || false,
          min_value: q.min_value,
          max_value: q.max_value,
          options_attributes: q.options_attributes || []
        }));

        setQuestions(copiedQuestions);
      } else {
        setError('Survey not found');
      }
    } catch (err) {
      console.error('Error fetching survey:', err);
      setError('Failed to load survey');
      toast.error('Failed to load survey');
    } finally {
      setLoading(false);
    }
  };

  const addQuestion = () => {
    const newQuestion: Question = {
      q_title: "",
      question_type: "",
      position: questions.length + 1,
      required: false,
      options_attributes: [],
    };
    setQuestions([...questions, newQuestion]);
  };

  const removeQuestion = (index: number) => {
    const updatedQuestions = questions.filter((_, i) => i !== index);
    const reorderedQuestions = updatedQuestions.map((q, i) => ({ ...q, position: i + 1 }));
    setQuestions(reorderedQuestions);
  };

  const handleQuestionChange = (value: string, index: number) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].q_title = value;
    setQuestions(updatedQuestions);
  };

  const handleQuestionTypeChange = (value: string, index: number) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].question_type = value as any;

    if (value === "rating") {
      updatedQuestions[index].min_value = 1;
      updatedQuestions[index].max_value = 10;
      updatedQuestions[index].options_attributes = [];
    } else if (value === "scale") {
      updatedQuestions[index].min_value = 1;
      updatedQuestions[index].max_value = 5;
      updatedQuestions[index].options_attributes = [];
    } else if (value === "single_choice" || value === "multiple_choice") {
      updatedQuestions[index].options_attributes = [
        { label: "", position: 1 },
        { label: "", position: 2 },
      ];
      updatedQuestions[index].min_value = undefined;
      updatedQuestions[index].max_value = undefined;
    } else {
      updatedQuestions[index].options_attributes = [];
      updatedQuestions[index].min_value = undefined;
      updatedQuestions[index].max_value = undefined;
    }

    setQuestions(updatedQuestions);
  };

  const handleRequiredChange = (index: number) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].required = !updatedQuestions[index].required;
    setQuestions(updatedQuestions);
  };

  const handleOptionChange = (value: string, questionIndex: number, optionIndex: number) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options_attributes[optionIndex].label = value;
    setQuestions(updatedQuestions);
  };

  const addOption = (questionIndex: number) => {
    const updatedQuestions = [...questions];
    const newPosition = updatedQuestions[questionIndex].options_attributes.length + 1;
    updatedQuestions[questionIndex].options_attributes.push({ label: "", position: newPosition });
    setQuestions(updatedQuestions);
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const updatedQuestions = [...questions];
    if (updatedQuestions[questionIndex].options_attributes.length > 2) {
      updatedQuestions[questionIndex].options_attributes = updatedQuestions[questionIndex].options_attributes.filter((_, i) => i !== optionIndex);
      updatedQuestions[questionIndex].options_attributes = updatedQuestions[questionIndex].options_attributes.map((opt, i) => ({ ...opt, position: i + 1 }));
      setQuestions(updatedQuestions);
    }
  };

  const validateForm = () => {
    if (!surveyTitle.trim()) {
      toast.error("Survey title is required");
      return false;
    }
    if (!startDate) {
      toast.error("Start date is required");
      return false;
    }
    if (!endDate) {
      toast.error("End date is required");
      return false;
    }
    if (new Date(startDate) >= new Date(endDate)) {
      toast.error("End date must be after start date");
      return false;
    }
    if (questions.length === 0) {
      toast.error("At least one question is required");
      return false;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.q_title.trim()) {
        toast.error(`Question ${i + 1}: Title is required`);
        return false;
      }
      if (!q.question_type) {
        toast.error(`Question ${i + 1}: Question type is required`);
        return false;
      }
      if ((q.question_type === "single_choice" || q.question_type === "multiple_choice") && q.options_attributes.length < 2) {
        toast.error(`Question ${i + 1}: At least 2 options are required`);
        return false;
      }
      if (q.question_type === "single_choice" || q.question_type === "multiple_choice") {
        for (let j = 0; j < q.options_attributes.length; j++) {
          if (!q.options_attributes[j].label.trim()) {
            toast.error(`Question ${i + 1}, Option ${j + 1}: Label is required`);
            return false;
          }
        }
      }
    }

    return true;
  };

  const handleSubmit = async (status: "draft" | "active") => {
    if (!validateForm()) return;

    setSubmitting(true);
    const loadingToast = toast.loading("Creating survey copy...");

    try {
      const userId = getItemInLocalStorage<number>("userId") || getItemInLocalStorage<number>("USER_ID");
      const siteId = getItemInLocalStorage<number>("SITEID") || getItemInLocalStorage<number>("siteId");

      const surveyPayload = {
        survey: {
          survey_title: surveyTitle,
          status: status,
          created_by_id: userId,
          description: description,
          start_date: startDate,
          end_date: endDate,
          id_of_site: siteId,
          survey_questions_attributes: questions.map(q => ({
            q_title: q.q_title,
            question_type: q.question_type,
            position: q.position,
            required: q.required,
            ...(q.min_value !== undefined && { min_value: q.min_value }),
            ...(q.max_value !== undefined && { max_value: q.max_value }),
            ...(q.options_attributes.length > 0 && {
              options_attributes: q.options_attributes.map(opt => ({
                label: opt.label,
                position: opt.position
              }))
            })
          }))
        }
      };

      await createSurvey(surveyPayload);

      toast.dismiss(loadingToast);
      toast.success("Survey copied successfully!");
      navigate("/survey");
    } catch (error: any) {
      console.error("Survey copy error:", error);
      toast.dismiss(loadingToast);

      const errorMessage = error?.response?.data?.message ||
                          error?.response?.data?.error ||
                          "Failed to copy survey. Please try again.";
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading survey...</p>
        </div>
      </div>
    );
  }

  if (error || !survey) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center py-20">
          <AlertTriangle className="w-12 h-12 text-destructive mb-4" />
          <h3 className="text-lg font-semibold mb-2">Failed to Load Survey</h3>
          <p className="text-muted-foreground mb-4">{error || 'Survey not found'}</p>
          <Link
            to="/admin/copy-survey"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Back to Survey List
          </Link>
        </div>
      </div>
    );
  }

  return (
    <section className="w-full flex flex-col overflow-hidden">
      <div className="p-4 md:p-6 bg-background">
        <div className="mx-auto max-w-[1400px] xl:max-w-[1600px] space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Link
              to="/admin/copy-survey"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <IoIosCloseCircleOutline className="w-5 h-5" />
              Close
            </Link>
          </div>

          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-semibold text-foreground">
              Copy Survey
            </h1>
            <p className="text-sm text-muted-foreground">
              Copying from: <span className="font-medium text-foreground">{survey.survey_title}</span>
            </p>
          </div>

          {/* Survey Details Form */}
          <div className="bg-card border border-border rounded-2xl shadow-sm p-6 space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Survey Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="flex items-center gap-2 font-medium text-foreground mb-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  Survey Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter survey title"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  value={surveyTitle}
                  onChange={(e) => setSurveyTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="flex items-center gap-2 font-medium text-foreground mb-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div>
                <label className="flex items-center gap-2 font-medium text-foreground mb-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  End Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>

              <div className="md:col-span-2">
                <label className="font-medium text-foreground mb-2 block">Description</label>
                <textarea
                  placeholder="Enter survey description"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Questions Section */}
          <div className="bg-card border border-border rounded-2xl shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Questions ({questions.length})</h3>
              <button
                type="button"
                onClick={addQuestion}
                className="inline-flex items-center gap-2 px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary/10 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Question
              </button>
            </div>

            {questions.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-muted-foreground">No questions added yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {questions.map((question, index) => (
                  <div key={index} className="rounded-xl border border-border bg-background p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-1 rounded-full bg-accent text-xs font-semibold">
                        Question {index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeQuestion(index)}
                        className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-1"
                      >
                        <Trash2 size={14} />
                        Remove
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2">
                        <label className="font-medium text-foreground mb-1 block">
                          Question <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="Enter question"
                          className="w-full rounded-lg border border-border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                          value={question.q_title}
                          onChange={(e) => handleQuestionChange(e.target.value, index)}
                        />
                      </div>
                      <div>
                        <label className="font-medium text-foreground mb-1 block">
                          Type <span className="text-red-500">*</span>
                        </label>
                        <select
                          className="w-full rounded-lg border border-border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                          value={question.question_type}
                          onChange={(e) => handleQuestionTypeChange(e.target.value, index)}
                        >
                          <option value="">Select Type</option>
                          <option value="single_choice">Single Choice</option>
                          <option value="multiple_choice">Multiple Choice</option>
                          <option value="rating">Rating (1-10)</option>
                          <option value="scale">Scale (1-5)</option>
                          <option value="true_false">True/False</option>
                          <option value="text">Text Answer</option>
                        </select>
                      </div>
                    </div>

                    <label className="inline-flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={question.required}
                        onChange={() => handleRequiredChange(index)}
                        className="w-4 h-4 rounded border-border"
                      />
                      Required
                    </label>

                    {(question.question_type === "single_choice" || question.question_type === "multiple_choice") && (
                      <div className="space-y-2">
                        <label className="font-medium text-foreground">Options</label>
                        {question.options_attributes.map((option, optionIndex) => (
                          <div key={optionIndex} className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-muted-foreground min-w-[80px]">
                              Option {optionIndex + 1}
                            </span>
                            <input
                              type="text"
                              className="flex-1 rounded-lg border border-border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                              value={option.label}
                              onChange={(e) => handleOptionChange(e.target.value, index, optionIndex)}
                              placeholder="Enter option"
                            />
                            {question.options_attributes.length > 2 && (
                              <button
                                type="button"
                                onClick={() => removeOption(index, optionIndex)}
                                className="text-red-500 hover:text-red-600 p-2"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        ))}
                        {question.options_attributes.length < 10 && (
                          <button
                            type="button"
                            onClick={() => addOption(index)}
                            className="flex items-center gap-2 text-primary hover:text-primary/80 font-medium text-sm"
                          >
                            <Plus size={18} />
                            Add Option
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex flex-col md:flex-row justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate("/admin/copy-survey")}
              className="px-6 py-2 border border-border rounded-lg text-foreground hover:bg-accent transition-colors"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleSubmit("draft")}
              className="px-6 py-2 border border-primary text-primary rounded-lg hover:bg-primary/10 transition-colors"
              disabled={submitting}
            >
              {submitting ? "Saving..." : "Save as Draft"}
            </button>
            <button
              type="button"
              onClick={() => handleSubmit("active")}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              disabled={submitting}
            >
              {submitting ? "Publishing..." : "Publish Survey"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CopySurveyViewPage;