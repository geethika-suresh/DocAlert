const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getDocuments,
  getDocumentById,
  addDocument,
  updateDocument,
  deleteDocument,
  updateAttachment,
  removeAttachment,
  getReminders,
} = require('../controllers/documentController');

// All routes protected
router.use(protect);

// FR3: Reminders - must be before /:id to avoid route conflict
router.get('/reminders', getReminders);

// FR2, FR4: Get all documents (with search/filter/status)
router.get('/', getDocuments);

// FR1: Add document
router.post('/', addDocument);

// FR5: Get document by ID
router.get('/:id', getDocumentById);

// Update document
router.put('/:id', updateDocument);

// Delete document (SRS Privacy)
router.delete('/:id', deleteDocument);

// FR5: Attachment management
router.put('/:id/attachment', updateAttachment);
router.delete('/:id/attachment', removeAttachment);

module.exports = router;
