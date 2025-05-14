const API_BASE_URL = 'http://15.223.47.120:8000/api';

export const candidateAPI = {
    login: (credentials) => fetch(`${API_BASE_URL}/candidate/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
        credentials: 'include',
        mode: 'cors',
    }),

    logout: () => fetch(`${API_BASE_URL}/candidate/logout`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        mode: 'cors',
    }),
    
    signup: (userData) => fetch(`${API_BASE_URL}/candidate/signup`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
        mode: 'cors',
    }),
    
    uploadResume: (formData) => fetch(`${API_BASE_URL}/candidate/upload_resume`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
        mode: 'cors',
    }),

    aiExtract: () => fetch(`${API_BASE_URL}/candidate/ai_extract`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        mode: 'cors',
    }),

    updateInfo: (infoData) => fetch(`${API_BASE_URL}/candidate/update_info`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(infoData),
        credentials: 'include',
        mode: 'cors',
    }),

    updateHighlights: (highlightsData) => fetch(`${API_BASE_URL}/candidate/update_highlights`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(highlightsData),
        credentials: 'include',
        mode: 'cors',
    }),

    getJobs: (page=1, page_size=20) => fetch(`${API_BASE_URL}/candidate/jobs?page=${page}&page_size=${page_size}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        mode: 'cors',
    }),
    
    getJobDetails: (jobId) => fetch(`${API_BASE_URL}/candidate/job_detail/${jobId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        mode: 'cors',
    }),

    getCompanyDetails: (companyId) => fetch(`${API_BASE_URL}/candidate/company_detail/${companyId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        mode: 'cors',
    }),

    amIAGoodFit: (jobId) => fetch(`${API_BASE_URL}/candidate/check_fit`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ job_id: jobId }),
        credentials: 'include',
        mode: 'cors',
    }),
    
    updateProfile: (profileData) => fetch(`${API_BASE_URL}/candidate/updateprofile`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
        credentials: 'include',
        mode: 'cors',
    }),
    
    updatePassword: (oldPassword, newPassword) => fetch(`${API_BASE_URL}/candidate/updatepassword`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }),
        credentials: 'include',
        mode: 'cors',
    }),

    candidateInfo: (candidateId) => fetch(`${API_BASE_URL}/candidate/${candidateId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        mode: 'cors',
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
        mode: 'cors',
    }),

    logout: () => fetch(`${API_BASE_URL}/employer/logout`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        mode: 'cors',
    }),
    
    signup: (userData) => fetch(`${API_BASE_URL}/employer/signup`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
        mode: 'cors',
    }),

    updateProfile: (profileData) => fetch(`${API_BASE_URL}/employer/updateprofile`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
        credentials: 'include',
        mode: 'cors',
    }),

    updatePassword: (oldPassword, newPassword) => fetch(`${API_BASE_URL}/employer/updatepassword`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }),
        credentials: 'include',
        mode: 'cors',
    }),
    
    getCandidates: (page=1, page_size=10) => fetch(`${API_BASE_URL}/employer/candidates?page=${page}&page_size=${page_size}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        mode: 'cors',
    }),

    naturalLanguageQuery: (naturalLanguageQuery) => fetch(`${API_BASE_URL}/employer/query`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: naturalLanguageQuery }),
        credentials: 'include',
        mode: 'cors',
    }),

    getRankedCandidates: (query, page=1, page_size=10) => fetch(`${API_BASE_URL}/employer/rank?page=${page}&page_size=${page_size}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(query),
        credentials: 'include',
        mode: 'cors',
    }),

    getCandidateDetails: (candidateId) => fetch(`${API_BASE_URL}/employer/candidate/${candidateId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        mode: 'cors',
    }),

    getPostedJobs: () => fetch(`${API_BASE_URL}/employer/jobs`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        mode: 'cors',
    }),

    getCompany: (companyId) => fetch(`${API_BASE_URL}/employer/company/${companyId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        mode: 'cors',
    }),
    
    createCompany: (companyData) => fetch(`${API_BASE_URL}/employer/company/create`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(companyData),
        credentials: 'include',
        mode: 'cors',
    }),

    postJob: (jobData) => fetch(`${API_BASE_URL}/employer/postjob`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(jobData),
        credentials: 'include',
        mode: 'cors',
    }),

    getEmployerInfo: () => fetch(`${API_BASE_URL}/employer/me`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        mode: 'cors',
    }),
};

export const generalAPI = {
    getCareers: () => fetch(`${API_BASE_URL}/careers`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        mode: 'cors',
    }),
};