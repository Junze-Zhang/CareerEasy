'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import config from '@/config';

export interface SignUpFormData {
  // Step 1 - Personal Info
  firstName: string;
  middleName: string;
  lastName: string;
  workEmail: string;
  title: string;
  
  // Step 2 - Location & Career Info
  country: string;
  state: string;
  city: string;
  desiredJobTitles: number[];
  
  // Step 3 - Account Creation & Profile
  username: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  profilePicture: File | null;
}

export interface ValidationErrors {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  workEmail?: string;
  title?: string;
  country?: string;
  state?: string;
  city?: string;
  desiredJobTitles?: string;
  username?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  profilePicture?: string;
}

export interface PasswordRequirements {
  length: boolean;
  uppercase: boolean;
  lowercase: boolean;
  number: boolean;
  symbol: boolean;
}

interface SignUpContextType {
  formData: SignUpFormData;
  errors: ValidationErrors;
  passwordRequirements: PasswordRequirements;
  currentStep: number;
  updateFormData: (field: keyof SignUpFormData, value: string | string[] | number[] | File | null) => void;
  updateErrors: (field: keyof ValidationErrors, error: string | undefined) => void;
  updatePasswordRequirements: (requirements: PasswordRequirements) => void;
  setCurrentStep: (step: number) => void;
  isStepValid: (step: number) => boolean;
  getCorrectStep: () => number;
  canAccessStep: (step: number) => boolean;
  resetForm: () => void;
  submitForm: () => Promise<{ success: boolean; error?: string }>;
}

const initialFormData: SignUpFormData = {
  firstName: '',
  middleName: '',
  lastName: '',
  workEmail: '',
  title: '',
  country: '',
  state: '',
  city: '',
  desiredJobTitles: [],
  username: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  profilePicture: null
};

const initialErrors: ValidationErrors = {};

const initialPasswordRequirements: PasswordRequirements = {
  length: false,
  uppercase: false,
  lowercase: false,
  number: false,
  symbol: false
};

const SignUpContext = createContext<SignUpContextType | undefined>(undefined);

export function SignUpProvider({ children }: { children: ReactNode }) {
  const [formData, setFormData] = useState<SignUpFormData>(initialFormData);
  const [errors, setErrors] = useState<ValidationErrors>(initialErrors);
  const [passwordRequirements, setPasswordRequirements] = useState<PasswordRequirements>(initialPasswordRequirements);
  const [currentStep, setCurrentStep] = useState(1);

  const updateFormData = (field: keyof SignUpFormData, value: string | string[] | number[] | File | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateErrors = (field: keyof ValidationErrors, error: string | undefined) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const updatePasswordRequirements = (requirements: PasswordRequirements) => {
    setPasswordRequirements(requirements);
  };

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1:
        // Step 1: Personal Info (firstName, lastName, title required)
        const step1Fields = ['firstName', 'lastName', 'title'] as const;
        const step1HasErrors = step1Fields.some(field => errors[field]);
        const step1HasEmptyFields = step1Fields.some(field => !formData[field]);
        return !step1HasErrors && !step1HasEmptyFields;
      
      case 2:
        // Step 2: Location & Career Info (country, state, city, desiredJobTitles required)
        const step2Fields = ['country', 'state', 'city'] as const;
        const step2HasErrors = step2Fields.some(field => errors[field]);
        const step2HasEmptyFields = step2Fields.some(field => !formData[field]);
        const hasDesiredJobTitles = formData.desiredJobTitles.length > 0;
        return !step2HasErrors && !step2HasEmptyFields && hasDesiredJobTitles;
      
      case 3:
        // Step 3: Account Creation (username, email, phone, password, confirmPassword required)
        const step3Fields = ['username', 'email', 'phone', 'password', 'confirmPassword'] as const;
        const step3HasErrors = step3Fields.some(field => errors[field]);
        const step3HasEmptyFields = step3Fields.some(field => !formData[field]);
        return !step3HasErrors && !step3HasEmptyFields;
      
      default:
        return false;
    }
  };

  const getCorrectStep = (): number => {
    // Check if step 1 is complete
    const step1Fields = ['firstName', 'lastName', 'title'] as const;
    const step1Complete = step1Fields.every(field => formData[field]);
    
    if (!step1Complete) {
      return 1;
    }
    
    // Check if step 2 is complete
    const step2Fields = ['country', 'state', 'city'] as const;
    const step2Complete = step2Fields.every(field => formData[field]) && formData.desiredJobTitles.length > 0;
    
    if (!step2Complete) {
      return 2;
    }
    
    // If step 1 and 2 are complete, go to step 3
    return 3;
  };

  const canAccessStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return true; // Can always access step 1
      case 2:
        // Can access step 2 if step 1 is complete
        const step1Fields = ['firstName', 'lastName', 'title'] as const;
        return step1Fields.every(field => formData[field]);
      case 3:
        // Can access step 3 if step 1 and 2 are complete
        const step1Complete = ['firstName', 'lastName', 'title'].every(field => formData[field as keyof SignUpFormData]);
        const step2Complete = ['country', 'state', 'city'].every(field => formData[field as keyof SignUpFormData]) && formData.desiredJobTitles.length > 0;
        return step1Complete && step2Complete;
      default:
        return false;
    }
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setErrors(initialErrors);
    setPasswordRequirements(initialPasswordRequirements);
    setCurrentStep(1);
  };

  const submitForm = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      // Create FormData for multipart/form-data submission
      const formDataToSubmit = new FormData();
      
      // Add all form fields
      formDataToSubmit.append('username', formData.username);
      formDataToSubmit.append('first_name', formData.firstName);
      formDataToSubmit.append('middle_name', formData.middleName);
      formDataToSubmit.append('last_name', formData.lastName);
      formDataToSubmit.append('email', formData.email);
      formDataToSubmit.append('work_email', formData.workEmail);
      // Strip formatting from phone number before sending to API
      const unformattedPhone = formData.phone.replace(/\D/g, '');
      formDataToSubmit.append('phone', unformattedPhone);
      formDataToSubmit.append('password', formData.password);
      formDataToSubmit.append('country', formData.country);
      formDataToSubmit.append('state', formData.state);
      formDataToSubmit.append('city', formData.city);
      formDataToSubmit.append('title', formData.title);
      
      // Convert desiredJobTitles array to comma-separated string
      formDataToSubmit.append('preferred_career_types', formData.desiredJobTitles.join(','));
      
      // Add profile picture if provided
      if (formData.profilePicture) {
        formDataToSubmit.append('profile_pic', formData.profilePicture);
      }

      const response = await fetch(`${config.API_BASE_URL}/candidate/signup`, {
        method: 'POST',
        body: formDataToSubmit,
      });

      const result = await response.json();

      if (response.ok && result.Success) {
        return { success: true };
      } else {
        return { 
          success: false, 
          error: result.Error || 'Sign up failed. Please try again.' 
        };
      }
    } catch (error) {
      console.error('Sign up error:', error);
      return { 
        success: false, 
        error: 'Network error. Please check your connection and try again.' 
      };
    }
  };

  return (
    <SignUpContext.Provider
      value={{
        formData,
        errors,
        passwordRequirements,
        currentStep,
        updateFormData,
        updateErrors,
        updatePasswordRequirements,
        setCurrentStep,
        isStepValid,
        getCorrectStep,
        canAccessStep,
        resetForm,
        submitForm
      }}
    >
      {children}
    </SignUpContext.Provider>
  );
}

export function useSignUp() {
  const context = useContext(SignUpContext);
  if (context === undefined) {
    throw new Error('useSignUp must be used within a SignUpProvider');
  }
  return context;
}