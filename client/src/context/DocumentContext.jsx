import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import api from '../services/api.js';
import { useAuth } from './AuthContext.jsx';
import { localStorageService } from '../services/localStorageService.js';

const DocumentContext = createContext(null);

// SRS: Reminder period options: 7, 15, 30 days
const DEFAULT_PERIOD = parseInt(localStorage.getItem('docalert_period') || '30', 10);

export const DocumentProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [documents, setDocuments]       = useState([]);
  const [summary, setSummary]           = useState({ total: 0, active: 0, expiringSoon: 0, expired: 0 });
  const [reminderPeriod, setReminderPeriodState] = useState(DEFAULT_PERIOD);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState(null);
  // offline/fallback flag
  const [isOffline, setIsOffline]       = useState(false);

  const setReminderPeriod = useCallback((p) => {
    const val = Number(p);
    if ([7, 15, 30].includes(val)) {
      localStorage.setItem('docalert_period', String(val));
      setReminderPeriodState(val);
    }
  }, []);

  // Compute status client-side (SRS 5.1: derived, never stored)
  const computeStatus = useCallback((expiryDate, period = reminderPeriod) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryDate);
    expiry.setHours(0, 0, 0, 0);
    const daysRemaining = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    if (daysRemaining < 0) return { status: 'Expired', daysRemaining };
    if (daysRemaining <= period) return { status: 'Expiring Soon', daysRemaining };
    return { status: 'Active', daysRemaining };
  }, [reminderPeriod]);

  const fetchDocuments = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/documents', { params: { period: reminderPeriod, ...params } });
      setDocuments(res.data.data.documents);
      setSummary(res.data.data.summary);
      setIsOffline(false);
      return res.data.data;
    } catch (err) {
      // Fallback to localStorage if server unavailable
      const local = localStorageService.getDocuments();
      const withStatus = local.map(d => ({ ...d, ...computeStatus(d.expiryDate) }));
      setDocuments(withStatus);
      const s = {
        total: withStatus.length,
        active: withStatus.filter(d => d.status === 'Active').length,
        expiringSoon: withStatus.filter(d => d.status === 'Expiring Soon').length,
        expired: withStatus.filter(d => d.status === 'Expired').length,
      };
      setSummary(s);
      setIsOffline(true);
      setError(null); // don't show error in offline mode
      return { documents: withStatus, summary: s };
    } finally {
      setLoading(false);
    }
  }, [reminderPeriod, computeStatus]);

  const addDocument = useCallback(async (docData) => {
    try {
      const res = await api.post('/documents', docData);
      const newDoc = res.data.data.document;
      setDocuments(prev => [newDoc, ...prev]);
      setSummary(prev => ({
        ...prev,
        total: prev.total + 1,
        [newDoc.status === 'Active' ? 'active' : newDoc.status === 'Expiring Soon' ? 'expiringSoon' : 'expired']:
          prev[newDoc.status === 'Active' ? 'active' : newDoc.status === 'Expiring Soon' ? 'expiringSoon' : 'expired'] + 1,
      }));
      localStorageService.saveDocument(newDoc);
      return res.data;
    } catch (err) {
      // Offline fallback
      const newDoc = { ...docData, _id: `local_${Date.now()}`, createdAt: new Date().toISOString(), ...computeStatus(docData.expiryDate) };
      localStorageService.saveDocument(newDoc);
      setDocuments(prev => [newDoc, ...prev]);
      return { success: true, message: 'Document saved locally.', data: { document: newDoc } };
    }
  }, [computeStatus]);

  const updateDocument = useCallback(async (id, docData) => {
    const res = await api.put(`/documents/${id}`, docData);
    const updated = res.data.data.document;
    setDocuments(prev => prev.map(d => d._id === id ? updated : d));
    localStorageService.updateDocument(id, updated);
    return res.data;
  }, []);

  const deleteDocument = useCallback(async (id) => {
    try {
      const res = await api.delete(`/documents/${id}`);
      setDocuments(prev => prev.filter(d => d._id !== id));
      localStorageService.deleteDocument(id);
      return res.data;
    } catch {
      localStorageService.deleteDocument(id);
      setDocuments(prev => prev.filter(d => d._id !== id));
      return { success: true, message: 'Document deleted.' };
    }
  }, []);

  const getDocumentById = useCallback(async (id) => {
    try {
      const res = await api.get(`/documents/${id}`, { params: { period: reminderPeriod } });
      return res.data.data.document;
    } catch {
      const local = localStorageService.getDocuments();
      return local.find(d => d._id === id) || null;
    }
  }, [reminderPeriod]);

  const getReminders = useCallback(async () => {
    try {
      const res = await api.get('/documents/reminders', { params: { period: reminderPeriod } });
      return res.data.data;
    } catch {
      const local = localStorageService.getDocuments();
      const reminders = local
        .map(d => ({ ...d, ...computeStatus(d.expiryDate) }))
        .filter(d => d.status === 'Expiring Soon')
        .map(d => ({ ...d, message: `"${d.name}" expires in ${d.daysRemaining} day${d.daysRemaining === 1 ? '' : 's'}.` }));
      return { reminders, count: reminders.length, period: reminderPeriod };
    }
  }, [reminderPeriod, computeStatus]);

  // Re-fetch when period changes
  useEffect(() => {
    if (isAuthenticated) fetchDocuments();
  }, [reminderPeriod, isAuthenticated]);

  return (
    <DocumentContext.Provider value={{
      documents, summary, loading, error, reminderPeriod, isOffline,
      setReminderPeriod, fetchDocuments, addDocument, updateDocument,
      deleteDocument, getDocumentById, getReminders, computeStatus,
    }}>
      {children}
    </DocumentContext.Provider>
  );
};

export const useDocuments = () => {
  const ctx = useContext(DocumentContext);
  if (!ctx) throw new Error('useDocuments must be used within DocumentProvider');
  return ctx;
};
