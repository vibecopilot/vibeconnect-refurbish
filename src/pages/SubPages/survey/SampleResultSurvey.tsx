import { useState, useEffect } from "react";
import { Link, NavLink, useSearchParams, useNavigate } from "react-router-dom";
import { MdOutlineSignalCellularAlt2Bar } from "react-icons/md";
import { RxArrowRight } from "react-icons/rx";
import { Loader2, AlertTriangle, BarChart3 } from "lucide-react";
import Breadcrumb from "../../../components/ui/Breadcrumb";
import { getSurveys, getSurveyResponses } from "../../../api";
import toast from "react-hot-toast";

interface Survey {
  id: number;
  survey_title: string;
  description: string;
  survey_questions: any[];
}

function SampleResultSurvey() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const templateId = searchParams.get('templateId');

  const [template, setTemplate] = useState<Survey | null>(null);
  const [responses, setResponses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (templateId) {
      fetchTemplateAndResponses();
    } else {
      setError("No template ID provided");
      setLoading(false);
    }
  }, [templateId]);

  const fetchTemplateAndResponses = async () => {
    setLoading(true);
    try {
      // Fetch template/survey details
      const surveyResponse = await getSurveys();
      const surveysData = Array.isArray(surveyResponse.data) ? surveyResponse.data :
                         Array.isArray(surveyResponse.data.survey) ? surveyResponse.data.survey :
                         Array.isArray(surveyResponse.data.surveys) ? surveyResponse.data.surveys : [];

      const foundTemplate = surveysData.find((s: any) => String(s.id) === String(templateId));

      if (!foundTemplate) {
        setError('Template not found');
        setLoading(false);
        return;
      }

      setTemplate(foundTemplate);

      // Try to fetch responses
      try {
        const responsesData = await getSurveyResponses(templateId);
        console.log('Raw responses data:', responsesData);
        const responsesArray = Array.isArray(responsesData.data) ? responsesData.data :
                              Array.isArray(responsesData.data.responses) ? responsesData.data.responses : [];
        console.log('Processed responses array:', responsesArray);
        setResponses(responsesArray);
      } catch (err) {
        console.log('No responses found for this survey');
        setResponses([]);
      }
    } catch (err) {
      console.error('Error fetching template:', err);
      setError('Failed to load template');
      toast.error('Failed to load template');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading sample results...</p>
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
          { label: 'Sample Results' }
        ]} />
        <div className="flex flex-col items-center justify-center py-20">
          <AlertTriangle className="w-12 h-12 text-destructive mb-4" />
          <h3 className="text-lg font-semibold mb-2">Failed to Load Results</h3>
          <p className="text-muted-foreground mb-4">{error || 'Template not found'}</p>
          <button
            onClick={() => navigate('/admin/create-template-survey')}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Back to Templates
          </button>
        </div>
      </div>
    );
  }

  const hasResponses = responses.length > 0;

  return (
    <section className="w-full flex flex-col overflow-hidden">
      <div className="p-4 md:p-6 bg-background">
        <div className="mx-auto max-w-[1400px] xl:max-w-[1600px] space-y-6">
          <Breadcrumb
            items={[
              { label: "FM Module" },
              { label: "Surveys", path: "/survey" },
              { label: "Sample Results" },
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
            <div className="lg:col-span-2 space-y-6">
              <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-semibold text-foreground">
                  {template.survey_title}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {hasResponses
                    ? `Showing results from ${responses.length} response${responses.length !== 1 ? 's' : ''}`
                    : 'No responses available for this survey yet'}
                </p>
              </div>

              {!hasResponses ? (
                <div className="bg-card border border-border rounded-2xl shadow-sm p-12 text-center space-y-4">
                  <BarChart3 className="w-20 h-20 text-muted-foreground mx-auto" />
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      No Response Data Available
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      This template hasn't received any responses yet. Once users start submitting responses, you'll see the analytics here.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3 justify-center">
                    <Link
                      to={`/admin/template-detail-survey?templateId=${templateId}`}
                      className="px-4 py-2 border border-border rounded-lg text-foreground hover:bg-accent transition-colors"
                    >
                      Preview Template
                    </Link>
                    <Link
                      to={`/admin/edit-template-survey?templateId=${templateId}`}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      Use This Template
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Response Summary */}
                  <div className="bg-card border border-border rounded-2xl shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4">Response Summary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-accent/50 rounded-lg">
                        <div className="text-3xl font-bold text-primary">{responses.length}</div>
                        <div className="text-sm text-muted-foreground">Total Responses</div>
                      </div>
                      <div className="text-center p-4 bg-accent/50 rounded-lg">
                        <div className="text-3xl font-bold text-primary">{template.survey_questions.length}</div>
                        <div className="text-sm text-muted-foreground">Questions</div>
                      </div>
                      <div className="text-center p-4 bg-accent/50 rounded-lg">
                        <div className="text-3xl font-bold text-primary">100%</div>
                        <div className="text-sm text-muted-foreground">Completion Rate</div>
                      </div>
                    </div>
                  </div>

                  {/* Individual Question Results */}
                  {template.survey_questions.map((question: any, index: number) => {
                    // Process responses for this question
                    // API returns survey_answers array with fields: text_value, numeric_value, selected_option_ids
                    const questionResponses = responses
                      .map((r: any) => {
                        const answers = r.survey_answers || r.responses || [];
                        return answers.find((resp: any) => resp.survey_question_id === question.id);
                      })
                      .filter((r: any) => {
                        if (!r) return false;
                        // Check if any value field has data
                        return r.text_value !== null || r.numeric_value !== null ||
                               (r.selected_option_ids && r.selected_option_ids.length > 0);
                      });

                    // Helper function to get answer value from response based on question type
                    const getAnswerValue = (resp: any, questionType: string) => {
                      switch (questionType) {
                        case 'rating':
                        case 'scale':
                          return resp.numeric_value;

                        case 'single_choice': {
                          // Get the option label from selected_option_ids
                          if (!resp.selected_option_ids || resp.selected_option_ids.length === 0) return null;
                          const optionId = resp.selected_option_ids[0];
                          const questionOptions = question.options || question.options_attributes || [];
                          const option = questionOptions.find((opt: any) => opt.id === optionId);
                          return option ? option.label : null;
                        }

                        case 'multiple_choice': {
                          // Get all option labels from selected_option_ids
                          if (!resp.selected_option_ids || resp.selected_option_ids.length === 0) return [];
                          const questionOptions = question.options || question.options_attributes || [];
                          return resp.selected_option_ids.map((optionId: number) => {
                            const option = questionOptions.find((opt: any) => opt.id === optionId);
                            return option ? option.label : null;
                          }).filter((label: any) => label !== null);
                        }

                        case 'text':
                        case 'true_false':
                          return resp.text_value;

                        default:
                          return resp.text_value || resp.numeric_value;
                      }
                    };

                    // Calculate statistics based on question type
                    const getQuestionStats = () => {
                      if (questionResponses.length === 0) return null;

                      switch (question.question_type) {
                        case 'rating':
                        case 'scale': {
                          const values = questionResponses
                            .map((r: any) => getAnswerValue(r, question.question_type))
                            .filter((v: any) => v !== null)
                            .map(Number);
                          if (values.length === 0) return null;
                          const average = values.reduce((a, b) => a + b, 0) / values.length;
                          const counts: { [key: number]: number } = {};
                          values.forEach(v => counts[v] = (counts[v] || 0) + 1);
                          return { type: 'rating', average, counts, total: values.length };
                        }

                        case 'single_choice':
                        case 'true_false': {
                          const counts: { [key: string]: number } = {};
                          questionResponses.forEach((r: any) => {
                            const answer = getAnswerValue(r, question.question_type);
                            if (answer) {
                              counts[answer] = (counts[answer] || 0) + 1;
                            }
                          });
                          return { type: 'choice', counts, total: questionResponses.length };
                        }

                        case 'multiple_choice': {
                          const counts: { [key: string]: number } = {};
                          questionResponses.forEach((r: any) => {
                            const answers = getAnswerValue(r, question.question_type);
                            if (Array.isArray(answers)) {
                              answers.forEach((ans: string) => {
                                counts[ans] = (counts[ans] || 0) + 1;
                              });
                            }
                          });
                          return { type: 'multiple', counts, total: questionResponses.length };
                        }

                        case 'text': {
                          const answers = questionResponses
                            .map((r: any) => getAnswerValue(r, question.question_type))
                            .filter((a: any) => a !== null && a !== '');
                          return { type: 'text', answers, total: answers.length };
                        }

                        default:
                          return null;
                      }
                    };

                    const stats = getQuestionStats();

                    return (
                      <div key={question.id} className="bg-card border border-border rounded-2xl shadow-sm p-6">
                        <h3 className="text-lg font-semibold text-foreground mb-4">
                          Question {index + 1}: {question.q_title}
                        </h3>
                        <div className="text-sm text-muted-foreground mb-4">
                          Type: {question.question_type.replace('_', ' ').toUpperCase()} • {questionResponses.length} response{questionResponses.length !== 1 ? 's' : ''}
                        </div>

                        {!stats ? (
                          <div className="bg-accent/30 border border-border rounded-lg p-8 text-center">
                            <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">
                              No responses for this question yet
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {/* Rating/Scale Visualization */}
                            {(stats.type === 'rating') && (
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-medium text-muted-foreground">Average Rating</span>
                                  <span className="text-2xl font-bold text-primary">{stats.average.toFixed(1)}</span>
                                </div>
                                <div className="space-y-2 mt-4">
                                  {Object.entries(stats.counts).sort(([a], [b]) => Number(a) - Number(b)).map(([value, count]) => {
                                    const percentage = ((count as number) / stats.total) * 100;
                                    return (
                                      <div key={value} className="flex items-center gap-3">
                                        <span className="text-sm font-medium text-foreground w-8">{value}</span>
                                        <div className="flex-1 h-8 bg-accent rounded-lg overflow-hidden">
                                          <div
                                            className="h-full bg-primary/70 flex items-center justify-end pr-2"
                                            style={{ width: `${percentage}%` }}
                                          >
                                            {percentage > 15 && (
                                              <span className="text-xs font-medium text-white">{count}</span>
                                            )}
                                          </div>
                                        </div>
                                        {percentage <= 15 && (
                                          <span className="text-xs font-medium text-muted-foreground w-8">{count}</span>
                                        )}
                                        <span className="text-xs text-muted-foreground w-12 text-right">{percentage.toFixed(0)}%</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {/* Single Choice / True-False Visualization */}
                            {stats.type === 'choice' && (
                              <div className="space-y-2">
                                {Object.entries(stats.counts).map(([option, count]) => {
                                  const percentage = ((count as number) / stats.total) * 100;
                                  return (
                                    <div key={option} className="flex items-center gap-3">
                                      <span className="text-sm font-medium text-foreground flex-1 truncate">{option}</span>
                                      <div className="flex-1 h-8 bg-accent rounded-lg overflow-hidden">
                                        <div
                                          className="h-full bg-primary/70 flex items-center justify-end pr-2"
                                          style={{ width: `${percentage}%` }}
                                        >
                                          {percentage > 15 && (
                                            <span className="text-xs font-medium text-white">{count}</span>
                                          )}
                                        </div>
                                      </div>
                                      {percentage <= 15 && (
                                        <span className="text-xs font-medium text-muted-foreground w-8">{count}</span>
                                      )}
                                      <span className="text-xs text-muted-foreground w-12 text-right">{percentage.toFixed(0)}%</span>
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {/* Multiple Choice Visualization */}
                            {stats.type === 'multiple' && (
                              <div className="space-y-2">
                                <p className="text-xs text-muted-foreground mb-3">Respondents could select multiple options</p>
                                {Object.entries(stats.counts).map(([option, count]) => {
                                  const percentage = ((count as number) / stats.total) * 100;
                                  return (
                                    <div key={option} className="flex items-center gap-3">
                                      <span className="text-sm font-medium text-foreground flex-1 truncate">{option}</span>
                                      <div className="flex-1 h-8 bg-accent rounded-lg overflow-hidden">
                                        <div
                                          className="h-full bg-primary/70 flex items-center justify-end pr-2"
                                          style={{ width: `${percentage}%` }}
                                        >
                                          {percentage > 15 && (
                                            <span className="text-xs font-medium text-white">{count}</span>
                                          )}
                                        </div>
                                      </div>
                                      {percentage <= 15 && (
                                        <span className="text-xs font-medium text-muted-foreground w-8">{count}</span>
                                      )}
                                      <span className="text-xs text-muted-foreground w-12 text-right">{percentage.toFixed(0)}%</span>
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {/* Text Responses */}
                            {stats.type === 'text' && (
                              <div className="space-y-2 max-h-96 overflow-y-auto">
                                {stats.answers.slice(0, 10).map((answer: string, idx: number) => (
                                  <div key={idx} className="p-3 bg-accent/30 rounded-lg border border-border">
                                    <p className="text-sm text-foreground">{answer}</p>
                                  </div>
                                ))}
                                {stats.answers.length > 10 && (
                                  <p className="text-xs text-muted-foreground text-center pt-2">
                                    Showing 10 of {stats.answers.length} responses
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
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
                    {hasResponses ? `${responses.length} responses` : 'No responses yet'}
                  </p>
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                {template.description || 'View sample results and analytics for this template. Once you use this template, you can track real responses from your audience.'}
              </p>

              <div className="border-t pt-4 space-y-4">
                <p className="text-sm font-normal text-muted-foreground">
                  Ready to use this template?
                </p>
                <Link
                  to={`/admin/edit-template-survey?templateId=${templateId}`}
                  className="bg-primary text-primary-foreground rounded-lg w-full py-3 px-6 flex justify-center items-center gap-2 hover:bg-primary/90 transition-colors"
                >
                  <span className="font-medium">Use This Template</span>
                  <RxArrowRight size={18} />
                </Link>
                <div>
                  <p className="text-sm font-normal text-muted-foreground">Want to preview questions?</p>
                  <Link
                    to={`/admin/template-detail-survey?templateId=${templateId}`}
                    className="font-medium text-sm text-primary hover:text-primary/80"
                  >
                    View template preview
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

export default SampleResultSurvey;