import React from 'react';
import { useTasks } from '../../context/TasksContext';
import { useAttendance } from '../../context/AttendanceContext';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/Card';
import { ProgressBar } from '../../components/ProgressBar';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  LineChart, 
  Line, 
  CartesianGrid, 
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { BarChart3, TrendingUp, UserCheck, CheckSquare, Clock, AlertCircle } from 'lucide-react';
import './Statistics.css';

export const Statistics = () => {
  const { tasks } = useTasks();
  const { attendance, overallPercentage } = useAttendance();
  const { user } = useAuth();

  // 1. Process Task Data (Completed vs Pending by Subject)
  const getTaskData = () => {
    const subjectMap = {};
    tasks.forEach((t) => {
      const sub = t.subject || 'General';
      if (!subjectMap[sub]) {
        subjectMap[sub] = { name: sub, Completed: 0, Pending: 0 };
      }
      if (t.status === 'Done') {
        subjectMap[sub].Completed += 1;
      } else {
        subjectMap[sub].Pending += 1;
      }
    });
    return Object.values(subjectMap);
  };

  const tasksData = getTaskData();

  // 2. Mock Study Hours Data (Will link to Pomodoro later)
  const studyHoursData = [
    { name: 'Mon', Hours: 3.5 },
    { name: 'Tue', Hours: 4.8 },
    { name: 'Wed', Hours: 2.0 },
    { name: 'Thu', Hours: 5.2 },
    { name: 'Fri', Hours: 3.0 },
    { name: 'Sat', Hours: 6.5 },
    { name: 'Sun', Hours: 4.0 }
  ];

  const totalStudyHours = studyHoursData.reduce((acc, curr) => acc + curr.Hours, 0);
  const studyGoal = user?.studyGoal || 20;
  const goalAchievement = (totalStudyHours / studyGoal) * 100;

  // 3. Process Attendance Data (Pie Chart Distribution)
  const getAttendancePieData = () => {
    let totalAttended = 0;
    let totalConducted = 0;
    attendance.forEach((item) => {
      totalAttended += item.attended;
      totalConducted += item.conducted;
    });

    const missed = totalConducted - totalAttended;

    return [
      { name: 'Attended Classes', value: totalAttended, color: 'var(--color-success)' },
      { name: 'Missed Classes', value: Math.max(0, missed), color: 'var(--color-danger)' }
    ];
  };

  const attendancePieData = getAttendancePieData();
  const hasAttendanceData = attendance.some(a => a.conducted > 0);

  return (
    <div className="statistics-container">
      <div className="statistics-header">
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 700 }}>Performance Analytics</h2>
          <p className="text-sm text-muted">A summary of your academic attendance, task completions, and focus statistics.</p>
        </div>
      </div>

      {/* Top Overview Badges */}
      <div className="stats-overview-grid">
        <Card hoverable className="stat-card">
          <div className="stat-icon-wrapper success">
            <UserCheck size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Overall Attendance</span>
            <span className="stat-value">{overallPercentage.toFixed(1)}%</span>
          </div>
        </Card>

        <Card hoverable className="stat-card">
          <div className="stat-icon-wrapper primary">
            <Clock size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Weekly Study Hours</span>
            <span className="stat-value">{totalStudyHours.toFixed(1)}h / {studyGoal}h</span>
          </div>
        </Card>

        <Card hoverable className="stat-card">
          <div className="stat-icon-wrapper warning">
            <CheckSquare size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Tasks Finished</span>
            <span className="stat-value">
              {tasks.filter(t => t.status === 'Done').length} / {tasks.length}
            </span>
          </div>
        </Card>
      </div>

      <div className="stats-main-grid">
        {/* Left Side: Main Charts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Study Hours Trend (Line Chart) */}
          <Card className="chart-card">
            <h3 className="chart-title">
              <TrendingUp size={16} className="text-primary" />
              <span>Weekly Focus Hours Trend</span>
            </h3>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={studyHoursData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                  <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} />
                  <YAxis stroke="var(--text-muted)" fontSize={11} unit="h" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--bg-secondary)', 
                      borderColor: 'var(--border-color)', 
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-primary)'
                    }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="Hours" 
                    stroke="var(--color-primary)" 
                    strokeWidth={3} 
                    dot={{ fill: 'var(--color-primary)', strokeWidth: 2 }}
                    activeDot={{ r: 6 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Tasks Completion by Subject (Bar Chart) */}
          <Card className="chart-card">
            <h3 className="chart-title">
              <CheckSquare size={16} className="text-primary" />
              <span>Task Distribution by Course</span>
            </h3>
            <div className="chart-wrapper">
              {tasksData.length === 0 ? (
                <div className="panel-empty" style={{ minHeight: 'auto' }}>
                  <AlertCircle size={32} className="text-muted mb-2" />
                  <p className="text-sm">Create tasks in the Tasks Board to populate this chart.</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={tasksData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                    <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} />
                    <YAxis stroke="var(--text-muted)" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--bg-secondary)',
                        borderColor: 'var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--text-primary)'
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Bar dataKey="Completed" fill="var(--color-success)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Pending" fill="var(--color-warning)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>
        </div>

        {/* Right Side: Secondary Charts & Progress Lists */}
        <div className="stats-side-panel">
          
          {/* Attendance Pie Distribution */}
          <Card className="chart-card">
            <h3 className="chart-title">
              <BarChart3 size={16} className="text-primary" />
              <span>Attendance Distribution</span>
            </h3>
            <div className="chart-wrapper" style={{ height: '200px' }}>
              {!hasAttendanceData ? (
                <div className="panel-empty" style={{ minHeight: 'auto' }}>
                  <AlertCircle size={32} className="text-muted mb-2" />
                  <p className="text-sm">No lecture logs found.</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={attendancePieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {attendancePieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--bg-secondary)',
                        borderColor: 'var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--text-primary)',
                        fontSize: '11px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            
            {hasAttendanceData && (
              <div className="flex justify-between text-xs text-muted" style={{ padding: '0 1rem' }}>
                <span className="flex items-center gap-1">
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-success)', display: 'inline-block' }} /> Present
                </span>
                <span className="flex items-center gap-1">
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-danger)', display: 'inline-block' }} /> Absent
                </span>
              </div>
            )}
          </Card>

          {/* Subject Attendance Breakdown */}
          <Card className="chart-card">
            <h3 className="chart-title">
              <UserCheck size={16} className="text-primary" />
              <span>Course Attendance Details</span>
            </h3>
            <div className="attendance-progress-list">
              {attendance.length === 0 ? (
                <p className="text-xs text-muted text-center py-4">No subjects registered yet.</p>
              ) : (
                attendance.map((sub) => (
                  <div key={sub.id} className="attendance-progress-item">
                    <ProgressBar
                      value={sub.attended}
                      max={sub.conducted}
                      label={sub.subject}
                    />
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Focus Goals Card */}
          <Card className="chart-card">
            <h3 className="chart-title">
              <Clock size={16} className="text-primary" />
              <span>Weekly Focus Progress</span>
            </h3>
            <ProgressBar
              value={totalStudyHours}
              max={studyGoal}
              label={`${totalStudyHours.toFixed(1)} / ${studyGoal}h completed`}
            />
            <p className="text-xs text-muted mt-2" style={{ lineHeight: 1.4 }}>
              You have completed <strong style={{ color: 'var(--color-primary)' }}>{goalAchievement.toFixed(0)}%</strong> of your target {studyGoal} weekly study hours. Keep it up!
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
