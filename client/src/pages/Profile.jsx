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
      const userRole = localStorage.getItem("userRole");
      
      let response;
      if (userRole === "student") {
        response = await api.get('/students/profile');
      } else if (userRole === "alumni") {
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
        role: userRole === "alumni" ? "Alumni" : "Student",
        avatar: userData.profilePicture || "",
        company: userData.company || userData.currentCompany || "",
        location: userData.location || "",
        experience: userData.experience || 0,
        linkedIn: userData.linkedin || "",
        email: userData.email || "",
        skills: userData.skills || [],
        education: formatEducation(userData),
        interests: userData.interests || [],
        bio: userData.bio || "",
      };
      
      setProfile(profileData);
      setEditForm(profileData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching profile:", error);
      setError("Failed to load profile data. Please try again later.");
      setLoading(false);
      toast.error("Failed to load profile data");
    }
  };

  // Helper function to format education based on available data
  const formatEducation = (userData) => {
    if (userData.education) return userData.education;
    
    const parts = [];
    if (userData.degree) parts.push(userData.degree);
    if (userData.branch) parts.push(userData.branch);
    if (userData.university) parts.push(userData.university);
    
    return parts.join(", ");
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

  // Submit profile changes to the backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Prepare data for API
      const userRole = localStorage.getItem("userRole");
      const updateData = {
        name: editForm.name,
        bio: editForm.bio,
        location: editForm.location,
        linkedin: editForm.linkedIn,
        skills: editForm.skills,
        interests: editForm.interests,
      };
      
      // Add role-specific fields
      if (userRole === "alumni") {
        updateData.company = editForm.company;
        updateData.experience = Number(editForm.experience) || 0;
      }
      
      console.log("Updating profile with data:", updateData);
      
      // Call appropriate API endpoint
      let response;
      if (userRole === "student") {
        response = await api.put('/students/profile', updateData);
      } else if (userRole === "alumni") {
        response = await api.put('/alumni/profile', updateData);
      }
      
      console.log("Profile update response:", response.data);
      
      // Update the profile state with the response data
      await fetchUserProfile();
      
      // Close the modal
      setIsEditModalOpen(false);
      
      // Show success message
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
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
  const handleProfilePhotoUpdated = (newPhotoUrl) => {
    setProfile(prev => ({
      ...prev,
      avatar: newPhotoUrl
    }));
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

                      <form onSubmit={handleSubmit} className="space-y-4">
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
                
                {/* Display real experience data when implemented in the backend */}
                {profile.company ? (
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
                      <h4 className="font-bold">{profile.education}</h4>
                      {profile.role === "Student" && (
                        <p className="text-muted-foreground">Current Student</p>
                      )}
                      {profile.role === "Alumni" && (
                        <p className="text-muted-foreground">Graduate</p>
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