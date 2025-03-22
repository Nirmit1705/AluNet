import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Briefcase, MapPin, Calendar, ExternalLink, Mail, BookOpen, Award, Check, X, Clock, Users } from "lucide-react";

const ProfileCard = ({
  name,
  role,
  avatar,
  company,
  location,
  experience,
  linkedIn,
  email,
  skills,
  education,
  interests,
}) => {
  const [connectionSent, setConnectionSent] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [isMentorshipModalOpen, setIsMentorshipModalOpen] = useState(false);
  const [mentorshipDetails, setMentorshipDetails] = useState({
    message: "",
    goals: "",
    timeRequired: "3 months", // Default time period
    availability: "",
    meetingMode: "online"
  });
  const [isStudent, setIsStudent] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if this is the user's own profile
    const loggedInUserName = localStorage.getItem("userName");
    const loggedInUserEmail = localStorage.getItem("userEmail");
    const userRole = localStorage.getItem("userRole");
    
    // Set if user is a student
    setIsStudent(userRole === "student");
    
    if ((loggedInUserName && loggedInUserName === name) || 
        (loggedInUserEmail && loggedInUserEmail === email)) {
      setIsOwnProfile(true);
    }
  }, [name, email]);
  
  // Handle connect button click
  const handleConnect = () => {
    // If already connected, navigate to messages
    if (connectionSent) {
      navigate(`/messages/${name.toLowerCase().replace(/\s+/g, '-')}`);
    } else {
      // Otherwise, send connection request
      setConnectionSent(true);
      // In a real app, this would send a connection request to the backend
      setTimeout(() => {
        alert(`Connection request sent to ${name}`);
      }, 500);
    }
  };
  
  // Handle requesting mentorship
  const handleRequestMentorship = () => {
    setIsMentorshipModalOpen(true);
  };
  
  // Handle mentorship form input changes
  const handleMentorshipInputChange = (e) => {
    const { name, value } = e.target;
    setMentorshipDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Submit mentorship request
  const submitMentorshipRequest = () => {
    // Validate form
    if (!mentorshipDetails.message || !mentorshipDetails.goals || !mentorshipDetails.availability) {
      alert("Please fill all required fields");
      return;
    }
    
    // In a real app, this would send a mentorship request to the backend
    console.log("Sending mentorship request:", mentorshipDetails);
    
    // Close modal and show confirmation
    setIsMentorshipModalOpen(false);
    alert(`Mentorship request sent to ${name}`);
    
    // Reset form
    setMentorshipDetails({
      message: "",
      goals: "",
      timeRequired: "3 months",
      availability: "",
      meetingMode: "online"
    });
  };

  return (
    <div className="glass-card rounded-2xl overflow-hidden animate-scale-in">
      {/* Profile header with banner */}
      <div className="relative h-40 bg-gradient-to-r from-blue-500 to-indigo-600">
        <div className="absolute -bottom-16 left-8">
          <div className="relative">
            <img
              src={avatar}
              alt={name}
              className="w-32 h-32 rounded-xl object-cover border-4 border-white shadow-md"
            />
            <div className="absolute bottom-2 right-2 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
        </div>
      </div>

      {/* Profile information */}
      <div className="pt-20 px-8 pb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-2xl font-bold">{name}</h3>
            <p className="text-muted-foreground">{role}</p>
          </div>
          {!isOwnProfile && (
            <div className="flex gap-2">
              <button
                onClick={handleConnect}
                className={`${
                  connectionSent 
                    ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400" 
                    : "button-primary"
                } text-sm px-4 py-2 rounded-lg flex items-center space-x-1 transition-colors`}
              >
                {connectionSent ? (
                  <>
                    <Check className="h-4 w-4 mr-1" />
                    <span>Connected</span>
                  </>
                ) : (
                  "Connect"
                )}
              </button>
              
              {/* Only show Request Mentorship button for students viewing alumni profiles */}
              {isStudent && role.toLowerCase().includes('alumni') && (
                <button
                  onClick={handleRequestMentorship}
                  className="button-secondary text-sm px-4 py-2 rounded-lg flex items-center transition-colors"
                >
                  <Users className="h-4 w-4 mr-1" />
                  <span>Request Mentorship</span>
                </button>
              )}
            </div>
          )}
        </div>

        <div className="space-y-1 mb-6">
          {company && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Briefcase className="h-4 w-4 mr-2" />
              <span>{company}</span>
            </div>
          )}
          {location && (
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mr-2" />
              <span>{location}</span>
            </div>
          )}
          {experience && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 mr-2" />
              <span>{experience} years of experience</span>
            </div>
          )}
          {linkedIn && (
            <div className="flex items-center text-sm text-primary">
              <ExternalLink className="h-4 w-4 mr-2" />
              <a 
                href={linkedIn} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:underline"
              >
                LinkedIn Profile
              </a>
            </div>
          )}
          <div className="flex items-center text-sm text-muted-foreground">
            <Mail className="h-4 w-4 mr-2" />
            <a 
              href={`mailto:${email}`} 
              className="hover:text-primary transition-colors"
            >
              {email}
            </a>
          </div>
          {education && (
            <div className="flex items-center text-sm text-muted-foreground">
              <BookOpen className="h-4 w-4 mr-2" />
              <span>{education}</span>
            </div>
          )}
        </div>

        <div className="mb-6">
          <h4 className="font-medium mb-3">Skills</h4>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800/20 dark:text-blue-300"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {interests && (
          <div>
            <h4 className="font-medium mb-3">Interests</h4>
            <div className="flex flex-wrap gap-2">
              {interests.map((interest, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-800/20 dark:text-purple-300"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Mentorship Request Modal */}
      {isMentorshipModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-xl animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-900 px-6 py-4 border-b border-border z-10 flex justify-between items-center">
              <h2 className="text-xl font-bold">Request Mentorship</h2>
              <button 
                onClick={() => setIsMentorshipModalOpen(false)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6">
              <p className="text-muted-foreground mb-6">
                You are requesting mentorship from <span className="font-semibold text-foreground">{name}</span>. 
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
                  <label htmlFor="availability" className="block text-sm font-medium mb-2">
                    Your Availability*
                  </label>
                  <input
                    type="text"
                    id="availability"
                    name="availability"
                    value={mentorshipDetails.availability}
                    onChange={handleMentorshipInputChange}
                    placeholder="E.g., Weekday evenings, Friday afternoons..."
                    className="w-full p-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition"
                    required
                  />
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
                  onClick={() => setIsMentorshipModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-border hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={submitMentorshipRequest}
                  className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors"
                >
                  Send Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileCard; 