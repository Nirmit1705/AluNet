import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import ProfileCard from "../components/profile/ProfileCard";

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      // Check if user is logged in
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      
      setLoading(false);
    } catch (error) {
      console.error("Error checking authentication:", error);
      setLoading(false);
    }
  }, [navigate]);

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

  // Sample profile data
  const profile = {
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
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-12">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <ProfileCard {...profile} />
            </div>
            <div className="lg:col-span-2 space-y-8">
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