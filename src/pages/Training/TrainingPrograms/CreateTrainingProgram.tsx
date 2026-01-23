import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Upload, Plus, X, Link as LinkIcon, FileText, BookOpen, Users, Award } from 'lucide-react';
import FormSection from '../../../components/ui/FormSection';
import FormInput from '../../../components/ui/FormInput';
import FormGrid from '../../../components/ui/FormGrid';

interface Module {
  id: string;
  module_name: string;
  description: string;
}

interface Material {
  id: string;
  type: 'Document' | 'Video' | 'Link';
  title: string;
  url?: string;
  file?: File | string;
}

interface TargetAudience {
  id: string;
  role: string;
  department: string;
}

const CreateTrainingProgram: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = window.location.pathname;
  const isEditMode = location.includes('/edit');
  const isViewMode = Boolean(id && !isEditMode);
  
  const [formData, setFormData] = useState({
    training_name: '',
    category: '',
    description: '',
    duration: '',
    duration_unit: 'hours',
    training_type: '',
    instructor: '',
    include_test: false,
    passing_score: '',
    certificate_on_completion: false,
    max_participants: '',
    enrollment_start_date: '',
    enrollment_end_date: '',
    status: 'Draft',
  });

  const [modules, setModules] = useState<Module[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [targetAudience, setTargetAudience] = useState<TargetAudience[]>([]);
  const [prerequisites, setPrerequisites] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAddModule = () => {
    const newModule: Module = {
      id: Date.now().toString(),
      module_name: '',
      description: '',
    };
    setModules(prev => [...prev, newModule]);
  };

  const handleModuleChange = (id: string, field: keyof Module, value: string) => {
    setModules(prev => prev.map(module => {
      if (module.id === id) {
        return { ...module, [field]: value };
      }
      return module;
    }));
  };

  const handleRemoveModule = (id: string) => {
    setModules(prev => prev.filter(module => module.id !== id));
  };

  const handleAddMaterial = () => {
    const newMaterial: Material = {
      id: Date.now().toString(),
      type: 'Document',
      title: '',
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

  const handleAddTargetAudience = () => {
    const newAudience: TargetAudience = {
      id: Date.now().toString(),
      role: '',
      department: '',
    };
    setTargetAudience(prev => [...prev, newAudience]);
  };

  const handleTargetAudienceChange = (id: string, field: keyof TargetAudience, value: string) => {
    setTargetAudience(prev => prev.map(audience => {
      if (audience.id === id) {
        return { ...audience, [field]: value };
      }
      return audience;
    }));
  };

  const handleRemoveTargetAudience = (id: string) => {
    setTargetAudience(prev => prev.filter(audience => audience.id !== id));
  };

  const handleAttachmentUpload = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files);
    setAttachments(prev => [...prev, ...newFiles]);
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    if (id) {
      // TODO: Fetch data when in view/edit mode
      // const fetchTrainingProgram = async () => {
      //   const response = await getTrainingProgramById(id);
      //   setFormData(response.data);
      //   setModules(response.data.modules || []);
      //   setMaterials(response.data.materials || []);
      //   setTargetAudience(response.data.target_audience || []);
      //   setPrerequisites(response.data.prerequisites || '');
      // };
      // fetchTrainingProgram();
    }
  }, [id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Integrate API when ready
    console.log('Form Data:', formData);
    console.log('Modules:', modules);
    console.log('Materials:', materials);
    console.log('Target Audience:', targetAudience);
    console.log('Prerequisites:', prerequisites);
    console.log('Attachments:', attachments);
    // navigate('/training/module/training-programs');
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
                {isViewMode ? 'VIEW TRAINING PROGRAM' : isEditMode ? 'EDIT TRAINING PROGRAM' : 'CREATE TRAINING PROGRAM'}
              </h1>
            </div>
          </div>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Section 1: Basic Info */}
        <FormSection title="BASIC INFORMATION" icon={BookOpen}>
          <FormGrid columns={3}>
            <FormInput
              label="Training Name"
              name="training_name"
              value={formData.training_name}
              onChange={handleChange}
              required
              placeholder="Enter Training Name"
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
                { value: 'Safety Training', label: 'Safety Training' },
                { value: 'Technical Training', label: 'Technical Training' },
                { value: 'Compliance Training', label: 'Compliance Training' },
                { value: 'Soft Skills', label: 'Soft Skills' },
                { value: 'Management Training', label: 'Management Training' },
                { value: 'Other', label: 'Other' },
              ]}
              disabled={isViewMode}
            />
            <FormInput
              label="Training Type"
              name="training_type"
              type="select"
              value={formData.training_type}
              onChange={handleChange}
              required
              placeholder="Select Training Type"
              options={[
                { value: 'Online', label: 'Online' },
                { value: 'Classroom', label: 'Classroom' },
                { value: 'Hybrid', label: 'Hybrid' },
              ]}
              disabled={isViewMode}
            />
            <FormInput
              label="Duration"
              name="duration"
              type="number"
              value={formData.duration}
              onChange={handleChange}
              placeholder="Enter Duration"
              disabled={isViewMode}
            />
            <FormInput
              label="Duration Unit"
              name="duration_unit"
              type="select"
              value={formData.duration_unit}
              onChange={handleChange}
              options={[
                { value: 'hours', label: 'Hours' },
                { value: 'days', label: 'Days' },
                { value: 'weeks', label: 'Weeks' },
              ]}
              disabled={isViewMode}
            />
            <FormInput
              label="Instructor/Provider"
              name="instructor"
              value={formData.instructor}
              onChange={handleChange}
              placeholder="Enter Instructor/Provider"
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
                { value: 'Draft', label: 'Draft' },
                { value: 'Archived', label: 'Archived' },
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

        {/* Section 2: Content */}
        <FormSection title="CONTENT" icon={FileText}>
          {/* Modules/Sections */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold text-foreground">Modules/Sections</h3>
              {!isViewMode && (
                <button
                  type="button"
                  onClick={handleAddModule}
                  className="flex items-center gap-2 px-4 py-2 bg-error text-error-foreground rounded-lg hover:bg-error/90 transition-colors text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Add Module
                </button>
              )}
            </div>
            {modules.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Click "Add Module" to add modules/sections
              </div>
            ) : (
              <div className="space-y-4">
                {modules.map((module, index) => (
                  <div key={module.id} className="border border-border rounded-lg p-4 bg-secondary/30">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-sm font-semibold text-foreground">Module {index + 1}</h3>
                      {!isViewMode && (
                        <button
                          type="button"
                          onClick={() => handleRemoveModule(module.id)}
                          className="p-1 hover:bg-destructive/10 rounded text-destructive"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <FormGrid columns={1}>
                      <FormInput
                        label="Module Name"
                        name={`module_name_${module.id}`}
                        value={module.module_name}
                        onChange={(e) => handleModuleChange(module.id, 'module_name', e.target.value)}
                        required
                        placeholder="Enter Module Name"
                        disabled={isViewMode}
                      />
                      <FormInput
                        label="Description"
                        name={`module_description_${module.id}`}
                        type="textarea"
                        value={module.description}
                        onChange={(e) => handleModuleChange(module.id, 'description', e.target.value)}
                        placeholder="Enter Description"
                        rows={2}
                        disabled={isViewMode}
                      />
                    </FormGrid>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Materials */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold text-foreground">Materials</h3>
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
                Click "Add Material" to add documents, videos, or links
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
                          { value: 'Video', label: 'Video' },
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
                          accept={material.type === 'Document' ? '.pdf,.doc,.docx' : 'video/*'}
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
          </div>

          {/* Attachments */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">Attachments</h3>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
              <Upload className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">
                Drag & Drop or Click to Upload Attachments
              </p>
              {!isViewMode && (
                <>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                    onChange={(e) => handleAttachmentUpload(e.target.files)}
                    className="hidden"
                    id="attachment-upload"
                  />
                  <label
                    htmlFor="attachment-upload"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg cursor-pointer hover:bg-primary/90 transition-colors text-sm font-medium"
                  >
                    <Upload className="w-4 h-4" />
                    Choose Files
                  </label>
                </>
              )}
            </div>
            {attachments.length > 0 && (
              <div className="mt-4 space-y-2">
                {attachments.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">{file.name}</span>
                    </div>
                    {!isViewMode && (
                      <button
                        type="button"
                        onClick={() => handleRemoveAttachment(index)}
                        className="p-1 hover:bg-destructive/10 rounded text-destructive"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </FormSection>

        {/* Section 3: Enrollment */}
        <FormSection title="ENROLLMENT" icon={Users}>
          <FormGrid columns={2}>
            <FormInput
              label="Max Participants"
              name="max_participants"
              type="number"
              value={formData.max_participants}
              onChange={handleChange}
              placeholder="Enter Max Participants"
              disabled={isViewMode}
            />
            <FormInput
              label="Enrollment Start Date"
              name="enrollment_start_date"
              type="date"
              value={formData.enrollment_start_date}
              onChange={handleChange}
              placeholder="dd-mm-yyyy"
              disabled={isViewMode}
            />
            <FormInput
              label="Enrollment End Date"
              name="enrollment_end_date"
              type="date"
              value={formData.enrollment_end_date}
              onChange={handleChange}
              placeholder="dd-mm-yyyy"
              disabled={isViewMode}
            />
          </FormGrid>
          
          {/* Target Audience */}
          <div className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold text-foreground">Target Audience (Roles/Departments)</h3>
              {!isViewMode && (
                <button
                  type="button"
                  onClick={handleAddTargetAudience}
                  className="flex items-center gap-2 px-4 py-2 bg-error text-error-foreground rounded-lg hover:bg-error/90 transition-colors text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Add Target Audience
                </button>
              )}
            </div>
            {targetAudience.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Click "Add Target Audience" to add roles/departments
              </div>
            ) : (
              <div className="space-y-4">
                {targetAudience.map((audience, index) => (
                  <div key={audience.id} className="border border-border rounded-lg p-4 bg-secondary/30">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-sm font-semibold text-foreground">Audience {index + 1}</h3>
                      {!isViewMode && (
                        <button
                          type="button"
                          onClick={() => handleRemoveTargetAudience(audience.id)}
                          className="p-1 hover:bg-destructive/10 rounded text-destructive"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <FormGrid columns={2}>
                      <FormInput
                        label="Role"
                        name={`audience_role_${audience.id}`}
                        value={audience.role}
                        onChange={(e) => handleTargetAudienceChange(audience.id, 'role', e.target.value)}
                        placeholder="Enter Role"
                        disabled={isViewMode}
                      />
                      <FormInput
                        label="Department"
                        name={`audience_department_${audience.id}`}
                        value={audience.department}
                        onChange={(e) => handleTargetAudienceChange(audience.id, 'department', e.target.value)}
                        placeholder="Enter Department"
                        disabled={isViewMode}
                      />
                    </FormGrid>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Prerequisites */}
          <div className="mt-6">
            <FormInput
              label="Prerequisites"
              name="prerequisites"
              type="textarea"
              value={prerequisites}
              onChange={(e) => setPrerequisites(e.target.value)}
              placeholder="Enter prerequisites"
              rows={3}
              disabled={isViewMode}
            />
          </div>
        </FormSection>

        {/* Section 4: Assessment */}
        <FormSection title="ASSESSMENT" icon={Award}>
          <div className="space-y-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="include_test"
                checked={formData.include_test}
                onChange={handleChange}
                disabled={isViewMode}
                className="w-4 h-4 text-primary"
              />
              <span className="text-sm text-foreground">Include test/quiz</span>
            </label>

            {formData.include_test && (
              <FormGrid columns={2}>
                <FormInput
                  label="Passing Score (%)"
                  name="passing_score"
                  type="number"
                  value={formData.passing_score}
                  onChange={handleChange}
                  placeholder="Enter Passing Score"
                  disabled={isViewMode}
                />
              </FormGrid>
            )}

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="certificate_on_completion"
                checked={formData.certificate_on_completion}
                onChange={handleChange}
                disabled={isViewMode}
                className="w-4 h-4 text-primary"
              />
              <span className="text-sm text-foreground">Certificate on completion</span>
            </label>
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

export default CreateTrainingProgram;
