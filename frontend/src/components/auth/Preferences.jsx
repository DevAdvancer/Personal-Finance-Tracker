import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { DollarSign, Calendar, PaintBucket, Save, AlertCircle, Check } from 'lucide-react';

const Preferences = () => {
  const { currentUser, updatePreferences } = useAuth();

  const [preferences, setPreferences] = useState({
    currency: currentUser?.preferences?.currency || 'USD',
    dateFormat: currentUser?.preferences?.dateFormat || 'MM/DD/YYYY',
    theme: currentUser?.preferences?.theme || 'light'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPreferences(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError('');
      setSuccess(false);
      setLoading(true);

      await updatePreferences(preferences);

      setSuccess(true);

      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to update preferences');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">User Preferences</h2>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
          <div className="flex items-center">
            <Check className="h-5 w-5 text-green-500 mr-2" />
            <p className="text-sm text-green-700">Preferences updated successfully</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">
              Currency
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign className="h-5 w-5 text-gray-400" />
              </div>
              <select
                id="currency"
                name="currency"
                value={preferences.currency}
                onChange={handleChange}
                className="pl-10 focus:ring-indigo-500 focus:border-indigo-500 block w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="USD">US Dollar (USD)</option>
                <option value="INR">Indian Rupee (INR)</option>
                <option value="EUR">Euro (EUR)</option>
                <option value="GBP">British Pound (GBP)</option>
                <option value="JPY">Japanese Yen (JPY)</option>
                <option value="CAD">Canadian Dollar (CAD)</option>
                <option value="AUD">Australian Dollar (AUD)</option>
              </select>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              This affects how currency amounts are displayed throughout the app.
            </p>
          </div>

          <div>
            <label htmlFor="dateFormat" className="block text-sm font-medium text-gray-700 mb-1">
              Date Format
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
              <select
                id="dateFormat"
                name="dateFormat"
                value={preferences.dateFormat}
                onChange={handleChange}
                className="pl-10 focus:ring-indigo-500 focus:border-indigo-500 block w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              This affects how dates are displayed throughout the app.
            </p>
          </div>

          <div>
            <label htmlFor="theme" className="block text-sm font-medium text-gray-700 mb-1">
              Theme
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <PaintBucket className="h-5 w-5 text-gray-400" />
              </div>
              <select
                id="theme"
                name="theme"
                value={preferences.theme}
                onChange={handleChange}
                className="pl-10 focus:ring-indigo-500 focus:border-indigo-500 block w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Choose the visual theme for the application.
            </p>
          </div>
        </div>

        <div className="mt-6">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Preferences;
