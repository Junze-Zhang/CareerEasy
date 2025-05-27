import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { candidateAPI } from '../services/api';
import {
  Container, Box, Typography, Card, CardMedia, Button, CircularProgress, Link
} from '@mui/material';
import ReactMarkdown from 'react-markdown';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';

export default function JobDetail() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fitDialogOpen, setFitDialogOpen] = useState(false);
  const [fitLoading, setFitLoading] = useState(false);
  const [fitResult, setFitResult] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  const fetchJobDetails = async () => {
      setLoading(true);
      try {
        const response = await candidateAPI.getJobDetails(jobId);
      setJob(response.data);
      } catch (error) {
      console.error('Error fetching job details:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.Error || "Failed to fetch job details. Please try again later.",
        severity: "error"
      });
    } finally {
      setLoading(false);
    }
    };

  const handleCheckFit = async () => {
    // Check for candidate_id cookie
    const cookies = document.cookie.split(';').map(c => c.trim());
    const candidateIdCookie = cookies.find(c => c.startsWith('candidate_id='));
    if (!candidateIdCookie) {
      setSnackbar({
        open: true,
        message: "Please sign in to use this feature.",
        severity: "warning"
      });
      return;
    }
    setFitDialogOpen(true);
    setFitLoading(true);
    setFitResult('');
    try {
      const response = await candidateAPI.checkFit({ job_id: jobId });
      setFitResult(response.data.Success || "No response from AI.");
    } catch (error) {
      console.error('Error checking job fit:', error);
      setFitResult(error.response?.data?.Error || "An error occurred while contacting the AI. Please try again later.");
    }
    setFitLoading(false);
  };

  useEffect(() => {
    fetchJobDetails();
  }, [jobId]);

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!job) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Typography variant="h6" color="error">Job not found.</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Button variant="outlined" onClick={() => navigate(-1)} sx={{ mb: 2 }}>
        Back
      </Button>
      <Card sx={{ p: 2, mb: 2, display: 'flex', alignItems: 'center' }}>
        <CardMedia
          component="img"
          image={job.company__logo}
          alt={job.company__name}
          sx={{ width: 64, height: 64, objectFit: 'contain', mr: 2 }}
        />
        <Box>
          <Typography variant="h5" fontWeight={700}>{job.title}</Typography>
          <Typography
            sx={{ fontWeight: 500, fontSize: 18, mr: 2 }}
          >
            {job.company__name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {job.company__location}, {job.company__country}
          </Typography>
        </Box>
      </Card>
      {/* <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1" fontWeight={600}>
          {job.career__name}
        </Typography>
      </Box> */}
            <Box sx={{ mb: 3, mt: 2 }}>
        <Button
          variant="outlined"
          color="primary"
          fullWidth
          sx={{ py: 2, fontSize: 18, fontWeight: 600, borderRadius: 2 }}
          onClick={handleCheckFit}
        >
          Am I a good fit for this job?
        </Button>
      </Box>
      <Box sx={{ mb: 2 }}>
        <ReactMarkdown>{job.description.replace("markdown\n", '')}</ReactMarkdown>
      </Box>
      <Box>
        <Link href={job.url} target="_blank" rel="noopener" underline="hover">
          View job posting
        </Link>
      </Box>
      <Dialog
        open={fitDialogOpen}
        onClose={() => setFitDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Are You a Good Fit?</DialogTitle>
        <DialogContent>
          {fitLoading ? (
            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight={200}>
              <CircularProgress sx={{ mb: 2 }} />
              <Typography variant="body1" align="center">
                Analyzing. This may take up to a few minutes...
              </Typography>
            </Box>
          ) : (
            <ReactMarkdown>
              {fitResult}
            </ReactMarkdown>
          )}
        </DialogContent>
      </Dialog>
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
