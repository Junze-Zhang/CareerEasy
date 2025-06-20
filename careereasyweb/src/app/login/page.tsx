'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { Navbar, Footer, AbstractLines } from '@/components';
import config from '@/config';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loginMethod, setLoginMethod] = useState<'username' | 'email'>('username');

  // Function to check if authentication cookies exist
  const isAuthenticated = () => {
    if (typeof document === 'undefined') return false;
    
    const candidateId = document.cookie
      .split('; ')
      .find(row => row.startsWith('candidate_id='));
    
    const candidateAccountId = document.cookie
      .split('; ')
      .find(row => row.startsWith('candidate_account_id='));
    
    return candidateId && candidateAccountId;
  };

  // Check authentication on component mount and handle success message
  useEffect(() => {
    if (isAuthenticated()) {
      // Get candidate ID and redirect to profile instead of home
      const candidateId = document.cookie
        .split('; ')
        .find(row => row.startsWith('candidate_id='))
        ?.split('=')[1];
      
      if (candidateId) {
        router.replace(`/${candidateId}`);
      } else {
        router.replace('/home');
      }
    }

    // Check for success message from signup
    const message = searchParams.get('message');
    if (message === 'signup_success') {
      setSuccessMessage('Account created successfully! Please log in to continue.');
    }
  }, [router, searchParams]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(''); // Clear error when user types
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    // Validate email format if login method is email
    if (loginMethod === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.username)) {
        setError('Please enter a valid email address');
        return;
      }
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${config.API_BASE_URL}/candidate/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify({
          username: formData.username, // Send either 'username' or 'email' field as username
          password: formData.password,
        }),
      });

      const result = await response.json();

      if (response.ok && result.Success) {
        // Login successful, navigate to home page
        router.push('/home');
      } else {
        // Login failed, show error message
        setError(result.Error || 'Invalid username or password');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/');
  };

  return (
    <>
      <Navbar hideGetStarted={true} hideLogIn={true} />
      
      {/* Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <AbstractLines />
      </div>
      
      <motion.section 
        className="pt-24 pb-16 lg:pt-32 lg:pb-20 min-h-screen relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="container-max section-padding relative z-10">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <motion.div 
            className="text-center mb-8"
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h1 className="hero-title text-comfortable mb-4">
              Welcome Back
            </h1>
            <p className="hero-subtitle text-comfortable">
              Sign in to your CareerEasy account
            </p>
          </motion.div>

          {/* Form */}
          <motion.div 
            className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8"
            initial={{ y: 30, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Login Method Toggle */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="mb-6"
              >
                <div className="flex rounded-xl bg-gray-100 p-1">
                  <button
                    type="button"
                    onClick={() => {
                      setLoginMethod('username');
                      setFormData(prev => ({ ...prev, username: '' }));
                      setError('');
                    }}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                      loginMethod === 'username'
                        ? 'bg-white text-brand-navy shadow-sm'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    Username
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginMethod('email');
                      setFormData(prev => ({ ...prev, username: '' }));
                      setError('');
                    }}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                      loginMethod === 'email'
                        ? 'bg-white text-brand-navy shadow-sm'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    Email
                  </button>
                </div>
              </motion.div>

              {/* Username/Email Input */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  {loginMethod === 'email' ? 'Email Address' : 'Username'}
                </label>
                <input
                  type={loginMethod === 'email' ? 'email' : 'text'}
                  id="username"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl transition-all duration-300 transform hover:scale-[1.02] focus:scale-[1.02] focus:border-brand-navy focus:ring-brand-light-blue/20 focus:ring-4 focus:outline-none"
                  placeholder={loginMethod === 'email' ? 'Enter your email address' : 'Enter your username'}
                />
              </motion.div>

              {/* Password */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.7 }}
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl transition-all duration-300 transform hover:scale-[1.02] focus:scale-[1.02] focus:border-brand-navy focus:ring-brand-light-blue/20 focus:ring-4 focus:outline-none"
                    placeholder="Enter your password"
                  />
                  <motion.button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </motion.button>
                </div>
              </motion.div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-600 text-sm text-center"
                >
                  {error}
                </motion.div>
              )}

              {/* Success Message */}
              {successMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-green-600 text-sm text-center"
                >
                  {successMessage}
                </motion.div>
              )}

              {/* Navigation Buttons */}
              <motion.div 
                className="flex justify-between pt-4"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.8 }}
              >
                <motion.button
                  type="button"
                  onClick={handleBack}
                  className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors duration-300"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Back
                </motion.button>
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  className={`px-6 py-3 font-medium rounded-xl transition-colors duration-300 ${
                    isLoading
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-brand-light-blue hover:bg-brand-light-blue-dark text-black shadow-lg hover:shadow-xl'
                  }`}
                  whileHover={!isLoading ? { scale: 1.02 } : {}}
                  whileTap={!isLoading ? { scale: 0.98 } : {}}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <motion.div
                        className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      <span>Signing In...</span>
                    </div>
                  ) : (
                    'Log In'
                  )}
                </motion.button>
              </motion.div>
            </form>

            {/* Sign Up Link */}
            <motion.div 
              className="text-center mt-6 pt-6 border-t border-gray-200"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 1.0 }}
            >
              <p className="text-gray-600">
                Don&apos;t have an account?{' '}
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-block"
                >
                  <Link
                    href="/signup"
                    className="text-brand-navy font-medium hover:text-brand-light-blue transition-colors duration-300"
                  >
                    Create an account
                  </Link>
                </motion.span>
              </p>
            </motion.div>
          </motion.div>
        </div>
        </div>
      </motion.section>
      
      <Footer />
    </>
  );
}