import mongoose from 'mongoose';

const timetableSchema = new mongoose.Schema(
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
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      required: true
    },
    startTime: {
      type: String,
      required: true
    },
    endTime: {
      type: String,
      required: true
    },
    room: {
      type: String,
      default: 'TBD'
    },
    professor: {
      type: String,
      default: 'TBD'
    }
  },
  {
    timestamps: true
  }
);

const Timetable = mongoose.model('Timetable', timetableSchema);
export default Timetable;
