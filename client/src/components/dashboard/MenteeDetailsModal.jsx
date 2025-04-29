import React, { useState } from 'react';
import { Mail, Linkedin, Users, X } from 'lucide-react';
import ScheduleSessionModal from './ScheduleSessionModal';

const MenteeDetailsModal = ({ selectedMentee, setSelectedMentee, messageMentee }) => {
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  
  if (!selectedMentee) return null;
  
  // Add console log to see the actual data
  console.log('MenteeDetailsModal - selectedMentee data:', {
    id: selectedMentee.id,
    name: selectedMentee.name,
    sessionsCompleted: selectedMentee.sessionsCompleted,
    totalSessions: selectedMentee.totalSessions,
    progress: selectedMentee.progress,
    // Log data types to help debug conversion issues
    sessionsCompletedType: typeof selectedMentee.sessionsCompleted,
    totalSessionsType: typeof selectedMentee.totalSessions
  });
  
  const handleScheduleSession = () => {
    setShowScheduleModal(true);
  };
  
  const handleCloseSchedule = () => {
    setShowScheduleModal(false);
  };
  
  const handleSessionScheduled = (mentee, sessionDetails) => {
    // In a real app, this would send the session data to an API
    console.log("Scheduling session:", {mentee, sessionDetails});
    
    // Give feedback
    alert(`Session scheduled with ${mentee.name} on ${sessionDetails.date} at ${sessionDetails.time}`);
    
    // Close modals
    setShowScheduleModal(false);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-auto">
          <div className="flex justify-between items-start p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-4 overflow-hidden">
                {selectedMentee.profileImg ? (
                  <img 
                    src={selectedMentee.profileImg} 
                    alt={`${selectedMentee.name}'s profile`}
                    className="h-full w-full object-cover" 
                  />
                ) : (
                  <Users className="h-6 w-6" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-medium">{selectedMentee.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{selectedMentee.program} • {selectedMentee.year}</p>
              </div>
            </div>
            <button 
              onClick={() => setSelectedMentee(null)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Mentorship Started</h4>
                <p className="font-medium">{selectedMentee.startDate}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Next Session</h4>
                <p className="font-medium">{selectedMentee.nextSession}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Last Contact</h4>
                <p className="font-medium">{selectedMentee.lastInteraction}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Status</h4>
                <p className="font-medium">Active</p>
              </div>
            </div>
            
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Focus Areas</h4>
              <div className="flex flex-wrap gap-2">
                {selectedMentee.focusAreas && selectedMentee.focusAreas.map((area, index) => (
                  <span 
                    key={index} 
                    className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>
            
            {/* Update the Progress section to better handle total sessions */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Progress</h4>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                <div 
                  className="bg-primary h-2 rounded-full" 
                  style={{ width: `${selectedMentee.progress || 0}%` }}
                ></div>
              </div>
              <div className="text-right text-sm text-gray-500 dark:text-gray-400">
                {(() => {
                  // Parse values as integers with fallbacks if needed
                  const completed = typeof selectedMentee.sessionsCompleted === 'number' 
                    ? selectedMentee.sessionsCompleted 
                    : parseInt(selectedMentee.sessionsCompleted || 0, 10);
                    
                  // Use the actual total sessions from data instead of hardcoded 5
                  const total = typeof selectedMentee.totalSessions === 'number'
                    ? selectedMentee.totalSessions
                    : parseInt(selectedMentee.totalSessions || 5, 10);
                    
                  // Add debug logging to understand the data types
                  console.log('Session counts in modal:', { 
                    completed, 
                    total,
                    completedType: typeof completed,
                    totalType: typeof total,
                    rawCompleted: selectedMentee.sessionsCompleted,
                    rawTotal: selectedMentee.totalSessions
                  });
                    
                  return `${completed} of ${total} Sessions Completed`;
                })()}
              </div>
            </div>
            
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Notes</h4>
              <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg text-sm">
                {selectedMentee.mentorshipGoals || selectedMentee.notes || "No mentorship goals or notes available."}
              </p>
            </div>
            
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Contact Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <a 
                  href={`mailto:${selectedMentee.email || `${selectedMentee.name.toLowerCase().replace(' ', '.')}@university.edu`}`}
                  className="flex items-center gap-2 text-sm text-primary hover:text-primary/80"
                >
                  <Mail className="h-4 w-4" />
                  {selectedMentee.email || `${selectedMentee.name.toLowerCase().replace(' ', '.')}@university.edu`}
                </a>
                <a 
                  href={`https://linkedin.com/in/${selectedMentee.name.toLowerCase().replace(' ', '-')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-primary hover:text-primary/80"
                >
                  <Linkedin className="h-4 w-4" />
                  LinkedIn Profile
                </a>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setSelectedMentee(null)}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-sm font-medium transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleScheduleSession}
              className="px-4 py-2 bg-green-500 text-white hover:bg-green-600 rounded-lg text-sm font-medium transition-colors"
            >
              Schedule Session
            </button>
            <button
              onClick={() => {
                setSelectedMentee(null);
                messageMentee(selectedMentee.id);
              }}
              className="px-4 py-2 bg-primary text-white hover:bg-primary/90 rounded-lg text-sm font-medium transition-colors"
            >
              Message Mentee
            </button>
          </div>
        </div>
      </div>
      
      <ScheduleSessionModal 
        isOpen={showScheduleModal}
        onClose={handleCloseSchedule}
        mentee={selectedMentee}
        onSchedule={handleSessionScheduled}
      />
    </>
  );
};

export default MenteeDetailsModal;