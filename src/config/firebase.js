// Firebase Configuration - Matches Nexio/Rodrigo team pattern
// Uses Firebase compat SDK for consistency with existing codebase

import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/functions";
import "firebase/compat/storage";
import "firebase/compat/auth";
import "firebase/compat/analytics";

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Firebase services
const db = firebase.firestore();
const auth = firebase.auth();
const analytics = firebase.analytics();
const storage = firebase.storage();
const functions = firebase.functions();

// Auth providers
const googleAuthProvider = firebase.auth.GoogleAuthProvider;
const facebookAuthProvider = firebase.auth.FacebookAuthProvider;
const twitterAuthProvider = firebase.auth.TwitterAuthProvider;

export {
  auth,
  db,
  analytics,
  storage,
  googleAuthProvider,
  facebookAuthProvider,
  twitterAuthProvider,
  firebase,
  firebaseConfig,
  functions,
};
