import express from 'express';
import Timetable from '../models/Timetable.js';
import protect from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

// @desc    Get user timetable
// @route   GET /api/timetable
// @access  Private
router.get('/', async (req, res) => {
  try {
    const schedule = await Timetable.find({ user: req.user._id });
    res.json(schedule);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Add class to schedule
// @route   POST /api/timetable
// @access  Private
router.post('/', async (req, res) => {
  const { subject, day, startTime, endTime, room, professor } = req.body;

  try {
    const classSession = await Timetable.create({
      user: req.user._id,
      subject,
      day,
      startTime,
      endTime,
      room: room || 'TBD',
      professor: professor || 'TBD'
    });
    res.status(201).json(classSession);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Delete class session
// @route   DELETE /api/timetable/:id
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const classSession = await Timetable.findById(req.params.id);

    if (!classSession) {
      return res.status(404).json({ message: 'Class session not found' });
    }

    if (classSession.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await classSession.deleteOne();
    res.json({ message: 'Class session removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
