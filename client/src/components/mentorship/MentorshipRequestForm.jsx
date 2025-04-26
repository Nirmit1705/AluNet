import React, { useState } from "react";
import { X, Users, Calendar } from "lucide-react";

const MentorshipRequestForm = ({ mentorName, mentorRole, mentorEmail, onClose }) => {
  const [mentorshipDetails, setMentorshipDetails] = useState({
    message: "",
    goals: "",
    timeRequired: "3 months",
    availability: "",
    meetingMode: "online",
    requiredDomains: [],
    preferredSlot: ""
  });
  const [newDomain, setNewDomain] = useState("");
  
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
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Here you would typically send the mentorship request to your backend
    // For now, we'll just log it and close the form
    console.log("Sending mentorship request to", mentorName, mentorEmail, "with details:", mentorshipDetails);
    
    // Show success message to user
    alert(`Mentorship request sent to ${mentorName}!`);
    
    // Close the form
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-xl animate-fade-in max-h-[90vh] overflow-y-auto">
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
          <p className="text-muted-foreground mb-6">
            You are requesting mentorship from <span className="font-semibold text-foreground">{mentorName}</span>. 
            Please provide details about what you're looking for in this mentorship.
          </p>
          
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
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors"
            >
              Send Request
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorshipRequestForm; 