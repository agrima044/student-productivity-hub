import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
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
    description: {
      type: String,
      default: ''
    },
    subject: {
      type: String,
      default: 'General'
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium'
    },
    dueDate: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['Todo', 'In-Progress', 'Review', 'Done'],
      default: 'Todo'
    },
    estimatedTime: {
      type: Number,
      default: 0
    },
    completedPomodoros: {
      type: Number,
      default: 0
    },
    labels: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true
  }
);

const Task = mongoose.model('Task', taskSchema);
export default Task;
