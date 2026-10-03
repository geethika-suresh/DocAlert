const mongoose = require('mongoose');

// Matches SRS Section 4.2.1 Core Entities and Section 1.3 Category enum
const CATEGORIES = ['Identity Document', 'Certificate', 'Insurance', 'Government ID', 'Other'];
const STATUS_VALUES = ['Active', 'Expiring Soon', 'Expired'];

const attachmentSchema = new mongoose.Schema(
  {
    fileName: { type: String, required: true },
    mimeType: { type: String, required: true },
    sizeBytes: { type: Number, required: true },
    // base64 data stored for demo (IndexedDB used on client-side for binary)
    data: { type: String },
  },
  { _id: true }
);

const documentSchema = new mongoose.Schema(
  {
    // FK to User
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    // Core fields per SRS FR1 and Data Model
    name: {
      type: String,
      required: [true, 'Document name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: CATEGORIES,
        message: 'Category must be one of: ' + CATEGORIES.join(', '),
      },
    },
    issueDate: {
      type: Date,
      required: [true, 'Issue date is required'],
    },
    expiryDate: {
      type: Date,
      required: [true, 'Expiry date is required'],
    },
    // Optional attachment per SRS FR5
    attachment: {
      type: attachmentSchema,
      default: null,
    },
    // Notes field for extra info
    notes: {
      type: String,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
      default: '',
    },
  },
  {
    timestamps: true,
    // Virtual for computed status - SRS 5.1: status is DERIVED, never stored
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// SRS Section 5.1: Status is derived from dates, never stored
// Status Engine logic as per Figure 6: Document Status Decision Flow
documentSchema.methods.computeStatus = function (reminderPeriodDays = 30) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiry = new Date(this.expiryDate);
  expiry.setHours(0, 0, 0, 0);

  const diffTime = expiry - today;
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (daysRemaining < 0) return { status: 'Expired', daysRemaining };
  if (daysRemaining <= reminderPeriodDays) return { status: 'Expiring Soon', daysRemaining };
  return { status: 'Active', daysRemaining };
};

// Validation: expiry must be >= issue date (SRS FR1)
documentSchema.pre('save', function (next) {
  if (this.expiryDate < this.issueDate) {
    const err = new Error('Expiry date cannot be earlier than issue date');
    err.name = 'ValidationError';
    return next(err);
  }
  next();
});

// Index for faster queries
documentSchema.index({ userId: 1, name: 'text' });
documentSchema.index({ userId: 1, category: 1 });
documentSchema.index({ userId: 1, expiryDate: 1 });

module.exports = mongoose.model('Document', documentSchema);
module.exports.CATEGORIES = CATEGORIES;
