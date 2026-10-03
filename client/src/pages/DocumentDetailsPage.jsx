// SRS FR5: Document Details — full info, optional file/photo attachment, delete attachment
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Calendar, Tag, FileText, Paperclip, Trash2, Download,
  Edit2, Save, X, AlertCircle, CheckCircle, Clock, AlertTriangle, Image, Info,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useDocuments } from '../context/DocumentContext.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { ConfirmModal } from '../components/Modal.jsx';
import Loader from '../components/Loader.jsx';
import { indexedDBService } from '../services/localStorageService.js';
import { getRenewalTips } from '../services/aiService.js';
import api from '../services/api.js';

const CATEGORIES  = ['Identity Document', 'Certificate', 'Insurance', 'Government ID', 'Other'];
const MAX_SIZE_MB  = 5;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', weekday: 'short' }) : '—';

const DocumentDetailsPage = () => {
  const { id }             = useParams();
  const navigate           = useNavigate();
  const { getDocumentById, updateDocument, deleteDocument, reminderPeriod } = useDocuments();
  const fileInputRef       = useRef(null);

  const [doc, setDoc]             = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [notFound, setNotFound]   = useState(false);

  // Edit mode
  const [editing, setEditing]     = useState(false);
  const [editForm, setEditForm]   = useState({});
  const [editErrors, setEditErrors] = useState({});
  const [saving, setSaving]       = useState(false);

  // Attachment
  const [attachPreview, setAttachPreview]   = useState(null);
  const [attachLoading, setAttachLoading]   = useState(false);
  const [deleteAttachModal, setDeleteAttachModal] = useState(false);
  const [deletingAttach, setDeletingAttach] = useState(false);

  // Delete doc
  const [deleteDocModal, setDeleteDocModal] = useState(false);
  const [deletingDoc, setDeletingDoc]       = useState(false);

  // AI tips
  const [tips, setTips]           = useState([]);

  // Load document
  useEffect(() => {
    const load = async () => {
      setPageLoading(true);
      try {
        const d = await getDocumentById(id);
        if (!d) { setNotFound(true); return; }
        setDoc(d);
        setEditForm({ name: d.name, category: d.category, issueDate: d.issueDate?.split('T')[0], expiryDate: d.expiryDate?.split('T')[0], notes: d.notes || '' });
        // Load tips
        const t = await getRenewalTips(d.category);
        setTips(t.tips || []);
        // Load attachment preview from IndexedDB
        if (d.attachment) {
          loadAttachmentPreview(d._id);
        }
      } catch { setNotFound(true); }
      finally { setPageLoading(false); }
    };
    load();
  }, [id]);

  const loadAttachmentPreview = async (docId) => {
    try {
      const stored = await indexedDBService.getAttachment(docId);
      if (stored) {
        const blob = new Blob([stored.data], { type: stored.mimeType });
        const url  = URL.createObjectURL(blob);
        setAttachPreview({ url, mimeType: stored.mimeType, fileName: stored.fileName });
      }
    } catch { /* no preview available */ }
  };

  // ── Edit Handlers ──
  const startEdit = () => {
    setEditForm({
      name:       doc.name,
      category:   doc.category,
      issueDate:  doc.issueDate?.split('T')[0] || doc.issueDate,
      expiryDate: doc.expiryDate?.split('T')[0] || doc.expiryDate,
      notes:      doc.notes || '',
    });
    setEditErrors({});
    setEditing(true);
  };

  const validateEdit = () => {
    const e = {};
    if (!editForm.name?.trim())                                         e.name       = 'Name is required.';
    if (!editForm.category)                                             e.category   = 'Category is required.';
    if (!editForm.issueDate)                                            e.issueDate  = 'Issue date is required.';
    if (!editForm.expiryDate)                                           e.expiryDate = 'Expiry date is required.';
    if (editForm.issueDate && editForm.expiryDate && editForm.expiryDate < editForm.issueDate) {
      e.expiryDate = 'Expiry date cannot be earlier than issue date.';
    }
    setEditErrors(e);
    return Object.keys(e).length === 0;
  };

  const saveEdit = async () => {
    if (!validateEdit()) return;
    setSaving(true);
    try {
      const res = await updateDocument(id, editForm);
      setDoc(res.data.document);
      setEditing(false);
      toast.success('Document updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed.');
    } finally { setSaving(false); }
  };

  // ── Attachment Handlers (SRS FR5) ──
  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // FR5: Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error('File type not allowed. Use PDF, PNG, JPEG, GIF, or WEBP.');
      return;
    }
    // FR5: Validate file size
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`File size exceeds ${MAX_SIZE_MB}MB limit.`);
      return;
    }

    setAttachLoading(true);
    try {
      // Save to IndexedDB (binary)
      await indexedDBService.saveAttachment(doc._id, file);

      // Also send metadata to server
      const attachMeta = { fileName: file.name, mimeType: file.type, sizeBytes: file.size };
      await api.put(`/documents/${doc._id}/attachment`, { attachment: attachMeta });

      // Update local state
      setDoc(prev => ({ ...prev, attachment: attachMeta }));

      // Generate preview
      const url = URL.createObjectURL(file);
      setAttachPreview({ url, mimeType: file.type, fileName: file.name });

      toast.success(`"${file.name}" attached successfully!`);
    } catch (err) {
      toast.error('Failed to attach file. Please try again.');
    } finally {
      setAttachLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteAttachment = async () => {
    setDeletingAttach(true);
    try {
      await indexedDBService.deleteAttachment(doc._id);
      await api.delete(`/documents/${doc._id}/attachment`).catch(() => {});
      setDoc(prev => ({ ...prev, attachment: null }));
      if (attachPreview?.url) URL.revokeObjectURL(attachPreview.url);
      setAttachPreview(null);
      setDeleteAttachModal(false);
      toast.success('Attachment removed.');
    } catch {
      toast.error('Failed to remove attachment.');
    } finally { setDeletingAttach(false); }
  };

  // ── Delete Document ──
  const handleDeleteDoc = async () => {
    setDeletingDoc(true);
    try {
      await deleteDocument(id);
      toast.success(`"${doc.name}" deleted.`);
      navigate('/documents');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed.');
    } finally { setDeletingDoc(false); }
  };

  // ── Render States ──
  if (pageLoading) return <div className="page-container"><Loader size="lg" message="Loading document..."/></div>;

  // SRS FR5: clear "not found" message
  if (notFound) return (
    <div className="page-container max-w-lg mx-auto text-center py-20">
      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-5">
        <AlertTriangle size={36} className="text-gray-400"/>
      </div>
      <h2 className="text-xl font-bold text-gray-700 mb-2">Document not found</h2>
      <p className="text-gray-500 text-sm mb-6">The document you're looking for doesn't exist or may have been deleted.</p>
      <Link to="/documents" className="btn-primary">← Back to Documents</Link>
    </div>
  );

  const statusColors = {
    'Active':        'from-green-600 to-green-700',
    'Expiring Soon': 'from-amber-500 to-amber-600',
    'Expired':       'from-red-600 to-red-700',
  };

  return (
    <div className="page-container max-w-3xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link to="/documents" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-700 transition-colors">
          <ArrowLeft size={16}/> Back to Documents
        </Link>
        <div className="flex items-center gap-2">
          {!editing && (
            <button onClick={startEdit} className="btn-secondary text-sm px-3 py-2 gap-1.5">
              <Edit2 size={14}/> Edit
            </button>
          )}
          <button onClick={() => setDeleteDocModal(true)} className="btn-danger text-sm px-3 py-2 gap-1.5">
            <Trash2 size={14}/> Delete
          </button>
        </div>
      </div>

      {/* Main card */}
      <div className="card overflow-hidden">
        {/* Status banner */}
        <div className={`bg-gradient-to-r ${statusColors[doc.status] || statusColors['Active']} px-6 py-4`}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white leading-tight">{doc.name}</h1>
              <p className="text-white/80 text-sm mt-1">{doc.category}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <StatusBadge status={doc.status} daysRemaining={doc.daysRemaining} showDays={true}/>
              {doc.status === 'Expiring Soon' && doc.daysRemaining !== undefined && (
                <span className="text-white/90 text-xs font-medium">
                  {doc.daysRemaining === 0 ? 'Expires today!' : `${doc.daysRemaining} days left`}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* ── View Mode ── */}
          {!editing ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {[
                { label: 'Document Name', value: doc.name,               icon: <FileText size={15}/> },
                { label: 'Category',      value: doc.category,            icon: <Tag size={15}/> },
                { label: 'Issue Date',    value: formatDate(doc.issueDate), icon: <Calendar size={15}/> },
                { label: 'Expiry Date',   value: formatDate(doc.expiryDate), icon: <Calendar size={15}/>,
                  extra: doc.status === 'Expired' ? <span className="ml-2 text-xs text-red-600 font-semibold">EXPIRED</span> : null },
              ].map(({ label, value, icon, extra }) => (
                <div key={label} className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1 flex items-center gap-1.5">{icon}{label}</p>
                  <p className="text-gray-900 font-semibold">{value}{extra}</p>
                </div>
              ))}
              {doc.notes && (
                <div className="sm:col-span-2 bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1 flex items-center gap-1.5">
                    <Info size={13}/>Notes
                  </p>
                  <p className="text-gray-700 text-sm whitespace-pre-line">{doc.notes}</p>
                </div>
              )}
            </div>
          ) : (
            /* ── Edit Mode ── */
            <div className="space-y-4">
              <h2 className="font-bold text-gray-800 flex items-center gap-2"><Edit2 size={16} className="text-blue-600"/> Edit Document</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="form-label">Document Name *</label>
                  <input value={editForm.name || ''} onChange={e => setEditForm(p => ({...p, name: e.target.value}))}
                    className={`form-input ${editErrors.name ? 'border-red-400' : ''}`} placeholder="Document name"/>
                  {editErrors.name && <p className="form-error"><AlertCircle size={12}/>{editErrors.name}</p>}
                </div>
                <div>
                  <label className="form-label">Category *</label>
                  <select value={editForm.category || ''} onChange={e => setEditForm(p => ({...p, category: e.target.value}))}
                    className={`form-input ${editErrors.category ? 'border-red-400' : ''}`}>
                    <option value="">Select category</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {editErrors.category && <p className="form-error"><AlertCircle size={12}/>{editErrors.category}</p>}
                </div>
                <div>
                  <label className="form-label">Issue Date *</label>
                  <input type="date" value={editForm.issueDate || ''} onChange={e => setEditForm(p => ({...p, issueDate: e.target.value}))}
                    className={`form-input ${editErrors.issueDate ? 'border-red-400' : ''}`}/>
                  {editErrors.issueDate && <p className="form-error"><AlertCircle size={12}/>{editErrors.issueDate}</p>}
                </div>
                <div>
                  <label className="form-label">Expiry Date *</label>
                  <input type="date" value={editForm.expiryDate || ''} onChange={e => setEditForm(p => ({...p, expiryDate: e.target.value}))}
                    className={`form-input ${editErrors.expiryDate ? 'border-red-400' : ''}`}/>
                  {editErrors.expiryDate && <p className="form-error"><AlertCircle size={12}/>{editErrors.expiryDate}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label className="form-label">Notes</label>
                  <textarea value={editForm.notes || ''} onChange={e => setEditForm(p => ({...p, notes: e.target.value}))}
                    rows={3} maxLength={500} className="form-input resize-none" placeholder="Optional notes..."/>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setEditing(false)} className="btn-secondary gap-1.5"><X size={14}/> Cancel</button>
                <button onClick={saveEdit} disabled={saving} className="btn-primary gap-1.5">
                  {saving ? <span className="flex gap-1.5 items-center"><span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Saving...</span> : <><Save size={14}/> Save Changes</>}
                </button>
              </div>
            </div>
          )}

          {/* ── Attachment Section (SRS FR5) ── */}
          <div className="border-t border-gray-100 pt-5">
            <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <Paperclip size={16} className="text-blue-600"/> Attachment
              <span className="text-xs text-gray-400 font-normal">(PDF, PNG, JPEG, GIF, WEBP — max {MAX_SIZE_MB}MB)</span>
            </h2>

            {doc.attachment ? (
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                {/* Preview */}
                {attachPreview && (
                  <div className="rounded-xl overflow-hidden border border-gray-200 max-h-64">
                    {attachPreview.mimeType.startsWith('image/') ? (
                      <img src={attachPreview.url} alt={attachPreview.fileName} className="max-h-64 w-full object-contain bg-gray-50"/>
                    ) : (
                      <div className="flex items-center justify-center h-24 bg-gray-100 gap-3">
                        <FileText size={32} className="text-gray-400"/>
                        <span className="text-sm text-gray-600 font-medium">{attachPreview.fileName}</span>
                      </div>
                    )}
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    {doc.attachment.mimeType?.startsWith('image/') ? <Image size={15}/> : <FileText size={15}/>}
                    <span className="font-medium">{doc.attachment.fileName}</span>
                    <span className="text-gray-400 text-xs">({(doc.attachment.sizeBytes / 1024).toFixed(1)} KB)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {attachPreview && (
                      <a href={attachPreview.url} download={doc.attachment.fileName}
                        className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors">
                        <Download size={13}/> Download
                      </a>
                    )}
                    <button onClick={() => setDeleteAttachModal(true)}
                      className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors">
                      <Trash2 size={13}/> Remove
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-blue-300 transition-colors">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Paperclip size={20} className="text-gray-400"/>
                </div>
                <p className="text-sm text-gray-600 mb-3">Attach a document file or photo</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.gif,.webp"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                  aria-label="Upload attachment"
                />
                <label
                  htmlFor="file-upload"
                  className={`btn-secondary text-sm cursor-pointer ${attachLoading ? 'opacity-60 pointer-events-none' : ''}`}
                >
                  {attachLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"/>Uploading...
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5"><Paperclip size={14}/> Choose File</span>
                  )}
                </label>
              </div>
            )}
          </div>

          {/* AI Renewal Tips */}
          {tips.length > 0 && (
            <div className="border-t border-gray-100 pt-5">
              <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2">💡 Renewal Tips for {doc.category}</h2>
              <ul className="space-y-2">
                {tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600 bg-blue-50 rounded-lg px-3 py-2">
                    <CheckCircle size={14} className="text-blue-500 mt-0.5 flex-shrink-0"/>{tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Metadata */}
      <div className="card p-4 flex flex-wrap gap-4 text-xs text-gray-400">
        <span>Added: {formatDate(doc.createdAt)}</span>
        {doc.updatedAt && doc.updatedAt !== doc.createdAt && <span>Updated: {formatDate(doc.updatedAt)}</span>}
        <span>Reminder period: {reminderPeriod} days</span>
      </div>

      {/* Modals */}
      <ConfirmModal isOpen={deleteAttachModal} onClose={() => setDeleteAttachModal(false)}
        onConfirm={handleDeleteAttachment} title="Remove Attachment"
        message="Remove this attachment? This action cannot be undone."
        confirmLabel="Remove" danger={true} loading={deletingAttach}/>

      <ConfirmModal isOpen={deleteDocModal} onClose={() => setDeleteDocModal(false)}
        onConfirm={handleDeleteDoc} title="Delete Document"
        message={`Permanently delete "${doc.name}"? All data and attachments will be removed.`}
        confirmLabel="Delete Document" danger={true} loading={deletingDoc}/>
    </div>
  );
};

export default DocumentDetailsPage;
