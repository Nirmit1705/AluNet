import React from "react";
import { useNavigate } from "react-router-dom";
import { Award, Clock, CheckCircle } from "lucide-react";

// Sample data for skills assessment
const skillAssessments = [
  {
    id: 1,
    title: "Technical Skills Assessment",
    description: "Evaluate your programming skills across multiple languages and frameworks.",
    estimatedTime: "45 mins",
    completed: true,
    progress: 100
  },
  {
    id: 2,
    title: "Soft Skills Evaluation",
    description: "Assess your communication, teamwork, and problem-solving abilities.",
    estimatedTime: "30 mins",
    completed: false,
    progress: 60
  },
  {
    id: 3,
    title: "Industry Knowledge Test",
    description: "Test your knowledge of current industry trends and best practices.",
    estimatedTime: "25 mins",
    completed: false,
    progress: 0
  }
];

const SkillsAssessmentSection = () => {
  const navigate = useNavigate();

  // Take skill assessment
  const takeSkillAssessment = (assessmentId) => {
    navigate(`/skills/assessment/${assessmentId}`);
    // In a real app, this would navigate to the specific assessment
    alert(`Starting assessment #${assessmentId}`);
  };

  // Navigate to skills assessment page
  const goToSkillsAssessment = () => {
    navigate("/skills");
    // In a real app, this would navigate to skills assessment page
    alert("Navigating to skills assessment");
  };

  return (
    <div className="glass-card rounded-xl p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-medium text-lg">Skills Assessment</h3>
        <Award className="h-5 w-5 text-primary" />
      </div>
      <div className="space-y-4">
        {skillAssessments.map((assessment) => (
          <div key={assessment.id} className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm">
            <h4 className="font-medium text-primary">{assessment.title}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 mb-3">{assessment.description}</p>
            
            <div className="flex items-center justify-between mb-2 text-sm">
              <span className="text-gray-500 dark:text-gray-400">
                <Clock className="h-3.5 w-3.5 inline mr-1" />
                {assessment.estimatedTime}
              </span>
              <span className={`${assessment.completed ? "text-green-600" : "text-amber-600"}`}>
                {assessment.completed ? (
                  <>
                    <CheckCircle className="h-3.5 w-3.5 inline mr-1" />
                    Completed
                  </>
                ) : (
                  `${assessment.progress}% Complete`
                )}
              </span>
            </div>
            
            {!assessment.completed && (
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-3">
                <div 
                  className="bg-primary h-2 rounded-full" 
                  style={{ width: `${assessment.progress}%` }}
                ></div>
              </div>
            )}
            
            <button
              onClick={() => takeSkillAssessment(assessment.id)}
              className={`w-full py-2 mt-2 rounded-lg transition-colors font-medium text-sm ${
                assessment.completed 
                  ? "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300" 
                  : "bg-primary/10 text-primary hover:bg-primary/20"
              }`}
            >
              {assessment.completed ? "Review Results" : "Continue Assessment"}
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={goToSkillsAssessment}
        className="w-full mt-4 py-2 bg-white dark:bg-slate-800 text-primary hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg border border-gray-200 dark:border-slate-700 transition-colors font-medium flex items-center justify-center gap-2"
      >
        <Award className="h-4 w-4" />
        View All Skills Assessments
      </button>
    </div>
  );
};

export default SkillsAssessmentSection; 