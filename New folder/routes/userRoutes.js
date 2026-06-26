import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import protect from '../middleware/auth.js';

const router = express.Router();

// Helper to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
router.post('/', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const avatar = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`;

    const user = await User.create({
      name,
      email,
      password,
      avatar
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        major: user.major,
        university: user.university,
        studyGoal: user.studyGoal,
        avatar: user.avatar,
        token: generateToken(user._id)
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        major: user.major,
        university: user.university,
        studyGoal: user.studyGoal,
        avatar: user.avatar,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      major: user.major,
      university: user.university,
      studyGoal: user.studyGoal,
      avatar: user.avatar
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.major = req.body.major !== undefined ? req.body.major : user.major;
    user.university = req.body.university !== undefined ? req.body.university : user.university;
    user.studyGoal = req.body.studyGoal !== undefined ? Number(req.body.studyGoal) : user.studyGoal;
    user.avatar = req.body.avatar || user.avatar;

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      major: updatedUser.major,
      university: updatedUser.university,
      studyGoal: updatedUser.studyGoal,
      avatar: updatedUser.avatar,
      token: generateToken(updatedUser._id)
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

export default router;
