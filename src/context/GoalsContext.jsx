import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { useNotifications } from './NotificationsContext';

const GoalsContext = createContext();

const MOCK_GOALS = [
  {
    id: 'goal-1',
    title: 'Maintain Semester GPA Above 3.8 🎓',
    targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    category: 'Academic',
    progress: 33,
    status: 'In-Progress',
    milestones: [
      { id: 'm1-1', text: 'Score A in Math Midterm Exam', completed: true },
      { id: 'm1-2', text: 'Submit all Chemistry lab assignments', completed: false },
      { id: 'm1-3', text: 'Maintain >85% attendance across courses', completed: false }
    ]
  },
  {
    id: 'goal-2',
    title: 'Build Full-Stack MERN Portfolio 💻',
    targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    category: 'Career Development',
    progress: 50,
    status: 'In-Progress',
    milestones: [
      { id: 'm2-1', text: 'Implement responsive React frontend layouts', completed: true },
      { id: 'm2-2', text: 'Create advanced interactive Kanban boards', completed: true },
      { id: 'm2-3', text: 'Build Node/Express backend APIs', completed: false },
      { id: 'm2-4', text: 'Deploy integrated application on Vercel/Render', completed: false }
    ]
  }
];

export const GoalsProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [goals, setGoals] = useState([]);

  const { addToast } = useToast();
  const { addNotification } = useNotifications();

  // Fetch goals
  useEffect(() => {
    const fetchGoals = async () => {
      if (isAuthenticated) {
        try {
          const data = await api.goals.getAll();
          if (data) {
            setGoals(data);
            return;
          }
        } catch (err) {
          console.warn('Failed to load goals from API', err);
        }
      }

      // Fallback
      const saved = localStorage.getItem('goals');
      if (saved) {
        try {
          setGoals(JSON.parse(saved));
        } catch (e) {
          setGoals(MOCK_GOALS);
        }
      } else {
        setGoals(MOCK_GOALS);
      }
    };

    fetchGoals();
  }, [isAuthenticated]);

  // Local sync
  useEffect(() => {
    if (goals.length > 0) {
      localStorage.setItem('goals', JSON.stringify(goals));
    }
  }, [goals]);

  const addGoal = async (goal) => {
    const goalData = {
      title: goal.title || 'Untitled Goal',
      targetDate: goal.targetDate || new Date().toISOString().split('T')[0],
      category: goal.category || 'General',
      progress: 0,
      status: 'In-Progress',
      milestones: goal.milestones || []
    };

    try {
      const newGoal = await api.goals.create(goalData);
      if (newGoal) {
        setGoals((prev) => [newGoal, ...prev]);
        addToast('Goal Created', `Target: "${newGoal.title}" has been set.`, 'success');
        return newGoal;
      }
    } catch (err) {
      console.warn('API goal creation failed, saving locally', err);
    }

    // Local Fallback
    const localGoal = {
      id: Date.now().toString(),
      ...goalData
    };
    setGoals((prev) => [localGoal, ...prev]);
    addToast('Goal Created', `Target: "${localGoal.title}" has been set.`, 'success');
    return localGoal;
  };

  const updateGoal = async (id, updatedFields) => {
    // Map locally first
    setGoals((prev) =>
      prev.map((g) => ((g._id || g.id) === id ? { ...g, ...updatedFields } : g))
    );

    // Sync API
    try {
      const goal = goals.find((g) => (g._id || g.id) === id);
      if (goal && goal._id) {
        await api.goals.update(id, updatedFields);
      }
    } catch (err) {
      console.warn('API update goal failed', err);
    }
  };

  const deleteGoal = async (id, title) => {
    setGoals((prev) => prev.filter((g) => (g._id || g.id) !== id));
    addToast('Goal Deleted', `"${title}" has been removed.`, 'info');

    try {
      const goal = goals.find((g) => (g._id || g.id) === id);
      if (goal && goal._id) {
        await api.goals.delete(id);
      }
    } catch (err) {
      console.warn('API delete goal failed', err);
    }
  };

  const toggleMilestone = (goalId, milestoneId) => {
    const goal = goals.find((g) => (g._id || g.id) === goalId);
    if (!goal) return;

    const updatedMilestones = goal.milestones.map((m) =>
      (m._id || m.id) === milestoneId ? { ...m, completed: !m.completed } : m
    );

    const completedCount = updatedMilestones.filter((m) => m.completed).length;
    const totalCount = updatedMilestones.length;
    const newProgress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
    const newStatus = newProgress === 100 ? 'Completed' : 'In-Progress';

    if (newProgress === 100 && goal.progress < 100) {
      addToast('Goal Achieved! 🎉', `Congratulations on completing "${goal.title}"!`, 'success');
      addNotification('Goal Completed!', `You have completed all milestones for: ${goal.title}`, 'success');
    }

    updateGoal(goalId, {
      milestones: updatedMilestones,
      progress: newProgress,
      status: newStatus
    });
  };

  return (
    <GoalsContext.Provider
      value={{
        goals,
        addGoal,
        updateGoal,
        deleteGoal,
        toggleMilestone
      }}
    >
      {children}
    </GoalsContext.Provider>
  );
};

export const useGoals = () => {
  const context = useContext(GoalsContext);
  if (!context) {
    throw new Error('useGoals must be used within a GoalsProvider');
  }
  return context;
};
export default GoalsContext;
