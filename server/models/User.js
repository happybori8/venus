const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, '이름을 입력해주세요'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, '이메일을 입력해주세요'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, '비밀번호를 입력해주세요'],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ['customer', 'admin'],
      default: 'customer',
    },
    phone: {
      type: String,
      required: [true, '휴대폰 번호를 입력해주세요'],
      trim: true,
    },
    address: {
      zipCode: { type: String, default: '' },
      street: { type: String, default: '' },
      detail: { type: String, default: '' },
      city: { type: String, default: '' },
    },
    profileImage: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

const ADMIN_EMAIL = 'admin@gmail.com';

userSchema.pre('save', async function () {
  // admin@gmail.com 으로 가입하면 자동으로 admin 권한 부여
  if (this.isNew && this.email === ADMIN_EMAIL) {
    this.role = 'admin';
  }

  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
