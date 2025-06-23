import axios, { AxiosResponse } from 'axios';
import config from '../config';
import {
  AuthResponse,
  Candidate,
  CandidateLoginData,
  CandidateSignupData,
  CandidateUpdateData,
  PasswordUpdateData,
  Job,
  JobsResponse,
  Company,
  CompanyCreateData,
  Employer,
  EmployerLoginData,
  EmployerSignupData,
  JobPostData,
  RankQuery,
  CandidatesResponse,
  Career,
  CheckFitData,
  CheckFitResponse,
  ResumeUploadResponse,
  ExtractCandidateInfoResponse,
  UpdateHighlightsData,
  UpdateHighlightsResponse, QueryResponse,
} from '@/types/api';

const api = axios.create({
  baseURL: config.API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const candidateAPI = {
  login: (data: CandidateLoginData): Promise<AxiosResponse<AuthResponse>> =>
    api.post('/candidate/login', data),
  
  signup: (data: CandidateSignupData): Promise<AxiosResponse<AuthResponse>> =>
    api.post('/candidate/signup', data),
  
  logout: (): Promise<AxiosResponse<AuthResponse>> =>
    api.post('/candidate/logout'),
  
  updatePassword: (data: PasswordUpdateData): Promise<AxiosResponse<AuthResponse>> =>
    api.post('/candidate/updatepassword', data),
  
  updateProfile: (data: CandidateUpdateData): Promise<AxiosResponse<AuthResponse>> =>
    api.post('/candidate/updateprofile', data),
  
  candidateInfo: (candidateId: string): Promise<AxiosResponse<Candidate>> =>
    api.get(`/candidate/${candidateId}`),
  
  uploadResume: (formData: FormData): Promise<AxiosResponse<ResumeUploadResponse>> =>
    api.post('/candidate/upload_resume', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  
  extractCandidateInfo: (): Promise<AxiosResponse<ExtractCandidateInfoResponse>> =>
    api.get('/candidate/ai_extract'),
  
  updateCandidateInfo: (data: CandidateUpdateData): Promise<AxiosResponse<AuthResponse>> =>
    api.post('/candidate/update_info', data),
  
  updateHighlights: (data: UpdateHighlightsData): Promise<AxiosResponse<UpdateHighlightsResponse>> =>
    api.post('/candidate/update_highlights', data),

  updateProfilePicture: (formData: FormData): Promise<AxiosResponse<{Success: string, profile_pic_url: string}>> =>
    api.post('/candidate/update_profile_picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),

  getAccountInfo: (): Promise<AxiosResponse<{username: string, email: string}>> =>
    api.get('/candidate/account_info'),

  updateAccountInfo: (data: {username?: string, email?: string}): Promise<AxiosResponse<{Success: string}>> =>
    api.post('/candidate/update_account', data),
  
  getPostedJobs: (page: number = 1, pageSize: number = 20): Promise<AxiosResponse<JobsResponse>> =>
    api.get(`/candidate/jobs?page=${page}&page_size=${pageSize}`),
  
  getJobDetails: (jobId: string): Promise<AxiosResponse<Job>> =>
    api.get(`/candidate/job_detail/${jobId}`),
  
  getCompanyDetails: (companyId: string): Promise<AxiosResponse<Company>> =>
    api.get(`/candidate/company_detail/${companyId}`),
  
  checkFit: (data: CheckFitData): Promise<AxiosResponse<CheckFitResponse>> =>
    api.post('/candidate/check_fit', data),
  
  downloadResume: (): Promise<AxiosResponse<Blob>> =>
    api.get('/candidate/download_resume', {
      responseType: 'blob',
    }),
};

export const employerAPI = {
  login: (data: EmployerLoginData): Promise<AxiosResponse<AuthResponse>> =>
    api.post('/employer/login', data),
  
  logout: (): Promise<AxiosResponse<AuthResponse>> =>
    api.post('/employer/logout'),
  
  signup: (data: EmployerSignupData): Promise<AxiosResponse<AuthResponse>> =>
    api.post('/employer/signup', data),
  
  updateProfile: (data: Partial<Employer>): Promise<AxiosResponse<AuthResponse>> =>
    api.post('/employer/updateprofile', data),
  
  updatePassword: (data: PasswordUpdateData): Promise<AxiosResponse<AuthResponse>> =>
    api.post('/employer/updatepassword', data),
  
  getCandidates: (page: number = 1, pageSize: number = 20): Promise<AxiosResponse<CandidatesResponse>> =>
    api.get(`/employer/candidates?page=${page}&page_size=${pageSize}`),
  
  naturalLanguageQuery: (query: string): Promise<AxiosResponse<QueryResponse>> =>
    api.post('/employer/query', { query }),
  
  getRankedCandidates: (
    query: RankQuery,
    page: number = 1,
    pageSize: number = 20
  ): Promise<AxiosResponse<CandidatesResponse>> =>
    api.post(`/employer/rank?page=${page}&page_size=${pageSize}`, query),
  
  getCandidateDetails: (candidateId: string): Promise<AxiosResponse<Candidate>> =>
    api.get(`/employer/candidate/${candidateId}`),
  
  getPostedJobs: (): Promise<AxiosResponse<Job[]>> =>
    api.get('/employer/jobs'),
  
  getCompany: (companyId: string): Promise<AxiosResponse<Company>> =>
    api.get(`/employer/company/${companyId}`),
  
  createCompany: (data: CompanyCreateData): Promise<AxiosResponse<Company>> =>
    api.post('/employer/company/create', data),
  
  postJob: (data: JobPostData): Promise<AxiosResponse<Job>> =>
    api.post('/employer/postjob', data),
  
  getEmployerInfo: (): Promise<AxiosResponse<Employer>> =>
    api.get('/employer/me'),

  getCandidateInfo: (candidateId: string): Promise<AxiosResponse<Candidate>> =>
    api.get(`/employer/candidate/${candidateId}`),

  downloadCandidateResume: (candidateId: string): Promise<AxiosResponse<Blob>> =>
    api.get(`/employer/download_resume/${candidateId}`, {
      responseType: 'blob',
    }),
};

export const generalAPI = {
  getCareers: (): Promise<AxiosResponse<Career[]>> =>
    api.get('/careers'),
};