// src/pages/CareerEasy.js
import React, { useEffect } from 'react';
import { 
    Container, 
    Typography, 
    Button, 
    Box,
    Stack
} from '@mui/material';
import Background from '../components/Background';
import { useNavigate } from 'react-router-dom';

export default function CareerEasy() {
    const navigate = useNavigate();

    useEffect(() => {
        // Simple cookie check
        const cookies = document.cookie.split(';').map(c => c.trim());
        const candidateIdCookie = cookies.find(c => c.startsWith('candidate_id='));
        if (candidateIdCookie) {
            navigate('/home');
        }
    }, [navigate]);

    return (
        <>
        <Background />
        <Box 
            sx={{ 
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                backgroundColor: 'warning.main',
                color: 'warning.contrastText',
                p: 1,
                textAlign: 'center',
                zIndex: 1001,
            }}
        >
            <Typography variant="body2" fontWeight="bold">
                ⚠️ Tech Demo Disclaimer: This is a demonstration with very limited security features. 
                Please do not enter sensitive personal information. All data are AI generated for demonstration purposes only.
            </Typography>
        </Box>
        <Container maxWidth="md">
            <Box 
                sx={{ 
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    gap: 4
                }}
            >
                <img
                    src="/ce-logo.png"
                    alt="CareerEasy Logo"
                    style={{ height: 80, marginBottom: 16 }}
                />

                <Typography 
                    variant="h4" 
                    component="h1"
                    sx={{ 
                        color: 'text.primary',
                        mb: 4,
                        fontFamily: '"Montserrat", sans-serif',
                        fontWeight: 400,
                        letterSpacing: 1,
                    }}
                >
                    Job searching made easy.
                </Typography>

                <Stack spacing={2} alignItems="center">
                    <Button 
                        variant="contained" 
                        size="large"
                        onClick={() => navigate('/signup')}
                        sx={{ 
                            minWidth: '200px',
                            py: 1.5,
                            textTransform: 'none',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                            '&:hover': {
                                boxShadow: '0 6px 8px rgba(0,0,0,0.15)',
                            },
                        }}
                    >
                        Create Account
                    </Button>

                    <Box sx={{ mt: 2 }}>
                        <Typography 
                            component="span" 
                            sx={{ mr: 1 }}
                        >
                            Already have an account?
                        </Typography>
                        <Button 
                            variant="text" 
                            color="primary"
                            sx={{ textTransform: 'none' }}
                            onClick={() => navigate('/login')}
                        >
                            Log in
                        </Button>
                    </Box>

                    <Box sx={{ mt: 2 }}>
                        <Typography 
                            component="span" 
                            sx={{ mr: 1 }}
                        >
                            Are you an employer?
                        </Typography>
                        <Button 
                            variant="text" 
                            color="primary"
                            sx={{ textTransform: 'none' }}
                            onClick={() => navigate('/employer/home')}
                        >
                            CareerEasy for Employers
                        </Button>
                    </Box>
                </Stack>
            </Box>
        </Container>
        </>
    );
}