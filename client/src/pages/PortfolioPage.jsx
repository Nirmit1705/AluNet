import React, { useState, useRef } from 'react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import DashboardNavbar from '../components/DashboardNavbar';

const PortfolioPage = () => {
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [activePortfolioItem, setActivePortfolioItem] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (!files.length) return;
    
    const file = files[0];
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    
    if (!allowedTypes.includes(file.type)) {
      alert('File type not allowed. Please select an image, PDF, or document file.');
      return;
    }
    
    setIsUploading(true);
    
    // Simulate file upload with progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(progress);
      
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          const fileType = file.type.startsWith('image/') ? 'image' : 'document';
          let fileUrl;
          
          if (fileType === 'image') {
            fileUrl = URL.createObjectURL(file);
          } else {
            fileUrl = '#'; // In a real app, this would be the URL to the uploaded file
          }
          
          const newItem = {
            id: `p${Date.now()}`,
            title: file.name.split('.')[0],
            description: '',
            link: '',
            fileType,
            fileUrl,
            file, // Store the actual file for form submission
            uploadDate: new Date().toISOString().split('T')[0]
          };
          
          setPortfolioItems(prev => [...prev, newItem]);
          setActivePortfolioItem(newItem);
          setIsUploading(false);
          setUploadProgress(0);
        }, 500);
      }
    }, 200);
  };

  const updatePortfolioItem = (id, updates) => {
    setPortfolioItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, ...updates } : item
      )
    );
    
    if (activePortfolioItem && activePortfolioItem.id === id) {
      setActivePortfolioItem(prev => ({ ...prev, ...updates }));
    }
  };

  const deletePortfolioItem = (id) => {
    if (window.confirm('Are you sure you want to delete this portfolio item?')) {
      setPortfolioItems(prev => prev.filter(item => item.id !== id));
      if (activePortfolioItem && activePortfolioItem.id === id) {
        setActivePortfolioItem(null);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavbar userType="student" />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">My Portfolio</h1>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => fileInputRef.current.click()}
              disabled={isUploading}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              Upload New Item
            </Button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*,.pdf,.doc,.docx" 
              onChange={handleFileSelect}
            />
          </div>
          
          {isUploading && (
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="text-sm mb-2 flex justify-between">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-primary-blue h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {portfolioItems.length === 0 && !isUploading ? (
            <Card>
              <CardContent className="text-center py-12">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                  <polyline points="13 2 13 9 20 9"></polyline>
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No portfolio items yet</h3>
                <p className="text-gray-500 mb-4">Upload your projects, assignments, or other work to showcase your skills</p>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => fileInputRef.current.click()}
                >
                  Upload your first item
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {portfolioItems.map(item => (
                <Card key={item.id} className="overflow-hidden">
                  <div className="relative">
                    {item.fileType === 'image' ? (
                      <img 
                        src={item.fileUrl} 
                        alt={item.title} 
                        className="w-full h-48 object-cover"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                          <polyline points="14 2 14 8 20 8"></polyline>
                          <line x1="16" y1="13" x2="8" y2="13"></line>
                          <line x1="16" y1="17" x2="8" y2="17"></line>
                          <polyline points="10 9 9 9 8 9"></polyline>
                        </svg>
                      </div>
                    )}
                    
                    <div className="absolute top-2 right-2 flex space-x-1">
                      <button 
                        type="button" 
                        className="p-1 bg-white rounded-full shadow-md hover:bg-gray-100"
                        onClick={() => setActivePortfolioItem(item)}
                        title="Edit"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                      </button>
                      <button 
                        type="button" 
                        className="p-1 bg-white rounded-full shadow-md hover:bg-gray-100"
                        onClick={() => deletePortfolioItem(item.id)}
                        title="Delete"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <CardContent className="p-4">
                    <h4 className="font-medium truncate">{item.title}</h4>
                    <p className="text-sm text-gray-500 truncate">{item.description}</p>
                    
                    <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                      <span>Added {item.uploadDate}</span>
                      {item.link && (
                        <a 
                          href={item.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary-blue hover:underline"
                        >
                          Visit Link
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          {/* Portfolio Item Modal */}
          {activePortfolioItem && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg max-w-lg w-full">
                <div className="p-4 border-b">
                  <h3 className="text-lg font-medium">Edit Portfolio Item</h3>
                </div>
                
                <div className="p-4 space-y-4">
                  <div>
                    <Label htmlFor="portfolioTitle">Title</Label>
                    <Input
                      id="portfolioTitle"
                      value={activePortfolioItem.title}
                      onChange={(e) => updatePortfolioItem(activePortfolioItem.id, { title: e.target.value })}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="portfolioDescription">Description</Label>
                    <textarea
                      id="portfolioDescription"
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-blue"
                      value={activePortfolioItem.description}
                      onChange={(e) => updatePortfolioItem(activePortfolioItem.id, { description: e.target.value })}
                      placeholder="Briefly describe this portfolio item"
                    ></textarea>
                  </div>
                  
                  <div>
                    <Label htmlFor="portfolioLink">External Link (optional)</Label>
                    <Input
                      id="portfolioLink"
                      placeholder="https://example.com/project"
                      value={activePortfolioItem.link}
                      onChange={(e) => updatePortfolioItem(activePortfolioItem.id, { link: e.target.value })}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Link to GitHub, project page, or any related URL
                    </p>
                  </div>
                  
                  {activePortfolioItem.fileType === 'image' && (
                    <div className="mt-4">
                      <Label>Preview</Label>
                      <div className="mt-2 border rounded-lg overflow-hidden">
                        <img 
                          src={activePortfolioItem.fileUrl} 
                          alt={activePortfolioItem.title} 
                          className="w-full max-h-40 object-contain"
                        />
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="p-4 border-t flex justify-end space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setActivePortfolioItem(null)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="button"
                    onClick={() => setActivePortfolioItem(null)}
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PortfolioPage; 