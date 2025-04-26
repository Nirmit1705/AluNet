import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import ProfileCard from "../components/profile/ProfileCard";
import { X, Save, Camera, Plus, Trash } from "lucide-react";

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); 
  const navigate = useNavigate();

  // Sample profile data
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

  useEffect(() => {
    try {
      // Check if user is logged in
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      
      // In a real app, you would fetch the profile from an API
      // For now, we'll use sample data
      setProfile({
        name: localStorage.getItem("userName") || "Alex Johnson",
        role: localStorage.getItem("userRole") === "alumni" ? "Alumni" : "Student",
        avatar: "https://randomuser.me/api/portraits/men/32.jpg",
        company: localStorage.getItem("userRole") === "alumni" ? "Google" : null,
        location: "Mountain View, CA",
        experience: localStorage.getItem("userRole") === "alumni" ? 8 : null,
        linkedIn: "https://linkedin.com/in/alexjohnson",
        email: localStorage.getItem("userEmail") || "alex.johnson@example.com",
        skills: [
          "JavaScript",
          "TypeScript",
          "React",
          "Node.js",
          "Python",
          "AWS",
          "System Design",
          "Algorithms",
          "Team Leadership",
        ],
        education: "M.S. Computer Science, Stanford University",
        interests: [
          "Mentoring",
          "Open Source",
          "AI/ML",
          "Blockchain",
          "Tech Ethics",
        ],
        bio: "Passionate software engineer with 8+ years of experience building web applications and distributed systems. Committed to mentoring the next generation of engineers.",
      });
      
      setLoading(false);
    } catch (error) {
      console.error("Error checking authentication:", error);
      setLoading(false);
    }
  }, [navigate]);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // In a real app, you would send this data to your API
    // For now, we'll just update the local state
    setProfile(editForm);
    
    // Update localStorage values for demo purposes
    localStorage.setItem("userName", editForm.name);
    localStorage.setItem("userEmail", editForm.email);
    
    // Close the modal
    setIsEditModalOpen(false);
    
    // Show success message
    alert("Profile updated successfully!");
  };

  if (loading) {
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-12">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              {!loading && (
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
                  onEditProfile={() => setIsEditModalOpen(true)}
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
                              required
                            />
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
                            />
                          </div>
                        </div>

                        {/* Education */}
                        <div className="space-y-2">
                          <label htmlFor="education" className="block text-sm font-medium">
                            Education
                          </label>
                          <input
                            type="text"
                            id="education"
                            name="education"
                            value={editForm.education}
                            onChange={handleInputChange}
                            className="w-full p-2 border rounded-lg"
                            placeholder="University, Degree"
                          />
                        </div>

                        {/* Bio */}
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
                          >
                            Save Changes
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="glass-card rounded-xl p-6 animate-scale-in animate-delay-100">
                <h3 className="text-xl font-bold mb-4">Experience</h3>
                {localStorage.getItem("userRole") === "alumni" ? (
                  <div className="space-y-6">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded bg-white p-2 flex items-center justify-center">
                        <img
                          src="https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png"
                          alt="Google"
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                      <div>
                        <h4 className="font-bold">Senior Software Engineer</h4>
                        <p className="text-muted-foreground">Google</p>
                        <p className="text-sm text-muted-foreground">2019 - Present · 4 years</p>
                        <p className="mt-2">
                          Led the development of cloud-based solutions that improved system efficiency by 40%. Mentored junior engineers and collaborated with cross-functional teams.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded bg-white p-2 flex items-center justify-center">
                        <img
                          src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg"
                          alt="Microsoft"
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                      <div>
                        <h4 className="font-bold">Software Engineer</h4>
                        <p className="text-muted-foreground">Microsoft</p>
                        <p className="text-sm text-muted-foreground">2015 - 2019 · 4 years</p>
                        <p className="mt-2">
                          Developed and maintained features for Microsoft Azure. Implemented microservices architecture and RESTful APIs.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No work experience added yet.</p>
                )}
              </div>

              <div className="glass-card rounded-xl p-6 animate-scale-in animate-delay-200">
                <h3 className="text-xl font-bold mb-4">Education</h3>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded bg-white p-2 flex items-center justify-center">
                      <img
                        src="https://identity.stanford.edu/wp-content/uploads/sites/3/2020/07/block-s-right.png"
                        alt="Stanford University"
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                    <div>
                      <h4 className="font-bold">Stanford University</h4>
                      <p className="text-muted-foreground">Master of Science, Computer Science</p>
                      <p className="text-sm text-muted-foreground">2013 - 2015</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded bg-white p-2 flex items-center justify-center">
                      <img
                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/University_of_California%2C_Berkeley_logo.svg/1280px-University_of_California%2C_Berkeley_logo.svg.png"
                        alt="UC Berkeley"
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                    <div>
                      <h4 className="font-bold">University of California, Berkeley</h4>
                      <p className="text-muted-foreground">Bachelor of Science, Computer Science</p>
                      <p className="text-sm text-muted-foreground">2009 - 2013</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 