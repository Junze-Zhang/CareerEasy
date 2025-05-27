import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Snackbar,
  CircularProgress
} from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import { candidateAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function UploadResume() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      setSnackbar({
        open: true,
        message: "Please select a file to upload.",
        severity: "warning"
      });
      return;
    }
    setLoading(true);
    // Step 1: Upload resume
    const formData = new FormData();
    formData.append('resume', file);
    try {
      const uploadResponse = await candidateAPI.uploadResume(formData);
      if (uploadResponse.status !== 200) {
        throw new Error(uploadResponse.data?.Error || "Failed to upload resume.");
      }
      // Step 2: Show analyzing popup and call aiExtract
      setSnackbar({
        open: true,
        message: "✨ Analyzing your resume with Reasoning AI. This may take up to a few minutes...",
        severity: "info"
      });
      const aiResponse = await candidateAPI.extractCandidateInfo();
      if (aiResponse.status !== 200) {
        throw new Error(aiResponse.data?.Error || "Failed to analyze resume.");
      }
      // Step 3: Redirect to ai summary page
      navigate('/ai-summary', { state: { aiSummary: aiResponse.data } });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || "An error occurred. Please try again.",
        severity: "error"
      });
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 5, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
          Please upload your resume
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Only plain text files are supported.
        </Typography>
        <Button
          variant="contained"
          component="label"
          disabled={loading}
          sx={{ mb: 2, minWidth: 200, py: 1.5, fontSize: 18 }}
        >
          {file ? file.name : "Select File"}
          <input
            type="file"
            accept="*"
            hidden
            onChange={handleFileChange}
            disabled={loading}
          />
        </Button>
        <Button
          variant="outlined"
          color="primary"
          onClick={handleUpload}
          disabled={loading}
          sx={{ minWidth: 200, py: 1.5, fontSize: 18 }}
        >
          Upload
        </Button>
        {loading && (
          <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <CircularProgress sx={{ mb: 2 }} />
            <Typography variant="body2" color="text.secondary">
            ✨ Analyzing your resume with Reasoning AI. This may take up to a few minutes...
            </Typography>
          </Box>
        )}
      </Paper>
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
