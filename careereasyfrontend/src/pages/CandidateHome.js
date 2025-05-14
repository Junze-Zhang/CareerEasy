import React, { useEffect, useState } from 'react';
import {
    Container,
    Box,
    Typography,
    Card,
    CardContent,
    CardMedia,
    Grid,
    Button,
    Pagination,
    CircularProgress,
    IconButton,
    ButtonBase
} from '@mui/material';
import { candidateAPI } from '../services/api';
import AccountCircle from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from 'react-router-dom';

export default function CandidateHome() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchJobs = async () => {
            setLoading(true);
            try {
                const response = await candidateAPI.getJobs(page);
                const data = await response.json();
                setJobs(data.items || []);
                setTotalPages(data.total_pages || 1);
            } catch (error) {
                setJobs([]);
            }
            setLoading(false);
        };
        fetchJobs();
    }, [page]);

    return (
        <Container maxWidth="false" sx={{ mt: 4, mb: 4 }}>
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
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 4,
                    px: 2,
                    pt: 2,
                }}
            >
                {/* Logo */}
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <img
                        src="/ce-logo.png"
                        alt="CareerEasy Logo"
                        style={{ height: 48 }}
                    />
                </Box>
                {/* Right-side buttons */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <IconButton
                        color="white"
                        onClick={() => { 
                            const cookies = document.cookie.split(';').map(c => c.trim());
                            const candidateIdCookie = cookies.find(c => c.startsWith('candidate_id='));
                            window.location.href = candidateIdCookie ? '/'+candidateIdCookie.split('=')[1] : '/'; 
                        }}
                        size="large"
                    >
                        <AccountCircle fontSize="inherit" />
                    </IconButton>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<LogoutIcon />}
                        onClick={() => {
                            // Call your logout API and redirect to login or landing page
                            fetch(candidateAPI.logout()).then(() => {
                                window.location.href = '/';
                            });
                        }}
                        sx={{ ml: 1 }}
                    >
                        Log out
                    </Button>
                </Box>
            </Box>
            {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                    <CircularProgress />
                </Box>
            ) : (
                <>
                    <Grid
                        container
                        spacing={3}
                        justifyContent="center"
                        wrap="wrap"
                    >
                        {jobs.map((job) => (
                            <Grid
                                item
                                key={job.id}
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    flexBasis: '560px',
                                    maxWidth: '560px',
                                }}
                            >
                                <ButtonBase
                                    sx={{ width: '100%', borderRadius: 2 }}
                                    onClick={() => navigate(`/job_detail/${job.id}`)}
                                >
                                    <Card
                                        sx={{
                                            width: 560,
                                            height: 88,
                                            display: 'flex',
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            boxSizing: 'border-box',
                                        }}
                                    >
                                        <CardMedia
                                            component="img"
                                            image={job.company__logo}
                                            alt={job.company__name}
                                            sx={{ width: 64, height: 64, objectFit: 'contain', ml: 2, mr: 2 }}
                                        />
                                        <Box
                                            sx={{
                                                flex: 1,
                                                minWidth: 0,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                justifyContent: 'center',
                                                height: '100%',
                                            }}
                                        >
                                            <Typography
                                                variant="h6"
                                                component="div"
                                                noWrap
                                                sx={{
                                                    fontWeight: 600,
                                                    mb: 1,
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                }}
                                            >
                                                {job.career__name}
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                noWrap
                                                sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
                                            >
                                                {job.company__name} | {job.company__location}, {job.company__country}
                                            </Typography>
                                        </Box>
                                    </Card>
                                </ButtonBase>
                            </Grid>
                        ))}
                    </Grid>
                    <Box display="flex" justifyContent="center" mt={4}>
                        <Pagination
                            count={totalPages}
                            page={page}
                            onChange={(_, value) => setPage(value)}
                            color="primary"
                        />
                    </Box>
                </>
            )}
        </Container>
    );
}