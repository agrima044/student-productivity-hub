import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const AttendanceContext = createContext();

const MOCK_ATTENDANCE = [
  {
    id: 'att-1',
    subject: 'Computer Science',
    attended: 12,
    conducted: 14
  },
  {
    id: 'att-2',
    subject: 'Mathematics',
    attended: 10,
    conducted: 15
  },
  {
    id: 'att-3',
    subject: 'Chemistry',
    attended: 8,
    conducted: 9
  }
];

export const AttendanceProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [attendance, setAttendance] = useState([]);

  // Fetch records
  useEffect(() => {
    const fetchAttendance = async () => {
      if (isAuthenticated) {
        try {
          const data = await api.attendance.getAll();
          if (data) {
            setAttendance(data);
            return;
          }
        } catch (err) {
          console.warn('Failed to load attendance from API', err);
        }
      }

      // Fallback
      const saved = localStorage.getItem('attendance');
      if (saved) {
        try {
          setAttendance(JSON.parse(saved));
        } catch (e) {
          setAttendance(MOCK_ATTENDANCE);
        }
      } else {
        setAttendance(MOCK_ATTENDANCE);
      }
    };

    fetchAttendance();
  }, [isAuthenticated]);

  // Local sync
  useEffect(() => {
    if (attendance.length > 0) {
      localStorage.setItem('attendance', JSON.stringify(attendance));
    }
  }, [attendance]);

  const addSubject = async (subject, attended = 0, conducted = 0) => {
    const recordData = {
      subject,
      attended: parseInt(attended, 10) || 0,
      conducted: parseInt(conducted, 10) || 0
    };

    try {
      const newRecord = await api.attendance.create(recordData);
      if (newRecord) {
        setAttendance((prev) => [...prev, newRecord]);
        return newRecord;
      }
    } catch (err) {
      console.warn('API add subject failed, saving locally', err);
    }

    // Local Fallback
    const localRecord = {
      id: Date.now().toString(),
      ...recordData
    };
    setAttendance((prev) => [...prev, localRecord]);
    return localRecord;
  };

  const updateSubject = async (id, attended, conducted) => {
    const att = Math.max(0, parseInt(attended, 10) || 0);
    const cond = Math.max(0, parseInt(conducted, 10) || 0);

    // Update locally
    setAttendance((prev) =>
      prev.map((item) => ((item._id || item.id) === id ? { ...item, attended: att, conducted: cond } : item))
    );

    // Sync API
    try {
      const record = attendance.find((a) => (a._id || a.id) === id);
      if (record && record._id) {
        await api.attendance.update(id, { attended: att, conducted: cond });
      }
    } catch (err) {
      console.warn('API update attendance counters failed', err);
    }
  };

  const deleteSubject = async (id) => {
    setAttendance((prev) => prev.filter((item) => (item._id || item.id) !== id));

    try {
      const record = attendance.find((a) => (a._id || a.id) === id);
      if (record && record._id) {
        await api.attendance.delete(id);
      }
    } catch (err) {
      console.warn('API delete attendance failed', err);
    }
  };

  const logAttendance = (id, wasPresent) => {
    const record = attendance.find((item) => (item._id || item.id) === id);
    if (record) {
      const newAttended = wasPresent ? record.attended + 1 : record.attended;
      const newConducted = record.conducted + 1;
      updateSubject(id, newAttended, newConducted);
    }
  };

  // Helper stats
  const overallPercentage = (() => {
    let totalAttended = 0;
    let totalConducted = 0;
    attendance.forEach((item) => {
      totalAttended += item.attended;
      totalConducted += item.conducted;
    });
    return totalConducted > 0 ? (totalAttended / totalConducted) * 100 : 100;
  })();

  return (
    <AttendanceContext.Provider
      value={{
        attendance,
        addSubject,
        updateSubject,
        deleteSubject,
        logAttendance,
        overallPercentage
      }}
    >
      {children}
    </AttendanceContext.Provider>
  );
};

export const useAttendance = () => {
  const context = useContext(AttendanceContext);
  if (!context) {
    throw new Error('useAttendance must be used within an AttendanceProvider');
  }
  return context;
};
export default AttendanceContext;
