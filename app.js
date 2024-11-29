const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const session = require('express-session');
const path = require('path');
const passport = require('passport');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(express.static(path.join(__dirname, 'public')));

// Passport config
require('./config/passport')(passport);

// Validate SESSION_SECRET
if (!process.env.SESSION_SECRET) {
  console.error('FATAL ERROR: SESSION_SECRET is not defined');
  process.exit(1);
}

// Session Configuration with more options
app.use(session({
  secret: process.env.SESSION_SECRET, // Required
  resave: false, // Don't save session if unmodified
  saveUninitialized: false, // Don't create session until something stored
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Flash Messages
app.use(flash());

// Global Variables for Flash Messages
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success');
  res.locals.error_msg = req.flash('error');
  res.locals.authError = req.flash('authError');
  next();
});

// Routes
const assignmentRoutes = require('./routes/assignmentRoutes');
const authRoutes = require('./routes/authRoutes');
app.use('/', assignmentRoutes);
app.use('/api/auth', authRoutes.router);

// Middleware to pass user to all views
app.use((req, res, next) => {
  // Ensure user is available in all views
  res.locals.user = req.isAuthenticated() ? req.user : null;
  
  // Also pass other common locals
  res.locals.success_msg = req.flash('success') || '';
  res.locals.error_msg = req.flash('error') || '';
  res.locals.authError = req.flash('authError') || '';
  
  next();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Detailed Error:', err);
  
  // Ensure locals are set even during error
  res.locals.user = req.isAuthenticated() ? req.user : null;
  res.locals.success_msg = req.flash('success') || '';
  res.locals.error_msg = req.flash('error') || '';
  res.locals.authError = req.flash('authError') || '';

  res.status(500).render('error', { 
    title: 'Server Error',
    message: err.message || 'Something went wrong',
    error: process.env.NODE_ENV === 'development' ? err.stack : ''
  });
});

// Database Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected'))
.catch(err => {
  console.error('MongoDB Connection Error:', err);
  process.exit(1);
});

// Server Start
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Access at http://localhost:${PORT}`);
});