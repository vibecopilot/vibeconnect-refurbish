import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';
import FormInput from '../../../components/ui/FormInput';

interface QuestionResponse {
  question_id: string;
  answer: string | number | boolean | string[] | File | null;
  photo?: File | string;
}

const ExecuteSafetyChecklist: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [checklist, setChecklist] = useState<any>(null);
  const [responses, setResponses] = useState<Record<string, QuestionResponse>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [passed, setPassed] = useState<boolean | null>(null);

  useEffect(() => {
    fetchChecklist();
  }, [id]);

  useEffect(() => {
    if (checklist?.test_mode && checklist?.time_limit && timeRemaining !== null) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev === null || prev <= 0) {
            clearInterval(timer);
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [checklist, timeRemaining]);

  const fetchChecklist = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await getSafetyChecklistById(id);
      // setChecklist(response.data);
      
      // Initialize time if test mode
      // if (response.data.test_mode && response.data.time_limit) {
      //   setTimeRemaining(response.data.time_limit * 60); // Convert to seconds
      // }
      
      setChecklist(null);
    } catch (error) {
      console.error('Error fetching checklist:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAllQuestions = () => {
    if (!checklist?.groups) return [];
    const questions: any[] = [];
    checklist.groups.forEach((group: any) => {
      group.questions?.forEach((q: any) => {
        questions.push({ ...q, groupName: group.group });
      });
    });
    
    // Randomize if enabled
    if (checklist.test_mode && checklist.randomize_questions) {
      return questions.sort(() => Math.random() - 0.5);
    }
    return questions;
  };

  const questions = getAllQuestions();
  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswerChange = (questionId: string, value: any) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        question_id: questionId,
        answer: value
      }
    }));
  };

  const handlePhotoUpload = (questionId: string, file: File) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        question_id: questionId,
        photo: file
      }
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const calculateScore = () => {
    if (!checklist?.test_mode) return null;
    
    let totalWeightage = 0;
    let earnedWeightage = 0;

    questions.forEach((question: any) => {
      const weightage = question.weightage || 0;
      totalWeightage += weightage;
      
      const response = responses[question.id];
      if (response && response.answer) {
        // Simple scoring logic - can be enhanced
        earnedWeightage += weightage;
      }
    });

    return totalWeightage > 0 ? (earnedWeightage / totalWeightage) * 100 : 0;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      if (checklist?.test_mode) {
        const calculatedScore = calculateScore();
        setScore(calculatedScore);
        setPassed(calculatedScore !== null && calculatedScore >= (checklist.passing_score || 0));
        setShowResult(true);
      } else {
        // TODO: Submit inspection responses
        // await submitChecklistExecution(id, responses);
        console.log('Responses:', responses);
        navigate('/safety/module/safety-checklists');
      }
    } catch (error) {
      console.error('Error submitting checklist:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!checklist) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <XCircle className="w-16 h-16 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">Checklist Not Found</h3>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (showResult) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="bg-card border border-border rounded-xl p-8 max-w-md w-full text-center">
          <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${
            passed ? 'bg-success/10' : 'bg-error/10'
          }`}>
            {passed ? (
              <CheckCircle className="w-8 h-8 text-success" />
            ) : (
              <XCircle className="w-8 h-8 text-error" />
            )}
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {passed ? 'Test Passed!' : 'Test Failed'}
          </h2>
          <p className="text-muted-foreground mb-4">
            Your Score: {score?.toFixed(1)}%
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            Passing Score: {checklist.passing_score}%
          </p>
          <button
            onClick={() => navigate('/safety/module/safety-checklists')}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Back to Checklists
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 bg-background/95 backdrop-blur-sm border-b z-20">
        <div className="w-full px-6 py-3">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <div className="h-8 w-px bg-border" />
            <div className="flex-1">
              <h1 className="text-lg font-bold text-foreground">{checklist.name}</h1>
              {checklist.test_mode && (
                <p className="text-sm text-muted-foreground">Test Mode - Passing Score: {checklist.passing_score}%</p>
              )}
            </div>
            {timeRemaining !== null && (
              <div className="flex items-center gap-2 px-4 py-2 bg-warning/10 text-warning rounded-lg">
                <Clock className="w-4 h-4" />
                <span className="font-medium">{formatTime(timeRemaining)}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="p-6 max-w-4xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            <span className="text-sm text-muted-foreground">
              {Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}%
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        {currentQuestion && (
          <div className="bg-card border border-border rounded-xl p-6 mb-6">
            <div className="mb-4">
              <div className="flex items-start justify-between mb-2">
                <h2 className="text-lg font-semibold text-foreground">
                  {currentQuestion.name}
                </h2>
                {currentQuestion.required && (
                  <span className="px-2 py-1 bg-error/10 text-error rounded text-xs">Required</span>
                )}
              </div>
              {currentQuestion.groupName && (
                <p className="text-sm text-muted-foreground mb-2">Section: {currentQuestion.groupName}</p>
              )}
              {currentQuestion.help_text && (
                <p className="text-sm text-muted-foreground italic">{currentQuestion.help_text}</p>
              )}
            </div>

            {/* Answer Input */}
            <div className="space-y-4">
              {currentQuestion.type === 'text' && (
                <FormInput
                  label=""
                  name={`answer_${currentQuestion.id}`}
                  value={responses[currentQuestion.id]?.answer as string || ''}
                  onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                  placeholder="Enter your answer"
                  required={currentQuestion.required}
                />
              )}

              {currentQuestion.type === 'number' && (
                <FormInput
                  label=""
                  name={`answer_${currentQuestion.id}`}
                  type="number"
                  value={responses[currentQuestion.id]?.answer as number || ''}
                  onChange={(e) => handleAnswerChange(currentQuestion.id, parseFloat(e.target.value) || 0)}
                  placeholder="Enter number"
                  required={currentQuestion.required}
                />
              )}

              {currentQuestion.type === 'yes_no' && (
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name={`answer_${currentQuestion.id}`}
                      value="yes"
                      checked={responses[currentQuestion.id]?.answer === 'yes'}
                      onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                      className="w-4 h-4 text-primary"
                    />
                    <span className="text-sm text-foreground">Yes</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name={`answer_${currentQuestion.id}`}
                      value="no"
                      checked={responses[currentQuestion.id]?.answer === 'no'}
                      onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                      className="w-4 h-4 text-primary"
                    />
                    <span className="text-sm text-foreground">No</span>
                  </label>
                </div>
              )}

              {(currentQuestion.type === 'dropdown' || currentQuestion.type === 'checkbox') && currentQuestion.options && (
                <div className="space-y-2">
                  {currentQuestion.options.map((option: string, optIndex: number) => (
                    <label key={optIndex} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type={currentQuestion.type === 'checkbox' ? 'checkbox' : 'radio'}
                        name={`answer_${currentQuestion.id}`}
                        value={option}
                        checked={
                          currentQuestion.type === 'checkbox'
                            ? (responses[currentQuestion.id]?.answer as string[])?.includes(option) || false
                            : responses[currentQuestion.id]?.answer === option
                        }
                        onChange={(e) => {
                          if (currentQuestion.type === 'checkbox') {
                            const current = (responses[currentQuestion.id]?.answer as string[]) || [];
                            const updated = e.target.checked
                              ? [...current, option]
                              : current.filter((o: string) => o !== option);
                            handleAnswerChange(currentQuestion.id, updated);
                          } else {
                            handleAnswerChange(currentQuestion.id, option);
                          }
                        }}
                        className="w-4 h-4 text-primary"
                      />
                      <span className="text-sm text-foreground">{option}</span>
                    </label>
                  ))}
                </div>
              )}

              {currentQuestion.type === 'date' && (
                <FormInput
                  label=""
                  name={`answer_${currentQuestion.id}`}
                  type="date"
                  value={responses[currentQuestion.id]?.answer as string || ''}
                  onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                  required={currentQuestion.required}
                />
              )}

              {currentQuestion.type === 'time' && (
                <FormInput
                  label=""
                  name={`answer_${currentQuestion.id}`}
                  type="time"
                  value={responses[currentQuestion.id]?.answer as string || ''}
                  onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                  required={currentQuestion.required}
                />
              )}

              {currentQuestion.type === 'photo' && (
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handlePhotoUpload(currentQuestion.id, e.target.files[0]);
                      }
                    }}
                    className="hidden"
                    id={`photo_${currentQuestion.id}`}
                  />
                  <label
                    htmlFor={`photo_${currentQuestion.id}`}
                    className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg cursor-pointer hover:bg-accent"
                  >
                    <Upload className="w-4 h-4" />
                    <span className="text-sm">Upload Photo</span>
                  </label>
                  {responses[currentQuestion.id]?.photo && (
                    <div className="mt-2">
                      <img
                        src={responses[currentQuestion.id].photo instanceof File
                          ? URL.createObjectURL(responses[currentQuestion.id].photo as File)
                          : responses[currentQuestion.id].photo as string}
                        alt="Uploaded"
                        className="w-32 h-32 object-cover rounded-lg border border-border"
                      />
                    </div>
                  )}
                </div>
              )}

              {currentQuestion.photo_required && currentQuestion.type !== 'photo' && (
                <div className="mt-4">
                  <label className="text-sm text-muted-foreground mb-2 block">Additional Photo (Required)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handlePhotoUpload(currentQuestion.id, e.target.files[0]);
                      }
                    }}
                    className="hidden"
                    id={`additional_photo_${currentQuestion.id}`}
                  />
                  <label
                    htmlFor={`additional_photo_${currentQuestion.id}`}
                    className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg cursor-pointer hover:bg-accent"
                  >
                    <Upload className="w-4 h-4" />
                    <span className="text-sm">Upload Photo</span>
                  </label>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center">
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="px-6 py-2 border border-border rounded-lg hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          {currentQuestionIndex < questions.length - 1 ? (
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-6 py-2 bg-error text-error-foreground rounded-lg hover:bg-error/90 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                  Submitting...
                </>
              ) : (
                'Submit'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExecuteSafetyChecklist;