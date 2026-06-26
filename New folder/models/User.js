import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    },
    major: {
      type: String,
      default: 'Undecided'
    },
    university: {
      type: String,
      default: 'University'
    },
    studyGoal: {
      type: Number,
      default: 15
    },
    avatar: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Method to verify passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Hook to encrypt passwords before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);
export default User;
