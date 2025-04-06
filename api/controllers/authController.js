require('dotenv').config();
const jwt = require('jsonwebtoken');
const { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } = require('firebase/auth');
const { initializeApp } = require('firebase/app');

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

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const token = jwt.sign({ uid: user.uid }, process.env.JWT_SECRET, { expiresIn: '2h' });

    res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'Strict', maxAge: 2 * 60 * 60 * 1000 });

    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    res.status(401).json({ message: 'Invalid credentials', error });
  }
};

exports.register = async (req, res) => {
  const { email, password } = req.body;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const token = jwt.sign({ uid: user.uid }, process.env.JWT_SECRET, { expiresIn: '2h' });

    res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'Strict', maxAge: 2 * 60 * 60 * 1000 });

    res.status(201).json({ message: 'Registration successful', token });
  } catch (error) {
    res.status(400).json({ message: 'Registration failed', error: error.message });
  }
};