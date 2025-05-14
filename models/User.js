import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  // Basic auth
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },

  // Personal info
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  birthday: { type: Date, required: true },
  gender: {
    type: String,
    enum: ['male', 'female', 'prefer_not_to_say'],
    required: true
  },
  maritalStatus: {
    type: String,
    enum: ['single', 'married', 'divorced', 'widowed'],
    required: true
  },

  // Church-related info
  church: { type: String, required: true },
  isMember: {
    type: String,
    enum: ['yes', 'no'],
    required: true
  },

  // Contact
  phone: { type: String, required: true },

  // Emergency
  emergencyName: { type: String, required: true },
  emergencyPhone: { type: String, required: true },

  // Misc
  referral: { type: String, default: '' },

  // Verification with admin aproval only
  isVerified: { type: Boolean, default: false },
  
  isActive: { type: Boolean, default: true },

  // System info
  role: { type: String, default: 'user' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('User', userSchema);
