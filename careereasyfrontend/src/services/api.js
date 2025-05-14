const API_BASE_URL = 'http://localhost:8000';

export const candidateAPI = {
    login: (credentials) => fetch(`${API_BASE_URL}/candidate/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
        credentials: 'include',
    }),

    logout: () => fetch(`${API_BASE_URL}/candidate/logout`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
    }),
    
    signup: (userData) => fetch(`${API_BASE_URL}/candidate/signup`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
    }),
    
    uploadResume: (formData) => fetch(`${API_BASE_URL}/candidate/upload_resume`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
    }),

    aiExtract: () => fetch(`${API_BASE_URL}/candidate/ai_extract`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
    }),

    updateInfo: (infoData) => fetch(`${API_BASE_URL}/candidate/update_info`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(infoData),
        credentials: 'include',
    }),

    updateHighlights: (highlightsData) => fetch(`${API_BASE_URL}/candidate/update_highlights`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(highlightsData),
        credentials: 'include',
    }),

    getJobs: (page=1, page_size=20) => fetch(`${API_BASE_URL}/candidate/jobs?page=${page}&page_size=${page_size}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
    }),
    
    getJobDetails: (jobId) => fetch(`${API_BASE_URL}/candidate/job_detail/${jobId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    }),

    getCompanyDetails: (companyId) => fetch(`${API_BASE_URL}/candidate/company_detail/${companyId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
    }),

    amIAGoodFit: (jobId) => fetch(`${API_BASE_URL}/candidate/check_fit`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ job_id: jobId }),
        credentials: 'include',
    }),
    
    updateProfile: (profileData) => fetch(`${API_BASE_URL}/candidate/updateprofile`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
        credentials: 'include',
    }),
    
    updatePassword: (oldPassword, newPassword) => fetch(`${API_BASE_URL}/candidate/updatepassword`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }),
        credentials: 'include',
    }),

    candidateInfo: (candidateId) => fetch(`${API_BASE_URL}/candidate/${candidateId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
    }),
};

// Employer endpoints
export const employerAPI = {
    login: (credentials) => fetch(`${API_BASE_URL}/employer/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
        credentials: 'include',
    }),

    logout: () => fetch(`${API_BASE_URL}/employer/logout`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
    }),
    
    signup: (userData) => fetch(`${API_BASE_URL}/employer/signup`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
    }),

    updateProfile: (profileData) => fetch(`${API_BASE_URL}/employer/updateprofile`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
        credentials: 'include',
    }),

    updatePassword: (oldPassword, newPassword) => fetch(`${API_BASE_URL}/employer/updatepassword`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }),
        credentials: 'include',
    }),
    
    getCandidates: (page=1, page_size=10) => fetch(`${API_BASE_URL}/employer/candidates?page=${page}&page_size=${page_size}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
    }),

    naturalLanguageQuery: (naturalLanguageQuery) => fetch(`${API_BASE_URL}/employer/query`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: naturalLanguageQuery }),
        credentials: 'include',
    }),

    getRankedCandidates: (query, page=1, page_size=10) => fetch(`${API_BASE_URL}/employer/rank?page=${page}&page_size=${page_size}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(query),
        credentials: 'include',
    }),

    getCandidateDetails: (candidateId) => fetch(`${API_BASE_URL}/employer/candidate/${candidateId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
    }),

    getPostedJobs: () => fetch(`${API_BASE_URL}/employer/jobs`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    }),

    getCompany: (companyId) => fetch(`${API_BASE_URL}/employer/company/${companyId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
    }),
    
    createCompany: (companyData) => fetch(`${API_BASE_URL}/employer/company/create`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(companyData),
        credentials: 'include',
    }),

    postJob: (jobData) => fetch(`${API_BASE_URL}/employer/postjob`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(jobData),
        credentials: 'include',
    }),

    getEmployerInfo: () => fetch(`${API_BASE_URL}/employer/me`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
    }),
};

export const generalAPI = {
    getCareers: () => fetch(`${API_BASE_URL}/careers`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    }),
};