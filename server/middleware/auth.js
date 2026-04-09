const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: '로그인이 필요합니다' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(401).json({ success: false, message: '사용자를 찾을 수 없습니다' });
    }

    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: '유효하지 않은 토큰입니다' });
  }
};

/** AdminLayout 과 동일: role=admin 또는 관리자 데모 이메일 */
exports.adminOnly = (req, res, next) => {
  const isAdminRole = req.user?.role === 'admin';
  const isAdminEmail = String(req.user?.email || '').toLowerCase() === 'admin@gmail.com';
  if (!isAdminRole && !isAdminEmail) {
    return res.status(403).json({ success: false, message: '관리자 권한이 필요합니다' });
  }
  next();
};
