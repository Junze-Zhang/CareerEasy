'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
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
  const params = useParams();
  const candidateId = params.candidateId as string;
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
  const [profilePicFile, setProfilePicFile] = useState<File | null>(null);
  const [profilePicPreview, setProfilePicPreview] = useState<string | null>(null);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [careerSearchTerm, setCareerSearchTerm] = useState('');
  const [editCountry, setEditCountry] = useState('Select country');
  const [editState, setEditState] = useState('');
  const [editCity, setEditCity] = useState('');
  const [showCareerSearch, setShowCareerSearch] = useState(false);
  const [selectedCareersForAdd, setSelectedCareersForAdd] = useState<Career[]>([]);
  const [personalErrors, setPersonalErrors] = useState<{[key: string]: string}>({});
  const [isPersonalFormValidState, setIsPersonalFormValidState] = useState(true);

  useEffect(() => {
    fetchProfile();
    checkIsOwnProfile();
    fetchCareers();
  }, [candidateId]);

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
      
      setIsOwnProfile(candidateIdCookie === candidateId);
    }
  };

  const fetchProfile = async () => {
    try {
      const response = await candidateAPI.candidateInfo(candidateId);
      setProfile(response.data);
      setEditForm(response.data);
      
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
      setError(err instanceof Error ? err.message : 'An error occurred');
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
        // Handle profile picture upload if changed
        if (profilePicFile) {
          // Note: Profile picture upload would need form data and different API endpoint
          // This is a placeholder for the profile picture upload logic
        }
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
            title: editForm.title,
            email: editForm.email,
            phone: editForm.phone?.replace(/\D/g, ''), // Store unformatted phone
            location: formattedLocation,
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
      setError(err instanceof Error ? err.message : 'Failed to save changes');
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
      setProfilePicFile(null);
      setProfilePicPreview(null);
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
      setError(err instanceof Error ? err.message : 'Failed to update highlights');
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

  const handleShowResume = async () => {
    if (!profile) return;
    
    if (profile.has_original_resume) {
      // Download original file
      try {
        const response = await candidateAPI.downloadResume();
        const blob = new Blob([response.data]);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'resume';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } catch (error) {
        console.error('Failed to download resume:', error);
        setError('Failed to download resume file');
      }
    } else {
      // Show plain text/markdown in modal
      setShowResumeModal(true);
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

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-sky-50">
        <Navbar />
        <div className="flex items-center justify-center pt-32">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error || 'Profile not found'}</p>
            <Link href="/" className="text-brand-navy hover:underline">
              Return to home
            </Link>
          </div>
        </div>
      </div>
    );
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
      setProfilePicFile(file);
      const previewUrl = URL.createObjectURL(file);
      setProfilePicPreview(previewUrl);
      setHasChanges(prev => ({ ...prev, personal: true }));
    }
  };

  const removeProfilePic = () => {
    setProfilePicFile(null);
    setProfilePicPreview(null);
    setHasChanges(prev => ({ ...prev, personal: true }));
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

  // Filter careers based on search term
  const filteredCareers = allCareers.filter(career =>
    career.name.toLowerCase().includes(careerSearchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-sky-50 relative overflow-hidden">
      <AbstractLines />
      <Navbar />
      
      <main className="pt-24 pb-16 relative z-10">
        <div className="max-w-4xl mx-auto px-4">
          {/* Profile Header */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
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
                <div className="w-24 h-24 relative">
                  {editingSections.personal && isOwnProfile ? (
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProfilePicChange}
                        className="hidden"
                        id="profile-pic-upload"
                      />
                      <label
                        htmlFor="profile-pic-upload"
                        className="cursor-pointer block w-24 h-24 rounded-full border-2 border-dashed border-gray-300 hover:border-brand-light-blue transition-colors flex items-center justify-center bg-gray-50 hover:bg-gray-100"
                      >
                        <Image
                          src={profilePicPreview || profile.profile_pic}
                          alt={`${profile.name} profile`}
                          fill
                          className="object-cover rounded-full opacity-75 hover:opacity-90 transition-opacity"
                          sizes="96px"
                        />
                      </label>
                      {profilePicPreview && (
                        <button
                          onClick={removeProfilePic}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ) : (
                    <Image
                      src={profile.profile_pic}
                      alt={`${profile.name} profile`}
                      fill
                      className="object-cover rounded-full"
                      sizes="96px"
                    />
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

          {/* Additional Information (Own Profile Only) */}
          {isOwnProfile && profile.experience_months !== undefined && (
            <>
              {/* Account Management Card - Mobile first, then desktop positioning */}
              <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 md:hidden space-y-6">
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
                  <div className="hidden md:block bg-white rounded-2xl shadow-xl p-6 space-y-6">
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
                <div className="bg-white rounded-2xl shadow-xl p-6 flex-1 flex flex-col group">
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
                  
                  <div className="flex flex-col justify-between flex-1">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 leading-none mb-2">
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
                        <p className="text-gray-600 text-sm leading-none">
                          {formatExperience(profile.experience_months)}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 leading-none mb-2">
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
                        <p className="text-gray-600 text-sm leading-none">
                          {profile.highest_education || 'Not specified'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Resume */}
                <div className="bg-white rounded-2xl shadow-xl p-6 flex-1 flex flex-col">
                  <h2 className="text-lg font-bold text-comfortable leading-none mb-2">Resume</h2>
                  
                  <div className="flex flex-col justify-between flex-1">
                    <div className="flex flex-col items-center text-center justify-center flex-1">
                      {profile.has_original_resume && (
                        <div className="flex items-center gap-2 text-sm text-green-600 leading-none mb-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Original file available
                        </div>
                      )}
                      
                      {profile.resume ? (
                        <button
                          onClick={handleShowResume}
                          className="bg-brand-light-blue hover:bg-brand-light-blue-dark text-black px-6 py-3 rounded-xl text-sm font-medium transition-colors leading-none"
                        >
                          Show Resume
                        </button>
                      ) : (
                        <p className="text-gray-500 text-sm leading-none">No resume uploaded</p>
                      )}
                    </div>
                    
                    <div className="flex justify-center">
                      <button className="text-brand-navy hover:text-brand-light-blue text-sm font-medium leading-none">
                        Upload New Resume
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Skills (matches left column height) */}
              <div className="bg-white rounded-2xl shadow-xl p-6 flex flex-col group">
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

          {/* Highlights */}
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
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
                      Updating...
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

          {/* Career Preferences (Own Profile Only) */}
          {profile.preferred_career_types && (
            <div className="bg-white rounded-2xl shadow-xl p-6 group">
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
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-comfortable mb-4">Account Management</h3>
            <p className="text-gray-600 mb-6">Account management features will be implemented later.</p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowAccountModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
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
              <h3 className="text-lg font-bold text-comfortable">Resume</h3>
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
              <pre className="whitespace-pre-wrap text-sm text-gray-700 bg-gray-50 p-4 rounded-lg">
                {profile?.resume || 'No resume content available'}
              </pre>
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
  );
}