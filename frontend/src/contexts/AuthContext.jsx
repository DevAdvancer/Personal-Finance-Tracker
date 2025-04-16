import { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/apiService';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if there's a stored user
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Register new user
  const register = async (name, email, password) => {
    setError(null);
    try {
      const response = await apiService.register({ name, email, password });
      setCurrentUser(response.user);
      return response;
    } catch (err) {
      setError(err.response?.data?.msg || 'Registration failed');
      throw err;
    }
  };

  // Login user
  const login = async (email, password) => {
    setError(null);
    try {
      const response = await apiService.login({ email, password });
      setCurrentUser(response.user);
      return response;
    } catch (err) {
      setError(err.response?.data?.msg || 'Login failed');
      throw err;
    }
  };

  // Logout user
  const logout = () => {
    apiService.logout();
    setCurrentUser(null);
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    setError(null);
    try {
      const response = await apiService.updateProfile(profileData);
      setCurrentUser(response.user);
      return response;
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to update profile');
      throw err;
    }
  };

  // Update user preferences
  const updatePreferences = async (preferences) => {
    setError(null);
    try {
      const response = await apiService.updatePreferences(preferences);
      setCurrentUser(response.user);
      return response;
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to update preferences');
      throw err;
    }
  };

  // Change password
  const changePassword = async (currentPassword, newPassword) => {
    setError(null);
    try {
      return await apiService.changePassword({ currentPassword, newPassword });
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to change password');
      throw err;
    }
  };

  // Format currency based on user preferences
  const formatCurrency = (amount) => {
    const currency = currentUser?.preferences?.currency || 'USD';
    const currencyMap = {
      USD: { locale: 'en-US', currency: 'USD', symbol: '$' },
      INR: { locale: 'en-IN', currency: 'INR', symbol: '₹' },
      EUR: { locale: 'de-DE', currency: 'EUR', symbol: '€' },
      GBP: { locale: 'en-GB', currency: 'GBP', symbol: '£' },
      JPY: { locale: 'ja-JP', currency: 'JPY', symbol: '¥' },
      CAD: { locale: 'en-CA', currency: 'CAD', symbol: 'C$' },
      AUD: { locale: 'en-AU', currency: 'AUD', symbol: 'A$' }
    };

    const { locale, currency: currencyCode } = currencyMap[currency] || currencyMap.USD;

    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode
    }).format(amount);
  };

  // Format date based on user preferences
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const format = currentUser?.preferences?.dateFormat || 'MM/DD/YYYY';

    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    switch (format) {
      case 'MM/DD/YYYY':
        return `${month}/${day}/${year}`;
      case 'DD/MM/YYYY':
        return `${day}/${month}/${year}`;
      case 'YYYY-MM-DD':
        return `${year}-${month}-${day}`;
      default:
        return `${month}/${day}/${year}`;
    }
  };

  const value = {
    currentUser,
    loading,
    error,
    register,
    login,
    logout,
    updateProfile,
    updatePreferences,
    changePassword,
    formatCurrency,
    formatDate
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
