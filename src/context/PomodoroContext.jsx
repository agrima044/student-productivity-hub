import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useToast } from './ToastContext';
import { useNotifications } from './NotificationsContext';
import { useTasks } from './TasksContext';

const PomodoroContext = createContext();

const MODE_TIMES = {
  focus: 25 * 60, // 25 minutes in seconds
  'short-break': 5 * 60, // 5 minutes in seconds
  'long-break': 15 * 60 // 15 minutes in seconds
};

export const PomodoroProvider = ({ children }) => {
  const [mode, setMode] = useState('focus');
  const [timeLeft, setTimeLeft] = useState(MODE_TIMES.focus);
  const [isActive, setIsActive] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState(null);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);

  const { addToast } = useToast();
  const { addNotification } = useNotifications();
  const { tasks, updateTask } = useTasks();
  const timerRef = useRef(null);

  // Sound effect helper (Web Audio API synthesis to avoid loading external assets)
  const playAlertSound = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5 note
      gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.5); // beep for 0.5s
    } catch (e) {
      console.warn("Audio context not allowed yet by user interaction", e);
    }
  };

  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsActive(false);
            handleCycleComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, mode, activeTaskId]);

  const handleCycleComplete = () => {
    playAlertSound();

    if (mode === 'focus') {
      const nextSessions = sessionsCompleted + 1;
      setSessionsCompleted(nextSessions);
      
      // Update linked task completion metrics if set
      if (activeTaskId) {
        const task = tasks.find(t => t.id === activeTaskId);
        if (task) {
          const completedPomodoros = (task.completedPomodoros || 0) + 1;
          updateTask(activeTaskId, { completedPomodoros });
          addToast('Task Focus Logged', `Logged study session for: ${task.title}`, 'success');
        }
      }

      // Check if it's time for a long break (every 4 sessions)
      if (nextSessions % 4 === 0) {
        setMode('long-break');
        setTimeLeft(MODE_TIMES['long-break']);
        addToast('Focus Complete! 🏆', 'Great job! Time for a well-deserved long break (15 min).', 'success');
        addNotification('Pomodoro Done!', 'Completed 4 focus sessions! Take a long break.', 'success');
      } else {
        setMode('short-break');
        setTimeLeft(MODE_TIMES['short-break']);
        addToast('Session Complete! ⏳', 'Time for a quick break (5 min).', 'success');
        addNotification('Focus Session Done!', 'Take a short break.', 'success');
      }
    } else {
      // Break is complete
      setMode('focus');
      setTimeLeft(MODE_TIMES.focus);
      addToast('Break Over! 🚀', 'Ready to get back to work? Let\'s focus!', 'info');
      addNotification('Break Completed', 'Time to start focusing again!', 'info');
    }
  };

  const startTimer = () => setIsActive(true);
  const pauseTimer = () => setIsActive(false);
  
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(MODE_TIMES[mode]);
  };

  const changeMode = (newMode) => {
    setIsActive(false);
    setMode(newMode);
    setTimeLeft(MODE_TIMES[newMode]);
  };

  return (
    <PomodoroContext.Provider
      value={{
        mode,
        timeLeft,
        isActive,
        activeTaskId,
        sessionsCompleted,
        setActiveTaskId,
        startTimer,
        pauseTimer,
        resetTimer,
        changeMode,
        MODE_TIMES
      }}
    >
      {children}
    </PomodoroContext.Provider>
  );
};

export const usePomodoro = () => {
  const context = useContext(PomodoroContext);
  if (!context) {
    throw new Error('usePomodoro must be used within a PomodoroProvider');
  }
  return context;
};
export default PomodoroContext;
