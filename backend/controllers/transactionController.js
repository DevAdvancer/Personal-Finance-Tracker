const Transaction = require('../models/Transaction');
const User = require('../models/User');
const { StatusCodes } = require('http-status-codes');
const { BadRequestError, NotFoundError } = require('../errors');
const currencyExchange = require('../utils/currencyExchange');

// Create Transaction
const createTransaction = async (req, res) => {
  // Add user ID to request body
  req.body.user = req.user.userId;

  // Get user currency preference
  const user = await User.findById(req.user.userId);
  const userCurrency = user.preferences.currency;

  // If transaction currency is different from user preference currency, convert and store original amount
  if (req.body.currency && req.body.currency !== userCurrency) {
    const { originalAmount, exchangeRate } = await currencyExchange.convert(
      req.body.amount,
      req.body.currency,
      userCurrency
    );

    req.body.originalAmount = req.body.amount;
    req.body.originalCurrency = req.body.currency;
    req.body.amount = originalAmount;
    req.body.exchangeRate = exchangeRate;
    req.body.currency = userCurrency;
  } else {
    // Default to user's currency preference if not specified
    req.body.currency = userCurrency;
  }

  const transaction = await Transaction.create(req.body);
  res.status(StatusCodes.CREATED).json({ transaction });
};

// Get All Transactions
const getAllTransactions = async (req, res) => {
  const {
    startDate,
    endDate,
    category,
    type,
    minAmount,
    maxAmount,
    sort = 'date',
    order = 'desc',
    page = 1,
    limit = 10
  } = req.query;

  const queryObject = { user: req.user.userId };

  // Add filters if provided
  if (startDate && endDate) {
    queryObject.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
  } else if (startDate) {
    queryObject.date = { $gte: new Date(startDate) };
  } else if (endDate) {
    queryObject.date = { $lte: new Date(endDate) };
  }

  if (category) {
    queryObject.category = category;
  }

  if (type) {
    queryObject.type = type;
  }

  if (minAmount || maxAmount) {
    queryObject.amount = {};
    if (minAmount) queryObject.amount.$gte = Number(minAmount);
    if (maxAmount) queryObject.amount.$lte = Number(maxAmount);
  }

  // Setup pagination
  const skip = (Number(page) - 1) * Number(limit);

  // Setup sorting
  const sortOptions = {};
  sortOptions[sort] = order === 'desc' ? -1 : 1;

  // Count total documents for pagination info
  const totalTransactions = await Transaction.countDocuments(queryObject);

  // Execute query
  const transactions = await Transaction.find(queryObject)
    .sort(sortOptions)
    .skip(skip)
    .limit(Number(limit));

  // Pagination info
  const totalPages = Math.ceil(totalTransactions / Number(limit));
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  res.status(StatusCodes.OK).json({
    transactions,
    count: transactions.length,
    totalTransactions,
    currentPage: Number(page),
    totalPages,
    hasNextPage,
    hasPrevPage
  });
};

// Get Transaction
const getTransaction = async (req, res) => {
  const { id: transactionId } = req.params;

  const transaction = await Transaction.findOne({
    _id: transactionId,
    user: req.user.userId
  });

  if (!transaction) {
    throw new NotFoundError(`No transaction found with id ${transactionId}`);
  }

  res.status(StatusCodes.OK).json({ transaction });
};

// Update Transaction
const updateTransaction = async (req, res) => {
  const { id: transactionId } = req.params;

  // Get the current transaction
  const currentTransaction = await Transaction.findOne({
    _id: transactionId,
    user: req.user.userId
  });

  if (!currentTransaction) {
    throw new NotFoundError(`No transaction found with id ${transactionId}`);
  }

  // Get user currency preference
  const user = await User.findById(req.user.userId);
  const userCurrency = user.preferences.currency;

  // Handle currency conversion if needed
  if (req.body.currency && req.body.currency !== userCurrency && req.body.amount) {
    const { originalAmount, exchangeRate } = await currencyExchange.convert(
      req.body.amount,
      req.body.currency,
      userCurrency
    );

    req.body.originalAmount = req.body.amount;
    req.body.originalCurrency = req.body.currency;
    req.body.amount = originalAmount;
    req.body.exchangeRate = exchangeRate;
    req.body.currency = userCurrency;
  }

  // Update the transaction
  const transaction = await Transaction.findByIdAndUpdate(
    transactionId,
    req.body,
    { new: true, runValidators: true }
  );

  res.status(StatusCodes.OK).json({ transaction });
};

// Delete Transaction
const deleteTransaction = async (req, res) => {
  const { id: transactionId } = req.params;

  const transaction = await Transaction.findOneAndDelete({
    _id: transactionId,
    user: req.user.userId
  });

  if (!transaction) {
    throw new NotFoundError(`No transaction found with id ${transactionId}`);
  }

  res.status(StatusCodes.OK).json({ msg: 'Transaction successfully deleted' });
};

// Get Transaction Summary
const getTransactionSummary = async (req, res) => {
  const {
    period = 'month',
    startDate,
    endDate,
    groupBy = 'category'
  } = req.query;

  // Set up date range based on period
  let start, end;

  if (startDate && endDate) {
    start = new Date(startDate);
    end = new Date(endDate);
  } else {
    const now = new Date();

    switch (period) {
      case 'week':
        // Starting from Monday of current week
        const dayOfWeek = now.getDay();
        const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        start = new Date(now.setDate(diff));
        start.setHours(0, 0, 0, 0);

        end = new Date();
        break;

      case 'month':
        // Start of current month
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date();
        break;

      case 'year':
        // Start of current year
        start = new Date(now.getFullYear(), 0, 1);
        end = new Date();
        break;

      case 'all':
        start = new Date(0); // Beginning of time
        end = new Date();
        break;

      default:
        start = new Date(now.getFullYear(), now.getMonth(), 1); // Default to month
        end = new Date();
    }
  }

  // Set up grouping
  let groupField;
  switch (groupBy) {
    case 'category':
      groupField = '$category';
      break;
    case 'date':
      groupField = {
        year: { $year: '$date' },
        month: { $month: '$date' },
        day: { $dayOfMonth: '$date' }
      };
      break;
    case 'month':
      groupField = {
        year: { $year: '$date' },
        month: { $month: '$date' }
      };
      break;
    case 'type':
      groupField = '$type';
      break;
    default:
      groupField = '$category';
  }

  // Run aggregation
  const summary = await Transaction.aggregate([
    {
      $match: {
        user: mongoose.Types.ObjectId(req.user.userId),
        date: { $gte: start, $lte: end }
      }
    },
    {
      $group: {
        _id: groupField,
        totalAmount: { $sum: '$amount' },
        count: { $sum: 1 },
        transactions: { $push: '$$ROOT' }
      }
    },
    {
      $sort: { totalAmount: -1 }
    }
  ]);

  // Calculate total income and expenses
  const incomeExpenseSummary = await Transaction.aggregate([
    {
      $match: {
        user: mongoose.Types.ObjectId(req.user.userId),
        date: { $gte: start, $lte: end }
      }
    },
    {
      $group: {
        _id: '$type',
        totalAmount: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    }
  ]);

  // Format the response
  let formattedSummary;

  if (groupBy === 'date' || groupBy === 'month') {
    formattedSummary = summary.map(item => ({
      date: groupBy === 'date'
        ? new Date(item._id.year, item._id.month - 1, item._id.day)
        : new Date(item._id.year, item._id.month - 1, 1),
      totalAmount: item.totalAmount,
      count: item.count
    }));
  } else {
    formattedSummary = summary.map(item => ({
      [groupBy]: item._id,
      totalAmount: item.totalAmount,
      count: item.count
    }));
  }

  // Format income/expense summary
  const incomeExpense = {
    income: 0,
    expense: 0,
    balance: 0
  };

  incomeExpenseSummary.forEach(item => {
    if (item._id === 'income') {
      incomeExpense.income = item.totalAmount;
    } else if (item._id === 'expense') {
      incomeExpense.expense = Math.abs(item.totalAmount);
    }
  });

  incomeExpense.balance = incomeExpense.income - incomeExpense.expense;

  res.status(StatusCodes.OK).json({
    summary: formattedSummary,
    incomeExpense,
    period,
    startDate: start,
    endDate: end
  });
};

module.exports = {
  createTransaction,
  getAllTransactions,
  getTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionSummary
};
