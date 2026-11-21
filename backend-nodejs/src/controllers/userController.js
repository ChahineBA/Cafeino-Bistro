const User = require('../models/User');
const { getPasswordHash, verifyPassword, createAccessToken } = require('../utils/auth');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Private/Admin
const registerUser = async (req, res) => {
  const { email, full_name, password, role } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    return res.status(400).json({ detail: 'Email already registered' });
  }

  const hashedPassword = await getPasswordHash(password);

  const user = await User.create({
    email,
    full_name,
    hashed_password: hashedPassword,
    role,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      is_active: user.is_active,
      created_at: user.created_at,
    });
  } else {
    res.status(400).json({ detail: 'Invalid user data' });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await verifyPassword(password, user.hashed_password))) {
    if (!user.is_active) {
      return res.status(403).json({ detail: 'User account is inactive' });
    }

    res.json({
      access_token: createAccessToken({ sub: user._id }),
      user: {
        _id: user._id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        is_active: user.is_active,
        created_at: user.created_at,
      },
    });
  } else {
    res.status(401).json({ detail: 'Incorrect email or password' });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getCurrentUser = async (req, res) => {
  const user = {
    _id: req.user._id,
    email: req.user.email,
    full_name: req.user.full_name,
    role: req.user.role,
    is_active: req.user.is_active,
    created_at: req.user.created_at,
  };

  res.json(user);
};

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  const users = await User.find({}).select('-hashed_password');
  res.json(users);
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = async (req, res) => {
  const user = await User.findById(req.params.id).select('-hashed_password');

  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ detail: 'User not found' });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    user.full_name = req.body.full_name || user.full_name;
    user.email = req.body.email || user.email;
    user.role = req.body.role || user.role;
    user.is_active = req.body.is_active !== undefined ? req.body.is_active : user.is_active;

    if (req.body.password) {
      user.hashed_password = await getPasswordHash(req.body.password);
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      email: updatedUser.email,
      full_name: updatedUser.full_name,
      role: updatedUser.role,
      is_active: updatedUser.is_active,
      created_at: updatedUser.created_at,
    });
  } else {
    res.status(404).json({ detail: 'User not found' });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ detail: 'Cannot delete your own account' });
    }
    await user.deleteOne();
    res.status(204).json({ message: 'User removed' });
  } else {
    res.status(404).json({ detail: 'User not found' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
};
