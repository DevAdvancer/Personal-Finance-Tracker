// models/Transaction.js
const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: [true, 'Please provide an amount']
  },
  currency: {
    type: String,
    enum: ['USD', 'INR', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'],
    default: 'USD'
  },
  originalAmount: {
    type: Number
  },
  originalCurrency: {
    type: String,
    enum: ['USD', 'INR', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD']
  },
  exchangeRate: {
    type: Number
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    trim: true,
    maxlength: [100, 'Description cannot be more than 100 characters']
  },
  category: {
    type: String,
    required: [true, 'Please provide a category'],
    trim: true
  },
  type: {
    type: String,
    enum: ['expense', 'income', 'transfer'],
    default: 'expense'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'credit card', 'debit card', 'bank transfer', 'mobile payment', 'other'],
    default: 'other'
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringDetails: {
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly', null],
      default: null
    },
    endDate: {
      type: Date,
      default: null
    }
  },
  tags: {
    type: [String],
    default: []
  },
  notes: {
    type: String,
    trim: true
  },
  attachments: {
    type: [String], // URLs to attachment files
    default: []
  },
  user: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please provide user']
  }
}, { timestamps: true });

// Add indexes for faster queries
transactionSchema.index({ user: 1, date: -1 });
transactionSchema.index({ user: 1, category: 1 });
transactionSchema.index({ user: 1, type: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
