'use client';

import { ChangeEvent } from 'react';
import Image from 'next/image';
import StateProvinceSelect from '@/components/forms/StateProvinceSelect';
import CitySelect from '@/components/forms/CitySelect';
import JobTitleSelect from '@/components/forms/JobTitleSelect';

interface Career {
  id: string;
  name: string;
}

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

interface ProfileHeaderCardProps {
  profile: CandidateProfile;
  isOwnProfile: boolean;
  isEditing: boolean;
  editForm: Partial<CandidateProfile>;
  personalErrors: {[key: string]: string};
  isPersonalFormValid: boolean;
  isUploadingProfilePic: boolean;
  firstName: string;
  middleName: string;
  lastName: string;
  editCountry: string;
  editState: string;
  editCity: string;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onFieldChange: (field: string, value: string) => void;
  onProfilePicChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onCountryChange: (value: string) => void;
  onStateChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onBack: () => void;
}

export default function ProfileHeaderCard({
  profile,
  isOwnProfile,
  isEditing,
  editForm,
  personalErrors,
  isPersonalFormValid,
  isUploadingProfilePic,
  firstName,
  middleName,
  lastName,
  editCountry,
  editState,
  editCity,
  onEdit,
  onSave,
  onCancel,
  onFieldChange,
  onProfilePicChange,
  onCountryChange,
  onStateChange,
  onCityChange,
  onBack
}: ProfileHeaderCardProps) {

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 hover:shadow-2xl transition-shadow relative">
      {/* Back Button - Top Left */}
      <button
        onClick={onBack}
        className="absolute top-4 left-4 p-2 hover:bg-gray-100 rounded-full transition-all group z-10"
        aria-label="Go back"
      >
        <svg className="w-5 h-5 text-gray-600 group-hover:text-gray-800 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
      </button>

      <div className="flex flex-col lg:flex-row items-start gap-8">
        {/* Profile Picture - Left Side */}
        <div className="relative group flex-shrink-0">
          {profile.profile_pic && profile.profile_pic.trim() !== '' ? (
            <div className="w-32 h-32 lg:w-40 lg:h-40 relative cursor-pointer" onClick={() => isOwnProfile && document.getElementById('profile-pic-upload')?.click()}>
              <Image
                src={profile.profile_pic}
                alt={`${profile.name || 'Profile'} picture`}
                fill
                className="object-cover rounded-full border-4 border-white shadow-lg"
                sizes="(max-width: 1024px) 128px, 160px"
              />
              {/* Edit Overlay for Own Profile */}
              {isOwnProfile && (
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {isUploadingProfilePic ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Uploading...</span>
                      </div>
                    ) : (
                      'Change Photo'
                    )}
                  </span>
                </div>
              )}
              <input
                id="profile-pic-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onProfilePicChange}
                disabled={isUploadingProfilePic}
              />
            </div>
          ) : (
            <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-full bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center border-4 border-white shadow-lg relative group cursor-pointer" onClick={() => isOwnProfile && document.getElementById('profile-pic-upload')?.click()}>
              <span className="text-4xl lg:text-5xl font-bold text-blue-600">
                {(profile.name || profile.first_name || 'U').charAt(0).toUpperCase()}
              </span>
              {/* Edit Overlay for Own Profile */}
              {isOwnProfile && (
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {isUploadingProfilePic ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Uploading...</span>
                      </div>
                    ) : (
                      'Add Photo'
                    )}
                  </span>
                </div>
              )}
              <input
                id="profile-pic-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onProfilePicChange}
                disabled={isUploadingProfilePic}
              />
            </div>
          )}
        </div>

        {/* Profile Information - Right Side */}
        <div className="flex-1 relative">
          {/* Edit Button - Most Top Right */}
          {isOwnProfile && !isEditing && (
            <button
              onClick={onEdit}
              className="absolute top-0 right-0 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </button>
          )}

          {!isEditing ? (
            // Display Mode
            <div className="pt-12">
              {/* Name - Top Right */}
              <div className="mb-6">
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
                  {profile.name || `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'No name provided'}
                </h1>
              </div>

              {/* Contact Info - Bottom Right */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-600">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
                  </svg>
                  <span>{profile.title || 'No title set'}</span>
                </div>

                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{profile.location || 'Location not set'}</span>
                </div>

                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>{profile.email || 'Email not set'}</span>
                </div>

                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>{profile.phone || 'Phone not set'}</span>
                </div>
              </div>
            </div>
          ) : (
            // Edit Mode
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Personal Information</h2>
                
                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => onFieldChange('firstName', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        personalErrors.firstName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter first name"
                    />
                    {personalErrors.firstName && <p className="text-red-500 text-xs mt-1">{personalErrors.firstName}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Middle Name</label>
                    <input
                      type="text"
                      value={middleName}
                      onChange={(e) => onFieldChange('middleName', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        personalErrors.middleName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter middle name (optional)"
                    />
                    {personalErrors.middleName && <p className="text-red-500 text-xs mt-1">{personalErrors.middleName}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => onFieldChange('lastName', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        personalErrors.lastName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter last name"
                    />
                    {personalErrors.lastName && <p className="text-red-500 text-xs mt-1">{personalErrors.lastName}</p>}
                  </div>
                </div>

                {/* Job Title */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
                  <JobTitleSelect
                    value={editForm.title || ''}
                    onChange={(value) => onFieldChange('title', value)}
                    placeholder="Select or enter your job title"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      personalErrors.title ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {personalErrors.title && <p className="text-red-500 text-xs mt-1">{personalErrors.title}</p>}
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input
                      type="email"
                      value={editForm.email || ''}
                      onChange={(e) => onFieldChange('email', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        personalErrors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter your email"
                    />
                    {personalErrors.email && <p className="text-red-500 text-xs mt-1">{personalErrors.email}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={editForm.phone || ''}
                      onChange={(e) => onFieldChange('phone', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        personalErrors.phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="(555) 123-4567"
                    />
                    {personalErrors.phone && <p className="text-red-500 text-xs mt-1">{personalErrors.phone}</p>}
                  </div>
                </div>

                {/* Location */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <div className="space-y-3">
                    {/* Country */}
                    <div>
                      <select
                        value={editCountry}
                        onChange={(e) => onCountryChange(e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          personalErrors.country ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="Select country">Select your country</option>
                        <option value="United States">United States</option>
                        <option value="Canada">Canada</option>
                      </select>
                      {personalErrors.country && <p className="text-red-500 text-xs mt-1">{personalErrors.country}</p>}
                    </div>
                    
                    {/* State/Province and City */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">State/Province *</label>
                        <StateProvinceSelect
                          country={editCountry}
                          value={editState}
                          onChange={onStateChange}
                          placeholder={editCountry !== 'Select country' ? 'Select state/province' : 'Please select a country first'}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${personalErrors.state ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {personalErrors.state && <p className="text-red-500 text-xs mt-1">{personalErrors.state}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                        <CitySelect
                          country={editCountry}
                          state={editState}
                          value={editCity}
                          onChange={onCityChange}
                          placeholder="Select city"
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${personalErrors.city ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {personalErrors.city && <p className="text-red-500 text-xs mt-1">{personalErrors.city}</p>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  onClick={onSave}
                  disabled={!isPersonalFormValid}
                  className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                    isPersonalFormValid
                      ? 'bg-green-600 hover:bg-green-700 text-white hover:scale-105 active:scale-95'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Save Changes
                </button>
                
                <button
                  onClick={onCancel}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}