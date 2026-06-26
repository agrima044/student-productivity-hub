import express from 'express';
import Attendance from '../models/Attendance.js';
import protect from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

// @desc    Get user attendance trackers
// @route   GET /api/attendance
// @access  Private
router.get('/', async (req, res) => {
  try {
    const records = await Attendance.find({ user: req.user._id });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Track a new subject attendance
// @route   POST /api/attendance
// @access  Private
router.post('/', async (req, res) => {
  const { subject, attended, conducted } = req.body;

  try {
    const record = await Attendance.create({
      user: req.user._id,
      subject,
      attended: attended || 0,
      conducted: conducted || 0
    });
    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update attendance counters
// @route   PUT /api/attendance/:id
// @access  Private
router.put('/:id', async (req, res) => {
  const { attended, conducted } = req.body;

  try {
    const record = await Attendance.findById(req.params.id);

    if (!record) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    if (record.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (attended !== undefined) record.attended = attended;
    if (conducted !== undefined) record.conducted = conducted;

    const updated = await record.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Delete subject attendance tracker
// @route   DELETE /api/attendance/:id
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const record = await Attendance.findById(req.params.id);

    if (!record) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    if (record.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await record.deleteOne();
    res.json({ message: 'Attendance record removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
