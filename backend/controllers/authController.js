const User = require('../models/User');
const { StatusCodes } = require('http-status-codes');
const { BadRequestError, UnauthenticatedError } = require('../errors');

// Register User
const register = async (req, res) => {
  const user = await User.create({ ...req.body });
  const token = user.createJWT();

  // Return user details without password
  const userObj = {
    id: user._id,
    name: user.name,
    email: user.email,
    preferences: user.preferences
  };

  res.status(StatusCodes.CREATED).json({ user: userObj, token });
};

// Login User
const login = async (req, res) => {
  const { email, password } = req.body;

  // Check if email and password are provided
  if (!email || !password) {
    throw new BadRequestError('Please provide email and password');
  }

  // Find user by email
  const user = await User.findOne({ email }).select('+password');

  // Check if user exists
  if (!user) {
    throw new UnauthenticatedError('Invalid credentials');
  }

  // Check if password is correct
  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new UnauthenticatedError('Invalid credentials');
  }

  // Create new token
  const token = user.createJWT();

  // Return user details without password
  const userObj = {
    id: user._id,
    name: user.name,
    email: user.email,
    preferences: user.preferences
  };

  res.status(StatusCodes.OK).json({ user: userObj, token });
};

// Get Current User
const getCurrentUser = async (req, res) => {
  const user = await User.findById(req.user.userId);

  if (!user) {
    throw new UnauthenticatedError('User not found');
  }

  // Return user details without password
  const userObj = {
    id: user._id,
    name: user.name,
    email: user.email,
    preferences: user.preferences
  };

  res.status(StatusCodes.OK).json({ user: userObj });
};

// Update User Preferences
const updatePreferences = async (req, res) => {
  const { preferences } = req.body;

  if (!preferences) {
    throw new BadRequestError('No preferences provided');
  }

  const user = await User.findByIdAndUpdate(
    req.user.userId,
    { preferences },
    { new: true, runValidators: true }
  );

  if (!user) {
    throw new UnauthenticatedError('User not found');
  }

  // Return user details without password
  const userObj = {
    id: user._id,
    name: user.name,
    email: user.email,
    preferences: user.preferences
  };

  res.status(StatusCodes.OK).json({ user: userObj });
};

// Update User Profile
const updateProfile = async (req, res) => {
  const { name, email } = req.body;

  if (!name && !email) {
    throw new BadRequestError('Please provide at least one field to update');
  }

  const updateData = {};
  if (name) updateData.name = name;
  if (email) updateData.email = email;

  const user = await User.findByIdAndUpdate(
    req.user.userId,
    updateData,
    { new: true, runValidators: true }
  );

  if (!user) {
    throw new UnauthenticatedError('User not found');
  }

  // Return user details without password
  const userObj = {
    id: user._id,
    name: user.name,
    email: user.email,
    preferences: user.preferences
  };

  res.status(StatusCodes.OK).json({ user: userObj });
};

// Change Password
const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new BadRequestError('Please provide current and new password');
  }

  const user = await User.findById(req.user.userId).select('+password');

  if (!user) {
    throw new UnauthenticatedError('User not found');
  }

  // Check if current password is correct
  const isPasswordCorrect = await user.comparePassword(currentPassword);
  if (!isPasswordCorrect) {
    throw new UnauthenticatedError('Current password is incorrect');
  }

  // Update password
  user.password = newPassword;
  await user.save();

  res.status(StatusCodes.OK).json({ msg: 'Password updated successfully' });
};

module.exports = {
  register,
  login,
  getCurrentUser,
  updatePreferences,
  updateProfile,
  changePassword
};
