import React from "react";
import { ArrowRight, Users, BookOpen, Award, Zap } from "lucide-react";

const Hero = ({ onRegisterClick, onLoginClick }) => {
  return (
    <section className="pt-32 pb-20 md:pt-40 md:pb-28 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-transparent dark:from-blue-950/10 dark:to-transparent -z-10"></div>
      
      {/* Decorative circles */}
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-200/20 dark:bg-blue-500/5 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-10 right-1/4 w-64 h-64 bg-purple-200/20 dark:bg-purple-500/5 rounded-full blur-3xl -z-10"></div>
      
      <div className="container-custom">
        <div className="text-center max-w-4xl mx-auto space-y-8">
          {/* Pill badge */}
          <div className="animate-fade-in inline-flex bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 rounded-full px-3 py-1 text-sm font-medium text-blue-700 dark:text-blue-400">
            <span>Connecting Students with Alumni</span>
          </div>
          
          {/* Main heading */}
          <h1 className="animate-fade-in animate-delay-100 font-bold text-center tracking-tight">
            Build Your Professional Network 
            <span className="text-primary"> Beyond the Classroom</span>
          </h1>
          
          {/* Description */}
          <p className="animate-fade-in animate-delay-200 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Connect with alumni, discover mentorship opportunities, and access exclusive job postings through a seamless platform designed to foster meaningful professional relationships.
          </p>
          
          {/* CTA buttons */}
          <div className="animate-fade-in animate-delay-300 flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <button 
              onClick={onRegisterClick}
              className="button-primary inline-flex items-center justify-center gap-2 px-6 py-3"
            >
              Get Started
              <ArrowRight className="h-4 w-4" />
            </button>
            <button 
              onClick={onLoginClick}
              className="button-secondary inline-flex items-center justify-center gap-2 px-6 py-3"
            >
              Sign In
            </button>
          </div>
          
          {/* Stats */}
          <div className="animate-fade-in animate-delay-400 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mt-16 text-center">
            <div className="glass-card p-4 rounded-xl">
              <div className="mb-2 flex justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div className="font-semibold text-2xl md:text-3xl">5,000+</div>
              <div className="text-sm text-muted-foreground">Active Alumni</div>
            </div>
            <div className="glass-card p-4 rounded-xl">
              <div className="mb-2 flex justify-center">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div className="font-semibold text-2xl md:text-3xl">12,000+</div>
              <div className="text-sm text-muted-foreground">Students</div>
            </div>
            <div className="glass-card p-4 rounded-xl">
              <div className="mb-2 flex justify-center">
                <Award className="h-6 w-6 text-primary" />
              </div>
              <div className="font-semibold text-2xl md:text-3xl">850+</div>
              <div className="text-sm text-muted-foreground">Mentorships</div>
            </div>
            <div className="glass-card p-4 rounded-xl">
              <div className="mb-2 flex justify-center">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <div className="font-semibold text-2xl md:text-3xl">2,400+</div>
              <div className="text-sm text-muted-foreground">Job Opportunities</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero; 