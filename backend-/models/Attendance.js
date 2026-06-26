import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    },
    subject: {
      type: String,
      required: true
    },
    attended: {
      type: Number,
      required: true,
      default: 0
    },
    conducted: {
      type: Number,
      required: true,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

const Attendance = mongoose.model('Attendance', attendanceSchema);
export default Attendance;
