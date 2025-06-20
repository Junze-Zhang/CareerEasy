/**
 * Authentication utility functions
 */

export interface AuthState {
  isAuthenticated: boolean;
  candidateId: string | null;
  candidateAccountId: string | null;
}

/**
 * Check if user is authenticated by checking cookies
 */
export function getAuthState(): AuthState {
  if (typeof document === 'undefined') {
    return {
      isAuthenticated: false,
      candidateId: null,
      candidateAccountId: null
    };
  }

  const candidateId = document.cookie
    .split('; ')
    .find(row => row.startsWith('candidate_id='))
    ?.split('=')[1] || null;
  
  const candidateAccountId = document.cookie
    .split('; ')
    .find(row => row.startsWith('candidate_account_id='))
    ?.split('=')[1] || null;
  
  const isAuthenticated = !!(candidateId && candidateAccountId);

  return {
    isAuthenticated,
    candidateId,
    candidateAccountId
  };
}

/**
 * Check if user is authenticated (simplified version)
 */
export function isAuthenticated(): boolean {
  return getAuthState().isAuthenticated;
}