const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getCurrentUser,
  updatePreferences,
  updateProfile,
  changePassword
} = require('../controllers/authController');
const authenticateUser = require('../middleware/authentication');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', authenticateUser, getCurrentUser);
router.patch('/preferences', authenticateUser, updatePreferences);
router.patch('/profile', authenticateUser, updateProfile);
router.patch('/password', authenticateUser, changePassword);

module.exports = router;
