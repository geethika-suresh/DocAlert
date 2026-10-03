// SRS FR3: Reminder banners and cards on dashboard
import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, Clock, AlertTriangle, ChevronRight } from 'lucide-react';

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const ReminderPanel = ({ reminders = [], period, onPeriodChange }) => {
  if (reminders.length === 0) {
    return (
      <div className="card p-6 flex flex-col items-center justify-center gap-3 text-center">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
          <Bell size={22} className="text-green-600"/>
        </div>
        <div>
          <p className="font-semibold text-gray-800">No reminders for {period}-day window</p>
          <p className="text-sm text-gray-500 mt-1">All documents are safe. Try a wider reminder period.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {reminders.map((reminder) => {
        const isUrgent = reminder.daysRemaining <= 7;
        const isExpired = reminder.status === 'Expired';
        return (
          <div
            key={reminder._id}
            className={`rounded-xl border p-4 flex items-center gap-4 transition-all
              ${isExpired
                ? 'bg-red-50 border-red-200'
                : isUrgent
                ? 'bg-amber-50 border-amber-200'
                : 'bg-blue-50 border-blue-200'}`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
              ${isExpired ? 'bg-red-100' : isUrgent ? 'bg-amber-100' : 'bg-blue-100'}`}>
              {isExpired
                ? <AlertTriangle size={18} className="text-red-600"/>
                : <Clock size={18} className={isUrgent ? 'text-amber-600' : 'text-blue-600'}/>}
            </div>
            <div className="flex-1 min-w-0">
              {/* SRS FR3: message includes document name + days remaining */}
              <p className={`font-semibold text-sm ${isExpired ? 'text-red-800' : isUrgent ? 'text-amber-800' : 'text-blue-800'}`}>
                {reminder.name}
              </p>
              <p className={`text-xs mt-0.5 ${isExpired ? 'text-red-600' : isUrgent ? 'text-amber-600' : 'text-blue-600'}`}>
                {reminder.message || (isExpired
                  ? 'Expired — please renew immediately'
                  : reminder.daysRemaining === 0
                  ? 'Expires today!'
                  : `Expires in ${reminder.daysRemaining} day${reminder.daysRemaining === 1 ? '' : 's'} · ${formatDate(reminder.expiryDate)}`)}
              </p>
            </div>
            <Link
              to={`/documents/${reminder._id}`}
              className={`flex-shrink-0 p-1.5 rounded-lg transition-colors
                ${isExpired ? 'text-red-400 hover:bg-red-100' : 'text-blue-400 hover:bg-blue-100'}`}
              aria-label={`View ${reminder.name}`}
            >
              <ChevronRight size={16}/>
            </Link>
          </div>
        );
      })}
    </div>
  );
};

export default ReminderPanel;
