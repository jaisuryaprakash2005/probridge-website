const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const requireAuth = require('../middleware/requireAuth');

function signToken(user) {
  return jwt.sign(
    {
      sub: user._id.toString(),
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role || 'user',
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function sanitizeUser(u) {
  if (!u) return null;
  const obj = u.toObject ? u.toObject() : { ...u };
  delete obj.password;
  delete obj.__v;
  if (obj._id) obj.id = obj._id.toString();
  if (!obj.status) obj.status = 'trusted';
  return obj;
}

// ─────────────────────────────────────────────────────────────────────────────
// PERSISTENT OTP STORE — survives server restarts (simple JSON file)
// ─────────────────────────────────────────────────────────────────────────────
const OTP_FILE = path.join(__dirname, '..', '.otp_store.json');

function readOtpStore() {
  try {
    if (!fs.existsSync(OTP_FILE)) return {};
    const raw = fs.readFileSync(OTP_FILE, 'utf8').trim();
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function writeOtpStore(store) {
  try {
    fs.writeFileSync(OTP_FILE, JSON.stringify(store), 'utf8');
  } catch (e) {
    console.error('⚠️  OTP store write failed:', e.message);
  }
}

function getOtp(phone) {
  const store = readOtpStore();
  return store[phone] || null;
}

function setOtp(phone, record) {
  const store = readOtpStore();
  // Clean expired entries while we're here
  const now = Date.now();
  for (const k of Object.keys(store)) {
    if (store[k].expiresAt < now) delete store[k];
  }
  store[phone] = record;
  writeOtpStore(store);
}

function deleteOtp(phone) {
  const store = readOtpStore();
  delete store[phone];
  writeOtpStore(store);
}
// ─────────────────────────────────────────────────────────────────────────────

// Lazy-load firebase service to avoid errors if not configured
function getFirebaseAuth() {
  try {
    return require('../services/firebaseAuth');
  } catch (e) {
    return null;
  }
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    }
    const cleanEmail = email.trim().toLowerCase();
    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password: hashed,
      phone: phone ? phone.replace(/[^0-9]/g, '').slice(-10) : '',
      provider: 'email',
      status: 'trusted',
      role: 'user',
    });

    const token = signToken(user);
    res.status(201).json({ success: true, token, user: sanitizeUser(user) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });
    if (!user || !user.password) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (user.status === 'restricted' || user.status === 'revoked') {
      return res.status(403).json({
        success: false,
        message: `Account ${user.status}. Please contact support. ${user.statusReason || ''}`,
      });
    }

    const token = signToken(user);
    res.json({ success: true, token, user: sanitizeUser(user) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/auth/me
router.get('/me', requireAuth, (req, res) => {
  res.json({ success: true, user: sanitizeUser(req.user) });
});

// PATCH /api/auth/profile
router.patch('/profile', requireAuth, async (req, res) => {
  try {
    const { name, phone, photo } = req.body;
    const updates = {};
    if (typeof name === 'string' && name.trim()) updates.name = name.trim();
    if (typeof phone === 'string') updates.phone = phone.replace(/[^0-9]/g, '').slice(-10);
    if (typeof photo === 'string') updates.photo = photo.trim();

    const updated = await User.findByIdAndUpdate(req.userId, { $set: updates }, { new: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, message: 'Profile updated successfully', user: sanitizeUser(updated) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/auth/send-otp  — Send OTP via Firebase or fallback dev OTP
router.post('/send-otp', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ success: false, message: 'Phone number is required' });
    }

    const cleanPhone = phone.replace(/[^0-9]/g, '').slice(-10);
    if (cleanPhone.length !== 10) {
      return res.status(400).json({ success: false, message: 'Please enter a valid 10-digit phone number' });
    }

    // 1. Try Firebase first
    const fbAuth = getFirebaseAuth();
    const tokenToUse = process.env.FIREBASE_PHONE_TOKEN;
    if (fbAuth && tokenToUse) {
      const fbResult = await fbAuth.sendFirebaseVerificationCode(cleanPhone, tokenToUse);
      if (fbResult.success && fbResult.sessionInfo) {
        console.log(`\n🔥 [Firebase] SMS sent to +91 ${cleanPhone}`);
        setOtp(cleanPhone, {
          provider: 'firebase',
          sessionInfo: fbResult.sessionInfo,
          expiresAt: Date.now() + 5 * 60 * 1000,
        });
        return res.json({ success: true, provider: 'firebase', message: `Verification code sent to +91 ${cleanPhone}`, expiresIn: 300 });
      }
      console.warn(`\n⚠️  Firebase fallback: ${fbResult.error}`);
    }

    // 2. Fallback: dev OTP (shown in response in non-production)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setOtp(cleanPhone, {
      provider: 'local',
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000,  // 5 minutes
    });
    console.log(`\n📲 [OTP] Code for +91 ${cleanPhone}: [ ${otp} ] (5 min) — also saved to file`);

    return res.json({
      success: true,
      provider: 'local',
      message: `Verification code sent to +91 ${cleanPhone}`,
      expiresIn: 300,
      devOtp: process.env.NODE_ENV !== 'production' ? otp : undefined,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/auth/phone-login  — Verify OTP and log in / register
router.post('/phone-login', async (req, res) => {
  try {
    const { name, phone, otp } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ success: false, message: 'Phone number and OTP are required' });
    }

    const cleanPhone = phone.replace(/[^0-9]/g, '').slice(-10);
    if (cleanPhone.length !== 10) {
      return res.status(400).json({ success: false, message: 'Please enter a valid 10-digit phone number' });
    }

    const record = getOtp(cleanPhone);
    const enteredOtp = String(otp).trim();

    // Allow master dev OTP even if record is missing
    const masterOtp = process.env.DEV_MASTER_OTP;
    const isDevMaster = process.env.NODE_ENV !== 'production' && masterOtp && enteredOtp === masterOtp;

    if (!record && !isDevMaster) {
      return res.status(400).json({ success: false, message: 'No OTP requested for this number. Please tap "Send OTP" first.' });
    }

    if (record && !isDevMaster) {
      if (Date.now() > record.expiresAt) {
        deleteOtp(cleanPhone);
        return res.status(400).json({ success: false, message: 'OTP has expired. Please tap "Resend OTP".' });
      }
    }

    let isVerified = false;
    if (isDevMaster) {
      isVerified = true;
      console.log(`\n✅ [OTP] Dev master OTP used for +91 ${cleanPhone}`);
    } else if (record.provider === 'firebase' && record.sessionInfo) {
      const fbAuth = getFirebaseAuth();
      if (fbAuth) {
        const fbVerify = await fbAuth.verifyFirebaseOtpCode(record.sessionInfo, enteredOtp);
        if (fbVerify.success) {
          isVerified = true;
        } else {
          return res.status(400).json({ success: false, message: fbVerify.error || 'Invalid Firebase verification code.' });
        }
      }
    } else {
      if (record.otp !== enteredOtp) {
        return res.status(400).json({ success: false, message: 'Invalid OTP. Please check the code and try again.' });
      }
      isVerified = true;
    }

    if (!isVerified) {
      return res.status(400).json({ success: false, message: 'OTP verification failed.' });
    }

    if (record) deleteOtp(cleanPhone);

    const userName = (name || '').trim();

    // Find or create user by phone
    let user = await User.findOne({ phone: cleanPhone });

    if (!user) {
      const defaultEmail = `phone_${cleanPhone}@probridge.in`;
      const emailExists = await User.findOne({ email: defaultEmail });
      const finalEmail = emailExists ? `${cleanPhone}_${Date.now()}@probridge.in` : defaultEmail;

      user = await User.create({
        name: userName || `User ${cleanPhone.slice(-4)}`,
        email: finalEmail,
        phone: cleanPhone,
        phoneVerified: true,
        provider: 'phone',
        role: 'user',
        status: 'trusted',
      });
    } else {
      let needsSave = false;
      if (userName && (!user.name || user.name.startsWith('User '))) {
        user.name = userName;
        needsSave = true;
      }
      if (!user.phoneVerified) {
        user.phoneVerified = true;
        needsSave = true;
      }
      if (needsSave) await user.save();
    }

    const token = signToken(user);
    return res.json({
      success: true,
      token,
      user: sanitizeUser(user),
      message: 'Logged in successfully! 🎉',
    });
  } catch (err) {
    console.error('❌ Phone login error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Phone login failed' });
  }
});


// POST /api/auth/firebase-phone-login — Verify Firebase ID token and issue our JWT
router.post('/firebase-phone-login', async (req, res) => {
  try {
    const { firebaseToken, name, phone } = req.body;
    if (!firebaseToken) {
      return res.status(400).json({ success: false, message: 'Firebase token is required' });
    }

    // Verify the Firebase ID token — try Admin SDK first, then REST API, then JWT decode
    let firebaseUid = null;
    let firebasePhone = null;

    try {
      const projectId = process.env.FIREBASE_PROJECT_ID || 'probridge-447cc';

      // 1. Try Firebase Admin SDK (most reliable, no network key restrictions)
      try {
        const { verifyIdToken } = require('../services/firebaseAdminAuth');
        const adminResult = await verifyIdToken(firebaseToken);
        if (adminResult && adminResult.uid) {
          firebaseUid = adminResult.uid;
          firebasePhone = adminResult.phoneNumber;
          console.log('✅ Firebase Admin SDK verified token for UID:', firebaseUid);
        }
      } catch (adminErr) {
        console.warn('Firebase Admin verify skipped:', adminErr.message);
      }

      // 2. Fallback: REST API accounts:lookup
      if (!firebaseUid) {
        const apiKey = process.env.FIREBASE_API_KEY || 'AIzaSyCNn0pnaLxwv7qia-pApZVhMP8vzR7oKB8';
        const verifyUrl = `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`;
        try {
          const verifyRes = await fetch(verifyUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken: firebaseToken }),
          });
          const verifyData = await verifyRes.json();
          if (verifyData.users && verifyData.users[0]) {
            firebaseUid = verifyData.users[0].localId;
            firebasePhone = verifyData.users[0].phoneNumber;
            console.log('✅ Firebase REST API verified token for UID:', firebaseUid);
          }
        } catch (e) {
          console.warn('Google accounts:lookup API error:', e.message);
        }
      }

      // 3. Fallback: JWT decode (phone_number claim is set by Firebase for phone auth)
      if (!firebaseUid) {
        const decoded = jwt.decode(firebaseToken);
        if (decoded && decoded.phone_number) {
          firebaseUid = decoded.sub || decoded.user_id;
          firebasePhone = decoded.phone_number;
          console.log('✅ Firebase JWT decode — phone:', firebasePhone);
        }
      }

      if (!firebaseUid) {
        return res.status(401).json({ success: false, message: 'Firebase token verification failed' });
      }
    } catch (verifyErr) {
      console.error('Firebase token verify error:', verifyErr.message);
      return res.status(401).json({ success: false, message: 'Could not verify Firebase token' });
    }

    // Extract 10-digit phone from Firebase phone number (+919999999999 → 9999999999)
    const cleanPhone = (firebasePhone || phone || '').replace(/[^0-9]/g, '').slice(-10);
    const userName = (name || '').trim();

    // Find or create user
    let user = await User.findOne({ phone: cleanPhone });
    if (!user) {
      const defaultEmail = `phone_${cleanPhone}@probridge.in`;
      const emailExists = await User.findOne({ email: defaultEmail });
      const finalEmail = emailExists ? `${cleanPhone}_${Date.now()}@probridge.in` : defaultEmail;
      user = await User.create({
        name: userName || `User ${cleanPhone.slice(-4)}`,
        email: finalEmail,
        phone: cleanPhone,
        phoneVerified: true,
        provider: 'phone',
        role: 'user',
        status: 'trusted',
      });
    } else {
      let needsSave = false;
      if (userName && (!user.name || user.name.startsWith('User '))) { user.name = userName; needsSave = true; }
      if (!user.phoneVerified) { user.phoneVerified = true; needsSave = true; }
      if (needsSave) await user.save();
    }

    const token = signToken(user);
    return res.json({ success: true, token, user: sanitizeUser(user), message: 'Logged in successfully! 🎉' });
  } catch (err) {
    console.error('❌ Firebase phone login error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Login failed' });
  }
});
module.exports = router;

