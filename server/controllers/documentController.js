const Document = require('../models/Document');
const { CATEGORIES } = require('../models/Document');

// Helper: compute status for a doc
const withStatus = (doc, period = 30) => {
  const d = doc.toObject ? doc.toObject() : { ...doc };
  const { status, daysRemaining } = doc.computeStatus ? doc.computeStatus(period) : computeStatusStatic(doc.expiryDate, period);
  return { ...d, status, daysRemaining };
};

const computeStatusStatic = (expiryDate, period = 30) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);
  const daysRemaining = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
  if (daysRemaining < 0) return { status: 'Expired', daysRemaining };
  if (daysRemaining <= period) return { status: 'Expiring Soon', daysRemaining };
  return { status: 'Active', daysRemaining };
};

// @desc    Get all documents for user
// @route   GET /api/documents
// @access  Private
const getDocuments = async (req, res, next) => {
  try {
    const { search, category, period = 30 } = req.query;
    const reminderPeriod = parseInt(period, 10) || 30;

    // Build query
    const query = { userId: req.user.id };

    // FR4: Filter by category
    if (category && category !== 'All' && CATEGORIES.includes(category)) {
      query.category = category;
    }

    let documents = await Document.find(query).sort({ expiryDate: 1 });

    // FR4: Search by name (in-memory for demo, text index for production)
    if (search && search.trim()) {
      const searchLower = search.trim().toLowerCase();
      documents = documents.filter((d) => d.name.toLowerCase().includes(searchLower));
    }

    // Compute status for each document (SRS 5.1)
    const docsWithStatus = documents.map((doc) => {
      const plain = doc.toObject();
      const { status, daysRemaining } = computeStatusStatic(doc.expiryDate, reminderPeriod);
      return { ...plain, status, daysRemaining };
    });

    // Summary counts (SRS FR2)
    const summary = {
      total: docsWithStatus.length,
      active: docsWithStatus.filter((d) => d.status === 'Active').length,
      expiringSoon: docsWithStatus.filter((d) => d.status === 'Expiring Soon').length,
      expired: docsWithStatus.filter((d) => d.status === 'Expired').length,
    };

    res.json({
      success: true,
      data: { documents: docsWithStatus, summary },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single document by ID
// @route   GET /api/documents/:id
// @access  Private
const getDocumentById = async (req, res, next) => {
  try {
    const { period = 30 } = req.query;
    const reminderPeriod = parseInt(period, 10) || 30;

    const doc = await Document.findOne({ _id: req.params.id, userId: req.user.id });
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found.' });
    }

    const plain = doc.toObject();
    const { status, daysRemaining } = computeStatusStatic(doc.expiryDate, reminderPeriod);

    res.json({
      success: true,
      data: { document: { ...plain, status, daysRemaining } },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a new document - SRS FR1
// @route   POST /api/documents
// @access  Private
const addDocument = async (req, res, next) => {
  try {
    const { name, category, issueDate, expiryDate, notes, attachment } = req.body;

    // FR1: Validate all required fields
    if (!name || !category || !issueDate || !expiryDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide document name, category, issue date, and expiry date.',
      });
    }

    // FR1: Reject expiry date earlier than issue date
    if (new Date(expiryDate) < new Date(issueDate)) {
      return res.status(400).json({
        success: false,
        message: 'Expiry date cannot be earlier than issue date.',
      });
    }

    if (!CATEGORIES.includes(category)) {
      return res.status(400).json({
        success: false,
        message: `Category must be one of: ${CATEGORIES.join(', ')}`,
      });
    }

    const docData = {
      userId: req.user.id,
      name: name.trim(),
      category,
      issueDate: new Date(issueDate),
      expiryDate: new Date(expiryDate),
      notes: notes || '',
    };

    // FR5: Optional attachment
    if (attachment && attachment.fileName) {
      docData.attachment = attachment;
    }

    const document = await Document.create(docData);
    const plain = document.toObject();
    const { status, daysRemaining } = computeStatusStatic(document.expiryDate, 30);

    // FR1: Display success message after saving
    res.status(201).json({
      success: true,
      message: `Document "${document.name}" added successfully!`,
      data: { document: { ...plain, status, daysRemaining } },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a document
// @route   PUT /api/documents/:id
// @access  Private
const updateDocument = async (req, res, next) => {
  try {
    const { name, category, issueDate, expiryDate, notes } = req.body;

    const doc = await Document.findOne({ _id: req.params.id, userId: req.user.id });
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found.' });
    }

    const newExpiry = expiryDate ? new Date(expiryDate) : doc.expiryDate;
    const newIssue = issueDate ? new Date(issueDate) : doc.issueDate;

    if (newExpiry < newIssue) {
      return res.status(400).json({
        success: false,
        message: 'Expiry date cannot be earlier than issue date.',
      });
    }

    if (name) doc.name = name.trim();
    if (category) doc.category = category;
    if (issueDate) doc.issueDate = newIssue;
    if (expiryDate) doc.expiryDate = newExpiry;
    if (notes !== undefined) doc.notes = notes;

    await doc.save();

    const plain = doc.toObject();
    const { status, daysRemaining } = computeStatusStatic(doc.expiryDate, 30);

    res.json({
      success: true,
      message: `Document "${doc.name}" updated successfully!`,
      data: { document: { ...plain, status, daysRemaining } },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a document - SRS Privacy: users can delete any document
// @route   DELETE /api/documents/:id
// @access  Private
const deleteDocument = async (req, res, next) => {
  try {
    const doc = await Document.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found.' });
    }

    res.json({
      success: true,
      message: `Document "${doc.name}" deleted successfully.`,
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add/update attachment for a document - SRS FR5
// @route   PUT /api/documents/:id/attachment
// @access  Private
const updateAttachment = async (req, res, next) => {
  try {
    const { attachment } = req.body;

    const doc = await Document.findOne({ _id: req.params.id, userId: req.user.id });
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found.' });
    }

    // FR5: Validate file type and size
    if (attachment) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'image/webp'];
      if (!allowedTypes.includes(attachment.mimeType)) {
        return res.status(400).json({
          success: false,
          message: 'File type not allowed. Please upload PDF, PNG, JPEG, GIF, or WEBP.',
        });
      }
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (attachment.sizeBytes > maxSize) {
        return res.status(400).json({
          success: false,
          message: 'File size exceeds 5MB limit.',
        });
      }
      doc.attachment = attachment;
    }

    await doc.save();

    res.json({
      success: true,
      message: 'Attachment updated successfully.',
      data: { attachment: doc.attachment },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove attachment - SRS Privacy: users can delete any attachment
// @route   DELETE /api/documents/:id/attachment
// @access  Private
const removeAttachment = async (req, res, next) => {
  try {
    const doc = await Document.findOne({ _id: req.params.id, userId: req.user.id });
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found.' });
    }

    doc.attachment = null;
    await doc.save();

    res.json({
      success: true,
      message: 'Attachment removed successfully.',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reminder documents - SRS FR3
// @route   GET /api/documents/reminders
// @access  Private
const getReminders = async (req, res, next) => {
  try {
    const { period = 30 } = req.query;
    const reminderPeriod = parseInt(period, 10) || 30;

    if (![7, 15, 30].includes(reminderPeriod)) {
      return res.status(400).json({ success: false, message: 'Reminder period must be 7, 15, or 30 days.' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const futureDate = new Date(today);
    futureDate.setDate(futureDate.getDate() + reminderPeriod);

    // Get documents expiring within the period
    const documents = await Document.find({
      userId: req.user.id,
      expiryDate: { $gte: today, $lte: futureDate },
    }).sort({ expiryDate: 1 });

    const reminders = documents.map((doc) => {
      const plain = doc.toObject();
      const { status, daysRemaining } = computeStatusStatic(doc.expiryDate, reminderPeriod);
      return {
        ...plain,
        status,
        daysRemaining,
        message: daysRemaining === 0
          ? `"${doc.name}" expires today!`
          : `"${doc.name}" expires in ${daysRemaining} day${daysRemaining === 1 ? '' : 's'}.`,
      };
    });

    res.json({
      success: true,
      data: { reminders, count: reminders.length, period: reminderPeriod },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDocuments,
  getDocumentById,
  addDocument,
  updateDocument,
  deleteDocument,
  updateAttachment,
  removeAttachment,
  getReminders,
};
