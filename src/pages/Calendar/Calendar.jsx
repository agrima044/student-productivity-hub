import React, { useState } from 'react';
import { useTasks } from '../../context/TasksContext';
import { useTimetable } from '../../context/TimetableContext';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { ChevronLeft, ChevronRight, CalendarDays, Clock, CheckSquare } from 'lucide-react';
import './Calendar.css';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const Calendar = () => {
  const { tasks } = useTasks();
  const { classes } = useTimetable();

  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Generate Calendar Cell Days
  const getCalendarDays = () => {
    const firstDayIndex = new Date(year, month, 1).getDay(); // weekday index of 1st day (0 = Sun)
    const daysInMonth = new Date(year, month + 1, 0).getDate(); // days in current month
    const daysInPrevMonth = new Date(year, month, 0).getDate(); // days in previous month

    const days = [];

    // 1. Previous Month Gaps
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const prevDate = new Date(month === 0 ? year - 1 : year, month === 0 ? 11 : month - 1, dayNum);
      days.push({
        date: prevDate,
        dayNum,
        isCurrentMonth: false
      });
    }

    // 2. Current Month Days
    for (let i = 1; i <= daysInMonth; i++) {
      const currDate = new Date(year, month, i);
      days.push({
        date: currDate,
        dayNum: i,
        isCurrentMonth: true
      });
    }

    // 3. Next Month Gaps (fill grid to 42 cells = 6 rows)
    const totalCells = 42;
    const remainingCells = totalCells - days.length;
    for (let i = 1; i <= remainingCells; i++) {
      const nextDate = new Date(month === 11 ? year + 1 : year, month === 11 ? 0 : month + 1, i);
      days.push({
        date: nextDate,
        dayNum: i,
        isCurrentMonth: false
      });
    }

    return days;
  };

  const calendarDays = getCalendarDays();

  // Check if dates match YYYY-MM-DD format
  const isSameDayStr = (d1, d2Str) => {
    const d1Str = d1.toISOString().split('T')[0];
    return d1Str === d2Str;
  };

  const isToday = (date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Match class timetable schedule by weekday (e.g. "Monday")
  const getClassesForWeekday = (date) => {
    // Weekdays mapped from getDay()
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const weekdayName = daysOfWeek[date.getDay()];
    return classes.filter((c) => c.day === weekdayName);
  };

  // Match tasks by due date
  const getTasksForDate = (date) => {
    const formattedDate = date.toISOString().split('T')[0];
    return tasks.filter((t) => t.dueDate === formattedDate);
  };

  return (
    <div className="calendar-page-container">
      <div className="calendar-header-bar">
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 700 }}>Monthly Planner</h2>
          <p className="text-sm text-muted">A consolidated calendar view merging your weekly classes and task deadlines.</p>
        </div>

        <div className="month-selector">
          <Button onClick={handleToday} variant="secondary" size="sm">
            Today
          </Button>
          <div className="flex items-center gap-1">
            <Button onClick={handlePrevMonth} variant="secondary" size="sm" style={{ padding: '0.25rem 0.5rem' }}>
              <ChevronLeft size={16} />
            </Button>
            <span className="current-month-display">
              {MONTH_NAMES[month]} {year}
            </span>
            <Button onClick={handleNextMonth} variant="secondary" size="sm" style={{ padding: '0.25rem 0.5rem' }}>
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      </div>

      {/* Grid Calendar Layout */}
      <div className="calendar-grid-wrapper">
        {/* Weekday headers row */}
        <div className="weekdays-row">
          {WEEKDAYS.map((day) => (
            <div key={day} className="weekday-label">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days cells */}
        <div className="days-grid">
          {calendarDays.map((cell, idx) => {
            const cellTasks = getTasksForDate(cell.date);
            const cellClasses = getClassesForWeekday(cell.date);
            const cellIsToday = isToday(cell.date);
            
            return (
              <div 
                key={idx} 
                className={`calendar-day-cell ${!cell.isCurrentMonth ? 'outside-month' : ''} ${cellIsToday ? 'is-today' : ''}`}
              >
                <span className="day-number-badge">{cell.dayNum}</span>
                
                <div className="day-events-list">
                  {/* Render class sessions (only on weekdays in current month range) */}
                  {cell.isCurrentMonth && cellClasses.map((cls) => (
                    <div 
                      key={cls.id} 
                      className="calendar-event-tag type-class"
                      title={`[Class] ${cls.startTime} - ${cls.subject} (${cls.room})`}
                    >
                      📚 {cls.startTime} {cls.subject}
                    </div>
                  ))}

                  {/* Render task deadlines */}
                  {cellTasks.map((t) => (
                    <div
                      key={t.id}
                      className={`calendar-event-tag ${t.status === 'Done' ? 'type-task-done' : 'type-task'}`}
                      title={`[Task] ${t.title} (${t.status})`}
                    >
                      {t.status === 'Done' ? '✅' : '⏳'} {t.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Calendar;
