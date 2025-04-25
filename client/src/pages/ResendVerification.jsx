import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, FileText, X, CheckCircle } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const ResendVerification = () => {
  const navigate = useNavigate();
  const [documentURL, setDocumentURL] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleGoBack = () => {
    navigate('/verification-pending');
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);

    try {
      // Create a FormData object to send the file
      const formData = new FormData();
      formData.append('verificationDocument', file);

      // Use the direct URL to the backend
      const response = await axios.post('http://localhost:5000/api/upload/verification', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      // Store the document URL from the response
      if (response.data && response.data.documentURL) {
        setDocumentURL(response.data.documentURL);
        toast.success('Document uploaded successfully');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error(error.response?.data?.message || 'Failed to upload document');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!documentURL) {
      toast.error('Please upload a verification document');
      return;
    }

    setIsSubmitting(true);

    try {
      await axios.post('/api/alumni/resend-verification', 
        { documentURL },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      setShowSuccess(true);
    } catch (error) {
      console.error('Error submitting verification:', error);
      toast.error('Failed to submit verification request');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="container-custom max-w-lg">
          <div className="glass-card rounded-xl p-8 text-center">
            <div className="h-20 w-20 rounded-full bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Verification Submitted</h2>
            <p className="text-muted-foreground mb-8">
              Your alumni verification request has been submitted successfully. 
              Our administrators will review your submission and you'll receive an email once your account is verified.
            </p>
            <button
              onClick={() => navigate('/verification-pending')}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Return to Status Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="container-custom max-w-lg">
        <div className="glass-card rounded-xl p-8">
          <button 
            onClick={handleGoBack}
            className="absolute top-4 left-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          
          <h2 className="text-2xl font-bold mb-4 text-center">Resend Verification</h2>
          <p className="text-muted-foreground mb-8 text-center">
            Please submit a new verification document. This should be a degree certificate, 
            student ID, or other proof of your alumni status.
          </p>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="verification-document" className="block text-sm font-medium mb-1">
                Verification Document <span className="text-red-500">*</span>
              </label>
              <div className="border border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-4">
                <input
                  type="file"
                  id="verification-document"
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileUpload}
                />
                <label
                  htmlFor="verification-document"
                  className="cursor-pointer flex flex-col items-center justify-center gap-2"
                >
                  <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    <Upload className="h-6 w-6" />
                  </div>
                  <div className="text-sm text-center">
                    <p className="font-medium">Upload verification document</p>
                    <p className="text-muted-foreground">PDF, JPG, or PNG (max 5MB)</p>
                  </div>
                  <button type="button" className="mt-2 px-4 py-2 bg-primary/10 text-primary text-sm rounded-lg hover:bg-primary/20 transition-colors">
                    {documentURL ? 'Change Document' : 'Select Document'}
                  </button>
                </label>
                {documentURL && (
                  <div className="mt-3 flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 text-green-600 dark:text-green-400 mr-2" />
                      <span className="text-sm text-green-600 dark:text-green-400">Document uploaded successfully</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDocumentURL('')}
                      className="p-1 rounded-full hover:bg-green-100 dark:hover:bg-green-800/50"
                    >
                      <X className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isUploading || isSubmitting || !documentURL}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Verification'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResendVerification;