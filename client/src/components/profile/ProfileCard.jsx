import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Briefcase, MapPin, Calendar, ExternalLink, Mail, BookOpen, Award, Check, X, Clock, Users, GraduationCap, Edit } from "lucide-react";
import MentorshipRequestForm from "../mentorship/MentorshipRequestForm";

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
  onEditProfile,
  bio,
}) => {
  const [connectionSent, setConnectionSent] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [isMentorshipModalOpen, setIsMentorshipModalOpen] = useState(false);
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
  
  // Handle edit profile button click
  const handleEditProfile = () => {
    if (onEditProfile) {
      onEditProfile();
    }
  };
  
  // Handle requesting mentorship
  const handleRequestMentorship = () => {
    setIsMentorshipModalOpen(true);
  };
  
  // Submit mentorship request
  const handleMentorshipSubmit = (formData) => {
    // In a real app, this would send a mentorship request to the backend
    console.log("Sending mentorship request:", formData);
    
    // Close modal and show confirmation
    setIsMentorshipModalOpen(false);
    alert(`Mentorship request sent to ${name}`);
  };
  
  // Cancel mentorship request
  const cancelMentorshipRequest = () => {
    setIsMentorshipModalOpen(false);
  };

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      {/* Profile header with banner */}
      <div className="relative h-40 bg-gradient-to-r from-blue-500 to-indigo-600">
        <div className="absolute -bottom-16 left-8">
          <div className="relative">
            <img
              src={avatar}
              alt={name}
              className="w-32 h-32 rounded-xl object-cover border-4 border-white dark:border-white/90 shadow-md"
            />
            <div className="absolute bottom-2 right-2 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
            
            {/* Edit button overlay */}
            {isOwnProfile && onEditProfile && (
              <button 
                onClick={handleEditProfile}
                className="absolute top-2 right-2 bg-primary text-white p-1.5 rounded-full shadow-lg hover:bg-primary/90 transition-colors"
                aria-label="Edit Profile"
              >
                <Edit className="h-4 w-4" />
              </button>
            )}
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
          
          <div className="flex flex-col gap-2">
            {isOwnProfile ? (
              <button
                onClick={handleEditProfile}
                className="bg-primary/10 text-primary hover:bg-primary/20 text-sm px-4 py-2 rounded-lg flex items-center space-x-1 transition-colors"
              >
                <Edit className="h-4 w-4 mr-1" />
                <span>Edit Profile</span>
              </button>
            ) : (
              <>
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
                    <>
                      <Users className="h-4 w-4 mr-1" />
                      <span>Connect</span>
                    </>
                  )}
                </button>
                
                {/* Only show Request Mentorship button for students viewing alumni profiles */}
                {isStudent && role === "Alumni" && (
                  <button
                    onClick={handleRequestMentorship}
                    className="button-secondary text-sm px-4 py-2 rounded-lg flex items-center transition-colors"
                  >
                    <GraduationCap className="h-4 w-4 mr-1" />
                    <span>Request Mentorship</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {company && (
          <div className="flex items-center mb-2">
            <Briefcase className="h-4 w-4 text-muted-foreground mr-2" />
            <p className="text-sm">{company}{experience && ` • ${experience} years`}</p>
          </div>
        )}

        {location && (
          <div className="flex items-center mb-2">
            <MapPin className="h-4 w-4 text-muted-foreground mr-2" />
            <p className="text-sm">{location}</p>
          </div>
        )}

        {(email || linkedIn) && (
          <div className="flex items-center mb-4">
            {email && (
              <div className="flex items-center mr-3">
                <Mail className="h-4 w-4 text-muted-foreground mr-1" />
                <a href={`mailto:${email}`} className="text-sm text-primary hover:underline">
                  {email}
                </a>
              </div>
            )}
            {linkedIn && (
              <div className="flex items-center">
                <ExternalLink className="h-4 w-4 text-muted-foreground mr-1" />
                <a href={linkedIn} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                  LinkedIn
                </a>
              </div>
            )}
          </div>
        )}

        {/* Bio/About section */}
        {bio && (
          <div className="mb-4">
            <h4 className="font-semibold mb-2">About</h4>
            <p className="text-sm text-muted-foreground">{bio}</p>
          </div>
        )}

        {/* Skills section */}
        {skills && skills.length > 0 && (
          <div className="mb-4">
            <h4 className="font-semibold mb-2">Skills</h4>
            <div className="flex flex-wrap gap-1">
              {skills.map((skill, index) => (
                <span
                  key={index}
                  className="bg-secondary text-secondary-foreground px-2 py-1 rounded-lg text-xs"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Education section */}
        {education && (
          <div className="mb-4">
            <h4 className="font-semibold mb-2">Education</h4>
            <div className="flex items-start">
              <GraduationCap className="h-4 w-4 text-muted-foreground mr-2 mt-0.5" />
              <p className="text-sm">{education}</p>
            </div>
          </div>
        )}

        {/* Interests section */}
        {interests && interests.length > 0 && (
          <div className="mb-4">
            <h4 className="font-semibold mb-2">Interests</h4>
            <div className="flex flex-wrap gap-1">
              {interests.map((interest, index) => (
                <span
                  key={index}
                  className="bg-secondary/50 text-secondary-foreground px-2 py-1 rounded-lg text-xs"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mentorship request modal */}
      {isMentorshipModalOpen && (
        <MentorshipRequestForm
          mentorName={name}
          mentorRole={role}
          mentorEmail={email}
          onClose={() => setIsMentorshipModalOpen(false)}
        />
      )}
    </div>
  );
};

export default ProfileCard; 