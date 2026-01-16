import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaTrash } from "react-icons/fa";
import { BsPlusCircle } from "react-icons/bs";
import toast from "react-hot-toast";
import { createSurvey } from "../../../api";
import Breadcrumb from "../../../components/ui/Breadcrumb";
import { ClipboardList, Calendar, FileText, Upload, X } from "lucide-react";
import { getItemInLocalStorage } from "../../../utils/localStorage";

interface QuestionOption {
  label: string;
  position: number;
}

interface Question {
  q_title: string;
  question_type: "rating" | "single_choice" | "multiple_choice" | "true_false" | "text" | "scale" | "";
  position: number;
  required: boolean;
  min_value?: number;
  max_value?: number;
  options_attributes: QuestionOption[];
  attachments?: File[];
}

function CreateScratchSurvey() {
  const navigate = useNavigate();
  const [surveyTitle, setSurveyTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [surveyImages, setSurveyImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const addQuestion = () => {
    const newQuestion: Question = {
      q_title: "",
      question_type: "",
      position: questions.length + 1,
      required: false,
      options_attributes: [],
      attachments: [],
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSurveyImages(prev => [...prev, ...filesArray]);
    }
  };

  const removeImage = (index: number) => {
    setSurveyImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleQuestionFileChange = (e: React.ChangeEvent<HTMLInputElement>, questionIndex: number) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const updatedQuestions = [...questions];
      updatedQuestions[questionIndex].attachments = [
        ...(updatedQuestions[questionIndex].attachments || []),
        ...filesArray
      ];
      setQuestions(updatedQuestions);
    }
  };

  const removeQuestionImage = (questionIndex: number, imageIndex: number) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].attachments =
      (updatedQuestions[questionIndex].attachments || []).filter((_, i) => i !== imageIndex);
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

    setLoading(true);
    const loadingToast = toast.loading("Creating survey...");

    try {
      // Get user ID and site ID from localStorage
      const userId = getItemInLocalStorage<number>("userId") || getItemInLocalStorage<number>("USER_ID");
      const siteId = getItemInLocalStorage<number>("SITEID") || getItemInLocalStorage<number>("siteId");

      // Build the survey payload with nested questions structure
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

      // If there are survey images or question attachments, use FormData; otherwise use JSON
      const hasQuestionAttachments = questions.some(q => q.attachments && q.attachments.length > 0);
      let surveyData;
      if (surveyImages.length > 0 || hasQuestionAttachments) {
        const formData = new FormData();

        // Append survey data as nested form fields
        formData.append('survey[survey_title]', surveyTitle);
        formData.append('survey[status]', status);
        if (userId) formData.append('survey[created_by_id]', String(userId));
        formData.append('survey[description]', description);
        formData.append('survey[start_date]', startDate);
        formData.append('survey[end_date]', endDate);
        if (siteId) formData.append('survey[id_of_site]', String(siteId));

        // Append questions
        questions.forEach((q, qIndex) => {
          formData.append(`survey[survey_questions_attributes][${qIndex}][q_title]`, q.q_title);
          formData.append(`survey[survey_questions_attributes][${qIndex}][question_type]`, q.question_type);
          formData.append(`survey[survey_questions_attributes][${qIndex}][position]`, String(q.position));
          formData.append(`survey[survey_questions_attributes][${qIndex}][required]`, String(q.required));

          if (q.min_value !== undefined) {
            formData.append(`survey[survey_questions_attributes][${qIndex}][min_value]`, String(q.min_value));
          }
          if (q.max_value !== undefined) {
            formData.append(`survey[survey_questions_attributes][${qIndex}][max_value]`, String(q.max_value));
          }

          // Append options for choice-based questions
          q.options_attributes.forEach((opt, optIndex) => {
            formData.append(`survey[survey_questions_attributes][${qIndex}][options_attributes][${optIndex}][label]`, opt.label);
            formData.append(`survey[survey_questions_attributes][${qIndex}][options_attributes][${optIndex}][position]`, String(opt.position));
          });

          // Append question attachments
          if (q.attachments && q.attachments.length > 0) {
            q.attachments.forEach((file) => {
              formData.append(`survey[survey_questions_attributes][${qIndex}][attachments][]`, file);
            });
          }
        });

        // Append survey images
        surveyImages.forEach(image => {
          formData.append('survey[survey_images][]', image);
        });

        surveyData = formData;
      } else {
        // Use JSON payload (no images)
        surveyData = surveyPayload;
      }

      // Single API call with all nested data
      await createSurvey(surveyData);

      toast.dismiss(loadingToast);
      toast.success("Survey created successfully!");
      navigate("/survey");
    } catch (error: any) {
      console.error("Survey creation error:", error);
      toast.dismiss(loadingToast);

      const errorMessage = error?.response?.data?.message ||
                          error?.response?.data?.error ||
                          "Failed to create survey. Please try again.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6 bg-background">
      <div className="mx-auto max-w-[1400px] xl:max-w-[1600px] space-y-6">
        <div className="flex flex-col gap-3">
          <Breadcrumb
            items={[
              { label: 'FM Module' },
              { label: 'Surveys', path: '/survey' },
              { label: 'Create Survey' }
            ]}
          />

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Create Survey</h1>
              <p className="text-sm text-muted-foreground">
                Build a custom survey from scratch by adding questions and options.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 border border-border rounded-lg text-foreground hover:bg-accent transition-colors"
            >
              Go Back
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

            {/* Survey Attachments */}
            <div className="flex flex-col md:col-span-3">
              <label className="flex items-center gap-2 font-medium text-foreground mb-2">
                <Upload className="w-4 h-4 text-muted-foreground" />
                Survey Attachments
              </label>
              <div className="space-y-3">
                <label className="flex items-center justify-center w-full h-32 px-4 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors">
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="w-8 h-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Click to upload images
                    </span>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>

                {surveyImages.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {surveyImages.map((file, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border border-border"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {file.name}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Questions</h3>
              <p className="text-sm text-muted-foreground">Add question text, type, and options.</p>
            </div>
          </div>

          {questions.map((question, index) => (
            <div key={index} className="rounded-xl border border-border bg-background p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2 py-1 rounded-full bg-accent text-xs font-semibold text-foreground">
                  Question {index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeQuestion(index)}
                  className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-1"
                >
                  <FaTrash size={14} />
                  Remove
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col md:col-span-2">
                  <label htmlFor={`question-${index}`} className="font-medium text-foreground mb-1">
                    Question <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="question"
                    id={`question-${index}`}
                    placeholder="Enter question"
                    className="rounded-lg border border-border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    value={question.q_title}
                    onChange={(e) => handleQuestionChange(e.target.value, index)}
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor={`questionType-${index}`} className="font-medium text-foreground mb-1">
                    Question Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="questionType"
                    id={`questionType-${index}`}
                    className="rounded-lg border border-border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    value={question.question_type}
                    onChange={(e) => handleQuestionTypeChange(e.target.value, index)}
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
                  id={`required-${index}`}
                  checked={question.required}
                  onChange={() => handleRequiredChange(index)}
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
                      onChange={(e) => handleMinValueChange(Number(e.target.value), index)}
                      min={1}
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="font-medium text-foreground mb-1">Max Value</label>
                    <input
                      type="number"
                      className="rounded-lg border border-border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      value={question.max_value || (question.question_type === "rating" ? 10 : 5)}
                      onChange={(e) => handleMaxValueChange(Number(e.target.value), index)}
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
                  {question.options_attributes.map((option, optionIndex) => (
                    <div key={optionIndex} className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-muted-foreground min-w-[80px]">
                        Option {optionIndex + 1}
                      </span>
                      <input
                        type="text"
                        className="flex-1 rounded-lg border border-border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        value={option.label}
                        onChange={(e) => handleOptionChange(e.target.value, index, optionIndex)}
                        placeholder="Enter option text"
                      />
                      {question.options_attributes.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeOption(index, optionIndex)}
                          className="text-red-500 hover:text-red-600 p-2"
                          aria-label="Remove option"
                        >
                          <FaTrash size={16} />
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
                      <BsPlusCircle size={18} />
                      Add Option
                    </button>
                  )}
                </div>
              )}

              {/* Question Attachments */}
              <div className="flex flex-col">
                <label className="flex items-center gap-2 font-medium text-foreground mb-2">
                  <Upload className="w-4 h-4 text-muted-foreground" />
                  Question Attachments
                </label>
                <div className="space-y-3">
                  <label className="flex items-center justify-center w-full h-24 px-4 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors">
                    <div className="flex flex-col items-center gap-1">
                      <Upload className="w-6 h-6 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        Click to upload images
                      </span>
                    </div>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleQuestionFileChange(e, index)}
                    />
                  </label>

                  {question.attachments && question.attachments.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {question.attachments.map((file, imgIndex) => (
                        <div key={imgIndex} className="relative group">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Question ${index + 1} - Image ${imgIndex + 1}`}
                            className="w-full h-20 object-cover rounded-lg border border-border"
                          />
                          <button
                            type="button"
                            onClick={() => removeQuestionImage(index, imgIndex)}
                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                          <p className="text-xs text-muted-foreground mt-1 truncate">
                            {file.name}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

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
            onClick={() => navigate("/survey")}
            className="px-6 py-2 border border-border rounded-lg text-foreground hover:bg-accent transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => handleSubmit("draft")}
            className="px-6 py-2 border border-primary text-primary rounded-lg hover:bg-primary/10 font-medium transition-colors"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save as Draft"}
          </button>
          <button
            type="button"
            onClick={() => handleSubmit("active")}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium transition-colors"
            disabled={loading}
          >
            {loading ? "Publishing..." : "Publish Survey"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateScratchSurvey;