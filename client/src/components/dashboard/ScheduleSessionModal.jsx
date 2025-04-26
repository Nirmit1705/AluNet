import React, { useState } from 'react';
import { X, Calendar as CalendarIcon } from 'lucide-react';

const ScheduleSessionModal = ({ isOpen, onClose, mentee, onSchedule }) => {
  const [sessionDetails, setSessionDetails] = useState({
    date: '',
    time: '',
    duration: '60',
    topic: '',
    platform: 'Zoom'
  });

  if (!isOpen || !mentee) return null;

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setSessionDetails(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSubmit = () => {
    // Validate form
    if (!sessionDetails.date || !sessionDetails.time || !sessionDetails.topic) {
      alert('Please fill in all required fields');
      return;
    }
    
    // Call the onSchedule callback with the mentee and session details
    onSchedule(mentee, sessionDetails);
    
    // Reset form
    setSessionDetails({
      date: '',
      time: '',
      duration: '60',
      topic: '',
      platform: 'Zoom'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-xl p-6 animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">Schedule Session with {mentee.name}</h3>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="date" className="block text-sm font-medium mb-1">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="date"
                className="w-full px-4 py-2.5 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                value={sessionDetails.date}
                onChange={handleInputChange}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
            <div>
              <label htmlFor="time" className="block text-sm font-medium mb-1">
                Time <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                id="time"
                className="w-full px-4 py-2.5 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                value={sessionDetails.time}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="duration" className="block text-sm font-medium mb-1">
                Duration (minutes)
              </label>
              <select
                id="duration"
                className="w-full px-4 py-2.5 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                value={sessionDetails.duration}
                onChange={handleInputChange}
              >
                <option value="30">30 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60">60 minutes</option>
                <option value="90">90 minutes</option>
              </select>
            </div>
            <div>
              <label htmlFor="platform" className="block text-sm font-medium mb-1">
                Platform
              </label>
              <select
                id="platform"
                className="w-full px-4 py-2.5 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                value={sessionDetails.platform}
                onChange={handleInputChange}
              >
                <option value="Zoom">Zoom</option>
                <option value="Google Meet">Google Meet</option>
                <option value="Microsoft Teams">Microsoft Teams</option>
                <option value="In Person">In Person</option>
              </select>
            </div>
          </div>
          
          <div>
            <label htmlFor="topic" className="block text-sm font-medium mb-1">
              Session Topic <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="topic"
              className="w-full px-4 py-2.5 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
              placeholder="e.g. Resume Review, Technical Interview Prep, etc."
              value={sessionDetails.topic}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center"
              onClick={handleSubmit}
            >
              <CalendarIcon className="h-4 w-4 mr-2" />
              Schedule Session
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScheduleSessionModal;