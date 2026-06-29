/**
 * API Client
 * Centralized API calls with proper error handling and authorization
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const getToken = () => localStorage.getItem('tf_token');

const setToken = (token) => localStorage.setItem('tf_token', token);

const removeToken = () => localStorage.removeItem('tf_token');

/**
 * Make API request with token
 */
const request = async (endpoint, options = {}) => {
  const url = `${API_URL}${endpoint}`;
  const token = getToken();

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    credentials: 'include',
    ...options,
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      if (response.status === 401) {
        removeToken();
        window.location.href = '/login';
      }
      const error = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
      throw new Error(error.error || `API Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error.message);
    throw error;
  }
};

/**
 * API Methods
 */
export const api = {
  // Auth
  register: ({ name, email, password }) =>
    request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }).then(data => {
      if (data.token) setToken(data.token);
      return data;
    }),

  login: ({ email, password }) =>
    request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }).then(data => {
      if (data.token) setToken(data.token);
      return data;
    }),

  me: () =>
    request('/api/auth/me', { method: 'GET' }),

  // Tasks
  getTasks: () =>
    request('/api/tasks', { method: 'GET' }),

  createTask: ({ title, description }) =>
    request('/api/tasks', {
      method: 'POST',
      body: JSON.stringify({ title, description }),
    }),

  updateTask: (id, updates) =>
    request(`/api/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),

  deleteTask: (id) =>
    request(`/api/tasks/${id}`, { method: 'DELETE' }),

  // Stripe
  createCheckoutSession: ({ planType }) =>
    request('/api/stripe/create-checkout-session', {
      method: 'POST',
      body: JSON.stringify({ planType }),
    }),
};

export const logout = () => {
  removeToken();
};
