import { useUser, useAuth as useClerkAuth } from '@clerk/clerk-react';

export function useAuth() {
  const { user, isLoaded: userLoaded } = useUser();
  const { signOut: clerkSignOut } = useClerkAuth();

  const signOut = async () => {
    try {
      await clerkSignOut();
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  return {
    user,
    loading: !userLoaded,
    authError: null,
    login: null, // Clerk handles login through components
    signOut,
    isAuthAvailable: true,
  };
}
