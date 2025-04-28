import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import ProfileCard from "../components/profile/ProfileCard";
import ProfilePhotoUpload from "../components/profile/ProfilePhotoUpload";
// Make sure all your components are imported
// import User from "../components/User"; // If there's a User component, it needs to be imported

import { X, Plus, Mail, ExternalLink, MapPin, Briefcase, GraduationCap } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Profile data from backend
  const [profile, setProfile] = useState({
    name: "",
    role: "",
    avatar: "",
    company: "",
    location: "",
    experience: null,
    linkedIn: "",
    email: "",
    skills: [],
    education: "",
    interests: [],
    bio: "",
  });

  // For editing profile
  const [editForm, setEditForm] = useState({ ...profile });
  const [newSkill, setNewSkill] = useState("");
  const [newInterest, setNewInterest] = useState("");

  // Add these state variables with your other useState declarations
  const [newEducation, setNewEducation] = useState({
    institution: "",
    degree: "",
    fieldOfStudy: "",
    startYear: "",
    endYear: "",
    description: ""
  });

  // Add this useState declaration near your other state variables at the top of your component
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add userRole to your state variables
  const [userRole, setUserRole] = useState("");

  // Add this missing state variable with your other state declarations
  const [editMode, setEditMode] = useState(false);

  // Modify the newWorkExperience state to use month/year format
  const [newWorkExperience, setNewWorkExperience] = useState({
    company: "",
    position: "",
    location: "",
    startMonth: "",
    startYear: "",
    endMonth: "",
    endYear: "",
    description: "",
    current: false
  });

  // Create axios instance with authentication
  const api = axios.create({
    baseURL: 'http://localhost:5000/api',
  });

  // Add auth token to requests
  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }
    
    fetchUserProfile();
  }, [navigate]);

  // Fetch user profile from backend
  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get user role to determine which API endpoint to use
      const storedUserRole = localStorage.getItem("userRole");
      setUserRole(storedUserRole); // Store user role in state
      
      let response;
      if (storedUserRole === "student") {
        // The correct endpoint should be just /students/profile, not /students/profile/:id
        response = await api.get('/students/profile');
      } else if (storedUserRole === "alumni") {
        // The correct endpoint should be just /alumni/profile, not /alumni/profile/:id
        response = await api.get('/alumni/profile');
      } else {
        // Handle admin or unknown roles
        setError("Unsupported user role");
        setLoading(false);
        return;
      }
      
      console.log("Profile data from API:", response.data);
      
      // Transform the API response to match our profile structure
      const userData = response.data;
      const profileData = {
        name: userData.name || "",
        role: storedUserRole === "alumni" ? "Alumni" : "Student", // Use the stored user role
        avatar: userData.profilePicture?.url || userData.profilePicture || "",
        company: userData.company || userData.currentCompany || "",
        location: userData.location || "",
        experience: userData.experience || 0,
        linkedIn: userData.linkedin || userData.linkedInProfile || "",
        email: userData.email || "",
        skills: userData.skills || [],
        education: formatEducation(userData),
        interests: userData.interests || [],
        bio: userData.bio || "",
        graduationYear: userData.graduationYear || "",
        previousEducation: userData.previousEducation || [],
      };
      
      setProfile(profileData);
      setEditForm(profileData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching profile:", error);
      // Include more detailed error information
      const errorMessage = error.response?.data?.message || 
                           "Failed to load profile data. Please try again later.";
      setError(errorMessage);
      setLoading(false);
      toast.error(errorMessage);
      
      // Log detailed error information for debugging
      if (error.response) {
        console.error("Error response:", error.response.data);
        console.error("Error status:", error.response.status);
      } else if (error.request) {
        console.error("No response received:", error.request);
      }
    }
  };

  // Helper function to format education based on available data
  const formatEducation = (userData) => {
    // Handle different education field formats
    if (userData.previousEducation && Array.isArray(userData.previousEducation) && userData.previousEducation.length > 0) {
      const primaryEdu = userData.previousEducation[0];
      // Check if degree already contains "in" to avoid duplication
      const degreeText = primaryEdu.degree || '';
      const fieldText = primaryEdu.fieldOfStudy ? 
        (degreeText.toLowerCase().includes(`in ${primaryEdu.fieldOfStudy.toLowerCase()}`) ? 
          '' : ` in ${primaryEdu.fieldOfStudy}`) : '';
      return `${degreeText}${fieldText} ${primaryEdu.institution || ''}`;
    } else if (userData.education && Array.isArray(userData.education) && userData.education.length > 0) {
      const primaryEdu = userData.education[0];
      // Check if degree already contains "in" to avoid duplication
      const degreeText = primaryEdu.degree || '';
      const fieldText = primaryEdu.fieldOfStudy ? 
        (degreeText.toLowerCase().includes(`in ${primaryEdu.fieldOfStudy.toLowerCase()}`) ? 
          '' : ` in ${primaryEdu.fieldOfStudy}`) : '';
      return `${degreeText}${fieldText} ${primaryEdu.institution || ''}`;
    } else if (userData.university || userData.college) {
      // Fall back to basic education fields
      return `${userData.degree || ''} ${userData.specialization ? `in ${userData.specialization}` : ''} ${userData.university || ''} ${userData.college ? `(${userData.college})` : ''}`;
    } else {
      return '';
    }
  };

  useEffect(() => {
    // Update edit form when profile changes
    setEditForm({ ...profile });
  }, [profile]);

  const openEditModal = () => {
    setEditForm({ ...profile });
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm({
      ...editForm,
      [name]: value,
    });
  };

  const addSkill = () => {
    if (newSkill.trim() && !editForm.skills.includes(newSkill.trim())) {
      setEditForm({
        ...editForm,
        skills: [...editForm.skills, newSkill.trim()],
      });
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove) => {
    setEditForm({
      ...editForm,
      skills: editForm.skills.filter(skill => skill !== skillToRemove),
    });
  };

  const addInterest = () => {
    if (newInterest.trim() && !editForm.interests.includes(newInterest.trim())) {
      setEditForm({
        ...editForm,
        interests: [...editForm.interests, newInterest.trim()],
      });
      setNewInterest("");
    }
  };

  const removeInterest = (interestToRemove) => {
    setEditForm({
      ...editForm,
      interests: editForm.interests.filter(interest => interest !== interestToRemove),
    });
  };

  // Add this function to handle adding new work experience entries
  const addWorkExperience = () => {
    // Validate required fields
    if (!newWorkExperience.company || !newWorkExperience.position || 
        !newWorkExperience.startMonth || !newWorkExperience.startYear) {
      toast.error("Please fill in all required work experience fields");
      return;
    }
    
    // Validate years
    const currentYear = new Date().getFullYear();
    const startYear = parseInt(newWorkExperience.startYear);
    const endYear = newWorkExperience.endYear ? parseInt(newWorkExperience.endYear) : null;
    
    if (isNaN(startYear) || startYear < 1950 || startYear > currentYear) {
      toast.error("Please enter a valid start year");
      return;
    }
    
    if (!newWorkExperience.current && endYear && 
        (isNaN(endYear) || endYear < startYear || endYear > currentYear)) {
      toast.error("Please enter a valid end year");
      return;
    }

    // Format dates for display
    const startDate = `${newWorkExperience.startMonth} ${newWorkExperience.startYear}`;
    const endDate = newWorkExperience.current ? 
                    "Present" : 
                    `${newWorkExperience.endMonth} ${newWorkExperience.endYear}`;
    
    // Create a clean work experience object
    const workExpEntry = {
      id: Date.now(), // Simple unique identifier
      company: newWorkExperience.company.trim(),
      position: newWorkExperience.position.trim(),
      location: newWorkExperience.location.trim(),
      startMonth: newWorkExperience.startMonth,
      startYear: startYear,
      endMonth: newWorkExperience.current ? "" : newWorkExperience.endMonth,
      endYear: newWorkExperience.current ? "" : endYear,
      description: newWorkExperience.description?.trim() || '',
      current: newWorkExperience.current,
      // Add formatted date strings for display
      startDate: startDate,
      endDate: endDate
    };
    
    // Initialize workExperience array if it doesn't exist
    if (!editForm.workExperience) {
      editForm.workExperience = [];
    }
    
    // Add to workExperience array - ensure we create a new array to trigger state update
    setEditForm({
      ...editForm,
      workExperience: [...(editForm.workExperience || []), workExpEntry]
    });
    
    // Reset the new work experience form
    setNewWorkExperience({
      company: "",
      position: "",
      location: "",
      startMonth: "",
      startYear: "",
      endMonth: "",
      endYear: "",
      description: "",
      current: false
    });
    
    // Provide feedback
    toast.success("Work experience added successfully");
  };

  // Function to remove a work experience entry
  const removeWorkExperience = (index) => {
    const updatedWorkExperience = [...editForm.workExperience];
    updatedWorkExperience.splice(index, 1);
    
    setEditForm({
      ...editForm,
      workExperience: updatedWorkExperience
    });
    
    toast.success("Work experience removed");
  };

  // Handle current checkbox change
  const handleCurrentJobChange = (e) => {
    const isCurrentJob = e.target.checked;
    setNewWorkExperience({
      ...newWorkExperience,
      current: isCurrentJob,
      // Clear end date if it's a current job
      endMonth: isCurrentJob ? "" : newWorkExperience.endMonth,
      endYear: isCurrentJob ? "" : newWorkExperience.endYear
    });
  };

  // Fix the handleFormSubmit function to include updated work experience format
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Deep copy the form data to avoid reference issues
      const formDataToSubmit = JSON.parse(JSON.stringify(editForm));
      
      // Ensure university and college fields are included in the submission
      if (profile.role === "Alumni") {
        // For alumni, ensure these fields are properly set
        if (!formDataToSubmit.university && formDataToSubmit.previousEducation && formDataToSubmit.previousEducation.length > 0) {
          // Extract university from the first education entry if not explicitly set
          formDataToSubmit.university = formDataToSubmit.previousEducation[0].institution || '';
        }
      }
      
      // Format education data properly for the backend
      // Make sure education is processed as an array of objects with proper structure
      if (formDataToSubmit.previousEducation && Array.isArray(formDataToSubmit.previousEducation)) {
        // If we have previousEducation array, use it directly
        formDataToSubmit.education = formDataToSubmit.previousEducation.map(edu => ({
          institution: edu.institution,
          degree: edu.degree,
          fieldOfStudy: edu.fieldOfStudy,
          startYear: Number(edu.startYear) || null,
          endYear: Number(edu.endYear) || null,
          description: edu.description || ''
        }));
      } else if (formDataToSubmit.education && typeof formDataToSubmit.education === 'string') {
        // If education is a string, convert it to the expected object format
        formDataToSubmit.education = [{
          institution: formDataToSubmit.education.split(',').pop()?.trim() || '',
          degree: formDataToSubmit.degree || '',
          fieldOfStudy: formDataToSubmit.specialization || '',
          startYear: formDataToSubmit.graduationYear ? Number(formDataToSubmit.graduationYear) - 4 : null,
          endYear: formDataToSubmit.graduationYear ? Number(formDataToSubmit.graduationYear) : null,
          description: ''
        }];
        
        // Also set university from the education string if not already set
        if (!formDataToSubmit.university) {
          formDataToSubmit.university = formDataToSubmit.education[0].institution;
        }
      }
      
      // Make sure skills and interests are arrays
      if (formDataToSubmit.skills && !Array.isArray(formDataToSubmit.skills)) {
        formDataToSubmit.skills = formDataToSubmit.skills.split(',').map(skill => skill.trim());
      }
      
      if (formDataToSubmit.interests && !Array.isArray(formDataToSubmit.interests)) {
        formDataToSubmit.interests = formDataToSubmit.interests.split(',').map(interest => interest.trim());
      }
      
      // Ensure workExperience is properly formatted for submission
      if (formDataToSubmit.workExperience && Array.isArray(formDataToSubmit.workExperience)) {
        // Make sure each work experience entry has required fields
        formDataToSubmit.workExperience = formDataToSubmit.workExperience.map(exp => ({
          company: exp.company,
          position: exp.position,
          location: exp.location || "",
          startMonth: exp.startMonth,
          startYear: exp.startYear,
          endMonth: exp.current ? null : exp.endMonth,
          endYear: exp.current ? null : exp.endYear,
          description: exp.description || "",
          current: !!exp.current
        }));
        
        // If alumni, set the company field from the most recent work experience entry
        if (profile.role === "Alumni" && !formDataToSubmit.company && formDataToSubmit.workExperience.length > 0) {
          // Find the current job or the most recent one
          const currentJob = formDataToSubmit.workExperience.find(exp => exp.current) || 
                             formDataToSubmit.workExperience[0];
          formDataToSubmit.company = currentJob.company;
          formDataToSubmit.position = currentJob.position;
        }
      }
      
      console.log("Submitting profile update:", formDataToSubmit);
      
      const token = localStorage.getItem("token");
      const apiEndpoint = userRole === "alumni" ? "/api/alumni/profile" : "/api/students/profile";
      
      console.log("Using API endpoint:", apiEndpoint, "for user role:", userRole);
      
      const response = await axios.put(apiEndpoint, formDataToSubmit, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log("Profile update response:", response.data);
      
      // Refresh profile data with the new data from the server
      setProfile(response.data);
      setEditForm(response.data);
      closeEditModal();
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      const errorMessage = error.response?.data?.message || 
                           "Failed to update profile. Please try again later.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading && !profile.name) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-primary/20 rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-primary/20 rounded mb-3"></div>
          <div className="h-3 w-24 bg-primary/10 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-20 pb-12">
          <div className="container-custom">
            <div className="glass-card p-8 rounded-xl text-center">
              <h2 className="text-xl font-bold text-red-600 mb-4">Error Loading Profile</h2>
              <p className="mb-6">{error}</p>
              <button 
                onClick={() => fetchUserProfile()}
                className="px-4 py-2 bg-primary text-white rounded-lg"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Add this function to handle profile photo updates
  const handleProfilePhotoUpdated = (newProfilePicture) => {
    // Update the profile state with the new profile picture (could be object or string)
    setProfile(prev => ({
      ...prev,
      avatar: newProfilePicture // This could now be an object with url property
    }));
  };

  // Add this function with your other handler functions
  const updateGraduationYear = (e) => {
    const value = e.target.value;
    // Basic validation for graduation year
    if (value === '' || (Number(value) >= 1950 && Number(value) <= new Date().getFullYear() + 10)) {
      setEditForm({
        ...editForm,
        graduationYear: value
      });
    }
  };

  // Add this function to handle adding new education entries
  const addEducation = () => {
    // Validate required fields
    if (!newEducation.institution || !newEducation.degree || !newEducation.fieldOfStudy || !newEducation.startYear) {
      toast.error("Please fill in all required education fields");
      return;
    }
    
    // Validate years
    const currentYear = new Date().getFullYear();
    const startYear = parseInt(newEducation.startYear);
    const endYear = newEducation.endYear ? parseInt(newEducation.endYear) : null;
    
    if (isNaN(startYear) || startYear < 1950 || startYear > currentYear) {
      toast.error("Please enter a valid start year");
      return;
    }
    
    if (endYear && (isNaN(endYear) || endYear < startYear || endYear > currentYear + 10)) {
      toast.error("Please enter a valid end year");
      return;
    }
    
    // Create a new education entry object
    const educationEntry = {
      institution: newEducation.institution.trim(),
      degree: newEducation.degree.trim(),
      fieldOfStudy: newEducation.fieldOfStudy.trim(),
      startYear: startYear,
      endYear: endYear,
      description: newEducation.description?.trim() || ''
    };
    
    // Initialize previousEducation array if it doesn't exist
    const previousEducation = editForm.previousEducation || [];
    
    // Add the new education entry
    setEditForm({
      ...editForm,
      previousEducation: [...previousEducation, educationEntry]
    });
    
    // Reset the new education form
    setNewEducation({
      institution: "",
      degree: "",
      fieldOfStudy: "",
      startYear: "",
      endYear: "",
      description: ""
    });
    
    toast.success("Education added successfully");
  };

  // Add this function to remove education entries
  const removeEducation = (index) => {
    const updatedEducation = [...editForm.previousEducation];
    updatedEducation.splice(index, 1);
    
    setEditForm({
      ...editForm,
      previousEducation: updatedEducation
    });
    
    toast.success("Education entry removed");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-12">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              {/* <User /> */}
              {profile && (
                <ProfileCard
                  name={profile.name}
                  role={profile.role}
                  avatar={profile.avatar}
                  company={profile.company}
                  location={profile.location}
                  experience={profile.experience}
                  linkedIn={profile.linkedIn}
                  email={profile.email}
                  skills={profile.skills}
                  education={profile.education}
                  interests={profile.interests}
                  bio={profile.bio}
                  onEditProfile={openEditModal}
                  graduationYear={profile.graduationYear}
                  previousEducation={profile.previousEducation}
                />
              )}
            </div>
            
            {/* Rest of the profile content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Profile Edit Modal */}
              {isEditModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                  <div className="bg-background rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                    <div className="p-6">
                      <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold">Edit Profile</h2>
                        <button 
                          onClick={closeEditModal}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                      
                      {/* Add the profile photo upload component */}
                      <div className="flex justify-center mb-6">
                        <ProfilePhotoUpload 
                          currentAvatar={profile.avatar}
                          onPhotoUpdated={handleProfilePhotoUpdated}
                        />
                      </div>

                      <form onSubmit={handleFormSubmit} className="space-y-4">
                        {/* Basic Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label htmlFor="name" className="block text-sm font-medium">
                              Full Name
                            </label>
                            <input
                              type="text"
                              id="name"
                              name="name"
                              value={editForm.name}
                              onChange={handleInputChange}
                              className="w-full p-2 border rounded-lg"
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <label htmlFor="email" className="block text-sm font-medium">
                              Email
                            </label>
                            <input
                              type="email"
                              id="email"
                              name="email"
                              value={editForm.email}
                              onChange={handleInputChange}
                              className="w-full p-2 border rounded-lg"
                              readOnly
                              disabled
                            />
                            <p className="text-xs text-gray-500">Email cannot be changed</p>
                          </div>

                          <div className="space-y-2">
                            <label htmlFor="location" className="block text-sm font-medium">
                              Location
                            </label>
                            <input
                              type="text"
                              id="location"
                              name="location"
                              value={editForm.location}
                              onChange={handleInputChange}
                              className="w-full p-2 border rounded-lg"
                              placeholder="City, Country"
                            />
                          </div>

                          <div className="space-y-2">
                            <label htmlFor="linkedIn" className="block text-sm font-medium">
                              LinkedIn Profile
                            </label>
                            <input
                              type="url"
                              id="linkedIn"
                              name="linkedIn"
                              value={editForm.linkedIn}
                              onChange={handleInputChange}
                              className="w-full p-2 border rounded-lg"
                              placeholder="https://linkedin.com/in/yourusername"
                            />
                          </div>

                          {/* Show company and experience fields only for alumni */}
                          {profile.role === "Alumni" && (
                            <>
                              <div className="space-y-2">
                                <label htmlFor="company" className="block text-sm font-medium">
                                  Company/Organization
                                </label>
                                <input
                                  type="text"
                                  id="company"
                                  name="company"
                                  value={editForm.company}
                                  onChange={handleInputChange}
                                  className="w-full p-2 border rounded-lg"
                                  placeholder="Where you work"
                                />
                              </div>

                              <div className="space-y-2">
                                <label htmlFor="experience" className="block text-sm font-medium">
                                  Years of Experience
                                </label>
                                <input
                                  type="number"
                                  id="experience"
                                  name="experience"
                                  value={editForm.experience}
                                  onChange={handleInputChange}
                                  className="w-full p-2 border rounded-lg"
                                  min="0"
                                  placeholder="0"
                                />
                              </div>
                            </>
                          )}
                        </div>

                        {/* Bio */ }
                        <div className="space-y-2">
                          <label htmlFor="bio" className="block text-sm font-medium">
                            Bio
                          </label>
                          <textarea
                            id="bio"
                            name="bio"
                            value={editForm.bio}
                            onChange={handleInputChange}
                            rows="3"
                            className="w-full p-2 border rounded-lg resize-none"
                            placeholder="Tell others about yourself..."
                          ></textarea>
                        </div>

                        {/* Education Section */}
                        <div className="space-y-4 mt-4 border-t pt-4">
                          <h3 className="text-lg font-medium">Education</h3>
                          
                          {/* Current Education/Graduation Year */}
                          <div className="space-y-2">
                            <label htmlFor="graduationYear" className="block text-sm font-medium">
                              Graduation Year {profile.role === "Alumni" && <span className="text-red-500">*</span>}
                            </label>
                            <input
                              type="number"
                              id="graduationYear"
                              name="graduationYear"
                              value={editForm.graduationYear}
                              onChange={updateGraduationYear}
                              min="1950"
                              max={new Date().getFullYear() + 10}
                              className="w-full p-2 border rounded-lg"
                              placeholder="e.g., 2022"
                              required={profile.role === "Alumni"}
                            />
                            <p className="text-xs text-gray-500">Enter your graduation year (actual or expected)</p>
                          </div>
                          
                          {/* Education */}
                          <div className="space-y-2 mt-4">
                            <label className="flex justify-between text-sm font-medium">
                              <span>Education</span>
                              <span className="text-xs text-gray-500">Optional</span>
                            </label>
                            
                            {/* List of added education */}
                            {editForm.previousEducation && editForm.previousEducation.length > 0 && (
                              <div className="space-y-3 mb-4">
                                {editForm.previousEducation.map((edu, index) => (
                                  <div key={index} className="p-3 border rounded-lg bg-gray-50 dark:bg-gray-800 relative">
                                    <button
                                      type="button"
                                      onClick={() => removeEducation(index)}
                                      className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                                    >
                                      <X className="h-4 w-4" />
                                    </button>
                                    <p className="font-medium">{edu.degree} in {edu.fieldOfStudy}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">{edu.institution}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                      {edu.startYear} - {edu.endYear || 'Present'}
                                    </p>
                                    {edu.description && (
                                      <p className="text-sm text-gray-500 mt-1 italic">{edu.description}</p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            {/* Add new education form */}
                            <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800/50">
                              <h4 className="text-sm font-medium mb-3">Add Education</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <label htmlFor="institution" className="block text-xs font-medium mb-1">
                                    Institution
                                  </label>
                                  <input
                                    type="text"
                                    id="institution"
                                    value={newEducation.institution || ""}
                                    onChange={(e) => setNewEducation({...newEducation, institution: e.target.value})}
                                    className="w-full p-2 border rounded-lg text-sm"
                                    placeholder="University/College name"
                                  />
                                </div>
                                <div>
                                  <label htmlFor="degree" className="block text-xs font-medium mb-1">
                                    Degree
                                  </label>
                                  <input
                                    type="text"
                                    id="degree"
                                    value={newEducation.degree || ""}
                                    onChange={(e) => setNewEducation({...newEducation, degree: e.target.value})}
                                    className="w-full p-2 border rounded-lg text-sm"
                                    placeholder="e.g., Bachelor's, Master's"
                                  />
                                </div>
                                <div>
                                  <label htmlFor="fieldOfStudy" className="block text-xs font-medium mb-1">
                                    Field of Study
                                  </label>
                                  <input
                                    type="text"
                                    id="fieldOfStudy"
                                    value={newEducation.fieldOfStudy || ""}
                                    onChange={(e) => setNewEducation({...newEducation, fieldOfStudy: e.target.value})}
                                    className="w-full p-2 border rounded-lg text-sm"
                                    placeholder="e.g., Computer Science"
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <label htmlFor="startYear" className="block text-xs font-medium mb-1">
                                      Start Year
                                    </label>
                                    <input
                                      type="number"
                                      id="startYear"
                                      value={newEducation.startYear || ""}
                                      onChange={(e) => setNewEducation({...newEducation, startYear: e.target.value})}
                                      min="1950"
                                      max={new Date().getFullYear()}
                                      className="w-full p-2 border rounded-lg text-sm"
                                      placeholder="Year"
                                    />
                                  </div>
                                  <div>
                                    <label htmlFor="endYear" className="block text-xs font-medium mb-1">
                                      End Year
                                    </label>
                                    <input
                                      type="number"
                                      id="endYear"
                                      value={newEducation.endYear || ""}
                                      onChange={(e) => setNewEducation({...newEducation, endYear: e.target.value})}
                                      min="1950"
                                      max={new Date().getFullYear() + 10}
                                      className="w-full p-2 border rounded-lg text-sm"
                                      placeholder="Or blank if current"
                                    />
                                  </div>
                                </div>
                                <div className="md:col-span-2">
                                  <label htmlFor="description" className="block text-xs font-medium mb-1">
                                    Description (Optional)
                                  </label>
                                  <textarea
                                    id="description"
                                    value={newEducation.description || ""}
                                    onChange={(e) => setNewEducation({...newEducation, description: e.target.value})}
                                    rows="2"
                                    className="w-full p-2 border rounded-lg text-sm"
                                    placeholder="Brief description or accomplishments"
                                  ></textarea>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={addEducation}
                                className="mt-3 px-3 py-1.5 bg-primary/10 text-primary text-sm rounded flex items-center"
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                Add Education
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Work Experience Section */}
                        <div className="space-y-4 mt-4 border-t pt-4">
                          <h3 className="text-lg font-medium">Work Experience</h3>
                          
                          {/* List of added work experiences */}
                          {editForm.workExperience && editForm.workExperience.length > 0 && (
                            <div className="space-y-3 mb-4">
                              {editForm.workExperience.map((exp, index) => (
                                <div key={index} className="p-3 border rounded-lg bg-gray-50 dark:bg-gray-800 relative">
                                  <button
                                    type="button"
                                    onClick={() => removeWorkExperience(index)}
                                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                  <p className="font-medium">{exp.position}</p>
                                  <p className="text-sm text-gray-600 dark:text-gray-300">{exp.company}</p>
                                  <p className="text-sm text-gray-600 dark:text-gray-300">
                                    {exp.startMonth} {exp.startYear} - {exp.current ? 'Present' : `${exp.endMonth} ${exp.endYear}`}
                                  </p>
                                  {exp.location && (
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{exp.location}</p>
                                  )}
                                  {exp.description && (
                                    <p className="text-sm text-gray-500 mt-1 italic">{exp.description}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {/* Add new work experience form */}
                          <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800/50">
                            <h4 className="text-sm font-medium mb-3">Add Work Experience</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <label htmlFor="position" className="block text-xs font-medium mb-1">
                                  Position/Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                  type="text"
                                  id="position"
                                  value={newWorkExperience.position}
                                  onChange={(e) => setNewWorkExperience({...newWorkExperience, position: e.target.value})}
                                  className="w-full p-2 border rounded-lg text-sm"
                                  placeholder="e.g., Software Engineer"
                                />
                              </div>
                              <div>
                                <label htmlFor="company" className="block text-xs font-medium mb-1">
                                  Company <span className="text-red-500">*</span>
                                </label>
                                <input
                                  type="text"
                                  id="company"
                                  value={newWorkExperience.company}
                                  onChange={(e) => setNewWorkExperience({...newWorkExperience, company: e.target.value})}
                                  className="w-full p-2 border rounded-lg text-sm"
                                  placeholder="e.g., Google"
                                />
                              </div>
                              <div>
                                <label htmlFor="location" className="block text-xs font-medium mb-1">
                                  Location
                                </label>
                                <input
                                  type="text"
                                  id="location"
                                  value={newWorkExperience.location}
                                  onChange={(e) => setNewWorkExperience({...newWorkExperience, location: e.target.value})}
                                  className="w-full p-2 border rounded-lg text-sm"
                                  placeholder="e.g., San Francisco, CA"
                                />
                              </div>
                              
                              <div className="flex items-center mt-2 md:mt-6">
                                <input
                                  type="checkbox"
                                  id="currentPosition"
                                  checked={newWorkExperience.current}
                                  onChange={handleCurrentJobChange}
                                  className="mr-2"
                                />
                                <label htmlFor="currentPosition" className="text-xs font-medium">
                                  I currently work here
                                </label>
                              </div>
                              
                              {/* New start month/year selection - remove the required attribute */}
                              <div>
                                <label className="block text-xs font-medium mb-1">
                                  Start Date <span className="text-red-500">*</span>
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                  <select
                                    value={newWorkExperience.startMonth}
                                    onChange={(e) => setNewWorkExperience({...newWorkExperience, startMonth: e.target.value})}
                                    className="p-2 border rounded-lg text-sm"
                                    form="workExperienceForm" // Separate form to prevent validation on main form
                                  >
                                    <option value="">Month</option>
                                    <option value="January">January</option>
                                    <option value="February">February</option>
                                    <option value="March">March</option>
                                    <option value="April">April</option>
                                    <option value="May">May</option>
                                    <option value="June">June</option>
                                    <option value="July">July</option>
                                    <option value="August">August</option>
                                    <option value="September">September</option>
                                    <option value="October">October</option>
                                    <option value="November">November</option>
                                    <option value="December">December</option>
                                  </select>
                                  <input
                                    type="number"
                                    placeholder="Year"
                                    value={newWorkExperience.startYear}
                                    onChange={(e) => setNewWorkExperience({...newWorkExperience, startYear: e.target.value})}
                                    min="1950"
                                    max={new Date().getFullYear()}
                                    className="p-2 border rounded-lg text-sm"
                                    form="workExperienceForm" // Separate form to prevent validation on main form
                                  />
                                </div>
                              </div>
                              
                              {/* New end month/year selection - remove the required attribute */}
                              <div>
                                <label className="block text-xs font-medium mb-1">
                                  End Date {!newWorkExperience.current && <span className="text-red-500">*</span>}
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                  <select
                                    value={newWorkExperience.endMonth}
                                    onChange={(e) => setNewWorkExperience({...newWorkExperience, endMonth: e.target.value})}
                                    className="p-2 border rounded-lg text-sm"
                                    disabled={newWorkExperience.current}
                                    form="workExperienceForm" // Separate form to prevent validation on main form
                                  >
                                    <option value="">Month</option>
                                    <option value="January">January</option>
                                    <option value="February">February</option>
                                    <option value="March">March</option>
                                    <option value="April">April</option>
                                    <option value="May">May</option>
                                    <option value="June">June</option>
                                    <option value="July">July</option>
                                    <option value="August">August</option>
                                    <option value="September">September</option>
                                    <option value="October">October</option>
                                    <option value="November">November</option>
                                    <option value="December">December</option>
                                  </select>
                                  <input
                                    type="number"
                                    placeholder="Year"
                                    value={newWorkExperience.endYear}
                                    onChange={(e) => setNewWorkExperience({...newWorkExperience, endYear: e.target.value})}
                                    min="1950"
                                    max={new Date().getFullYear()}
                                    className="p-2 border rounded-lg text-sm"
                                    disabled={newWorkExperience.current}
                                    form="workExperienceForm" // Separate form to prevent validation on main form
                                  />
                                </div>
                              </div>
                              
                              <div className="md:col-span-2">
                                <label htmlFor="jobDescription" className="block text-xs font-medium mb-1">
                                  Description (Optional)
                                </label>
                                <textarea
                                  id="jobDescription"
                                  value={newWorkExperience.description}
                                  onChange={(e) => setNewWorkExperience({...newWorkExperience, description: e.target.value})}
                                  rows="3"
                                  className="w-full p-2 border rounded-lg text-sm"
                                  placeholder="Describe your responsibilities and achievements"
                                  form="workExperienceForm" // Separate form to prevent validation on main form
                                ></textarea>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={addWorkExperience}
                              className="mt-3 px-3 py-1.5 bg-primary/10 text-primary text-sm rounded flex items-center"
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Add Experience
                            </button>
                          </div>
                        </div>

                        {/* Skills */}
                        <div className="space-y-2">
                          <label className="block text-sm font-medium">
                            Skills
                          </label>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {editForm.skills.map((skill, index) => (
                              <div 
                                key={index} 
                                className="bg-secondary text-secondary-foreground px-2 py-1 rounded-lg text-xs flex items-center"
                              >
                                {skill}
                                <button 
                                  type="button"
                                  onClick={() => removeSkill(skill)}
                                  className="ml-1 text-muted-foreground hover:text-foreground"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                          <div className="flex items-center">
                            <input
                              type="text"
                              id="newSkill"
                              value={newSkill}
                              onChange={(e) => setNewSkill(e.target.value)}
                              className="flex-1 p-2 border rounded-lg"
                              placeholder="Add a new skill"
                            />
                            <button
                              type="button"
                              onClick={addSkill}
                              className="ml-2 bg-primary text-white p-2 rounded-lg"
                              disabled={!newSkill.trim()}
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {/* Interests */}
                        <div className="space-y-2">
                          <label className="block text-sm font-medium">
                            Interests
                          </label>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {editForm.interests.map((interest, index) => (
                              <div 
                                key={index} 
                                className="bg-secondary/50 text-secondary-foreground px-2 py-1 rounded-lg text-xs flex items-center"
                              >
                                {interest}
                                <button 
                                  type="button"
                                  onClick={() => removeInterest(interest)}
                                  className="ml-1 text-muted-foreground hover:text-foreground"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                          <div className="flex items-center">
                            <input
                              type="text"
                              id="newInterest"
                              value={newInterest}
                              onChange={(e) => setNewInterest(e.target.value)}
                              className="flex-1 p-2 border rounded-lg"
                              placeholder="Add a new interest"
                            />
                            <button
                              type="button"
                              onClick={addInterest}
                              className="ml-2 bg-primary text-white p-2 rounded-lg"
                              disabled={!newInterest.trim()}
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        <div className="flex justify-end space-x-2 pt-4 border-t">
                          <button
                            type="button"
                            onClick={closeEditModal}
                            className="px-4 py-2 border rounded-lg text-sm"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-2 bg-primary text-white rounded-lg text-sm"
                            disabled={loading}
                          >
                            {loading ? "Saving..." : "Save Changes"}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Experience Section */}
              <div className="glass-card rounded-xl p-6 animate-scale-in animate-delay-100">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold">Experience</h3>
                  <button 
                    onClick={openEditModal}
                    className="text-sm text-primary hover:underline"
                  >
                    Edit Profile
                  </button>
                </div>
                
                {/* Display work experience entries */}
                {profile.workExperience && profile.workExperience.length > 0 ? (
                  <div className="space-y-4">
                    {profile.workExperience.map((exp, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="w-12 h-12 rounded bg-primary/10 text-primary flex items-center justify-center">
                          <Briefcase className="h-6 w-6" />
                        </div>
                        <div>
                          <h4 className="font-bold">{exp.position}</h4>
                          <p className="text-muted-foreground">{exp.company}</p>
                          <p className="text-sm text-muted-foreground">
                            {exp.startMonth} {exp.startYear} - {exp.current ? 'Present' : `${exp.endMonth} ${exp.endYear}`}
                          </p>
                          {exp.location && (
                            <p className="text-sm text-muted-foreground">{exp.location}</p>
                          )}
                          {exp.description && (
                            <p className="mt-2">{exp.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : profile.company ? (
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded bg-primary/10 text-primary flex items-center justify-center">
                      <Briefcase className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-bold">{profile.role === "Alumni" ? profile.company : "Student"}</h4>
                      <p className="text-muted-foreground">{profile.role}</p>
                      {profile.experience > 0 && (
                        <p className="text-sm text-muted-foreground">
                          {profile.experience} {profile.experience === 1 ? 'year' : 'years'} of experience
                        </p>
                      )}
                      <p className="mt-2">{profile.bio}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No experience information added yet. Edit your profile to add details.</p>
                )}
              </div>

              {/* Education Section */}
              <div className="glass-card rounded-xl p-6 animate-scale-in animate-delay-200">
                <h3 className="text-xl font-bold mb-4">Education</h3>
                {profile.education ? (
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded bg-primary/10 text-primary flex items-center justify-center">
                      <GraduationCap className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-bold">
                        {typeof profile.education === 'string' 
                          ? profile.education 
                          : `${profile.graduationYear ? `Class of ${profile.graduationYear}` : 'Current Student'}`}
                      </h4>
                      {profile.previousEducation && profile.previousEducation.length > 0 && (
                        <div className="mt-2">
                          {profile.previousEducation.map((edu, index) => (
                            <div key={index} className="text-sm text-muted-foreground mb-1">
                              {/* Display degree and field without redundant "in" */}
                              {edu.degree} {edu.fieldOfStudy ? 
                                (edu.degree.toLowerCase().includes(`in ${edu.fieldOfStudy.toLowerCase()}`) ? 
                                  '' : `in ${edu.fieldOfStudy}`) : ''} {edu.institution} ({edu.startYear} - {edu.endYear || 'Present'})
                            </div>
                          ))}
                        </div>
                      )}
                      {profile.role === "Student" && (
                        <p className="text-muted-foreground">Current Student</p>
                      )}
                      {profile.role === "Alumni" && profile.graduationYear && (
                        <p className="text-muted-foreground">
                          {parseInt(profile.graduationYear) - 4} - {profile.graduationYear} 
                          <span className="ml-2">(4 years)</span>
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No education information available.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;