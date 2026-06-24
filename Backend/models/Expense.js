import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
  type: String,
  enum: [
    "Food & Dining",
    "Transportation",
    "Shopping",
    "Entertainment",
    "Bills & Utilities",
    "Investment",
    "Rent",
    "HealthCare",
    "Others"
  ],
  required: true
},

  type: {
    type: String,
    enum: ['income', 'expense'],
    default: 'expense'
  },
  date: {
    type: Date,
    default: Date.now
  },
  aiCategorized: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Expense', expenseSchema);
