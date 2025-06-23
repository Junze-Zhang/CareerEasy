'use client';

import { useState } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

interface FormData {
  username: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

interface ValidationErrors {
  username?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
}

interface PasswordRequirements {
  length: boolean;
  uppercase: boolean;
  lowercase: boolean;
  number: boolean;
  symbol: boolean;
}

export default function SignUpForm() {
  const [formData, setFormData] = useState<FormData>({
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordRequirements, setPasswordRequirements] = useState<PasswordRequirements>({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    symbol: false
  });

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
    // US/Canada phone format: (xxx) xxx-xxxx or xxx-xxx-xxxx
    const phoneRegex = /^(\+1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}$/;
    if (!phoneRegex.test(phone)) return 'Please use format: (xxx) xxx-xxxx or xxx-xxx-xxxx';
    return undefined;
  };

  const checkPasswordRequirements = (password: string): PasswordRequirements => {
    return {
      length: password.length >= 6,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      symbol: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
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

  const formatPhoneNumber = (value: string): string => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Limit to 10 digits
    const limitedDigits = digits.slice(0, 10);
    
    // Only format when exactly 10 digits are present
    if (limitedDigits.length === 10) {
      return `(${limitedDigits.slice(0, 3)}) ${limitedDigits.slice(3, 6)}-${limitedDigits.slice(6)}`;
    }
    
    // Otherwise return plain digits
    return limitedDigits;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    let processedValue = value;
    
    // Apply phone formatting
    if (field === 'phone') {
      processedValue = formatPhoneNumber(value);
    }
    
    setFormData(prev => ({ ...prev, [field]: processedValue }));

    // Real-time validation
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
        setPasswordRequirements(checkPasswordRequirements(processedValue));
        // Also validate confirm password if it exists
        if (formData.confirmPassword) {
          const confirmError = validateConfirmPassword(formData.confirmPassword, processedValue);
          setErrors(prev => ({ ...prev, confirmPassword: confirmError }));
        }
        break;
      case 'confirmPassword':
        error = validateConfirmPassword(processedValue, formData.password);
        break;
    }

    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const isFormValid = (): boolean => {
    const hasErrors = Object.values(errors).some(error => error);
    const hasEmptyFields = Object.values(formData).some(value => !value);
    return !hasErrors && !hasEmptyFields;
  };

  const getInputClassName = (field: keyof FormData): string => {
    const hasError = errors[field] && formData[field];
    return `w-full px-4 py-3 border rounded-xl transition-all duration-300 ${
      hasError 
        ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-200' 
        : 'border-gray-300 focus:border-brand-navy focus:ring-brand-light-blue/20'
    } focus:ring-4 focus:outline-none`;
  };

  const handleNext = () => {
    if (isFormValid()) {
      // TODO: Navigate to next page
      console.log('Form is valid, proceeding to next page');
    }
  };

  const handleBack = () => {
    // TODO: Navigate back to previous page or home
    console.log('Going back');
  };

  return (
    <section className="pt-24 pb-16 lg:pt-32 lg:pb-20 min-h-screen relative">
      <div className="container-max section-padding relative z-10">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="hero-title text-comfortable mb-4">
              Create Your Account
            </h1>
            <p className="hero-subtitle text-comfortable">
              Join CareerEasy and discover your dream job with AI assistance
            </p>
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <div className="space-y-6">
              {/* Username */}
              <div>
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
                  <p className="mt-1 text-sm text-red-600">{errors.username}</p>
                )}
              </div>

              {/* Email */}
              <div>
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
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Phone Number */}
              <div>
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
                  <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                )}
              </div>

              {/* Password */}
              <div>
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
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                
                {/* Password Requirements */}
                {formData.password && (
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${passwordRequirements.length ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span className={`text-xs ${passwordRequirements.length ? 'text-green-600' : 'text-gray-500'}`}>
                        At least 6 characters
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${passwordRequirements.uppercase ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span className={`text-xs ${passwordRequirements.uppercase ? 'text-green-600' : 'text-gray-500'}`}>
                        Uppercase letter (A-Z)
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${passwordRequirements.lowercase ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span className={`text-xs ${passwordRequirements.lowercase ? 'text-green-600' : 'text-gray-500'}`}>
                        Lowercase letter (a-z)
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${passwordRequirements.number ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span className={`text-xs ${passwordRequirements.number ? 'text-green-600' : 'text-gray-500'}`}>
                        Number (0-9)
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${passwordRequirements.symbol ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span className={`text-xs ${passwordRequirements.symbol ? 'text-green-600' : 'text-gray-500'}`}>
                        Symbol (!@#$%^&*)
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Password must meet at least 2 of the above requirements
                    </p>
                  </div>
                )}
                
                {errors.password && formData.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
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
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && formData.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
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
                disabled={!isFormValid()}
                className={`px-6 py-3 font-medium rounded-xl transition-all duration-300 ${
                  isFormValid()
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