import React, { useState } from 'react';
import { X, Plus, Trash, GraduationCap } from 'lucide-react';

const EducationEditModal = ({ isOpen, onClose, education, graduationYear, previousEducation = [], onSave }) => {
  const [currentGraduationYear, setCurrentGraduationYear] = useState(graduationYear || '');
  const [educationList, setEducationList] = useState(previousEducation || []);
  const [newEducation, setNewEducation] = useState({
    institution: '',
    degree: '',
    fieldOfStudy: '',
    startYear: '',
    endYear: '',
    description: ''
  });
  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEducation(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleGraduationYearChange = (e) => {
    const value = e.target.value;
    
    // Validate that it's a number and within reasonable range
    if (value === '' || (Number(value) >= 1950 && Number(value) <= new Date().getFullYear() + 10)) {
      setCurrentGraduationYear(value);
      
      if (errors.graduationYear) {
        setErrors(prev => ({ ...prev, graduationYear: '' }));
      }
    }
  };

  const validateEducation = () => {
    const newErrors = {};
    
    if (!newEducation.institution.trim()) {
      newErrors.institution = 'Institution is required';
    }
    
    if (!newEducation.degree.trim()) {
      newErrors.degree = 'Degree is required';
    }
    
    if (!newEducation.fieldOfStudy.trim()) {
      newErrors.fieldOfStudy = 'Field of study is required';
    }
    
    if (!newEducation.startYear) {
      newErrors.startYear = 'Start year is required';
    } else if (Number(newEducation.startYear) < 1950 || Number(newEducation.startYear) > new Date().getFullYear()) {
      newErrors.startYear = 'Invalid start year';
    }
    
    if (newEducation.endYear && (Number(newEducation.endYear) < Number(newEducation.startYear))) {
      newErrors.endYear = 'End year must be after start year';
    }
    
    return newErrors;
  };

  const addEducation = () => {
    const validationErrors = validateEducation();
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setEducationList([...educationList, { 
      ...newEducation,
      startYear: Number(newEducation.startYear),
      endYear: newEducation.endYear ? Number(newEducation.endYear) : null
    }]);
    
    // Reset the form
    setNewEducation({
      institution: '',
      degree: '',
      fieldOfStudy: '',
      startYear: '',
      endYear: '',
      description: ''
    });
  };

  const removeEducation = (index) => {
    const updatedList = [...educationList];
    updatedList.splice(index, 1);
    setEducationList(updatedList);
  };

  const handleSave = () => {
    // Validate graduation year
    if (!currentGraduationYear) {
      setErrors({ ...errors, graduationYear: 'Graduation year is required' });
      return;
    }
    
    // Call the parent component's save handler with the updated education data
    onSave({
      graduationYear: Number(currentGraduationYear),
      previousEducation: educationList
    });
    
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-xl animate-fade-in max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-900 px-6 py-4 border-b border-border flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center">
            <GraduationCap className="h-5 w-5 mr-2" />
            Education Information
          </h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-6">
          {/* Current Education Section */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Current Education</h3>
            <div className="glass-card p-4 rounded-lg mb-4">
              <p className="text-sm mb-2">{education}</p>
              
              <div className="mt-3">
                <label className="block text-sm font-medium mb-1">Graduation Year</label>
                <input
                  type="number"
                  min="1950"
                  max={new Date().getFullYear() + 10}
                  value={currentGraduationYear}
                  onChange={handleGraduationYearChange}
                  className={`w-full px-3 py-2 bg-background border ${errors.graduationYear ? 'border-red-500' : 'border-input'} rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors`}
                  placeholder="e.g. 2023"
                />
                {errors.graduationYear && (
                  <p className="text-xs text-red-500 mt-1">{errors.graduationYear}</p>
                )}
              </div>
            </div>
          </div>
          
          {/* Previous Education Section */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Previous Education</h3>
            
            {/* List of existing education entries */}
            {educationList.length > 0 ? (
              <div className="space-y-3 mb-4">
                {educationList.map((edu, index) => (
                  <div key={index} className="glass-card p-4 rounded-lg relative">
                    <button
                      onClick={() => removeEducation(index)}
                      className="absolute top-2 right-2 p-1 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-500 rounded-full"
                    >
                      <Trash className="h-4 w-4" />
                    </button>
                    
                    <h4 className="font-medium">{edu.degree} in {edu.fieldOfStudy}</h4>
                    <p className="text-sm text-muted-foreground">{edu.institution}</p>
                    <p className="text-sm">
                      {edu.startYear} - {edu.endYear || 'Present'}
                    </p>
                    {edu.description && (
                      <p className="text-sm mt-2 text-muted-foreground">{edu.description}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm mb-4">No previous education added</p>
            )}
            
            {/* Form to add new education */}
            <div className="glass-card p-4 rounded-lg">
              <h4 className="font-medium mb-3 flex items-center">
                <Plus className="h-4 w-4 mr-1" />
                Add Education
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Institution</label>
                  <input
                    type="text"
                    name="institution"
                    value={newEducation.institution}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 bg-background border ${errors.institution ? 'border-red-500' : 'border-input'} rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors`}
                    placeholder="e.g. Harvard University"
                  />
                  {errors.institution && (
                    <p className="text-xs text-red-500 mt-1">{errors.institution}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Degree</label>
                  <input
                    type="text"
                    name="degree"
                    value={newEducation.degree}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 bg-background border ${errors.degree ? 'border-red-500' : 'border-input'} rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors`}
                    placeholder="e.g. Bachelor's, Master's"
                  />
                  {errors.degree && (
                    <p className="text-xs text-red-500 mt-1">{errors.degree}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Field of Study</label>
                  <input
                    type="text"
                    name="fieldOfStudy"
                    value={newEducation.fieldOfStudy}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 bg-background border ${errors.fieldOfStudy ? 'border-red-500' : 'border-input'} rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors`}
                    placeholder="e.g. Computer Science"
                  />
                  {errors.fieldOfStudy && (
                    <p className="text-xs text-red-500 mt-1">{errors.fieldOfStudy}</p>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium mb-1">Start Year</label>
                    <input
                      type="number"
                      name="startYear"
                      min="1950"
                      max={new Date().getFullYear()}
                      value={newEducation.startYear}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 bg-background border ${errors.startYear ? 'border-red-500' : 'border-input'} rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors`}
                      placeholder="e.g. 2020"
                    />
                    {errors.startYear && (
                      <p className="text-xs text-red-500 mt-1">{errors.startYear}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">End Year (or blank if current)</label>
                    <input
                      type="number"
                      name="endYear"
                      min="1950"
                      max={new Date().getFullYear() + 10}
                      value={newEducation.endYear}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 bg-background border ${errors.endYear ? 'border-red-500' : 'border-input'} rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors`}
                      placeholder="e.g. 2024"
                    />
                    {errors.endYear && (
                      <p className="text-xs text-red-500 mt-1">{errors.endYear}</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Description (optional)</label>
                <textarea
                  name="description"
                  value={newEducation.description}
                  onChange={handleInputChange}
                  rows="2"
                  className="w-full px-3 py-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                  placeholder="Briefly describe your studies, achievements, etc."
                ></textarea>
              </div>
              
              <button
                onClick={addEducation}
                className="px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg transition-colors w-full"
              >
                Add Education Entry
              </button>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Save Education
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EducationEditModal;
