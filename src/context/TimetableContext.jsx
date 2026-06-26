import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const TimetableContext = createContext();

const MOCK_CLASSES = [
  {
    id: 'class-1',
    subject: 'Computer Science',
    day: 'Monday',
    startTime: '10:00',
    endTime: '11:30',
    room: 'Room 402',
    professor: 'Dr. Peterson'
  },
  {
    id: 'class-2',
    subject: 'Mathematics',
    day: 'Tuesday',
    startTime: '09:00',
    endTime: '10:30',
    room: 'Room 101',
    professor: 'Prof. Higgins'
  },
  {
    id: 'class-3',
    subject: 'Computer Science',
    day: 'Wednesday',
    startTime: '10:00',
    endTime: '11:30',
    room: 'Room 402',
    professor: 'Dr. Peterson'
  },
  {
    id: 'class-4',
    subject: 'Chemistry',
    day: 'Wednesday',
    startTime: '14:00',
    endTime: '17:00',
    room: 'Lab B',
    professor: 'Prof. Boyle'
  },
  {
    id: 'class-5',
    subject: 'Mathematics',
    day: 'Thursday',
    startTime: '09:00',
    endTime: '10:30',
    room: 'Room 101',
    professor: 'Prof. Higgins'
  }
];

export const TimetableProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [classes, setClasses] = useState([]);

  // Fetch schedule on mount/auth
  useEffect(() => {
    const fetchTimetable = async () => {
      if (isAuthenticated) {
        try {
          const data = await api.timetable.getAll();
          if (data) {
            setClasses(data);
            return;
          }
        } catch (err) {
          console.warn('Failed to load schedule from API', err);
        }
      }

      // Fallback
      const saved = localStorage.getItem('timetable');
      if (saved) {
        try {
          setClasses(JSON.parse(saved));
        } catch (e) {
          setClasses(MOCK_CLASSES);
        }
      } else {
        setClasses(MOCK_CLASSES);
      }
    };

    fetchTimetable();
  }, [isAuthenticated]);

  // Sync locally
  useEffect(() => {
    if (classes.length > 0) {
      localStorage.setItem('timetable', JSON.stringify(classes));
    }
  }, [classes]);

  const addClass = async (cls) => {
    try {
      const newClass = await api.timetable.create(cls);
      if (newClass) {
        setClasses((prev) => [...prev, newClass]);
        return newClass;
      }
    } catch (err) {
      console.warn('API add class failed, saving locally', err);
    }

    // Local Fallback
    const localClass = {
      id: Date.now().toString(),
      ...cls
    };
    setClasses((prev) => [...prev, localClass]);
    return localClass;
  };

  const deleteClass = async (id) => {
    setClasses((prev) => prev.filter((c) => (c._id || c.id) !== id));

    try {
      const classToDelete = classes.find((c) => (c._id || c.id) === id);
      if (classToDelete && classToDelete._id) {
        await api.timetable.delete(id);
      }
    } catch (err) {
      console.warn('API delete class failed', err);
    }
  };

  return (
    <TimetableContext.Provider value={{ classes, addClass, deleteClass }}>
      {children}
    </TimetableContext.Provider>
  );
};

export const useTimetable = () => {
  const context = useContext(TimetableContext);
  if (!context) {
    throw new Error('useTimetable must be used within a TimetableProvider');
  }
  return context;
};
export default TimetableContext;
