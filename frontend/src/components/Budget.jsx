import { useState, useEffect } from 'react';
import { Pencil, Check, X, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';
import apiService from '../services/apiService';

const Budget = () => {
  const [budgetData, setBudgetData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [newBudgetAmount, setNewBudgetAmount] = useState('');
  const [insights, setInsights] = useState([]);

  useEffect(() => {
    fetchBudgetData();
  }, []);

  const fetchBudgetData = async () => {
    try {
      setLoading(true);
      const data = await apiService.getBudgetData();
      setBudgetData(data);
      generateInsights(data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch budget data:', err);
      setError('Failed to load budget data');
      setLoading(false);
    }
  };

  const generateInsights = (data) => {
    const newInsights = [];

    // Find categories over budget
    const overBudgetCategories = data
      .filter(item => item.budget > 0 && item.actual > item.budget)
      .sort((a, b) => (b.actual / b.budget) - (a.actual / a.budget));

    if (overBudgetCategories.length > 0) {
      const worst = overBudgetCategories[0];
      const percentOver = ((worst.actual - worst.budget) / worst.budget * 100).toFixed(0);

      newInsights.push({
        type: 'warning',
        message: `You've exceeded your "${worst.category}" budget by ${percentOver}%`,
        icon: AlertTriangle
      });
    }

    // Find categories with good progress
    const goodProgressCategories = data
      .filter(item => item.budget > 0 && item.actual <= item.budget * 0.7)
      .sort((a, b) => (a.actual / a.budget) - (b.actual / b.budget));

    if (goodProgressCategories.length > 0) {
      const best = goodProgressCategories[0];
      const percentUsed = ((best.actual / best.budget) * 100).toFixed(0);

      newInsights.push({
        type: 'success',
        message: `Great job! You've only used ${percentUsed}% of your "${best.category}" budget`,
        icon: TrendingDown
      });
    }

    // Categories with no budget
    const noBudgetCategories = data.filter(item => item.budget === 0 && item.actual > 0);

    if (noBudgetCategories.length > 0) {
      newInsights.push({
        type: 'info',
        message: `${noBudgetCategories.length} categories have spending but no budget set`,
        icon: TrendingUp
      });
    }

    setInsights(newInsights);
  };

  const startEditing = (category, currentBudget) => {
    setEditingCategory(category);
    setNewBudgetAmount(currentBudget.toString());
  };

  const cancelEditing = () => {
    setEditingCategory(null);
    setNewBudgetAmount('');
  };

  const saveBudget = async (category) => {
    try {
      const budgetAmount = parseFloat(newBudgetAmount);

      if (isNaN(budgetAmount) || budgetAmount < 0) {
        alert('Please enter a valid budget amount');
        return;
      }

      await apiService.updateBudget(category, budgetAmount);
      await fetchBudgetData();
      cancelEditing();
    } catch (err) {
      console.error('Failed to update budget:', err);
      alert('Failed to update budget. Please try again.');
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  // Calculate percentage of budget used
  const calculatePercentage = (actual, budget) => {
    if (budget <= 0) return 100;
    return Math.min(Math.round((actual / budget) * 100), 100);
  };

  if (loading) return <div className="text-center py-4">Loading budget data...</div>;
  if (error) return <div className="text-center text-red-500 py-4">{error}</div>;

  return (
    <div className="space-y-6">
      {/* Budget Insights */}
      {insights.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Budget Insights</h2>
          <div className="space-y-4">
            {insights.map((insight, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg flex items-start ${
                  insight.type === 'warning'
                    ? 'bg-yellow-50 text-yellow-800'
                    : insight.type === 'success'
                    ? 'bg-green-50 text-green-800'
                    : 'bg-blue-50 text-blue-800'
                }`}
              >
                <insight.icon size={20} className="mr-3 mt-0.5 flex-shrink-0" />
                <p>{insight.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Budget vs Actual Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-800 mb-4">Budget vs Actual</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={budgetData.filter(item => item.budget > 0 || item.actual > 0)}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tickFormatter={formatCurrency} />
              <YAxis type="category" dataKey="category" width={150} />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
              <Bar dataKey="budget" name="Budget" fill="#8884d8" />
              <Bar dataKey="actual" name="Actual" fill="#82ca9d" />
              <ReferenceLine x={0} stroke="#000" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Budget Management */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-800">Manage Budget Categories</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Budget
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actual
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Remaining
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {budgetData
                .filter(item => item.budget > 0 || item.actual > 0)
                .sort((a, b) => {
                  // Sort by percentage of budget used (desc)
                  const percentA = a.budget > 0 ? a.actual / a.budget : Infinity;
                  const percentB = b.budget > 0 ? b.actual / b.budget : Infinity;
                  return percentB - percentA;
                })
                .map((item) => (
                  <tr key={item.category} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {editingCategory === item.category ? (
                        <div className="flex items-center">
                          <div className="relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <span className="text-gray-500 sm:text-sm">$</span>
                            </div>
                            <input
                              type="text"
                              value={newBudgetAmount}
                              onChange={(e) => setNewBudgetAmount(e.target.value)}
                              className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                              placeholder="0.00"
                            />
                          </div>
                        </div>
                      ) : (
                        formatCurrency(item.budget)
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(item.actual)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.budget > 0 ? (
                        <span className={item.budget - item.actual >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {formatCurrency(item.budget - item.actual)}
                        </span>
                      ) : (
                        'N/A'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full ${
                            calculatePercentage(item.actual, item.budget) >= 100
                              ? 'bg-red-600'
                              : calculatePercentage(item.actual, item.budget) >= 80
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                          }`}
                          style={{ width: `${calculatePercentage(item.actual, item.budget)}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {item.budget > 0
                          ? `${calculatePercentage(item.actual, item.budget)}% used`
                          : 'No budget set'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {editingCategory === item.category ? (
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => saveBudget(item.category)}
                            className="text-green-600 hover:text-green-900"
                          >
                            <Check size={18} />
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="text-red-600 hover:text-red-900"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEditing(item.category, item.budget)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <Pencil size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Budget;
