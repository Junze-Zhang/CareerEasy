import React, { useEffect, useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Paper,
  Pagination,
  CircularProgress,
  Avatar,
  Divider,
  TextField,
  InputAdornment,
  Button
} from '@mui/material';
import { employerAPI } from '../../services/api';
import SearchIcon from '@mui/icons-material/Search';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import { useNavigate } from 'react-router-dom';

export default function EmployerHome() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchText, setSearchText] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [latestQuery, setLatestQuery] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'error' });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCandidates = async () => {
      setLoading(true);
      try {
        let response;
        if (latestQuery) {
          response = await employerAPI.getRankedCandidates(latestQuery, page);
        } else {
          response = await employerAPI.getCandidates(page);
        }
        setCandidates(response.data.items || []);
        setTotalPages(response.data.total_pages || 1);
      } catch (error) {
        console.error('Error fetching candidates:', error);
        setCandidates([]);
        setSnackbar({
          open: true,
          message: error.response?.data?.Error || "Failed to fetch candidates. Please try again later.",
          severity: "error"
        });
      } finally {
      setLoading(false);
      }
    };
    fetchCandidates();
  }, [page, latestQuery]);

  // Helper to round experience to nearest year
  const getYears = (months) => Math.round((months || 0) / 12);

  const handleSearch = async () => {
    if (!searchText.trim()) return;
    setSearchLoading(true);
    const minLoadingPromise = new Promise(res => setTimeout(res, 3000));
    try {
      const response = await employerAPI.naturalLanguageQuery(searchText);
      setLatestQuery(response.data);
      setPage(1);
      await minLoadingPromise;
    } catch (error) {
      console.error('Error processing search query:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.Error || "Failed to process search query. Please try again later.",
        severity: "error"
      });
    } finally {
    setSearchLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
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
                ⚠️ Disclaimer: Contains AI generated data for demonstration and testing purposes only.
            </Typography>
        </Box>
      {/* Logo at the top */}
      <Box display="flex" justifyContent="center" mb={3}>
        <img
          src="/ce-logo.png"
          alt="CareerEasy Logo"
          style={{ height: 64 }}
        />
      </Box>

      {/* Search bar below the logo */}
      <Box display="flex" justifyContent="center" alignItems="center" mb={4} gap={2}>
        <TextField
          variant="outlined"
          placeholder="✨ Try searching: Python developer with experience in machine learning"
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          sx={{ width: 1020, background: 'white' }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          onKeyDown={e => {
            if (e.key === 'Enter') handleSearch();
          }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSearch}
          disabled={searchLoading}
          sx={{ height: 56 }}
        >
          Search
        </Button>
      </Box>

      {/* Candidate cards below the search bar */}
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Grid container spacing={3} justifyContent="center" wrap="wrap">
            {candidates.map((candidate) => (
              <Grid
                item
                key={candidate.id}
                xs={12}
                md={6}
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                <Card 
                  sx={{ 
                    width: 560, 
                    p: 2, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    boxSizing: 'border-box',
                    cursor: 'pointer',
                    '&:hover': {
                      boxShadow: 6,
                      transform: 'translateY(-2px)',
                      transition: 'all 0.2s ease-in-out'
                    }
                  }}
                  onClick={() => navigate(`/${candidate.id}`)}
                >
                  {/* Upper Box */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                      src={candidate.profile_pic}
                      alt={candidate.name}
                      sx={{ width: 64, height: 64, mr: 2 }}
                    />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6" fontWeight={600} noWrap>
                          {candidate.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" fontWeight={500}>
                          {getYears(candidate.experience_months)} years experience
                        </Typography>
                      </Box>
                      <Typography variant="body1" noWrap>
                        {candidate.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {candidate.location}, {candidate.country}
                      </Typography>
                    </Box>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  {/* Lower Box */}
                  <Paper elevation={0} sx={{ background: 'none', p: 0 }}>
                    <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                      ✨ Candidate Highlights
                    </Typography>
                    <Box component="ul" sx={{ pl: 3, mb: 0 }}>
                      {(candidate.ai_highlights || []).map((line, idx) => (
                        <li key={idx}>
                          <Typography variant="body2" component="span">
                            {line}
                          </Typography>
                        </li>
                      ))}
                    </Box>
                  </Paper>
                </Card>
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

      {/* Loading dialog for search */}
      <Dialog open={searchLoading} maxWidth="xs" fullWidth>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
          <CircularProgress sx={{ mb: 3 }} />
          <Typography variant="h6" align="center" sx={{ mb: 1 }}>
            ✨ Searching with Generative AI...
          </Typography>
          <Typography variant="body2" align="center" color="text.secondary">
            This may take up to several minutes.
          </Typography>
        </DialogContent>
      </Dialog>
    </Container>
  );
}
