import React, { useState } from 'react';
import DashboardNavbar from '../components/DashboardNavbar';
import { Box, Container, Typography, Grid, Card, CardContent, Button, 
  Chip, TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  InputAdornment, IconButton, Rating, Avatar, Divider } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';

const MentorsPage = () => {
  const [mentors, setMentors] = useState([
    {
      id: 1,
      name: 'Alex Johnson',
      position: 'Software Engineer at Google',
      bio: 'Experienced software engineer with expertise in web development, cloud computing, and system design.',
      expertise: ['Software Development', 'Cloud Computing', 'System Design'],
      rating: 4.8,
      availability: '2 hours/week',
      saved: false,
      avatar: '/assets/avatars/avatar1.jpg'
    },
    {
      id: 2,
      name: 'Samantha Lee',
      position: 'Data Scientist at Microsoft',
      bio: 'Data scientist with strong background in machine learning and data analysis. Passionate about mentoring new talent.',
      expertise: ['Data Science', 'Machine Learning', 'Python'],
      rating: 4.5,
      availability: '1 hour/week',
      saved: true,
      avatar: '/assets/avatars/avatar2.jpg'
    },
    {
      id: 3,
      name: 'Michael Chen',
      position: 'Product Manager at Amazon',
      bio: 'Product manager with experience in launching successful tech products. Can help with product thinking and career guidance.',
      expertise: ['Product Management', 'UX Design', 'Business Strategy'],
      rating: 4.7,
      availability: '3 hours/week',
      saved: false,
      avatar: '/assets/avatars/avatar3.jpg'
    },
    {
      id: 4,
      name: 'Priya Patel',
      position: 'Frontend Engineer at Netflix',
      bio: 'Frontend specialist with focus on React and modern JavaScript frameworks. Loves helping students break into tech.',
      expertise: ['React', 'JavaScript', 'UI/UX'],
      rating: 4.9,
      availability: 'As needed',
      saved: false,
      avatar: '/assets/avatars/avatar4.jpg'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [requestMessage, setRequestMessage] = useState('');
  const [savedMentorsOnly, setSavedMentorsOnly] = useState(false);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const toggleSavedFilter = () => {
    setSavedMentorsOnly(!savedMentorsOnly);
  };

  const toggleSaved = (id) => {
    setMentors(mentors.map(mentor => 
      mentor.id === id ? { ...mentor, saved: !mentor.saved } : mentor
    ));
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

  const submitRequest = () => {
    // Here you would typically make an API call to submit the mentorship request
    console.log(`Sending request to ${selectedMentor.name}: ${requestMessage}`);
    
    // Show success message or notification
    alert(`Request sent to ${selectedMentor.name}!`);
    
    closeRequestDialog();
  };

  const filteredMentors = mentors.filter(mentor => {
    // Filter by search term
    const matchesSearch = 
      mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentor.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentor.bio.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentor.expertise.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Filter by saved status if savedMentorsOnly is true
    const matchesSaved = savedMentorsOnly ? mentor.saved : true;
    
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
            placeholder="Search mentors by name, position, or expertise..."
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
                          sx={{ width: 60, height: 60 }}
                        />
                        <Box>
                          <Typography variant="h6" component="h2">
                            {mentor.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {mentor.position}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Rating value={mentor.rating} precision={0.1} readOnly size="small" />
                            <Typography variant="body2" color="text.secondary">
                              ({mentor.rating})
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                      
                      <IconButton onClick={() => toggleSaved(mentor.id)} color="primary">
                        {mentor.saved ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                      </IconButton>
                    </Box>
                    
                    <Typography variant="body1" paragraph>
                      {mentor.bio}
                    </Typography>
                    
                    <Typography variant="subtitle2" color="text.secondary">
                      Availability: {mentor.availability}
                    </Typography>
                    
                    <Box sx={{ mt: 2 }}>
                      {mentor.expertise.map((exp, index) => (
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
                <strong>Expertise:</strong> {selectedMentor.expertise.join(', ')}
              </Typography>
              <Typography variant="body2">
                <strong>Availability:</strong> {selectedMentor.availability}
              </Typography>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle1" gutterBottom>
              Your Message
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="Introduce yourself and explain what you're looking for in a mentor..."
              value={requestMessage}
              onChange={handleRequestChange}
              variant="outlined"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={closeRequestDialog} color="primary">
              Cancel
            </Button>
            <Button 
              onClick={submitRequest} 
              color="primary" 
              variant="contained"
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