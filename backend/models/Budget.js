// models/Budget.js
const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  category: {
    type: String,
    required: [true, 'Please provide a category'],
    trim: true
  },
  amount: {
    type: Number,
    required: [true, 'Please provide a budget amount'],
    min: [0, 'Budget amount cannot be negative']
  },
  currency: {
    type: String,
    enum: ['USD', 'INR', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'],
    default: 'USD'
  },
  periodType: {
    type: String,
    enum: ['monthly', 'quarterly', 'yearly', 'custom'],
    default: 'monthly'
  },
  startDate: {
    type: Date,
    default: function() {
      const now = new Date();
      return new Date(now.getFullYear(), now.getMonth(), 1); // First day of current month
    }
  },
  endDate: {
    type: Date,
    default: function() {
      const now = new Date();
      return new Date(now.getFullYear(), now.getMonth() + 1, 0); // Last day of current month
    }
  },
  rollover: {
    type: Boolean,
    default: false
  },
  rolloverAmount: {
    type: Number,
    default: 0
  },
  notifications: {
    enabled: {
      type: Boolean,
      default: false
    },
    threshold: {
      type: Number,
      min: [0, 'Threshold must be at least 0'],
      max: [100, 'Threshold cannot exceed 100'],
      default: 80
    }
  },
  user: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please provide user']
  }
}, { timestamps: true });

// Create a compound index for user and category
budgetSchema.index({ user: 1, category: 1 }, { unique: true });

module.exports = mongoose.model('Budget', budgetSchema);
