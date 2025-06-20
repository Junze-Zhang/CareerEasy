// Common API response types
export interface ApiResponse<T = unknown> {
  data: T;
  status: number;
}

// Auth response types
export interface AuthResponse {
  Success: string;
}

export interface ErrorResponse {
  Error: string;
}

// Candidate types
export interface Candidate {
  id: string;
  email: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  phone?: string;
  location?: string;
  country?: string;
  title?: string;
  profile_pic?: string;
  resume?: string;
  has_original_resume?: boolean;
  anonymous_resume?: string;
  standardized_resume?: string;
  standardized_anonymous_resume?: string;
  highlights?: string[];
  standardized_ai_highlights?: string[];
  ai_highlights?: string[];
  skills?: string[];
  standardized_skills?: string[];
  experience_months?: number;
  highest_education?: string;
  standardized_highest_education?: string;
  standardized_title?: string;
  preferred_career_types?: Career[];
  created_at?: string;
  updated_at?: string;
  name?: string;
}

export interface CandidateLoginData {
  username: string;
  password: string;
}

export interface CandidateSignupData {
  username: string;
  email: string;
  work_email?: string;
  password: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  phone: string;
  preferred_career_types: number[];
  location: string;
  country: string;
  title: string;
}

export interface CandidateUpdateData {
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  location?: string;
  country?: string;
  experience_months?: number;
  skills?: string[];
  highest_education?: string;
  preferred_career_types?: number[];
}

export interface PasswordUpdateData {
  old_password: string;
  new_password: string;
}

// Job types
export interface Job {
  id: string;
  title: string;
  company?: string;
  level?: string;
  career__name?: string;
  yoe?: number;
  company__name?: string;
  company__logo?: string;
  company__location?: string;
  company__country?: string;
  description?: string;
  url?: string;
  posted_at?: string;
  updated_at?: string;
  is_match?: boolean;
  deleted?: boolean;
}

export interface JobsResponse {
  items: Job[];
  has_next: boolean;
  has_previous: boolean;
  total_pages: number;
  current_page: number;
  total_count: number;
}

// Company types
export interface Company {
  id: string;
  name: string;
  description?: string;
  location: string;
  country: string;
  logo?: string;
  category?: CompanyCategory;
  website?: string;
  industry?: string;
}

export interface CompanyCategory {
  id: number;
  name: string;
  description?: string;
}

export interface CompanyCreateData {
  name: string;
  description?: string;
  location: string;
  country: string;
  category: string;
  website?: string;
  industry?: string;
}

// Employer types
export interface Employer {
  id: string;
  username: string;
  email: string;
  company?: Company;
  company__name?: string;
}

export interface EmployerLoginData {
  username: string;
  password: string;
}

export interface EmployerSignupData {
  name: string;
  email: string;
  password: string;
  company_id?: string;
}

export interface JobPostData {
  title: string;
  description: string;
  requirements?: string;
  location: string;
  level?: string;
  career?: string;
  yoe?: number;
  salary_min?: number;
  salary_max?: number;
}

// Query types
export interface QueryData {
  query: string;
}

export interface QueryResponse {
  query_id: string;
  minimal_years_of_experience?: number;
  maximal_years_of_experience?: number;
  preferred_title_keywords?: string[];
  high_priority_keywords?: string[];
  low_priority_keywords?: string[];
}

export interface RankQuery {
  minimal_years_of_experience?: number;
  maximal_years_of_experience?: number;
  preferred_title_keywords?: string[];
  high_priority_keywords?: string[];
  low_priority_keywords?: string[];
  query_id?: string;
}

export interface CandidatesResponse {
  items: Candidate[];
  has_next: boolean;
  has_previous: boolean;
  total_pages: number;
  current_page: number;
  total_count: number;
}

// Career types
export interface Career {
  id: number;
  name: string;
  description?: string;
  category?: string;
}

// Check fit types
export interface CheckFitData {
  job_id: string;
}

export interface CheckFitResponse {
  Success: string;
}

// Resume upload types
export interface ResumeUploadResponse {
  Success: string;
}

export interface ExtractCandidateInfoResponse {
  experience: string;
  skills: string[];
  highest_education: string;
  ai_highlights: string[];
}

export interface UpdateHighlightsData {
  custom_prompt?: string;
}

export interface UpdateHighlightsResponse {
  highlights: string[];
}

// Account types
export interface CandidateAccount {
  id: string;
  username: string;
  email: string;
  candidate: Candidate;
}

export interface EmployerAccount {
  id: string;
  username: string;
  email: string;
  company?: Company;
}

export interface ProfileUpdateData {
  name?: string;
  email?: string;
  company_id?: string;
}