const express = require('express');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const passport = require('passport');

const router = express.Router();

// Register Route
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const newUser  = new User({ username, password });
    await newUser .save();
    res.status(201).json({ message: 'User  registered successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Login Route
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Middleware to protect routes
const authMiddleware = passport.authenticate('jwt', { session: false });

// Export routes
module.exports = { router, authMiddleware };