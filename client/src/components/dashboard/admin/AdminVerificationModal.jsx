import React, { useState } from 'react';
import { X, CheckCircle, XCircle, Download, FileText, User, Calendar, GraduationCap, Briefcase, Building, Mail } from 'lucide-react';

const AdminVerificationModal = ({ isOpen, verification, onClose, onApprove, onReject }) => {
  // Add the missing formatDate function
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };
  
  const [rejectionReason, setRejectionReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle approve verification
  const handleApprove = async () => {
    if (verification) {
      try {
        setIsSubmitting(true);
        await onApprove(verification._id);
        setIsSubmitting(false);
      } catch (error) {
        console.error("Error approving verification:", error);
        setIsSubmitting(false);
      }
    }
  };
  
  // Handle reject verification
  const handleReject = async () => {
    if (verification) {
      try {
        setIsSubmitting(true);
        await onReject(verification._id, rejectionReason || "Verification rejected by administrator");
        setIsSubmitting(false);
      } catch (error) {
        console.error("Error rejecting verification:", error);
        setIsSubmitting(false);
      }
    }
  };
  
  if (!isOpen || !verification) {
    return null;
  }
  
  // Debugging for document URL
  console.log("Verification details:", verification);
  
  // Enhanced function to safely check for document URL in multiple fields
  const getDocumentUrl = () => {
    if (!verification) return null;
    
    // Check all possible document URL field locations
    const documentUrl = verification.documentURL || 
                        verification.document?.url || 
                        verification.verificationDocument?.url ||
                        verification.documentUrl;
                        
    console.log("Document URL found:", documentUrl);
    return documentUrl;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-lg max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium">Alumni Verification Request</h3>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6">
          {/* Personal Info Section */}
          <div className="mb-8">
            <h4 className="text-base font-medium mb-4 flex items-center">
              <User className="h-5 w-5 mr-2 text-primary" />
              Personal Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Full Name</p>
                <p className="font-medium">{verification.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                <p className="font-medium flex items-center">
                  <Mail className="h-4 w-4 mr-1 text-gray-400" />
                  {verification.email}
                </p>
              </div>
              {verification.phone && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                  <p className="font-medium">{verification.phone}</p>
                </div>
              )}
              {verification.dateOfBirth && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Date of Birth</p>
                  <p className="font-medium">{formatDate(verification.dateOfBirth)}</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Education Section */}
          <div className="mb-8">
            <h4 className="text-base font-medium mb-4 flex items-center">
              <GraduationCap className="h-5 w-5 mr-2 text-primary" />
              Education Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Degree</p>
                <p className="font-medium">{verification.degree}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Branch/Specialization</p>
                <p className="font-medium">{verification.branch || "Not specified"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">University/Institution</p>
                <p className="font-medium">{verification.university || "Not specified"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Graduation Year</p>
                <p className="font-medium">{verification.graduationYear}</p>
              </div>
            </div>
          </div>
          
          {/* Current Employment Section */}
          {(verification.currentCompany || verification.currentRole) && (
            <div className="mb-8">
              <h4 className="text-base font-medium mb-4 flex items-center">
                <Briefcase className="h-5 w-5 mr-2 text-primary" />
                Current Employment
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {verification.currentCompany && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Company</p>
                    <p className="font-medium flex items-center">
                      <Building className="h-4 w-4 mr-1 text-gray-400" />
                      {verification.currentCompany}
                    </p>
                  </div>
                )}
                {verification.currentRole && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Position/Role</p>
                    <p className="font-medium">{verification.currentRole}</p>
                  </div>
                )}
                {verification.workExperience && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Experience</p>
                    <p className="font-medium">{verification.workExperience} years</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Verification Document Section - FIXED THE SYNTAX ERROR HERE */}
          <div className="mb-8">
            <h4 className="text-base font-medium mb-4 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-primary" />
              Verification Document
            </h4>
            {getDocumentUrl() ? (
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Document Provided</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Uploaded on {formatDate(verification.createdAt)}
                    </p>
                  </div>
                  <a 
                    href={getDocumentUrl()} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-4 py-2 flex items-center space-x-2 bg-primary/10 text-primary rounded-md hover:bg-primary/20 transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    <span>View Document</span>
                  </a>
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                <p className="text-yellow-700 dark:text-yellow-500">No verification document provided.</p>
              </div>
            )}
          </div>
          
          {/* Status Section - FIXED THE SYNTAX ERROR HERE */}
          <div className="mb-8">
            <h4 className="text-base font-medium mb-4 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-primary" />
              Request Status
            </h4>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className={`px-3 py-1 rounded-full text-sm ${
                  verification.status === 'pending' 
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                    : verification.status === 'approved'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  {verification.status === 'pending' ? 'Pending Review' : verification.status === 'approved' ? 'Approved' : 'Rejected'}
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Request received: {formatDate(verification.createdAt)}
                </span>
              </div>
              
              {verification.status === 'rejected' && verification.rejectionReason && (
                <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-md">
                  <p className="text-sm font-medium text-red-700 dark:text-red-400">Rejection Reason:</p>
                  <p className="text-sm text-red-600 dark:text-red-300 mt-1">{verification.rejectionReason}</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Simplified footer with just Accept and Reject buttons */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex flex-col space-y-4">
          {/* Rejection reason textarea - always visible */}
          <div>
            <label className="block text-sm font-medium mb-1">Rejection reason (optional):</label>
            <textarea
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-background"
              rows="3"
              placeholder="Provide a reason for rejection (will be sent to the applicant)"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            ></textarea>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              onClick={handleReject}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Processing...' : 'Reject'}
            </button>
            <button
              onClick={handleApprove}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Processing...' : 'Approve'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminVerificationModal;
