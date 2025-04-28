import React, { useState } from 'react';
import { Camera, Upload, X } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const ProfilePhotoUpload = ({ currentAvatar, onPhotoUpdated }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  
  // Helper function to get user initials as fallback
  const getInitials = (name) => {
    if (!name) {
      const userName = localStorage.getItem('userName');
      if (!userName) return '?';
      return userName
        .split(' ')
        .map(part => part[0])
        .join('')
        .toUpperCase();
    }
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  // Helper function to extract the avatar URL regardless of format
  const getAvatarUrl = (avatar) => {
    if (!avatar) return null;
    
    // If it's an object with url property
    if (typeof avatar === 'object' && avatar.url) {
      return avatar.url;
    }
    
    // If it's a string URL
    if (typeof avatar === 'string') {
      return avatar;
    }
    
    return null;
  };

  // Handle file selection
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!validTypes.includes(file.type)) {
      toast.error("Please select a JPG or PNG image");
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    // Create preview URL for immediate feedback
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    
    // Start upload
    setIsUploading(true);
    
    try {
      // First, create FormData
      const formData = new FormData();
      formData.append('profilePicture', file);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      // Upload the file to Cloudinary via our backend
      const uploadResponse = await axios.post(
        'http://localhost:5000/api/upload/profile-picture', 
        formData, 
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      console.log("Cloudinary upload response:", uploadResponse.data);
      
      if (!uploadResponse.data || !uploadResponse.data.imageUrl) {
        throw new Error('Failed to upload image: Invalid response from server');
      }
      
      // Get the Cloudinary image URL and public ID from the response
      const { imageUrl, publicId } = uploadResponse.data;
      
      // Now update the profile with the Cloudinary image URL and public ID
      const userRole = localStorage.getItem('userRole');
      const endpoint = userRole === 'student' 
        ? 'http://localhost:5000/api/students/profile/profile-picture'
        : 'http://localhost:5000/api/alumni/profile/profile-picture';
      
      const updateResponse = await axios.put(
        endpoint,
        { imageUrl, publicId },  // Send both for better image management
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      console.log("Profile update response:", updateResponse.data);
      
      // Check if the update was successful
      if (updateResponse.data && updateResponse.data.success) {
        toast.success("Profile picture updated successfully");
        
        // Call the callback to update the parent component with the Cloudinary image URL
        if (onPhotoUpdated) {
          // Return the profile picture object from the response, or default to the URL
          const profilePicture = updateResponse.data.profilePicture || { url: imageUrl };
          onPhotoUpdated(profilePicture);
        }
      } else {
        throw new Error('Failed to update profile with new image');
      }
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      toast.error(error.response?.data?.message || error.message || "Failed to upload profile picture");
      // Reset preview on error
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
    }
  };
  
  // Remove the profile photo preview
  const removePreview = () => {
    setPreviewUrl(null);
  };

  const avatarUrl = getAvatarUrl(currentAvatar);

  return (
    <div className="relative">
      <div className="h-24 w-24 rounded-full overflow-hidden border-2 border-primary/20 relative group">
        {/* Display avatar or preview */}
        {previewUrl ? (
          <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
        ) : avatarUrl ? (
          <img src={avatarUrl} alt="Current profile" className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-primary/10 text-primary flex items-center justify-center text-xl font-bold">
            {getInitials(localStorage.getItem('userName'))}
          </div>
        )}
        
        {/* Remove preview button */}
        {previewUrl && (
          <button 
            className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full shadow-md"
            onClick={removePreview}
          >
            <X className="h-3 w-3" />
          </button>
        )}
        
        {/* Upload overlay */}
        <label 
          htmlFor="profile-photo-upload" 
          className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer"
        >
          <Camera className="h-6 w-6 text-white mb-1" />
          <span className="text-white text-xs">Change</span>
        </label>
      </div>
      
      {/* File input (hidden) */}
      <input 
        type="file" 
        id="profile-photo-upload" 
        className="hidden" 
        accept=".jpg,.jpeg,.png"
        onChange={handleFileChange}
        disabled={isUploading}
      />
      
      {/* Loading indicator */}
      {isUploading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      )}
    </div>
  );
};

export default ProfilePhotoUpload;
