/**
 * firebaseAuth.js
 * Service for Firebase Phone Number Verification via Google Identity Toolkit REST API
 */

function getApiKey() {
  return process.env.FIREBASE_API_KEY || 'AIzaSyCNn0pnaLxwv7qia-pApZVhMP8vzR7oKB8';
}

/**
 * Format 10-digit or raw phone to E.164 (+91XXXXXXXXXX)
 */
function formatE164(phone) {
  const digits = String(phone).replace(/[^0-9]/g, '');
  if (digits.length === 10) {
    return `+91${digits}`;
  }
  if (digits.startsWith('91') && digits.length === 12) {
    return `+${digits}`;
  }
  return `+${digits}`;
}

/**
 * Request Firebase to send SMS verification code
 * @param {string} phone - User phone number
 * @param {string} [customToken] - Optional recaptcha / phone token
 * @returns {Promise<{ success: boolean, sessionInfo?: string, error?: string, raw?: any }>}
 */
async function sendFirebaseVerificationCode(phone, customToken) {
  const token = customToken || process.env.FIREBASE_PHONE_TOKEN;
  const phoneNumber = formatE164(phone);

  if (!token) {
    return {
      success: false,
      error: 'FIREBASE_PHONE_TOKEN is not configured.',
    };
  }

  try {
    const url = `https://identitytoolkit.googleapis.com/v1/accounts:sendVerificationCode?key=${getApiKey()}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phoneNumber,
        recaptchaToken: token,
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok || !data.sessionInfo) {
      const errMsg = data.error?.message || `Firebase error HTTP ${res.status}`;
      return {
        success: false,
        error: errMsg,
        raw: data,
      };
    }

    return {
      success: true,
      sessionInfo: data.sessionInfo,
    };
  } catch (err) {
    return {
      success: false,
      error: err.message || 'Network error reaching Firebase Identity Toolkit.',
    };
  }
}

/**
 * Verify SMS code with Firebase
 * @param {string} sessionInfo - Firebase session returned from sendVerificationCode
 * @param {string} code - 6-digit OTP code entered by user
 * @returns {Promise<{ success: boolean, idToken?: string, phoneNumber?: string, error?: string }>}
 */
async function verifyFirebaseOtpCode(sessionInfo, code) {
  if (!sessionInfo || !code) {
    return {
      success: false,
      error: 'sessionInfo and code are required.',
    };
  }

  try {
    const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPhoneNumber?key=${getApiKey()}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionInfo,
        code: String(code).trim(),
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok || !data.idToken) {
      const errMsg = data.error?.message || 'Invalid or expired Firebase verification code.';
      return {
        success: false,
        error: errMsg,
        raw: data,
      };
    }

    return {
      success: true,
      idToken: data.idToken,
      phoneNumber: data.phoneNumber,
      localId: data.localId,
    };
  } catch (err) {
    return {
      success: false,
      error: err.message || 'Network error verifying code with Firebase.',
    };
  }
}

module.exports = {
  formatE164,
  sendFirebaseVerificationCode,
  verifyFirebaseOtpCode,
};

