import React, { useState, useEffect } from 'react';
import { useTimetable } from '../../context/TimetableContext';
import { useToast } from '../../context/ToastContext';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { Input } from '../../components/Input';
import { Plus, Trash2, MapPin, User, Clock } from 'lucide-react';
import './Timetable.css';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export const Timetable = () => {
  const { classes, addClass, deleteClass } = useTimetable();
  const { addToast } = useToast();
  
  const [modalOpen, setModalOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [day, setDay] = useState('Monday');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [room, setRoom] = useState('');
  const [professor, setProfessor] = useState('');

  // Live time tracker to refresh active class indicators
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 30000); // Update every 30 seconds
    return () => clearInterval(timer);
  }, []);

  const handleOpenModal = () => {
    setSubject('');
    setDay('Monday');
    setStartTime('09:00');
    setEndTime('10:00');
    setRoom('');
    setProfessor('');
    setModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!subject.trim()) {
      addToast('Validation Error', 'Subject name is required', 'warning');
      return;
    }
    if (startTime >= endTime) {
      addToast('Validation Error', 'Start time must be before end time', 'warning');
      return;
    }

    addClass({
      subject: subject.trim(),
      day,
      startTime,
      endTime,
      room: room.trim() || 'TBD',
      professor: professor.trim() || 'TBD'
    });

    addToast('Class Scheduled', `"${subject}" class added for ${day}.`, 'success');
    setModalOpen(false);
  };

  const handleDelete = (id, sub, day, e) => {
    e.stopPropagation();
    const confirm = window.confirm(`Remove "${sub}" from your ${day} timetable?`);
    if (confirm) {
      deleteClass(id);
      addToast('Class Removed', 'The class was deleted.', 'info');
    }
  };

  // Active class detection
  const isClassActive = (cls) => {
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDayStr = weekdays[currentTime.getDay()];
    
    if (cls.day !== currentDayStr) return false;

    // Convert times to minutes from midnight
    const [currH, currM] = [currentTime.getHours(), currentTime.getMinutes()];
    const currMin = currH * 60 + currM;

    const [startH, startM] = cls.startTime.split(':').map(Number);
    const startMin = startH * 60 + startM;

    const [endH, endM] = cls.endTime.split(':').map(Number);
    const endMin = endH * 60 + endM;

    return currMin >= startMin && currMin <= endMin;
  };

  // Group classes by day and sort them by start time
  const getSortedClassesForDay = (dayName) => {
    return classes
      .filter((c) => c.day === dayName)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  return (
    <div className="timetable-container">
      <div className="timetable-header">
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 700 }}>Weekly Schedule</h2>
          <p className="text-sm text-muted">Manage your classes and lectures throughout the week.</p>
        </div>
        <Button onClick={handleOpenModal} icon={Plus}>
          Add Class
        </Button>
      </div>

      {/* Grid view of Monday to Friday */}
      <div className="timetable-grid">
        {DAYS.map((dayName) => {
          const dayClasses = getSortedClassesForDay(dayName);
          return (
            <div key={dayName} className="timetable-column">
              <h3 className="day-header">{dayName}</h3>
              <div className="class-list">
                {dayClasses.length === 0 ? (
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.75rem', fontStyle: 'italic', textAlign: 'center', padding: '2rem 0' }}>
                    No classes scheduled
                  </div>
                ) : (
                  dayClasses.map((cls) => {
                    const active = isClassActive(cls);
                    return (
                      <Card 
                        key={cls.id} 
                        className={`class-card ${active ? 'active-class' : ''}`}
                      >
                        {active && <span className="active-pulse" />}
                        <div className="class-time">
                          {cls.startTime} - {cls.endTime}
                        </div>
                        <div className="class-name">{cls.subject}</div>
                        <div className="class-info">
                          <span className="flex items-center gap-1">
                            <MapPin size={10} style={{ display: 'inline' }} /> {cls.room}
                          </span>
                          <span className="class-professor flex items-center gap-1">
                            <User size={10} style={{ display: 'inline' }} /> {cls.professor}
                          </span>
                        </div>
                        <button
                          onClick={(e) => handleDelete(cls.id, cls.subject, cls.day, e)}
                          className="class-delete-btn"
                          title="Remove Class"
                        >
                          <Trash2 size={12} />
                        </button>
                      </Card>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Class Schedule Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Class to Timetable"
        maxWidth="500px"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <Input
            label="Subject Name"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. Computer Science, Math"
            required
          />

          <div className="task-form-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', display: 'grid' }}>
            <Input
              label="Day"
              type="select"
              value={day}
              onChange={(e) => setDay(e.target.value)}
              options={DAYS.map(d => ({ value: d, label: d }))}
            />

            <Input
              label="Room / Hall"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              placeholder="e.g. Room 402, Lab B"
            />
            
            <Input
              label="Start Time"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
            />

            <Input
              label="End Time"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
            />
          </div>

          <Input
            label="Professor / Teacher"
            value={professor}
            onChange={(e) => setProfessor(e.target.value)}
            placeholder="e.g. Dr. Peterson"
          />

          <div className="flex gap-4 mt-6" style={{ justifyContent: 'flex-end' }}>
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Schedule Class
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Timetable;
