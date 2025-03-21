import React, { useState, useEffect } from 'react';
import DashboardNavbar from '../components/DashboardNavbar';
import { Box, Container, Typography, Grid, Card, CardContent, Button, 
  Chip, TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  InputAdornment, IconButton, Rating, Avatar, Divider, CircularProgress } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import axios from 'axios';

const MentorsPage = () => {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savedMentors, setSavedMentors] = useState(new Set());

  const [searchTerm, setSearchTerm] = useState('');
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [requestMessage, setRequestMessage] = useState('');
  const [savedMentorsOnly, setSavedMentorsOnly] = useState(false);

  // Fetch alumni data from backend
  useEffect(() => {
    const fetchAlumni = async () => {
      try {
        setLoading(true);
        // Try to fetch from backend first
        const response = await axios.get('http://localhost:5000/api/alumni');
        
        // Transform alumni data to match mentor structure
        const alumniData = response.data.map(alumni => ({
          id: alumni._id,
          name: alumni.name,
          position: alumni.position ? `${alumni.position} at ${alumni.company}` : 'Alumni',
          bio: alumni.bio || 'No bio available',
          expertise: alumni.skills || [],
          rating: 4.5, // Default rating since we don't have this in the backend yet
          availability: alumni.mentorshipAvailable ? 'Available for mentorship' : 'Limited availability',
          saved: false,
          avatar: alumni.profilePicture || '',
          // Additional alumni specific fields
          graduationYear: alumni.graduationYear,
          branch: alumni.branch,
          email: alumni.email,
          company: alumni.company,
        }));
        
        setMentors(alumniData);
        setError(null);
      } catch (err) {
        console.error('Error fetching alumni:', err);
        setError('Failed to load mentors. Please try again later.');
        
        // If backend call fails, use local storage data
        const storedAlumni = localStorage.getItem('alumniData');
        if (storedAlumni) {
          try {
            const parsedData = JSON.parse(storedAlumni);
            if (Array.isArray(parsedData) && parsedData.length > 0) {
              setMentors(parsedData);
              setError(null);
            }
          } catch (parseErr) {
            console.error('Error parsing stored alumni data:', parseErr);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    // Load saved mentors from localStorage
    const loadSavedMentors = () => {
      try {
        const saved = localStorage.getItem('savedMentors');
        if (saved) {
          setSavedMentors(new Set(JSON.parse(saved)));
        }
      } catch (err) {
        console.error('Error loading saved mentors:', err);
      }
    };

    fetchAlumni();
    loadSavedMentors();
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const toggleSavedFilter = () => {
    setSavedMentorsOnly(!savedMentorsOnly);
  };

  const toggleSaved = (id) => {
    const newSavedMentors = new Set(savedMentors);
    
    if (newSavedMentors.has(id)) {
      newSavedMentors.delete(id);
    } else {
      newSavedMentors.add(id);
    }
    
    setSavedMentors(newSavedMentors);
    localStorage.setItem('savedMentors', JSON.stringify([...newSavedMentors]));
  };

  const openRequestDialog = (mentor) => {
    setSelectedMentor(mentor);
    setRequestDialogOpen(true);
  };

  const closeRequestDialog = () => {
    setRequestDialogOpen(false);
    setRequestMessage('');
  };

  const handleRequestChange = (e) => {
    setRequestMessage(e.target.value);
  };

  const submitRequest = async () => {
    if (!selectedMentor || !requestMessage.trim()) {
      alert('Please enter a message for your mentorship request.');
      return;
    }
    
    try {
      // Here you would make an API call to submit the mentorship request
      // For now we'll just console log it
      console.log(`Sending request to ${selectedMentor.name}: ${requestMessage}`);
      
      // In a real implementation, you would use:
      // await axios.post('http://localhost:5000/api/mentorship/request', {
      //   mentorId: selectedMentor.id,
      //   message: requestMessage
      // });
      
      // Show success message or notification
      alert(`Request sent to ${selectedMentor.name}!`);
      
      closeRequestDialog();
    } catch (err) {
      console.error('Error sending mentorship request:', err);
      alert('Failed to send mentorship request. Please try again.');
    }
  };

  // Generate initials from name for avatar fallback
  const getInitials = (name) => {
    if (!name) return '';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const filteredMentors = mentors.filter(mentor => {
    // Filter by search term
    const matchesSearch = 
      mentor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentor.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentor.bio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentor.expertise?.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase())) ||
      mentor.branch?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentor.company?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by saved status if savedMentorsOnly is true
    const isSaved = savedMentors.has(mentor.id);
    const matchesSaved = savedMentorsOnly ? isSaved : true;
    
    return matchesSearch && matchesSaved;
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <DashboardNavbar />
      
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Find a Mentor
        </Typography>
        
        <Box sx={{ display: 'flex', mb: 3, gap: 2 }}>
          <TextField
            fullWidth
            placeholder="Search mentors by name, position, skills, branch..."
            value={searchTerm}
            onChange={handleSearch}
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          
          <Button
            variant={savedMentorsOnly ? "contained" : "outlined"}
            color="primary"
            startIcon={<FilterListIcon />}
            onClick={toggleSavedFilter}
            sx={{ minWidth: '180px' }}
          >
            Saved Mentors
          </Button>
        </Box>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', my: 8 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="error" gutterBottom>
              {error}
            </Typography>
            <Button variant="contained" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {filteredMentors.length > 0 ? (
              filteredMentors.map((mentor) => (
                <Grid item xs={12} md={6} key={mentor.id}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                          <Avatar 
                            src={mentor.avatar} 
                            alt={mentor.name}
                            sx={{ width: 60, height: 60, bgcolor: 'primary.main' }}
                          >
                            {!mentor.avatar && getInitials(mentor.name)}
                          </Avatar>
                          <Box>
                            <Typography variant="h6" component="h2">
                              {mentor.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {mentor.position}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {mentor.branch}, {mentor.graduationYear}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Rating value={mentor.rating} precision={0.1} readOnly size="small" />
                              <Typography variant="body2" color="text.secondary">
                                ({mentor.rating})
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                        
                        <IconButton 
                          onClick={() => toggleSaved(mentor.id)} 
                          color="primary"
                        >
                          {savedMentors.has(mentor.id) ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                        </IconButton>
                      </Box>
                      
                      <Typography variant="body1" paragraph>
                        {mentor.bio}
                      </Typography>
                      
                      <Typography variant="subtitle2" color="text.secondary">
                        Availability: {mentor.availability}
                      </Typography>
                      
                      <Box sx={{ mt: 2 }}>
                        {mentor.expertise && mentor.expertise.map((exp, index) => (
                          <Chip 
                            key={index} 
                            label={exp} 
                            sx={{ mr: 1, mb: 1 }}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                      
                      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button 
                          variant="contained" 
                          color="primary"
                          onClick={() => openRequestDialog(mentor)}
                        >
                          Request Mentorship
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Box sx={{ py: 4, textAlign: 'center' }}>
                  <Typography variant="h6" color="text.secondary">
                    No mentors found matching your criteria.
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Try adjusting your search or filters.
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>
        )}
      </Container>
      
      {/* Mentorship Request Dialog */}
      {selectedMentor && (
        <Dialog open={requestDialogOpen} onClose={closeRequestDialog} fullWidth maxWidth="md">
          <DialogTitle>Request Mentorship from {selectedMentor.name}</DialogTitle>
          <DialogContent>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                About {selectedMentor.name}
              </Typography>
              <Typography variant="body2" paragraph>
                {selectedMentor.bio}
              </Typography>
              <Typography variant="body2">
                <strong>Expertise:</strong> {selectedMentor.expertise ? selectedMentor.expertise.join(', ') : 'Not specified'}
              </Typography>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle1" gutterBottom>
              Your Message
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={6}
              placeholder="Introduce yourself and explain why you would like mentorship from this alumnus. Be specific about your goals and what you hope to learn."
              value={requestMessage}
              onChange={handleRequestChange}
              variant="outlined"
              sx={{ mb: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={closeRequestDialog} color="primary">
              Cancel
            </Button>
            <Button 
              onClick={submitRequest} 
              variant="contained" 
              color="primary"
              disabled={!requestMessage.trim()}
            >
              Send Request
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default MentorsPage; 