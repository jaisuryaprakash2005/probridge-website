// Firebase configuration for ProBridge website
// Project: probridge-447cc
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyCNn0pnaLxwv7qia-pApZVhMP8vzR7oKB8",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "probridge-447cc.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "probridge-447cc",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "probridge-447cc.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "145417779758",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:145417779758:web:42b24fb652ebe83a267dbf",
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-29NX7FWEL0",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Intercept sendVerificationCode to ensure clean reCAPTCHA v2 token is sent (preventing NO_RECAPTCHA Enterprise bug)
if (typeof window !== 'undefined') {
  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    const url = typeof args[0] === 'string' ? args[0] : (args[0]?.url || '');
    if (url.includes('sendVerificationCode') && args[1]?.body) {
      try {
        const bodyObj = JSON.parse(args[1].body);
        if (window.__v2RecaptchaToken) {
          bodyObj.recaptchaToken = window.__v2RecaptchaToken;
        }
        delete bodyObj.captchaResponse;
        delete bodyObj.recaptchaVersion;
        args[1].body = JSON.stringify(bodyObj);
        console.log('📤 [sendVerificationCode FINAL PAYLOAD]:', args[1].body);
      } catch (e) {
        console.warn('Payload rewrite error:', e);
      }
    }
    const response = await originalFetch(...args);
    if (url.includes('sendVerificationCode') && !response.ok) {
      try {
        const clone = response.clone();
        const data = await clone.json();
        console.error('🔥 [GOOGLE ERROR JSON]:', JSON.stringify(data, null, 2));
        window.__lastGoogleError = data?.error?.message || JSON.stringify(data?.error);
      } catch (_) {}
    }
    return response;
  };
}

export default app;
