const User = require('../models/User');
const jwt = require('jsonwebtoken');

// generateToken function
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// register new user
exports.register = async (req, res) => {
  const { username, email, password, role } = req.body;
  try {
    const user = await User.create({ username, email, password, role });
    const token = generateToken(user._id);
    res.json({ token, user: { id: user._id, username: user.username, role: user.role } });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// generateToken
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    // search user
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'المستخدم غير موجود' });

    // password matches?
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ error: 'كلمة السر غير صحيحة' });

    // return token
    const token = generateToken(user._id);
    res.json({ token, user: { id: user._id, username: user.username, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
