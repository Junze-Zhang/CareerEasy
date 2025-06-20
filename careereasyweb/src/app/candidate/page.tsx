'use client';

import { useState, useEffect, useMemo } from 'react';

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { Navbar, Footer, AbstractLines } from '@/components';
import { candidateAPI, generalAPI } from '@/services/api';
import { Career } from '@/types/api';
import StateProvinceSelect from '@/components/forms/StateProvinceSelect';
import CitySelect from '@/components/forms/CitySelect';
import JobTitleSelect from '@/components/forms/JobTitleSelect';


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
  // Own profile only
  preferred_career_types?: Career[];
  experience_months?: number;
  has_original_resume?: boolean;
  resume?: string;
  highest_education?: string;
  skills?: string[];
}

export default function ProfilePage() {
  const router = useRouter();
  const [candidateId, setCandidateId] = useState<string | null>(null);
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<CandidateProfile>>({});
  const [allCareers, setAllCareers] = useState<Career[]>([]);
  const [isUpdatingHighlights, setIsUpdatingHighlights] = useState(false);
  const [editingSections, setEditingSections] = useState<{[key: string]: boolean}>({});
  const [hasChanges, setHasChanges] = useState<{[key: string]: boolean}>({});
  const [originalValues, setOriginalValues] = useState<Partial<CandidateProfile>>({});
  const [experienceYears, setExperienceYears] = useState(0);
  const [experienceMonths, setExperienceMonths] = useState(0);
  const [customEducation, setCustomEducation] = useState('');
  const [newSkillInput, setNewSkillInput] = useState('');
  const [showSkillInput, setShowSkillInput] = useState(false);
  const [showPromptPopup, setShowPromptPopup] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [notification, setNotification] = useState<{message: string, action?: () => void} | null>(null);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isUploadingProfilePic, setIsUploadingProfilePic] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [accountForm, setAccountForm] = useState({
    username: '',
    email: '',
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [currentAccountInfo, setCurrentAccountInfo] = useState<{username: string, email: string} | null>(null);
  const [accountErrors, setAccountErrors] = useState<{[key: string]: string}>({});
  const [isUpdatingAccount, setIsUpdatingAccount] = useState(false);
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    symbol: false
  });
  const [careerSearchTerm, setCareerSearchTerm] = useState('');
  const [editCountry, setEditCountry] = useState('Select country');
  const [editState, setEditState] = useState('');
  const [editCity, setEditCity] = useState('');
  const [showCareerSearch, setShowCareerSearch] = useState(false);
  const [selectedCareersForAdd, setSelectedCareersForAdd] = useState<Career[]>([]);
  const [personalErrors, setPersonalErrors] = useState<{[key: string]: string}>({});
  const [isPersonalFormValidState, setIsPersonalFormValidState] = useState(true);

  // Memoized validation results to prevent infinite re-renders
  const isAccountInfoUpdateValid = useMemo(() => {
    // Check if there are any changes and they are valid
    const hasUsernameChange = accountForm.username.trim() !== '' && accountForm.username !== currentAccountInfo?.username;
    const hasEmailChange = accountForm.email.trim() !== '' && accountForm.email !== currentAccountInfo?.email;
    const hasChanges = hasUsernameChange || hasEmailChange;
    
    if (!hasChanges) return false;
    
    // Check for validation errors
    if (accountForm.username.trim() !== '' && accountForm.username.length < 3) return false;
    if (accountForm.email.trim() !== '') {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(accountForm.email)) return false;
    }
    
    return true;
  }, [accountForm.username, accountForm.email, currentAccountInfo?.username, currentAccountInfo?.email]);

  const isPasswordUpdateValid = useMemo(() => {
    // All fields must be filled
    if (!accountForm.oldPassword || !accountForm.newPassword || !accountForm.confirmPassword) return false;
    
    // Password must meet requirements - calculate requirements without triggering state updates
    const reqs = {
      length: accountForm.newPassword.length >= 6,
      uppercase: /[A-Z]/.test(accountForm.newPassword),
      lowercase: /[a-z]/.test(accountForm.newPassword),
      number: /[0-9]/.test(accountForm.newPassword),
      symbol: /[!@#$%^&*(),.?\":{}|<>]/.test(accountForm.newPassword)
    };
    const optionalReqs = { uppercase: reqs.uppercase, lowercase: reqs.lowercase, number: reqs.number, symbol: reqs.symbol };
    const metRequirements = Object.values(optionalReqs).filter(Boolean).length;
    
    if (accountForm.newPassword.length < 6) return false;
    if (metRequirements < 2) return false;
    
    // Passwords must match
    if (accountForm.newPassword !== accountForm.confirmPassword) return false;
    
    return true;
  }, [accountForm.oldPassword, accountForm.newPassword, accountForm.confirmPassword]);

  // Get candidate ID from cookies and redirect if not logged in
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const candidateIdFromCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('candidate_id='))
        ?.split('=')[1];
      
      const candidateAccountId = document.cookie
        .split('; ')
        .find(row => row.startsWith('candidate_account_id='))
        ?.split('=')[1];
      
      if (candidateIdFromCookie && candidateAccountId) {
        setCandidateId(candidateIdFromCookie);
      } else {
        // Redirect to home if not logged in
        router.push('/');
      }
    }
  }, [router]);

  useEffect(() => {
    fetchProfile();
    checkIsOwnProfile();
    fetchCareers();
    if (isOwnProfile) {
      fetchAccountInfo();
    }
  }, [candidateId, isOwnProfile]);

  // Update validation when entering edit mode
  useEffect(() => {
    if (editingSections.personal) {
      updatePersonalFormValidation();
    }
  }, [editingSections.personal, firstName, lastName, middleName, editForm.title, editForm.email, editForm.phone]);

  const checkIsOwnProfile = () => {
    if (typeof document !== 'undefined') {
      const candidateIdCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('candidate_id='))
        ?.split('=')[1];
      
      const isOwn = candidateIdCookie === candidateId;
      setIsOwnProfile(isOwn);
      if (isOwn) {
        fetchAccountInfo();
      }
    }
  };

  const fetchAccountInfo = async () => {
    try {
      const response = await fetch('http://localhost:8000/candidate/account_info', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setCurrentAccountInfo(data);
        // Set form defaults to current values
        setAccountForm(prev => ({
          ...prev,
          username: data.username,
          email: data.email
        }));
      }
    } catch (err) {
      console.error('Failed to fetch account info:', err);
    }
  };

  const fetchProfile = async () => {
    if (!candidateId) return;
    
    try {
      const response = await candidateAPI.candidateInfo(candidateId);
      
      // Map Candidate data to CandidateProfile interface
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
      
      // Check if this is own profile and has no resume - redirect to upload-resume
      if (isOwnProfile && (!candidateData.resume || candidateData.resume.trim() === '')) {
        router.push('/upload-resume');
        return;
      }
      
      // Initialize name fields if they exist separately, otherwise split the full name
      if (response.data.first_name || response.data.last_name) {
        setFirstName(response.data.first_name || '');
        setMiddleName(response.data.middle_name || '');
        setLastName(response.data.last_name || '');
      } else if (response.data.name) {
        // Split the full name into parts
        const nameParts = response.data.name.trim().split(' ');
        setFirstName(nameParts[0] || '');
        setLastName(nameParts[nameParts.length - 1] || '');
        setMiddleName(nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : '');
      }
      
      // Initialize location fields
      // Always default to 'Select country' instead of user's saved country
      setEditCountry('Select country');
      // Note: We don't have separate state/city fields in the current data structure
      // so we'll parse them from location when needed
    } catch (err) {
      const errorMessage = handleApiError(err, 'An error occurred');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchCareers = async () => {
    try {
      const response = await generalAPI.getCareers();
      setAllCareers(response.data);
    } catch (err) {
      console.error('Failed to fetch careers:', err);
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


  const toggleSectionEdit = (section: string) => {
    const wasEditing = editingSections[section];
    
    if (!wasEditing) {
      // Starting edit mode - store original values
      if (section === 'title') {
        setOriginalValues(prev => ({ ...prev, title: profile?.title }));
      } else if (section === 'experience') {
        const totalMonths = profile?.experience_months || 0;
        const years = Math.floor(totalMonths / 12);
        const months = totalMonths % 12;
        setExperienceYears(years);
        setExperienceMonths(months);
        setCustomEducation(profile?.highest_education && !['Bachelor\'s', 'Master\'s', 'Doctorate', 'High School'].includes(profile.highest_education) ? profile.highest_education : '');
        setOriginalValues(prev => ({ 
          ...prev, 
          experience_months: profile?.experience_months,
          highest_education: profile?.highest_education 
        }));
      } else if (section === 'skills') {
        setOriginalValues(prev => ({ ...prev, skills: profile?.skills }));
      } else if (section === 'careers') {
        setOriginalValues(prev => ({ ...prev, preferred_career_types: profile?.preferred_career_types }));
      }
    }
    
    setEditingSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  const saveSectionEdit = async (section: string) => {
    try {
      const updateData: Record<string, unknown> = {};
      
      if (section === 'title') {
        if (editForm.title !== originalValues.title) {
          updateData.title = editForm.title;
        }
      } else if (section === 'personal') {
        // Update full name from individual parts
        updateFullName();
        const fullName = [firstName, middleName, lastName].filter(Boolean).join(' ');
        if (fullName !== profile?.name && fullName.trim()) {
          updateData.name = fullName;
          if (firstName.trim()) updateData.first_name = firstName;
          if (middleName.trim()) updateData.middle_name = middleName;
          if (lastName.trim()) updateData.last_name = lastName;
        }
        if (editForm.title !== profile?.title && editForm.title?.trim()) {
          updateData.title = editForm.title;
        }
        if (editForm.email !== profile?.email && editForm.email?.trim()) {
          updateData.email = editForm.email;
        }
        if (editForm.phone !== profile?.phone && editForm.phone?.trim()) {
          // Strip formatting from phone number before sending to API
          const unformattedPhone = editForm.phone?.replace(/\D/g, '') || '';
          if (unformattedPhone) updateData.phone = unformattedPhone;
        }
        // Only update location if all fields are filled and country is not default
        if (editCountry && editCountry !== 'Select country' && editState && editCity) {
          // Format location as "City, State Code" (e.g., "Los Angeles, CA")
          const formattedLocation = `${editCity}, ${editState}`;
          if (formattedLocation !== profile?.location) {
            updateData.location = formattedLocation;
            updateData.country = editCountry;
          }
        }
        // Note: If country is "Select country", we don't send location or country data
      } else if (section === 'experience') {
        const totalMonths = parseInt(experienceYears.toString()) * 12 + parseInt(experienceMonths.toString());
        if (totalMonths !== originalValues.experience_months) {
          updateData.experience_months = totalMonths;
        }
        const educationValue = editForm.highest_education === 'Other' ? customEducation : editForm.highest_education;
        if (educationValue !== originalValues.highest_education) {
          updateData.highest_education = educationValue;
        }
      } else if (section === 'skills') {
        updateData.skills = editForm.skills || [];
      } else if (section === 'careers') {
        const currentCareerIds = editForm.preferred_career_types?.map(c => c.id) || [];
        updateData.preferred_career_types = currentCareerIds;
      }
      
      // Only call API if there are changes
      if (Object.keys(updateData).length > 0) {
        await candidateAPI.updateCandidateInfo(updateData);
        // Update profile with the actual saved values
        if (section === 'experience') {
          const totalMonths = parseInt(experienceYears.toString()) * 12 + parseInt(experienceMonths.toString());
          const educationValue = editForm.highest_education === 'Other' ? customEducation : editForm.highest_education;
          setProfile(prev => prev ? { 
            ...prev, 
            experience_months: totalMonths,
            highest_education: educationValue
          } : null);
        } else if (section === 'personal') {
          // Update profile with personal information including parsed name and location
          const fullName = [firstName, middleName, lastName].filter(Boolean).join(' ');
          const formattedLocation = (editCountry && editCountry !== 'Select country' && editState && editCity) 
            ? `${editCity}, ${editState}` 
            : profile?.location;
          
          setProfile(prev => prev ? { 
            ...prev, 
            name: fullName,
            first_name: firstName,
            middle_name: middleName,
            last_name: lastName,
            title: editForm.title || '',
            email: editForm.email || '',
            phone: editForm.phone?.replace(/\D/g, '') || '',
            location: formattedLocation || '',
            country: (editCountry && editCountry !== 'Select country') ? editCountry : prev.country
          } : null);
        } else {
          setProfile(prev => prev ? { ...prev, ...editForm } : null);
        }
      }
      
      // Clear changes and exit edit mode
      setHasChanges(prev => ({ ...prev, [section]: false }));
      setEditingSections(prev => ({ ...prev, [section]: false }));
    } catch (err) {
      const errorMessage = handleApiError(err, 'Failed to save changes');
      setError(errorMessage);
    }
  };
  
  const cancelSectionEdit = (section: string) => {
    // Restore original values
    if (section === 'title') {
      setEditForm(prev => ({ ...prev, title: originalValues.title }));
    } else if (section === 'personal') {
      // Restore personal info values
      setFirstName(profile?.first_name || profile?.name?.split(' ')[0] || '');
      setLastName(profile?.last_name || profile?.name?.split(' ').slice(-1)[0] || '');
      setMiddleName(profile?.middle_name || '');
      setEditForm(prev => ({ 
        ...prev, 
        title: profile?.title,
        email: profile?.email,
        phone: profile?.phone,
        location: profile?.location 
      }));
      // Always reset location fields to default
      setEditCountry('Select country');
      setEditState('');
      setEditCity('');
    } else if (section === 'experience') {
      const totalMonths = originalValues.experience_months || 0;
      const years = Math.floor(totalMonths / 12);
      const months = totalMonths % 12;
      setExperienceYears(years);
      setExperienceMonths(months);
      setCustomEducation(originalValues.highest_education && !['Bachelor\'s', 'Master\'s', 'Doctorate', 'PhD', 'High School'].includes(originalValues.highest_education) ? originalValues.highest_education : '');
      setEditForm(prev => ({ 
        ...prev, 
        experience_months: originalValues.experience_months,
        highest_education: originalValues.highest_education 
      }));
    } else if (section === 'skills') {
      setEditForm(prev => ({ ...prev, skills: profile?.skills }));
    } else if (section === 'careers') {
      setEditForm(prev => ({ ...prev, preferred_career_types: profile?.preferred_career_types }));
    }
    
    // Clear changes and exit edit mode
    setHasChanges(prev => ({ ...prev, [section]: false }));
    setEditingSections(prev => ({ ...prev, [section]: false }));
  };

  const handleUpdateHighlights = async (prompt?: string) => {
    try {
      // Close popup immediately and start loading
      setShowPromptPopup(false);
      setCustomPrompt('');
      setIsUpdatingHighlights(true);
      
      const response = await candidateAPI.updateHighlights({
        custom_prompt: prompt || "Focus on the candidate's education, experience and skills."
      });
      
      // Update both the profile and edit form with new highlights
      const newHighlights = response.data.highlights;
      setProfile(prev => prev ? { ...prev, highlights: newHighlights } : null);
      setEditForm(prev => ({ ...prev, highlights: newHighlights }));
    } catch (err) {
      const errorMessage = handleApiError(err, 'Failed to update highlights');
      setError(errorMessage);
    } finally {
      setIsUpdatingHighlights(false);
    }
  };


  const deleteSkill = (skillToDelete: string) => {
    const currentSkills = editForm.skills || profile?.skills || [];
    const newSkills = currentSkills.filter(skill => skill !== skillToDelete);
    setEditForm(prev => ({ ...prev, skills: newSkills }));
    setHasChanges(prev => ({ ...prev, skills: true }));
  };

  const addSkill = (newSkill: string) => {
    if (newSkill.trim()) {
      const currentSkills = editForm.skills || profile?.skills || [];
      setEditForm(prev => ({ 
        ...prev, 
        skills: [...currentSkills, newSkill.trim()]
      }));
      setHasChanges(prev => ({ ...prev, skills: true }));
      setNewSkillInput('');
      setShowSkillInput(false);
    }
  };
  
  const handleSkillInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addSkill(newSkillInput);
    } else if (e.key === 'Escape') {
      setNewSkillInput('');
      setShowSkillInput(false);
    }
  };

  const handleShowResume = () => {
    setShowResumeModal(true);
  };

  const handleDownloadResume = async () => {
    try {
      const response = await candidateAPI.downloadResume();
      
      // Try to get filename from Content-Disposition header
      let filename = 'resume';
      const contentDisposition = response.headers['content-disposition'];
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '');
        }
      }
      
      // Create blob with correct content type from response
      const contentType = response.headers['content-type'] || 'application/octet-stream';
      const blob = new Blob([response.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to download resume:', error);
      setError('Failed to download resume file');
    }
  };

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

  // Only show full page error for critical issues (profile not found), not for operation errors
  if (!profile && !loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-sky-50">
        <Navbar />
        <div className="flex items-center justify-center pt-32">
          <div className="text-center">
            <p className="text-red-600 mb-4">Profile not found</p>
            <Link href="/" className="text-brand-navy hover:underline">
              Return to home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Guard clause - if we reach here, profile should be available
  if (!profile) {
    return null;
  }

  // Validation functions from signup forms would be used if we add client-side validation

  const formatPhoneNumber = (value: string): string => {
    const digits = value.replace(/\D/g, '');
    const limitedDigits = digits.slice(0, 10);
    
    if (limitedDigits.length === 10) {
      return `(${limitedDigits.slice(0, 3)}) ${limitedDigits.slice(3, 6)}-${limitedDigits.slice(6)}`;
    }
    
    return limitedDigits;
  };

  // Helper functions for personal info editing
  const handleProfilePicChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        setIsUploadingProfilePic(true);
        
        // Create form data for upload
        const formData = new FormData();
        formData.append('profile_pic', file);
        
        // Upload to backend
        const response = await candidateAPI.updateProfilePicture(formData);
        
        // Get the profile picture URL from the response
        const newProfilePicUrl = response.data.profile_pic_url;
        
        if (newProfilePicUrl && newProfilePicUrl.trim() !== '') {
          // Update profile with new picture URL
          setProfile(prev => {
            if (!prev) return null;
            return { ...prev, profile_pic: newProfilePicUrl };
          });
        } else {
          throw new Error('Failed to get valid profile picture URL from server');
        }
        
        // Show success notification
        setNotification({ message: 'Profile picture updated successfully!' });
        setTimeout(() => setNotification(null), 3000);
        
      } catch (err) {
        const errorMessage = handleApiError(err, 'Failed to upload profile picture');
        setError(errorMessage);
      } finally {
        setIsUploadingProfilePic(false);
      }
    }
  };


  const updateFullName = () => {
    const fullName = [firstName, middleName, lastName].filter(Boolean).join(' ');
    setEditForm(prev => ({ ...prev, name: fullName }));
  };

  // Validation functions from signup forms
  const validateName = (name: string): string | undefined => {
    if (!name) return 'This field is required';
    if (!/^[a-zA-Z\s\-']+$/.test(name)) return 'Name can only contain letters, spaces, hyphens, and apostrophes';
    return undefined;
  };

  const validateEmail = (email: string): string | undefined => {
    if (!email) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return undefined;
  };

  const validatePhone = (phone: string): string | undefined => {
    if (!phone) return 'Phone number is required';
    const digitsOnly = phone.replace(/\D/g, '');
    if (digitsOnly.length !== 10) return 'Phone number must be exactly 10 digits';
    return undefined;
  };

  const validateTitle = (title: string): string | undefined => {
    if (!title) return 'Job title is required';
    if (title.length < 2) return 'Job title must be at least 2 characters';
    return undefined;
  };

  const validateMiddleName = (name: string): string | undefined => {
    if (!name) return undefined; // Optional field
    if (!/^[a-zA-Z\s\-']+$/.test(name)) return 'Name can only contain letters, spaces, hyphens, and apostrophes';
    return undefined;
  };

  const updatePersonalFormValidation = (overrides?: {country?: string, state?: string, city?: string}) => {
    const errors: {[key: string]: string} = {};
    
    if (!firstName) errors.firstName = 'First name is required';
    else if (!/^[a-zA-Z\s\-']+$/.test(firstName)) errors.firstName = 'Invalid name format';
    
    if (!lastName) errors.lastName = 'Last name is required';
    else if (!/^[a-zA-Z\s\-']+$/.test(lastName)) errors.lastName = 'Invalid name format';
    
    if (middleName && !/^[a-zA-Z\s\-']+$/.test(middleName)) errors.middleName = 'Invalid name format';
    
    if (!editForm.title) errors.title = 'Job title is required';
    else if (editForm.title && editForm.title.length < 2) errors.title = 'Job title too short';
    
    if (!editForm.email) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.email)) errors.email = 'Invalid email format';
    
    if (!editForm.phone) errors.phone = 'Phone number is required';
    else {
      const digitsOnly = editForm.phone.replace(/\D/g, '');
      if (digitsOnly.length !== 10) {
        errors.phone = 'Phone number must be exactly 10 digits';
      }
    }
    
    // Use override values if provided, otherwise use current state
    const currentCountry = overrides?.country ?? editCountry;
    const currentState = overrides?.state ?? editState;
    const currentCity = overrides?.city ?? editCity;
    
    // Location validation - either all filled or all default/empty (which is valid)
    if (currentCountry && currentCountry !== 'Select country') {
      // If country is selected, require state and city
      if (!currentState) {
        errors.location = 'State/Province is required when country is selected';
      } else if (!currentCity) {
        errors.location = 'City is required when state is selected';
      }
    }
    // Note: "Select country, none, none" is valid and won't send location data
    
    const isValid = Object.keys(errors).length === 0;
    setIsPersonalFormValidState(isValid);
    return isValid;
  };

  const handlePersonalFieldChange = (field: string, value: string) => {
    let processedValue = value;
    
    // Apply phone formatting
    if (field === 'phone') {
      processedValue = formatPhoneNumber(value);
    }
    
    if (field === 'firstName') {
      setFirstName(processedValue);
    } else if (field === 'middleName') {
      setMiddleName(processedValue);
    } else if (field === 'lastName') {
      setLastName(processedValue);
    } else {
      setEditForm(prev => ({ ...prev, [field]: processedValue }));
    }
    setHasChanges(prev => ({ ...prev, personal: true }));

    // Real-time validation
    const errors = { ...personalErrors };
    switch (field) {
      case 'firstName':
        errors.firstName = validateName(processedValue) || '';
        break;
      case 'middleName':
        errors.middleName = validateMiddleName(processedValue) || '';
        break;
      case 'lastName':
        errors.lastName = validateName(processedValue) || '';
        break;
      case 'title':
        errors.title = validateTitle(processedValue) || '';
        break;
      case 'email':
        errors.email = validateEmail(processedValue) || '';
        break;
      case 'phone':
        errors.phone = validatePhone(processedValue) || '';
        break;
    }
    
    // Remove empty error messages
    Object.keys(errors).forEach(key => {
      if (!errors[key]) delete errors[key];
    });
    
    setPersonalErrors(errors);
    
    // Update form validation state immediately
    updatePersonalFormValidation();
  };

  // Location change handlers
  const handleCountryChange = (value: string) => {
    setEditCountry(value);
    setEditState('');
    setEditCity('');
    setHasChanges(prev => ({ ...prev, personal: true }));
    // Validate immediately with new values
    updatePersonalFormValidation({ country: value, state: '', city: '' });
  };

  const handleStateChange = (value: string) => {
    setEditState(value);
    setEditCity('');
    setHasChanges(prev => ({ ...prev, personal: true }));
    // Validate immediately with new values
    updatePersonalFormValidation({ state: value, city: '' });
  };

  const handleCityChange = (value: string) => {
    setEditCity(value);
    setHasChanges(prev => ({ ...prev, personal: true }));
    // Validate immediately with new values
    updatePersonalFormValidation({ city: value });
  };

  // Helper function for consistent error handling
  const handleApiError = (err: unknown, fallbackMessage: string): string => {
    if (err && typeof err === 'object' && 'response' in err) {
      const axiosError = err as { response?: { status: number; data?: { Error?: string; error?: string } } };
      if (axiosError.response && axiosError.response.status >= 400 && axiosError.response.status < 500) {
        return axiosError.response.data?.Error || axiosError.response.data?.error || fallbackMessage;
      }
    }
    if (err instanceof Error) {
      return err.message;
    }
    return fallbackMessage;
  };

  // Account management functions
  const checkPasswordRequirements = (password: string) => {
    const requirements = {
      length: password.length >= 6,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      symbol: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    setPasswordRequirements(requirements);
    return requirements;
  };


  const handleAccountInfoUpdate = async () => {
    // For submission, check if required fields are provided
    const errors: {[key: string]: string} = {};
    
    if (accountForm.username && accountForm.username.trim() !== '' && accountForm.username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    }
    
    if (accountForm.email && accountForm.email.trim() !== '') {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(accountForm.email)) {
        errors.email = 'Please enter a valid email address';
      }
    }
    
    if (Object.keys(errors).length > 0) {
      setAccountErrors(prev => ({ ...prev, ...errors }));
      return;
    }

    setIsUpdatingAccount(true);
    try {
      const updateData: {username?: string, email?: string} = {};
      
      // Only include fields that have been changed from current values
      if (accountForm.username.trim() && accountForm.username.trim() !== currentAccountInfo?.username) {
        updateData.username = accountForm.username.trim();
      }
      if (accountForm.email.trim() && accountForm.email.trim() !== currentAccountInfo?.email) {
        updateData.email = accountForm.email.trim();
      }

      if (Object.keys(updateData).length > 0) {
        await candidateAPI.updateAccountInfo(updateData);
        setNotification({ message: 'Account information updated successfully!' });
        setTimeout(() => setNotification(null), 3000);
        
        // Refresh account info
        await fetchAccountInfo();
      } else {
        setNotification({ message: 'No changes to save.' });
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (err) {
      const errorMessage = handleApiError(err, 'Failed to update account information');
      setError(errorMessage);
    } finally {
      setIsUpdatingAccount(false);
    }
  };

  const validatePasswordForm = (newPassword?: string, confirmPassword?: string) => {
    const password = newPassword ?? accountForm.newPassword;
    const confirm = confirmPassword ?? accountForm.confirmPassword;
    const errors: {[key: string]: string} = {};
    
    // Only validate password fields if they have content
    if (password && password.trim() !== '') {
      const reqs = checkPasswordRequirements(password);
      // Remove length from optional requirements count
      const optionalReqs = { uppercase: reqs.uppercase, lowercase: reqs.lowercase, number: reqs.number, symbol: reqs.symbol };
      const metRequirements = Object.values(optionalReqs).filter(Boolean).length;
      
      if (password.length < 6) {
        errors.newPassword = 'Password must be at least 6 characters';
      } else if (metRequirements < 2) {
        errors.newPassword = 'Password must meet at least 2 additional requirements';
      } else {
        // Clear error if password is valid
        setAccountErrors(prev => ({ ...prev, newPassword: '' }));
      }
    }
    
    // Only validate confirm password if both passwords have content
    if (password && confirm && password !== confirm) {
      errors.confirmPassword = 'Passwords do not match';
    } else if (password && confirm && password === confirm) {
      // Clear error if passwords match
      setAccountErrors(prev => ({ ...prev, confirmPassword: '' }));
    }
    
    // Set errors if any exist
    if (Object.keys(errors).length > 0) {
      setAccountErrors(prev => ({ ...prev, ...errors }));
    }
    
    return Object.keys(errors).length === 0;
  };

  const handlePasswordUpdate = async () => {
    // For submission, validate required fields
    const errors: {[key: string]: string} = {};
    
    if (!accountForm.oldPassword) {
      errors.oldPassword = 'Current password is required';
    }
    if (!accountForm.newPassword) {
      errors.newPassword = 'New password is required';
    } else {
      const reqs = checkPasswordRequirements(accountForm.newPassword);
      // Remove length from optional requirements count - it's a hard requirement
      const optionalReqs = { uppercase: reqs.uppercase, lowercase: reqs.lowercase, number: reqs.number, symbol: reqs.symbol };
      const metRequirements = Object.values(optionalReqs).filter(Boolean).length;
      
      if (accountForm.newPassword.length < 6) {
        errors.newPassword = 'Password must be at least 6 characters';
      } else if (metRequirements < 2) {
        errors.newPassword = 'Password must meet at least 2 additional requirements';
      }
    }
    if (accountForm.newPassword !== accountForm.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    if (Object.keys(errors).length > 0) {
      setAccountErrors(prev => ({ ...prev, ...errors }));
      return;
    }

    setIsUpdatingAccount(true);
    try {
      await candidateAPI.updatePassword({
        old_password: accountForm.oldPassword,
        new_password: accountForm.newPassword
      });

      setNotification({ message: 'Password updated successfully!' });
      setTimeout(() => setNotification(null), 3000);
      
      // Clear password fields
      setAccountForm(prev => ({
        ...prev,
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      setAccountErrors({});
    } catch (err) {
      const errorMessage = handleApiError(err, 'Failed to update password');
      setError(errorMessage);
    } finally {
      setIsUpdatingAccount(false);
    }
  };

  // Filter careers based on search term
  const filteredCareers = allCareers.filter(career =>
    career.name.toLowerCase().includes(careerSearchTerm.toLowerCase())
  );


  return (
    <>
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }
        .animate-fade-in-left {
          animation: fadeInLeft 0.6s ease-out forwards;
        }
        .animate-fade-in-right {
          animation: fadeInRight 0.6s ease-out forwards;
        }
        .animate-fade-in-down {
          animation: fadeInDown 0.4s ease-out forwards;
        }
      `}</style>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-sky-50 relative overflow-hidden">
        <AbstractLines />
        <Navbar />
      
      <main className="pt-24 pb-16 relative z-10">
        <div className="max-w-4xl mx-auto px-4">
          {/* Profile Header */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 opacity-0 translate-y-4 animate-fade-in-up hover:shadow-2xl transition-shadow relative" style={{animationDelay: '100ms'}}>
            {/* Back Button - Top Left */}
            <button
              onClick={() => router.back()}
              className="absolute top-4 left-4 p-2 hover:bg-gray-100 rounded-full transition-all group z-10"
              aria-label="Go back"
            >
              <svg 
                className="w-5 h-5 text-gray-600 group-hover:text-gray-800 transition-colors" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M10 19l-7-7m0 0l7-7m-7 7h18" 
                />
              </svg>
            </button>

            <div className="flex items-center justify-between mb-6 mt-8">
              <h1 className="text-2xl font-bold text-comfortable">{profile.name}</h1>
              <div className="flex items-center gap-2">
                {editingSections.personal ? (
                  <>
                    <button
                      onClick={() => {
                        if (isPersonalFormValidState) {
                          saveSectionEdit('personal');
                        }
                      }}
                      disabled={!isPersonalFormValidState}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors w-20 ${
                        isPersonalFormValidState
                          ? 'bg-brand-light-blue hover:bg-brand-light-blue-dark text-black'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      Save
                    </button>
                    <button
                      onClick={() => cancelSectionEdit('personal')}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors w-20"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  isOwnProfile && (
                    <button
                      onClick={() => toggleSectionEdit('personal')}
                      className="p-2 hover:bg-gray-100 rounded-full transition-all"
                    >
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  )
                )}
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-start gap-6">
              {/* Profile Picture */}
              <div className="flex-shrink-0">
                <div className="w-24 h-24 relative group">
                  {profile.profile_pic && profile.profile_pic.trim() !== '' ? (
                    <Image
                      src={profile.profile_pic}
                      alt={`${profile.name} profile`}
                      fill
                      className="object-cover rounded-full"
                      sizes="96px"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center">
                      <span className="text-gray-600 text-sm">No Image</span>
                    </div>
                  )}
                  
                  {/* Edit overlay for profile owner */}
                  {isOwnProfile && (
                    <>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProfilePicChange}
                        className="hidden"
                        id="profile-pic-upload-standalone"
                        disabled={isUploadingProfilePic}
                      />
                      <label
                        htmlFor="profile-pic-upload-standalone"
                        className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs py-1 text-center cursor-pointer rounded-b-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      >
                        {isUploadingProfilePic ? (
                          <div className="flex items-center justify-center gap-1">
                            <div className="animate-spin rounded-full h-3 w-3 border border-white border-t-transparent"></div>
                            <span>Uploading...</span>
                          </div>
                        ) : (
                          'Edit'
                        )}
                      </label>
                    </>
                  )}
                </div>
              </div>

              {/* Basic Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    {editingSections.personal ? (
                      <div className="space-y-6">
                        {/* Names */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              First Name
                            </label>
                            <input
                              type="text"
                              value={firstName}
                              onChange={(e) => handlePersonalFieldChange('firstName', e.target.value)}
                              className={`w-full px-4 py-3 border rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 ${
                                personalErrors.firstName 
                                  ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-200' 
                                  : 'border-gray-300 focus:border-brand-navy focus:ring-brand-light-blue/20'
                              }`}
                              placeholder="Enter first name"
                            />
                            {personalErrors.firstName && (
                              <p className="mt-1 text-sm text-red-600">{personalErrors.firstName}</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Middle Name <span className="text-gray-500 font-normal">(Optional)</span>
                            </label>
                            <input
                              type="text"
                              value={middleName}
                              onChange={(e) => handlePersonalFieldChange('middleName', e.target.value)}
                              className={`w-full px-4 py-3 border rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 ${
                                personalErrors.middleName 
                                  ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-200' 
                                  : 'border-gray-300 focus:border-brand-navy focus:ring-brand-light-blue/20'
                              }`}
                              placeholder="Enter middle name"
                            />
                            {personalErrors.middleName && (
                              <p className="mt-1 text-sm text-red-600">{personalErrors.middleName}</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Last Name
                            </label>
                            <input
                              type="text"
                              value={lastName}
                              onChange={(e) => handlePersonalFieldChange('lastName', e.target.value)}
                              className={`w-full px-4 py-3 border rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 ${
                                personalErrors.lastName 
                                  ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-200' 
                                  : 'border-gray-300 focus:border-brand-navy focus:ring-brand-light-blue/20'
                              }`}
                              placeholder="Enter last name"
                            />
                            {personalErrors.lastName && (
                              <p className="mt-1 text-sm text-red-600">{personalErrors.lastName}</p>
                            )}
                          </div>
                        </div>

                        {/* Job Title */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Job Title
                          </label>
                          <JobTitleSelect
                            value={editForm.title || ''}
                            onChange={(value) => handlePersonalFieldChange('title', value)}
                            className={`w-full px-4 py-3 border rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 ${
                              personalErrors.title 
                                ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-200' 
                                : 'border-gray-300 focus:border-brand-navy focus:ring-brand-light-blue/20'
                            }`}
                            placeholder="Search or select your job title"
                          />
                          {personalErrors.title && (
                            <p className="mt-1 text-sm text-red-600">{personalErrors.title}</p>
                          )}
                        </div>

                        {/* Email */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address
                          </label>
                          <input
                            type="email"
                            value={editForm.email || ''}
                            onChange={(e) => handlePersonalFieldChange('email', e.target.value)}
                            className={`w-full px-4 py-3 border rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 ${
                              personalErrors.email 
                                ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-200' 
                                : 'border-gray-300 focus:border-brand-navy focus:ring-brand-light-blue/20'
                            }`}
                            placeholder="Enter your email address"
                          />
                          {personalErrors.email && (
                            <p className="mt-1 text-sm text-red-600">{personalErrors.email}</p>
                          )}
                        </div>

                        {/* Phone */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            value={editForm.phone || ''}
                            onChange={(e) => handlePersonalFieldChange('phone', e.target.value)}
                            className={`w-full px-4 py-3 border rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 ${
                              personalErrors.phone 
                                ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-200' 
                                : 'border-gray-300 focus:border-brand-navy focus:ring-brand-light-blue/20'
                            }`}
                            placeholder="(123) 456-7890"
                          />
                          <p className="mt-1 text-xs text-gray-500">
                            +1 numbers only
                          </p>
                          {personalErrors.phone && (
                            <p className="mt-1 text-sm text-red-600">{personalErrors.phone}</p>
                          )}
                        </div>

                        {/* Location */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Country
                            </label>
                            <select
                              value={editCountry}
                              onChange={(e) => handleCountryChange(e.target.value)}
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-brand-navy focus:ring-4 focus:ring-brand-light-blue/20"
                            >
                              <option value="Select country">Select country</option>
                              <option value="United States">United States</option>
                              <option value="Canada">Canada</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              {editCountry === 'United States' ? 'State' : editCountry === 'Canada' ? 'Province' : 'State/Province'}
                            </label>
                            <StateProvinceSelect
                              value={editState}
                              onChange={handleStateChange}
                              country={editCountry}
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-brand-navy focus:ring-4 focus:ring-brand-light-blue/20"
                              placeholder={editCountry ? 'Select state/province' : 'Select country first'}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              City
                            </label>
                            <CitySelect
                              value={editCity}
                              onChange={handleCityChange}
                              country={editCountry}
                              state={editState}
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-brand-navy focus:ring-4 focus:ring-brand-light-blue/20"
                              placeholder={editState ? 'Select city' : 'Select state first'}
                            />
                          </div>
                          {personalErrors.location && (
                            <p className="mt-1 text-sm text-red-600">{personalErrors.location}</p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2 text-gray-600">
                      <p className="flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
                        </svg>
                        {profile.title}
                      </p>
                      
                      <p className="flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {profile.location}, {profile.country}
                      </p>
                      
                      <p className="flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        {profile.email}
                      </p>
                      
                      <p className="flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        {profile.phone}
                      </p>
                    </div>
                      )}
                  </div>

                </div>
              </div>
            </div>
          </div>

          {/* Highlights */}
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 opacity-0 translate-y-4 animate-fade-in-up hover:shadow-2xl transition-shadow" style={{animationDelay: '200ms'}}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-comfortable">Highlights</h2>
              {isOwnProfile && (
                <button
                  onClick={() => setShowPromptPopup(true)}
                  disabled={isUpdatingHighlights}
                  className="bg-brand-light-blue hover:bg-brand-light-blue-dark text-black px-4 py-2 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isUpdatingHighlights ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                      Updating. This can take up to 3 minutes...
                    </>
                  ) : (
                    'Regenerate with AI'
                  )}
                </button>
              )}
            </div>
            
            {profile.highlights && profile.highlights.length > 0 ? (
              <ul className="space-y-2">
                {profile.highlights.map((highlight, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-brand-light-blue font-bold">•</span>
                    <span className="text-gray-700">{highlight}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No highlights available</p>
            )}
          </div>

          {/* Additional Information (Own Profile Only) */}
          {isOwnProfile && profile.experience_months !== undefined && (
            <>
              {/* Account Management Card - Mobile first, then desktop positioning */}
              <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 md:hidden space-y-6 opacity-0 translate-y-4 animate-fade-in-up hover:shadow-2xl transition-shadow" style={{animationDelay: '300ms'}}>
                <h2 className="text-lg font-bold text-comfortable leading-none">Account Management</h2>
                <div className="flex justify-center py-3">
                  <button
                    onClick={() => setShowAccountModal(true)}
                    className="bg-brand-light-blue hover:bg-brand-light-blue-dark text-black px-6 py-3 rounded-xl text-sm font-medium transition-colors leading-none"
                  >
                    Manage Account
                  </button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-8 md:items-stretch">
                {/* Left Column - Desktop: Account Management + Experience, Mobile: Just Experience */}
                <div className="flex flex-col gap-6 h-full">
                  {/* Account Management Card - Desktop only */}
                  <div className="hidden md:block bg-white rounded-2xl shadow-xl p-6 space-y-6 opacity-0 animate-fade-in-left hover:shadow-2xl transition-shadow" style={{animationDelay: '400ms'}}>
                    <h2 className="text-lg font-bold text-comfortable leading-none">Account Management</h2>
                    <div className="flex justify-center py-3">
                      <button
                        onClick={() => setShowAccountModal(true)}
                        className="bg-brand-light-blue hover:bg-brand-light-blue-dark text-black px-6 py-3 rounded-xl text-sm font-medium transition-colors leading-none"
                      >
                        Manage Account
                      </button>
                    </div>
                  </div>
                {/* Experience & Education */}
                <div className="bg-white rounded-2xl shadow-xl p-6 flex-1 flex flex-col group opacity-0 animate-fade-in-left hover:shadow-2xl transition-shadow" style={{animationDelay: '500ms'}}>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-comfortable leading-none">Experience & Education</h2>
                    <div className="flex items-center gap-2">
                      {editingSections.experience ? (
                        <>
                          <button
                            onClick={() => saveSectionEdit('experience')}
                            className="bg-brand-light-blue hover:bg-brand-light-blue-dark text-black px-4 py-2 rounded-xl text-sm font-medium transition-colors w-20"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => cancelSectionEdit('experience')}
                            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors w-20"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        isOwnProfile && (
                          <button
                            onClick={() => toggleSectionEdit('experience')}
                            className="p-2 hover:bg-gray-100 rounded-full transition-all"
                          >
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        )
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col justify-between flex-1 space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Experience
                      </label>
                      {editingSections.experience ? (
                        <div className="flex gap-3">
                          <div className="flex-1">
                            <input
                              type="number"
                              min="0"
                              value={experienceYears}
                              onChange={(e) => setExperienceYears(parseInt(e.target.value) || 0)}
                              className="w-full px-4 py-3 border rounded-xl transition-all duration-300 transform hover:scale-[1.02] focus:scale-[1.02] border-gray-300 focus:border-brand-navy focus:ring-brand-light-blue/20 focus:ring-4 focus:outline-none"
                              placeholder="Years"
                            />
                            <label className="block text-xs text-gray-500 mt-1">Years</label>
                          </div>
                          <div className="flex-1">
                            <input
                              type="number"
                              min="0"
                              max="11"
                              value={experienceMonths}
                              onChange={(e) => setExperienceMonths(parseInt(e.target.value) || 0)}
                              className="w-full px-4 py-3 border rounded-xl transition-all duration-300 transform hover:scale-[1.02] focus:scale-[1.02] border-gray-300 focus:border-brand-navy focus:ring-brand-light-blue/20 focus:ring-4 focus:outline-none"
                              placeholder="Months"
                            />
                            <label className="block text-xs text-gray-500 mt-1">Months</label>
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-600 text-sm">
                          {formatExperience(profile.experience_months)}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Highest Degree
                      </label>
                      {editingSections.experience ? (
                        <div className="space-y-3">
                          <select
                            value={editForm.highest_education || ''}
                            onChange={(e) => setEditForm(prev => ({ ...prev, highest_education: e.target.value }))}
                            className="w-full px-4 py-3 border rounded-xl transition-all duration-300 transform hover:scale-[1.02] focus:scale-[1.02] border-gray-300 focus:border-brand-navy focus:ring-brand-light-blue/20 focus:ring-4 focus:outline-none"
                          >
                            <option value="">Select highest degree</option>
                            <option value="High School">High School</option>
                            <option value="Bachelor's">Bachelor&apos;s</option>
                            <option value="Master's">Master&apos;s</option>
                            <option value="Doctorate">Doctorate</option>
                            <option value="PhD">PhD</option>
                            <option value="Other">Other</option>
                          </select>
                          {editForm.highest_education === 'Other' && (
                            <input
                              type="text"
                              value={customEducation}
                              onChange={(e) => setCustomEducation(e.target.value)}
                              className="w-full px-4 py-3 border rounded-xl transition-all duration-300 transform hover:scale-[1.02] focus:scale-[1.02] border-gray-300 focus:border-brand-navy focus:ring-brand-light-blue/20 focus:ring-4 focus:outline-none"
                              placeholder="Specify your degree"
                            />
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-600 text-sm">
                          {profile.highest_education || 'Not specified'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Resume */}
                <div className="bg-white rounded-2xl shadow-xl p-6 flex-1 flex flex-col opacity-0 animate-fade-in-right hover:shadow-2xl transition-shadow" style={{animationDelay: '500ms'}}>
                  <h2 className="text-lg font-bold text-comfortable leading-none mb-4">Resume</h2>
                  
                  <div className="flex flex-col justify-between flex-1">
                    <div className="flex flex-col items-center text-center justify-center flex-1 space-y-3">
                      {profile.has_original_resume && (
                        <button 
                          onClick={handleDownloadResume}
                          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-xl text-sm font-medium transition-colors"
                        >
                          Download Original Resume
                        </button>
                      )}
                      
                      {profile.resume ? (
                        <button
                          onClick={handleShowResume}
                          className="w-full bg-brand-light-blue hover:bg-brand-light-blue-dark text-black px-4 py-3 rounded-xl text-sm font-medium transition-colors"
                        >
                          Show Resume Text
                        </button>
                      ) : (
                        <p className="text-gray-500 text-sm text-center py-8">No resume uploaded</p>
                      )}
                    </div>
                    
                    <div className="flex justify-center mt-4">
                      <button 
                        onClick={() => router.push('/upload-resume')}
                        className="text-brand-navy hover:text-brand-navy text-sm font-medium transition-all duration-300 cursor-pointer hover:scale-105 hover:-translate-y-0.5 relative group"
                      >
                        Upload New Resume
                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-navy transition-all duration-300 group-hover:w-full"></span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Skills (matches left column height) */}
              <div className="bg-white rounded-2xl shadow-xl p-6 flex flex-col group opacity-0 animate-fade-in-right hover:shadow-2xl transition-shadow" style={{animationDelay: '500ms'}}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-comfortable leading-none">Skills</h2>
                  <div className="flex items-center gap-2">
                    {hasChanges.skills ? (
                      <>
                        <button
                          onClick={() => saveSectionEdit('skills')}
                          className="bg-brand-light-blue hover:bg-brand-light-blue-dark text-black px-4 py-2 rounded-xl text-sm font-medium transition-colors w-20"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => cancelSectionEdit('skills')}
                          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors w-20"
                        >
                          Cancel
                        </button>
                      </>
                    ) : null}
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 min-h-[2rem] content-start flex-1">
                  {(editForm.skills || profile?.skills) && (editForm.skills || profile?.skills)!.length > 0 ? (
                    (editForm.skills || profile?.skills)!.map((skill, index) => (
                      <span
                        key={index}
                        className="bg-white border border-gray-300 text-black px-3 py-2 rounded-full text-sm h-fit flex items-center hover:border-gray-400 transition-colors leading-none"
                      >
                        <span className="flex-1">{skill}</span>
                        {isOwnProfile && (
                          <button
                            onClick={() => deleteSkill(skill)}
                            className="hover:bg-red-500 rounded-full w-4 h-4 flex items-center justify-center text-xs transition-colors ml-2 flex-shrink-0"
                          >
                            ×
                          </button>
                        )}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm leading-none">No skills listed</p>
                  )}
                  {isOwnProfile && (
                    <>
                      {showSkillInput ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={newSkillInput}
                            onChange={(e) => setNewSkillInput(e.target.value)}
                            onKeyDown={handleSkillInputKeyPress}
                            className="px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-light-blue/20 leading-none"
                            placeholder="Enter skill"
                            autoFocus
                          />
                          <button
                            onClick={() => {
                              if (newSkillInput.trim()) {
                                addSkill(newSkillInput);
                              } else {
                                setShowSkillInput(false);
                                setNewSkillInput('');
                              }
                            }}
                            className="bg-green-500 hover:bg-green-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-xs transition-colors flex-shrink-0"
                          >
                            ✓
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowSkillInput(true)}
                          className="bg-brand-light-blue text-black px-3 py-2 rounded-full text-sm h-fit flex items-center justify-center transition-colors hover:bg-brand-light-blue-dark leading-none"
                        >
                          +
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>


          {/* Career Preferences (Own Profile Only) */}
          {profile.preferred_career_types && (
            <div className="bg-white rounded-2xl shadow-xl p-6 group opacity-0 translate-y-4 animate-fade-in-up hover:shadow-2xl transition-shadow" style={{animationDelay: '600ms'}}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-comfortable">Career Interests</h2>
                <div className="flex items-center gap-2">
                  {hasChanges.careers ? (
                    <>
                      <button
                        onClick={() => saveSectionEdit('careers')}
                        className="bg-brand-light-blue hover:bg-brand-light-blue-dark text-black px-4 py-2 rounded-xl text-sm font-medium transition-colors w-20"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => cancelSectionEdit('careers')}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors w-20"
                      >
                        Cancel
                      </button>
                    </>
                  ) : null}
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 min-h-[2rem]">
                {(editForm.preferred_career_types || profile?.preferred_career_types || []).map((career) => (
                  <span
                    key={career.id}
                    className="bg-white border border-gray-300 text-black px-3 py-2 rounded-full text-sm flex items-center hover:border-gray-400 transition-colors"
                  >
                    <span className="flex-1">{career.name}</span>
                    <button
                      onClick={() => {
                        const currentCareers = editForm.preferred_career_types || profile?.preferred_career_types || [];
                        const newCareers = currentCareers.filter(c => c.id !== career.id);
                        setEditForm(prev => ({ ...prev, preferred_career_types: newCareers }));
                        setHasChanges(prev => ({ ...prev, careers: true }));
                      }}
                      className="hover:bg-red-500 rounded-full w-4 h-4 flex items-center justify-center text-xs transition-colors ml-2 flex-shrink-0"
                    >
                      ×
                    </button>
                  </span>
                ))}
                {isOwnProfile && (
                  <>
                    {showCareerSearch ? (
                      <div className="relative flex items-center gap-2">
                        <div className="bg-white border border-gray-300 rounded-full px-3 py-2 text-sm min-w-[300px]">
                          <input
                            type="text"
                            value={careerSearchTerm}
                            onChange={(e) => setCareerSearchTerm(e.target.value)}
                            className="w-full outline-none bg-transparent"
                            placeholder="Search careers..."
                            autoFocus
                          />
                        </div>
                        <button
                          onClick={() => {
                            // Add selected careers
                            if (selectedCareersForAdd.length > 0) {
                              const currentCareers = editForm.preferred_career_types || profile?.preferred_career_types || [];
                              const newCareers = [...currentCareers, ...selectedCareersForAdd];
                              setEditForm(prev => ({ ...prev, preferred_career_types: newCareers }));
                              setHasChanges(prev => ({ ...prev, careers: true }));
                              setSelectedCareersForAdd([]);
                            }
                            setShowCareerSearch(false);
                            setCareerSearchTerm('');
                            setSelectedCareersForAdd([]);
                          }}
                          className="bg-green-500 hover:bg-green-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-xs transition-colors flex-shrink-0"
                        >
                          ✓
                        </button>
                        
                        <div className="absolute top-full left-0 w-[300px] bg-white border border-gray-300 rounded-lg max-h-48 overflow-y-auto mt-1 z-10 shadow-lg">
                          {filteredCareers
                            .filter(career => !(editForm.preferred_career_types || profile?.preferred_career_types || [])?.some(c => c.id === career.id))
                            .slice(0, 10)
                            .map((career) => (
                              <button
                                key={career.id}
                                onClick={() => {
                                  const isSelected = selectedCareersForAdd.some(c => c.id === career.id);
                                  if (isSelected) {
                                    setSelectedCareersForAdd(prev => prev.filter(c => c.id !== career.id));
                                  } else {
                                    setSelectedCareersForAdd(prev => [...prev, career]);
                                  }
                                }}
                                className={`w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors text-sm border-b border-gray-100 last:border-b-0 flex items-center justify-between ${
                                  selectedCareersForAdd.some(c => c.id === career.id) ? 'bg-blue-50' : ''
                                }`}
                              >
                                <span>{career.name}</span>
                                {selectedCareersForAdd.some(c => c.id === career.id) && (
                                  <span className="text-blue-600">✓</span>
                                )}
                              </button>
                            ))}
                          {filteredCareers.filter(career => !(editForm.preferred_career_types || profile?.preferred_career_types || [])?.some(c => c.id === career.id)).length === 0 && (
                            <div className="px-4 py-2 text-gray-500 text-sm">
                              {careerSearchTerm ? `No careers found matching "${careerSearchTerm}"` : 'No more careers available'}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowCareerSearch(true)}
                        className="bg-brand-light-blue text-black px-3 py-2 rounded-full text-sm h-fit flex items-center justify-center transition-colors hover:bg-brand-light-blue-dark leading-none"
                      >
                        +
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
            </>
          )}
        </div>
      </main>

      <Footer />

      {/* Account Management Modal */}
      {showAccountModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-comfortable mb-6">Account Management</h3>
            
            <div className="space-y-6">
              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={accountForm.username}
                  onChange={(e) => {
                    const newUsername = e.target.value;
                    setAccountForm(prev => ({ ...prev, username: newUsername }));
                    
                    // Clear error if field becomes empty
                    if (newUsername.trim() === '') {
                      setAccountErrors(prev => ({ ...prev, username: '' }));
                    } else {
                      // Validate immediately with current value
                      if (newUsername.length < 3) {
                        setAccountErrors(prev => ({ ...prev, username: 'Username must be at least 3 characters' }));
                      } else {
                        setAccountErrors(prev => ({ ...prev, username: '' }));
                      }
                    }
                  }}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:border-brand-navy focus:ring-4 focus:ring-brand-light-blue/20 ${
                    accountErrors.username ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder={currentAccountInfo ? `Current: ${currentAccountInfo.username}` : "Enter username"}
                />
                {accountErrors.username && (
                  <p className="mt-1 text-sm text-red-600">{accountErrors.username}</p>
                )}
              </div>

              {/* Account Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Email
                  <span className="text-gray-500 text-xs block">Your account login email, not profile email</span>
                </label>
                <input
                  type="email"
                  value={accountForm.email}
                  onChange={(e) => {
                    const newEmail = e.target.value;
                    setAccountForm(prev => ({ ...prev, email: newEmail }));
                    
                    // Clear error if field becomes empty
                    if (newEmail.trim() === '') {
                      setAccountErrors(prev => ({ ...prev, email: '' }));
                    } else {
                      // Validate immediately with current value
                      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
                      if (!emailRegex.test(newEmail)) {
                        setAccountErrors(prev => ({ ...prev, email: 'Please enter a valid email address' }));
                      } else {
                        setAccountErrors(prev => ({ ...prev, email: '' }));
                      }
                    }
                  }}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:border-brand-navy focus:ring-4 focus:ring-brand-light-blue/20 ${
                    accountErrors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder={currentAccountInfo ? `Current: ${currentAccountInfo.email}` : "Enter email"}
                />
                {accountErrors.email && (
                  <p className="mt-1 text-sm text-red-600">{accountErrors.email}</p>
                )}
              </div>

              {/* Update Username/Email Button */}
              <div className="flex justify-end">
                <button
                  onClick={handleAccountInfoUpdate}
                  disabled={isUpdatingAccount || !isAccountInfoUpdateValid}
                  className={`px-4 py-2 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    isAccountInfoUpdateValid && !isUpdatingAccount
                      ? 'bg-brand-light-blue hover:bg-brand-light-blue-dark text-black'
                      : 'bg-gray-300 text-gray-500'
                  }`}
                >
                  {isUpdatingAccount ? 'Updating...' : 'Update Account Info'}
                </button>
              </div>

              {/* Password Change Section */}
              <div className="border-t pt-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h4>
                
                {/* Current Password */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={accountForm.oldPassword}
                    onChange={(e) => {
                      setAccountForm(prev => ({ ...prev, oldPassword: e.target.value }));
                      // Clear error if field becomes empty
                      if (e.target.value.trim() === '') {
                        setAccountErrors(prev => ({ ...prev, oldPassword: '' }));
                      }
                    }}
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:border-brand-navy focus:ring-4 focus:ring-brand-light-blue/20 ${
                      accountErrors.oldPassword ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Leave empty to keep current password"
                  />
                  {accountErrors.oldPassword && (
                    <p className="mt-1 text-sm text-red-600">{accountErrors.oldPassword}</p>
                  )}
                </div>

                {/* New Password */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={accountForm.newPassword}
                    onChange={(e) => {
                      const newPassword = e.target.value;
                      setAccountForm(prev => ({ ...prev, newPassword }));
                      
                      // Clear error if field becomes empty
                      if (newPassword.trim() === '') {
                        setAccountErrors(prev => ({ ...prev, newPassword: '' }));
                        setPasswordRequirements({
                          length: false,
                          uppercase: false,
                          lowercase: false,
                          number: false,
                          symbol: false
                        });
                      } else {
                        // Validate immediately with current value
                        validatePasswordForm(newPassword);
                      }
                    }}
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:border-brand-navy focus:ring-4 focus:ring-brand-light-blue/20 ${
                      accountErrors.newPassword ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter new password"
                  />
                  {accountErrors.newPassword && (
                    <p className="mt-1 text-sm text-red-600">{accountErrors.newPassword}</p>
                  )}

                  {/* Password Requirements */}
                  {accountForm.newPassword && (
                    <div className="mt-2 space-y-1">
                      <div className="mb-2">
                        <div className={`flex items-center text-xs ${
                          passwordRequirements.length ? 'text-green-600' : 'text-red-500'
                        }`}>
                          <span className="mr-1">{passwordRequirements.length ? '✓' : '✗'}</span>
                          At least 6 characters
                        </div>
                      </div>
                      <p className="text-xs text-gray-600">Plus at least 2 of the following:</p>
                      <div className="grid grid-cols-2 gap-1 text-xs">
                        <div className={`flex items-center ${passwordRequirements.uppercase ? 'text-green-600' : 'text-gray-400'}`}>
                          <span className="mr-1">{passwordRequirements.uppercase ? '✓' : '○'}</span>
                          Uppercase letter
                        </div>
                        <div className={`flex items-center ${passwordRequirements.lowercase ? 'text-green-600' : 'text-gray-400'}`}>
                          <span className="mr-1">{passwordRequirements.lowercase ? '✓' : '○'}</span>
                          Lowercase letter
                        </div>
                        <div className={`flex items-center ${passwordRequirements.number ? 'text-green-600' : 'text-gray-400'}`}>
                          <span className="mr-1">{passwordRequirements.number ? '✓' : '○'}</span>
                          Number
                        </div>
                        <div className={`flex items-center ${passwordRequirements.symbol ? 'text-green-600' : 'text-gray-400'}`}>
                          <span className="mr-1">{passwordRequirements.symbol ? '✓' : '○'}</span>
                          Special character
                        </div>
                      </div>
                      <p className={`text-xs mt-1 ${
                        (() => {
                          const optionalMet = [passwordRequirements.uppercase, passwordRequirements.lowercase, passwordRequirements.number, passwordRequirements.symbol].filter(Boolean).length;
                          return optionalMet >= 2 && passwordRequirements.length ? 'text-green-600' : 'text-gray-500';
                        })()
                      }`}>
                        {[passwordRequirements.uppercase, passwordRequirements.lowercase, passwordRequirements.number, passwordRequirements.symbol].filter(Boolean).length}/4 optional requirements met
                      </p>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={accountForm.confirmPassword}
                    onChange={(e) => {
                      const confirmPassword = e.target.value;
                      setAccountForm(prev => ({ ...prev, confirmPassword }));
                      
                      // Clear error if field becomes empty
                      if (confirmPassword.trim() === '') {
                        setAccountErrors(prev => ({ ...prev, confirmPassword: '' }));
                      } else {
                        // Validate immediately with current value
                        validatePasswordForm(accountForm.newPassword, confirmPassword);
                      }
                    }}
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:border-brand-navy focus:ring-4 focus:ring-brand-light-blue/20 ${
                      accountErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Confirm new password"
                  />
                  {accountErrors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{accountErrors.confirmPassword}</p>
                  )}
                </div>
                
                {/* Update Password Button */}
                <div className="flex justify-end mt-4">
                  <button
                    onClick={handlePasswordUpdate}
                    disabled={isUpdatingAccount || !isPasswordUpdateValid}
                    className={`px-4 py-2 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      isPasswordUpdateValid && !isUpdatingAccount
                        ? 'bg-brand-light-blue hover:bg-brand-light-blue-dark text-black'
                        : 'bg-gray-300 text-gray-500'
                    }`}
                  >
                    {isUpdatingAccount ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </div>
            </div>

            {/* Close Button */}
            <div className="flex justify-end mt-8">
              <button
                onClick={() => {
                  setShowAccountModal(false);
                  // Reset form to current values
                  if (currentAccountInfo) {
                    setAccountForm(prev => ({
                      ...prev,
                      username: currentAccountInfo.username,
                      email: currentAccountInfo.email,
                      oldPassword: '',
                      newPassword: '',
                      confirmPassword: ''
                    }));
                  }
                  setAccountErrors({});
                }}
                className="px-6 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                disabled={isUpdatingAccount}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Prompt Popup */}
      {showPromptPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-comfortable mb-4">Customize AI Prompt</h3>
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-light-blue"
              rows={4}
              placeholder="Enter a custom prompt for AI to generate highlights (e.g., 'Focus on leadership experience and technical skills')"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => handleUpdateHighlights(customPrompt)}
                className="flex-1 bg-brand-light-blue hover:bg-brand-light-blue-dark text-white px-4 py-2 rounded-lg transition-colors"
              >
                Generate
              </button>
              <button
                onClick={() => handleUpdateHighlights()}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Use Default
              </button>
              <button
                onClick={() => {
                  setShowPromptPopup(false);
                  setCustomPrompt('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resume Modal */}
      {showResumeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-comfortable">Resume Text</h3>
              <button
                onClick={() => setShowResumeModal(false)}
                className="hover:bg-gray-100 rounded-full p-2 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="bg-gray-50 p-4 rounded-lg">
                {profile?.resume ? (
                  <div className="prose prose-sm max-w-none prose-headings:text-gray-800 prose-headings:font-bold prose-h1:text-lg prose-h1:border-b-2 prose-h1:border-gray-400 prose-h1:pb-1 prose-h1:mt-6 prose-h1:mb-3 prose-h2:text-base prose-h2:border-b prose-h2:border-gray-300 prose-h2:pb-1 prose-h2:mt-4 prose-h2:mb-2 prose-p:text-gray-700 prose-p:text-sm prose-p:leading-relaxed prose-p:mb-2 prose-ul:text-gray-700 prose-ul:text-sm prose-li:mb-1 prose-strong:font-semibold prose-a:text-blue-600 prose-a:hover:underline">
                    <ReactMarkdown>{profile.resume}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm text-center py-8">No resume content available</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {error && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 opacity-0 -translate-y-4 animate-fade-in-down">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Error</h3>
            </div>
            <p className="text-gray-700 mb-6">{error}</p>
            <div className="flex justify-end">
              <button
                onClick={() => setError(null)}
                className="bg-brand-light-blue hover:bg-brand-light-blue-dark text-black px-4 py-2 rounded-xl transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification */}
      {notification && (
        <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-3 rounded-lg shadow-lg z-50 flex items-center gap-3">
          <span>{notification.message}</span>
          {notification.action && (
            <button
              onClick={() => {
                notification.action?.();
                setNotification(null);
              }}
              className="bg-brand-light-blue hover:bg-brand-light-blue-dark px-3 py-1 rounded text-sm transition-colors"
            >
              Undo
            </button>
          )}
          <button
            onClick={() => setNotification(null)}
            className="hover:bg-gray-700 rounded p-1 transition-colors"
          >
            ×
          </button>
        </div>
      )}
      </div>
    </>
  );
}