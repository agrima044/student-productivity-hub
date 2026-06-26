import React, { createContext, useContext, useState, useEffect } from 'react';

const NotificationsContext = createContext();

const MOCK_NOTIFICATIONS = [
  {
    id: 'welcome-notification',
    title: 'Welcome to your Hub! 🚀',
    description: 'Track your studies, organize tasks, take rich notes, and monitor your attendance all in one place.',
    type: 'success',
    read: false,
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 mins ago
  },
  {
    id: 'demo-tip',
    title: 'Pro-Tip: Pomodoro ⏱️',
    description: 'Link your active Pomodoro sessions directly to tasks to capture detailed study statistics.',
    type: 'info',
    read: false,
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 mins ago
  }
];

export const NotificationsProvider = ({ children }) => {
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('notifications');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return MOCK_NOTIFICATIONS;
      }
    }
    return MOCK_NOTIFICATIONS;
  });

  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);

  const addNotification = (title, description, type = 'info') => {
    const newNotification = {
      id: Date.now().toString(),
      title,
      description,
      type,
      read: false,
      timestamp: new Date().toISOString()
    };
    setNotifications((prev) => [newNotification, ...prev]);
  };

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearNotification,
        clearAll,
        unreadCount
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
};
