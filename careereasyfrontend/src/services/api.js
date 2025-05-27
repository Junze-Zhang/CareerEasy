import axios from 'axios';
import config from '../config';

const api = axios.create({
    baseURL: config.API_BASE_URL,
    withCredentials: true,  // Important for cookies
        headers: {
            'Content-Type': 'application/json',
        }
});

export const candidateAPI = {
    login: (data) => api.post('/candidate/login', data),
    signup: (data) => api.post('/candidate/signup', data),
    logout: () => api.post('/candidate/logout'),
    updatePassword: (data) => api.post('/candidate/updatepassword', data),
    updateProfile: (data) => api.post('/candidate/updateprofile', data),
    candidateInfo: (candidateId) => api.get(`/candidate/${candidateId}`),
    uploadResume: (formData) => api.post('/candidate/upload_resume', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    }),
    extractCandidateInfo: () => api.get('/candidate/ai_extract'),
    updateCandidateInfo: (data) => api.post('/candidate/update_info', data),
    updateHighlights: (data) => api.post('/candidate/update_highlights', data),
    getPostedJobs: (page = 1, pageSize = 20) => 
        api.get(`/candidate/jobs?page=${page}&page_size=${pageSize}`),
    getJobDetails: (jobId) => api.get(`/candidate/job_detail/${jobId}`),
    getCompanyDetails: (companyId) => api.get(`/candidate/company_detail/${companyId}`),
    checkFit: (data) => api.post('/candidate/check_fit', data),
};

// Employer endpoints
export const employerAPI = {
    login: (data) => api.post('/employer/login', data),
    logout: () => api.post('/employer/logout'),
    signup: (data) => api.post('/employer/signup', data),
    updateProfile: (data) => api.post('/employer/updateprofile', data),
    updatePassword: (data) => api.post('/employer/updatepassword', data),
    getCandidates: (page = 1, pageSize = 20) => 
        api.get(`/employer/candidates?page=${page}&page_size=${pageSize}`),
    naturalLanguageQuery: (query) => api.post('/employer/query', { query }),
    getRankedCandidates: (query, page = 1, pageSize = 20) => 
        api.post(`/employer/rank?page=${page}&page_size=${pageSize}`, query),
    getCandidateDetails: (candidateId) => api.get(`/employer/candidate/${candidateId}`),
    getPostedJobs: () => api.get('/employer/jobs'),
    getCompany: (companyId) => api.get(`/employer/company/${companyId}`),
    createCompany: (data) => api.post('/employer/company/create', data),
    postJob: (data) => api.post('/employer/postjob', data),
    getEmployerInfo: () => api.get('/employer/me'),
};

export const generalAPI = {
    getCareers: () => api.get('/careers'),
};