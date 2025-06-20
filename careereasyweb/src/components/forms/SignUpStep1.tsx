'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSignUp } from '@/contexts/SignUpContext';
import { isAuthenticated } from '@/utils/auth';
import ProgressIndicator from './ProgressIndicator';
import JobTitleSelect from './JobTitleSelect';

export default function SignUpStep1() {
  const router = useRouter();
  const { formData, errors, updateFormData, updateErrors, isStepValid } = useSignUp();

  // Check if user is already authenticated and redirect to profile
  useEffect(() => {
    if (isAuthenticated()) {
      const candidateId = document.cookie
        .split('; ')
        .find(row => row.startsWith('candidate_id='))
        ?.split('=')[1];
      
      if (candidateId) {
        router.replace(`/${candidateId}`);
      }
    }
  }, [router]);

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
    return `w-full px-4 py-3 border rounded-xl transition-all duration-300 transform hover:scale-[1.02] focus:scale-[1.02] ${
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
    <motion.section 
      className="pt-24 pb-16 lg:pt-32 lg:pb-20 min-h-screen relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="container-max section-padding relative z-10">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <motion.div 
            className="text-center mb-8"
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h1 className="hero-title text-comfortable mb-4">
              Personal Information
            </h1>
            <p className="hero-subtitle text-comfortable">
              Tell us a bit about yourself
            </p>
          </motion.div>

          {/* Progress Indicator */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <ProgressIndicator currentStep={1} totalSteps={3} />
          </motion.div>

          {/* Form */}
          <motion.div 
            className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8"
            initial={{ y: 30, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div className="space-y-6">
              {/* First Name */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.8 }}
              >
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
                  <motion.p 
                    className="mt-1 text-sm text-red-600"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {errors.firstName}
                  </motion.p>
                )}
              </motion.div>

              {/* Middle Name */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.9 }}
              >
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
                  <motion.p 
                    className="mt-1 text-sm text-red-600"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {errors.middleName}
                  </motion.p>
                )}
              </motion.div>

              {/* Last Name */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 1.0 }}
              >
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
                  <motion.p 
                    className="mt-1 text-sm text-red-600"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {errors.lastName}
                  </motion.p>
                )}
              </motion.div>

              {/* Work Email */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 1.1 }}
              >
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
                  This email will be shown to employers. If left blank, your account email will be used instead.
                </p>
                {errors.workEmail && formData.workEmail && (
                  <motion.p 
                    className="mt-1 text-sm text-red-600"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {errors.workEmail}
                  </motion.p>
                )}
              </motion.div>

              {/* Job Title */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 1.2 }}
              >
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
                  <motion.p 
                    className="mt-1 text-sm text-red-600"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {errors.title}
                  </motion.p>
                )}
              </motion.div>
            </div>

            {/* Navigation Buttons */}
            <motion.div 
              className="flex justify-between mt-8"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 1.4 }}
            >
              <motion.button
                type="button"
                onClick={handleBack}
                className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all duration-300 hover:scale-105"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Back
              </motion.button>
              <motion.button
                type="button"
                onClick={handleNext}
                disabled={!isStepValid(1)}
                className={`px-6 py-3 font-medium rounded-xl transition-all duration-300 ${
                  isStepValid(1)
                    ? 'bg-brand-light-blue hover:bg-brand-light-blue-dark text-black hover:scale-105 shadow-lg hover:shadow-xl'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                whileHover={isStepValid(1) ? { scale: 1.05 } : {}}
                whileTap={isStepValid(1) ? { scale: 0.95 } : {}}
              >
                Next
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}