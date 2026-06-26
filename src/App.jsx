import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Providers
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationsProvider } from './context/NotificationsContext';
import { ToastProvider } from './context/ToastContext';
import { NotesProvider } from './context/NotesContext';
import { TasksProvider } from './context/TasksContext';
import { TimetableProvider } from './context/TimetableContext';
import { AttendanceProvider } from './context/AttendanceContext';
import { PomodoroProvider } from './context/PomodoroContext';
import { GoalsProvider } from './context/GoalsContext';

// Components
import ErrorBoundary from './components/ErrorBoundary';
import ToastContainer from './components/Toast';
import CommandBar from './components/CommandBar';
import Layout from './layouts/Layout';

// Pages
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Profile from './pages/Auth/Profile';
import Dashboard from './pages/Dashboard/Dashboard';
import Notes from './pages/Notes/Notes';
import Tasks from './pages/Tasks/Tasks';
import Timetable from './pages/Timetable/Timetable';
import Attendance from './pages/Attendance/Attendance';
import Statistics from './pages/Statistics/Statistics';
import Pomodoro from './pages/Pomodoro/Pomodoro';
import Goals from './pages/Goals/Goals';
import Calendar from './pages/Calendar/Calendar';
import Assistant from './pages/Assistant/Assistant';
import Settings from './pages/Settings/Settings';

// Global Styles
import './styles/index.css';
import './styles/layout.css';
import './styles/components.css';

// Private Route Wrapper
const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const AppContent = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Private Layout-wrapped Routes */}
        <Route
          path="/*"
          element={
            <PrivateRoute>
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/notes" element={<Notes />} />
                  <Route path="/tasks" element={<Tasks />} />
                  <Route path="/timetable" element={<Timetable />} />
                  <Route path="/attendance" element={<Attendance />} />
                  <Route path="/statistics" element={<Statistics />} />
                  <Route path="/pomodoro" element={<Pomodoro />} />
                  <Route path="/goals" element={<Goals />} />
                  <Route path="/calendar" element={<Calendar />} />
                  <Route path="/assistant" element={<Assistant />} />
                  <Route path="/settings" element={<Settings />} />
                  {/* Catch-all redirects to dashboard */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Layout>
            </PrivateRoute>
          }
        />
      </Routes>
      <ToastContainer />
      <CommandBar />
    </BrowserRouter>
  );
};

export function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <NotificationsProvider>
            <ToastProvider>
              <NotesProvider>
                <TasksProvider>
                  <TimetableProvider>
                    <AttendanceProvider>
                      <PomodoroProvider>
                        <GoalsProvider>
                          <AppContent />
                        </GoalsProvider>
                      </PomodoroProvider>
                    </AttendanceProvider>
                  </TimetableProvider>
                </TasksProvider>
              </NotesProvider>
            </ToastProvider>
          </NotificationsProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
