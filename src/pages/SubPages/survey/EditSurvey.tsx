import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaTrash } from "react-icons/fa";
import { BsPlusCircle } from "react-icons/bs";
import { Loader2, Upload, X, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import { getSurveys, updateSurvey } from "../../../api";
import Breadcrumb from "../../../components/ui/Breadcrumb";
import { ClipboardList, Calendar, FileText } from "lucide-react";
import { getItemInLocalStorage } from "../../../utils/localStorage";

interface QuestionOption {
  id?: number;
  label: string;
  position: number;
  _destroy?: boolean;
}

interface Question {
  id?: number;
  q_title: string;
  question_type: "rating" | "single_choice" | "multiple_choice" | "true_false" | "text" | "scale" | "";
  position: number;
  required: boolean;
  min_value?: number;
  max_value?: number;
  options_attributes?: QuestionOption[];
  _destroy?: boolean;
}

function EditSurvey() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [surveyTitle, setSurveyTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"draft" | "active" | "closed">("draft");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSurveyData();
  }, [id]);

  const fetchSurveyData = async () => {
    setLoading(true);
    try {
      const response = await getSurveys();
      const surveysData = Array.isArray(response.data) ? response.data :
                         Array.isArray(response.data.survey) ? response.data.survey :
                         Array.isArray(response.data.surveys) ? response.data.surveys : [];

      const survey = surveysData.find((s: any) => String(s.id) === String(id));

      if (survey) {
        setSurveyTitle(survey.survey_title || "");
        setStartDate(survey.start_date?.split('T')[0] || "");
        setEndDate(survey.end_date?.split('T')[0] || "");
        setDescription(survey.description || "");
        setStatus(survey.status || "draft");

        // Map existing questions
        const existingQuestions = (survey.survey_questions || []).map((q: any) => ({
          id: q.id,
          q_title: q.q_title || "",
          question_type: q.question_type || "",
          position: q.position || 1,
          required: q.required || false,
          min_value: q.min_value,
          max_value: q.max_value,
          options_attributes: (q.options || []).map((opt: any) => ({
            id: opt.id,
            label: opt.label || "",
            position: opt.position || 1
          })),
          _destroy: false
        }));

        setQuestions(existingQuestions);
      } else {
        setError("Survey not found");
      }
    } catch (err) {
      console.error("Error fetching survey:", err);
      setError("Failed to load survey");
      toast.error("Failed to load survey");
    } finally {
      setLoading(false);
    }
  };

  const addQuestion = () => {
    const newQuestion: Question = {
      q_title: "",
      question_type: "",
      position: questions.filter(q => !q._destroy).length + 1,
      required: false,
      options_attributes: [],
      _destroy: false
    };
    setQuestions([...questions, newQuestion]);
  };

  const removeQuestion = (index: number) => {
    const updatedQuestions = [...questions];
    if (updatedQuestions[index].id) {
      // Mark existing question for deletion
      updatedQuestions[index]._destroy = true;
    } else {
      // Remove new question that hasn't been saved
      updatedQuestions.splice(index, 1);
    }

    // Reorder positions for non-deleted questions
    const activeQuestions = updatedQuestions.filter(q => !q._destroy);
    activeQuestions.forEach((q, idx) => {
      q.position = idx + 1;
    });

    setQuestions(updatedQuestions);
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
      if (!updatedQuestions[index].options_attributes?.length) {
        updatedQuestions[index].options_attributes = [
          { label: "", position: 1 },
          { label: "", position: 2 },
        ];
      }
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
    if (updatedQuestions[questionIndex].options_attributes) {
      updatedQuestions[questionIndex].options_attributes![optionIndex].label = value;
    }
    setQuestions(updatedQuestions);
  };

  const addOption = (questionIndex: number) => {
    const updatedQuestions = [...questions];
    const currentOptions = updatedQuestions[questionIndex].options_attributes || [];
    const newPosition = currentOptions.filter(opt => !opt._destroy).length + 1;
    updatedQuestions[questionIndex].options_attributes = [
      ...currentOptions,
      { label: "", position: newPosition }
    ];
    setQuestions(updatedQuestions);
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const updatedQuestions = [...questions];
    const options = updatedQuestions[questionIndex].options_attributes || [];

    if (options[optionIndex].id) {
      // Mark existing option for deletion
      options[optionIndex]._destroy = true;
    } else {
      // Remove new option that hasn't been saved
      options.splice(optionIndex, 1);
    }

    // Reorder positions for non-deleted options
    const activeOptions = options.filter(opt => !opt._destroy);
    activeOptions.forEach((opt, idx) => {
      opt.position = idx + 1;
    });

    updatedQuestions[questionIndex].options_attributes = options;
    setQuestions(updatedQuestions);
  };

  const handleMinValueChange = (value: number, index: number) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].min_value = value;
    setQuestions(updatedQuestions);
  };

  const handleMaxValueChange = (value: number, index: number) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].max_value = value;
    setQuestions(updatedQuestions);
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

    const activeQuestions = questions.filter(q => !q._destroy);
    if (activeQuestions.length === 0) {
      toast.error("At least one question is required");
      return false;
    }

    for (let i = 0; i < activeQuestions.length; i++) {
      const q = activeQuestions[i];
      if (!q.q_title.trim()) {
        toast.error(`Question ${i + 1}: Title is required`);
        return false;
      }
      if (!q.question_type) {
        toast.error(`Question ${i + 1}: Question type is required`);
        return false;
      }

      const activeOptions = (q.options_attributes || []).filter(opt => !opt._destroy);
      if ((q.question_type === "single_choice" || q.question_type === "multiple_choice") && activeOptions.length < 2) {
        toast.error(`Question ${i + 1}: At least 2 options are required`);
        return false;
      }

      for (let j = 0; j < activeOptions.length; j++) {
        if (!activeOptions[j].label.trim()) {
          toast.error(`Question ${i + 1}, Option ${j + 1}: Label is required`);
          return false;
        }
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSaving(true);
    const loadingToast = toast.loading("Updating survey...");

    try {
      const userId = getItemInLocalStorage<number>("userId") || getItemInLocalStorage<number>("USER_ID");
      const siteId = getItemInLocalStorage<number>("SITEID") || getItemInLocalStorage<number>("siteId");

      // Build the survey payload with questions_attributes (includes _destroy)
      const surveyPayload = {
        survey: {
          survey_title: surveyTitle,
          status: status,
          created_by_id: userId,
          description: description,
          start_date: startDate,
          end_date: endDate,
          id_of_site: siteId,
          survey_questions_attributes: questions.map(q => {
            const questionData: any = {
              q_title: q.q_title,
              question_type: q.question_type,
              position: q.position,
              required: q.required,
              _destroy: q._destroy || false
            };

            // Include id for existing questions
            if (q.id) {
              questionData.id = q.id;
            }

            // Add min/max values if applicable
            if (q.min_value !== undefined) {
              questionData.min_value = q.min_value;
            }
            if (q.max_value !== undefined) {
              questionData.max_value = q.max_value;
            }

            // Add options with _destroy support
            if (q.options_attributes && q.options_attributes.length > 0) {
              questionData.options_attributes = q.options_attributes.map(opt => {
                const optionData: any = {
                  label: opt.label,
                  position: opt.position,
                  _destroy: opt._destroy || false
                };

                // Include id for existing options
                if (opt.id) {
                  optionData.id = opt.id;
                }

                return optionData;
              });
            }

            return questionData;
          })
        }
      };

      await updateSurvey(id, surveyPayload);

      toast.dismiss(loadingToast);
      toast.success("Survey updated successfully!");
      navigate(`/admin/survey-details/${id}`);
    } catch (error: any) {
      console.error("Survey update error:", error);
      toast.dismiss(loadingToast);

      const errorMessage = error?.response?.data?.message ||
                          error?.response?.data?.error ||
                          "Failed to update survey. Please try again.";
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
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

  if (error) {
    return (
      <div className="p-6">
        <Breadcrumb items={[{ label: 'FM Module' }, { label: 'Survey', path: '/survey' }, { label: 'Edit Survey' }]} />
        <div className="flex flex-col items-center justify-center py-20">
          <AlertTriangle className="w-12 h-12 text-destructive mb-4" />
          <h3 className="text-lg font-semibold mb-2">Failed to Load Survey</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button
            onClick={() => navigate('/survey')}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Back to Survey List
          </button>
        </div>
      </div>
    );
  }

  // Filter out deleted questions for display
  const visibleQuestions = questions.filter(q => !q._destroy);

  return (
    <div className="p-4 md:p-6 bg-background">
      <div className="mx-auto max-w-[1400px] xl:max-w-[1600px] space-y-6">
        <div className="flex flex-col gap-3">
          <Breadcrumb
            items={[
              { label: 'FM Module' },
              { label: 'Surveys', path: '/survey' },
              { label: 'Edit Survey' }
            ]}
          />

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Edit Survey</h1>
              <p className="text-sm text-muted-foreground">
                Update survey details, questions, and options.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate(`/admin/survey-details/${id}`)}
              className="px-4 py-2 border border-border rounded-lg text-foreground hover:bg-accent transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Survey Details</h3>
              <p className="text-sm text-muted-foreground">Basic information for this survey.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col md:col-span-2">
              <label htmlFor="surveyTitle" className="flex items-center gap-2 font-medium text-foreground mb-1">
                <ClipboardList className="w-4 h-4 text-muted-foreground" />
                Survey Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="surveyTitle"
                id="surveyTitle"
                placeholder="Enter survey title"
                className="rounded-lg border border-border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                value={surveyTitle}
                onChange={(e) => setSurveyTitle(e.target.value)}
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="status" className="flex items-center gap-2 font-medium text-foreground mb-1">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                name="status"
                id="status"
                className="rounded-lg border border-border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div className="flex flex-col">
              <label htmlFor="startDate" className="flex items-center gap-2 font-medium text-foreground mb-1">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="startDate"
                id="startDate"
                className="rounded-lg border border-border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="endDate" className="flex items-center gap-2 font-medium text-foreground mb-1">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                End Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="endDate"
                id="endDate"
                className="rounded-lg border border-border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="flex flex-col md:col-span-3">
              <label htmlFor="description" className="flex items-center gap-2 font-medium text-foreground mb-1">
                <FileText className="w-4 h-4 text-muted-foreground" />
                Description
              </label>
              <textarea
                name="description"
                id="description"
                placeholder="Enter survey description"
                className="rounded-lg border border-border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Questions</h3>
              <p className="text-sm text-muted-foreground">Add, edit, or remove questions.</p>
            </div>
          </div>

          {visibleQuestions.map((question, index) => {
            const actualIndex = questions.indexOf(question);
            const visibleOptions = (question.options_attributes || []).filter(opt => !opt._destroy);

            return (
              <div key={actualIndex} className="rounded-xl border border-border bg-background p-4 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-1 rounded-full bg-accent text-xs font-semibold text-foreground">
                    Question {index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeQuestion(actualIndex)}
                    className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-1"
                  >
                    <FaTrash size={14} />
                    Remove
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col md:col-span-2">
                    <label htmlFor={`question-${actualIndex}`} className="font-medium text-foreground mb-1">
                      Question <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="question"
                      id={`question-${actualIndex}`}
                      placeholder="Enter question"
                      className="rounded-lg border border-border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      value={question.q_title}
                      onChange={(e) => handleQuestionChange(e.target.value, actualIndex)}
                    />
                  </div>
                  <div className="flex flex-col">
                    <label htmlFor={`questionType-${actualIndex}`} className="font-medium text-foreground mb-1">
                      Question Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="questionType"
                      id={`questionType-${actualIndex}`}
                      className="rounded-lg border border-border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      value={question.question_type}
                      onChange={(e) => handleQuestionTypeChange(e.target.value, actualIndex)}
                    >
                      <option value="">Select Question Type</option>
                      <option value="single_choice">Single Choice</option>
                      <option value="multiple_choice">Multiple Choice</option>
                      <option value="rating">Rating (1-10)</option>
                      <option value="scale">Scale (1-5)</option>
                      <option value="true_false">True/False</option>
                      <option value="text">Text Answer</option>
                    </select>
                  </div>
                </div>

                <label className="inline-flex items-center gap-2 text-sm text-foreground">
                  <input
                    type="checkbox"
                    id={`required-${actualIndex}`}
                    checked={question.required}
                    onChange={() => handleRequiredChange(actualIndex)}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                  />
                  This question is required
                </label>

                {(question.question_type === "rating" || question.question_type === "scale") && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <label className="font-medium text-foreground mb-1">Min Value</label>
                      <input
                        type="number"
                        className="rounded-lg border border-border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        value={question.min_value || 1}
                        onChange={(e) => handleMinValueChange(Number(e.target.value), actualIndex)}
                        min={1}
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="font-medium text-foreground mb-1">Max Value</label>
                      <input
                        type="number"
                        className="rounded-lg border border-border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        value={question.max_value || (question.question_type === "rating" ? 10 : 5)}
                        onChange={(e) => handleMaxValueChange(Number(e.target.value), actualIndex)}
                        min={question.min_value || 1}
                      />
                    </div>
                  </div>
                )}

                {(question.question_type === "single_choice" || question.question_type === "multiple_choice") && (
                  <div className="space-y-2">
                    <label className="font-medium text-foreground">
                      Options <span className="text-red-500">*</span>
                    </label>
                    {visibleOptions.map((option, optionIndex) => {
                      const actualOptionIndex = (question.options_attributes || []).indexOf(option);
                      return (
                        <div key={actualOptionIndex} className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-muted-foreground min-w-[80px]">
                            Option {optionIndex + 1}
                          </span>
                          <input
                            type="text"
                            className="flex-1 rounded-lg border border-border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            value={option.label}
                            onChange={(e) => handleOptionChange(e.target.value, actualIndex, actualOptionIndex)}
                            placeholder="Enter option text"
                          />
                          {visibleOptions.length > 2 && (
                            <button
                              type="button"
                              onClick={() => removeOption(actualIndex, actualOptionIndex)}
                              className="text-red-500 hover:text-red-600 p-2"
                              aria-label="Remove option"
                            >
                              <FaTrash size={16} />
                            </button>
                          )}
                        </div>
                      );
                    })}
                    {visibleOptions.length < 10 && (
                      <button
                        type="button"
                        onClick={() => addOption(actualIndex)}
                        className="flex items-center gap-2 text-primary hover:text-primary/80 font-medium text-sm"
                      >
                        <BsPlusCircle size={18} />
                        Add Option
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          <button
            type="button"
            onClick={addQuestion}
            className="inline-flex items-center gap-2 px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary/10 font-medium transition-colors"
          >
            <BsPlusCircle size={20} />
            Add Question
          </button>
        </div>

        <div className="flex flex-col md:flex-row justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate(`/admin/survey-details/${id}`)}
            className="px-6 py-2 border border-border rounded-lg text-foreground hover:bg-accent transition-colors"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium transition-colors"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditSurvey;