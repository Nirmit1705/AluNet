import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Link, FileText } from 'lucide-react';

const ScheduleSessionModal = ({ isOpen, onClose, mentee, onSchedule }) => {
  const [sessionDetails, setSessionDetails] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    meetingLink: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens with a new mentee
  useEffect(() => {
    if (mentee && isOpen) {
      // Get tomorrow's date for the default session date
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      // Prefill with some relevant data
      setSessionDetails({
        title: `Mentorship Session with ${mentee.name}`,
        description: mentee.mentorshipGoals 
          ? `Session to discuss: ${mentee.mentorshipGoals.substring(0, 50)}...` 
          : 'Regular mentorship session to discuss progress and goals',
        date: tomorrow.toISOString().split('T')[0],
        time: getCurrentTimeFormatted(),
        meetingLink: ''
      });
      
      // Reset errors
      setFormErrors({});
    }
  }, [mentee, isOpen]);

  // Helper function to get current time formatted for the time input
  const getCurrentTimeFormatted = () => {
    const now = new Date();
    // Round to the nearest half-hour and add 1 hour to schedule in the future
    now.setHours(now.getHours() + 1);
    now.setMinutes(Math.ceil(now.getMinutes() / 30) * 30);
    
    // Format as HH:MM
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Clear error for this field
    setFormErrors({
      ...formErrors,
      [name]: ''
    });
    
    setSessionDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Validate time format before submission
  const validateForm = () => {
    const errors = {};
    
    if (!sessionDetails.title.trim()) {
      errors.title = 'Title is required';
    }
    
    if (!sessionDetails.description.trim()) {
      errors.description = 'Description is required';
    }
    
    if (!sessionDetails.date) {
      errors.date = 'Date is required';
    } else {
      // Validate date is not in the past
      const selectedDate = new Date(sessionDetails.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        errors.date = 'Date cannot be in the past';
      }
    }
    
    if (!sessionDetails.time) {
      errors.time = 'Time is required';
    } else {
      // Validate time format (HH:MM)
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
      if (!timeRegex.test(sessionDetails.time)) {
        errors.time = 'Invalid time format (use HH:MM)';
      } else if (sessionDetails.date) {
        // Check if the date and time combined are in the past
        const sessionDateTime = new Date(`${sessionDetails.date}T${sessionDetails.time}`);
        if (sessionDateTime <= new Date()) {
          errors.time = 'The session time must be in the future';
        }
      }
    }
    
    // Validate meeting link format if provided
    if (sessionDetails.meetingLink && !sessionDetails.meetingLink.trim().startsWith('http')) {
      errors.meetingLink = 'Please enter a valid URL starting with http:// or https://';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Don't submit if already submitting
    if (isSubmitting) return;
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Calculate end time (1 hour after start time by default)
      const [startHours, startMinutes] = sessionDetails.time.split(':').map(num => parseInt(num, 10));
      const endDate = new Date();
      endDate.setHours(startHours, startMinutes, 0, 0);
      endDate.setMinutes(endDate.getMinutes() + 60); // Add 60 minutes
      const endTime = `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`;
      
      // Call the onSchedule function with the mentee and session details
      await onSchedule(mentee, {
        ...sessionDetails,
        endTime
      });
      
      // Clear form and close modal (handled by parent)
    } catch (error) {
      console.error('Error scheduling session:', error);
      alert(`Failed to schedule session: ${error.message || 'Please try again later'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-lg font-semibold">Schedule Session with {mentee?.name}</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-5">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Session Title</label>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                name="title"
                value={sessionDetails.title}
                onChange={handleInputChange}
                className={`w-full pl-10 py-2 border ${formErrors.title ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md bg-white dark:bg-gray-700`}
                placeholder="Enter session title"
              />
            </div>
            {formErrors.title && (
              <p className="text-red-500 text-xs mt-1">{formErrors.title}</p>
            )}
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              name="description"
              value={sessionDetails.description}
              onChange={handleInputChange}
              className={`w-full p-3 border ${formErrors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md bg-white dark:bg-gray-700`}
              placeholder="What will you discuss in this session?"
              rows="3"
            />
            {formErrors.description && (
              <p className="text-red-500 text-xs mt-1">{formErrors.description}</p>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  name="date"
                  value={sessionDetails.date}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  className={`w-full pl-10 py-2 border ${formErrors.date ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md bg-white dark:bg-gray-700`}
                />
              </div>
              {formErrors.date && (
                <p className="text-red-500 text-xs mt-1">{formErrors.date}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Start Time</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="time"
                  name="time"
                  value={sessionDetails.time}
                  onChange={handleInputChange}
                  className={`w-full pl-10 py-2 border ${formErrors.time ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md bg-white dark:bg-gray-700`}
                  step="300" // 5-minute steps
                />
              </div>
              {formErrors.time && (
                <p className="text-red-500 text-xs mt-1">{formErrors.time}</p>
              )}
              <small className="text-xs text-gray-500 dark:text-gray-400 mt-1">24-hour format (e.g., 14:30)</small>
            </div>
          </div>
          
          <div className="mb-5">
            <label className="block text-sm font-medium mb-1">Meeting Link (Optional)</label>
            <div className="relative">
              <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="url"
                name="meetingLink"
                value={sessionDetails.meetingLink}
                onChange={handleInputChange}
                className={`w-full pl-10 py-2 border ${formErrors.meetingLink ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md bg-white dark:bg-gray-700`}
                placeholder="Zoom, Google Meet, or other video call link"
              />
            </div>
            {formErrors.meetingLink && (
              <p className="text-red-500 text-xs mt-1">{formErrors.meetingLink}</p>
            )}
          </div>
          
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Scheduling...' : 'Schedule Session'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScheduleSessionModal;