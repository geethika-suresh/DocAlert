// SRS FR4: Search & Filter — instant search by name, filter by category, clear, empty state
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, X, SlidersHorizontal, Plus } from 'lucide-react';
import { useDocuments } from '../context/DocumentContext.jsx';
import DocumentCard from '../components/DocumentCard.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Loader, { CardSkeleton } from '../components/Loader.jsx';
import { ConfirmModal } from '../components/Modal.jsx';
import toast from 'react-hot-toast';

const CATEGORIES = ['All', 'Identity Document', 'Certificate', 'Insurance', 'Government ID', 'Other'];
const STATUS_FILTERS = ['All Status', 'Active', 'Expiring Soon', 'Expired'];

const SearchPage = () => {
  const { documents, loading, fetchDocuments, deleteDocument } = useDocuments();

  const [search, setSearch]           = useState('');
  const [category, setCategory]       = useState('All');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [sortBy, setSortBy]           = useState('expiryDate'); // expiryDate | name | issueDate
  const [sortDir, setSortDir]         = useState('asc');
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null, name: '' });
  const [deleting, setDeleting]       = useState(false);

  useEffect(() => { fetchDocuments(); }, []);

  // FR4: filter in-memory — no page reload
  const filtered = documents
    .filter(doc => {
      const matchSearch   = !search.trim() || doc.name.toLowerCase().includes(search.toLowerCase().trim());
      const matchCategory = category === 'All' || doc.category === category;
      const matchStatus   = statusFilter === 'All Status' || doc.status === statusFilter;
      return matchSearch && matchCategory && matchStatus;
    })
    .sort((a, b) => {
      let va, vb;
      if (sortBy === 'name')        { va = a.name.toLowerCase(); vb = b.name.toLowerCase(); }
      else if (sortBy === 'issueDate') { va = new Date(a.issueDate); vb = new Date(b.issueDate); }
      else                          { va = new Date(a.expiryDate); vb = new Date(b.expiryDate); }
      return sortDir === 'asc' ? (va < vb ? -1 : va > vb ? 1 : 0) : (va > vb ? -1 : va < vb ? 1 : 0);
    });

  const hasFilters = search.trim() || category !== 'All' || statusFilter !== 'All Status';

  const clearAll = () => {
    setSearch('');
    setCategory('All');
    setStatusFilter('All Status');
  };

  const handleDelete = useCallback(async () => {
    setDeleting(true);
    try {
      const res = await deleteDocument(deleteModal.id);
      toast.success(res.message || 'Document deleted.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed.');
    } finally {
      setDeleting(false);
      setDeleteModal({ open: false, id: null, name: '' });
    }
  }, [deleteModal, deleteDocument]);

  return (
    <div className="page-container space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="section-title flex items-center gap-2">
            <Search size={24} className="text-blue-600"/> Search & Filter
          </h1>
          <p className="text-gray-500 text-sm mt-1">Find your documents instantly</p>
        </div>
        <Link to="/documents/add" className="btn-primary text-sm">
          <Plus size={16}/> Add Document
        </Link>
      </div>

      {/* Search + filters card */}
      <div className="card p-5 space-y-4">
        {/* Main search */}
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search documents by name..."
            className="form-input pl-12 pr-4 py-3.5 text-base"
            autoFocus
            aria-label="Search documents"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Clear search"
            >
              <X size={16}/>
            </button>
          )}
        </div>

        {/* Filter row */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Category filter */}
          <div className="relative flex-1">
            <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="form-input pl-8 appearance-none cursor-pointer text-sm"
              aria-label="Filter by category"
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Status filter */}
          <div className="relative flex-1">
            <SlidersHorizontal size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="form-input pl-8 appearance-none cursor-pointer text-sm"
              aria-label="Filter by status"
            >
              {STATUS_FILTERS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Sort */}
          <div className="relative flex-1">
            <select
              value={`${sortBy}_${sortDir}`}
              onChange={e => {
                const [by, dir] = e.target.value.split('_');
                setSortBy(by); setSortDir(dir);
              }}
              className="form-input appearance-none cursor-pointer text-sm"
              aria-label="Sort documents"
            >
              <option value="expiryDate_asc">Expiry: Soonest first</option>
              <option value="expiryDate_desc">Expiry: Latest first</option>
              <option value="name_asc">Name: A → Z</option>
              <option value="name_desc">Name: Z → A</option>
              <option value="issueDate_desc">Recently issued</option>
            </select>
          </div>

          {/* Clear button — SRS FR4 */}
          {hasFilters && (
            <button onClick={clearAll} className="btn-secondary text-sm gap-1.5 whitespace-nowrap">
              <X size={14}/> Clear all
            </button>
          )}
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between text-xs text-gray-500 border-t border-gray-100 pt-3">
          <span>
            {loading ? 'Loading...' : (
              filtered.length === 0
                ? 'No documents found'
                : `${filtered.length} document${filtered.length !== 1 ? 's' : ''} found`
            )}
            {search && ` for "${search}"`}
          </span>
          {hasFilters && (
            <span className="text-blue-600 font-medium flex items-center gap-1">
              <Filter size={11}/> Filters active
            </span>
          )}
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1,2,3].map(i => <CardSkeleton key={i}/>)}
        </div>
      ) : filtered.length === 0 ? (
        documents.length === 0
          ? <EmptyState type="documents"/>
          : <EmptyState type="search" search={search} category={category} onClear={clearAll}/>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(doc => (
            <DocumentCard
              key={doc._id}
              document={doc}
              onDelete={(id, name) => setDeleteModal({ open: true, id, name })}
            />
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, id: null, name: '' })}
        onConfirm={handleDelete}
        title="Delete Document"
        message={`Are you sure you want to delete "${deleteModal.name}"?`}
        confirmLabel="Delete"
        danger={true}
        loading={deleting}
      />
    </div>
  );
};

export default SearchPage;
