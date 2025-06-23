'use client';

import { useState, useEffect } from 'react';
import { candidateAPI } from '@/services/api';

interface AccountManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUsername: string;
  currentEmail: string;
}

export default function AccountManagementModal({
  isOpen,
  onClose,
  currentUsername,
  currentEmail
}: AccountManagementModalProps) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Password requirements validation
  const passwordRequirements = {
    length: formData.newPassword.length >= 6,
    uppercase: /[A-Z]/.test(formData.newPassword),
    lowercase: /[a-z]/.test(formData.newPassword),
    number: /[0-9]/.test(formData.newPassword),
    symbol: /[!@#$%^&*(),.?\":{}|<>]/.test(formData.newPassword)
  };

  const optionalRequirements = [
    passwordRequirements.uppercase,
    passwordRequirements.lowercase,
    passwordRequirements.number,
    passwordRequirements.symbol
  ];
  const metOptionalRequirements = optionalRequirements.filter(Boolean).length;

  useEffect(() => {
    if (isOpen) {
      setFormData({
        username: currentUsername,
        email: currentEmail,
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setErrors({});
      setApiError(null);
    }
  }, [isOpen, currentUsername, currentEmail]);

  // Validate form without setting errors (for checking validity)
  const getValidationErrors = () => {
    const newErrors: {[key: string]: string} = {};

    // Username validation (from SignUp step 3)
    if (formData.username.trim() !== currentUsername && formData.username.trim() !== '') {
      if (formData.username.includes(' ')) {
        newErrors.username = 'Username cannot contain spaces';
      } else if (formData.username.length < 3) {
        newErrors.username = 'Username must be at least 3 characters';
      }
    }

    // Email validation (from SignUp step 3)
    if (formData.email.trim() !== currentEmail && formData.email.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    // Password validation (only if password fields are filled)
    if (formData.oldPassword || formData.newPassword || formData.confirmPassword) {
      if (!formData.oldPassword) {
        newErrors.oldPassword = 'Current password is required';
      }
      
      if (!formData.newPassword) {
        newErrors.newPassword = 'New password is required';
      } else {
        if (!passwordRequirements.length) {
          newErrors.newPassword = 'Password must be at least 6 characters';
        } else if (metOptionalRequirements < 2) {
          newErrors.newPassword = 'Password must meet at least 2 requirements (uppercase, lowercase, number, symbol)';
        }
      }
      
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    return newErrors;
  };

  const hasAccountChanges = () => {
    return (
      (formData.username !== currentUsername && formData.username.trim() !== '') ||
      (formData.email !== currentEmail && formData.email.trim() !== '')
    );
  };

  const hasPasswordChanges = () => {
    return (
      formData.oldPassword.trim() !== '' ||
      formData.newPassword.trim() !== '' ||
      formData.confirmPassword.trim() !== ''
    );
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Real-time validation for specific fields
    let error: string | undefined;
    if (field === 'username' && value.trim() !== currentUsername && value.trim() !== '') {
      if (value.includes(' ')) {
        error = 'Username cannot contain spaces';
      } else if (value.length < 3) {
        error = 'Username must be at least 3 characters';
      }
    } else if (field === 'email' && value.trim() !== currentEmail && value.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        error = 'Please enter a valid email address';
      }
    } else if (field === 'confirmPassword') {
      if (formData.newPassword && value !== formData.newPassword) {
        error = 'Passwords do not match';
      }
    } else if (field === 'newPassword') {
      // When new password changes, also validate confirm password if it exists
      if (formData.confirmPassword && value !== formData.confirmPassword) {
        setErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }));
      } else if (formData.confirmPassword && value === formData.confirmPassword) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.confirmPassword;
          return newErrors;
        });
      }
    }
    
    // Clear API error when user starts typing
    if (apiError) {
      setApiError(null);
    }
    
    // Update errors
    if (error) {
      setErrors(prev => ({ ...prev, [field]: error }));
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleAccountUpdate = async () => {
    const validationErrors = getValidationErrors();
    // Only check account-related errors
    const accountErrors = {
      username: validationErrors.username,
      email: validationErrors.email
    };
    const filteredAccountErrors = Object.fromEntries(
      Object.entries(accountErrors).filter(([, value]) => value !== undefined)
    );
    
    if (Object.keys(filteredAccountErrors).length > 0 || !hasAccountChanges()) return;

    setIsLoading(true);
    
    try {
      // Prepare data for API
      const accountUpdates: { username?: string; email?: string } = {};
      if (formData.username !== currentUsername && formData.username.trim() !== '') {
        accountUpdates.username = formData.username;
      }
      if (formData.email !== currentEmail && formData.email.trim() !== '') {
        accountUpdates.email = formData.email;
      }
      
      // Update account info
      await candidateAPI.updateAccountInfo(accountUpdates);
      
      setIsLoading(false);
      onClose();
      // Refresh the page after successful update
      window.location.reload();
    } catch (error: unknown) {
      console.error('Failed to update account:', error);
      setIsLoading(false);
      // Show error popup without refreshing
      if (error && typeof error === 'object' && 'response' in error && 
          error.response && typeof error.response === 'object' && 'data' in error.response &&
          error.response.data && typeof error.response.data === 'object' && 'Error' in error.response.data) {
        setApiError((error.response.data as { Error: string }).Error);
      } else {
        setApiError('An error occurred while updating your account. Please try again.');
      }
    }
  };

  const handlePasswordUpdate = async () => {
    const validationErrors = getValidationErrors();
    // Only check password-related errors
    const passwordErrors = {
      oldPassword: validationErrors.oldPassword,
      newPassword: validationErrors.newPassword,
      confirmPassword: validationErrors.confirmPassword
    };
    const filteredPasswordErrors = Object.fromEntries(
      Object.entries(passwordErrors).filter(([, value]) => value !== undefined)
    );
    
    if (Object.keys(filteredPasswordErrors).length > 0 || !hasPasswordChanges()) return;

    setIsLoading(true);
    
    try {
      // Update password
      await candidateAPI.updatePassword({
        old_password: formData.oldPassword,
        new_password: formData.newPassword
      });
      
      setIsLoading(false);
      onClose();
      // Refresh the page after successful update
      window.location.reload();
    } catch (error: unknown) {
      console.error('Failed to update password:', error);
      setIsLoading(false);
      // Show error popup without refreshing
      if (error && typeof error === 'object' && 'response' in error && 
          error.response && typeof error.response === 'object' && 'data' in error.response &&
          error.response.data && typeof error.response.data === 'object' && 'Error' in error.response.data) {
        setApiError((error.response.data as { Error: string }).Error);
      } else {
        setApiError('An error occurred while updating your password. Please try again.');
      }
    }
  };

  // Check if forms are valid without setting errors state
  const currentErrors = getValidationErrors();
  const accountErrors = { username: currentErrors.username, email: currentErrors.email };
  const passwordErrors = { oldPassword: currentErrors.oldPassword, newPassword: currentErrors.newPassword, confirmPassword: currentErrors.confirmPassword };
  
  const isAccountFormValid = Object.values(accountErrors).every(error => !error) && hasAccountChanges();
  const isPasswordFormValid = Object.values(passwordErrors).every(error => !error) && hasPasswordChanges();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Account Management</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* API Error Display */}
        {apiError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm text-red-700">{apiError}</span>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.username ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter username"
            />
            {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
          </div>

          {/* Account Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Account Email</label>
            <p className="text-xs text-gray-500 mb-1">Email used for login; different from work email</p>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter account email"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          {/* Account Info Action Buttons */}
          <div className="pt-4">
            <div className="flex justify-end">
              <button
                onClick={handleAccountUpdate}
                disabled={!isAccountFormValid || isLoading}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  isAccountFormValid && !isLoading
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isLoading ? 'Saving...' : 'Update Account'}
              </button>
            </div>
          </div>

          {/* Separator */}
          <hr className="border-gray-200" />

          {/* Current Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
            <input
              type="password"
              value={formData.oldPassword}
              onChange={(e) => handleInputChange('oldPassword', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.oldPassword ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter current password"
            />
            {errors.oldPassword && <p className="text-red-500 text-xs mt-1">{errors.oldPassword}</p>}
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input
              type="password"
              value={formData.newPassword}
              onChange={(e) => handleInputChange('newPassword', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.newPassword ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter new password"
            />
            {errors.newPassword && <p className="text-red-500 text-xs mt-1">{errors.newPassword}</p>}
            
            {/* Password Requirements */}
            {formData.newPassword && (
              <div className="mt-2 space-y-1">
                <div className={`text-xs ${passwordRequirements.length ? 'text-green-600' : 'text-gray-500'}`}>
                  ✓ At least 6 characters
                </div>
                <div className={`text-xs ${metOptionalRequirements >= 2 ? 'text-green-600' : 'text-gray-500'}`}>
                  ✓ At least 2 of: uppercase, lowercase, number, symbol
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Confirm new password"
            />
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
          </div>
        </div>

        {/* Password Action Buttons */}
        <div className="pt-4 pb-6">
          <div className="flex justify-end">
            <button
              onClick={handlePasswordUpdate}
              disabled={!isPasswordFormValid || isLoading}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                isPasswordFormValid && !isLoading
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isLoading ? 'Saving...' : 'Update Password'}
            </button>
          </div>
        </div>

        {/* Cancel Modal Button */}
        <div className="pt-6 border-t border-gray-200">
          <button
            onClick={() => {
              // Reset all fields to original values
              setFormData({
                username: currentUsername,
                email: currentEmail,
                oldPassword: '',
                newPassword: '',
                confirmPassword: ''
              });
              setErrors({});
              setApiError(null);
              onClose();
            }}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
            disabled={isLoading}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}