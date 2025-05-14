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
        // Get candidate id from cookie
        const cookies = document.cookie.split(';').map(c => c.trim());
        const candidateIdCookie = cookies.find(c => c.startsWith('candidate_id='));
        const candidateId = candidateIdCookie ? candidateIdCookie.split('=')[1] : null;
        if (!candidateId) {
          setSnackbar({ open: true, message: 'Please sign in to view your AI summary.', severity: 'error' });
          navigate('/');
          return;
        }
        const response = await candidateAPI.candidateInfo(candidateId);
        const data = await response.json();
        setExperience(parseExperience(data.experience_months));
        setHighestEducation(data.highest_education || '');
        setSkills(data.skills || []);
        setAiHighlights(data.highlights || []);
      } catch (error) {
        setSnackbar({ open: true, message: 'Failed to load AI summary.', severity: 'error' });
      }
      setLoading(false);
    };
    fetchCandidateInfo();
    // eslint-disable-next-line
  }, []);

  // Handlers for editing experience/education
  const handleEditSave = () => {
    setEditDialogOpen(false);
    setInfoChanged(true);
  };

  // Skills handlers
  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
    setInfoChanged(true);
  };

  const handleAddSkill = () => {
    if (newSkill && !skills.includes(newSkill)) {
      setSkills([...skills, newSkill]);
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
      const data = await response.json();
      setAiHighlights(data.highlights || []);
      setSnackbar({ open: true, message: 'AI highlights regenerated!', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to regenerate highlights.', severity: 'error' });
    }
    setLoading(false);
  };

  // Submit updated info
  const handleSubmit = async () => {
    setLoading(true);
    try {
      const infoData = {
        experience_months: Number(experience.years) * 12 + Number(experience.months),
        highest_education: highestEducation,
        skills: skills
      };
      const response = await candidateAPI.updateInfo(infoData);
      if (response.ok) {
        setSnackbar({ open: true, message: 'Profile updated successfully!', severity: 'success' });
        setInfoChanged(false);
      } else {
        setSnackbar({ open: true, message: 'Failed to update profile.', severity: 'error' });
      }
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to update profile.', severity: 'error' });
    }
    setLoading(false);
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
          onClick={handleSubmit}
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
            ✨ Regenerating Your Highlights with Reasoning AI...
          </Typography>
        </DialogContent>
      </Dialog>
    </Container>
  );
}
