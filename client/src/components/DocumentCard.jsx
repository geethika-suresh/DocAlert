// SRS FR2: Each document displays name, category, issue date, expiry date, status
// SRS 3.2.2: Progressive Disclosure — cards show only essentials
import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Tag, ChevronRight, Trash2, Eye, Paperclip } from 'lucide-react';
import StatusBadge from './StatusBadge.jsx';

const CATEGORY_COLORS = {
  'Identity Document': 'bg-purple-100 text-purple-700',
  'Certificate':       'bg-blue-100 text-blue-700',
  'Insurance':         'bg-green-100 text-green-700',
  'Government ID':     'bg-orange-100 text-orange-700',
  'Other':             'bg-gray-100 text-gray-700',
};

const formatDate = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const DocumentCard = ({ document, onDelete }) => {
  const { _id, name, category, issueDate, expiryDate, status, daysRemaining, attachment } = document;
  const catColor = CATEGORY_COLORS[category] || CATEGORY_COLORS['Other'];

  const urgencyBorder = status === 'Expired'
    ? 'border-l-4 border-l-red-400'
    : status === 'Expiring Soon'
    ? 'border-l-4 border-l-amber-400'
    : 'border-l-4 border-l-green-400';

  return (
    <article className={`card hover:shadow-lg transition-all duration-200 ${urgencyBorder} animate-fade-in`}>
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate text-base leading-tight" title={name}>
              {name}
            </h3>
            <span className={`inline-flex items-center gap-1 mt-1 text-xs font-medium px-2 py-0.5 rounded-full ${catColor}`}>
              <Tag size={10}/> {category}
            </span>
          </div>
          <StatusBadge status={status} daysRemaining={daysRemaining} showDays={true} />
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Calendar size={12} className="text-gray-400"/>
            <span className="font-medium text-gray-600">Issued:</span>
            <span>{formatDate(issueDate)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Calendar size={12} className={status === 'Expired' ? 'text-red-400' : status === 'Expiring Soon' ? 'text-amber-400' : 'text-gray-400'}/>
            <span className="font-medium text-gray-600">Expires:</span>
            <span className={status === 'Expired' ? 'text-red-600 font-semibold' : status === 'Expiring Soon' ? 'text-amber-600 font-semibold' : ''}>
              {formatDate(expiryDate)}
            </span>
          </div>
        </div>

        {/* Days remaining message */}
        {status === 'Expiring Soon' && daysRemaining !== undefined && (
          <div className="mb-3 text-xs bg-amber-50 border border-amber-200 text-amber-700 rounded-lg px-3 py-2 flex items-center gap-1.5">
            <span>⏰</span>
            {daysRemaining === 0 ? 'Expires today!' : `Expires in ${daysRemaining} day${daysRemaining === 1 ? '' : 's'}`}
          </div>
        )}
        {status === 'Expired' && (
          <div className="mb-3 text-xs bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 flex items-center gap-1.5">
            <span>⚠️</span> This document has expired. Please renew it.
          </div>
        )}

        {/* Attachment indicator */}
        {attachment && (
          <div className="flex items-center gap-1 text-xs text-blue-600 mb-3">
            <Paperclip size={11}/> Attachment: {attachment.fileName}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between border-t border-gray-100 pt-3 mt-1">
          <Link
            to={`/documents/${_id}`}
            className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            <Eye size={14}/> View Details
            <ChevronRight size={14}/>
          </Link>
          <button
            onClick={() => onDelete?.(_id, name)}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-red-50"
            aria-label={`Delete ${name}`}
            title="Delete document"
          >
            <Trash2 size={14}/>
          </button>
        </div>
      </div>
    </article>
  );
};

export default DocumentCard;
