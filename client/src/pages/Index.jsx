import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import LandingNavbar from "../components/layout/LandingNavbar";
import Hero from "../components/home/Hero";
import AuthModal from "../components/auth/AuthModal";
import { ArrowRight, Users, MessageCircle, Briefcase, Award, Zap, BarChart2 } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authType, setAuthType] = useState("login"); // "login" or "register"
  const location = useLocation();

  // Check if we're being redirected with auth request
  useEffect(() => {
    if (location.state?.showLogin) {
      setAuthType("login");
      setAuthModalOpen(true);
      
      // If it's an admin redirect, could set a flag or show a toast message
      if (location.state.adminRedirect) {
        // You could set additional state here or show a specific message
      }
    }
  }, [location]);

  // Open login modal
  const openLoginModal = () => {
    setAuthType("login");
    setAuthModalOpen(true);
  };

  // Open register modal
  const openRegisterModal = () => {
    setAuthType("register");
    setAuthModalOpen(true);
  };

  // Close auth modal
  const closeAuthModal = () => {
    setAuthModalOpen(false);
    // Clear any state parameters to prevent reopening
    window.history.replaceState({}, document.title, window.location.pathname);
  };

  // Switch between login and register types
  const handleSwitchAuthType = (newType) => {
    setAuthType(newType);
  };

  // Feature sections
  const features = [
    {
      title: "Connect with Alumni",
      description: "Build meaningful professional relationships with graduates who've been in your shoes.",
      icon: Users,
      color: "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300",
      available: true,
    },
    {
      title: "Personal Mentorship",
      description: "Receive guidance from industry professionals through one-on-one mentoring sessions.",
      icon: Award,
      color: "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300",
      available: true,
    },
    {
      title: "Job Opportunities",
      description: "Access exclusive job postings and internships shared directly by alumni.",
      icon: Briefcase,
      color: "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300",
      available: true,
    },
    {
      title: "Real-time Messaging",
      description: "Communicate directly with mentors and alumni through our seamless chat interface.",
      icon: MessageCircle,
      color: "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300",
      available: true,
    },
    {
      title: "Career Insights",
      description: "Get data-driven insights about industry trends and career paths.",
      icon: BarChart2,
      color: "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300",
      available: false,
    },
    {
      title: "AI-Powered Matching",
      description: "Our intelligent algorithm connects you with the most relevant mentors for your goals.",
      icon: Zap,
      color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300",
      available: false,
    },
  ];

  return (
    <div className="min-h-screen">
      <LandingNavbar onLoginClick={openLoginModal} />
      
      <main>
        {/* Hero section with registration/login handlers */}
        <Hero onRegisterClick={openRegisterModal} onLoginClick={openLoginModal} />
        
        {/* Authentication modal */}
        {authModalOpen && (
          <AuthModal
            isOpen={authModalOpen}
            onClose={closeAuthModal}
            type={authType}
            onSwitchType={handleSwitchAuthType}
          />
        )}
        
        {/* Features section */}
        <section className="bg-gray-50 dark:bg-gray-900/50 py-24">
          <div className="container-custom">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Connect, Learn, and Grow with Alumni
              </h2>
              <p className="text-muted-foreground text-lg">
                Our platform provides the tools and connections you need to advance your career
                with guidance from experienced professionals.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div 
                  key={index} 
                  className="glass-card rounded-xl p-6 transition-transform duration-300 hover:translate-y-[-5px] animate-fade-in relative"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {!feature.available && (
                    <div className="absolute top-3 right-3">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-500 to-blue-700 dark:from-blue-400 dark:to-blue-600 text-white animate-pulse">
                        <span className="animate-pulse-opacity">Coming Soon</span>
                      </span>
                    </div>
                  )}
                  <div className={`p-3 rounded-lg ${feature.color} inline-block mb-4`}>
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-20 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-blue-400/10 -z-10"></div>
          <div className="container-custom">
            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="p-8 md:p-12 flex flex-col justify-center">
                  <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                    Ready to Connect with Alumni?
                  </h2>
                  <p className="text-muted-foreground text-lg mb-8">
                    Join our community today and start building the professional relationships
                    that will shape your future career.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button 
                      onClick={openRegisterModal}
                      className="button-primary inline-flex items-center justify-center gap-2"
                    >
                      Get Started
                      <ArrowRight className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={openLoginModal}
                      className="button-secondary inline-flex items-center justify-center"
                    >
                      Sign In
                    </button>
                  </div>
                </div>
                <div className="relative h-64 md:h-auto overflow-hidden bg-gradient-to-r from-blue-400 to-purple-400">
                  <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1543269865-cbf427effbad?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80')] bg-cover bg-center opacity-20"></div>
                  <div className="absolute inset-0 flex items-center justify-center p-8">
                    <blockquote className="italic text-white text-center text-xl font-medium">
                      "The mentorship I received through this platform completely changed my career trajectory. I'm now working at my dream company thanks to the connections I made."
                      <footer className="mt-4 text-base font-normal">
                        — Sarah Chen, Software Engineer
                      </footer>
                    </blockquote>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Footer */}
        <footer className="bg-gray-100 dark:bg-gray-900 py-12">
          <div className="container-custom">
            <div className="text-center">
              <p className="text-xl font-bold text-primary mb-2">AluNet</p>
              <p className="text-muted-foreground mb-6">Connecting students with alumni for career success</p>
              <div className="flex justify-center space-x-6">
                <a href="#" className="text-gray-500 hover:text-primary transition-colors">Terms</a>
                <a href="#" className="text-gray-500 hover:text-primary transition-colors">Privacy</a>
                <a href="#" className="text-gray-500 hover:text-primary transition-colors">Contact</a>
              </div>
              <p className="mt-8 text-sm text-muted-foreground">
                © {new Date().getFullYear()} AluNet. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Index;