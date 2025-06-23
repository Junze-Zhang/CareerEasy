'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navbar, Footer, AbstractLines } from '@/components';
import { candidateAPI, generalAPI } from '@/services/api';
import { Career } from '@/types/api';
import {
  ProfileHeaderCard,
  HighlightsCard,
  AccountManagementCard,
  ExperienceEducationCard,
  ResumeCard,
  SkillsCard,
  CareerInterestsCard
} from '@/components/profile';
import AccountManagementModal from '@/components/profile/AccountManagementModal';
import RegenerateHighlightsModal from '@/components/profile/RegenerateHighlightsModal';
import ResumeTextModal from '@/components/profile/ResumeTextModal';

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';

interface CandidateProfile {
  name: string;
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  email: string;
  phone: string;
  location: string;
  country: string;
  title: string;
  profile_pic: string;
  highlights: string[];
  preferred_career_types?: Career[];
  experience_months?: number;
  has_original_resume?: boolean;
  resume?: string;
  highest_education?: string;
  skills?: string[];
}

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const candidateId = params.candidateId as string;

  // Core state
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);

  // Form and editing state
  const [editForm, setEditForm] = useState<Partial<CandidateProfile>>({});
  const [editingSections, setEditingSections] = useState<{[key: string]: boolean}>({});
  const [hasChanges, setHasChanges] = useState<{[key: string]: boolean}>({});

  // Profile header specific state
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [editCountry, setEditCountry] = useState('Select country');
  const [editState, setEditState] = useState('');
  const [editCity, setEditCity] = useState('');
  const [personalErrors, setPersonalErrors] = useState<{[key: string]: string}>({});
  const [isUploadingProfilePic, setIsUploadingProfilePic] = useState(false);

  // Experience & Education state
  const [experienceYears, setExperienceYears] = useState(0);
  const [experienceMonths, setExperienceMonths] = useState(0);
  const [customEducation, setCustomEducation] = useState('');

  // Skills state
  const [newSkillInput, setNewSkillInput] = useState('');
  const [showSkillInput, setShowSkillInput] = useState(false);

  // Career interests state
  const [allCareers, setAllCareers] = useState<Career[]>([]);
  const [careerSearchTerm, setCareerSearchTerm] = useState('');
  const [showCareerSearch, setShowCareerSearch] = useState(false);
  const [selectedCareersForAdd, setSelectedCareersForAdd] = useState<Career[]>([]);

  // Other state
  const [isUpdatingHighlights, setIsUpdatingHighlights] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showResumeTextModal, setShowResumeTextModal] = useState(false);
  const [showHighlightsModal, setShowHighlightsModal] = useState(false);
  const [currentAccountInfo, setCurrentAccountInfo] = useState({ username: '', email: '' });

  // Load profile data
  useEffect(() => {
    const loadData = async () => {
      await fetchProfile();
      checkIsOwnProfile();
      await fetchCareers();
    };
    loadData();
  }, [candidateId]);

  const fetchProfile = async () => {
    try {
      const response = await candidateAPI.candidateInfo(candidateId);
      const candidateData = response.data;
      
      const profileData: CandidateProfile = {
        name: candidateData.name || `${candidateData.first_name || ''} ${candidateData.last_name || ''}`.trim(),
        first_name: candidateData.first_name,
        middle_name: candidateData.middle_name,
        last_name: candidateData.last_name,
        email: candidateData.email,
        phone: candidateData.phone || '',
        location: candidateData.location || '',
        country: candidateData.country || '',
        title: candidateData.title || '',
        profile_pic: candidateData.profile_pic || '',
        highlights: candidateData.highlights || [],
        preferred_career_types: candidateData.preferred_career_types,
        experience_months: candidateData.experience_months,
        has_original_resume: candidateData.has_original_resume || false,
        resume: candidateData.resume,
        highest_education: candidateData.highest_education,
        skills: candidateData.skills
      };
      
      setProfile(profileData);
      setEditForm(candidateData);
      
      // Fetch account info from getAccountInfo API
      try {
        const accountResponse = await candidateAPI.getAccountInfo();
        setCurrentAccountInfo({
          username: accountResponse.data.username || '',
          email: accountResponse.data.email || ''
        });
      } catch (error) {
        console.error('Failed to fetch account info:', error);
        // Fallback to candidate data
        setCurrentAccountInfo({
          username: candidateData.name || '',
          email: candidateData.email || ''
        });
      }
      
      // Initialize name fields
      if (candidateData.first_name || candidateData.last_name) {
        setFirstName(candidateData.first_name || '');
        setMiddleName(candidateData.middle_name || '');
        setLastName(candidateData.last_name || '');
      } else if (candidateData.name) {
        const nameParts = candidateData.name.trim().split(' ');
        setFirstName(nameParts[0] || '');
        setLastName(nameParts[nameParts.length - 1] || '');
        setMiddleName(nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : '');
      }
      
      // Initialize experience and education to current values
      if (candidateData.experience_months !== undefined && candidateData.experience_months !== null) {
        const totalMonths = candidateData.experience_months;
        setExperienceYears(Math.floor(totalMonths / 12));
        setExperienceMonths(totalMonths % 12);
      }
      
      // Initialize custom education if it's "Other"
      if (candidateData.highest_education && candidateData.highest_education !== 'High School' && 
          candidateData.highest_education !== "Bachelor's" && candidateData.highest_education !== "Master's" && 
          candidateData.highest_education !== 'Doctorate') {
        setCustomEducation(candidateData.highest_education);
      }
      
      // Initialize location fields with current data
      if (candidateData.country) {
        setEditCountry(candidateData.country);
      } else {
        setEditCountry('Select country');
      }
      
      // Parse location to get state and city
      if (candidateData.location) {
        const locationParts = candidateData.location.split(', ');
        if (locationParts.length >= 2) {
          setEditCity(locationParts[0].trim());
          setEditState(locationParts[1].trim());
        }
      }
    } catch {
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchCareers = async () => {
    try {
      const response = await generalAPI.getCareers();
      setAllCareers(response.data);
    } catch {
      console.error('Failed to fetch careers');
    }
  };

  const checkIsOwnProfile = () => {
    if (typeof document !== 'undefined') {
      const candidateIdCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('candidate_id='))
        ?.split('=')[1];
      
      setIsOwnProfile(candidateIdCookie === candidateId);
    }
  };

  const formatExperience = (months: number) => {
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    
    if (years === 0) {
      return `${months} month${months !== 1 ? 's' : ''} of experience`;
    } else if (remainingMonths === 0) {
      return `${years} year${years !== 1 ? 's' : ''} of experience`;
    } else {
      return `${years} year${years !== 1 ? 's' : ''} and ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''} of experience`;
    }
  };

  // Filtered careers for search
  const filteredCareers = useMemo(() => {
    let careers = allCareers.filter(career =>
      !profile?.preferred_career_types?.find(pc => pc.id === career.id)
    );
    
    if (careerSearchTerm.trim()) {
      careers = careers.filter(career =>
        career.name.toLowerCase().includes(careerSearchTerm.toLowerCase())
      );
    }
    
    return careers.slice(0, 10);
  }, [careerSearchTerm, allCareers, profile?.preferred_career_types]);

  // Phone formatting function (from SignUpStep3)
  const formatPhoneNumber = (value: string): string => {
    const digits = value.replace(/\D/g, '');
    const limitedDigits = digits.slice(0, 10);
    
    if (limitedDigits.length === 10) {
      return `(${limitedDigits.slice(0, 3)}) ${limitedDigits.slice(3, 6)}-${limitedDigits.slice(6)}`;
    }
    
    return limitedDigits;
  };

  // Extract 10 digit phone number for backend
  const extractPhoneDigits = (phone: string): string => {
    return phone.replace(/\D/g, '');
  };

  // Validation functions (copied from SignUp pages)
  const validateName = (name: string): string | undefined => {
    if (!name.trim()) return undefined; // Allow empty names
    if (name.length < 2) return 'Name must be at least 2 characters';
    if (!/^[a-zA-Z\s\-']+$/.test(name)) return 'Name can only contain letters, spaces, hyphens, and apostrophes';
    return undefined;
  };

  const validateMiddleName = (name: string): string | undefined => {
    if (!name) return undefined; // Optional field
    if (name.length < 2) return 'Middle name must be at least 2 characters';
    if (!/^[a-zA-Z\s\-']+$/.test(name)) return 'Name can only contain letters, spaces, hyphens, and apostrophes';
    return undefined;
  };

  const validateEmail = (email: string): string | undefined => {
    if (!email.trim()) return undefined; // Allow empty email, let API handle it
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return undefined;
  };

  const validatePhone = (phone: string): string | undefined => {
    if (!phone) return undefined; // Optional field
    const phoneRegex = /^(\+1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}$/;
    if (!phoneRegex.test(phone)) return 'Please use format: (xxx) xxx-xxxx or xxx-xxx-xxxx';
    return undefined;
  };

  const validateTitle = (title: string): string | undefined => {
    if (!title.trim()) return undefined; // Allow empty title
    if (title.length < 2) return 'Job title must be at least 2 characters';
    return undefined;
  };

  const validateCountry = (country: string): string | undefined => {
    if (!country || country === 'Select country') return undefined; // Allow empty country
    return undefined;
  };

  const validateState = (state: string): string | undefined => {
    if (!state.trim()) return undefined; // Allow empty state
    return undefined;
  };

  const validateCity = (city: string): string | undefined => {
    if (!city.trim()) return undefined; // Allow empty city
    if (city.length < 2) return 'Please enter a valid city';
    return undefined;
  };

  // Update personal form validation
  const updatePersonalFormValidation = () => {
    const newErrors: {[key: string]: string} = {};
    
    const firstNameError = validateName(firstName);
    if (firstNameError) newErrors.firstName = firstNameError;
    
    const lastNameError = validateName(lastName);
    if (lastNameError) newErrors.lastName = lastNameError;
    
    const emailError = validateEmail(editForm.email || '');
    if (emailError) newErrors.email = emailError;
    
    const phoneError = validatePhone(editForm.phone || '');
    if (phoneError) newErrors.phone = phoneError;
    
    const titleError = validateTitle(editForm.title || '');
    if (titleError) newErrors.title = titleError;
    
    const countryError = validateCountry(editCountry);
    if (countryError) newErrors.country = countryError;
    
    const stateError = validateState(editState);
    if (stateError) newErrors.state = stateError;
    
    const cityError = validateCity(editCity);
    if (cityError) newErrors.city = cityError;
    
    setPersonalErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validation - form is valid if there are no validation errors
  const isPersonalFormValid = useMemo(() => {
    return Object.keys(personalErrors).length === 0;
  }, [personalErrors]);

  // Skills handlers
  const handleAddSkill = (skill: string) => {
    if (skill.trim() && profile && (!profile.skills || !profile.skills.includes(skill.trim()))) {
      const updatedSkills = [...(profile.skills || []), skill.trim()];
      setProfile(prev => prev ? { ...prev, skills: updatedSkills } : prev);
      setHasChanges(prev => ({ ...prev, skills: true }));
      setNewSkillInput('');
      setShowSkillInput(false);
    }
  };

  const handleDeleteSkill = (skillToDelete: string) => {
    if (profile) {
      const updatedSkills = profile.skills?.filter(skill => skill !== skillToDelete) || [];
      setProfile(prev => prev ? { ...prev, skills: updatedSkills } : prev);
      setHasChanges(prev => ({ ...prev, skills: true }));
    }
  };

  const handleSkillInputKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleAddSkill(newSkillInput);
    }
  };

  // Career interests handlers
  const handleRemoveCareer = (careerId: string) => {
    if (profile) {
      const updatedCareers = profile.preferred_career_types?.filter(career => career.id !== careerId) || [];
      setProfile(prev => prev ? { ...prev, preferred_career_types: updatedCareers } : prev);
      setHasChanges(prev => ({ ...prev, careers: true }));
    }
  };

  const handleToggleCareerSelection = (career: Career) => {
    const isSelected = selectedCareersForAdd.find(c => c.id === career.id);
    if (isSelected) {
      setSelectedCareersForAdd(prev => prev.filter(c => c.id !== career.id));
    } else {
      setSelectedCareersForAdd(prev => [...prev, career]);
    }
  };

  const handleAddSelectedCareers = () => {
    if (profile && selectedCareersForAdd.length > 0) {
      const currentCareers = profile.preferred_career_types || [];
      const newCareers = selectedCareersForAdd.filter(
        newCareer => !currentCareers.find(existing => existing.id === newCareer.id)
      );
      if (newCareers.length > 0) {
        const updatedCareers = [...currentCareers, ...newCareers];
        setProfile(prev => prev ? { ...prev, preferred_career_types: updatedCareers } : prev);
        setHasChanges(prev => ({ ...prev, careers: true }));
      }
      setSelectedCareersForAdd([]);
      setCareerSearchTerm('');
      setShowCareerSearch(false);
    }
  };

  // Personal info handlers with validation
  const handlePersonalFieldChange = (field: string, value: string) => {
    if (field === 'firstName') {
      setFirstName(value);
      const error = validateName(value);
      if (error) {
        setPersonalErrors(prev => ({ ...prev, firstName: error }));
      } else {
        setPersonalErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.firstName;
          return newErrors;
        });
      }
    } else if (field === 'middleName') {
      setMiddleName(value);
      const error = validateMiddleName(value);
      if (error) {
        setPersonalErrors(prev => ({ ...prev, middleName: error }));
      } else {
        setPersonalErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.middleName;
          return newErrors;
        });
      }
    } else if (field === 'lastName') {
      setLastName(value);
      const error = validateName(value);
      if (error) {
        setPersonalErrors(prev => ({ ...prev, lastName: error }));
      } else {
        setPersonalErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.lastName;
          return newErrors;
        });
      }
    } else {
      let processedValue = value;
      
      // Format phone number like signup
      if (field === 'phone') {
        processedValue = formatPhoneNumber(value);
      }
      
      setEditForm(prev => ({ ...prev, [field]: processedValue }));
      
      // Validate specific fields
      let error: string | undefined;
      if (field === 'email') error = validateEmail(processedValue);
      else if (field === 'phone') error = validatePhone(processedValue);
      else if (field === 'title') error = validateTitle(processedValue);
      
      if (error) {
        setPersonalErrors(prev => ({ ...prev, [field]: error }));
      } else {
        setPersonalErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    }
  };

  const handleCountryChange = (country: string) => {
    setEditCountry(country);
    const error = validateCountry(country);
    if (error) {
      setPersonalErrors(prev => ({ ...prev, country: error }));
    } else {
      setPersonalErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.country;
        return newErrors;
      });
    }
  };

  const handleStateChange = (state: string) => {
    setEditState(state);
    const error = validateState(state);
    if (error) {
      setPersonalErrors(prev => ({ ...prev, state: error }));
    } else {
      setPersonalErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.state;
        return newErrors;
      });
    }
  };

  const handleCityChange = (city: string) => {
    setEditCity(city);
    const error = validateCity(city);
    if (error) {
      setPersonalErrors(prev => ({ ...prev, city: error }));
    } else {
      setPersonalErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.city;
        return newErrors;
      });
    }
  };

  // Highlights handlers
  const handleRegenerateHighlights = () => {
    setShowHighlightsModal(true);
  };

  const handleRegenerateWithPrompt = async (customPrompt: string) => {
    setShowHighlightsModal(false); // Close modal immediately
    setIsUpdatingHighlights(true); // Start background processing
    try {
      const response = await candidateAPI.updateHighlights({
        custom_prompt: customPrompt
      });
      
      if (response.data.highlights) {
        setProfile(prev => prev ? { ...prev, highlights: response.data.highlights } : prev);
      }
    } catch (error) {
      console.error('Failed to regenerate highlights:', error);
    } finally {
      setIsUpdatingHighlights(false);
    }
  };

  // Resume handlers
  const handleDownloadResume = async () => {
    try {
      const response = await candidateAPI.downloadResume();
      
      // Get content type and disposition from response headers
      const contentType = response.headers['content-type'] || response.headers['Content-Type'] || 'application/octet-stream';
      const contentDisposition = response.headers['content-disposition'] || response.headers['Content-Disposition'];
      
      console.log('Download response headers:', {
        contentType,
        contentDisposition,
        allHeaders: response.headers
      });
      
      // Extract filename from content-disposition header or use default
      let filename = `${profile?.name || 'resume'}`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch) {
          filename = filenameMatch[1].replace(/['"]/g, '');
        }
      } else {
        // If no content-disposition, map content-type to proper extension
        // Based on backend content_type_map
        const contentTypeLower = contentType.toLowerCase();
        console.log('Mapping content type:', contentTypeLower);
        
        if (contentTypeLower === 'text/plain') {
          filename += '.txt';
        } else if (contentTypeLower === 'application/pdf') {
          filename += '.pdf';
        } else if (contentTypeLower === 'application/msword') {
          filename += '.doc';
        } else if (contentTypeLower === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
          filename += '.docx';
        } else if (contentTypeLower === 'text/markdown') {
          filename += '.md';
        } else {
          // For unrecognized types, try partial matching as fallback
          if (contentTypeLower.includes('pdf')) {
            filename += '.pdf';
          } else if (contentTypeLower.includes('markdown')) {
            filename += '.md';
          } else if (contentTypeLower.includes('plain')) {
            filename += '.txt';
          } else if (contentTypeLower.includes('msword')) {
            filename += '.doc';
          } else if (contentTypeLower.includes('wordprocessingml')) {
            filename += '.docx';
          } else {
            console.warn('Unrecognized content type:', contentType);
            filename += '.pdf'; // Default to PDF if unknown
          }
        }
      }
      
      console.log('Final filename:', filename);
      
      // Create blob URL and trigger download
      const blob = new Blob([response.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download resume:', error);
    }
  };

  const handleShowResumeText = () => {
    setShowResumeTextModal(true);
  };

  // Profile picture handler
  const handleProfilePicChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }
    
    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      alert('File size must be less than 5MB');
      return;
    }
    
    setIsUploadingProfilePic(true);
    
    try {
      const formData = new FormData();
      formData.append('profile_pic', file);
      
      const response = await candidateAPI.updateProfilePicture(formData);
      
      if (response.data.Success) {
        // Update profile with new picture URL
        await fetchProfile();
        console.log('Profile picture updated successfully');
      }
    } catch (error: unknown) {
      console.error('Failed to update profile picture:', error);
      
      // Extract error message from API response
      let errorMessage = 'Failed to update profile picture. Please try again.';
      if (error && typeof error === 'object' && 'response' in error && 
          error.response && typeof error.response === 'object' && 'data' in error.response &&
          error.response.data && typeof error.response.data === 'object' && 'Error' in error.response.data) {
        errorMessage = (error.response.data as { Error: string }).Error;
      }
      
      alert(errorMessage);
    } finally {
      setIsUploadingProfilePic(false);
      // Clear the input value so the same file can be selected again
      event.target.value = '';
    }
  };

  // Event handlers would go here (simplified for now)
  const handleBack = () => router.back();
  const handleEdit = (section: string) => setEditingSections(prev => ({ ...prev, [section]: true }));
  const handleSave = async (section: string) => {
    try {
      if (section === 'personal') {
        if (!updatePersonalFormValidation()) {
          return; // Don't save if validation fails
        }
        
        const updateData: Partial<{
          first_name: string;
          middle_name: string;
          last_name: string;
          email: string;
          phone: string;
          title: string;
          country: string;
          location: string;
        }> = {};
        
        // Only include non-empty fields
        if (firstName.trim()) updateData.first_name = firstName.trim();
        if (middleName.trim()) updateData.middle_name = middleName.trim();
        if (lastName.trim()) updateData.last_name = lastName.trim();
        if (editForm.email?.trim()) updateData.email = editForm.email.trim();
        if (editForm.phone?.trim()) updateData.phone = extractPhoneDigits(editForm.phone);
        if (editForm.title?.trim()) updateData.title = editForm.title.trim();
        if (editCountry && editCountry !== 'Select country') updateData.country = editCountry;
        if (editState.trim() && editCity.trim()) updateData.location = `${editCity.trim()}, ${editState.trim()}`;
        
        await candidateAPI.updateCandidateInfo(updateData);
        
        // Fetch fresh data from API instead of using local state
        await fetchProfile();
        
        setEditingSections(prev => ({ ...prev, [section]: false }));
      } else if (section === 'skills' && profile?.skills) {
        await candidateAPI.updateCandidateInfo({ skills: profile.skills });
        await fetchProfile();
        setHasChanges(prev => ({ ...prev, skills: false }));
      } else if (section === 'careers' && profile?.preferred_career_types) {
        // Send only IDs to backend
        const careerIds = profile.preferred_career_types.map(career => career.id);
        await candidateAPI.updateCandidateInfo({ preferred_career_types: careerIds });
        await fetchProfile();
        setHasChanges(prev => ({ ...prev, careers: false }));
      } else if (section === 'experience') {
        // Calculate total months from years and months
        const totalMonths = experienceYears * 12 + experienceMonths;
        const updateData: {
          experience_months: number;
          highest_education?: string;
        } = {
          experience_months: totalMonths
        };
        
        // Add education if it's not the default values
        if (editForm.highest_education === 'Other' && customEducation.trim()) {
          updateData.highest_education = customEducation.trim();
        } else if (editForm.highest_education && editForm.highest_education !== 'Other') {
          updateData.highest_education = editForm.highest_education;
        }
        
        await candidateAPI.updateCandidateInfo(updateData);
        await fetchProfile();
      }
      setEditingSections(prev => ({ ...prev, [section]: false }));
    } catch (error) {
      console.error(`Failed to save ${section}:`, error);
    }
  };
  const handleCancel = (section: string) => {
    setEditingSections(prev => ({ ...prev, [section]: false }));
    setHasChanges(prev => ({ ...prev, [section]: false }));
    
    if (section === 'personal') {
      // Reset personal form to original values
      if (profile) {
        // Use the same logic as fetchProfile for name initialization
        if (profile.first_name || profile.last_name) {
          setFirstName(profile.first_name || '');
          setMiddleName(profile.middle_name || '');
          setLastName(profile.last_name || '');
        } else if (profile.name) {
          const nameParts = profile.name.trim().split(' ');
          setFirstName(nameParts[0] || '');
          setLastName(nameParts[nameParts.length - 1] || '');
          setMiddleName(nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : '');
        } else {
          setFirstName('');
          setMiddleName('');
          setLastName('');
        }
        
        setEditForm({
          email: profile.email,
          phone: profile.phone,
          title: profile.title
        });
        
        // Reset location to original values
        if (profile.country) {
          setEditCountry(profile.country);
        } else {
          setEditCountry('Select country');
        }
        
        // Parse and reset location
        if (profile.location) {
          const locationParts = profile.location.split(', ');
          if (locationParts.length >= 2) {
            setEditCity(locationParts[0].trim());
            setEditState(locationParts[1].trim());
          } else {
            setEditCity('');
            setEditState('');
          }
        } else {
          setEditCity('');
          setEditState('');
        }
        setPersonalErrors({});
      }
    } else if (section === 'skills') {
      setShowSkillInput(false);
      setNewSkillInput('');
    } else if (section === 'careers') {
      setShowCareerSearch(false);
      setCareerSearchTerm('');
      setSelectedCareersForAdd([]);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-sky-50">
        <Navbar />
        <div className="flex items-center justify-center pt-32">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-navy mx-auto mb-4"></div>
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (!profile && !loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-sky-50">
        <Navbar />
        <div className="flex items-center justify-center pt-32">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Profile Not Found</h1>
            <p className="text-gray-600 mb-6">The profile you&apos;re looking for doesn&apos;t exist or has been removed.</p>
            <button
              onClick={() => router.push('/home')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-sky-50 relative overflow-hidden">
      <AbstractLines />
      <Navbar />
      
      <main className="pt-24 pb-16 relative z-10">
        <div className="max-w-6xl mx-auto px-4">
          {/* Profile Header */}
          <ProfileHeaderCard
            profile={profile!}
            isOwnProfile={isOwnProfile}
            isEditing={editingSections.personal || false}
            editForm={editForm}
            personalErrors={personalErrors}
            isPersonalFormValid={isPersonalFormValid}
            isUploadingProfilePic={isUploadingProfilePic}
            firstName={firstName}
            middleName={middleName}
            lastName={lastName}
            editCountry={editCountry}
            editState={editState}
            editCity={editCity}
            onEdit={() => handleEdit('personal')}
            onSave={() => handleSave('personal')}
            onCancel={() => handleCancel('personal')}
            onFieldChange={handlePersonalFieldChange}
            onProfilePicChange={handleProfilePicChange}
            onStateChange={handleStateChange}
            onCityChange={handleCityChange}
            onCountryChange={handleCountryChange}
            onBack={handleBack}
          />

          {/* Highlights */}
          <HighlightsCard
            highlights={profile!.highlights}
            isOwnProfile={isOwnProfile}
            isUpdatingHighlights={isUpdatingHighlights}
            onRegenerateHighlights={handleRegenerateHighlights}
          />

          {/* Row 3: Account Management, Experience & Education, Resume - Equal Size Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <AccountManagementCard
              onManageAccount={() => setShowAccountModal(true)}
            />
            
            <ExperienceEducationCard
              profile={profile!}
              isOwnProfile={isOwnProfile}
              isEditing={editingSections.experience || false}
              editForm={editForm}
              experienceYears={experienceYears}
              experienceMonths={experienceMonths}
              customEducation={customEducation}
              onEdit={() => handleEdit('experience')}
              onSave={() => handleSave('experience')}
              onCancel={() => handleCancel('experience')}
              onExperienceYearsChange={setExperienceYears}
              onExperienceMonthsChange={setExperienceMonths}
              onEducationChange={(value) => setEditForm(prev => ({ ...prev, highest_education: value }))}
              onCustomEducationChange={setCustomEducation}
              formatExperience={formatExperience}
            />

            <ResumeCard
              profile={profile!}
              onDownloadResume={handleDownloadResume}
              onShowResume={handleShowResumeText}
              onUploadResume={() => router.push('/upload-resume')}
            />
          </div>

          {/* Row 4: Skills */}
          <SkillsCard
            skills={profile!.skills}
            isOwnProfile={isOwnProfile}
            hasChanges={hasChanges.skills || false}
            showSkillInput={showSkillInput}
            newSkillInput={newSkillInput}
            onSave={() => handleSave('skills')}
            onCancel={() => handleCancel('skills')}
            onAddSkill={handleAddSkill}
            onDeleteSkill={handleDeleteSkill}
            onShowSkillInput={setShowSkillInput}
            onSkillInputChange={setNewSkillInput}
            onSkillInputKeyPress={handleSkillInputKeyPress}
          />

          {/* Row 5: Career Interests */}
          <CareerInterestsCard
            preferredCareers={profile!.preferred_career_types}
            isOwnProfile={isOwnProfile}
            hasChanges={hasChanges.careers || false}
            showCareerSearch={showCareerSearch}
            careerSearchTerm={careerSearchTerm}
            selectedCareersForAdd={selectedCareersForAdd}
            filteredCareers={filteredCareers}
            onSave={() => handleSave('careers')}
            onCancel={() => handleCancel('careers')}
            onRemoveCareer={handleRemoveCareer}
            onShowCareerSearch={setShowCareerSearch}
            onCareerSearchChange={setCareerSearchTerm}
            onToggleCareerSelection={handleToggleCareerSelection}
            onAddSelectedCareers={handleAddSelectedCareers}
          />
        </div>
      </main>

      <Footer />

      {/* Modals */}
      <AccountManagementModal
        isOpen={showAccountModal}
        onClose={() => setShowAccountModal(false)}
        currentUsername={currentAccountInfo.username}
        currentEmail={currentAccountInfo.email}
      />
      
      <RegenerateHighlightsModal
        isOpen={showHighlightsModal}
        onClose={() => setShowHighlightsModal(false)}
        onRegenerate={handleRegenerateWithPrompt}
        isLoading={isUpdatingHighlights}
      />
      
      <ResumeTextModal
        isOpen={showResumeTextModal}
        onClose={() => setShowResumeTextModal(false)}
        resumeText={profile?.resume || ''}
      />
    </div>
  );
}