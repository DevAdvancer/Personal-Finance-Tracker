import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
import apiService from '../../services/apiService';
import { useAuth } from '../../contexts/AuthContext';

// Predefined categories
const CATEGORIES = [
  'Food & Dining',
  'Shopping',
  'Housing',
  'Transportation',
  'Entertainment',
  'Health & Fitness',
  'Personal Care',
  'Education',
  'Travel',
  'Gifts & Donations',
  'Bills & Utilities',
  'Income',
  'Other'
];

// Payment methods
const PAYMENT_METHODS = [
  'Cash',
  'Credit Card',
  'Debit Card',
  'Bank Transfer',
  'Mobile Payment',
  'Other'
];

const AddTransaction = () => {
  const navigate = useNavigate();
  const { currentUser, formatCurrency } = useAuth();

  const [formData, setFormData] = useState({
    amount: '',
    date: new Date().toISOString().slice(0, 10),
    description: '',
    category: '',
    type: 'expense',
    paymentMethod: 'cash',
    notes: '',
    currency: currentUser?.preferences?.currency || 'USD'
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Clear error when field is changed
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.amount) {
      newErrors.amount = 'Amount is required';
    } else if (isNaN(Number(formData.amount))) {
      newErrors.amount = 'Amount must be a valid number';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      setIsSubmitting(true);

      // Convert amount to a number and handle expense/income
      let finalAmount = Number(formData.amount);
      if (formData.type === 'expense' && finalAmount > 0) {
        finalAmount = -finalAmount; // Make amount negative for expenses
      } else if (formData.type === 'income' && finalAmount < 0) {
        finalAmount = Math.abs(finalAmount); // Make amount positive for income
      }

      const transactionData = {
        ...formData,
        amount: finalAmount
      };

      await apiService.createTransaction(transactionData);
      navigate('/transactions');
    } catch (err) {
      console.error('Failed to create transaction:', err);
      setErrors({
        submit: err.response?.data?.msg || 'Failed to create transaction. Please try again.'
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center p-4 border-b">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/transactions')}
            className="mr-2 text-gray-600 hover:text-gray-900"
            type="button"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-xl font-semibold text-gray-800">Add Transaction</h2>
        </div>
      </div>

      <div className="p-6">
        {errors.submit && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <p>{errors.submit}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Transaction Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Transaction Type *
              </label>
              <div className="flex space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="type"
                    value="expense"
                    checked={formData.type === 'expense'}
                    onChange={handleChange}
                    className="form-radio h-4 w-4 text-indigo-600"
                  />
                  <span className="ml-2 text-gray-700">Expense</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="type"
                    value="income"
                    checked={formData.type === 'income'}
                    onChange={handleChange}
                    className="form-radio h-4 w-4 text-indigo-600"
                  />
                  <span className="ml-2 text-gray-700">Income</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="type"
                    value="transfer"
                    checked={formData.type === 'transfer'}
                    onChange={handleChange}
                    className="form-radio h-4 w-4 text-indigo-600"
                  />
                  <span className="ml-2 text-gray-700">Transfer</span>
                </label>
              </div>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount *
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">
                    {formData.currency === 'USD' ? '$' :
                     formData.currency === 'EUR' ? '€' :
                     formData.currency === 'GBP' ? '£' :
                     formData.currency === 'JPY' ? '¥' :
                     formData.currency === 'INR' ? '₹' : '$'}
                  </span>
                </div>
                <input
                  type="text"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  className={`block w-full pl-7 pr-12 py-2 border ${
                    errors.amount ? 'border-red-500' : 'border-gray-300'
                  } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                  placeholder="0.00"
                  aria-describedby="amount-helper"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500" id="amount-helper">
                    {formData.currency}
                  </span>
                </div>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                {formData.type === 'expense'
                  ? 'Enter a positive amount. It will be recorded as an expense.'
                  : formData.type === 'income'
                  ? 'Enter a positive amount. It will be recorded as income.'
                  : 'Enter a positive amount for the transfer.'}
              </p>
              {errors.amount && (
                <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className={`block w-full px-3 py-2 border ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                placeholder="What was this transaction for?"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date *
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className={`block w-full px-3 py-2 border ${
                  errors.date ? 'border-red-500' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
              />
              {errors.date && (
                <p className="mt-1 text-sm text-red-600">{errors.date}</p>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`block w-full px-3 py-2 border ${
                  errors.category ? 'border-red-500' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
              >
                <option value="">Select a category</option>
                {CATEGORIES.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">{errors.category}</p>
              )}
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Method
              </label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                {PAYMENT_METHODS.map(method => (
                  <option key={method} value={method.toLowerCase().replace(' ', '-')}>
                    {method}
                  </option>
                ))}
              </select>
            </div>

            {/* Notes */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Add any additional details about this transaction"
              />
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              type="button"
              onClick={() => navigate('/transactions')}
              className="mr-3 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center"
            >
              <Save size={16} className="mr-2" />
              {isSubmitting ? 'Saving...' : 'Save Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTransaction;
