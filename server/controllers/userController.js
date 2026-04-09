const User = require('../models/User');

// @desc    전체 회원 목록 조회 (검색, 필터, 페이지네이션)
// @route   GET /api/users
// @access  Admin
exports.getUsers = async (req, res, next) => {
  try {
    const { search, role, page = 1, limit = 20 } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    if (role) query.role = role;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    회원 단건 조회
// @route   GET /api/users/:id
// @access  Admin
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: '사용자를 찾을 수 없습니다' });
    }
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @desc    회원 직접 생성 (관리자가 계정 생성)
// @route   POST /api/users
// @access  Admin
exports.createUser = async (req, res, next) => {
  try {
    const { name, email, password, phone, address, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: '이미 사용 중인 이메일입니다' });
    }

    const user = await User.create({ name, email, password, phone, address, role });

    res.status(201).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @desc    회원 정보 수정
// @route   PUT /api/users/:id
// @access  Admin
exports.updateUser = async (req, res, next) => {
  try {
    const { name, phone, address, profileImage } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, phone, address, profileImage },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: '사용자를 찾을 수 없습니다' });
    }

    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @desc    회원 삭제
// @route   DELETE /api/users/:id
// @access  Admin
exports.deleteUser = async (req, res, next) => {
  try {
    // 자기 자신 삭제 방지
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: '자기 자신은 삭제할 수 없습니다' });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: '사용자를 찾을 수 없습니다' });
    }

    res.json({ success: true, message: `${user.name} 회원이 삭제되었습니다` });
  } catch (error) {
    next(error);
  }
};

// @desc    회원 권한(role) 변경
// @route   PATCH /api/users/:id/role
// @access  Admin
exports.updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;

    if (!['customer', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: '유효하지 않은 권한입니다 (customer 또는 admin)' });
    }

    // 자기 자신의 권한 변경 방지
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: '자신의 권한은 변경할 수 없습니다' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: '사용자를 찾을 수 없습니다' });
    }

    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};
