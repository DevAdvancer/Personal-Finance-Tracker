import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, DollarSign, PieChart, TrendingUp, ChevronRight, Plus } from 'lucide-react';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import apiService from '../services/apiService';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    totalExpenses: 0,
    categoryBreakdown: [],
    recentTransactions: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const data = await apiService.getDashboardData();
        setDashboardData(data);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError('Failed to load dashboard data');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Colors for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

  if (loading) return <div className="text-center py-4">Loading dashboard data...</div>;
  if (error) return <div className="text-center text-red-500 py-4">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Expenses Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-indigo-100 text-indigo-600">
              <DollarSign size={24} />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Expenses</h3>
              <p className="text-2xl font-semibold text-gray-900">{formatCurrency(dashboardData.totalExpenses)}</p>
            </div>
          </div>
        </div>

        {/* Categories Overview Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <PieChart size={24} />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Categories</h3>
              <p className="text-2xl font-semibold text-gray-900">{dashboardData.categoryBreakdown.length}</p>
            </div>
          </div>
        </div>

        {/* Average per Transaction Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <TrendingUp size={24} />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Avg. Expense</h3>
              <p className="text-2xl font-semibold text-gray-900">
                {formatCurrency(
                  dashboardData.recentTransactions.length
                    ? dashboardData.totalExpenses / dashboardData.categoryBreakdown.length
                    : 0
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-800">Category Breakdown</h2>
          </div>

          <div className="p-6">
            {dashboardData.categoryBreakdown.length === 0 ? (
              <p className="text-center text-gray-500 py-6">No expense data available</p>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={dashboardData.categoryBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="amount"
                      nameKey="category"
                      label={({ category, percent }) => `${category}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {dashboardData.categoryBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="mt-4 space-y-2">
              {dashboardData.categoryBreakdown.slice(0, 5).map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></div>
                    <span className="text-sm text-gray-600">{category.category}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-900 mr-2">
                      {formatCurrency(category.amount)}
                    </span>
                    <span className="text-xs text-gray-500">({category.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-800">Recent Transactions</h2>
            <Link
              to="/transactions/add"
              className="flex items-center text-sm text-indigo-600 hover:text-indigo-900 font-medium"
            >
              <Plus size={16} className="mr-1" />
              Add New
            </Link>
          </div>

          <div className="divide-y divide-gray-200">
            {dashboardData.recentTransactions.length === 0 ? (
              <p className="text-center text-gray-500 py-6">No recent transactions</p>
            ) : (
              dashboardData.recentTransactions.map((transaction) => (
                <div key={transaction._id} className="px-6 py-4 flex items-center">
                  <div className="p-2 rounded-full bg-gray-100 mr-4">
                    <CreditCard size={20} className="text-gray-600" />
                  </div>

                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900">{transaction.description}</h3>
                    <p className="text-xs text-gray-500">
                      {formatDate(transaction.date)} • {transaction.category}
                    </p>
                  </div>

                  <div className={`text-sm font-medium ${transaction.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {formatCurrency(transaction.amount)}
                  </div>

                  <Link to={`/transactions/edit/${transaction._id}`} className="ml-4 text-gray-400 hover:text-gray-600">
                    <ChevronRight size={16} />
                  </Link>
                </div>
              ))
            )}
          </div>

          <div className="px-6 py-4 border-t border-gray-200">
            <Link
              to="/transactions"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-900 flex items-center justify-center"
            >
              View All Transactions
              <ChevronRight size={16} className="ml-1" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
