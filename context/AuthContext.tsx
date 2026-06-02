/**
 * Auth Context Provider
 * Manages user authentication state with Firebase Auth
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

import { auth, db } from '../lib/firebase';
import { AppUser, AuthContextType } from '../types';

/**
 * Create the Auth context
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Props for AuthProvider component
 */
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Convert Firebase user + Firestore profile to AppUser
 */
const buildAppUser = async (firebaseUser: FirebaseUser): Promise<AppUser> => {
  try {
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const data = userDoc.data();
      return {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: data.displayName || firebaseUser.displayName || '',
        phone: data.phone || '',
        role: data.role || 'user',
        createdAt: data.createdAt?.toDate?.() || new Date(),
      };
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
  }

  // Fallback if no Firestore doc exists yet
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email || '',
    displayName: firebaseUser.displayName || '',
    phone: '',
    role: 'user',
    createdAt: new Date(),
  };
};

/**
 * Auth Provider Component
 * Provides authentication state and actions to the entire app
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Listen for auth state changes
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const appUser = await buildAppUser(firebaseUser);
        setUser(appUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  /**
   * Login with email and password
   */
  const login = useCallback(async (email: string, password: string): Promise<void> => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      throw new Error(message);
    }
  }, []);

  /**
   * Register a new user
   */
  const register = useCallback(
    async (email: string, password: string, displayName: string, phone: string): Promise<void> => {
      try {
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        const firebaseUser = credential.user;

        // Update Firebase Auth profile
        await updateProfile(firebaseUser, { displayName });

        // Create user document in Firestore
        await setDoc(doc(db, 'users', firebaseUser.uid), {
          displayName,
          email,
          phone,
          role: 'user',
          createdAt: serverTimestamp(),
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Registration failed';
        throw new Error(message);
      }
    },
    []
  );

  /**
   * Logout the current user
   */
  const logout = useCallback(async (): Promise<void> => {
    try {
      await signOut(auth);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Logout failed';
      throw new Error(message);
    }
  }, []);

  /**
   * Update user profile data
   */
  const updateUserProfile = useCallback(async (data: Partial<AppUser>): Promise<void> => {
    try {
      if (!auth.currentUser) throw new Error('No authenticated user');

      // Update Firebase Auth displayName if provided
      if (data.displayName) {
        await updateProfile(auth.currentUser, { displayName: data.displayName });
      }

      // Update Firestore user document
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      await setDoc(userDocRef, { ...data, updatedAt: serverTimestamp() }, { merge: true });

      // Update local state
      setUser((prev) => (prev ? { ...prev, ...data } : null));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Profile update failed';
      throw new Error(message);
    }
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook to use auth context
 * @throws Error if used outside of AuthProvider
 */
export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
