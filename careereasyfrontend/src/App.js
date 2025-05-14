// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CareerEasy from './pages/CareerEasy';
import CandidateSignUp from './pages/CandidateSignUp';
import CandidateLogin from './pages/CandidateLogin.js';
import CandidateHome from './pages/CandidateHome';
import CandidateAISummary from './pages/CandidateAISummary';
import Background from './components/Background';
import JobDetail from './pages/JobDetail';
import UploadResume from './pages/UploadResume.js';
import CandidateProfile from './pages/CandidateProfile.js';

import EmployerHome from './pages/CareerEasyEmployer/EmployerHome';

function App() {
    return (
        <Router>
            <Background />
            <Routes>
                <Route path="/" element={<CareerEasy />} />
                <Route path="/signup" element={<CandidateSignUp />} />
                <Route path="/login" element={<CandidateLogin />} />
                <Route path="/home" element={<CandidateHome />} />
                <Route path="/upload" element={<UploadResume />} />
                <Route path="/ai-summary" element={<CandidateAISummary />} />
                <Route path="/:candidateId" element={<CandidateProfile />} />
                <Route path="/job_detail/:jobId" element={<JobDetail />} />

                <Route path="/employer/home" element={<EmployerHome />} />
            </Routes>
        </Router>
    );
}

export default App;