import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, X, Upload } from 'lucide-react';
import FormSection from '../../../components/ui/FormSection';
import FormInput from '../../../components/ui/FormInput';
import FormGrid from '../../../components/ui/FormGrid';
import { ClipboardList, HelpCircle } from 'lucide-react';

interface ChecklistQuestion {
  id: string;
  name: string;
  type: 'text' | 'number' | 'yes_no' | 'dropdown' | 'checkbox' | 'date' | 'time' | 'photo' | 'signature';
  required: boolean;
  photo_required: boolean;
  help_text: string;
  options: string[];
  weightage: number;
}

interface ChecklistGroup {
  id: string;
  group: string;
  questions: ChecklistQuestion[];
}

const CreateSafetyChecklist: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = window.location.pathname;
  const isEditMode = location.includes('/edit');
  const isViewMode = Boolean(id && !isEditMode);
  
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    frequency: '',
    test_mode: false,
    passing_score: '',
    time_limit: '',
    randomize_questions: false,
    status: 'Active',
  });

  const [groups, setGroups] = useState<ChecklistGroup[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddGroup = () => {
    const newGroup: ChecklistGroup = {
      id: Date.now().toString(),
      group: '',
      questions: [],
    };
    setGroups(prev => [...prev, newGroup]);
  };

  const handleRemoveGroup = (groupId: string) => {
    setGroups(prev => prev.filter(g => g.id !== groupId));
  };

  const handleGroupChange = (groupId: string, value: string) => {
    setGroups(prev => prev.map(g => 
      g.id === groupId ? { ...g, group: value } : g
    ));
  };

  const handleAddQuestion = (groupId: string) => {
    const newQuestion: ChecklistQuestion = {
      id: Date.now().toString(),
      name: '',
      type: 'text',
      required: false,
      photo_required: false,
      help_text: '',
      options: [],
      weightage: 0,
    };
    setGroups(prev => prev.map(g => 
      g.id === groupId ? { ...g, questions: [...g.questions, newQuestion] } : g
    ));
  };

  const handleRemoveQuestion = (groupId: string, questionId: string) => {
    setGroups(prev => prev.map(g => 
      g.id === groupId ? { ...g, questions: g.questions.filter(q => q.id !== questionId) } : g
    ));
  };

  const handleQuestionChange = (groupId: string, questionId: string, field: keyof ChecklistQuestion, value: any) => {
    setGroups(prev => prev.map(g => 
      g.id === groupId ? {
        ...g,
        questions: g.questions.map(q => 
          q.id === questionId ? { ...q, [field]: value } : q
        )
      } : g
    ));
  };

  const handleAddOption = (groupId: string, questionId: string) => {
    setGroups(prev => prev.map(g => 
      g.id === groupId ? {
        ...g,
        questions: g.questions.map(q => 
          q.id === questionId ? { ...q, options: [...q.options, ''] } : q
        )
      } : g
    ));
  };

  const handleOptionChange = (groupId: string, questionId: string, optionIndex: number, value: string) => {
    setGroups(prev => prev.map(g => 
      g.id === groupId ? {
        ...g,
        questions: g.questions.map(q => 
          q.id === questionId ? {
            ...q,
            options: q.options.map((opt, idx) => idx === optionIndex ? value : opt)
          } : q
        )
      } : g
    ));
  };

  const handleRemoveOption = (groupId: string, questionId: string, optionIndex: number) => {
    setGroups(prev => prev.map(g => 
      g.id === groupId ? {
        ...g,
        questions: g.questions.map(q => 
          q.id === questionId ? {
            ...q,
            options: q.options.filter((_, idx) => idx !== optionIndex)
          } : q
        )
      } : g
    ));
  };

  useEffect(() => {
    if (id) {
      // TODO: Fetch data when in view/edit mode
      // const fetchChecklist = async () => {
      //   const response = await getSafetyChecklistById(id);
      //   setFormData(response.data);
      //   setGroups(response.data.groups || []);
      // };
      // fetchChecklist();
    }
  }, [id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Integrate API when ready
    console.log('Form Data:', formData);
    console.log('Groups:', groups);
    // navigate('/safety/module/safety-checklists');
  };

  const questionTypes = [
    { value: 'text', label: 'Text' },
    { value: 'number', label: 'Number' },
    { value: 'yes_no', label: 'Yes/No' },
    { value: 'dropdown', label: 'Dropdown' },
    { value: 'checkbox', label: 'Checkbox' },
    { value: 'date', label: 'Date' },
    { value: 'time', label: 'Time' },
    { value: 'photo', label: 'Photo' },
    { value: 'signature', label: 'Signature' },
  ];

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
            <div>
              <h1 className="text-lg font-bold text-foreground uppercase">
                {isViewMode ? 'VIEW SAFETY CHECKLIST' : isEditMode ? 'EDIT SAFETY CHECKLIST' : 'CREATE SAFETY CHECKLIST'}
              </h1>
            </div>
          </div>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Section 1: Checklist Details */}
        <FormSection title="CHECKLIST DETAILS" icon={ClipboardList}>
          <FormGrid columns={3}>
            <FormInput
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter Checklist Name"
              disabled={isViewMode}
            />
            <FormInput
              label="Category"
              name="category"
              type="select"
              value={formData.category}
              onChange={handleChange}
              required
              placeholder="Select Category"
              options={[
                { value: 'Fire Safety', label: 'Fire Safety' },
                { value: 'Electrical Safety', label: 'Electrical Safety' },
                { value: 'Structural Safety', label: 'Structural Safety' },
                { value: 'Chemical Safety', label: 'Chemical Safety' },
                { value: 'Mechanical Safety', label: 'Mechanical Safety' },
                { value: 'Environmental Safety', label: 'Environmental Safety' },
                { value: 'Other', label: 'Other' },
              ]}
              disabled={isViewMode}
            />
            <FormInput
              label="Frequency"
              name="frequency"
              type="select"
              value={formData.frequency}
              onChange={handleChange}
              placeholder="Select Frequency"
              options={[
                { value: 'Daily', label: 'Daily' },
                { value: 'Weekly', label: 'Weekly' },
                { value: 'Monthly', label: 'Monthly' },
                { value: 'Quarterly', label: 'Quarterly' },
              ]}
              disabled={isViewMode}
            />
            <FormInput
              label="Status"
              name="status"
              type="select"
              value={formData.status}
              onChange={handleChange}
              options={[
                { value: 'Active', label: 'Active' },
                { value: 'Inactive', label: 'Inactive' },
              ]}
              disabled={isViewMode}
            />
          </FormGrid>
          <div className="mt-4">
            <FormInput
              label="Description"
              name="description"
              type="textarea"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter description"
              rows={4}
              disabled={isViewMode}
            />
          </div>
        </FormSection>

        {/* Section 2: Questions/Sections */}
        <FormSection title="QUESTIONS/SECTIONS" icon={HelpCircle}>
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm text-muted-foreground">
              {groups.length > 0 && `Total Sections: ${groups.length}`}
            </div>
            {!isViewMode && (
              <button
                type="button"
                onClick={handleAddGroup}
                className="flex items-center gap-2 px-4 py-2 bg-error text-error-foreground rounded-lg hover:bg-error/90 transition-colors text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                Add Section
              </button>
            )}
          </div>

          {groups.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Click "Add Section" to add question groups
            </div>
          ) : (
            <div className="space-y-6">
              {groups.map((group, groupIndex) => (
                <div key={group.id} className="border border-border rounded-lg p-4 bg-secondary/30">
                  <div className="flex justify-between items-center mb-4">
                    <FormInput
                      label=""
                      name={`group_${group.id}`}
                      value={group.group}
                      onChange={(e) => handleGroupChange(group.id, e.target.value)}
                      placeholder="Section Name"
                      disabled={isViewMode}
                      className="flex-1"
                    />
                    {!isViewMode && (
                      <button
                        type="button"
                        onClick={() => handleRemoveGroup(group.id)}
                        className="p-1 hover:bg-destructive/10 rounded text-destructive ml-2"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-muted-foreground">
                        Questions: {group.questions.length}
                      </div>
                      {!isViewMode && (
                        <button
                          type="button"
                          onClick={() => handleAddQuestion(group.id)}
                          className="flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-xs font-medium"
                        >
                          <Plus className="w-3 h-3" />
                          Add Question
                        </button>
                      )}
                    </div>

                    {group.questions.map((question, qIndex) => (
                      <div key={question.id} className="border border-border rounded-lg p-4 bg-background">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-sm font-medium text-foreground">Question {qIndex + 1}</span>
                          {!isViewMode && (
                            <button
                              type="button"
                              onClick={() => handleRemoveQuestion(group.id, question.id)}
                              className="p-1 hover:bg-destructive/10 rounded text-destructive"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        <FormGrid columns={3}>
                          <FormInput
                            label="Question Text"
                            name={`question_${question.id}`}
                            value={question.name}
                            onChange={(e) => handleQuestionChange(group.id, question.id, 'name', e.target.value)}
                            required
                            placeholder="Enter question"
                            disabled={isViewMode}
                            className="col-span-3"
                          />
                          <FormInput
                            label="Question Type"
                            name={`type_${question.id}`}
                            type="select"
                            value={question.type}
                            onChange={(e) => handleQuestionChange(group.id, question.id, 'type', e.target.value as ChecklistQuestion['type'])}
                            required
                            options={questionTypes}
                            disabled={isViewMode}
                          />
                          <div className="col-span-2 flex items-end gap-4">
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={question.required}
                                onChange={(e) => handleQuestionChange(group.id, question.id, 'required', e.target.checked)}
                                disabled={isViewMode}
                                className="w-4 h-4 text-primary"
                              />
                              <span className="text-sm text-foreground">Required</span>
                            </label>
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={question.photo_required}
                                onChange={(e) => handleQuestionChange(group.id, question.id, 'photo_required', e.target.checked)}
                                disabled={isViewMode}
                                className="w-4 h-4 text-primary"
                              />
                              <span className="text-sm text-foreground">Photo Required</span>
                            </label>
                          </div>
                          <FormInput
                            label="Help Text"
                            name={`help_text_${question.id}`}
                            value={question.help_text}
                            onChange={(e) => handleQuestionChange(group.id, question.id, 'help_text', e.target.value)}
                            placeholder="Enter help text (optional)"
                            disabled={isViewMode}
                            className="col-span-3"
                          />
                          {formData.test_mode && (
                            <FormInput
                              label="Weightage"
                              name={`weightage_${question.id}`}
                              type="number"
                              value={question.weightage}
                              onChange={(e) => handleQuestionChange(group.id, question.id, 'weightage', parseFloat(e.target.value) || 0)}
                              placeholder="Enter weightage"
                              disabled={isViewMode}
                            />
                          )}

                          {/* Options for dropdown/checkbox */}
                          {(question.type === 'dropdown' || question.type === 'checkbox') && (
                            <div className="col-span-3">
                              <div className="flex justify-between items-center mb-2">
                                <label className="text-sm text-muted-foreground">Options</label>
                                {!isViewMode && (
                                  <button
                                    type="button"
                                    onClick={() => handleAddOption(group.id, question.id)}
                                    className="flex items-center gap-1 px-2 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90"
                                  >
                                    <Plus className="w-3 h-3" />
                                    Add Option
                                  </button>
                                )}
                              </div>
                              <div className="space-y-2">
                                {question.options.map((option, optIndex) => (
                                  <div key={optIndex} className="flex gap-2">
                                    <input
                                      type="text"
                                      value={option}
                                      onChange={(e) => handleOptionChange(group.id, question.id, optIndex, e.target.value)}
                                      placeholder="Enter option"
                                      disabled={isViewMode}
                                      className="flex-1 px-3 py-2 border border-border rounded-lg bg-background text-foreground disabled:opacity-50"
                                    />
                                    {!isViewMode && (
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveOption(group.id, question.id, optIndex)}
                                        className="p-2 hover:bg-destructive/10 rounded text-destructive"
                                      >
                                        <X className="w-4 h-4" />
                                      </button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </FormGrid>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </FormSection>

        {/* Section 3: Test/Assessment Settings */}
        <FormSection title="TEST/ASSESSMENT SETTINGS" icon={ClipboardList}>
          <div className="space-y-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="test_mode"
                checked={formData.test_mode}
                onChange={handleChange}
                disabled={isViewMode}
                className="w-4 h-4 text-primary"
              />
              <span className="text-sm font-medium text-foreground">Enable Test Mode</span>
            </label>

            {formData.test_mode && (
              <FormGrid columns={3}>
                <FormInput
                  label="Passing Score"
                  name="passing_score"
                  type="number"
                  value={formData.passing_score}
                  onChange={handleChange}
                  required
                  placeholder="Enter passing score (%)"
                  disabled={isViewMode}
                />
                <FormInput
                  label="Time Limit (minutes)"
                  name="time_limit"
                  type="number"
                  value={formData.time_limit}
                  onChange={handleChange}
                  placeholder="Enter time limit (optional)"
                  disabled={isViewMode}
                />
                <div className="flex items-end">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="randomize_questions"
                      checked={formData.randomize_questions}
                      onChange={handleChange}
                      disabled={isViewMode}
                      className="w-4 h-4 text-primary"
                    />
                    <span className="text-sm text-foreground">Randomize Questions</span>
                  </label>
                </div>
              </FormGrid>
            )}
          </div>
        </FormSection>

        {!isViewMode && (
          <div className="flex justify-center gap-4 pb-6">
            <button
              type="submit"
              className="px-8 py-3 bg-error text-error-foreground rounded-lg hover:bg-error/90 transition-colors text-sm font-medium uppercase"
            >
              {isEditMode ? 'Update' : 'Submit'}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-8 py-3 border border-error text-error rounded-lg hover:bg-error/10 transition-colors text-sm font-medium uppercase"
            >
              Cancel
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default CreateSafetyChecklist;