import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationsContext';
import {
  LayoutDashboard,
  FileText,
  CheckSquare,
  Clock,
  UserCheck,
  BarChart3,
  Timer,
  Target,
  CalendarDays,
  Settings,
  Sparkles,
  Sun,
  Moon,
  LogOut,
  Bell,
  Menu,
  X,
  User,
  Search
} from 'lucide-react';
import './Layout.css';

export const Layout = ({ children }) => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotifications();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const notifRef = useRef(null);
  const userMenuRef = useRef(null);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close sidebar on navigate (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/notes', label: 'Notes', icon: FileText },
    { to: '/tasks', label: 'Tasks', icon: CheckSquare },
    { to: '/timetable', label: 'Timetable', icon: Clock },
    { to: '/attendance', label: 'Attendance', icon: UserCheck },
    { to: '/statistics', label: 'Statistics', icon: BarChart3 },
    { to: '/pomodoro', label: 'Pomodoro Timer', icon: Timer },
    { to: '/goals', label: 'Goals', icon: Target },
    { to: '/calendar', label: 'Calendar', icon: CalendarDays },
    { to: '/assistant', label: 'AI Assistant', icon: Sparkles },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className={`app-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-text">STUDENT HUB</div>
          <button 
            className="menu-toggle" 
            style={{ marginLeft: 'auto', display: sidebarOpen ? 'flex' : 'none' }}
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-menu">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              >
                <Icon size={18} />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-link w-full" onClick={toggleTheme} style={{ border: 'none', background: 'none', textAlign: 'left' }}>
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
          </button>
          <button className="sidebar-link w-full" onClick={handleLogout} style={{ border: 'none', background: 'none', textAlign: 'left', color: 'var(--color-danger)' }}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Header Area */}
      <header className="app-header">
        <div className="header-left">
          <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <Menu size={20} />
          </button>
          
          {/* Custom Search Command Bar Helper */}
          <div className="header-search">
            <Search size={16} className="header-search-icon" />
            <input 
              type="text" 
              placeholder="Search or type Command (Ctrl+K)..." 
              readOnly 
              onClick={() => window.dispatchEvent(new CustomEvent('toggle-command-bar'))}
              style={{ cursor: 'pointer' }}
            />
          </div>
        </div>

        <div className="header-right">
          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef} style={{ position: 'relative' }}>
            <button className="header-btn" onClick={() => setShowNotifications(!showNotifications)}>
              <Bell size={20} />
              {unreadCount > 0 && <span className="notification-badge" />}
            </button>

            {showNotifications && (
              <div className="notifications-dropdown">
                <div className="dropdown-header">
                  <h3>Notifications</h3>
                  {unreadCount > 0 && (
                    <button className="text-xs font-semibold text-primary" onClick={markAllAsRead} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer' }}>
                      Mark all as read
                    </button>
                  )}
                </div>
                
                <div className="dropdown-body">
                  {notifications.length === 0 ? (
                    <div className="dropdown-empty">No notifications</div>
                  ) : (
                    notifications.map((n) => (
                      <div 
                        key={n.id} 
                        className={`notification-item ${n.read ? 'read' : ''} type-${n.type}`}
                        onClick={() => markAsRead(n.id)}
                      >
                        <div className="notification-indicator" />
                        <div className="notification-text">
                          <h4 className="notification-title">{n.title}</h4>
                          <p className="notification-desc">{n.description}</p>
                          <span className="notification-time">
                            {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                
                {notifications.length > 0 && (
                  <div className="dropdown-footer">
                    <button onClick={clearAll} style={{ width: '100%', background: 'none', border: 'none', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', cursor: 'pointer' }}>
                      Clear all
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User Profile dropdown */}
          {user && (
            <div className="relative" ref={userMenuRef} style={{ position: 'relative' }}>
              <div className="user-profile-trigger" onClick={() => setShowUserMenu(!showUserMenu)}>
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="user-avatar" />
                ) : (
                  <div className="user-avatar-placeholder"><User size={16} /></div>
                )}
                <span className="user-name-display text-sm font-medium" style={{ display: 'inline' }}>
                  {user.name}
                </span>
              </div>

              {showUserMenu && (
                <div className="user-dropdown">
                  <div className="user-dropdown-header">
                    <h4>{user.name}</h4>
                    <p>{user.email}</p>
                  </div>
                  <div className="user-dropdown-body">
                    <button className="dropdown-item" onClick={() => { setShowUserMenu(false); navigate('/profile'); }}>
                      <User size={14} />
                      <span>My Profile</span>
                    </button>
                    <button className="dropdown-item" onClick={() => { setShowUserMenu(false); navigate('/settings'); }}>
                      <Settings size={14} />
                      <span>Settings</span>
                    </button>
                    <button className="dropdown-item text-danger" onClick={handleLogout} style={{ color: 'var(--color-danger)' }}>
                      <LogOut size={14} />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Main Content Pane */}
      <main className="app-main">
        {children}
      </main>
    </div>
  );
};

export default Layout;
