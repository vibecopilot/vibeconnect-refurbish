import { useState, useEffect } from "react";
import Breadcrumb from "../../../components/ui/Breadcrumb";
import { Link } from "react-router-dom";
import { Search, Filter, Lock, FileText, Loader2, AlertTriangle } from "lucide-react";
import { getSurveys } from "../../../api";
import toast from "react-hot-toast";

interface Template {
  id: number;
  survey_title: string;
  description: string;
  survey_questions: any[];
  created_at: string;
  is_premium?: boolean;
  category?: string;
  image_url?: string;
}

function CreateTemplateSurvey() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFreeOnly, setShowFreeOnly] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Static categories (can be made dynamic later if backend supports)
  const categories = [
    { id: "team", label: "Team templates", count: 0 },
    { id: "popular", label: "Most Popular", count: 0 },
    { id: "forms", label: "Forms", count: 0 },
    { id: "events", label: "Events", count: 0 },
    { id: "humanResources", label: "Human Resources", count: 0 },
    { id: "customerFeedback", label: "Customer Feedback", count: 0 },
    { id: "generalBusiness", label: "General Business", count: 0 },
    { id: "satisfaction", label: "Satisfaction", count: 0 },
    { id: "marketing", label: "Marketing", count: 0 },
    { id: "education", label: "Education", count: 0 },
  ];

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const response = await getSurveys();
      const surveysData = Array.isArray(response.data) ? response.data :
                         Array.isArray(response.data.survey) ? response.data.survey :
                         Array.isArray(response.data.surveys) ? response.data.surveys : [];

      // For now, use all surveys as templates
      // In future: filter by is_template flag
      // const templatesData = surveysData.filter((s: any) => s.is_template === true);

      setTemplates(surveysData);
    } catch (error) {
      console.error("Error fetching templates:", error);
      setError("Failed to load templates");
      toast.error("Failed to load templates");
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  // Filter templates based on search and filters
  const filteredTemplates = templates.filter((template) => {
    const matchesSearch = !searchQuery ||
      (template.survey_title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (template.description || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFree = !showFreeOnly || !template.is_premium;

    const matchesCategory = selectedCategories.length === 0 ||
      (template.category && selectedCategories.includes(template.category));

    return matchesSearch && matchesFree && matchesCategory;
  });

  const getUsageText = (template: Template) => {
    // Can be calculated from response count if available
    // For now, show number of questions as a metric
    const questionCount = (template.survey_questions || []).length;
    return `${questionCount} question${questionCount !== 1 ? 's' : ''}`;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading templates...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Breadcrumb items={[
          { label: 'FM Module' },
          { label: 'Surveys', path: '/survey' },
          { label: 'Template Survey' }
        ]} />
        <div className="flex flex-col items-center justify-center py-20">
          <AlertTriangle className="w-12 h-12 text-destructive mb-4" />
          <h3 className="text-lg font-semibold mb-2">Failed to Load Templates</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button
            onClick={fetchTemplates}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col overflow-hidden w-full">
      {/* Header Section */}
      <div className="p-4 md:p-6 bg-background">
        <div className="mx-auto max-w-[1400px] xl:max-w-[1600px] space-y-6">
            {/* Breadcrumb */}
            <Breadcrumb
              items={[
                { label: "FM Module" },
                { label: "Surveys", path: "/survey" },
                { label: "Template Survey" },
              ]}
            />

            {/* Page Title */}
            <div className="flex flex-col gap-2">
              <h1 className="text-2xl font-semibold text-foreground">
                Create Template Survey
              </h1>
              <p className="text-sm text-muted-foreground">
                Choose from our collection of professional survey templates
              </p>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Sidebar - Filters */}
              <div className="lg:col-span-1">
                <div className="bg-card border border-border rounded-2xl shadow-sm p-5 space-y-5 sticky top-6">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Filter className="w-5 h-5" />
                      Explore Templates
                    </h3>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Search templates..."
                        className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Plan Type Filter */}
                  <div className="space-y-3 pt-3 border-t border-border">
                    <h4 className="font-semibold text-foreground text-sm">
                      Plan Type
                    </h4>
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                        checked={showFreeOnly}
                        onChange={(e) => setShowFreeOnly(e.target.checked)}
                      />
                      <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                        Show free templates only
                      </span>
                    </label>
                  </div>

                  {/* Categories Filter */}
                  <div className="space-y-3 pt-3 border-t border-border">
                    <h4 className="font-semibold text-foreground text-sm">
                      Categories
                    </h4>
                    <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                      {categories.map(({ id, label, count }) => (
                        <label
                          key={id}
                          className="flex items-center gap-3 cursor-pointer group"
                        >
                          <input
                            type="checkbox"
                            className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                            checked={selectedCategories.includes(id)}
                            onChange={() => handleCategoryToggle(id)}
                          />
                          <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                            {label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content - Templates Grid */}
              <div className="lg:col-span-3">
                {filteredTemplates.length === 0 ? (
                  <div className="text-center py-20">
                    <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">
                      {searchQuery || selectedCategories.length > 0
                        ? 'No templates match your filters'
                        : 'No templates available'}
                    </p>
                    <Link
                      to="/admin/create-scratch-survey"
                      className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                    >
                      Create From Scratch
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredTemplates.map((template) => (
                      <Link
                        key={template.id}
                        to={`/admin/template-detail-survey?templateId=${template.id}`}
                        className="group bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg hover:border-primary/50 transition-all duration-200 flex flex-col"
                      >
                        {/* Template Image/Icon */}
                        <div className="relative h-32 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                          {template.image_url ? (
                            <img
                              src={template.image_url}
                              alt={template.survey_title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="flex justify-center items-center">
                              <FileText className="h-16 w-16 text-gray-400" />
                            </div>
                          )}
                          {template.is_premium && (
                            <div className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm p-1.5 rounded-md shadow-sm">
                              <Lock className="h-4 w-4 text-primary" />
                            </div>
                          )}
                        </div>

                        {/* Template Content */}
                        <div className="p-4 flex flex-col flex-grow">
                          <div className="mb-2">
                            <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                              {template.survey_title || 'Untitled Template'}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-1">
                              {getUsageText(template)}
                            </p>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2 flex-grow">
                            {template.description || 'No description available'}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
        </div>
      </div>
    </div>
  );
}

export default CreateTemplateSurvey;