import React from "react";
import { useSelector } from "react-redux";
import { CgNotes } from "react-icons/cg";
import { LiaEdit } from "react-icons/lia";
import { Link } from "react-router-dom";
import { LuCopyCheck } from "react-icons/lu";
import Breadcrumb from "../../../components/ui/Breadcrumb";

function AddSurvey() {
  const themeColor = useSelector((state) => state.theme.color);
  return (
    <div className="p-6">
      <Breadcrumb items={[{ label: 'FM Module' }, { label: 'Survey', path: '/survey' }, { label: 'Add Survey' }]} />
      
      <div className="mt-6 bg-card border border-border rounded-xl shadow-sm">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">Create Survey</h2>
        </div>
        
        <div className="p-6">
          <div className="flex justify-center">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border border-border rounded-lg p-6 bg-card shadow-sm hover:shadow-md transition-shadow">
                <Link
                  to={`/admin/create-scratch-survey`}
                  className="flex flex-col space-y-5 items-center text-center"
                >
                  <span className="p-4 rounded-full bg-muted">
                    <LiaEdit className="h-8 w-8 text-muted-foreground" />
                  </span>
                  <h2 className="text-lg font-medium text-foreground">Start From Scratch</h2>
                  <p className="text-sm text-muted-foreground">
                    Begin with a blank survey or form. then add your questions,
                    text and images.
                  </p>
                </Link>
              </div>
              <div className="border border-border rounded-lg p-6 bg-card shadow-sm hover:shadow-md transition-shadow">
                <Link
                  to={`/admin/copy-survey`}
                  className="flex flex-col space-y-5 items-center text-center"
                >
                  <span className="p-4 rounded-full bg-muted">
                    <LuCopyCheck className="h-8 w-8 text-muted-foreground" />
                  </span>
                  <h2 className="text-lg font-medium text-foreground">Copy an existing survey</h2>
                  <p className="text-sm text-muted-foreground">
                    Choose a survey. Make a copy. Edit as needed
                  </p>
                </Link>
              </div>
              <div className="border border-border rounded-lg p-6 bg-card shadow-sm hover:shadow-md transition-shadow">
                <Link
                  to={`/admin/create-template-survey`}
                  className="flex flex-col space-y-5 items-center text-center"
                >
                  <span className="p-4 rounded-full bg-muted">
                    <CgNotes className="h-8 w-8 text-muted-foreground" />
                  </span>
                  <h2 className="text-lg font-medium text-foreground">Pick a popular template</h2>
                  <p className="text-sm text-muted-foreground">
                    Ask the right questions and save time with a template built
                    for your situation.
                  </p>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddSurvey;