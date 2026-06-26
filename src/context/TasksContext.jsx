import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const TasksContext = createContext();

const MOCK_TASKS = [
  {
    id: 'task-1',
    title: 'Complete Chemistry Lab Report 🧪',
    description: 'Write up the methodology and analysis sections for Experiment 3 (Titration). Make sure to attach the calculations sheet.',
    subject: 'Chemistry',
    priority: 'High',
    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'Todo',
    estimatedTime: 3,
    completedPomodoros: 0,
    labels: ['Lab', 'Report']
  },
  {
    id: 'task-2',
    title: 'Read Algorithms Chapter 4 💻',
    description: 'Focus on merge sort, quick sort complexity analyses, and divide-and-conquer recurrences.',
    subject: 'Computer Science',
    priority: 'Medium',
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'In-Progress',
    estimatedTime: 2,
    completedPomodoros: 0,
    labels: ['Reading', 'Theory']
  },
  {
    id: 'task-3',
    title: 'Math Assignment 2 Sheets 📐',
    description: 'Solve problems 1 through 10 on vector spaces and linear transformations.',
    subject: 'Mathematics',
    priority: 'High',
    dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'Done',
    estimatedTime: 4,
    completedPomodoros: 0,
    labels: ['Homework']
  }
];

export const TasksProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [tasks, setTasks] = useState([]);

  // Fetch tasks on mount/auth change
  useEffect(() => {
    const fetchTasks = async () => {
      if (isAuthenticated) {
        try {
          const data = await api.tasks.getAll();
          if (data) {
            setTasks(data);
            return;
          }
        } catch (err) {
          console.warn('Failed to load tasks from API, loading local storage', err);
        }
      }

      // Fallback
      const saved = localStorage.getItem('tasks');
      if (saved) {
        try {
          setTasks(JSON.parse(saved));
        } catch (e) {
          setTasks(MOCK_TASKS);
        }
      } else {
        setTasks(MOCK_TASKS);
      }
    };

    fetchTasks();
  }, [isAuthenticated]);

  // Sync to local storage in background
  useEffect(() => {
    if (tasks.length > 0) {
      localStorage.setItem('tasks', JSON.stringify(tasks));
    }
  }, [tasks]);

  const addTask = async (task) => {
    const taskData = {
      title: task.title || 'Untitled Task',
      description: task.description || '',
      subject: task.subject || 'General',
      priority: task.priority || 'Medium',
      dueDate: task.dueDate || new Date().toISOString().split('T')[0],
      status: task.status || 'Todo',
      estimatedTime: parseFloat(task.estimatedTime) || 0,
      completedPomodoros: task.completedPomodoros || 0,
      labels: task.labels || []
    };

    try {
      const newTask = await api.tasks.create(taskData);
      if (newTask) {
        setTasks((prev) => [newTask, ...prev]);
        return newTask;
      }
    } catch (err) {
      console.warn('API task creation failed, saving locally', err);
    }

    // Local Fallback
    const localTask = {
      id: Date.now().toString(),
      ...taskData
    };
    setTasks((prev) => [localTask, ...prev]);
    return localTask;
  };

  const updateTask = async (id, updatedFields) => {
    // Map locally first
    setTasks((prev) =>
      prev.map((task) => ((task._id || task.id) === id ? { ...task, ...updatedFields } : task))
    );

    // Sync to backend in background
    try {
      const taskToUpdate = tasks.find((t) => (t._id || t.id) === id);
      if (taskToUpdate && taskToUpdate._id) {
        await api.tasks.update(id, updatedFields);
      }
    } catch (err) {
      console.warn('API task update failed', err);
    }
  };

  const deleteTask = async (id) => {
    setTasks((prev) => prev.filter((task) => (task._id || task.id) !== id));

    try {
      const taskToDelete = tasks.find((t) => (t._id || t.id) === id);
      if (taskToDelete && taskToDelete._id) {
        await api.tasks.delete(id);
      }
    } catch (err) {
      console.warn('API task deletion failed', err);
    }
  };

  const moveTask = (id, newStatus) => {
    updateTask(id, { status: newStatus });
  };

  // Helper stats
  const todoCount = tasks.filter((t) => t.status === 'Todo').length;
  const inProgressCount = tasks.filter((t) => t.status === 'In-Progress').length;
  const doneCount = tasks.filter((t) => t.status === 'Done').length;

  return (
    <TasksContext.Provider
      value={{
        tasks,
        addTask,
        updateTask,
        deleteTask,
        moveTask,
        todoCount,
        inProgressCount,
        doneCount
      }}
    >
      {children}
    </TasksContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TasksContext);
  if (!context) {
    throw new Error('useTasks must be used within a TasksProvider');
  }
  return context;
};
export default TasksContext;
