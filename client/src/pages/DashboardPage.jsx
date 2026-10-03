// SRS FR2: Document Dashboard — summary counts, reminders, status classification
import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, RefreshCw, Settings, Wifi, WifiOff, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
} from 'recharts';
import { useAuth } from '../context/AuthContext.jsx';
import { useDocuments } from '../context/DocumentContext.jsx';
import SummaryCards from '../components/SummaryCards.jsx';
import ReminderPanel from '../components/ReminderPanel.jsx';
import DocumentCard from '../components/DocumentCard.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Loader, { CardSkeleton } from '../components/Loader.jsx';
import { ConfirmModal } from '../components/Modal.jsx';

const PERIOD_OPTIONS = [7, 15, 30];
const PIE_COLORS     = ['#22c55e', '#f59e0b', '#ef4444'];

const DashboardPage = () => {
  const { user }                                         = useAuth();
  const { documents, summary, loading, reminderPeriod,
          isOffline, setReminderPeriod,
          fetchDocuments, deleteDocument, getReminders }  = useDocuments();

  const [reminders, setReminders]     = useState([]);
  const [remLoading, setRemLoading]   = useState(false);
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null, name: '' });
  const [deleting, setDeleting]       = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');

  // Load documents + reminders on mount
  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    const loadReminders = async () => {
      setRemLoading(true);
      try {
        const data = await getReminders();
        setReminders(data.reminders || []);
      } catch { setReminders([]); }
      finally { setRemLoading(false); }
    };
    loadReminders();
  }, [reminderPeriod, documents.length]);

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

  const filteredDocs = statusFilter === 'All'
    ? documents
    : documents.filter(d => d.status === statusFilter);

  // Chart data
  const pieData = [
    { name: 'Active',        value: summary.active        || 0 },
    { name: 'Expiring Soon', value: summary.expiringSoon  || 0 },
    { name: 'Expired',       value: summary.expired       || 0 },
  ].filter(d => d.value > 0);

  const catMap = documents.reduce((acc, d) => { acc[d.category] = (acc[d.category] || 0) + 1; return acc; }, {});
  const barData = Object.entries(catMap).map(([name, count]) => ({ name: name.split(' ')[0], count }));

  return (
    <div className="page-container space-y-8">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="section-title">
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {isOffline
              ? <span className="flex items-center gap-1 text-amber-600"><WifiOff size={13}/> Offline mode — data from local storage</span>
              : <span className="flex items-center gap-1 text-green-600"><Wifi size={13}/> Connected</span>}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => fetchDocuments()}
            className="btn-secondary text-sm px-3 py-2 gap-1.5"
            disabled={loading}
            aria-label="Refresh"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''}/>
            Refresh
          </button>
          {/* SRS FR3: Reminder period selector */}
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm">
            <Settings size={14} className="text-gray-400"/>
            <span className="text-xs text-gray-500 font-medium">Remind:</span>
            <div className="flex gap-1">
              {PERIOD_OPTIONS.map(p => (
                <button
                  key={p}
                  onClick={() => setReminderPeriod(p)}
                  className={`text-xs px-2 py-1 rounded-lg font-semibold transition-colors ${
                    reminderPeriod === p
                      ? 'bg-blue-700 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  aria-label={`Set ${p} day reminder`}
                >
                  {p}d
                </button>
              ))}
            </div>
          </div>
          <Link to="/documents/add" className="btn-primary text-sm">
            <Plus size={16}/> Add Document
          </Link>
        </div>
      </div>

      {/* ── Summary Cards (FR2) ── */}
      <SummaryCards summary={summary} onFilter={setStatusFilter} />

      {/* ── Charts ── */}
      {documents.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <div className="card p-6">
            <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <TrendingUp size={18} className="text-blue-600"/> Document Status
            </h2>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                    {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]}/>)}
                  </Pie>
                  <Tooltip formatter={(v, n) => [v, n]}/>
                  <Legend formatter={(v) => <span className="text-xs text-gray-600">{v}</span>}/>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-gray-400 text-sm">No data yet</div>
            )}
          </div>

          {/* Bar Chart */}
          <div className="card p-6">
            <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <TrendingUp size={18} className="text-purple-600"/> By Category
            </h2>
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={barData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }}/>
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false}/>
                  <Tooltip/>
                  <Bar dataKey="count" fill="#3b82f6" radius={[4,4,0,0]} name="Documents"/>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-gray-400 text-sm">No data yet</div>
            )}
          </div>
        </div>
      )}

      {/* ── Reminders Panel (FR3) ── */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-800 flex items-center gap-2">
            🔔 Expiry Reminders
            {reminders.length > 0 && (
              <span className="text-xs bg-red-100 text-red-600 font-bold px-2 py-0.5 rounded-full">{reminders.length}</span>
            )}
          </h2>
          <Link to="/reminders" className="text-sm text-blue-600 font-medium hover:text-blue-800 transition-colors">
            View all →
          </Link>
        </div>
        {remLoading
          ? <Loader size="sm" message="Loading reminders..."/>
          : <ReminderPanel reminders={reminders.slice(0, 4)} period={reminderPeriod}/>}
      </div>

      {/* ── Documents List (FR2) ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-800 flex items-center gap-2">
            📄 Your Documents
            {statusFilter !== 'All' && (
              <span className="text-xs bg-blue-100 text-blue-700 font-semibold px-2 py-0.5 rounded-full">
                {statusFilter}
              </span>
            )}
          </h2>
          <div className="flex items-center gap-2">
            {statusFilter !== 'All' && (
              <button onClick={() => setStatusFilter('All')} className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors">
                Show all
              </button>
            )}
            <Link to="/documents" className="text-sm text-blue-600 font-medium hover:text-blue-800 transition-colors">
              View all →
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {[1,2,3].map(i => <CardSkeleton key={i}/>)}
          </div>
        ) : filteredDocs.length === 0 ? (
          <EmptyState type="documents"/>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredDocs.slice(0, 6).map(doc => (
              <DocumentCard
                key={doc._id}
                document={doc}
                onDelete={(id, name) => setDeleteModal({ open: true, id, name })}
              />
            ))}
          </div>
        )}
        {filteredDocs.length > 6 && (
          <div className="text-center mt-4">
            <Link to="/documents" className="btn-secondary text-sm">
              View all {filteredDocs.length} documents →
            </Link>
          </div>
        )}
      </div>

      {/* ── Delete Confirmation ── */}
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

export default DashboardPage;
