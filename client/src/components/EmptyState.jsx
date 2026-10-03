// SRS FR4: Friendly empty-state message when no results found
import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Plus, Search } from 'lucide-react';

const EmptyState = ({ type = 'documents', search, category, onClear }) => {
  if (type === 'search') {
    return (
      <div className="card py-14 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Search size={28} className="text-gray-400"/>
        </div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">No documents found</h3>
        <p className="text-gray-500 text-sm mb-6 max-w-xs">
          {search
            ? `No documents match "${search}"${category !== 'All' ? ` in "${category}"` : ''}.`
            : `No documents in "${category}" category.`}
        </p>
        {onClear && (
          <button onClick={onClear} className="btn-secondary text-sm">
            Clear filters
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="card py-16 flex flex-col items-center justify-center text-center">
      <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-5">
        <FileText size={36} className="text-blue-400"/>
      </div>
      <h3 className="text-xl font-bold text-gray-800 mb-2">No documents yet</h3>
      <p className="text-gray-500 text-sm mb-6 max-w-sm">
        Start by adding your important documents — passports, certificates, insurance cards — and never miss a renewal again.
      </p>
      <Link to="/documents/add" className="btn-primary">
        <Plus size={16}/> Add Your First Document
      </Link>
    </div>
  );
};

export default EmptyState;
