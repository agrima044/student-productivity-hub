import React, { useEffect } from 'react';
import { usePomodoro } from '../../context/PomodoroContext';
import { useTasks } from '../../context/TasksContext';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Play, Pause, RotateCcw, Link2, Link2Off, Flame } from 'lucide-react';
import './Pomodoro.css';

export const Pomodoro = () => {
  const {
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
  } = usePomodoro();

  const { tasks } = useTasks();

  // Filter tasks to only show pending tasks in selector
  const pendingTasks = tasks.filter((t) => t.status !== 'Done');
  const activeTask = tasks.find((t) => t.id === activeTaskId);

  const totalTime = MODE_TIMES[mode];
  const progressRatio = timeLeft / totalTime;
  const radius = 120;
  const circumference = 2 * Math.PI * radius; // 753.98
  const strokeDashoffset = circumference - (progressRatio * circumference);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  // Sync tab title with timer countdown
  useEffect(() => {
    const formatted = formatTime(timeLeft);
    const modeLabel = mode === 'focus' ? 'Focus' : mode === 'short-break' ? 'Short Break' : 'Long Break';
    document.title = isActive ? `[${formatted}] ${modeLabel} | Student Hub` : 'Student Hub';
    
    return () => {
      document.title = 'Student Hub';
    };
  }, [timeLeft, mode, isActive]);

  const handleTaskLink = (e) => {
    const val = e.target.value;
    setActiveTaskId(val || null);
  };

  // Determine stroke color dynamically based on focus/break mode
  const getCircleColor = () => {
    if (mode === 'focus') return 'var(--color-primary)';
    if (mode === 'short-break') return 'var(--color-success)';
    return 'var(--color-info)';
  };

  return (
    <div className="pomodoro-container">
      <div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 700, textAlign: 'center' }}>Focus Timer</h2>
        <p className="text-sm text-muted text-center">Practice the Pomodoro technique to study efficiently without fatigue.</p>
      </div>

      {/* Mode Swapper Headers */}
      <div className="pomodoro-modes">
        <button
          className={`mode-btn ${mode === 'focus' ? 'active' : ''}`}
          onClick={() => changeMode('focus')}
        >
          Focus Session
        </button>
        <button
          className={`mode-btn ${mode === 'short-break' ? 'active' : ''}`}
          onClick={() => changeMode('short-break')}
        >
          Short Break
        </button>
        <button
          className={`mode-btn ${mode === 'long-break' ? 'active' : ''}`}
          onClick={() => changeMode('long-break')}
        >
          Long Break
        </button>
      </div>

      {/* SVG Countdown Circle */}
      <div className="timer-visual">
        <svg className="timer-svg" viewBox="0 0 280 280">
          <circle className="timer-bg-circle" cx="140" cy="140" r={radius} />
          <circle
            className="timer-progress-circle"
            cx="140"
            cy="140"
            r={radius}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ stroke: getCircleColor() }}
          />
        </svg>
        
        <div className="timer-text-overlay">
          <span className="timer-countdown">{formatTime(timeLeft)}</span>
          <span className="timer-label">{mode.replace('-', ' ')}</span>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="timer-controls">
        <Button
          onClick={isActive ? pauseTimer : startTimer}
          variant={isActive ? 'secondary' : 'primary'}
          size="lg"
          style={{ width: '130px' }}
        >
          {isActive ? <Pause size={18} style={{ marginRight: '0.25rem', display: 'inline', verticalAlign: 'text-bottom' }} /> : <Play size={18} style={{ marginRight: '0.25rem', display: 'inline', verticalAlign: 'text-bottom' }} />}
          <span>{isActive ? 'Pause' : 'Start'}</span>
        </Button>

        <Button
          onClick={resetTimer}
          variant="secondary"
          size="lg"
          title="Reset Timer"
          style={{ width: '60px', padding: 0 }}
        >
          <RotateCcw size={18} />
        </Button>
      </div>

      {/* Sessions tracker list */}
      <div className="sessions-tracker flex items-center gap-1">
        <Flame size={16} color="var(--color-warning)" />
        <span>Focus Sessions Completed: {sessionsCompleted}</span>
      </div>

      {/* Task Linker Section */}
      <Card className="timer-task-linker">
        <h3 className="text-sm font-semibold flex items-center gap-2" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
          <Link2 size={16} className="text-primary" />
          <span>Link Focus Session to Task</span>
        </h3>

        {activeTask ? (
          <div className="linked-task-display">
            <div>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>{activeTask.title}</div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', marginTop: '0.125rem' }}>
                Course: {activeTask.subject} | Focused sessions: {activeTask.completedPomodoros || 0}
              </div>
            </div>
            <button
              onClick={() => setActiveTaskId(null)}
              style={{ background: 'none', border: 'none', color: 'var(--color-danger)', cursor: 'pointer', padding: '0.25rem', display: 'flex', alignItems: 'center' }}
              title="Unlink Task"
            >
              <Link2Off size={16} />
            </button>
          </div>
        ) : (
          <Input
            type="select"
            value={activeTaskId || ''}
            onChange={handleTaskLink}
            placeholder="Select a task to link..."
            options={pendingTasks.map((t) => ({ value: t.id, label: `[${t.subject}] ${t.title}` }))}
          />
        )}
      </Card>
    </div>
  );
};

export default Pomodoro;
