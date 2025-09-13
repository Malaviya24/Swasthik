import { useState, useEffect } from 'react';
import { User, onAuthStateChanged, signInWithRedirect, GoogleAuthProvider, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // If Firebase is not configured, set loading to false immediately
    if (!auth) {
      setLoading(false);
      setAuthError('Firebase authentication is not properly configured');
      return;
    }

    try {
      const unsubscribe = onAuthStateChanged(auth, 
        (user: User | null) => {
          setUser(user);
          setLoading(false);
          setAuthError(null);
        },
        (error: any) => {
          console.warn('Auth state change error:', error);
          setAuthError('Authentication service unavailable');
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (error) {
      console.warn('Firebase auth setup failed:', error);
      setAuthError('Authentication service unavailable');
      setLoading(false);
      return;
    }
  }, []);

  const login = async () => {
    if (!auth) {
      throw new Error('Authentication is not available');
    }
    
    try {
      const provider = new GoogleAuthProvider();
      await signInWithRedirect(auth, provider);
    } catch (error) {
      console.error('Login error:', error);
      setAuthError('Login failed. Please try again.');
      throw error;
    }
  };

  const signOutUser = async () => {
    if (!auth) {
      return;
    }
    
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  return {
    user,
    loading,
    authError,
    login,
    signOut: signOutUser,
    isAuthAvailable: !!auth,
  };
}
