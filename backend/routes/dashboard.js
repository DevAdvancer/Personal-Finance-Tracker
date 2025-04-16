const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');

/**
 * GET /api/dashboard
 * Returns dashboard summary data
 * Response: { totalExpenses, categoryBreakdown: [{ category, amount, percentage }], recentTransactions: [Transaction] }
 */
router.get('/', async (req, res) => {
  try {
    // Get total expenses (considering negative amounts as expenses)
    const expensesResult = await Transaction.aggregate([
      { $match: { amount: { $lt: 0 } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const totalExpenses = expensesResult.length > 0 ? Math.abs(expensesResult[0].total) : 0;

    // Get category breakdown
    const categoryBreakdownResult = await Transaction.aggregate([
      { $match: { amount: { $lt: 0 } } },
      { $group: { _id: '$category', amount: { $sum: '$amount' } } },
      { $project: { category: '$_id', amount: { $abs: '$amount' }, _id: 0 } },
      { $sort: { amount: -1 } }
    ]);

    // Calculate percentages
    const categoryBreakdown = categoryBreakdownResult.map(item => ({
      ...item,
      percentage: totalExpenses > 0 ? Math.round((item.amount / totalExpenses) * 100) : 0
    }));

    // Get recent transactions
    const recentTransactions = await Transaction.find()
      .sort({ date: -1 })
      .limit(5);

    res.json({
      totalExpenses,
      categoryBreakdown,
      recentTransactions
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
