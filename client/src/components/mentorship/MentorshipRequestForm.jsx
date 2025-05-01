import React, { useState, useEffect } from "react";
import { X, Users, Calendar, AlertCircle, Star, StarHalf } from "lucide-react";
import axios from "axios";
import { toast } from 'sonner';

const MentorshipRequestForm = ({ mentorName, mentorId, mentorRole, mentorEmail, mentor, onClose, onSubmit }) => {
  const [mentorshipDetails, setMentorshipDetails] = useState({
    message: "",
    goals: "",
    timeRequired: "3 months",
    availability: "",
    meetingMode: "online",
    requiredDomains: [],
    preferredSlot: "",
    requestedSessions: 5 // Default to 5 sessions
  });
  const [newDomain, setNewDomain] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [mentorRating, setMentorRating] = useState({ averageRating: 0, totalFeedbacks: 0 });

  // Extract mentor information from either direct props or mentor object
  const actualMentorId = mentorId || mentor?.id;
  const actualMentorName = mentorName || mentor?.name;
  const actualMentorRole = mentorRole || mentor?.role;
  const actualMentorEmail = mentorEmail || mentor?.email;

  useEffect(() => {
    // Log mentor details for debugging
    console.log("Mentor information in request form:", { 
      actualMentorId, 
      actualMentorName,
      directMentorId: mentorId,
      mentorObjectId: mentor?.id 
    });
    
    if (!actualMentorId) {
      console.error("No mentor ID available");
    }
  }, [actualMentorId, actualMentorName, mentorId, mentor]);

  // Fetch mentor rating when component mounts
  useEffect(() => {
    const fetchMentorRating = async () => {
      try {
        const alumniId = actualMentorId;
        if (!alumniId) return;
        
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/mentorship/feedback/alumni/${alumniId}`
        );
        
        setMentorRating(response.data);
      } catch (err) {
        console.error("Error fetching mentor rating:", err);
      }
    };
    
    fetchMentorRating();
  }, [actualMentorId]);

  // Helper function to render rating stars
  const renderRatingStars = () => {
    const rating = mentorRating?.averageRating || 0;
    const totalFeedbacks = mentorRating?.totalFeedbacks || 0;
    
    if (totalFeedbacks === 0) return <span className="text-sm text-muted-foreground">No reviews yet</span>;
    
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    
    return (
      <div className="flex items-center gap-1">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={i} className="h-4 w-4 text-yellow-500 fill-yellow-500" />
        ))}
        {halfStar && <StarHalf className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
        <span className="text-sm ml-1 text-gray-600 dark:text-gray-300">
          ({rating.toFixed(1)}) · {totalFeedbacks} {totalFeedbacks === 1 ? 'review' : 'reviews'}
        </span>
      </div>
    );
  };

  // Handle mentorship form input changes
  const handleMentorshipInputChange = (e) => {
    const { name, value } = e.target;
    setMentorshipDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Add domain to the required domains array
  const addDomain = () => {
    if (newDomain.trim() !== "" && !mentorshipDetails.requiredDomains.includes(newDomain.trim())) {
      setMentorshipDetails(prev => ({
        ...prev,
        requiredDomains: [...prev.requiredDomains, newDomain.trim()]
      }));
      setNewDomain("");
    }
  };
  
  // Remove domain from the required domains array
  const removeDomain = (domain) => {
    setMentorshipDetails(prev => ({
      ...prev,
      requiredDomains: prev.requiredDomains.filter(d => d !== domain)
    }));
  };
  
  // Handle Enter key for adding domains
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && newDomain.trim() !== "") {
      e.preventDefault();
      addDomain();
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Validate form with all required fields
      if (!mentorshipDetails.message.trim()) {
        throw new Error("Please provide a message to the mentor");
      }
      
      if (!mentorshipDetails.goals.trim()) {
        throw new Error("Please provide your mentorship goals");
      }
      
      if (!mentorshipDetails.availability.trim()) {
        throw new Error("Please specify your availability");
      }
      
      if (!mentorshipDetails.preferredSlot) {
        throw new Error("Please select a preferred time slot");
      }
      
      // Validate the mentorId
      if (!actualMentorId) {
        throw new Error("Invalid mentor selection. Please try again or contact support.");
      }
      
      // Prepare data for API
      const requestData = {
        alumniId: actualMentorId, // Changed from 'alumni' to 'alumniId' to match API expectation
        requestMessage: mentorshipDetails.message,
        mentorshipGoals: mentorshipDetails.goals,
        timeRequired: mentorshipDetails.timeRequired,
        availability: mentorshipDetails.availability,
        meetingMode: mentorshipDetails.meetingMode,
        skillsToLearn: mentorshipDetails.requiredDomains,
        preferredSlot: mentorshipDetails.preferredSlot,
        requestedSessions: mentorshipDetails.requestedSessions
      };
      
      console.log("Submitting mentorship request:", requestData);
      
      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error("You must be logged in to request mentorship");
      }
      
      // Submit the request to the API - use the correct endpoint
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/mentorship`, // Updated endpoint
        requestData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      console.log("Mentorship request response:", response.data);
      
      // Store in localStorage to update UI status
      const pendingRequests = JSON.parse(localStorage.getItem('pendingMentorshipRequests') || '[]');
      pendingRequests.push(actualMentorId);
      localStorage.setItem('pendingMentorshipRequests', JSON.stringify(pendingRequests));
      
      // Show success message
      toast.success("Mentorship request sent successfully");
      
      // Call the onSubmit callback if it exists
      if (onSubmit) {
        onSubmit(requestData);
      }
      
      // Close the form
      onClose();
      
    } catch (err) {
      console.error("Error submitting mentorship request:", err);
      setError(err.message || "Failed to send mentorship request");
      toast.error(err.message || "Failed to send mentorship request");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-900 w-full max-w-4xl rounded-xl animate-fade-in max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-900 px-6 py-4 border-b border-border z-10 flex justify-between items-center">
          <h2 className="text-xl font-bold">Request Mentorship</h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="flex items-center mb-6">
            <div className="mr-4">
              <p className="text-lg font-medium">{actualMentorName}</p>
              <p className="text-sm text-muted-foreground">{actualMentorRole || mentor?.position || "Mentor"}</p>
              {/* Add mentor rating */}
              {renderRatingStars()}
            </div>
          </div>
          
          <p className="text-muted-foreground mb-6">
            You are requesting mentorship from <span className="font-semibold text-foreground">{actualMentorName}</span>. 
            Please provide details about what you're looking for in this mentorship.
          </p>
          
          {error && (
            <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center text-red-600 dark:text-red-400">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="message" className="block text-sm font-medium mb-2">
                Message to Mentor*
              </label>
              <textarea
                id="message"
                name="message"
                value={mentorshipDetails.message}
                onChange={handleMentorshipInputChange}
                placeholder="Introduce yourself and explain why you'd like mentorship from this alumni..."
                className="w-full p-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition h-32"
                required
              />
            </div>
            
            <div>
              <label htmlFor="goals" className="block text-sm font-medium mb-2">
                Mentorship Goals*
              </label>
              <textarea
                id="goals"
                name="goals"
                value={mentorshipDetails.goals}
                onChange={handleMentorshipInputChange}
                placeholder="What specific goals would you like to achieve through this mentorship?"
                className="w-full p-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition h-24"
                required
              />
            </div>
            
            <div>
              <label htmlFor="timeRequired" className="block text-sm font-medium mb-2">
                Mentorship Duration*
              </label>
              <select
                id="timeRequired"
                name="timeRequired"
                value={mentorshipDetails.timeRequired}
                onChange={handleMentorshipInputChange}
                className="w-full p-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition"
                required
              >
                <option value="1 month">1 month</option>
                <option value="3 months">3 months</option>
                <option value="6 months">6 months</option>
                <option value="1 year">1 year</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="preferredSlot" className="block text-sm font-medium mb-2">
                Preferred Time Slot*
              </label>
              <select
                id="preferredSlot"
                name="preferredSlot"
                value={mentorshipDetails.preferredSlot}
                onChange={handleMentorshipInputChange}
                className="w-full p-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition"
                required
              >
                <option value="">Select a preferred time slot</option>
                <option value="Weekday Mornings">Weekday Mornings (8 AM - 12 PM)</option>
                <option value="Weekday Afternoons">Weekday Afternoons (12 PM - 5 PM)</option>
                <option value="Weekday Evenings">Weekday Evenings (5 PM - 9 PM)</option>
                <option value="Weekend Mornings">Weekend Mornings (8 AM - 12 PM)</option>
                <option value="Weekend Afternoons">Weekend Afternoons (12 PM - 5 PM)</option>
                <option value="Weekend Evenings">Weekend Evenings (5 PM - 9 PM)</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="availability" className="block text-sm font-medium mb-2">
                Your Detailed Availability*
              </label>
              <input
                type="text"
                id="availability"
                name="availability"
                value={mentorshipDetails.availability}
                onChange={handleMentorshipInputChange}
                placeholder="E.g., Mondays and Wednesdays from 6-8 PM, or Sunday mornings..."
                className="w-full p-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Required Domains/Skills*
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="E.g., Machine Learning, Web Development..."
                  className="flex-1 p-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition"
                />
                <button
                  type="button"
                  onClick={addDomain}
                  className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {mentorshipDetails.requiredDomains.map((domain, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800/20 dark:text-blue-300"
                  >
                    {domain}
                    <button
                      type="button"
                      onClick={() => removeDomain(domain)}
                      className="ml-1 hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                {mentorshipDetails.requiredDomains.length === 0 && (
                  <span className="text-xs text-muted-foreground">No domains added yet</span>
                )}
              </div>
            </div>
            
            <div>
              <label htmlFor="requestedSessions" className="block text-sm font-medium mb-2">
                Number of Sessions*
              </label>
              <input
                type="number"
                id="requestedSessions"
                name="requestedSessions"
                value={mentorshipDetails.requestedSessions}
                onChange={handleMentorshipInputChange}
                min="1"
                max="20"
                className="w-full p-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                How many mentoring sessions would you like to have? (between 1 and 20)
              </p>
            </div>
            
            <div>
              <label htmlFor="meetingMode" className="block text-sm font-medium mb-2">
                Preferred Meeting Mode
              </label>
              <select
                id="meetingMode"
                name="meetingMode"
                value={mentorshipDetails.meetingMode}
                onChange={handleMentorshipInputChange}
                className="w-full p-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition"
              >
                <option value="online">Online</option>
                <option value="in-person">In-person</option>
                <option value="hybrid">Hybrid (mix of online and in-person)</option>
              </select>
            </div>
          </div>
          
          <div className="mt-8 flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-border hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors flex items-center"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : "Send Request"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorshipRequestForm;