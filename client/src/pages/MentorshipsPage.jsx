import React, { useState } from 'react';
import DashboardNavbar from '../components/DashboardNavbar';
import { Box, Container, Typography, Button, Card, CardContent, TextField, 
  Grid, Chip, Dialog, DialogTitle, DialogContent, DialogActions, FormControl,
  InputLabel, Select, MenuItem } from '@mui/material';

const MentorshipsPage = () => {
  const [mentorships, setMentorships] = useState([
    {
      id: 1,
      title: 'Career Guidance in Software Development',
      description: 'Offering mentorship for students interested in software development careers. Can help with interview preparation, resume review, and career planning.',
      expertise: ['Software Development', 'Interview Preparation', 'Career Planning'],
      availability: '2 hours/week',
      active: true
    },
    {
      id: 2,
      title: 'Data Science Mentorship',
      description: 'Support for students pursuing data science. Guidance on projects, learning resources, and industry insights.',
      expertise: ['Data Science', 'Machine Learning', 'Python'],
      availability: '1 hour/week',
      active: true
    }
  ]);

  const [open, setOpen] = useState(false);
  const [newMentorship, setNewMentorship] = useState({
    title: '',
    description: '',
    expertise: '',
    availability: '',
    active: true
  });
  const [expertiseInput, setExpertiseInput] = useState('');
  const [expertiseArray, setExpertiseArray] = useState([]);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setNewMentorship({
      title: '',
      description: '',
      expertise: '',
      availability: '',
      active: true
    });
    setExpertiseArray([]);
    setExpertiseInput('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewMentorship({
      ...newMentorship,
      [name]: value
    });
  };

  const handleExpertiseInputChange = (e) => {
    setExpertiseInput(e.target.value);
  };

  const handleExpertiseKeyDown = (e) => {
    if (e.key === 'Enter' && expertiseInput.trim() !== '') {
      e.preventDefault();
      if (!expertiseArray.includes(expertiseInput.trim())) {
        setExpertiseArray([...expertiseArray, expertiseInput.trim()]);
      }
      setExpertiseInput('');
    }
  };

  const handleDeleteExpertise = (expertiseToDelete) => {
    setExpertiseArray(expertiseArray.filter(expertise => expertise !== expertiseToDelete));
  };

  const handleSubmit = () => {
    const newMentorshipWithId = {
      ...newMentorship,
      id: mentorships.length + 1,
      expertise: expertiseArray
    };
    
    setMentorships([...mentorships, newMentorshipWithId]);
    handleClose();
  };

  const toggleActive = (id) => {
    setMentorships(mentorships.map(mentorship => 
      mentorship.id === id 
        ? { ...mentorship, active: !mentorship.active } 
        : mentorship
    ));
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <DashboardNavbar />
      
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1">
            My Mentorship Offerings
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleOpen}
          >
            Offer New Mentorship
          </Button>
        </Box>

        <Grid container spacing={3}>
          {mentorships.map((mentorship) => (
            <Grid item xs={12} md={6} key={mentorship.id}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  opacity: mentorship.active ? 1 : 0.6
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Typography variant="h5" component="h2" gutterBottom>
                      {mentorship.title}
                    </Typography>
                    <Chip 
                      label={mentorship.active ? "Active" : "Inactive"} 
                      color={mentorship.active ? "success" : "default"}
                    />
                  </Box>
                  
                  <Typography variant="body1" paragraph>
                    {mentorship.description}
                  </Typography>
                  
                  <Typography variant="subtitle2" color="text.secondary">
                    Availability: {mentorship.availability}
                  </Typography>
                  
                  <Box sx={{ mt: 2 }}>
                    {mentorship.expertise.map((exp, index) => (
                      <Chip 
                        key={index} 
                        label={exp} 
                        sx={{ mr: 1, mb: 1 }}
                        size="small"
                      />
                    ))}
                  </Box>
                  
                  <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button 
                      variant="outlined" 
                      color={mentorship.active ? "error" : "success"}
                      onClick={() => toggleActive(mentorship.id)}
                      size="small"
                    >
                      {mentorship.active ? "Deactivate" : "Activate"}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Dialog for adding new mentorship */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
        <DialogTitle>Offer New Mentorship</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Title"
            type="text"
            fullWidth
            name="title"
            value={newMentorship.title}
            onChange={handleChange}
            required
            sx={{ mb: 2 }}
          />
          
          <TextField
            margin="dense"
            label="Description"
            multiline
            rows={4}
            fullWidth
            name="description"
            value={newMentorship.description}
            onChange={handleChange}
            required
            sx={{ mb: 2 }}
          />
          
          <TextField
            margin="dense"
            label="Add Expertise (Press Enter to add)"
            type="text"
            fullWidth
            value={expertiseInput}
            onChange={handleExpertiseInputChange}
            onKeyDown={handleExpertiseKeyDown}
            sx={{ mb: 1 }}
          />
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
            {expertiseArray.map((expertise, index) => (
              <Chip
                key={index}
                label={expertise}
                onDelete={() => handleDeleteExpertise(expertise)}
              />
            ))}
          </Box>
          
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Availability</InputLabel>
            <Select
              name="availability"
              value={newMentorship.availability}
              label="Availability"
              onChange={handleChange}
            >
              <MenuItem value="1 hour/week">1 hour/week</MenuItem>
              <MenuItem value="2 hours/week">2 hours/week</MenuItem>
              <MenuItem value="3+ hours/week">3+ hours/week</MenuItem>
              <MenuItem value="As needed">As needed</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            color="primary"
            disabled={!newMentorship.title || !newMentorship.description || expertiseArray.length === 0 || !newMentorship.availability}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MentorshipsPage; 