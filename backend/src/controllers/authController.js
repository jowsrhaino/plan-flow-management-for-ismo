const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getJwtSecret } = require('../config/env');
const { User, Project, Task } = require('../models');

const createDefaultWorkspace = async (userId) => {
  const today = new Date();
  const dateAfter = (days) => new Date(today.getTime() + days * 86400000).toISOString().slice(0, 10);
  const templates = [
    { name: 'PlanFlow Product Launch', description: 'A launch plan covering experience, engineering, and customer communication.', status: 'In Progress', offset: 0, end: 30, tasks: [['Define success metrics', 'High', 'Completed', 2], ['Finalize product experience', 'High', 'In Progress', 7], ['Build launch landing page', 'High', 'Pending', 14]] },
    { name: 'Customer Experience Refresh', description: 'Improve the support journey with research-backed service improvements.', status: 'In Progress', offset: -4, end: 21, tasks: [['Review customer feedback', 'High', 'Completed', 1], ['Map service journey', 'Medium', 'In Progress', 9], ['Publish improvement plan', 'Medium', 'Pending', 18]] },
    { name: 'Q4 Growth Campaign', description: 'A cross-channel campaign to drive product awareness and qualified leads.', status: 'Not Started', offset: 7, end: 45, tasks: [['Define campaign audience', 'High', 'Pending', 10], ['Create campaign assets', 'Medium', 'Pending', 20], ['Set up performance dashboard', 'Low', 'Pending', 35]] }
  ];
  for (const template of templates) {
    const project = await Project.create({ userId, name: template.name, description: template.description, status: template.status, startDate: dateAfter(template.offset), endDate: dateAfter(template.end) });
    await Task.bulkCreate(template.tasks.map(([name, priority, status, dueIn]) => ({ userId, projectId: project.id, name, priority, status, dueDate: dateAfter(dueIn) })));
  }
};

// 1. USER REGISTRATION (புதிய பயனர் பதிவு)
const register = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    // Email ஏற்கெனவே உள்ளதா எனப் பார்க்கிறோம்
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'An account with this email address already exists.'
      });
    }

    // Password-ஐ bcrypt கொண்டு Hash செய்கிறோம் (Salt Rounds: 10)
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Database-ல் புதிய பயனரை சேமிக்கிறோம்
    const newUser = await User.create({
      fullName,
      email,
      passwordHash
    });

    // New users begin with a useful workspace instead of an empty dashboard.
    await createDefaultWorkspace(newUser.id);

    // JWT Token உருவாக்குகிறோம்
    const secret = getJwtSecret();
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, fullName: newUser.fullName },
      secret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: newUser.id,
        fullName: newUser.fullName,
        email: newUser.email
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, error: 'Internal server error during registration.' });
  }
};

// 2. USER LOGIN (பயனர் உள்நுழைவு)
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // பயனரைத் தேடுகிறோம்
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password credentials.'
      });
    }

    // பயனர் கொடுத்த பாஸ்வர்டையும் Database-ல் உள்ள Hash-ஐயும் ஒப்பிட்டுப் பார்க்கிறோம்
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password credentials.'
      });
    }

    // சரி எனில் JWT Token வழங்குகிறோம்
    const secret = getJwtSecret();
    // Existing accounts also receive the default workspace automatically on
    // their first successful login, without a manual "add sample" action.
    const existingProjectCount = await Project.count({ where: { userId: user.id } });
    if (existingProjectCount === 0) {
      await createDefaultWorkspace(user.id);
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, fullName: user.fullName },
      secret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: 'Internal server error during login.' });
  }
};

// 3. USER LOGOUT
const logout = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};

// 4. CURRENT USER PROFILE (GET /api/auth/me)
const getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'fullName', 'email', 'createdAt'] // Password வராமல் தடுக்கிறோம்
    });

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch user profile.' });
  }
};

module.exports = {
  register,
  login,
  logout,
  getMe
};
