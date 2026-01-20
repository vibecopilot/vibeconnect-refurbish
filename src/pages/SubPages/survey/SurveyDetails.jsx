import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Loader2, Edit, Calendar, FileText, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import Breadcrumb from "../../../components/ui/Breadcrumb";
import { getSurveys } from "../../../api";

function SurveyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openQuestionIds, setOpenQuestionIds] = useState(new Set());

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

      // Find the specific survey by ID
      const foundSurvey = surveysData.find(s => String(s.id) === String(id));

      if (foundSurvey) {
        setSurvey(foundSurvey);
      } else {
        setError("Survey not found");
      }
    } catch (err) {
      console.error("Error fetching survey details:", err);
      setError("Failed to load survey details");
      toast.error("Failed to load survey details");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    const statusLower = (status || '').toLowerCase();
    if (statusLower === 'active') return 'bg-green-100 text-green-700 border-green-200';
    if (statusLower === 'draft') return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    if (statusLower === 'closed') return 'bg-red-100 text-red-700 border-red-200';
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading survey details...</p>
        </div>
      </div>
    );
  }

  if (error || !survey) {
    return (
      <div className="p-6">
        <Breadcrumb items={[{ label: 'FM Module' }, { label: 'Survey', path: '/survey' }, { label: 'Survey Details' }]} />
        <div className="flex flex-col items-center justify-center py-20">
          <AlertTriangle className="w-12 h-12 text-destructive mb-4" />
          <h3 className="text-lg font-semibold mb-2">Failed to Load Survey</h3>
          <p className="text-muted-foreground mb-4">{error || 'Survey not found'}</p>
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

  return (
    <div className="p-6">
      <Breadcrumb items={[
        { label: 'FM Module' },
        { label: 'Survey', path: '/survey' },
        { label: survey.survey_title || 'Survey Details' }
      ]} />

      <div className="mt-6 bg-card border border-border rounded-xl shadow-sm">
        {/* Header Section */}
        <div className="p-6 border-b border-border">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-2">{survey.survey_title || 'Untitled Survey'}</h1>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(survey.status)}`}>
                  {survey.status || 'Unknown'}
                </span>
                <span className="text-sm text-muted-foreground">
                  Survey ID: #{survey.id}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                to={`/survey/${id}/edit`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Edit className="w-4 h-4" />
                Edit Survey
              </Link>
              <button
                onClick={() => navigate('/survey')}
                className="px-4 py-2 border border-border rounded-lg text-foreground hover:bg-accent transition-colors"
              >
                Back to List
              </button>
            </div>
          </div>
        </div>

        {/* Survey Information Section */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Survey Details Card */}
            <div className="bg-muted/50 border border-border rounded-lg p-5 space-y-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Survey Information
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <span className="text-sm text-muted-foreground">Description:</span>
                  <span className="text-sm font-medium text-foreground text-right max-w-[60%]">
                    {survey.description || 'No description provided'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(survey.status)}`}>
                    {survey.status || 'Unknown'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Created:</span>
                  <span className="text-sm font-medium text-foreground">
                    {formatDate(survey.created_at)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Last Updated:</span>
                  <span className="text-sm font-medium text-foreground">
                    {formatDate(survey.updated_at)}
                  </span>
                </div>
              </div>
            </div>

            {/* Survey Duration Card */}
            <div className="bg-muted/50 border border-border rounded-lg p-5 space-y-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Survey Duration
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Start Date:</span>
                  <span className="text-sm font-medium text-foreground">
                    {formatDate(survey.start_date)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">End Date:</span>
                  <span className="text-sm font-medium text-foreground">
                    {formatDate(survey.end_date)}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-border">
                  <span className="text-sm text-muted-foreground">Duration:</span>
                  <span className="text-sm font-medium text-foreground">
                    {survey.start_date && survey.end_date
                      ? `${Math.ceil((new Date(survey.end_date) - new Date(survey.start_date)) / (1000 * 60 * 60 * 24))} days`
                      : '-'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Questions Section */}
          <div className="mt-6">
            <div className="flex items-center justify-between gap-3 mb-3">
              <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Survey Questions
              </h3>
              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary">
                {survey.survey_questions?.length || 0} total
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">Browse all questions with clear tags and options.</p>

            {survey.survey_questions && survey.survey_questions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {survey.survey_questions.map((question, index) => {
                  const hasOptions =
                    (question.question_type === 'single_choice' || question.question_type === 'multiple_choice') &&
                    question.options &&
                    question.options.length > 0;
                  const qKey = question.id ?? index;
                  const isOpen = hasOptions && openQuestionIds.has(qKey);
                  const toggleOptions = () => {
                    if (!hasOptions) return;
                    setOpenQuestionIds((prev) => {
                      const next = new Set(prev);
                      next.has(qKey) ? next.delete(qKey) : next.add(qKey);
                      return next;
                    });
                  };

                  return (
                    <div
                      key={question.id}
                      className={`bg-card border border-border rounded-xl p-5 shadow-sm space-y-3 transition-colors ${
                        hasOptions ? 'cursor-pointer hover:bg-primary/5' : 'hover:bg-muted/50'
                      }`}
                      onClick={toggleOptions}
                    >
                      <div className="flex items-start gap-3 justify-between">
                        <div className="flex items-start gap-3">
                          <span className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
                            Q{index + 1}
                          </span>
                          <div>
                            <h4 className="text-base font-semibold text-foreground">
                              {question.q_title || 'Untitled Question'}
                            </h4>
                            <div className="flex flex-wrap gap-2 mt-2">
                              <span className="px-2 py-1 bg-background border border-border rounded text-xs font-medium">
                                {question.question_type?.replace('_', ' ') || 'Unknown'}
                              </span>
                              {question.required && (
                                <span className="px-2 py-1 bg-red-100 text-red-700 border border-red-200 rounded text-xs font-semibold">
                                  Required
                                </span>
                              )}
                              {(question.question_type === 'rating' || question.question_type === 'scale') && (
                                <span className="px-2 py-1 bg-blue-100 text-blue-700 border border-blue-200 rounded text-xs font-medium">
                                  Range {question.min_value || 1} - {question.max_value || 10}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {hasOptions && !isOpen && (
                        <p className="text-xs text-muted-foreground">Click to view options</p>
                      )}

                      {hasOptions && isOpen && (
                        <div className="pt-2">
                          <p className="text-xs font-semibold text-muted-foreground mb-2">Options</p>
                          <div className="flex flex-wrap gap-2">
                            {question.options.map((option, optIdx) => (
                              <div
                                key={optIdx}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-background shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
                              >
                                <span className="h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center">
                                  {String.fromCharCode(65 + optIdx)}
                                </span>
                                <span className="text-xs font-medium text-foreground">
                                  {option.label || `Option ${optIdx + 1}`}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-muted/50 border border-border rounded-lg p-8 text-center">
                <p className="text-muted-foreground">No questions added to this survey yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SurveyDetails;
