/**
 * firebaseAdminAuth.js
 * Firebase Admin SDK service for backend-only phone auth operations.
 * Does NOT require reCAPTCHA — runs entirely server-side.
 *
 * Usage:
 *  - Verify Firebase ID tokens issued by the client SDK
 *  - Custom token creation
 *
 * Note: Sending SMS via Firebase Admin is not directly supported.
 * SMS delivery is handled by the client SDK (RecaptchaVerifier + signInWithPhoneNumber)
 * OR via MSG91/Fast2SMS as a fallback.
 */

let adminApp = null;

function getAdminApp() {
  if (adminApp) return adminApp;

  try {
    const admin = require('firebase-admin');

    if (admin.apps.length > 0) {
      adminApp = admin.apps[0];
      return adminApp;
    }

    // Try service account file first
    const fs = require('fs');
    const path = require('path');
    const saFile = path.join(__dirname, '..', 'firebase-service-account.json');

    if (fs.existsSync(saFile)) {
      const serviceAccount = require(saFile);
      adminApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: process.env.FIREBASE_PROJECT_ID || 'probridge-447cc',
      });
      console.log('✅ Firebase Admin: initialized with service account file');
    } else {
      // Fall back to Application Default Credentials or just project ID
      adminApp = admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId: process.env.FIREBASE_PROJECT_ID || 'probridge-447cc',
      });
      console.log('✅ Firebase Admin: initialized with Application Default Credentials');
    }

    return adminApp;
  } catch (err) {
    console.warn('⚠️  Firebase Admin init failed:', err.message);
    return null;
  }
}

/**
 * Verify a Firebase ID token using Admin SDK (most reliable method).
 * @param {string} idToken
 * @returns {Promise<{ uid, phoneNumber, email } | null>}
 */
async function verifyIdToken(idToken) {
  try {
    const app = getAdminApp();
    if (!app) return null;

    const admin = require('firebase-admin');
    const decoded = await admin.auth(app).verifyIdToken(idToken);
    return {
      uid: decoded.uid,
      phoneNumber: decoded.phone_number,
      email: decoded.email,
    };
  } catch (err) {
    console.warn('Firebase Admin verifyIdToken failed:', err.message);
    return null;
  }
}

module.exports = { getAdminApp, verifyIdToken };
