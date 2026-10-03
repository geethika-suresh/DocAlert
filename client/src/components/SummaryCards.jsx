// SRS FR2: Dashboard displays summary counts for document statuses
import React from 'react';
import { FileText, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

const SummaryCard = ({ label, count, icon, colorClass, bgClass, borderClass, onClick }) => (
  <button
    onClick={onClick}
    className={`card p-5 flex items-center gap-4 w-full text-left border-t-4 ${borderClass} hover:shadow-lg transition-all duration-200 active:scale-95`}
  >
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bgClass} flex-shrink-0`}>
      <span className={colorClass}>{icon}</span>
    </div>
    <div>
      <p className="text-3xl font-extrabold text-gray-900">{count}</p>
      <p className="text-sm text-gray-500 font-medium">{label}</p>
    </div>
  </button>
);

const SummaryCards = ({ summary, onFilter }) => {
  const { total = 0, active = 0, expiringSoon = 0, expired = 0 } = summary || {};

  const cards = [
    { label: 'Total Documents', count: total,        icon: <FileText size={22}/>,       colorClass: 'text-blue-600',   bgClass: 'bg-blue-50',   borderClass: 'border-blue-400',   filter: 'All' },
    { label: 'Active',          count: active,       icon: <CheckCircle size={22}/>,    colorClass: 'text-green-600',  bgClass: 'bg-green-50',  borderClass: 'border-green-400',  filter: 'Active' },
    { label: 'Expiring Soon',   count: expiringSoon, icon: <Clock size={22}/>,          colorClass: 'text-amber-600',  bgClass: 'bg-amber-50',  borderClass: 'border-amber-400',  filter: 'Expiring Soon' },
    { label: 'Expired',         count: expired,      icon: <AlertTriangle size={22}/>,  colorClass: 'text-red-600',    bgClass: 'bg-red-50',    borderClass: 'border-red-400',    filter: 'Expired' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <SummaryCard key={card.label} {...card} onClick={() => onFilter?.(card.filter)} />
      ))}
    </div>
  );
};

export default SummaryCards;
