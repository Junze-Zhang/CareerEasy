import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Paper,
  Stack
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import AddIcon from '@mui/icons-material/Add';
import MuiAlert from '@mui/material/Alert';
import { candidateAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';

export default function CandidateAISummary() {
  const navigate = useNavigate();

  const [experience, setExperience] = useState({ years: 0, months: 0 });
  const [highestEducation, setHighestEducation] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');

  const [aiHighlights, setAiHighlights] = useState([]);
  const [regenerateDialogOpen, setRegenerateDialogOpen] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [loading, setLoading] = useState(true);

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [infoChanged, setInfoChanged] = useState(false);

  const [nextDialogOpen, setNextDialogOpen] = useState(false);

  const [candidateInfo, setCandidateInfo] = useState({
    experience_months: 0,
    skills: [],
    highest_education: '',
    ai_highlights: []
  });

  // Parse experience into years and months
  function parseExperience(expMonths) {
    const years = Math.floor(expMonths / 12);
    const months = expMonths % 12;
    return { years, months };
  }

  // Fetch candidate info on mount
  useEffect(() => {
    const fetchCandidateInfo = async () => {
      setLoading(true);
      try {
        // Get candidate id from cookie - fix cookie parsing
        const cookies = document.cookie.split(';');
        const candidateIdCookie = cookies.find(c => c.trim().startsWith('candidate_id='));
        const candidateId = candidateIdCookie ? candidateIdCookie.trim().split('=')[1] : null;
        
        if (!candidateId) {
          setSnackbar({ open: true, message: 'Please sign in to view your AI summary.', severity: 'error' });
          navigate('/');
          return;
        }

        const response = await candidateAPI.candidateInfo(candidateId);
        if (response.status !== 200) {
          setSnackbar({ open: true, message: 'Session expired. Please sign in again.', severity: 'error' });
          navigate('/');
          return;
        }

        const data = response.data;
        setExperience(parseExperience(data.experience_months));
        setHighestEducation(data.highest_education || '');
        setSkills(data.skills || []);
        setAiHighlights(data.highlights || []);
        setCandidateInfo(prev => ({
          ...prev,
          experience_months: data.experience_months,
          skills: data.skills,
          highest_education: data.highest_education,
          ai_highlights: data.highlights
        }));
      } catch (error) {
        console.error('Error fetching candidate info:', error);
        setSnackbar({ open: true, message: 'Failed to load AI summary.', severity: 'error' });
      }
      setLoading(false);
    };
    fetchCandidateInfo();
    // eslint-disable-next-line
  }, []);

  // Handlers for editing experience/education
  const handleEditSave = () => {
    const totalMonths = (parseInt(experience.years) * 12) + parseInt(experience.months);
    setCandidateInfo(prev => ({
      ...prev,
      experience_months: totalMonths,
      highest_education: highestEducation
    }));
    setEditDialogOpen(false);
    setInfoChanged(true);
  };

  // Skills handlers
  const handleRemoveSkill = (skillToRemove) => {
    const newSkills = skills.filter(skill => skill !== skillToRemove);
    setSkills(newSkills);
    setCandidateInfo(prev => ({
      ...prev,
      skills: newSkills
    }));
    setInfoChanged(true);
  };

  const handleAddSkill = () => {
    if (newSkill && !skills.includes(newSkill)) {
      const newSkills = [...skills, newSkill];
      setSkills(newSkills);
      setCandidateInfo(prev => ({
        ...prev,
        skills: newSkills
      }));
      setNewSkill('');
      setInfoChanged(true);
    }
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
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.Error || 'Failed to regenerate highlights.', 
        severity: 'error' 
      });
    }
    setLoading(false);
  };

  const handleExtractInfo = async () => {
    setLoading(true);
    try {
      const response = await candidateAPI.extractCandidateInfo();
      if (response.status === 200) {
        setSnackbar({
          open: true,
          message: "AI analysis completed successfully!",
          severity: "success"
        });
        // Update the state with the extracted info
        setExperience(parseExperience(response.data.experience));
        setHighestEducation(response.data.highest_education || '');
        setSkills(response.data.skills || []);
        setAiHighlights(response.data.ai_highlights || []);
        setCandidateInfo(prev => ({
          ...prev,
          experience_months: response.data.experience,
          skills: response.data.skills,
          highest_education: response.data.highest_education,
          ai_highlights: response.data.ai_highlights
        }));
      } else {
        throw new Error(response.data?.Error || 'Failed to analyze resume');
      }
    } catch (error) {
      console.error('Error extracting candidate info:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.Error || "Failed to analyze resume. Please try again later.",
        severity: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateInfo = async () => {
    setLoading(true);
    try {
      const response = await candidateAPI.updateCandidateInfo(candidateInfo);
      if (response.status === 200) {
        setSnackbar({
          open: true,
          message: "Profile updated successfully!",
          severity: "success"
        });
        // Only navigate after successful update
        setTimeout(() => {
          navigate('/home');
        }, 1500); // Give user time to see the success message
      } else {
        throw new Error(response.data?.Error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating candidate info:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.Error || "Failed to update profile. Please try again later.",
        severity: "error"
      });
    } finally {
    setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      {/* Experience and Education Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h6" fontWeight={700}>
              {experience.years} years, {experience.months} months experience
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

      {/* Skills Section */}
      <Paper sx={{ mb: 3, p: 2 }}>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
          Skills
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="center" sx={{ mb: 2 }}>
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

      {/* AI Highlights Section */}
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
          {aiHighlights
            // .split('\n')
            // .filter(line => line.trim() !== '')
            .map((line, idx) => (
              <li key={idx}>
                <Typography variant="body1" component="span">
                  {line.replace(/^\s*[-*]\s*/, '')}
                </Typography>
              </li>
            ))}
        </Box>
      </Paper>

      {/* Submit and Next Buttons */}
      <Box display="flex" justifyContent="flex-end" mt={3} gap={2}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleUpdateInfo}
          disabled={!infoChanged || loading}
        >
          Submit
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          onClick={() => setNextDialogOpen(true)}
        >
          Next
        </Button>
      </Box>

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

      {/* Next Confirmation Dialog */}
      <Dialog open={nextDialogOpen} onClose={() => setNextDialogOpen(false)}>
        <DialogTitle>Are you sure to proceed?</DialogTitle>
        <DialogContent>
          <Typography>
            All unsaved changes will be lost.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNextDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              setNextDialogOpen(false);
              navigate('/home');
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

      {/* Loading Dialog */}
      <Dialog open={loading} maxWidth="xs" fullWidth>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
          <CircularProgress sx={{ mb: 3 }} />
          <Typography variant="h6" align="center" sx={{ mb: 1 }}>
            ✨ Generating Your Highlights with Reasoning AI...
          </Typography>
        </DialogContent>
      </Dialog>
    </Container>
  );
}
