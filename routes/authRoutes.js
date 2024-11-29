const express = require('express');
const passport = require('passport');
const router = express.Router();
const authController = require('../controllers/authController');

// Authentication Middleware
const authMiddleware = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash('error', 'Please log in to access this page');
  res.redirect('/api/auth/login');
};

// Login Routes
router.get('/login', authController.renderLogin);

// Login Route
router.post('/login', passport.authenticate('local', {
  successRedirect: '/', // Redirect to home on successful login
  failureRedirect: '/api/auth/login', 
  failureFlash: true // Enable flash messages for login failures
}));

// Register Routes
router.get('/register', authController.renderRegister);
router.post('/register', authController.register);

// Logout Route
router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error('Logout Error:', err);
      return res.redirect('/');
    }
    req.flash('success', 'You have been logged out');
    res.redirect('/api/auth/login');
  });
});


// Exporting both the router and the middleware
module.exports = { router, authMiddleware };