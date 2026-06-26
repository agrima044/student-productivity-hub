import mongoose from 'mongoose';

const milestoneSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  }
});

const goalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    },
    title: {
      type: String,
      required: true
    },
    targetDate: {
      type: String,
      required: true
    },
    category: {
      type: String,
      default: 'General'
    },
    progress: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['In-Progress', 'Completed'],
      default: 'In-Progress'
    },
    milestones: {
      type: [milestoneSchema],
      default: []
    }
  },
  {
    timestamps: true
  }
);

const Goal = mongoose.model('Goal', goalSchema);
export default Goal;
