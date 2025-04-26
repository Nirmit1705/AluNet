import React from "react";
import { Clock, CheckCircle, XCircle, AlertTriangle, FileCheck } from "lucide-react";

const VerificationStatusSection = ({ status }) => {
  let statusInfo = {
    icon: Clock,
    title: "Verification Pending",
    description: "Your alumni status is being verified. This usually takes 1-2 business days.",
    color: "text-amber-600",
    bgColor: "bg-amber-50 dark:bg-amber-900/10",
    borderColor: "border-amber-200 dark:border-amber-800/30"
  };

  if (status === "approved") {
    statusInfo = {
      icon: CheckCircle,
      title: "Verification Approved",
      description: "Your alumni status has been verified. You now have full access to all alumni features.",
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-900/10",
      borderColor: "border-green-200 dark:border-green-800/30"
    };
  } else if (status === "rejected") {
    statusInfo = {
      icon: XCircle,
      title: "Verification Rejected",
      description: "Your verification document was not approved. Please submit a new document to verify your alumni status.",
      color: "text-red-600",
      bgColor: "bg-red-50 dark:bg-red-900/10",
      borderColor: "border-red-200 dark:border-red-800/30"
    };
  }

  const Icon = statusInfo.icon;

  // Don't show if already approved
  if (status === "approved") return null;

  return (
    <div className={`${statusInfo.bgColor} ${statusInfo.borderColor} border rounded-xl p-6 animate-fade-in mb-8`}>
      <div className="flex items-start">
        <div className={`${statusInfo.color} mr-4 mt-1`}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <h3 className={`font-medium text-lg ${statusInfo.color}`}>{statusInfo.title}</h3>
          <p className={`mt-1 ${statusInfo.color} opacity-90`}>{statusInfo.description}</p>
          
          {status === "rejected" && (
            <div className="mt-4">
              <button className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors flex items-center">
                <FileCheck className="h-4 w-4 mr-2" />
                Submit New Document
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerificationStatusSection;
