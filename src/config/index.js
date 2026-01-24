// Config exports
// Conditionally export Firebase if configured

// Check if Firebase is configured via environment variables
export const isFirebaseConfigured = !!(
  process.env.REACT_APP_FIREBASE_API_KEY &&
  process.env.REACT_APP_FIREBASE_PROJECT_ID
);

// Only import Firebase if configured to avoid initialization errors
let firebaseExports = {};

if (isFirebaseConfigured) {
  try {
    firebaseExports = require("./firebase");
  } catch (error) {
    console.warn("Firebase initialization failed:", error.message);
  }
}

export const {
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
} = firebaseExports;
