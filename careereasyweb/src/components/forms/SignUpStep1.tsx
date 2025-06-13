'use client';

import { useRouter } from 'next/navigation';
import { useSignUp } from '@/contexts/SignUpContext';
import ProgressIndicator from './ProgressIndicator';
import JobTitleSelect from './JobTitleSelect';

export default function SignUpStep1() {
  const router = useRouter();
  const { formData, errors, updateFormData, updateErrors, isStepValid } = useSignUp();

  const validateName = (name: string): string | undefined => {
    if (!name) return undefined;
    if (!/^[a-zA-Z\s\-']+$/.test(name)) return 'Name can only contain letters, spaces, hyphens, and apostrophes';
    return undefined;
  };

  const validateEmail = (email: string): string | undefined => {
    if (!email) return undefined; // Optional field
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return undefined;
  };

  const validateTitle = (title: string): string | undefined => {
    if (!title) return 'Job title is required';
    if (title.length < 2) return 'Job title must be at least 2 characters';
    return undefined;
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    updateFormData(field, value);

    let error: string | undefined;
    switch (field) {
      case 'firstName':
      case 'lastName':
        error = validateName(value);
        break;
      case 'middleName':
        // Optional field, only validate if not empty
        error = value ? validateName(value) : undefined;
        break;
      case 'workEmail':
        error = validateEmail(value);
        break;
      case 'title':
        error = validateTitle(value);
        break;
    }

    updateErrors(field, error);
  };

  const getInputClassName = (field: keyof typeof formData): string => {
    const hasError = errors[field] && formData[field];
    return `w-full px-4 py-3 border rounded-xl transition-all duration-300 ${
      hasError 
        ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-200' 
        : 'border-gray-300 focus:border-brand-navy focus:ring-brand-light-blue/20'
    } focus:ring-4 focus:outline-none`;
  };

  const handleNext = () => {
    if (isStepValid(1)) {
      router.push('/signup/step-2');
    }
  };

  const handleBack = () => {
    router.push('/');
  };

  return (
    <section className="pt-24 pb-16 lg:pt-32 lg:pb-20 min-h-screen relative">
      <div className="container-max section-padding relative z-10">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="hero-title text-comfortable mb-4">
              Personal Information
            </h1>
            <p className="hero-subtitle text-comfortable">
              Tell us a bit about yourself
            </p>
          </div>

          {/* Progress Indicator */}
          <ProgressIndicator currentStep={1} totalSteps={3} />

          {/* Form */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <div className="space-y-6">
              {/* First Name */}
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className={getInputClassName('firstName')}
                  placeholder="Enter your first name"
                />
                {errors.firstName && formData.firstName && (
                  <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                )}
              </div>

              {/* Middle Name */}
              <div>
                <label htmlFor="middleName" className="block text-sm font-medium text-gray-700 mb-2">
                  Middle Name <span className="text-gray-500 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  id="middleName"
                  value={formData.middleName}
                  onChange={(e) => handleInputChange('middleName', e.target.value)}
                  className={getInputClassName('middleName')}
                  placeholder="Enter your middle name"
                />
                {errors.middleName && formData.middleName && (
                  <p className="mt-1 text-sm text-red-600">{errors.middleName}</p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className={getInputClassName('lastName')}
                  placeholder="Enter your last name"
                />
                {errors.lastName && formData.lastName && (
                  <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                )}
              </div>

              {/* Work Email */}
              <div>
                <label htmlFor="workEmail" className="block text-sm font-medium text-gray-700 mb-2">
                  Work Email <span className="text-gray-500 font-normal">(Optional)</span>
                </label>
                <input
                  type="email"
                  id="workEmail"
                  value={formData.workEmail}
                  onChange={(e) => handleInputChange('workEmail', e.target.value)}
                  className={getInputClassName('workEmail')}
                  placeholder="Enter your work email"
                />
                <p className="mt-1 text-xs text-gray-500">
                  This email will be shown to employers. If left blank, your primary email will be used instead.
                </p>
                {errors.workEmail && formData.workEmail && (
                  <p className="mt-1 text-sm text-red-600">{errors.workEmail}</p>
                )}
              </div>

              {/* Job Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Job Title
                </label>
                <JobTitleSelect
                  value={formData.title}
                  onChange={(value) => handleInputChange('title', value)}
                  className={getInputClassName('title')}
                  placeholder="Search or select your job title"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                )}
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <button
                type="button"
                onClick={handleBack}
                className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all duration-300 hover:scale-105"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={!isStepValid(1)}
                className={`px-6 py-3 font-medium rounded-xl transition-all duration-300 ${
                  isStepValid(1)
                    ? 'bg-brand-light-blue hover:bg-brand-light-blue-dark text-black hover:scale-105 shadow-lg hover:shadow-xl'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}