import React, { useState } from 'react';
import {
    Container,
    Box,
    TextField,
    Button,
    Typography,
    Paper,
    Snackbar
} from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import { useNavigate } from 'react-router-dom';
import { candidateAPI } from '../services/api';

// Helper for each card
const CardBox = ({ children }) => (
    <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        {children}
    </Paper>
);

export default function CandidateLogin() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'error',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await candidateAPI.login(formData);
            const data = await response.json();
            if (response.ok && data.Success) {
                setSnackbar({
                    open: true,
                    message: "Login successful!",
                    severity: "success"
                });
                // Redirect to candidate home or upload resume page after a short delay
                // Check if candidate has uploaded resume
                const candidateId = document.cookie.split('; ').find(row => row.startsWith('candidate_id=')).split('=')[1];
                const candidateInfo = await candidateAPI.candidateInfo(candidateId);
                const candidateInfoData = await candidateInfo.json();
                if (response.ok && candidateInfoData.resume === null) {
                    setTimeout(() => navigate('/upload'), 1500);
                } else {
                    setTimeout(() => navigate('/home'), 1500);
                }
            } else if (data.Error) {
                setSnackbar({
                    open: true,
                    message: data.Error,
                    severity: "error"
                });
            } else {
                setSnackbar({
                    open: true,
                    message: "Unknown error occurred.",
                    severity: "error"
                });
            }
        } catch (error) {
            setSnackbar({
                open: true,
                message: "A server error occurred. Please try again later.",
                severity: "error"
            });
            console.error('Error during login:', error);
        }
    };

    return (
        <Container maxWidth="sm">
            <Box sx={{ mt: 4, mb: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom align="center">
                    Login
                </Typography>
                <form onSubmit={handleSubmit}>
                    <CardBox>
                        <Box display="flex" flexDirection="column" gap={2}>
                            <TextField
                                required
                                fullWidth
                                label="Username"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                            />
                            <TextField
                                required
                                fullWidth
                                label="Password"
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </Box>
                    </CardBox>
                    <Box mt={4} display="flex" justifyContent="center" gap={2}>
                        <Button
                            variant="outlined"
                            color="primary"
                            size="large"
                            sx={{ textTransform: 'none', minWidth: 150 }}
                            onClick={() => navigate(-1)}
                        >
                            Back
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            size="large"
                            sx={{ textTransform: 'none', minWidth: 200 }}
                        >
                            Log In
                        </Button>
                    </Box>
                </form>
                <Box mt={3} textAlign="center">
                    <Typography variant="body1">
                        Do not have an account?{' '}
                        <Button
                            variant="text"
                            color="primary"
                            sx={{ textTransform: 'none', p: 0, minWidth: 0 }}
                            onClick={() => navigate('/signup')}
                        >
                            Create an account
                        </Button>
                    </Typography>
                </Box>
            </Box>
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
