import React, { useState, useEffect } from 'react';
import {
    Container,
    Box,
    TextField,
    Button,
    Typography,
    Paper,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { generalAPI, candidateAPI } from '../services/api';
import Autocomplete from '@mui/material/Autocomplete';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

// Helper for each card
const CardBox = ({ children }) => (
    <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        {children}
    </Paper>
);

export default function CandidateSignUp() {
    const navigate = useNavigate();
    const [careerTypes, setCareerTypes] = useState([]);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        phone: '',
        password: '',
        confirm_password: '',
        first_name: '',
        middle_name: '',
        last_name: '',
        work_email: '',
        preferred_career_types: [],
        location: '',
        country: '',
        title: ''
    });
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success', // 'success' | 'error'
    });

    // Fetch career types when component mounts
    useEffect(() => {
        const fetchCareerTypes = async () => {
            try {
                const response = await generalAPI.getCareers();
                setCareerTypes(response.data);
            } catch (error) {
                console.error('Error fetching career types:', error);
                setSnackbar({
                    open: true,
                    message: error.response?.data?.Error || "Failed to fetch career types. Please refresh the page.",
                    severity: "error"
                });
            }
        };
        fetchCareerTypes();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirm_password) {
            setSnackbar({
                open: true,
                message: "Passwords do not match!",
                severity: "error"
            });
            return;
        }
        if (formData.preferred_career_types.length === 0) {
            setSnackbar({
                open: true,
                message: "Please select at least one preferred career.",
                severity: "error"
            });
            return;
        }
        if (!/^\d{10}$/.test(formData.phone)) {
            setSnackbar({
                open: true,
                message: "Please enter a valid North American phone number in the format 1231231234.",
                severity: "error"
            });
            return;
        }
        // Prepare data for API: set work_email to email if empty
        const dataToSend = {
            ...formData,
            work_email: formData.work_email ? formData.work_email : formData.email,
        };
        try {
            const response = await candidateAPI.signup(dataToSend);
            
            if (response.data.Success) {
                setSnackbar({
                    open: true,
                    message: "Sign up successful! Please log in.",
                    severity: "success"
                });
                navigate('/login');
            } else if (response.data.Error) {
                setSnackbar({
                    open: true,
                    message: response.data.Error,
                    severity: "error"
                });
            }
        } catch (error) {
            console.error('Error during signup:', error);
            setSnackbar({
                open: true,
                message: error.response?.data?.Error || "A server error occurred. Please try again later.",
                severity: "error"
            });
        }
    };

    return (
        <Container maxWidth="md">
            <Box sx={{ mt: 4, mb: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom align="center">
                    Create Your Account
                </Typography>
                <form onSubmit={handleSubmit}>
                    {/* Card 1: Username, Email, Phone | Password, Confirm Password */}
                    <CardBox>
                        <Box display="flex" gap={2} mb={2}>
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
                                label="Email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                            />
                            <TextField
                                required
                                fullWidth
                                label="Phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                helperText="10-digit US/Canada phone number, e.g. 1231231234"
                            />
                        </Box>
                        <Box display="flex" gap={2} mb={2}>
                            <TextField
                                required
                                fullWidth
                                label="Password"
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                            />
                            <TextField
                                required
                                fullWidth
                                label="Confirm Password"
                                name="confirm_password"
                                type="password"
                                value={formData.confirm_password}
                                onChange={handleChange}
                            />
                        </Box>
                    </CardBox>

                    {/* Card 2: First, Middle, Last Name | Work Email, Preferred Career Types */}
                    <CardBox>
                        <Box display="flex" gap={2} mb={2}>
                            <TextField
                                required
                                fullWidth
                                label="First Name"
                                name="first_name"
                                value={formData.first_name}
                                onChange={handleChange}
                            />
                            <TextField
                                fullWidth
                                label="Middle Name (Optional)"
                                name="middle_name"
                                value={formData.middle_name}
                                onChange={handleChange}
                            />
                            <TextField
                                required
                                fullWidth
                                label="Last Name"
                                name="last_name"
                                value={formData.last_name}
                                onChange={handleChange}
                            />
                        </Box>
                        <Box display="flex" gap={2} mb={2}>
                            <TextField
                                fullWidth
                                label="Work Email (Optional)"
                                name="work_email"
                                type="email"
                                value={formData.work_email}
                                onChange={handleChange}
                                helperText={
                                    <>
                                        Your working email shown to employers;
                                        <br />
                                        defaults to your primary email
                                    </>
                                }
                            />
                            <TextField
                                required
                                fullWidth
                                label="Title"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                helperText="e.g. Software Engineer, Marketing Manager"
                            />
                        </Box>
                    </CardBox>

                    {/* Card 3: Location, Country | Title */}
                    <CardBox>
                        <Box display="flex" gap={2} mb={2}>
                            <TextField
                                required
                                fullWidth
                                label="Location"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                helperText="e.g. San Francisco, CA"
                            />
                            <FormControl fullWidth required>
                                <InputLabel>Country</InputLabel>
                                <Select
                                    name="country"
                                    value={formData.country}
                                    label="Country"
                                    onChange={handleChange}
                                >
                                    <MenuItem value="United States">United States</MenuItem>
                                    <MenuItem value="Canada">Canada</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                        <Box display="flex" gap={2} mb={2}>
                            <Autocomplete
                                fullWidth
                                multiple
                                options={careerTypes}
                                getOptionLabel={(option) => option.name}
                                isOptionEqualToValue={(option, value) => option.id === value.id}
                                value={careerTypes.filter(career => formData.preferred_career_types.includes(career.id))}
                                onChange={(_, newValue) => {
                                    setFormData(prev => ({
                                        ...prev,
                                        preferred_career_types: newValue.map(career => career.id)
                                    }));
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Preferred Careers (Multiple Choice)"
                                        placeholder="Select careers"
                                        error={formData.preferred_career_types.length === 0}
                                        helperText={
                                            formData.preferred_career_types.length === 0
                                                ? "Please select at least one career"
                                                : ""
                                        }
                                    />
                                )}
                            />
                        </Box>
                    </CardBox>

                    {/* Centered Create Account Button */}
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
                            Create Account
                        </Button>
                    </Box>
                </form>
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

