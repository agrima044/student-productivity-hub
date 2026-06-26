import express from 'express';
import Note from '../models/Note.js';
import protect from '../middleware/auth.js';

const router = express.Router();

// Apply auth protection to all routes in this file
router.use(protect);

// @desc    Get all user notes
// @route   GET /api/notes
// @access  Private
router.get('/', async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user._id }).sort({ updatedAt: -1 });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Create a note
// @route   POST /api/notes
// @access  Private
router.post('/', async (req, res) => {
  const { title, content, category } = req.body;

  try {
    const note = await Note.create({
      user: req.user._id,
      title: title || 'Untitled Note',
      content: content || '',
      category: category || 'General'
    });
    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update a note
// @route   PUT /api/notes/:id
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Check ownership
    if (note.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    note.title = req.body.title !== undefined ? req.body.title : note.title;
    note.content = req.body.content !== undefined ? req.body.content : note.content;
    note.category = req.body.category !== undefined ? req.body.category : note.category;

    const updatedNote = await note.save();
    res.json(updatedNote);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Delete a note
// @route   DELETE /api/notes/:id
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Check ownership
    if (note.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await note.deleteOne();
    res.json({ message: 'Note removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
