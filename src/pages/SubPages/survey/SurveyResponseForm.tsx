import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2, AlertTriangle, CheckCircle, Calendar, FileText } from "lucide-react";
import toast from "react-hot-toast";
import { getSurveys, submitSurveyResponse } from "../../../api";

interface Question {
  id: number;
  q_title: string;
  question_type: string;
  position: number;
  required: boolean;
  min_value?: number;
  max_value?: number;
  options_attributes?: any[];
  options?: any[];
}

interface Survey {
  id: number;
  survey_title: string;
  description: string;
  start_date: string;
  end_date: string;
  status: string;
  survey_questions: Question[];
}

function SurveyResponseForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [responses, setResponses] = useState<{ [key: number]: any }>({});

  useEffect(() => {
    fetchSurveyDetails();
  }, [id]);

  const fetchSurveyDetails = async () => {
    setLoading(true);
    try {
      const response = await getSurveys();
      const surveysData = Array.isArray(response.data) ? response.data :
                         Array.isArray(response.data.survey) ? response.data.survey :
                         Array.isArray(response.data.surveys) ? response.data.surveys : [];

      const foundSurvey = surveysData.find((s: any) => String(s.id) === String(id));

      if (foundSurvey) {
        // Check if survey is active and within date range
        const now = new Date();
        const startDate = new Date(foundSurvey.start_date);
        const endDate = new Date(foundSurvey.end_date);

        if (foundSurvey.status !== 'active') {
          setError('This survey is not currently active');
        } else if (now < startDate) {
          setError('This survey has not started yet');
        } else if (now > endDate) {
          setError('This survey has ended');
        } else {
          setSurvey(foundSurvey);
        }
      } else {
        setError('Survey not found');
      }
    } catch (err) {
      console.error('Error fetching survey:', err);
      setError('Failed to load survey');
    } finally {
      setLoading(false);
    }
  };

  const handleResponseChange = (questionId: number, value: any) => {
    setResponses(prev => ({ ...prev, [questionId]: value }));
  };

  const handleCheckboxChange = (questionId: number, value: string) => {
    setResponses(prev => {
      const currentValues = prev[questionId] || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter((v: string) => v !== value)
        : [...currentValues, value];
      return { ...prev, [questionId]: newValues };
    });
  };

  const validateForm = () => {
    if (!survey) return false;

    for (const question of survey.survey_questions) {
      if (question.required) {
        const response = responses[question.id];
        if (!response || (Array.isArray(response) && response.length === 0) || response === '') {
          toast.error(`Please answer: ${question.q_title}`);
          return false;
        }
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSubmitting(true);
    try {
      // Build the survey answers array with proper field mapping based on question type
      const surveyAnswers = Object.keys(responses).map(questionId => {
        const question = survey!.survey_questions.find(q => q.id === parseInt(questionId));
        const answer = responses[parseInt(questionId)];

        if (!question) return null;

        const baseAnswer = {
          survey_question_id: parseInt(questionId)
        };

        // Map answer to correct field based on question type
        switch (question.question_type) {
          case 'text':
            return { ...baseAnswer, text_value: answer };

          case 'rating':
          case 'scale':
            return { ...baseAnswer, numeric_value: parseInt(answer) };

          case 'single_choice': {
            // Find the option ID by matching the label
            const questionOptions = question.options || question.options_attributes || [];
            const selectedOption = questionOptions.find((opt: any) => opt.label === answer);
            return {
              ...baseAnswer,
              selected_option_ids: selectedOption ? [selectedOption.id] : []
            };
          }

          case 'multiple_choice': {
            // Find all option IDs by matching the labels
            const questionOptions = question.options || question.options_attributes || [];
            const selectedOptions = questionOptions.filter((opt: any) =>
              Array.isArray(answer) && answer.includes(opt.label)
            );
            return {
              ...baseAnswer,
              selected_option_ids: selectedOptions.map((opt: any) => opt.id)
            };
          }

          case 'true_false':
            return { ...baseAnswer, text_value: answer };

          default:
            return { ...baseAnswer, text_value: answer };
        }
      }).filter(a => a !== null);

      const payload = {
        survey_response: {
          survey_id: survey?.id,
          survey_answers_attributes: surveyAnswers
        }
      };

      console.log('Submitting survey response payload:', JSON.stringify(payload, null, 2));
      await submitSurveyResponse(survey!.id, payload);
      toast.success('Survey submitted successfully!');
      setSubmitted(true);
    } catch (error: any) {
      console.error('Error submitting survey:', error);
      const errorMsg = error?.response?.data?.errors
        ? JSON.stringify(error.response.data.errors)
        : error?.response?.data?.message || 'Failed to submit survey';
      toast.error(errorMsg);
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

  const renderQuestion = (question: Question, index: number) => {
    const questionValue = responses[question.id];

    // Use options or options_attributes (API returns 'options', form creation uses 'options_attributes')
    const questionOptions = question.options || question.options_attributes || [];

    return (
      <div key={question.id} className="bg-card border border-border rounded-xl p-6 space-y-4">
        <div className="flex items-start gap-3">
          <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-semibold">
            {index + 1}
          </span>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-foreground">
              {question.q_title}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </h3>
          </div>
        </div>

        <div className="ml-14">
          {/* Rating Scale (1-10) */}
          {question.question_type === 'rating' && (
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: (question.max_value || 10) - (question.min_value || 1) + 1 }, (_, i) => {
                const value = (question.min_value || 1) + i;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => handleResponseChange(question.id, value)}
                    className={`w-12 h-12 rounded-lg border-2 transition-all ${
                      questionValue === value
                        ? 'border-primary bg-primary text-white'
                        : 'border-border hover:border-primary hover:bg-primary/10'
                    }`}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          )}

          {/* Scale (1-5) */}
          {question.question_type === 'scale' && (
            <div className="flex gap-3">
              {Array.from({ length: (question.max_value || 5) - (question.min_value || 1) + 1 }, (_, i) => {
                const value = (question.min_value || 1) + i;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => handleResponseChange(question.id, value)}
                    className={`flex-1 py-3 rounded-lg border-2 transition-all ${
                      questionValue === value
                        ? 'border-primary bg-primary text-white'
                        : 'border-border hover:border-primary hover:bg-primary/10'
                    }`}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          )}

          {/* Single Choice */}
          {question.question_type === 'single_choice' && questionOptions.length > 0 && (
            <div className="space-y-2">
              {questionOptions.map((option: any) => (
                <label
                  key={option.id}
                  className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-accent transition-colors"
                >
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    value={option.label}
                    checked={questionValue === option.label}
                    onChange={(e) => handleResponseChange(question.id, e.target.value)}
                    className="w-4 h-4 text-primary focus:ring-primary"
                  />
                  <span className="text-foreground">{option.label}</span>
                </label>
              ))}
            </div>
          )}

          {/* Multiple Choice */}
          {question.question_type === 'multiple_choice' && questionOptions.length > 0 && (
            <div className="space-y-2">
              {questionOptions.map((option: any) => (
                <label
                  key={option.id}
                  className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-accent transition-colors"
                >
                  <input
                    type="checkbox"
                    value={option.label}
                    checked={(questionValue || []).includes(option.label)}
                    onChange={() => handleCheckboxChange(question.id, option.label)}
                    className="w-4 h-4 text-primary focus:ring-primary rounded"
                  />
                  <span className="text-foreground">{option.label}</span>
                </label>
              ))}
            </div>
          )}

          {/* True/False */}
          {question.question_type === 'true_false' && (
            <div className="flex gap-4">
              <label className="flex items-center gap-3 p-4 border border-border rounded-lg cursor-pointer hover:bg-accent transition-colors flex-1">
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value="true"
                  checked={questionValue === 'true'}
                  onChange={(e) => handleResponseChange(question.id, e.target.value)}
                  className="w-4 h-4 text-primary focus:ring-primary"
                />
                <span className="text-foreground font-medium">True</span>
              </label>
              <label className="flex items-center gap-3 p-4 border border-border rounded-lg cursor-pointer hover:bg-accent transition-colors flex-1">
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value="false"
                  checked={questionValue === 'false'}
                  onChange={(e) => handleResponseChange(question.id, e.target.value)}
                  className="w-4 h-4 text-primary focus:ring-primary"
                />
                <span className="text-foreground font-medium">False</span>
              </label>
            </div>
          )}

          {/* Text Answer */}
          {question.question_type === 'text' && (
            <textarea
              value={questionValue || ''}
              onChange={(e) => handleResponseChange(question.id, e.target.value)}
              placeholder="Enter your answer..."
              rows={4}
              className="w-full px-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading survey...</p>
        </div>
      </div>
    );
  }

  if (error || !survey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="max-w-md w-full bg-card border border-border rounded-xl p-8 text-center space-y-4">
          <AlertTriangle className="w-16 h-16 text-destructive mx-auto" />
          <h2 className="text-2xl font-bold text-foreground">Survey Unavailable</h2>
          <p className="text-muted-foreground">{error || 'Survey not found'}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="max-w-md w-full bg-card border border-border rounded-xl p-8 text-center space-y-4">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
          <h2 className="text-2xl font-bold text-foreground">Thank You!</h2>
          <p className="text-muted-foreground">
            Your response has been submitted successfully.
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Survey Header */}
        <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {survey.survey_title}
          </h1>
          {survey.description && (
            <p className="text-muted-foreground mb-4">{survey.description}</p>
          )}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>
                {formatDate(survey.start_date)} - {formatDate(survey.end_date)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span>{survey.survey_questions.length} questions</span>
            </div>
          </div>
        </div>

        {/* Questions Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {survey.survey_questions
            .sort((a, b) => a.position - b.position)
            .map((question, index) => renderQuestion(question, index))}

          {/* Submit Button */}
          <div className="bg-card border border-border rounded-xl p-6">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Survey'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SurveyResponseForm;