import React, { createContext, useContext, useState, useEffect } from 'react';

// Create a context for university information
const UniversityContext = createContext();

// Hook to use university context
export const useUniversity = () => {
  const context = useContext(UniversityContext);
  if (!context) {
    throw new Error('useUniversity must be used within a UniversityProvider');
  }
  return context;
};

// Provider component
export const UniversityProvider = ({ children }) => {
  const [userUniversity, setUserUniversity] = useState(() => {
    // Initialize from localStorage if available
    return localStorage.getItem('userUniversity') || '';
  });

  // Update localStorage when university changes
  useEffect(() => {
    if (userUniversity) {
      localStorage.setItem('userUniversity', userUniversity);
    }
  }, [userUniversity]);

  // Extract university name from education string
  const extractUniversity = (educationString) => {
    if (!educationString) return '';
    
    // Try to extract university name after the degree
    const matches = educationString.match(/,\s*([^,]+)$/);
    if (matches && matches[1]) {
      return matches[1].trim();
    }
    
    // If no comma found, take the last part of the string as university
    const parts = educationString.split(' ');
    if (parts.length > 2) {
      return parts.slice(Math.max(parts.length - 3, 0)).join(' ');
    }
    
    return educationString;
  };

  // Function to set university during login/registration
  const setUserUniversityInfo = (education) => {
    const university = extractUniversity(education);
    setUserUniversity(university);
  };

  // Check if two universities match (case insensitive)
  const isSameUniversity = (university1, university2) => {
    if (!university1 || !university2) return false;
    return university1.toLowerCase() === university2.toLowerCase();
  };

  // Filter data by university
  const filterByUniversity = (dataArray, educationField = 'education') => {
    if (!userUniversity || !dataArray || !dataArray.length) {
      return dataArray;
    }

    return dataArray.filter(item => {
      const itemUniversity = extractUniversity(item[educationField]);
      return isSameUniversity(itemUniversity, userUniversity);
    });
  };

  const value = {
    userUniversity,
    setUserUniversity,
    setUserUniversityInfo,
    extractUniversity,
    isSameUniversity,
    filterByUniversity
  };

  return (
    <UniversityContext.Provider value={value}>
      {children}
    </UniversityContext.Provider>
  );
}; 