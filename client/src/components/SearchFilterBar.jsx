// SRS FR4: Instant search by name, filter by category, clear button
import React from 'react';
import { Search, Filter, X } from 'lucide-react';

const CATEGORIES = ['All', 'Identity Document', 'Certificate', 'Insurance', 'Government ID', 'Other'];

const SearchFilterBar = ({ search, category, onSearchChange, onCategoryChange, onClear, resultCount }) => {
  const hasFilters = search || (category && category !== 'All');

  return (
    <div className="card p-4">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search by name */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
          <input
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search documents by name..."
            className="form-input pl-9 pr-4"
            aria-label="Search documents"
          />
        </div>

        {/* Filter by category */}
        <div className="relative sm:w-52">
          <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
          <select
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="form-input pl-9 pr-4 appearance-none cursor-pointer"
            aria-label="Filter by category"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Clear button — SRS FR4 */}
        {hasFilters && (
          <button
            onClick={onClear}
            className="btn-secondary gap-1.5 px-4 py-2.5 text-sm whitespace-nowrap"
            aria-label="Clear filters"
          >
            <X size={14}/> Clear
          </button>
        )}
      </div>

      {/* Result count */}
      {(search || category !== 'All') && (
        <p className="mt-2 text-xs text-gray-500">
          {resultCount === 0
            ? 'No documents found'
            : `Showing ${resultCount} document${resultCount !== 1 ? 's' : ''}`}
          {search && ` for "${search}"`}
          {category !== 'All' && ` in "${category}"`}
        </p>
      )}
    </div>
  );
};

export default SearchFilterBar;
