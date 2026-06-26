// API Facade Layer: Handles Backend server communication with LocalStorage fallback

const API_BASE_URL = 'http://localhost:5000/api';

// Helper to get headers with JWT token
const getHeaders = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = user?.token || '';
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

// Helper check to see if we should run in offline local fallback mode
const isOfflineMode = () => {
  return localStorage.getItem('isOfflineMode') === 'true' || !localStorage.getItem('user')?.includes('token');
};

// Unified fetch request wrapper
const request = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getHeaders(),
      ...options.headers
    }
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Request failed');
  }

  return response.json();
};

export const api = {
  // Authentication / User Endpoints
  auth: {
    login: async (email, password) => {
      try {
        const data = await request('/users/login', {
          method: 'POST',
          body: JSON.stringify({ email, password })
        });
        localStorage.setItem('isOfflineMode', 'false');
        return { success: true, user: data };
      } catch (error) {
        console.warn('API Auth failed, falling back to local credentials', error.message);
        // Fallback to local mode
        localStorage.setItem('isOfflineMode', 'true');
        return null; // triggers Context to run local mock fallback
      }
    },
    register: async (name, email, password) => {
      try {
        const data = await request('/users', {
          method: 'POST',
          body: JSON.stringify({ name, email, password })
        });
        localStorage.setItem('isOfflineMode', 'false');
        return { success: true, user: data };
      } catch (error) {
        console.warn('API Register failed, falling back to local mode', error.message);
        localStorage.setItem('isOfflineMode', 'true');
        return null;
      }
    },
    updateProfile: async (profileData) => {
      if (isOfflineMode()) return null;
      return request('/users/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData)
      });
    }
  },

  // Notes Endpoints
  notes: {
    getAll: async () => {
      if (isOfflineMode()) return null;
      return request('/notes');
    },
    create: async (note) => {
      if (isOfflineMode()) return null;
      return request('/notes', {
        method: 'POST',
        body: JSON.stringify(note)
      });
    },
    update: async (id, note) => {
      if (isOfflineMode()) return null;
      return request(`/notes/${id}`, {
        method: 'PUT',
        body: JSON.stringify(note)
      });
    },
    delete: async (id) => {
      if (isOfflineMode()) return null;
      return request(`/notes/${id}`, {
        method: 'DELETE'
      });
    }
  },

  // Tasks Endpoints
  tasks: {
    getAll: async () => {
      if (isOfflineMode()) return null;
      return request('/tasks');
    },
    create: async (task) => {
      if (isOfflineMode()) return null;
      return request('/tasks', {
        method: 'POST',
        body: JSON.stringify(task)
      });
    },
    update: async (id, task) => {
      if (isOfflineMode()) return null;
      return request(`/tasks/${id}`, {
        method: 'PUT',
        body: JSON.stringify(task)
      });
    },
    delete: async (id) => {
      if (isOfflineMode()) return null;
      return request(`/tasks/${id}`, {
        method: 'DELETE'
      });
    }
  },

  // Timetable Endpoints
  timetable: {
    getAll: async () => {
      if (isOfflineMode()) return null;
      return request('/timetable');
    },
    create: async (classSession) => {
      if (isOfflineMode()) return null;
      return request('/timetable', {
        method: 'POST',
        body: JSON.stringify(classSession)
      });
    },
    delete: async (id) => {
      if (isOfflineMode()) return null;
      return request(`/timetable/${id}`, {
        method: 'DELETE'
      });
    }
  },

  // Attendance Endpoints
  attendance: {
    getAll: async () => {
      if (isOfflineMode()) return null;
      return request('/attendance');
    },
    create: async (record) => {
      if (isOfflineMode()) return null;
      return request('/attendance', {
        method: 'POST',
        body: JSON.stringify(record)
      });
    },
    update: async (id, record) => {
      if (isOfflineMode()) return null;
      return request(`/attendance/${id}`, {
        method: 'PUT',
        body: JSON.stringify(record)
      });
    },
    delete: async (id) => {
      if (isOfflineMode()) return null;
      return request(`/attendance/${id}`, {
        method: 'DELETE'
      });
    }
  },

  // Goals Endpoints
  goals: {
    getAll: async () => {
      if (isOfflineMode()) return null;
      return request('/goals');
    },
    create: async (goal) => {
      if (isOfflineMode()) return null;
      return request('/goals', {
        method: 'POST',
        body: JSON.stringify(goal)
      });
    },
    update: async (id, goal) => {
      if (isOfflineMode()) return null;
      return request(`/goals/${id}`, {
        method: 'PUT',
        body: JSON.stringify(goal)
      });
    },
    delete: async (id) => {
      if (isOfflineMode()) return null;
      return request(`/goals/${id}`, {
        method: 'DELETE'
      });
    }
  }
};

export default api;
