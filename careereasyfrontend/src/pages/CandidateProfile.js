import React, { useEffect, useState } from 'react';
import {
  Container, Box, Typography, Card, CardContent, Button, IconButton, Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Snackbar, Paper, Stack
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import AddIcon from '@mui/icons-material/Add';
import MuiAlert from '@mui/material/Alert';
import { candidateAPI, generalAPI } from '../services/api';
import { useParams, useNavigate } from 'react-router-dom';
import Autocomplete from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';
import ReactMarkdown from 'react-markdown';

export default function CandidateProfile() {
  const { candidateId } = useParams();
  const navigate = useNavigate();

  const [candidate, setCandidate] = useState(null);
  const [isSelf, setIsSelf] = useState(false);
  const [loading, setLoading] = useState(true);
  const [resume, setResume] = useState('');
  const [resumeDialogOpen, setResumeDialogOpen] = useState(false);
  const [careerTypes, setCareerTypes] = useState([]);
  const [preferredCareers, setPreferredCareers] = useState([]);
  const [preferredCareersChanged, setPreferredCareersChanged] = useState(false);
  const [infoChanged, setInfoChanged] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [experience, setExperience] = useState({ years: 0, months: 0 });
  const [highestEducation, setHighestEducation] = useState('');
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [aiHighlights, setAiHighlights] = useState([]);
  const [regenerateDialogOpen, setRegenerateDialogOpen] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [backDialogOpen, setBackDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    // username: '',
    // email: '',
    // phone: '',
    // first_name: '',
    // middle_name: '',
    // last_name: '',
    // work_email: '',
    preferred_career_types: [],
    // location: '',
    // country: '',
    // title: '',
    skills: [],
    experience_months: 0,
    highest_education: ''
  });

  // Fetch candidate info and check if self
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Get logged-in candidate id from cookie
        const cookies = document.cookie.split(';').map(c => c.trim());
        const candidateIdCookie = cookies.find(c => c.startsWith('candidate_id='));
        const loggedInId = candidateIdCookie ? candidateIdCookie.split('=')[1] : null;
        setIsSelf(loggedInId === candidateId);

        // Fetch candidate info
        const response = await candidateAPI.candidateInfo(candidateId);
        const data = response.data;
        setCandidate(data); // Set the full candidate data

        // Parse preferred career types from the response
        const preferredCareerIds = data.preferred_career_types || [];
        setPreferredCareers(preferredCareerIds);
        
        setFormData({
          // username: data.username || '',
          // email: data.email || '',
          // phone: data.phone || '',
          // first_name: data.first_name || '',
          // middle_name: data.middle_name || '',
          // last_name: data.last_name || '',
          // work_email: data.work_email || '',
          preferred_career_types: preferredCareerIds,
          // location: data.location || '',
          // country: data.country || '',
          // title: data.title || '',
          skills: data.skills || [],
          experience_months: data.experience_months || 0,
          highest_education: data.highest_education || ''
        });

        // If self, set editable fields
        if (loggedInId === candidateId) {
          setExperience(parseExperience(data.experience_months));
          setHighestEducation(data.highest_education || '');
          setSkills(data.skills || []);
          setAiHighlights(data.highlights || []);
        }
      } catch (error) {
        console.error('Error fetching candidate info:', error);
        setSnackbar({
          open: true,
          message: error.response?.data?.Error || "Failed to fetch profile information. Please try again later.",
          severity: "error"
        });
        navigate('/'); // Redirect to home on error
      } finally {
        setLoading(false);
      }
    };

    const fetchCareers = async () => {
      try {
        const response = await generalAPI.getCareers();
        setCareerTypes(response.data);
        // After getting career types, fetch candidate data
        fetchData();
      } catch (error) {
        console.error('Error fetching career types:', error);
        setSnackbar({
          open: true,
          message: error.response?.data?.Error || "Failed to fetch career types. Please try again later.",
          severity: "error"
        });
        setLoading(false);
      }
    };

    fetchCareers();
    // eslint-disable-next-line
  }, [candidateId]);

  // Parse experience into years and months
  function parseExperience(expMonths) {
    const years = Math.floor(expMonths / 12);
    const months = expMonths % 12;
    return { years, months };
  }

  // Resume fetch (simulate, replace with your API if needed)
  const handleShowResume = async () => {
    setResumeDialogOpen(true);
    setResume(candidate?.resume || 'No resume found.');
  };

  // Preferred careers handlers
  const handleCareersChange = (event, newValue) => {
    setPreferredCareers(newValue.map(career => career.id));
    setPreferredCareersChanged(true);
    setInfoChanged(true);
  };

  // Skills handlers
  const handleRemoveSkill = (skillToRemove) => {
    const newSkills = skills.filter(skill => skill !== skillToRemove);
    setSkills(newSkills);
    setFormData(prev => ({ ...prev, skills: newSkills }));
    setInfoChanged(true);
  };

  const handleAddSkill = () => {
    const trimmedSkill = newSkill.trim();
    if (trimmedSkill) {
      if (skills.includes(trimmedSkill)) {
        setSnackbar({
          open: true,
          message: "This skill is already in your skillset",
          severity: "info"
        });
      } else {
        const newSkills = [...skills, trimmedSkill];
        setSkills(newSkills);
        setFormData(prev => ({ ...prev, skills: newSkills }));
        setInfoChanged(true);
      }
      setNewSkill('');
    }
  };

  // Experience/education edit
  const handleEditSave = () => {
    const totalMonths = (parseInt(experience.years) * 12) + parseInt(experience.months);
    setFormData(prev => ({
      ...prev,
      experience_months: totalMonths,
      highest_education: highestEducation
    }));
    setEditDialogOpen(false);
    setInfoChanged(true);
  };

  // Regenerate AI highlights
  const handleRegenerate = async () => {
    setRegenerateDialogOpen(false);
    setLoading(true);
    try {
      const response = await candidateAPI.updateHighlights({ custom_prompt: customPrompt });
      if (response.status === 200) {
        setAiHighlights(response.data.highlights || []);
        setSnackbar({ open: true, message: 'AI highlights regenerated!', severity: 'success' });
      } else {
        throw new Error(response.data?.Error || 'Failed to regenerate highlights');
      }
    } catch (error) {
      console.error('Error regenerating highlights:', error);
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.Error || 'Failed to regenerate highlights.', 
        severity: 'error' 
      });
    }
    setLoading(false);
  };

  // Submit updated info
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Only include preferred_career_types if they were changed
      const submitData = {
        ...formData,
        preferred_career_types: preferredCareersChanged ? preferredCareers : undefined
      };
      
      const response = await candidateAPI.updateCandidateInfo(submitData);
      if (response.data.Success) {
        setSnackbar({
          open: true,
          message: "Profile updated successfully!",
          severity: "success"
        });
        navigate('/home');
      } else if (response.data.Error) {
        setSnackbar({
          open: true,
          message: response.data.Error,
          severity: "error"
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.Error || "Failed to update profile. Please try again later.",
        severity: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!candidate) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Typography variant="h6" color="error">Profile not found.</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      {/* Back Button */}
      <Box display="flex" justifyContent="flex-start" mb={2}>
        <Button
          variant="outlined"
          color="primary"
          onClick={() => {
            if (infoChanged) {
              setBackDialogOpen(true);
            } else {
              navigate(-1);
            }
          }}
        >
          Back
        </Button>
      </Box>

      {/* Section 1: Public Info */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" fontWeight={700}>
            {candidate.name}
          </Typography>
          <Typography variant="body1">{candidate.title}</Typography>
          <Typography variant="body2" color="text.secondary">{candidate.email}</Typography>
          <Typography variant="body2" color="text.secondary">{candidate.phone}</Typography>
          <Typography variant="body2" color="text.secondary">{candidate.location}, {candidate.country}</Typography>
          {!isSelf && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" fontWeight={600}>Highlights</Typography>
              <Box component="ul" sx={{ pl: 3, mb: 0 }}>
                {(candidate.highlights || []).map((line, idx) => (
                  <li key={idx}>
                    <Typography variant="body2" component="span">
                      {line}
                    </Typography>
                  </li>
                ))}
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Section 2: Resume */}
      <Paper sx={{ mb: 3, p: 2 }}>
        <Button variant="contained" onClick={handleShowResume}>
          Show Resume
        </Button>
      </Paper>

      {/* Only show the rest if self */}
      {isSelf && (
        <>
          {/* Section 3: Editable Preferred Careers */}
          <Paper sx={{ mb: 3, p: 2 }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
              Preferred Careers
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2, justifyContent: 'center' }}>
              {(candidate.preferred_career_types || []).map((careerName) => (
                <Chip
                  key={careerName}
                  label={careerName}
                  sx={{ mb: 1 }}
                  color="default"
                  variant="outlined"
                />
              ))}
            </Stack>
            <Autocomplete
              multiple
              options={careerTypes}
              getOptionLabel={(option) => option.name}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              value={careerTypes.filter(career => preferredCareers.includes(career.id))}
              onChange={handleCareersChange}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Update Your Preferred Careers (Multiple Choice)"
                  placeholder="Select careers"
                />
              )}
            />
          </Paper>

          {/* Section 4: Experience, Education, Skills, AI Highlights */}
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  {experience.years} years, {experience.months} months of experience
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Highest education: {highestEducation}
                </Typography>
              </Box>
              <IconButton onClick={() => setEditDialogOpen(true)}>
                <EditIcon />
              </IconButton>
            </CardContent>
          </Card>

          <Paper sx={{ mb: 3, p: 2 }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
              Skills
            </Typography>
            <Stack
              direction="row"
              spacing={1}
              flexWrap="wrap"
              justifyContent="center"
              sx={{ mb: 2 }}
            >
              {skills.map((skill) => (
                <Chip
                  key={skill}
                  label={skill}
                  onDelete={() => handleRemoveSkill(skill)}
                  deleteIcon={<CloseIcon />}
                  sx={{ mb: 1 }}
                />
              ))}
            </Stack>
            <Box display="flex" gap={1} alignItems="center">
              <TextField
                size="small"
                label="Add skill"
                value={newSkill}
                onChange={e => setNewSkill(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleAddSkill(); }}
                sx={{ flex: 1 }}
              />
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddSkill}
                sx={{ minWidth: 120 }}
              >
                Add Skill
              </Button>
            </Box>
          </Paper>

          <Paper sx={{ p: 2 }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
              <Typography variant="h6" fontWeight={700}>
                AI Highlights
              </Typography>
              <Button
                variant="outlined"
                startIcon={<AutorenewIcon />}
                onClick={() => setRegenerateDialogOpen(true)}
              >
                Regenerate
              </Button>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Highlights of your experience, powered by AI and visible to employers.
            </Typography>
            <Box component="ul" sx={{ pl: 3, mb: 0 }}>
              {(aiHighlights || []).map((line, idx) => (
                <li key={idx}>
                  <Typography variant="body1" component="span">
                    {line}
                  </Typography>
                </li>
              ))}
            </Box>
          </Paper>

          {/* Submit Button */}
          <Box display="flex" justifyContent="flex-end" mt={3}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={!infoChanged || loading}
            >
              Submit
            </Button>
          </Box>
        </>
      )}

      {/* Resume Dialog */}
      <Dialog open={resumeDialogOpen} onClose={() => setResumeDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{isSelf ? "My Resume" : "Candidate Resume"}</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <ReactMarkdown>{resume}</ReactMarkdown>
          </Box>
          {isSelf && (
            <Button variant="outlined" onClick={() => { setResumeDialogOpen(false); navigate('/upload'); }}>
              Update Resume
            </Button>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog (for experience/education) */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Edit Experience & Education</DialogTitle>
        <DialogContent>
          <Box display="flex" gap={2} alignItems="center" mb={2}>
            <TextField
              label="Years"
              type="number"
              value={experience.years}
              onChange={e => setExperience({ ...experience, years: e.target.value })}
              sx={{ width: 100 }}
              inputProps={{ min: 0 }}
            />
            <Typography>years</Typography>
            <TextField
              label="Months"
              type="number"
              value={experience.months}
              onChange={e => setExperience({ ...experience, months: e.target.value })}
              sx={{ width: 100 }}
              inputProps={{ min: 0, max: 11 }}
            />
            <Typography>months</Typography>
          </Box>
          <TextField
            label="Highest Education"
            fullWidth
            value={highestEducation}
            onChange={e => setHighestEducation(e.target.value)}
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleEditSave}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* Regenerate Dialog */}
      <Dialog open={regenerateDialogOpen} onClose={() => setRegenerateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Regenerate AI Highlights</DialogTitle>
        <DialogContent>
          <TextField
            label="Custom Prompt"
            multiline
            minRows={3}
            fullWidth
            value={customPrompt}
            onChange={e => setCustomPrompt(e.target.value)}
            placeholder='Customize your AI highlights with your instructions. Try saying: "Emphasize on my industrial experience and certificates."'
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRegenerateDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleRegenerate}
            disabled={loading}
          >
            Regenerate
          </Button>
        </DialogActions>
      </Dialog>

      {/* Back Confirmation Dialog */}
      <Dialog open={backDialogOpen} onClose={() => setBackDialogOpen(false)}>
        <DialogTitle>Are you sure to go back?</DialogTitle>
        <DialogContent>
          <Typography>
            {infoChanged
              ? "All unsaved changes will be lost."
              : "Are you sure you want to go back?"}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBackDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              setBackDialogOpen(false);
              navigate(-1);
            }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <MuiAlert
          elevation={6}
          variant="filled"
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
    </Container>
  );
}
