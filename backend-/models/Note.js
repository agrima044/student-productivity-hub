import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    },
    title: {
      type: String,
      required: true,
      default: 'Untitled Note'
    },
    content: {
      type: String,
      default: ''
    },
    category: {
      type: String,
      default: 'General'
    }
  },
  {
    timestamps: true
  }
);

const Note = mongoose.model('Note', noteSchema);
export default Note;
