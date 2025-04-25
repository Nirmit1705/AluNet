import React, { useState } from "react";
import { 
  X, 
  CheckCircle,
  XCircle,
  ExternalLink,
  FileCheck 
} from "lucide-react";

const AdminVerificationModal = ({ isOpen, verification, onClose, onApprove, onReject }) => {
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  
  if (!isOpen || !verification) return null;
  
  const handleApprove = () => {
    onApprove(verification._id);
  };
  
  const handleShowRejectForm = () => {
    setShowRejectForm(true);
  };
  
  const handleReject = (e) => {
    e.preventDefault();
    onReject(verification._id, rejectReason);
    setRejectReason("");
    setShowRejectForm(false);
  };
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-xl p-6 animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">Alumni Verification</h3>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-4">
              <FileCheck className="h-8 w-8" />
            </div>
            <div>
              <h4 className="text-xl font-medium">{verification.name}</h4>
              <p className="text-muted-foreground">{verification.email}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <h5 className="text-sm font-medium text-muted-foreground mb-1">Degree</h5>
              <p>{verification.degree}</p>
            </div>
            <div>
              <h5 className="text-sm font-medium text-muted-foreground mb-1">Graduation Year</h5>
              <p>{verification.graduationYear}</p>
            </div>
            <div>
              <h5 className="text-sm font-medium text-muted-foreground mb-1">Branch</h5>
              <p>{verification.branch || "Not specified"}</p>
            </div>
            <div>
              <h5 className="text-sm font-medium text-muted-foreground mb-1">University</h5>
              <p>{verification.university || "Not specified"}</p>
            </div>
          </div>
          
          <div className="mb-6">
            <h5 className="text-sm font-medium text-muted-foreground mb-2">Verification Document</h5>
            <a 
              href={verification.verificationDocument?.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <line x1="10" y1="9" x2="8" y2="9"></line>
              </svg>
              View Document <ExternalLink className="h-3 w-3 ml-1" />
            </a>
          </div>
          
          <div className="mb-4">
            <h5 className="text-sm font-medium text-muted-foreground mb-1">Date Applied</h5>
            <p>{formatDate(verification.verificationSubmittedAt || verification.createdAt)}</p>
          </div>
        </div>
        
        {!showRejectForm ? (
          <div className="flex justify-end space-x-3">
            <button
              onClick={handleShowRejectForm}
              className="px-4 py-2 border border-red-200 text-red-600 dark:border-red-800 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
            >
              <XCircle className="h-4 w-4 mr-2 inline-block" />
              Reject
            </button>
            <button
              onClick={handleApprove}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <CheckCircle className="h-4 w-4 mr-2 inline-block" />
              Approve
            </button>
          </div>
        ) : (
          <form onSubmit={handleReject} className="space-y-4">
            <div>
              <label htmlFor="rejectReason" className="block text-sm font-medium mb-1">
                Reason for Rejection
              </label>
              <textarea
                id="rejectReason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full px-4 py-2.5 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                rows={3}
                placeholder="Please provide a reason for rejection..."
                required
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowRejectForm(false)}
                className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Confirm Rejection
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AdminVerificationModal;
