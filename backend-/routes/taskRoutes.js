import express from 'express';
import Task from '../models/Task.js';
import protect from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

// @desc    Get all user tasks
// @route   GET /api/tasks
// @access  Private
router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Create a task
// @route   POST /api/tasks
// @access  Private
router.post('/', async (req, res) => {
  const { title, description, subject, priority, dueDate, status, estimatedTime, labels } = req.body;

  try {
    const task = await Task.create({
      user: req.user._id,
      title,
      description: description || '',
      subject: subject || 'General',
      priority: priority || 'Medium',
      dueDate,
      status: status || 'Todo',
      estimatedTime: estimatedTime || 0,
      labels: labels || []
    });
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const fieldsToUpdate = [
      'title', 'description', 'subject', 'priority', 
      'dueDate', 'status', 'estimatedTime', 'completedPomodoros', 'labels'
    ];

    fieldsToUpdate.forEach(field => {
      if (req.body[field] !== undefined) {
        task[field] = req.body[field];
      }
    });

    const updatedTask = await task.save();
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await task.deleteOne();
    res.json({ message: 'Task removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
