require('dotenv').config();
const jwt = require('jsonwebtoken');
const { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } = require('firebase/auth');
const { initializeApp } = require('firebase/app');
const admin = require('firebase-admin');
const { getDynamicSecret, generateSecret } = require('../../utils/generateSecrets');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKeyId: process.env.FIREBASE_PRIVATE_KEY_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      clientId: process.env.FIREBASE_CLIENT_ID,
      authUri: process.env.FIREBASE_AUTH_URI,
      tokenUri: process.env.FIREBASE_TOKEN_URI,
      authProviderX509CertUrl: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
      clientX509CertUrl: process.env.FIREBASE_CLIENT_X509_CERT_URL,
    }),
  });
}

const db = admin.firestore();

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);

const generateTokens = (uid) => {
  const timestamp = Date.now();
  const accessSecret = getDynamicSecret(uid, timestamp);
  const refreshSecret = getDynamicSecret(uid, timestamp + 1000);
  
  const accessToken = jwt.sign(
    { uid, timestamp }, 
    accessSecret, 
    { expiresIn: '1d' }
  );
  
  const refreshToken = jwt.sign(
    { uid, timestamp }, 
    refreshSecret, 
    { expiresIn: '7d' }
  );
  
  return { accessToken, refreshToken, timestamp };
};

const verifyToken = (token, uid, timestamp, isRefresh = false) => {
  const secret = isRefresh 
    ? getDynamicSecret(uid, timestamp + 1000)
    : getDynamicSecret(uid, timestamp);
  
  return jwt.verify(token, secret);
};

const generateNameFromEmail = (email) => {
  const localPart = email.split('@')[0];
  return localPart.charAt(0).toUpperCase() + localPart.slice(1);
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const userDoc = await db.collection('users').doc(user.uid).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ message: 'User data not found in database' });
    }

    const userData = userDoc.data();
    const { accessToken, refreshToken, timestamp } = generateTokens(user.uid);

    await db.collection('users').doc(user.uid).update({
      refreshToken: refreshToken,
      tokenTimestamp: timestamp,
      lastLogin: admin.firestore.FieldValue.serverTimestamp()
    });

    res.status(200).json({ 
      message: 'Login successful', 
      user: {
        uid: userData.uid,
        email: userData.email,
        name: userData.name,
        last_name: userData.last_name,
        rate: userData.rate,
        accessKey: userData.accessKey
      },
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({ message: 'Invalid credentials', error: error.message });
  }
};

exports.register = async (req, res) => {
  const { email, password } = req.body;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const name = generateNameFromEmail(email);
    const last_name = 'main';
    const accessKey = generateSecret(32);
    
    const { accessToken, refreshToken, timestamp } = generateTokens(user.uid);
    
    const userData = {
      uid: user.uid,
      email: email,
      name: name,
      last_name: last_name,
      rate: 'standard',
      accessKey: accessKey,
      refreshToken: refreshToken,
      tokenTimestamp: timestamp,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastLogin: admin.firestore.FieldValue.serverTimestamp()
    };

    await db.collection('users').doc(user.uid).set(userData);

    res.status(201).json({ 
      message: 'Registration successful', 
      user: {
        uid: userData.uid,
        email: userData.email,
        name: userData.name,
        last_name: userData.last_name,
        rate: userData.rate,
        accessKey: userData.accessKey
      },
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({ message: 'Registration failed', error: error.message });
  }
};

exports.refreshToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token not provided' });
  }

  try {
    const decoded = jwt.decode(refreshToken);
    
    if (!decoded || !decoded.uid || !decoded.timestamp) {
      return res.status(401).json({ message: 'Invalid refresh token format' });
    }

    const userDoc = await db.collection('users').doc(decoded.uid).get();
    
    if (!userDoc.exists || userDoc.data().refreshToken !== refreshToken) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    verifyToken(refreshToken, decoded.uid, decoded.timestamp, true);

    const { accessToken, refreshToken: newRefreshToken, timestamp } = generateTokens(decoded.uid);

    await db.collection('users').doc(decoded.uid).update({
      refreshToken: newRefreshToken,
      tokenTimestamp: timestamp
    });

    res.status(200).json({ 
      message: 'Tokens refreshed', 
      accessToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({ message: 'Invalid refresh token', error: error.message });
  }
};

exports.logout = async (req, res) => {
  const { refreshToken } = req.body;

  if (refreshToken) {
    try {
      const decoded = jwt.decode(refreshToken);
      
      if (decoded && decoded.uid) {
        await db.collection('users').doc(decoded.uid).update({
          refreshToken: admin.firestore.FieldValue.delete(),
          tokenTimestamp: admin.firestore.FieldValue.delete()
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
  
  res.status(200).json({ message: 'Logout successful' });
};

exports.verifyToken = verifyToken;