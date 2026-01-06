import React from "react";
import { Link } from "react-router-dom";
import { AiFillQuestionCircle } from "react-icons/ai";
import Chart from "react-apexcharts";
import { FaChartBar, FaCheck, FaPaperPlane, FaPencilAlt } from "react-icons/fa";
import { GrShare } from "react-icons/gr";
import Breadcrumb from "../../../components/ui/Breadcrumb";

function SurveyDetails() {
  const options = {
    chart: {
      type: "donut",
    },
    labels: ["vote", "not vote"],
    colors: ["#6366F1", "#F59E0B"], // Tailwind colors
    legend: {
      position: "bottom",
      show: false,
    },
    dataLabels: {
      enabled: false,
    },
  };

  const series = [100, 0];

  const steps = [
    {
      id: 1,
      label: "Add questions",
      icon: <FaPencilAlt className="w-4 h-4" />,
      status: "completed",
    },
    {
      id: 2,
      label: "Go to Collect",
      icon: <FaPaperPlane className="w-4 h-4" />,
      status: "completed",
    },
    {
      id: 3,
      label: "Analyze your results",
      icon: <FaChartBar className="w-4 h-4" />,
      status: "completed",
    },
  ];
  return (
    <div className="p-6">
      <Breadcrumb items={[{ label: 'FM Module' }, { label: 'Survey', path: '/survey' }, { label: 'Survey Details' }]} />
      
      <div className="mt-6 bg-card border border-border rounded-xl shadow-sm">
        <div className="p-6 border-b border-border">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h1 className="text-2xl font-bold text-foreground">Survey Details</h1>
            <div className="flex flex-wrap gap-2">
              <Link
                to={`/admin/result-analyze-result`}
                className="bg-primary text-primary-foreground p-2 px-4 flex items-center gap-2 rounded-md hover:bg-primary/90 transition-colors"
              >
                <h2>Analyze Result</h2>
              </Link>
              <Link
                to={`/admin/preview-survey`}
                className="bg-primary text-primary-foreground p-2 px-4 flex items-center gap-2 rounded-md hover:bg-primary/90 transition-colors"
              >
                <h2>Preview Survey</h2>
                <span>
                  <GrShare />
                </span>
              </Link>
            </div>
          </div>
        </div>
        
        <div className="p-6 bg-muted rounded-t-lg">
          <div className="max-w-4xl mx-auto">
            <div className="relative flex justify-between">
              {/* Progress Line */}
              <div className="absolute top-5 left-0 right-0 h-0.5">
                <div className="absolute left-0 right-1/2 h-full bg-green-500 transition-all duration-500"></div>
                <div className="absolute left-1/2 right-0 h-full bg-gray-200 transition-all duration-500"></div>
              </div>

              {/* Steps */}
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className="relative flex flex-col items-center group"
                >
                  {/* Step Circle */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center z-10 border-2 
                  ${
                    step.status === "completed"
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background border-border"
                  }`}
                  >
                    {step.status === "completed" ? (
                      <FaCheck className="w-5 h-5 text-primary-foreground" />
                    ) : (
                      <div
                        className={`w-5 h-5 flex items-center justify-center 
                    ${
                      step.status === "current"
                        ? "text-foreground"
                        : "text-muted-foreground"
                    }`}
                      >
                        {step.icon}
                      </div>
                    )}
                  </div>

                  {/* Label */}
                  <span
                    className={`mt-3 text-sm font-medium whitespace-nowrap
                ${
                  step.status === "completed"
                    ? "text-primary"
                    : step.status === "current"
                    ? "text-foreground"
                    : "text-muted-foreground"
                }`}
                  >
                    <div className="flex items-center gap-2">
                      <p>{step.icon}</p> <Link to={``}>{step.label}</Link>
                    </div>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-12 gap-6">
            <div className="flex justify-end gap-3 mx-5 col-span-12 border-b pb-4">
              <Link
                to={``}
                className="text-primary border-r border-border pr-5 hover:underline"
              >
                Edit design
              </Link>
              <Link
                to={``}
                className="text-primary border-r border-border pr-5 hover:underline"
              >
                Send survey
              </Link>
              <Link to={``} className="text-primary hover:underline">
                Analyze Results
              </Link>
            </div>
            <div className="col-span-4 space-y-5">
              <div className="border border-border rounded-lg p-6">
                <div className="flex flex-col space-y-2 my-5">
                  <h2 className="font-medium px-5 text-foreground">Survey</h2>
                  <div className="w-full flex justify-center">
                    <div className="w-[100px]">
                      <Chart options={options} series={series} type="donut" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5 mb-5">
                  <div className="border-r border-border pr-5 flex flex-col space-y-3">
                    <h3 className="text-muted-foreground items-center text-sm">
                      ESTIMATED COMPLETION RATE
                    </h3>
                    <div>
                      <h2 className="text-2xl text-foreground">61%</h2>
                      <p className="text-sm text-muted-foreground">Completed</p>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-3">
                    <h3 className="text-muted-foreground items-center text-sm">
                      ESTIMATED TIME TO COMPLETE
                    </h3>
                    <div>
                      <h2 className="text-2xl text-foreground">2</h2>
                      <p className="text-sm text-muted-foreground">Minutes</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="border border-border rounded-lg p-6">
                <div className="flex items-center justify-center">
                  <h2 className="flex items-center gap-2 text-sm text-foreground">
                    Survey Language: <span className="font-medium">English</span>
                  </h2>
                </div>
              </div>
              <div className="border border-border rounded-lg p-6">
                <div className="flex items-center justify-center">
                  <h2 className="flex items-center gap-2 text-sm text-foreground">
                    Theme: <span className="font-medium">Simple</span>
                  </h2>
                </div>
              </div>
            </div>
            <div className="col-span-8 space-y-3">
              <div className="border border-border rounded-lg grid grid-cols-3 gap-5 p-6">
                <div className="flex flex-col items-start border-r border-border pr-5 space-y-4">
                  <h2 className="text-muted-foreground text-sm">TOTAL RESPONSES</h2>
                  <p className="text-2xl font-medium text-foreground">0</p>
                </div>
                <div className="flex flex-col items-start border-r border-border pr-5 space-y-4">
                  <div className="flex justify-between items-center gap-x-2 w-full">
                    <h2 className="text-muted-foreground text-sm">
                      OVERALL SURVEY STATUS
                    </h2>
                    <span className="h-2 w-2 bg-green-600 rounded-full text-green-900"></span>
                  </div>
                  <Link
                    to={`/admin/survey-collect-response`}
                    className="text-green-600 text-2xl"
                  >
                    Open
                  </Link>
                </div>
                <div className="flex flex-col items-start space-y-4">
                  <div className="flex gap-2 items-center">
                    <h2 className="text-muted-foreground text-sm">NOTIFICATIONS</h2>
                    <span>
                      <AiFillQuestionCircle size={15} />
                    </span>
                  </div>
                  <p className="font-medium text-foreground">Only you</p>
                </div>
              </div>
              <div>
                <h2 className="text-2xl text-foreground mb-2">Collectors</h2>
                <div className="border border-border rounded-lg">
                  <h2 className="bg-primary text-primary-foreground text-sm px-5 w-fit p-1 rounded-b-md mx-5">
                    DRAFT
                  </h2>
                  <div className="flex justify-between m-5">
                    <div className="flex flex-col space-y-2">
                      <h2 className="text-primary text-sm hover:underline">
                        Target Audience 1
                      </h2>
                      <p className="text-muted-foreground text-sm flex gap-1">
                        Created: <span>Created: 2/28/2025</span>
                      </p>
                      <p className="text-muted-foreground text-sm">
                        Looks like your collector is not quite set up yet.{" "}
                        <Link
                          to={``}
                          className="text-primary text-sm underline hover:text-primary/80"
                        >
                          Set up collector
                        </Link>
                      </p>
                    </div>
                    <h2 className="text-muted-foreground text-sm flex items-center gap-2">
                      Invoice: <span className="font-medium">N/A</span>
                    </h2>
                  </div>
                </div>
              </div>
              <div>
                <h2 className="text-2xl text-foreground mb-2">Responses Volume</h2>
                <div className="border border-border rounded-lg p-5 ">
                  <h2 className="flex items-center justify-center gap-1">
                    No survey responses yet{" "}
                    <button className="text-primary hover:text-primary/80 hover:underline">
                      What is this?
                    </button>
                  </h2>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SurveyDetails;