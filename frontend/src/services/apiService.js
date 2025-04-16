import axios from 'axios';

// Get API URL from environment variables or use default
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

// Create axios instance with baseURL
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle unauthorized errors (redirect to login)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

const apiService = {
  // Auth
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    // Save token and user to localStorage
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    // Save token and user to localStorage
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.patch('/auth/profile', profileData);
    // Update stored user data
    localStorage.setItem('user', JSON.stringify(response.data.user));
    return response.data;
  },

  updatePreferences: async (preferences) => {
    const response = await api.patch('/auth/preferences', { preferences });
    // Update stored user data
    localStorage.setItem('user', JSON.stringify(response.data.user));
    return response.data;
  },

  changePassword: async (passwordData) => {
    const response = await api.patch('/auth/password', passwordData);
    return response.data;
  },

  // Transactions
  getTransactions: async (filters = {}) => {
    const response = await api.get('/transactions', { params: filters });
    return response.data;
  },

  getTransaction: async (id) => {
    const response = await api.get(`/transactions/${id}`);
    return response.data;
  },

  createTransaction: async (transaction) => {
    const response = await api.post('/transactions', transaction);
    return response.data;
  },

  updateTransaction: async (id, transaction) => {
    const response = await api.patch(`/transactions/${id}`, transaction);
    return response.data;
  },

  deleteTransaction: async (id) => {
    const response = await api.delete(`/transactions/${id}`);
    return response.data;
  },

  getTransactionSummary: async (params = {}) => {
    const response = await api.get('/transactions/summary', { params });
    return response.data;
  },

  // Budgets
  getBudgets: async () => {
    const response = await api.get('/budgets');
    return response.data;
  },

  getBudget: async (id) => {
    const response = await api.get(`/budgets/${id}`);
    return response.data;
  },

  getBudgetByCategory: async (category) => {
    const response = await api.get(`/budgets/category/${category}`);
    return response.data;
  },

  createBudget: async (budget) => {
    const response = await api.post('/budgets', budget);
    return response.data;
  },

  updateBudget: async (id, budget) => {
    const response = await api.patch(`/budgets/${id}`, budget);
    return response.data;
  },

  deleteBudget: async (id) => {
    const response = await api.delete(`/budgets/${id}`);
    return response.data;
  },

  getBudgetVsActual: async (params = {}) => {
    const response = await api.get('/budgets/vs-actual', { params });
    return response.data;
  }
};

export default apiService;
