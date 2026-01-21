import React from "react";
import { motion } from "framer-motion";
import { Paperclip, Image as ImageIcon, FileText, Upload, Shield, File } from "lucide-react";

const NewAssetAttachments: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="rounded-2xl border border-border bg-card p-6 shadow-sm"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
          <Paperclip className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-foreground">Attachments</h3>
          <p className="text-xs text-muted-foreground">Upload asset documents and images</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Asset Image */}
        <div className="rounded-xl border border-border bg-gradient-to-br from-primary/5 to-transparent p-4">
          <div className="flex items-center gap-2 mb-3">
            <ImageIcon className="h-5 w-5 text-primary" />
            <p className="text-sm font-semibold text-foreground">Asset Image</p>
          </div>
          <div className="border-2 border-dashed border-primary/30 rounded-lg p-8 bg-background/50 flex flex-col items-center justify-center text-center hover:bg-primary/5 transition-colors cursor-pointer">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <Upload className="h-6 w-6 text-primary" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">Click to upload or drag and drop</p>
            <p className="text-xs text-muted-foreground mb-3">PNG, JPG or WEBP (max. 5MB)</p>
            <button type="button" className="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors">
              Choose File
            </button>
          </div>
        </div>

        {/* Document Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Manuals Upload */}
          <div className="rounded-xl border border-border bg-background p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <FileText className="h-4 w-4 text-blue-600" />
              </div>
              <p className="text-sm font-semibold text-foreground">Manuals Upload</p>
            </div>
            <div className="border-2 border-dashed border-border rounded-lg p-4 bg-muted/30 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors cursor-pointer">
              <Upload className="h-5 w-5 text-muted-foreground mb-2" />
              <p className="text-xs text-muted-foreground mb-2">Drop files here</p>
              <button type="button" className="rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors">
                Browse Files
              </button>
            </div>
          </div>

          {/* Insurance Details */}
          <div className="rounded-xl border border-border bg-background p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-8 w-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Shield className="h-4 w-4 text-green-600" />
              </div>
              <p className="text-sm font-semibold text-foreground">Insurance Details</p>
            </div>
            <div className="border-2 border-dashed border-border rounded-lg p-4 bg-muted/30 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors cursor-pointer">
              <Upload className="h-5 w-5 text-muted-foreground mb-2" />
              <p className="text-xs text-muted-foreground mb-2">Drop files here</p>
              <button type="button" className="rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors">
                Browse Files
              </button>
            </div>
          </div>

          {/* Purchase Invoice */}
          <div className="rounded-xl border border-border bg-background p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-8 w-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <FileText className="h-4 w-4 text-orange-600" />
              </div>
              <p className="text-sm font-semibold text-foreground">Purchase Invoice</p>
            </div>
            <div className="border-2 border-dashed border-border rounded-lg p-4 bg-muted/30 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors cursor-pointer">
              <Upload className="h-5 w-5 text-muted-foreground mb-2" />
              <p className="text-xs text-muted-foreground mb-2">Drop files here</p>
              <button type="button" className="rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors">
                Browse Files
              </button>
            </div>
          </div>

          {/* Other Documents */}
          <div className="rounded-xl border border-border bg-background p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <File className="h-4 w-4 text-purple-600" />
              </div>
              <p className="text-sm font-semibold text-foreground">Other Documents</p>
            </div>
            <div className="border-2 border-dashed border-border rounded-lg p-4 bg-muted/30 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors cursor-pointer">
              <Upload className="h-5 w-5 text-muted-foreground mb-2" />
              <p className="text-xs text-muted-foreground mb-2">Drop files here</p>
              <button type="button" className="rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors">
                Browse Files
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default NewAssetAttachments;
