const express = require('express');
const router = express.Router();
const {
  createTransaction,
  getAllTransactions,
  getTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionSummary
} = require('../controllers/transactionController');

// All routes are protected
router.route('/').post(createTransaction).get(getAllTransactions);
router.route('/summary').get(getTransactionSummary);
router.route('/:id').get(getTransaction).patch(updateTransaction).delete(deleteTransaction);

module.exports = router;
