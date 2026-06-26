import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTasks } from '../../context/TasksContext';
import { useNotes } from '../../context/NotesContext';
import { useTimetable } from '../../context/TimetableContext';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { Sparkles, FileText, CheckSquare, Clock, ArrowRight, Calendar } from 'lucide-react';
import './Dashboard.css';

export const Dashboard = () => {
  const { user } = useAuth();
  const { tasks } = useTasks();
  const { notes } = useNotes();
  const { classes } = useTimetable();
  const navigate = useNavigate();
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayDayName = weekdays[new Date().getDay()];

  // Counts
  const pendingTasks = tasks.filter((t) => t.status !== 'Done');
  const todayTasks = tasks.filter((t) => t.dueDate === todayStr && t.status !== 'Done');
  const todayClasses = classes.filter((c) => c.day === todayDayName);

  // Recent notes (last 3 updated)
  const recentNotes = [...notes]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 3);

  return (
    <div className="dashboard-container">
      <div className="dashboard-welcome">
        <div>
          <h1 className="dashboard-title">
            {getGreeting()}, {user?.name || 'Student'}! 👋
          </h1>
          <p className="dashboard-subtitle">
            Welcome to your Student Productivity Hub. Let's make today productive.
          </p>
        </div>
      </div>

      {/* Stats Widgets */}
      <div className="dashboard-grid">
        <Card hoverable className="stat-card" onClick={() => navigate('/tasks')}>
          <div className="stat-icon-wrapper primary">
            <CheckSquare size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Tasks Todo</span>
            <span className="stat-value">{pendingTasks.length}</span>
          </div>
        </Card>

        <Card hoverable className="stat-card" onClick={() => navigate('/notes')}>
          <div className="stat-icon-wrapper success">
            <FileText size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Notes</span>
            <span className="stat-value">{notes.length}</span>
          </div>
        </Card>

        <Card hoverable className="stat-card" onClick={() => navigate('/timetable')}>
          <div className="stat-icon-wrapper warning">
            <Clock size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Classes Today</span>
            <span className="stat-value">{todayClasses.length}</span>
          </div>
        </Card>

        <Card hoverable className="stat-card" onClick={() => navigate('/profile')}>
          <div className="stat-icon-wrapper danger">
            <Sparkles size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Weekly Focus Goal</span>
            <span className="stat-value">{user?.studyGoal || 15}h</span>
          </div>
        </Card>
      </div>

      {/* Main Panels */}
      <div className="dashboard-sections mt-4">
        {/* Today's Tasks Panel */}
        <Card className="dashboard-panel">
          <div className="flex justify-between items-center mb-4" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            <h3 className="panel-title" style={{ margin: 0, border: 'none', padding: 0 }}>Today's Focus</h3>
            <Button size="sm" variant="ghost" onClick={() => navigate('/tasks')} style={{ fontSize: '0.75rem' }}>
              View All <ArrowRight size={12} style={{ marginLeft: '0.25rem', display: 'inline' }} />
            </Button>
          </div>
          
          {todayTasks.length === 0 ? (
            <div className="panel-empty">
              <CheckSquare size={48} className="text-muted mb-4" />
              <p className="font-semibold text-sm">No tasks due today</p>
              <p className="text-xs text-muted mt-2">All caught up! Create a task in the Tasks page to track your workload.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2" style={{ overflowY: 'auto', flex: 1 }}>
              {todayTasks.map((task) => (
                <div 
                  key={task.id} 
                  className="flex justify-between items-center p-3" 
                  style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}
                  onClick={() => navigate('/tasks')}
                >
                  <div className="flex flex-col gap-1">
                    <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{task.title}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{task.subject}</span>
                  </div>
                  <Badge variant={task.priority === 'High' ? 'danger' : task.priority === 'Medium' ? 'warning' : 'secondary'}>
                    {task.priority}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Recent Notes Panel */}
        <Card className="dashboard-panel">
          <div className="flex justify-between items-center mb-4" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            <h3 className="panel-title" style={{ margin: 0, border: 'none', padding: 0 }}>Recent Notes</h3>
            <Button size="sm" variant="ghost" onClick={() => navigate('/notes')} style={{ fontSize: '0.75rem' }}>
              View All <ArrowRight size={12} style={{ marginLeft: '0.25rem', display: 'inline' }} />
            </Button>
          </div>
          
          {recentNotes.length === 0 ? (
            <div className="panel-empty">
              <FileText size={48} className="text-muted mb-4" />
              <p className="font-semibold text-sm">No recent notes</p>
              <p className="text-xs text-muted mt-2">Write down ideas, class content, or lists in the Notes page.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3" style={{ overflowY: 'auto', flex: 1 }}>
              {recentNotes.map((note) => (
                <div 
                  key={note.id} 
                  className="flex flex-col gap-1 p-3" 
                  style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}
                  onClick={() => navigate('/notes')}
                >
                  <div className="flex justify-between items-center">
                    <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{note.title || 'Untitled Note'}</span>
                    <Badge variant="primary">{note.category}</Badge>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {note.content || 'Empty content...'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
