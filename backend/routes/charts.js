const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');

/**
 * GET /api/charts/monthly
 * Returns monthly expense data
 * Response: [{ month, amount }]
 */
router.get('/monthly', async (req, res) => {
  try {
    // Get data for the last 12 months
    const today = new Date();
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
    twelveMonthsAgo.setDate(1);
    twelveMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyData = await Transaction.aggregate([
      {
        $match: {
          amount: { $lt: 0 }, // Only expenses
          date: { $gte: twelveMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          amount: { $sum: { $abs: '$amount' } }
        }
      },
      {
        $sort: {
          '_id.year': 1,
          '_id.month': 1
        }
      },
      {
        $project: {
          _id: 0,
          month: {
            $concat: [
              { $toString: '$_id.year' },
              '-',
              {
                $cond: {
                  if: { $lt: ['$_id.month', 10] },
                  then: { $concat: ['0', { $toString: '$_id.month' }] },
                  else: { $toString: '$_id.month' }
                }
              }
            ]
          },
          amount: 1
        }
      }
    ]);

    // Fill in missing months with zero amounts
    const monthlyResult = [];
    let currentDate = new Date(twelveMonthsAgo);

    while (currentDate <= today) {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const monthStr = `${year}-${month < 10 ? '0' + month : month}`;

      const existingData = monthlyData.find(item => item.month === monthStr);

      monthlyResult.push({
        month: monthStr,
        amount: existingData ? existingData.amount : 0
      });

      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    res.json(monthlyResult);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
