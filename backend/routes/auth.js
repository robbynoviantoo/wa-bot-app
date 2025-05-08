const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'rahasia-bot-wa';

// Register
router.post('/register', async (req, res) => {
  const { username, password, email } = req.body;
  console.log('Request body:', req.body); // Cek apa yang diterima server
  
  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const user = new User({ username, password, email });
    await user.save();
    res.json({ message: 'User registered' });
  } catch (err) {
    console.error(err); // Log error untuk debugging
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Duplicate key error, email or username already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ id: user._id, username }, JWT_SECRET, { expiresIn: '1d' });
  res.json({ token });
});

// Logout
router.post('/logout', (req, res) => {
  // Hapus token dari cookie (atau tempat lain di frontend)
  res.clearCookie('token');  // Misalnya jika token disimpan dalam cookie
  res.json({ message: 'Successfully logged out' });
});

module.exports = router;
