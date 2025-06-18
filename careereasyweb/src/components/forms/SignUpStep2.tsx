'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useSignUp } from '@/contexts/SignUpContext';
import ProgressIndicator from './ProgressIndicator';
import StateProvinceSelect from './StateProvinceSelect';
import CitySelect from './CitySelect';
import JobTitlesMultiSelect from './JobTitlesMultiSelect';

export default function SignUpStep2() {
  const router = useRouter();
  const { formData, errors, updateFormData, updateErrors, isStepValid, canAccessStep } = useSignUp();

  // Check if user can access this step, redirect if not
  useEffect(() => {
    if (!canAccessStep(2)) {
      router.replace('/signup/step-1');
    }
  }, [canAccessStep, router]);

  const validateCountry = (country: string): string | undefined => {
    if (!country) return 'Country is required';
    if (!['United States', 'Canada'].includes(country)) return 'Please select United States or Canada';
    return undefined;
  };

  const validateState = (state: string): string | undefined => {
    if (!state) return 'State/Province is required';
    return undefined;
  };

  const validateCity = (city: string): string | undefined => {
    if (!city) return 'City is required';
    if (city.length < 2) return 'Please enter a valid city';
    return undefined;
  };

  const validateDesiredJobTitles = (titles: number[]): string | undefined => {
    if (titles.length === 0) return 'Please select at least one desired job title';
    return undefined;
  };

  const handleInputChange = (field: keyof typeof formData, value: string | number[]) => {
    updateFormData(field, value);

    let error: string | undefined;
    switch (field) {
      case 'country':
        error = validateCountry(value as string);
        // Reset state and city when country changes
        if (formData.state) {
          updateFormData('state', '');
          updateErrors('state', undefined);
        }
        if (formData.city) {
          updateFormData('city', '');
          updateErrors('city', undefined);
        }
        break;
      case 'state':
        error = validateState(value as string);
        // Reset city when state changes
        if (formData.city) {
          updateFormData('city', '');
          updateErrors('city', undefined);
        }
        break;
      case 'city':
        error = validateCity(value as string);
        break;
      case 'desiredJobTitles':
        error = validateDesiredJobTitles(value as number[]);
        break;
    }

    updateErrors(field, error);
  };

  const getInputClassName = (field: keyof typeof formData): string => {
    const hasError = errors[field] && (
      field === 'desiredJobTitles' 
        ? formData.desiredJobTitles.length === 0
        : formData[field as keyof typeof formData]
    );
    return `w-full px-4 py-3 border rounded-xl transition-all duration-300 transform hover:scale-[1.02] focus:scale-[1.02] ${
      hasError 
        ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-200' 
        : 'border-gray-300 focus:border-brand-navy focus:ring-brand-light-blue/20'
    } focus:ring-4 focus:outline-none`;
  };

  const handleNext = () => {
    if (isStepValid(2)) {
      router.push('/signup/step-3');
    }
  };

  const handleBack = () => {
    router.push('/signup/step-1');
  };

  const countryOptions = [
    { value: '', label: 'Select your country' },
    { value: 'United States', label: 'United States' },
    { value: 'Canada', label: 'Canada' }
  ];

  return (
    <motion.section 
      className="pt-24 pb-16 lg:pt-32 lg:pb-20 min-h-screen relative"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
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
              Location & Career Goals
            </h1>
            <p className="hero-subtitle text-comfortable">
              Tell us where you&apos;d like to work and what roles interest you
            </p>
          </motion.div>

          {/* Progress Indicator */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <ProgressIndicator currentStep={2} totalSteps={3} />
          </motion.div>

          {/* Form */}
          <motion.div 
            className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8"
            initial={{ y: 30, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div className="space-y-6">
              {/* Country */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.8 }}
              >
                <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                  Country
                </label>
                <select
                  id="country"
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  className={getInputClassName('country')}
                >
                  {countryOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.country && formData.country && (
                  <motion.p 
                    className="mt-1 text-sm text-red-600"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {errors.country}
                  </motion.p>
                )}
              </motion.div>

              {/* State/Province */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.9 }}
              >
                <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                  {formData.country === 'United States' ? 'State' : formData.country === 'Canada' ? 'Province' : 'State/Province'}
                </label>
                <StateProvinceSelect
                  value={formData.state}
                  onChange={(value) => handleInputChange('state', value)}
                  country={formData.country}
                  className={getInputClassName('state')}
                  placeholder={formData.country ? 'Select state/province' : 'Please select a country first'}
                />
                {errors.state && formData.state && (
                  <motion.p 
                    className="mt-1 text-sm text-red-600"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {errors.state}
                  </motion.p>
                )}
              </motion.div>

              {/* City */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 1.0 }}
              >
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <CitySelect
                  value={formData.city}
                  onChange={(value) => handleInputChange('city', value)}
                  country={formData.country}
                  state={formData.state}
                  className={getInputClassName('city')}
                  placeholder={formData.state ? 'Search or select your city' : 'Please select a state/province first'}
                />
                {errors.city && formData.city && (
                  <motion.p 
                    className="mt-1 text-sm text-red-600"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {errors.city}
                  </motion.p>
                )}
              </motion.div>

              {/* Desired Job Titles */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 1.1 }}
              >
                <label htmlFor="desiredJobTitles" className="block text-sm font-medium text-gray-700 mb-2">
                  Desired Job Titles
                </label>
                <JobTitlesMultiSelect
                  value={formData.desiredJobTitles}
                  onChange={(value) => handleInputChange('desiredJobTitles', value)}
                  className={getInputClassName('desiredJobTitles')}
                  placeholder="Search and select job titles you're interested in"
                />
                {errors.desiredJobTitles && (
                  <motion.p 
                    className="mt-1 text-sm text-red-600"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {errors.desiredJobTitles}
                  </motion.p>
                )}
              </motion.div>
            </div>

            {/* Navigation Buttons */}
            <motion.div 
              className="flex justify-between mt-8"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 1.3 }}
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
                disabled={!isStepValid(2)}
                className={`px-6 py-3 font-medium rounded-xl transition-all duration-300 ${
                  isStepValid(2)
                    ? 'bg-brand-light-blue hover:bg-brand-light-blue-dark text-black hover:scale-105 shadow-lg hover:shadow-xl'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                whileHover={isStepValid(2) ? { scale: 1.05 } : {}}
                whileTap={isStepValid(2) ? { scale: 0.95 } : {}}
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