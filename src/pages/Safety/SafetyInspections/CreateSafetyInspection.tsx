import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Upload, Plus, X, PenTool } from 'lucide-react';
import FormSection from '../../../components/ui/FormSection';
import FormInput from '../../../components/ui/FormInput';
import FormGrid from '../../../components/ui/FormGrid';
import { ClipboardCheck, FileText, AlertTriangle, CheckCircle } from 'lucide-react';

interface CorrectiveAction {
  id: string;
  action_description: string;
  assigned_to: string;
  due_date: string;
  status: 'Pending' | 'In Progress' | 'Completed';
}

const CreateSafetyInspection: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = window.location.pathname;
  const isEditMode = location.includes('/edit');
  const isViewMode = Boolean(id && !isEditMode);
  
  const [formData, setFormData] = useState({
    safety_measure_id: '',
    inspector_name: '',
    inspection_date: '',
    notes: '',
    findings: '',
    approval_status: 'Pending',
    comments: '',
  });

  const [checklistResponses, setChecklistResponses] = useState<any[]>([]);
  const [correctiveActions, setCorrectiveActions] = useState<CorrectiveAction[]>([]);
  const [photos, setPhotos] = useState<File[]>([]);
  const [signature, setSignature] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddCorrectiveAction = () => {
    const newAction: CorrectiveAction = {
      id: Date.now().toString(),
      action_description: '',
      assigned_to: '',
      due_date: '',
      status: 'Pending',
    };
    setCorrectiveActions(prev => [...prev, newAction]);
  };

  const handleCorrectiveActionChange = (id: string, field: keyof CorrectiveAction, value: string) => {
    setCorrectiveActions(prev => prev.map(action => 
      action.id === id ? { ...action, [field]: value } : action
    ));
  };

  const handleRemoveCorrectiveAction = (id: string) => {
    setCorrectiveActions(prev => prev.filter(action => action.id !== id));
  };

  useEffect(() => {
    if (formData.safety_measure_id) {
      // TODO: Load associated checklist from safety measure
      // const fetchSafetyMeasure = async () => {
      //   const response = await getSafetyMeasureById(formData.safety_measure_id);
      //   // Load checklist and initialize responses
      // };
      // fetchSafetyMeasure();
    }
  }, [formData.safety_measure_id]);

  useEffect(() => {
    if (id) {
      // TODO: Fetch inspection data
      // const fetchInspection = async () => {
      //   const response = await getSafetyInspectionById(id);
      //   setFormData(response.data);
      //   setChecklistResponses(response.data.checklist_responses || []);
      //   setCorrectiveActions(response.data.corrective_actions || []);
      // };
      // fetchInspection();
    }
  }, [id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Integrate API when ready
    console.log('Form Data:', formData);
    console.log('Checklist Responses:', checklistResponses);
    console.log('Corrective Actions:', correctiveActions);
    console.log('Photos:', photos);
    console.log('Signature:', signature);
    // navigate('/safety/module/safety-inspections');
  };

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
                {isViewMode ? 'VIEW SAFETY INSPECTION' : isEditMode ? 'EDIT SAFETY INSPECTION' : 'CREATE SAFETY INSPECTION'}
              </h1>
            </div>
          </div>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Section 1: Inspection Details */}
        <FormSection title="INSPECTION DETAILS" icon={ClipboardCheck}>
          <FormGrid columns={3}>
            <FormInput
              label="Safety Measure"
              name="safety_measure_id"
              type="select"
              value={formData.safety_measure_id}
              onChange={handleChange}
              required
              placeholder="Select Safety Measure"
              options={[]} // TODO: Populate from API
              disabled={isViewMode}
            />
            <FormInput
              label="Inspector Name"
              name="inspector_name"
              type="select"
              value={formData.inspector_name}
              onChange={handleChange}
              required
              placeholder="Select Inspector"
              options={[]} // TODO: Populate from API
              disabled={isViewMode}
            />
            <FormInput
              label="Inspection Date"
              name="inspection_date"
              type="date"
              value={formData.inspection_date}
              onChange={handleChange}
              required
              placeholder="dd-mm-yyyy"
              disabled={isViewMode}
            />
          </FormGrid>
          <div className="mt-4">
            <FormInput
              label="Notes/Comments"
              name="notes"
              type="textarea"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Enter notes or comments"
              rows={4}
              disabled={isViewMode}
            />
          </div>
        </FormSection>

        {/* Section 2: Checklist Execution */}
        {formData.safety_measure_id && (
          <FormSection title="CHECKLIST EXECUTION" icon={ClipboardCheck}>
            <div className="bg-muted/30 border border-border rounded-lg p-4 mb-4">
              <p className="text-sm text-muted-foreground">
                Checklist will be loaded from the selected Safety Measure. 
                {!isViewMode && ' Answer the questions and upload required photos.'}
              </p>
            </div>
            {checklistResponses.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {isViewMode 
                  ? 'No checklist responses available'
                  : 'Select a Safety Measure to load its checklist'
                }
              </div>
            ) : (
              <div className="space-y-4">
                {/* Checklist questions will be rendered here */}
                <p className="text-sm text-muted-foreground">
                  Checklist questions will be displayed here based on the selected Safety Measure
                </p>
              </div>
            )}
          </FormSection>
        )}

        {/* Section 3: Findings */}
        <FormSection title="FINDINGS" icon={AlertTriangle}>
          <div className="mb-4">
            <FormInput
              label="Findings"
              name="findings"
              type="textarea"
              value={formData.findings}
              onChange={handleChange}
              placeholder="Enter inspection findings"
              rows={6}
              disabled={isViewMode}
            />
          </div>
        </FormSection>

        {/* Section 4: Corrective Actions */}
        <FormSection title="CORRECTIVE ACTIONS" icon={CheckCircle}>
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm text-muted-foreground">
              {correctiveActions.length > 0 && `Total Actions: ${correctiveActions.length}`}
            </div>
            {!isViewMode && (
              <button
                type="button"
                onClick={handleAddCorrectiveAction}
                className="flex items-center gap-2 px-4 py-2 bg-error text-error-foreground rounded-lg hover:bg-error/90 transition-colors text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                Add Corrective Action
              </button>
            )}
          </div>

          {correctiveActions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Click "Add Corrective Action" to add corrective actions
            </div>
          ) : (
            <div className="space-y-4">
              {correctiveActions.map((action, index) => (
                <div key={action.id} className="border border-border rounded-lg p-4 bg-secondary/30">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-semibold text-foreground">Action {index + 1}</h3>
                    {!isViewMode && (
                      <button
                        type="button"
                        onClick={() => handleRemoveCorrectiveAction(action.id)}
                        className="p-1 hover:bg-destructive/10 rounded text-destructive"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <FormGrid columns={3}>
                    <FormInput
                      label="Action Description"
                      name={`action_desc_${action.id}`}
                      type="textarea"
                      value={action.action_description}
                      onChange={(e) => handleCorrectiveActionChange(action.id, 'action_description', e.target.value)}
                      required
                      placeholder="Enter action description"
                      rows={3}
                      disabled={isViewMode}
                      className="col-span-3"
                    />
                    <FormInput
                      label="Assigned To"
                      name={`assigned_to_${action.id}`}
                      type="select"
                      value={action.assigned_to}
                      onChange={(e) => handleCorrectiveActionChange(action.id, 'assigned_to', e.target.value)}
                      required
                      placeholder="Select User"
                      options={[]} // TODO: Populate from API
                      disabled={isViewMode}
                    />
                    <FormInput
                      label="Due Date"
                      name={`due_date_${action.id}`}
                      type="date"
                      value={action.due_date}
                      onChange={(e) => handleCorrectiveActionChange(action.id, 'due_date', e.target.value)}
                      required
                      placeholder="dd-mm-yyyy"
                      disabled={isViewMode}
                    />
                    <FormInput
                      label="Status"
                      name={`status_${action.id}`}
                      type="select"
                      value={action.status}
                      onChange={(e) => handleCorrectiveActionChange(action.id, 'status', e.target.value as CorrectiveAction['status'])}
                      options={[
                        { value: 'Pending', label: 'Pending' },
                        { value: 'In Progress', label: 'In Progress' },
                        { value: 'Completed', label: 'Completed' },
                      ]}
                      disabled={isViewMode}
                    />
                  </FormGrid>
                </div>
              ))}
            </div>
          )}
        </FormSection>

        {/* Section 5: Photos */}
        <FormSection title="PHOTOS" icon={Upload}>
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
            <Upload className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-2">
              Drag & Drop or Click to Upload Photos
            </p>
            {!isViewMode && (
              <>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files) {
                      setPhotos(prev => [...prev, ...Array.from(e.target.files || [])]);
                    }
                  }}
                  className="hidden"
                  id="photo-upload"
                />
                <label
                  htmlFor="photo-upload"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg cursor-pointer hover:bg-primary/90 transition-colors text-sm font-medium"
                >
                  <Upload className="w-4 h-4" />
                  Choose Photos
                </label>
              </>
            )}
          </div>
          {photos.length > 0 && (
            <div className="mt-4 grid grid-cols-4 gap-4">
              {photos.map((photo, index) => (
                <div key={index} className="relative">
                  <img
                    src={URL.createObjectURL(photo)}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border border-border"
                  />
                  {!isViewMode && (
                    <button
                      type="button"
                      onClick={() => setPhotos(prev => prev.filter((_, i) => i !== index))}
                      className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </FormSection>

        {/* Section 6: Sign-off */}
        {!isViewMode && (
          <FormSection title="SIGN-OFF" icon={PenTool}>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Inspector Signature</label>
                <div className="border border-border rounded-lg p-4 bg-background h-32 flex items-center justify-center">
                  {signature ? (
                    <img src={signature} alt="Signature" className="max-h-full" />
                  ) : (
                    <p className="text-sm text-muted-foreground">Signature pad will be implemented here</p>
                  )}
                </div>
              </div>
              <FormInput
                label="Approval Status"
                name="approval_status"
                type="select"
                value={formData.approval_status}
                onChange={handleChange}
                options={[
                  { value: 'Pending', label: 'Pending' },
                  { value: 'Approved', label: 'Approved' },
                  { value: 'Rejected', label: 'Rejected' },
                ]}
              />
              <FormInput
                label="Comments"
                name="comments"
                type="textarea"
                value={formData.comments}
                onChange={handleChange}
                placeholder="Enter additional comments"
                rows={3}
              />
            </div>
          </FormSection>
        )}

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

export default CreateSafetyInspection;