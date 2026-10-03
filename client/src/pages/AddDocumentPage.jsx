// SRS FR1: Add Document — name, category, issue date, expiry date, full validation
// SRS 7.3: Optional AI category suggestion
import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Sparkles, AlertCircle, Calendar, Tag, FileText, Info, Image, ScanLine, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import { useDocuments } from '../context/DocumentContext.jsx';
import { suggestCategory } from '../services/aiService.js';
import { detectExpiryDate } from '../services/expiryDateService.js';
import { indexedDBService } from '../services/localStorageService.js';

const CATEGORIES = ['Identity Document', 'Certificate', 'Insurance', 'Government ID', 'Other'];
const today = new Date().toISOString().split('T')[0];

const InputField = ({ id, label, type = 'text', value, onChange, error, placeholder, min, max, icon, hint }) => (
  <div>
    <label htmlFor={id} className="form-label">
      {label} <span className="text-red-400">*</span>
    </label>
    <div className="relative">
      {icon && <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">{icon}</span>}
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        min={min}
        max={max}
        className={`form-input ${icon ? 'pl-10' : ''} ${error ? 'border-red-400 focus:ring-red-400' : ''}`}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        aria-invalid={!!error}
      />
    </div>
    {hint && !error && <p id={`${id}-hint`} className="text-xs text-gray-400 mt-1">{hint}</p>}
    {error && (
      <p id={`${id}-error`} className="form-error" role="alert">
        <AlertCircle size={12}/>{error}
      </p>
    )}
  </div>
);

const AddDocumentPage = () => {
  const { addDocument } = useDocuments();
  const navigate        = useNavigate();

  const [form, setForm] = useState({
    name: '', category: '', issueDate: '', expiryDate: '', notes: '',
  });
  const [errors, setErrors]       = useState({});
  const [loading, setLoading]     = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [documentImage, setDocumentImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [dateScan, setDateScan] = useState({ status: 'idle', message: '' });

  useEffect(() => () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
  }, [imagePreview]);

  // SRS FR1: Validate all required fields + date order
  const validate = () => {
    const e = {};
    if (!form.name.trim())             e.name     = 'Document name is required.';
    else if (form.name.trim().length < 2) e.name  = 'Name must be at least 2 characters.';
    if (!form.category)                e.category = 'Please select a category.';
    if (!form.issueDate)               e.issueDate = 'Issue date is required.';
    if (!form.expiryDate)              e.expiryDate = 'Expiry date is required.';
    // SRS FR1: reject expiry earlier than issue
    if (form.issueDate && form.expiryDate && form.expiryDate < form.issueDate) {
      e.expiryDate = 'Expiry date cannot be earlier than issue date.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (field) => (e) => {
    const val = e.target.value;
    setForm(p => ({ ...p, [field]: val }));
    if (errors[field]) setErrors(p => ({ ...p, [field]: '' }));

    // Trigger AI suggestion when name changes
    if (field === 'name' && val.trim().length >= 3) {
      triggerAiSuggest(val.trim());
    } else if (field === 'name' && val.trim().length < 3) {
      setAiSuggestion(null);
    }
  };

  // SRS 7.3: Debounced AI category suggestion
  const aiTimer = React.useRef(null);
  const triggerAiSuggest = useCallback((name) => {
    clearTimeout(aiTimer.current);
    aiTimer.current = setTimeout(async () => {
      if (!name || name.length < 3) return;
      setAiLoading(true);
      try {
        const result = await suggestCategory(name);
        if (result.suggestedCategory !== 'Other' || result.confidence !== 'low') {
          setAiSuggestion(result);
        } else {
          setAiSuggestion(null);
        }
      } catch { setAiSuggestion(null); }
      finally { setAiLoading(false); }
    }, 600);
  }, []);

  // SRS 7.3: User accepts AI suggestion
  const acceptSuggestion = () => {
    if (!aiSuggestion) return;
    setForm(p => ({ ...p, category: aiSuggestion.suggestedCategory }));
    setErrors(p => ({ ...p, category: '' }));
    setAiSuggestion(null);
    toast.success(`Category set to "${aiSuggestion.suggestedCategory}"`);
  };

  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
      toast.error('Choose a JPEG, PNG, GIF, or WEBP image.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be 5MB or smaller.');
      return;
    }

    setDocumentImage(file);
    setImagePreview(URL.createObjectURL(file));
    setDateScan({ status: 'scanning', message: 'Reading expiry information from the image...' });
    try {
      const expiryDate = await detectExpiryDate(file);
      setForm((previous) => ({ ...previous, expiryDate }));
      setErrors((previous) => ({ ...previous, expiryDate: '' }));
      setDateScan({ status: 'found', message: `Expiry date detected: ${expiryDate}. Check it before saving.` });
    } catch (error) {
      setDateScan({ status: 'error', message: error.message || 'Could not read a date from this image.' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please fix the errors below.');
      return;
    }
    setLoading(true);
    try {
      const res = await addDocument({
        name:       form.name.trim(),
        category:   form.category,
        issueDate:  form.issueDate,
        expiryDate: form.expiryDate,
        notes:      form.notes.trim(),
        ...(documentImage && { attachment: {
          fileName: documentImage.name,
          mimeType: documentImage.type,
          sizeBytes: documentImage.size,
        } }),
      });
      if (documentImage) {
        const savedDocument = res.data?.document;
        if (savedDocument?._id) {
          try {
            await indexedDBService.saveAttachment(savedDocument._id, documentImage);
          } catch {
            toast.error('Document saved, but its image could not be stored in this browser.');
          }
        }
      }
      // SRS FR1: display success message
      toast.success(res.message || `Document "${form.name}" added successfully!`);
      navigate('/documents');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to add document. Please try again.';
      toast.error(msg);
      setErrors(p => ({ ...p, server: msg }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container max-w-2xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6">
        <Link to="/documents" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-700 transition-colors">
          <ArrowLeft size={16}/> Back to Documents
        </Link>
      </div>

      <div className="card overflow-visible">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-800 px-6 py-5 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Plus size={20} className="text-white"/>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Add Document</h1>
              <p className="text-blue-200 text-sm">All fields marked * are required</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate className="p-6 space-y-5">
          {errors.server && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              <AlertCircle size={16} className="mt-0.5 flex-shrink-0"/>{errors.server}
            </div>
          )}

          {/* Document Name */}
          <div>
            <InputField
              id="doc-name"
              label="Document Name"
              value={form.name}
              onChange={handleChange('name')}
              placeholder="e.g. Passport, Driving Licence, Health Insurance"
              error={errors.name}
              icon={<FileText size={16}/>}
              hint="Enter the official name of the document"
            />
            {/* SRS 7.3: AI Suggestion banner */}
            {aiLoading && (
              <div className="mt-2 flex items-center gap-2 text-xs text-purple-600 bg-purple-50 border border-purple-100 px-3 py-2 rounded-lg">
                <span className="w-3 h-3 border-2 border-purple-400 border-t-purple-700 rounded-full animate-spin"/>
                AI is suggesting a category...
              </div>
            )}
            {aiSuggestion && !aiLoading && (
              <div className="mt-2 flex items-center justify-between gap-2 bg-purple-50 border border-purple-200 px-3 py-2.5 rounded-xl">
                <div className="flex items-center gap-2 text-sm text-purple-700">
                  <Sparkles size={14} className="text-purple-500"/>
                  <span>AI suggests: <strong>{aiSuggestion.suggestedCategory}</strong></span>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                    aiSuggestion.confidence === 'high' ? 'bg-green-100 text-green-700' :
                    aiSuggestion.confidence === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'
                  }`}>{aiSuggestion.confidence}</span>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={acceptSuggestion} className="text-xs bg-purple-600 text-white px-3 py-1 rounded-lg hover:bg-purple-700 font-medium transition-colors">
                    Accept
                  </button>
                  <button type="button" onClick={() => setAiSuggestion(null)} className="text-xs text-purple-500 hover:text-purple-700 px-2 py-1 transition-colors">
                    Dismiss
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="form-label">
              Category <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Tag size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
              <select
                id="category"
                value={form.category}
                onChange={handleChange('category')}
                className={`form-input pl-10 appearance-none cursor-pointer ${errors.category ? 'border-red-400 focus:ring-red-400' : ''}`}
                aria-invalid={!!errors.category}
              >
                <option value="">Select a category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            {errors.category && (
              <p className="form-error" role="alert"><AlertCircle size={12}/>{errors.category}</p>
            )}
          </div>

          {/* Dates row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              id="issue-date"
              label="Issue Date"
              type="date"
              value={form.issueDate}
              onChange={handleChange('issueDate')}
              error={errors.issueDate}
              max={today}
              icon={<Calendar size={16}/>}
              hint="Date the document was issued"
            />
            <InputField
              id="expiry-date"
              label="Expiry Date"
              type="date"
              value={form.expiryDate}
              onChange={handleChange('expiryDate')}
              error={errors.expiryDate}
              min={form.issueDate || today}
              icon={<Calendar size={16}/>}
              hint="Date the document expires"
            />
          </div>

          <div>
            <label htmlFor="document-image" className="form-label flex items-center gap-2">
              <Image size={15}/> Document Picture <span className="text-gray-400 text-xs font-normal">(optional)</span>
            </label>
            <label htmlFor="document-image" className="flex cursor-pointer items-center gap-3 border border-dashed border-gray-300 rounded-xl px-4 py-3 hover:border-blue-400 hover:bg-blue-50/40 transition-colors">
              <span className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center"><Upload size={17}/></span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-gray-700">{documentImage?.name || 'Choose a document image'}</span>
                <span className="block text-xs text-gray-400">JPEG, PNG, GIF, or WEBP · up to 5MB</span>
              </span>
              <ScanLine size={17} className="text-blue-600"/>
            </label>
            <input
              id="document-image"
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleImageSelect}
              className="sr-only"
            />
            {imagePreview && (
              <div className="mt-3 flex items-start gap-3">
                <img src={imagePreview} alt="Selected document" className="h-24 w-24 object-cover rounded-lg border border-gray-200" />
                <p className={`text-sm ${dateScan.status === 'error' ? 'text-amber-700' : dateScan.status === 'found' ? 'text-green-700' : 'text-gray-500'}`} role="status">
                  {dateScan.status === 'scanning' && <span className="inline-block w-3 h-3 mr-2 border-2 border-blue-300 border-t-blue-700 rounded-full animate-spin align-[-2px]"/>}
                  {dateScan.message}
                </p>
              </div>
            )}
            <p className="text-xs text-gray-400 mt-2">Expiry text is read on this device. The detected date is only a suggestion; verify it against the original.</p>
          </div>

          {/* Notes (optional) */}
          <div>
            <label htmlFor="notes" className="form-label flex items-center gap-1">
              Notes <span className="text-gray-400 text-xs font-normal">(optional)</span>
            </label>
            <textarea
              id="notes"
              value={form.notes}
              onChange={handleChange('notes')}
              placeholder="Any additional notes about this document..."
              rows={3}
              maxLength={500}
              className="form-input resize-none"
            />
            <p className="text-xs text-gray-400 mt-1 text-right">{form.notes.length}/500</p>
          </div>

          {/* Info box */}
          <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-700">
            <Info size={14} className="mt-0.5 flex-shrink-0"/>
            <span>Document status (Active / Expiring Soon / Expired) is automatically calculated from the expiry date — you don't need to set it manually.</span>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Link to="/documents" className="btn-secondary flex-1 justify-center">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading || dateScan.status === 'scanning'}
              className="btn-primary flex-1 justify-center"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                  Saving...
                </span>
              ) : dateScan.status === 'scanning' ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                  Reading image...
                </span>
              ) : (
                <><Plus size={16}/> Save Document</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDocumentPage;
