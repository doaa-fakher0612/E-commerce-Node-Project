const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req,res,next) => {
  const header = req.header('Authorization');
  if(!header) return res.status(401).json({ message: 'you should sign in' });
  const token = header.replace('Bearer ','');
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    next();
  } catch (err) {
    return res.status(401).json({ message: 'not valid token'});
  }
}

exports.authorizeRoles = (...roles) => (req,res,next) => {
  if(!roles.includes(req.user.role)) return res.status(403).json({ message: 'only seller can add products' });
  next();
}
