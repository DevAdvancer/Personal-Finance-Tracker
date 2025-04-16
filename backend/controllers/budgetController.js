const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const { StatusCodes } = require('http-status-codes');
const { BadRequestError, NotFoundError } = require('../errors');
const mongoose = require('mongoose');
const currencyExchange = require('../utils/currencyExchange');

// Create Budget
const createBudget = async (req, res) => {
  // Add user ID to request body
  req.body.user = req.user.userId;

  // Get user currency preference
  const user = await User.findById(req.user.userId);
  const userCurrency = user.preferences.currency;

  // Set currency to user's preference
  req.body.currency = userCurrency;

  // Check if budget for this category already exists
  const existingBudget = await Budget.findOne({
    user: req.user.userId,
    category: req.body.category
  });

  if (existingBudget) {
    throw new BadRequestError(`Budget for category ${req.body.category} already exists`);
  }

  const budget = await Budget.create(req.body);
  res.status(StatusCodes.CREATED).json({ budget });
};

// Get All Budgets
const getAllBudgets = async (req, res) => {
  const budgets = await Budget.find({ user: req.user.userId });

  // Get current date for calculating period boundaries
  const now = new Date();

  // Get all budget progress information
  const budgetsWithProgress = await Promise.all(budgets.map(async (budget) => {
    // Calculate start and end dates based on period type
    let startDate, endDate;

    switch (budget.periodType) {
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        break;
      case 'quarterly':
        const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3;
        startDate = new Date(now.getFullYear(), quarterStartMonth, 1);
        endDate = new Date(now.getFullYear(), quarterStartMonth + 3, 0, 23, 59, 59, 999);
        break;
      case 'yearly':
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
        break;
      case 'custom':
        startDate = budget.startDate;
        endDate = budget.endDate;
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    }

    // Get transactions for this category within the budget period
    const transactions = await Transaction.find({
      user: req.user.userId,
      category: budget.category,
      date: { $gte: startDate, $lte: endDate },
      type: 'expense'  // Only count expenses against budget
    });

    // Calculate total spent
    const spent = transactions.reduce((total, transaction) => {
      return total + Math.abs(transaction.amount);
    }, 0);

    // Calculate remaining amount
    const remaining = budget.amount - spent;

    // Calculate percentage spent
    const percentSpent = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;

    // Return budget with additional progress information
    return {
      ...budget.toObject(),
      spent,
      remaining,
      percentSpent,
      status: percentSpent >= 100 ? 'exceeded' : percentSpent >= budget.notifications.threshold ? 'warning' : 'ok',
      periodStart: startDate,
      periodEnd: endDate,
      transactions: transactions
    };
  }));

  res.status(StatusCodes.OK).json({ budgets: budgetsWithProgress });
};

// Get Budget
const getBudget = async (req, res) => {
  const { id: budgetId } = req.params;

  const budget = await Budget.findOne({
    _id: budgetId,
    user: req.user.userId
  });

  if (!budget) {
    throw new NotFoundError(`No budget found with id ${budgetId}`);
  }

  // Get current date for calculating period boundaries
  const now = new Date();

  // Calculate start and end dates based on period type
  let startDate, endDate;

  switch (budget.periodType) {
    case 'monthly':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      break;
    case 'quarterly':
      const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3;
      startDate = new Date(now.getFullYear(), quarterStartMonth, 1);
      endDate = new Date(now.getFullYear(), quarterStartMonth + 3, 0, 23, 59, 59, 999);
      break;
    case 'yearly':
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
      break;
    case 'custom':
      startDate = budget.startDate;
      endDate = budget.endDate;
      break;
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  }

  // Get transactions for this category within the budget period
  const transactions = await Transaction.find({
    user: req.user.userId,
    category: budget.category,
    date: { $gte: startDate, $lte: endDate },
    type: 'expense'  // Only count expenses against budget
  }).sort({ date: -1 });

  // Calculate total spent
  const spent = transactions.reduce((total, transaction) => {
    return total + Math.abs(transaction.amount);
  }, 0);

  // Calculate remaining amount
  const remaining = budget.amount - spent;

  // Calculate percentage spent
  const percentSpent = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;

  // Add progress information to budget
  const budgetWithProgress = {
    ...budget.toObject(),
    spent,
    remaining,
    percentSpent,
    status: percentSpent >= 100 ? 'exceeded' : percentSpent >= budget.notifications.threshold ? 'warning' : 'ok',
    periodStart: startDate,
    periodEnd: endDate,
    transactions
  };

  res.status(StatusCodes.OK).json({ budget: budgetWithProgress });
};

// Get Budget by Category
const getBudgetByCategory = async (req, res) => {
  const { category } = req.params;

  const budget = await Budget.findOne({
    user: req.user.userId,
    category
  });

  if (!budget) {
    throw new NotFoundError(`No budget found for category ${category}`);
  }

  // Get current date for calculating period boundaries
  const now = new Date();

  // Calculate start and end dates based on period type
  let startDate, endDate;

  switch (budget.periodType) {
    case 'monthly':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      break;
    case 'quarterly':
      const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3;
      startDate = new Date(now.getFullYear(), quarterStartMonth, 1);
      endDate = new Date(now.getFullYear(), quarterStartMonth + 3, 0, 23, 59, 59, 999);
      break;
    case 'yearly':
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
      break;
    case 'custom':
      startDate = budget.startDate;
      endDate = budget.endDate;
      break;
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  }

  // Get transactions for this category within the budget period
  const transactions = await Transaction.find({
    user: req.user.userId,
    category: budget.category,
    date: { $gte: startDate, $lte: endDate },
    type: 'expense'  // Only count expenses against budget
  }).sort({ date: -1 });

  // Calculate total spent
  const spent = transactions.reduce((total, transaction) => {
    return total + Math.abs(transaction.amount);
  }, 0);

  // Calculate remaining amount
  const remaining = budget.amount - spent;

  // Calculate percentage spent
  const percentSpent = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;

  // Add progress information to budget
  const budgetWithProgress = {
    ...budget.toObject(),
    spent,
    remaining,
    percentSpent,
    status: percentSpent >= 100 ? 'exceeded' : percentSpent >= budget.notifications.threshold ? 'warning' : 'ok',
    periodStart: startDate,
    periodEnd: endDate,
    transactions
  };

  res.status(StatusCodes.OK).json({ budget: budgetWithProgress });
};

// Update Budget
const updateBudget = async (req, res) => {
  const { id: budgetId } = req.params;

  const budget = await Budget.findOneAndUpdate(
    { _id: budgetId, user: req.user.userId },
    req.body,
    { new: true, runValidators: true }
  );

  if (!budget) {
    throw new NotFoundError(`No budget found with id ${budgetId}`);
  }

  res.status(StatusCodes.OK).json({ budget });
};

// Delete Budget
const deleteBudget = async (req, res) => {
  const { id: budgetId } = req.params;

  const budget = await Budget.findOneAndDelete({
    _id: budgetId,
    user: req.user.userId
  });

  if (!budget) {
    throw new NotFoundError(`No budget found with id ${budgetId}`);
  }

  res.status(StatusCodes.OK).json({ msg: 'Budget successfully deleted' });
};

// Get Budget vs Actual Data
const getBudgetVsActual = async (req, res) => {
  const { period = 'month' } = req.query;

  // Get current date for calculating period boundaries
  const now = new Date();

  // Calculate start and end dates based on period
  let startDate, endDate;

  switch (period) {
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      break;
    case 'quarter':
      const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3;
      startDate = new Date(now.getFullYear(), quarterStartMonth, 1);
      endDate = new Date(now.getFullYear(), quarterStartMonth + 3, 0, 23, 59, 59, 999);
      break;
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
      break;
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  }

  // Get all budgets
  const budgets = await Budget.find({ user: req.user.userId });

  // Get spending by category
  const spendingByCategory = await Transaction.aggregate([
    {
      $match: {
        user: mongoose.Types.ObjectId(req.user.userId),
        date: { $gte: startDate, $lte: endDate },
        type: 'expense'
      }
    },
    {
      $group: {
        _id: '$category',
        actual: { $sum: { $abs: '$amount' } }
      }
    },
    {
      $project: {
        category: '$_id',
        actual: 1,
        _id: 0
      }
    }
  ]);

  // Combine budget and actual data
  const budgetVsActual = budgets.map(budget => {
    const spending = spendingByCategory.find(item => item.category === budget.category);
    return {
      category: budget.category,
      budget: budget.amount,
      actual: spending ? spending.actual : 0,
      remaining: budget.amount - (spending ? spending.actual : 0),
      percentUsed: spending ? (spending.actual / budget.amount) * 100 : 0
    };
  });

  // Add categories with spending but no budget
  spendingByCategory.forEach(spending => {
    if (!budgetVsActual.some(item => item.category === spending.category)) {
      budgetVsActual.push({
        category: spending.category,
        budget: 0,
        actual: spending.actual,
        remaining: -spending.actual,
        percentUsed: 100
      });
    }
  });

  // Sort by percentage used (descending)
  budgetVsActual.sort((a, b) => b.percentUsed - a.percentUsed);

  res.status(StatusCodes.OK).json({
    budgetVsActual,
    period,
    startDate,
    endDate
  });
};

module.exports = {
  createBudget,
  getAllBudgets,
  getBudget,
  getBudgetByCategory,
  updateBudget,
  deleteBudget,
  getBudgetVsActual
};
