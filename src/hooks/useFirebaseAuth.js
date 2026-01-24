// Firebase Authentication Hook for Craton
// Uses Firebase compat SDK to match Rodrigo/Nexio team patterns
//
// MODES:
// - DEMO MODE: When Firebase is not configured, runs without auth (for local testing)
// - PRODUCTION MODE: When .env has Firebase credentials, full auth enabled
//
// SETUP FOR PRODUCTION:
// 1. Copy .env.example to .env
// 2. Fill in your Firebase credentials
// 3. Restart the dev server

import { useState, useEffect, useCallback } from "react";
import { auth, googleAuthProvider } from "../config/firebase";

export const useFirebaseAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Listen for auth state changes (production mode only)
  useEffect(() => {
    if (!auth) {
      console.info("Craton: Running in DEMO MODE (Firebase not configured)");
      setLoading(false);
      return;
    }

    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Sign in with Google
  const signInWithGoogle = useCallback(async () => {
    if (!auth) {
      console.warn("signInWithGoogle: Demo mode - skipping auth");
      return null;
    }

    setError(null);
    setLoading(true);
    try {
      const provider = new googleAuthProvider();
      const result = await auth.signInWithPopup(provider);
      return result.user;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  }, []);

  // Sign in with email/password
  const signInWithEmail = useCallback(async (email, password) => {
    if (!auth) {
      console.warn("signInWithEmail: Demo mode - skipping auth");
      return null;
    }

    setError(null);
    setLoading(true);
    try {
      const result = await auth.signInWithEmailAndPassword(email, password);
      return result.user;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  }, []);

  // Sign up with email/password
  const signUpWithEmail = useCallback(async (email, password) => {
    if (!auth) {
      console.warn("signUpWithEmail: Demo mode - skipping auth");
      return null;
    }

    setError(null);
    setLoading(true);
    try {
      const result = await auth.createUserWithEmailAndPassword(email, password);
      return result.user;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  }, []);

  // Send password reset email
  const resetPassword = useCallback(async (email) => {
    if (!auth) {
      console.warn("resetPassword: Demo mode - skipping");
      return;
    }

    setError(null);
    try {
      await auth.sendPasswordResetEmail(email);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Sign out
  const logout = useCallback(async () => {
    if (!auth) {
      setUser(null);
      return;
    }

    setError(null);
    try {
      await auth.signOut();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Clear error state
  const clearError = useCallback(() => setError(null), []);

  return {
    user,
    loading,
    error,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    resetPassword,
    logout,
    clearError,
    isAuthenticated: !!user,
  };
};

export default useFirebaseAuth;
