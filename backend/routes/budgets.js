const express = require('express');
const router = express.Router();
const {
  createBudget,
  getAllBudgets,
  getBudget,
  getBudgetByCategory,
  updateBudget,
  deleteBudget,
  getBudgetVsActual
} = require('../controllers/budgetController');

// All routes are protected
router.route('/').post(createBudget).get(getAllBudgets);
router.route('/vs-actual').get(getBudgetVsActual);
router.route('/:id').get(getBudget).patch(updateBudget).delete(deleteBudget);
router.route('/category/:category').get(getBudgetByCategory);

module.exports = router;
