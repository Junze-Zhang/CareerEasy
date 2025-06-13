'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { EyeIcon, EyeSlashIcon, CheckCircleIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { useSignUp } from '@/contexts/SignUpContext';
import ProgressIndicator from './ProgressIndicator';

export default function SignUpStep3() {
  const router = useRouter();
  const {
    formData,
    errors,
    passwordRequirements,
    updateFormData,
    updateErrors,
    updatePasswordRequirements,
    isStepValid,
    submitForm
  } = useSignUp();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateUsername = (username: string): string | undefined => {
    if (!username) return undefined;
    if (username.includes(' ')) return 'Username cannot contain spaces';
    if (username.length < 3) return 'Username must be at least 3 characters';
    return undefined;
  };

  const validateEmail = (email: string): string | undefined => {
    if (!email) return undefined;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return undefined;
  };

  const validatePhone = (phone: string): string | undefined => {
    if (!phone) return undefined;
    const phoneRegex = /^(\+1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}$/;
    if (!phoneRegex.test(phone)) return 'Please use format: (xxx) xxx-xxxx or xxx-xxx-xxxx';
    return undefined;
  };

  const checkPasswordRequirements = (password: string) => {
    const requirements = {
      length: password.length >= 6,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      symbol: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    updatePasswordRequirements(requirements);
    return requirements;
  };

  const validatePassword = (password: string): string | undefined => {
    if (!password) return undefined;
    const requirements = checkPasswordRequirements(password);
    const metRequirements = Object.values(requirements).filter(Boolean).length;
    
    if (!requirements.length) return 'Password must be at least 6 characters';
    if (metRequirements < 2) return 'Password must meet at least 2 requirements';
    return undefined;
  };

  const validateConfirmPassword = (confirmPassword: string, password: string): string | undefined => {
    if (!confirmPassword) return undefined;
    if (confirmPassword !== password) return 'Passwords do not match';
    return undefined;
  };

  const validateProfilePicture = (file: File | null): string | undefined => {
    if (!file) return undefined; // Profile picture is optional
    
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return 'Please upload a valid image file (JPEG, PNG, GIF, or WebP)';
    }
    
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return 'Image file size must be less than 10MB';
    }
    
    return undefined;
  };

  const handleProfilePictureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    
    if (file) {
      const error = validateProfilePicture(file);
      updateErrors('profilePicture', error);
      
      if (!error) {
        // Create preview URL
        const previewUrl = URL.createObjectURL(file);
        setProfilePreview(previewUrl);
        updateFormData('profilePicture', file);
      } else {
        setProfilePreview(null);
        updateFormData('profilePicture', null);
      }
    } else {
      setProfilePreview(null);
      updateFormData('profilePicture', null);
      updateErrors('profilePicture', undefined);
    }
  };

  const handleRemoveProfilePicture = () => {
    setProfilePreview(null);
    updateFormData('profilePicture', null);
    updateErrors('profilePicture', undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatPhoneNumber = (value: string): string => {
    const digits = value.replace(/\D/g, '');
    const limitedDigits = digits.slice(0, 10);
    
    if (limitedDigits.length === 10) {
      return `(${limitedDigits.slice(0, 3)}) ${limitedDigits.slice(3, 6)}-${limitedDigits.slice(6)}`;
    }
    
    return limitedDigits;
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    let processedValue = value;
    
    if (field === 'phone') {
      processedValue = formatPhoneNumber(value);
    }
    
    updateFormData(field, processedValue);

    let error: string | undefined;
    switch (field) {
      case 'username':
        error = validateUsername(processedValue);
        break;
      case 'email':
        error = validateEmail(processedValue);
        break;
      case 'phone':
        error = validatePhone(processedValue);
        break;
      case 'password':
        error = validatePassword(processedValue);
        if (formData.confirmPassword) {
          const confirmError = validateConfirmPassword(formData.confirmPassword, processedValue);
          updateErrors('confirmPassword', confirmError);
        }
        break;
      case 'confirmPassword':
        error = validateConfirmPassword(processedValue, formData.password);
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

  const handleSubmit = async () => {
    if (!isStepValid(3)) return;

    setIsSubmitting(true);
    try {
      const result = await submitForm();
      
      if (result.success) {
        // Success - redirect to success page
        router.push('/signup/success');
      } else {
        // Handle API error
        console.error('Sign-up failed:', result.error);
        // You could show a toast notification or set a global error state here
        alert(result.error || 'Sign up failed. Please try again.');
      }
    } catch (error) {
      console.error('Unexpected error during sign-up:', error);
      alert('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    router.push('/signup/step-2');
  };

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
              Create Your Account
            </h1>
            <p className="hero-subtitle text-comfortable">
              Almost done! Create your CareerEasy account
            </p>
          </motion.div>

          {/* Progress Indicator */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <ProgressIndicator currentStep={3} totalSteps={3} />
          </motion.div>

          {/* Form */}
          <motion.div 
            className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8"
            initial={{ y: 30, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div className="space-y-6">
              {/* Username */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.8 }}
              >
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  className={getInputClassName('username')}
                  placeholder="Enter your username"
                />
                {errors.username && formData.username && (
                  <motion.p 
                    className="mt-1 text-sm text-red-600"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {errors.username}
                  </motion.p>
                )}
              </motion.div>

              {/* Email */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.9 }}
              >
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={getInputClassName('email')}
                  placeholder="Enter your email address"
                />
                {errors.email && formData.email && (
                  <motion.p 
                    className="mt-1 text-sm text-red-600"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {errors.email}
                  </motion.p>
                )}
              </motion.div>

              {/* Phone Number */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 1.0 }}
              >
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={getInputClassName('phone')}
                  placeholder="(123) 456-7890"
                />
                <p className="mt-1 text-xs text-gray-500">
                  +1 numbers only
                </p>
                {errors.phone && formData.phone && (
                  <motion.p 
                    className="mt-1 text-sm text-red-600"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {errors.phone}
                  </motion.p>
                )}
              </motion.div>

              {/* Password */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 1.1 }}
              >
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={getInputClassName('password')}
                    placeholder="Enter your password"
                  />
                  <motion.button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <AnimatePresence mode="wait">
                      {showPassword ? (
                        <motion.div
                          key="eye-slash"
                          initial={{ opacity: 0, rotate: 180 }}
                          animate={{ opacity: 1, rotate: 0 }}
                          exit={{ opacity: 0, rotate: -180 }}
                          transition={{ duration: 0.2 }}
                        >
                          <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="eye"
                          initial={{ opacity: 0, rotate: 180 }}
                          animate={{ opacity: 1, rotate: 0 }}
                          exit={{ opacity: 0, rotate: -180 }}
                          transition={{ duration: 0.2 }}
                        >
                          <EyeIcon className="h-5 w-5 text-gray-400" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>
                </div>
                
                {/* Password Requirements */}
                <AnimatePresence>
                  {formData.password && (
                    <motion.div 
                      className="mt-2 space-y-1"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <motion.div 
                        className="flex items-center space-x-2"
                        initial={{ x: -10, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                      >
                        <motion.div 
                          className={`w-3 h-3 rounded-full transition-colors duration-300`}
                          animate={{ 
                            backgroundColor: passwordRequirements.length ? '#10b981' : '#d1d5db',
                            scale: passwordRequirements.length ? [1, 1.2, 1] : 1
                          }}
                          transition={{ duration: 0.3 }}
                        >
                          {passwordRequirements.length && (
                            <CheckCircleIcon className="w-3 h-3 text-white" />
                          )}
                        </motion.div>
                        <span className={`text-xs transition-colors duration-300 ${passwordRequirements.length ? 'text-green-600' : 'text-gray-500'}`}>
                          At least 6 characters
                        </span>
                      </motion.div>
                      <motion.div 
                        className="flex items-center space-x-2"
                        initial={{ x: -10, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.15 }}
                      >
                        <motion.div 
                          className={`w-3 h-3 rounded-full transition-colors duration-300`}
                          animate={{ 
                            backgroundColor: passwordRequirements.uppercase ? '#10b981' : '#d1d5db',
                            scale: passwordRequirements.uppercase ? [1, 1.2, 1] : 1
                          }}
                          transition={{ duration: 0.3 }}
                        >
                          {passwordRequirements.uppercase && (
                            <CheckCircleIcon className="w-3 h-3 text-white" />
                          )}
                        </motion.div>
                        <span className={`text-xs transition-colors duration-300 ${passwordRequirements.uppercase ? 'text-green-600' : 'text-gray-500'}`}>
                          Uppercase letter (A-Z)
                        </span>
                      </motion.div>
                      <motion.div 
                        className="flex items-center space-x-2"
                        initial={{ x: -10, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        <motion.div 
                          className={`w-3 h-3 rounded-full transition-colors duration-300`}
                          animate={{ 
                            backgroundColor: passwordRequirements.lowercase ? '#10b981' : '#d1d5db',
                            scale: passwordRequirements.lowercase ? [1, 1.2, 1] : 1
                          }}
                          transition={{ duration: 0.3 }}
                        >
                          {passwordRequirements.lowercase && (
                            <CheckCircleIcon className="w-3 h-3 text-white" />
                          )}
                        </motion.div>
                        <span className={`text-xs transition-colors duration-300 ${passwordRequirements.lowercase ? 'text-green-600' : 'text-gray-500'}`}>
                          Lowercase letter (a-z)
                        </span>
                      </motion.div>
                      <motion.div 
                        className="flex items-center space-x-2"
                        initial={{ x: -10, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.25 }}
                      >
                        <motion.div 
                          className={`w-3 h-3 rounded-full transition-colors duration-300`}
                          animate={{ 
                            backgroundColor: passwordRequirements.number ? '#10b981' : '#d1d5db',
                            scale: passwordRequirements.number ? [1, 1.2, 1] : 1
                          }}
                          transition={{ duration: 0.3 }}
                        >
                          {passwordRequirements.number && (
                            <CheckCircleIcon className="w-3 h-3 text-white" />
                          )}
                        </motion.div>
                        <span className={`text-xs transition-colors duration-300 ${passwordRequirements.number ? 'text-green-600' : 'text-gray-500'}`}>
                          Number (0-9)
                        </span>
                      </motion.div>
                      <motion.div 
                        className="flex items-center space-x-2"
                        initial={{ x: -10, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        <motion.div 
                          className={`w-3 h-3 rounded-full transition-colors duration-300`}
                          animate={{ 
                            backgroundColor: passwordRequirements.symbol ? '#10b981' : '#d1d5db',
                            scale: passwordRequirements.symbol ? [1, 1.2, 1] : 1
                          }}
                          transition={{ duration: 0.3 }}
                        >
                          {passwordRequirements.symbol && (
                            <CheckCircleIcon className="w-3 h-3 text-white" />
                          )}
                        </motion.div>
                        <span className={`text-xs transition-colors duration-300 ${passwordRequirements.symbol ? 'text-green-600' : 'text-gray-500'}`}>
                          Symbol (!@#$%^&*)
                        </span>
                      </motion.div>
                      <motion.p 
                        className="text-xs text-gray-500 mt-1"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.35 }}
                      >
                        Password must meet at least 2 of the above requirements
                      </motion.p>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {errors.password && formData.password && (
                  <motion.p 
                    className="mt-1 text-sm text-red-600"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {errors.password}
                  </motion.p>
                )}
              </motion.div>

              {/* Confirm Password */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 1.2 }}
              >
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className={getInputClassName('confirmPassword')}
                    placeholder="Confirm your password"
                  />
                  <motion.button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <AnimatePresence mode="wait">
                      {showConfirmPassword ? (
                        <motion.div
                          key="eye-slash-confirm"
                          initial={{ opacity: 0, rotate: 180 }}
                          animate={{ opacity: 1, rotate: 0 }}
                          exit={{ opacity: 0, rotate: -180 }}
                          transition={{ duration: 0.2 }}
                        >
                          <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="eye-confirm"
                          initial={{ opacity: 0, rotate: 180 }}
                          animate={{ opacity: 1, rotate: 0 }}
                          exit={{ opacity: 0, rotate: -180 }}
                          transition={{ duration: 0.2 }}
                        >
                          <EyeIcon className="h-5 w-5 text-gray-400" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>
                </div>
                {errors.confirmPassword && formData.confirmPassword && (
                  <motion.p 
                    className="mt-1 text-sm text-red-600"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {errors.confirmPassword}
                  </motion.p>
                )}
              </motion.div>

              {/* Profile Picture */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 1.3 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profile Picture <span className="text-gray-500 font-normal">(Optional)</span>
                </label>
                <div className="mt-2 flex items-center space-x-4">
                  <div className="relative">
                    {profilePreview ? (
                      <motion.div
                        className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-300"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <img
                          src={profilePreview}
                          alt="Profile preview"
                          className="w-full h-full object-cover"
                        />
                      </motion.div>
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                        <PhotoIcon className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePictureChange}
                      className="hidden"
                      id="profile-picture"
                    />
                    <div className="flex space-x-2">
                      <motion.button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 text-sm font-medium text-brand-navy border border-brand-navy rounded-lg hover:bg-brand-navy hover:text-white transition-colors duration-300"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {profilePreview ? 'Change Photo' : 'Choose Photo'}
                      </motion.button>
                      {profilePreview && (
                        <motion.button
                          type="button"
                          onClick={handleRemoveProfilePicture}
                          className="px-4 py-2 text-sm font-medium text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-all duration-300"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                        >
                          Remove
                        </motion.button>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Upload a photo to personalize your profile. Max size: 10MB
                    </p>
                  </div>
                </div>
                {errors.profilePicture && (
                  <motion.p 
                    className="mt-1 text-sm text-red-600"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {errors.profilePicture}
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
                onClick={handleSubmit}
                disabled={!isStepValid(3) || isSubmitting}
                className={`px-6 py-3 font-medium rounded-xl transition-all duration-300 relative overflow-hidden ${
                  isStepValid(3) && !isSubmitting
                    ? 'bg-brand-light-blue hover:bg-brand-light-blue-dark text-black hover:scale-105 shadow-lg hover:shadow-xl'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                whileHover={isStepValid(3) && !isSubmitting ? { scale: 1.05 } : {}}
                whileTap={isStepValid(3) && !isSubmitting ? { scale: 0.95 } : {}}
              >
                <AnimatePresence mode="wait">
                  {isSubmitting ? (
                    <motion.div
                      key="submitting"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="flex items-center space-x-2"
                    >
                      <motion.div
                        className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      <span>Creating Account...</span>
                    </motion.div>
                  ) : (
                    <motion.span
                      key="create"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      Create Account
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}