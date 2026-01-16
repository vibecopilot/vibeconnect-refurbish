import React, { useState, useEffect } from "react";
import Breadcrumb from "../../../components/ui/Breadcrumb";
import { Eye, Search, Loader2, AlertTriangle, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { getSurveys } from "../../../api";
import toast from "react-hot-toast";

function CopySurvey() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSurveys();
  }, []);

  const fetchSurveys = async () => {
    setLoading(true);
    try {
      const response = await getSurveys();
      const surveysData = Array.isArray(response.data) ? response.data :
                         Array.isArray(response.data.survey) ? response.data.survey :
                         Array.isArray(response.data.surveys) ? response.data.surveys : [];

      // Sort by created_at descending (most recent first)
      const sortedSurveys = surveysData.sort((a, b) =>
        new Date(b.created_at) - new Date(a.created_at)
      );

      setSurveys(sortedSurveys);
    } catch (error) {
      console.error("Error fetching surveys:", error);
      setError("Failed to load surveys");
      toast.error("Failed to load surveys");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Get top 3 recent surveys
  const recentData = surveys.slice(0, 3);

  // Filter surveys based on search and tab
  const filteredSurveys = surveys.filter(survey => {
    const matchesSearch = !searchQuery ||
      (survey.survey_title || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading surveys...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Breadcrumb items={[{ label: 'FM Module' }, { label: 'Surveys', path: '/survey' }, { label: 'Copy Survey' }]} />
        <div className="flex flex-col items-center justify-center py-20">
          <AlertTriangle className="w-12 h-12 text-destructive mb-4" />
          <h3 className="text-lg font-semibold mb-2">Failed to Load Surveys</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button
            onClick={fetchSurveys}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <section className="w-full flex mx-3 flex-col overflow-hidden">
        {/* Header Section */}
        <div className="p-4 md:p-6 bg-background">
          <div className="mx-auto max-w-[1400px] xl:max-w-[1600px] space-y-6">
            {/* Breadcrumb */}
            <Breadcrumb
              items={[
                { label: "FM Module" },
                { label: "Surveys", path: "/survey" },
                { label: "Copy Survey" },
              ]}
            />

            {/* Page Title and Actions */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold text-foreground">
                  Copy a Past Survey
                </h1>
                <p className="text-sm text-muted-foreground">
                  Select a survey to copy and customize
                </p>
              </div>

              {/* Search and Filter Bar */}
              <div className="flex gap-2">
                <div className="relative flex-1 md:w-96">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search by survey name..."
                    className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <button
                  onClick={() => setActiveTab("all")}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === "all"
                      ? "bg-primary text-primary-foreground"
                      : "border border-border text-foreground hover:bg-accent"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setActiveTab("favorites")}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                    activeTab === "favorites"
                      ? "bg-primary text-primary-foreground"
                      : "border border-border text-foreground hover:bg-accent"
                  }`}
                >
                  <Star className="w-4 h-4" />
                  Favorites
                </button>
              </div>
            </div>

            {/* Recent Section - Top 3 Surveys */}
            <div className="bg-card border border-border rounded-2xl shadow-sm p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    Recent Surveys (Top 3)
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Your 3 most recently created surveys
                  </p>
                </div>
              </div>

              {recentData.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">No surveys available to copy</p>
                  <Link
                    to="/admin/create-scratch-survey"
                    className="inline-block mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                  >
                    Create New Survey
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentData.map((item, index) => (
                    <div
                      key={item.id}
                      className="group relative border border-border rounded-xl p-4 bg-background hover:shadow-md hover:border-primary/50 transition-all duration-200"
                    >
                      {/* Top Row - View Link */}
                      <div className="flex justify-between items-start mb-3">
                        <Link
                          to={`/admin/copy-survey-view-page?surveyId=${item.id}`}
                          className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary/80 font-medium"
                        >
                          <Eye className="w-4 h-4" />
                          View & Copy
                        </Link>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          (item.status || '').toLowerCase() === 'active' ? 'bg-green-100 text-green-700' :
                          (item.status || '').toLowerCase() === 'draft' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {item.status || 'Unknown'}
                        </span>
                      </div>

                      {/* Survey Info */}
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="text-base font-semibold text-foreground mb-1">
                            {item.survey_title || 'Untitled Survey'}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            Created: {formatDate(item.created_at)} • Modified: {formatDate(item.updated_at)}
                          </p>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-6 text-center">
                          <div className="flex flex-col">
                            <span className="text-lg font-semibold text-foreground">
                              {(item.survey_questions || []).length}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              Questions
                            </span>
                          </div>
                          <div className="h-8 w-px bg-border" />
                          <div className="flex flex-col">
                            <span className="text-lg font-semibold text-foreground">
                              {formatDate(item.start_date)}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              Start Date
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* All Surveys Section */}
            <div className="bg-card border border-border rounded-2xl shadow-sm p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    All Surveys
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Browse all available surveys to copy
                  </p>
                </div>
              </div>

              {filteredSurveys.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">
                    {searchQuery ? `No surveys match "${searchQuery}"` : 'No surveys available'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredSurveys.map((item) => (
                    <div
                      key={item.id}
                      className="group relative border border-border rounded-xl p-4 bg-background hover:shadow-md hover:border-primary/50 transition-all duration-200"
                    >
                      {/* Top Row - View Link and Status */}
                      <div className="flex justify-between items-start mb-3">
                        <Link
                          to={`/admin/copy-survey-view-page?surveyId=${item.id}`}
                          className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary/80 font-medium"
                        >
                          <Eye className="w-4 h-4" />
                          View & Copy
                        </Link>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          (item.status || '').toLowerCase() === 'active' ? 'bg-green-100 text-green-700' :
                          (item.status || '').toLowerCase() === 'draft' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {item.status || 'Unknown'}
                        </span>
                      </div>

                      {/* Survey Info */}
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="text-base font-semibold text-foreground mb-1">
                            {item.survey_title || 'Untitled Survey'}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            Created: {formatDate(item.created_at)} • Modified: {formatDate(item.updated_at)}
                          </p>
                          {item.description && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                              {item.description}
                            </p>
                          )}
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-6 text-center">
                          <div className="flex flex-col">
                            <span className="text-lg font-semibold text-foreground">
                              {(item.survey_questions || []).length}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              Questions
                            </span>
                          </div>
                          <div className="h-8 w-px bg-border" />
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-foreground">
                              {formatDate(item.start_date)}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              to
                            </span>
                            <span className="text-xs font-medium text-foreground">
                              {formatDate(item.end_date)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
    </section>
  );
}

export default CopySurvey;
