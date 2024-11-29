const User = require('../models/User');
const passport = require('passport');

class AuthController {
  // Render Login Page
  renderLogin(req, res) {
    res.render('login', { 
      title: 'Login',
      authError: req.flash('error') 
    });
  }

  // Render Register Page
  renderRegister(req, res) {
    res.render('register', { 
      title: 'Register',
      authError: req.flash('error') 
    });
  }

  // Login Logic
  login(req, res, next) {
    passport.authenticate('local', {
      successRedirect: '/',
      failureRedirect: '/api/auth/login',
      failureFlash: true
    })(req, res, next);
  }

  // Register Logic
  async register(req, res) {
    const { username, password } = req.body;

    try {
      // Check if user already exists
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        req.flash('error', 'Username already exists');
        return res.redirect('/api/auth/register');
      }

      // Create new user
      const newUser = new User({ username, password });
      await newUser.save();

      req.flash('success', 'Registration successful. Please log in.');
      res.redirect('/api/auth/login');
    } catch (error) {
      console.error('Registration Error:', error);
      req.flash('error', 'Registration failed');
      res.redirect('/api/auth/register');
    }
  }

  // Logout
  logout(req, res) {
    req.logout((err) => {
      if (err) {
        console.error('Logout Error:', err);
        return res.redirect('/');
      }
      res.redirect('/api/auth/login');
    });
  }
}

module.exports = new AuthController();