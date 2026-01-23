import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Upload, Plus, X, FileText, Calendar, Users, MessageSquare } from 'lucide-react';
import FormSection from '../../../components/ui/FormSection';
import FormInput from '../../../components/ui/FormInput';
import FormGrid from '../../../components/ui/FormGrid';

interface Attendee {
  id: string;
  name: string;
  email: string;
  attendance_status: 'Present' | 'Absent' | 'Pending';
}

interface Material {
  id: string;
  title: string;
  type: 'Document' | 'Link';
  url?: string;
  file?: File | string;
}

interface Feedback {
  id: string;
  question: string;
  response?: string;
}

const CreateTrainingSession: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = window.location.pathname;
  const isEditMode = location.includes('/edit');
  const isViewMode = Boolean(id && !isEditMode);
  
  const [formData, setFormData] = useState({
    session_name: '',
    training_program: '',
    date_time: '',
    location: '',
    instructor: '',
    max_capacity: '',
    status: 'Scheduled',
  });

  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddAttendee = () => {
    const newAttendee: Attendee = {
      id: Date.now().toString(),
      name: '',
      email: '',
      attendance_status: 'Pending',
    };
    setAttendees(prev => [...prev, newAttendee]);
  };

  const handleAttendeeChange = (id: string, field: keyof Attendee, value: string) => {
    setAttendees(prev => prev.map(attendee => {
      if (attendee.id === id) {
        return { ...attendee, [field]: value };
      }
      return attendee;
    }));
  };

  const handleRemoveAttendee = (id: string) => {
    setAttendees(prev => prev.filter(attendee => attendee.id !== id));
  };

  const handleAddMaterial = () => {
    const newMaterial: Material = {
      id: Date.now().toString(),
      title: '',
      type: 'Document',
    };
    setMaterials(prev => [...prev, newMaterial]);
  };

  const handleMaterialChange = (id: string, field: keyof Material, value: string | File) => {
    setMaterials(prev => prev.map(material => {
      if (material.id === id) {
        return { ...material, [field]: value };
      }
      return material;
    }));
  };

  const handleRemoveMaterial = (id: string) => {
    setMaterials(prev => prev.filter(material => material.id !== id));
  };

  const handleAddFeedback = () => {
    const newFeedback: Feedback = {
      id: Date.now().toString(),
      question: '',
    };
    setFeedback(prev => [...prev, newFeedback]);
  };

  const handleFeedbackChange = (id: string, field: keyof Feedback, value: string) => {
    setFeedback(prev => prev.map(fb => {
      if (fb.id === id) {
        return { ...fb, [field]: value };
      }
      return fb;
    }));
  };

  const handleRemoveFeedback = (id: string) => {
    setFeedback(prev => prev.filter(fb => fb.id !== id));
  };

  useEffect(() => {
    if (id) {
      // TODO: Fetch data when in view/edit mode
      // const fetchTrainingSession = async () => {
      //   const response = await getTrainingSessionById(id);
      //   setFormData(response.data);
      //   setAttendees(response.data.attendees || []);
      //   setMaterials(response.data.materials || []);
      //   setFeedback(response.data.feedback || []);
      // };
      // fetchTrainingSession();
    }
  }, [id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Integrate API when ready
    console.log('Form Data:', formData);
    console.log('Attendees:', attendees);
    console.log('Materials:', materials);
    console.log('Feedback:', feedback);
    // navigate('/training/module/training-sessions');
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
                {isViewMode ? 'VIEW TRAINING SESSION' : isEditMode ? 'EDIT TRAINING SESSION' : 'CREATE TRAINING SESSION'}
              </h1>
            </div>
          </div>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Section 1: Session Info */}
        <FormSection title="SESSION INFORMATION" icon={Calendar}>
          <FormGrid columns={3}>
            <FormInput
              label="Session Name"
              name="session_name"
              value={formData.session_name}
              onChange={handleChange}
              required
              placeholder="Enter Session Name"
              disabled={isViewMode}
            />
            <FormInput
              label="Training Program"
              name="training_program"
              type="select"
              value={formData.training_program}
              onChange={handleChange}
              required
              placeholder="Select Training Program"
              options={[]} // TODO: Populate from Training Programs API
              disabled={isViewMode}
            />
            <FormInput
              label="Date & Time"
              name="date_time"
              type="datetime-local"
              value={formData.date_time}
              onChange={handleChange}
              required
              placeholder="Select Date & Time"
              disabled={isViewMode}
            />
            <FormInput
              label="Location/Venue"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Enter Location/Venue"
              disabled={isViewMode}
            />
            <FormInput
              label="Instructor"
              name="instructor"
              value={formData.instructor}
              onChange={handleChange}
              placeholder="Enter Instructor"
              disabled={isViewMode}
            />
            <FormInput
              label="Max Capacity"
              name="max_capacity"
              type="number"
              value={formData.max_capacity}
              onChange={handleChange}
              placeholder="Enter Max Capacity"
              disabled={isViewMode}
            />
            <FormInput
              label="Status"
              name="status"
              type="select"
              value={formData.status}
              onChange={handleChange}
              options={[
                { value: 'Scheduled', label: 'Scheduled' },
                { value: 'Ongoing', label: 'Ongoing' },
                { value: 'Completed', label: 'Completed' },
                { value: 'Cancelled', label: 'Cancelled' },
              ]}
              disabled={isViewMode}
            />
          </FormGrid>
        </FormSection>

        {/* Section 2: Attendees List */}
        <FormSection title="ATTENDEES LIST" icon={Users}>
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm text-muted-foreground">
              {attendees.length > 0 && `Total Attendees: ${attendees.length}`}
            </div>
            {!isViewMode && (
              <button
                type="button"
                onClick={handleAddAttendee}
                className="flex items-center gap-2 px-4 py-2 bg-error text-error-foreground rounded-lg hover:bg-error/90 transition-colors text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                Add Attendee
              </button>
            )}
          </div>
          {attendees.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Click "Add Attendee" to add attendees
            </div>
          ) : (
            <div className="space-y-4">
              {attendees.map((attendee, index) => (
                <div key={attendee.id} className="border border-border rounded-lg p-4 bg-secondary/30">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-semibold text-foreground">Attendee {index + 1}</h3>
                    {!isViewMode && (
                      <button
                        type="button"
                        onClick={() => handleRemoveAttendee(attendee.id)}
                        className="p-1 hover:bg-destructive/10 rounded text-destructive"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <FormGrid columns={3}>
                    <FormInput
                      label="Name"
                      name={`attendee_name_${attendee.id}`}
                      value={attendee.name}
                      onChange={(e) => handleAttendeeChange(attendee.id, 'name', e.target.value)}
                      required
                      placeholder="Enter Name"
                      disabled={isViewMode}
                    />
                    <FormInput
                      label="Email"
                      name={`attendee_email_${attendee.id}`}
                      type="email"
                      value={attendee.email}
                      onChange={(e) => handleAttendeeChange(attendee.id, 'email', e.target.value)}
                      required
                      placeholder="Enter Email"
                      disabled={isViewMode}
                    />
                    <FormInput
                      label="Attendance Status"
                      name={`attendance_status_${attendee.id}`}
                      type="select"
                      value={attendee.attendance_status}
                      onChange={(e) => handleAttendeeChange(attendee.id, 'attendance_status', e.target.value as Attendee['attendance_status'])}
                      options={[
                        { value: 'Present', label: 'Present' },
                        { value: 'Absent', label: 'Absent' },
                        { value: 'Pending', label: 'Pending' },
                      ]}
                      disabled={isViewMode}
                    />
                  </FormGrid>
                </div>
              ))}
            </div>
          )}
        </FormSection>

        {/* Section 3: Materials/Resources */}
        <FormSection title="MATERIALS/RESOURCES" icon={FileText}>
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm text-muted-foreground">
              {materials.length > 0 && `Total Materials: ${materials.length}`}
            </div>
            {!isViewMode && (
              <button
                type="button"
                onClick={handleAddMaterial}
                className="flex items-center gap-2 px-4 py-2 bg-error text-error-foreground rounded-lg hover:bg-error/90 transition-colors text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                Add Material
              </button>
            )}
          </div>
          {materials.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Click "Add Material" to add materials/resources
            </div>
          ) : (
            <div className="space-y-4">
              {materials.map((material, index) => (
                <div key={material.id} className="border border-border rounded-lg p-4 bg-secondary/30">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-semibold text-foreground">Material {index + 1}</h3>
                    {!isViewMode && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMaterial(material.id)}
                        className="p-1 hover:bg-destructive/10 rounded text-destructive"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <FormGrid columns={2}>
                    <FormInput
                      label="Type"
                      name={`material_type_${material.id}`}
                      type="select"
                      value={material.type}
                      onChange={(e) => handleMaterialChange(material.id, 'type', e.target.value as Material['type'])}
                      options={[
                        { value: 'Document', label: 'Document' },
                        { value: 'Link', label: 'Link' },
                      ]}
                      disabled={isViewMode}
                    />
                    <FormInput
                      label="Title"
                      name={`material_title_${material.id}`}
                      value={material.title}
                      onChange={(e) => handleMaterialChange(material.id, 'title', e.target.value)}
                      required
                      placeholder="Enter Title"
                      disabled={isViewMode}
                    />
                    {material.type === 'Link' ? (
                      <FormInput
                        label="URL"
                        name={`material_url_${material.id}`}
                        value={material.url || ''}
                        onChange={(e) => handleMaterialChange(material.id, 'url', e.target.value)}
                        placeholder="Enter URL"
                        disabled={isViewMode}
                        className="col-span-2"
                      />
                    ) : (
                      <FormInput
                        label="File"
                        name={`material_file_${material.id}`}
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            handleMaterialChange(material.id, 'file', e.target.files[0]);
                          }
                        }}
                        disabled={isViewMode}
                        className="col-span-2"
                      />
                    )}
                  </FormGrid>
                </div>
              ))}
            </div>
          )}
        </FormSection>

        {/* Section 4: Feedback Collection */}
        <FormSection title="FEEDBACK COLLECTION" icon={MessageSquare}>
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm text-muted-foreground">
              {feedback.length > 0 && `Total Questions: ${feedback.length}`}
            </div>
            {!isViewMode && (
              <button
                type="button"
                onClick={handleAddFeedback}
                className="flex items-center gap-2 px-4 py-2 bg-error text-error-foreground rounded-lg hover:bg-error/90 transition-colors text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                Add Feedback Question
              </button>
            )}
          </div>
          {feedback.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Click "Add Feedback Question" to add feedback questions
            </div>
          ) : (
            <div className="space-y-4">
              {feedback.map((fb, index) => (
                <div key={fb.id} className="border border-border rounded-lg p-4 bg-secondary/30">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-semibold text-foreground">Question {index + 1}</h3>
                    {!isViewMode && (
                      <button
                        type="button"
                        onClick={() => handleRemoveFeedback(fb.id)}
                        className="p-1 hover:bg-destructive/10 rounded text-destructive"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <FormGrid columns={1}>
                    <FormInput
                      label="Question"
                      name={`feedback_question_${fb.id}`}
                      value={fb.question}
                      onChange={(e) => handleFeedbackChange(fb.id, 'question', e.target.value)}
                      required
                      placeholder="Enter Question"
                      disabled={isViewMode}
                    />
                    {isViewMode && fb.response && (
                      <FormInput
                        label="Response"
                        name={`feedback_response_${fb.id}`}
                        type="textarea"
                        value={fb.response}
                        onChange={(e) => handleFeedbackChange(fb.id, 'response', e.target.value)}
                        placeholder="Response will be collected during session"
                        rows={2}
                        disabled={true}
                      />
                    )}
                  </FormGrid>
                </div>
              ))}
            </div>
          )}
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

export default CreateTrainingSession;
