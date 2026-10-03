// SRS FR2: Document Dashboard — all documents, status badges, summary
// SRS FR4: Search & Filter integrated
import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, RefreshCw, LayoutGrid, List } from 'lucide-react';
import toast from 'react-hot-toast';
import { useDocuments } from '../context/DocumentContext.jsx';
import DocumentCard from '../components/DocumentCard.jsx';
import SearchFilterBar from '../components/SearchFilterBar.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Loader, { CardSkeleton } from '../components/Loader.jsx';
import { ConfirmModal } from '../components/Modal.jsx';
import StatusBadge from '../components/StatusBadge.jsx';

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const DocumentsPage = () => {
  const { documents, summary, loading, reminderPeriod, fetchDocuments, deleteDocument } = useDocuments();

  const [search, setSearch]         = useState('');
  const [category, setCategory]     = useState('All');
  const [viewMode, setViewMode]     = useState('grid'); // grid | list
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null, name: '' });
  const [deleting, setDeleting]     = useState(false);

  useEffect(() => { fetchDocuments(); }, []);

  // FR4: In-memory search + filter
  const filtered = documents.filter(doc => {
    const matchSearch   = !search.trim() || doc.name.toLowerCase().includes(search.toLowerCase().trim());
    const matchCategory = category === 'All' || doc.category === category;
    return matchSearch && matchCategory;
  });

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
          <h1 className="section-title">My Documents</h1>
          <p className="text-gray-500 text-sm mt-1">
            {summary.total} total · {summary.active} active · {summary.expiringSoon} expiring · {summary.expired} expired
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchDocuments()}
            className="btn-secondary text-sm px-3 py-2"
            disabled={loading}
            aria-label="Refresh"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''}/>
          </button>
          {/* View toggle */}
          <div className="flex border border-gray-200 rounded-xl overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 transition-colors ${viewMode === 'grid' ? 'bg-blue-700 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
              aria-label="Grid view"
            >
              <LayoutGrid size={16}/>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 transition-colors ${viewMode === 'list' ? 'bg-blue-700 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
              aria-label="List view"
            >
              <List size={16}/>
            </button>
          </div>
          <Link to="/documents/add" className="btn-primary text-sm">
            <Plus size={16}/> Add Document
          </Link>
        </div>
      </div>

      {/* FR4: Search & Filter */}
      <SearchFilterBar
        search={search}
        category={category}
        onSearchChange={setSearch}
        onCategoryChange={setCategory}
        onClear={() => { setSearch(''); setCategory('All'); }}
        resultCount={filtered.length}
      />

      {/* Document list */}
      {loading ? (
        <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
          {[1,2,3,4,5,6].map(i => <CardSkeleton key={i}/>)}
        </div>
      ) : filtered.length === 0 ? (
        documents.length === 0
          ? <EmptyState type="documents"/>
          : <EmptyState type="search" search={search} category={category} onClear={() => { setSearch(''); setCategory('All'); }}/>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(doc => (
            <DocumentCard
              key={doc._id}
              document={doc}
              onDelete={(id, name) => setDeleteModal({ open: true, id, name })}
            />
          ))}
        </div>
      ) : (
        /* List view */
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm" role="table">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Document Name</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">Category</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Issue Date</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Expiry Date</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((doc, idx) => (
                  <tr key={doc._id} className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${idx % 2 === 0 ? '' : 'bg-gray-50/50'}`}>
                    <td className="px-4 py-3">
                      <Link to={`/documents/${doc._id}`} className="font-semibold text-blue-700 hover:text-blue-900 transition-colors">
                        {doc.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">{doc.category}</td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{formatDate(doc.issueDate)}</td>
                    <td className="px-4 py-3 text-gray-600">{formatDate(doc.expiryDate)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={doc.status} daysRemaining={doc.daysRemaining} showDays={true}/>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setDeleteModal({ open: true, id: doc._id, name: doc.name })}
                        className="text-xs text-red-400 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50 transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 text-xs text-gray-400 border-t border-gray-100">
            Showing {filtered.length} of {documents.length} documents
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, id: null, name: '' })}
        onConfirm={handleDelete}
        title="Delete Document"
        message={`Are you sure you want to delete "${deleteModal.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        danger={true}
        loading={deleting}
      />
    </div>
  );
};

export default DocumentsPage;
