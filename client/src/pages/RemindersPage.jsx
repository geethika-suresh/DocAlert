// SRS FR3: Expiry Reminders — 7/15/30 days, reminder cards, optional browser notifications
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, BellOff, CheckCircle, Settings, ChevronRight, AlertTriangle, Clock, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import { useDocuments } from '../context/DocumentContext.jsx';
import Loader from '../components/Loader.jsx';
import { getRenewalTips } from '../services/aiService.js';

const PERIOD_OPTIONS = [
  { value: 7,  label: '7 days',  desc: 'Urgent alerts only' },
  { value: 15, label: '15 days', desc: 'Standard window' },
  { value: 30, label: '30 days', desc: 'Wide safety net' },
];

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const RemindersPage = () => {
  const { documents, reminderPeriod, setReminderPeriod, getReminders, loading } = useDocuments();

  const [reminders, setReminders]           = useState([]);
  const [remLoading, setRemLoading]         = useState(false);
  const [notifEnabled, setNotifEnabled]     = useState(false);
  const [notifPermission, setNotifPermission] = useState('default');
  const [tips, setTips]                     = useState([]);
  const [tipsLoading, setTipsLoading]       = useState(false);

  // Check notification permission on mount
  useEffect(() => {
    if ('Notification' in window) {
      setNotifPermission(Notification.permission);
      setNotifEnabled(Notification.permission === 'granted');
    }
  }, []);

  // Load reminders when period changes
  useEffect(() => {
    const load = async () => {
      setRemLoading(true);
      try {
        const data = await getReminders();
        setReminders(data.reminders || []);
        // Auto-load tips for the most common category
        if (data.reminders?.length > 0) {
          loadTips(data.reminders[0].category);
        }
      } catch { setReminders([]); }
      finally { setRemLoading(false); }
    };
    load();
  }, [reminderPeriod]);

  const loadTips = async (category) => {
    setTipsLoading(true);
    try {
      const result = await getRenewalTips(category);
      setTips(result.tips || []);
    } catch { setTips([]); }
    finally { setTipsLoading(false); }
  };

  // SRS FR3: Optional browser notifications
  const requestNotifications = async () => {
    if (!('Notification' in window)) {
      toast.error('Browser notifications are not supported in this browser.');
      return;
    }
    try {
      const permission = await Notification.requestPermission();
      setNotifPermission(permission);
      if (permission === 'granted') {
        setNotifEnabled(true);
        toast.success('Browser notifications enabled!');
        // Send a test notification
        new Notification('DocAlert', {
          body: `You have ${reminders.length} document${reminders.length !== 1 ? 's' : ''} expiring within ${reminderPeriod} days.`,
          icon: '/favicon.svg',
        });
        // Persist preference
        localStorage.setItem('docalert_notifications', 'true');
      } else {
        toast.error('Notification permission denied. In-app banners will still work.');
        setNotifEnabled(false);
      }
    } catch (e) {
      toast.error('Could not request notification permission.');
    }
  };

  const disableNotifications = () => {
    setNotifEnabled(false);
    localStorage.removeItem('docalert_notifications');
    toast.success('Browser notifications disabled. In-app reminders are still active.');
  };

  // Separate expired from expiring soon
  const expiredDocs   = documents.filter(d => d.status === 'Expired');
  const expiringSoon  = reminders.filter(r => r.status === 'Expiring Soon');

  return (
    <div className="page-container space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="section-title flex items-center gap-2">
            <Bell size={24} className="text-amber-500"/> Expiry Reminders
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Documents expiring within your selected window
          </p>
        </div>
        {/* Notification toggle */}
        <div>
          {notifPermission === 'granted' && notifEnabled ? (
            <button onClick={disableNotifications} className="btn-secondary text-sm gap-2">
              <BellOff size={15}/> Disable Notifications
            </button>
          ) : (
            <button onClick={requestNotifications} className="btn-primary text-sm gap-2 bg-amber-500 hover:bg-amber-600 border-amber-500">
              <Bell size={15}/> Enable Browser Notifications
            </button>
          )}
        </div>
      </div>

      {/* Reminder period selector — SRS FR3: 7, 15, 30 days */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Settings size={16} className="text-gray-500"/>
          <h2 className="font-semibold text-gray-800">Reminder Window</h2>
          <span className="text-xs text-gray-400">— Documents expiring within this many days will be flagged</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {PERIOD_OPTIONS.map(({ value, label, desc }) => (
            <button
              key={value}
              onClick={() => setReminderPeriod(value)}
              className={`relative p-4 rounded-xl border-2 transition-all duration-200 text-left
                ${reminderPeriod === value
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300 bg-white'}`}
              aria-pressed={reminderPeriod === value}
            >
              {reminderPeriod === value && (
                <CheckCircle size={14} className="absolute top-2 right-2 text-blue-600"/>
              )}
              <p className={`font-bold text-lg ${reminderPeriod === value ? 'text-blue-700' : 'text-gray-800'}`}>{label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Notification info */}
      {notifPermission !== 'granted' && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <Info size={16} className="text-amber-600 mt-0.5 flex-shrink-0"/>
          <div className="text-sm text-amber-800">
            <strong>In-app banners are always shown.</strong> Enable browser notifications above to also receive desktop alerts when DocAlert is open.
          </div>
        </div>
      )}

      {/* Expired section */}
      {expiredDocs.length > 0 && (
        <div>
          <h2 className="font-bold text-red-700 text-lg mb-3 flex items-center gap-2">
            <AlertTriangle size={18}/> Expired Documents ({expiredDocs.length})
          </h2>
          <div className="space-y-3">
            {expiredDocs.map(doc => (
              <div key={doc._id} className="card border-l-4 border-l-red-400 bg-red-50 p-4 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-red-800 truncate">{doc.name}</p>
                  <p className="text-xs text-red-600 mt-0.5">
                    {doc.category} · Expired: {formatDate(doc.expiryDate)}
                  </p>
                </div>
                <Link to={`/documents/${doc._id}`} className="flex-shrink-0 flex items-center gap-1 text-sm text-red-600 hover:text-red-800 font-medium transition-colors">
                  View <ChevronRight size={14}/>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expiring Soon section */}
      <div>
        <h2 className="font-bold text-gray-800 text-lg mb-3 flex items-center gap-2">
          <Clock size={18} className="text-amber-500"/>
          Expiring within {reminderPeriod} days
          {remLoading
            ? <span className="text-sm font-normal text-gray-400 ml-2">Loading...</span>
            : <span className="text-sm font-normal text-gray-500 ml-2">({expiringSoon.length} found)</span>}
        </h2>

        {remLoading ? (
          <Loader size="md" message="Checking upcoming expiries..."/>
        ) : expiringSoon.length === 0 ? (
          <div className="card p-10 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={28} className="text-green-600"/>
            </div>
            <h3 className="font-semibold text-gray-800 text-lg mb-1">All clear!</h3>
            <p className="text-gray-500 text-sm">No documents are expiring within the next {reminderPeriod} days.</p>
            <p className="text-gray-400 text-xs mt-2">Try a wider window (15 or 30 days) to see upcoming renewals.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {expiringSoon.map(doc => {
              const isUrgent = doc.daysRemaining <= 7;
              return (
                <div
                  key={doc._id}
                  className={`card border-l-4 p-4 flex items-center gap-4
                    ${isUrgent ? 'border-l-red-400 bg-red-50' : 'border-l-amber-400 bg-amber-50'}`}
                >
                  <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center flex-shrink-0 font-bold
                    ${isUrgent ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                    <span className="text-lg leading-none">{doc.daysRemaining}</span>
                    <span className="text-xs">days</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    {/* SRS FR3: message includes name + days remaining */}
                    <p className={`font-semibold truncate ${isUrgent ? 'text-red-800' : 'text-amber-800'}`}>{doc.name}</p>
                    <p className={`text-xs mt-0.5 ${isUrgent ? 'text-red-600' : 'text-amber-600'}`}>
                      {doc.category} · Expires: {formatDate(doc.expiryDate)}
                      {doc.daysRemaining === 0 && ' — Expires TODAY!'}
                    </p>
                    <p className={`text-xs font-medium mt-1 ${isUrgent ? 'text-red-700' : 'text-amber-700'}`}>
                      {doc.message || `"${doc.name}" expires in ${doc.daysRemaining} day${doc.daysRemaining === 1 ? '' : 's'}.`}
                    </p>
                  </div>
                  <Link
                    to={`/documents/${doc._id}`}
                    className={`flex-shrink-0 flex items-center gap-1 text-sm font-medium transition-colors
                      ${isUrgent ? 'text-red-600 hover:text-red-800' : 'text-amber-600 hover:text-amber-800'}`}
                  >
                    View <ChevronRight size={14}/>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* AI Renewal Tips */}
      {tips.length > 0 && (
        <div className="card p-5">
          <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            💡 Renewal Tips
            {tipsLoading && <span className="w-3 h-3 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin"/>}
          </h2>
          <ul className="space-y-2">
            {tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                <CheckCircle size={14} className="text-green-500 mt-0.5 flex-shrink-0"/>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* All documents link */}
      {documents.length === 0 && (
        <div className="text-center">
          <p className="text-gray-500 text-sm mb-4">No documents added yet.</p>
          <Link to="/documents/add" className="btn-primary text-sm">Add your first document</Link>
        </div>
      )}
    </div>
  );
};

export default RemindersPage;
