import express from 'express';
import Goal from '../models/Goal.js';
import protect from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

// @desc    Get all user goals
// @route   GET /api/goals
// @access  Private
router.get('/', async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(goals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Create a goal
// @route   POST /api/goals
// @access  Private
router.post('/', async (req, res) => {
  const { title, targetDate, category, milestones } = req.body;

  try {
    const goal = await Goal.create({
      user: req.user._id,
      title,
      targetDate,
      category: category || 'General',
      milestones: milestones || []
    });
    res.status(201).json(goal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update a goal (milestones toggle / progress)
// @route   PUT /api/goals/:id
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    if (goal.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (req.body.title !== undefined) goal.title = req.body.title;
    if (req.body.targetDate !== undefined) goal.targetDate = req.body.targetDate;
    if (req.body.category !== undefined) goal.category = req.body.category;
    if (req.body.milestones !== undefined) goal.milestones = req.body.milestones;
    if (req.body.progress !== undefined) goal.progress = req.body.progress;
    if (req.body.status !== undefined) goal.status = req.body.status;

    const updated = await goal.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Delete a goal
// @route   DELETE /api/goals/:id
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    if (goal.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await goal.deleteOne();
    res.json({ message: 'Goal removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
