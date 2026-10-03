import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Context Providers
import { AuthProvider } from './context/AuthContext.jsx';
import { DocumentProvider } from './context/DocumentContext.jsx';

// Components
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

// Pages
import LandingPage          from './pages/LandingPage.jsx';
import LoginPage            from './pages/LoginPage.jsx';
import RegisterPage         from './pages/RegisterPage.jsx';
import DashboardPage        from './pages/DashboardPage.jsx';
import DocumentsPage        from './pages/DocumentsPage.jsx';
import AddDocumentPage      from './pages/AddDocumentPage.jsx';
import DocumentDetailsPage  from './pages/DocumentDetailsPage.jsx';
import RemindersPage        from './pages/RemindersPage.jsx';
import SearchPage           from './pages/SearchPage.jsx';
import HelpPage             from './pages/HelpPage.jsx';

// Layout wrapper for authenticated pages
const AppLayout = ({ children }) => (
  <>
    <Navbar/>
    <main className="min-h-[calc(100vh-4rem)]">{children}</main>
  </>
);

const App = () => {
  return (
    <AuthProvider>
      <DocumentProvider>
        {/* SRS NFR5: meaningful feedback after user actions */}
        <Toaster
          position="top-right"
          gutter={8}
          toastOptions={{
            duration: 4000,
            style: {
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              borderRadius: '12px',
              padding: '12px 16px',
              boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
            },
            success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
            error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />

        <Routes>
          {/* ── Public routes ── */}
          <Route path="/"         element={<LandingPage/>}/>
          {/* SRS: First page is login/signup */}
          <Route path="/login"    element={<LoginPage/>}/>
          <Route path="/register" element={<RegisterPage/>}/>

          {/* ── Protected routes ── */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <AppLayout><DashboardPage/></AppLayout>
            </ProtectedRoute>
          }/>

          {/* FR2: Documents list */}
          <Route path="/documents" element={
            <ProtectedRoute>
              <AppLayout><DocumentsPage/></AppLayout>
            </ProtectedRoute>
          }/>

          {/* FR1: Add document */}
          <Route path="/documents/add" element={
            <ProtectedRoute>
              <AppLayout><AddDocumentPage/></AppLayout>
            </ProtectedRoute>
          }/>

          {/* FR5: Document details */}
          <Route path="/documents/:id" element={
            <ProtectedRoute>
              <AppLayout><DocumentDetailsPage/></AppLayout>
            </ProtectedRoute>
          }/>

          {/* FR3: Reminders */}
          <Route path="/reminders" element={
            <ProtectedRoute>
              <AppLayout><RemindersPage/></AppLayout>
            </ProtectedRoute>
          }/>

          {/* FR4: Search & Filter */}
          <Route path="/search" element={
            <ProtectedRoute>
              <AppLayout><SearchPage/></AppLayout>
            </ProtectedRoute>
          }/>

          {/* Help / About */}
          <Route path="/help" element={
            <ProtectedRoute>
              <AppLayout><HelpPage/></AppLayout>
            </ProtectedRoute>
          }/>

          {/* Fallback: redirect to dashboard if authenticated, else login */}
          <Route path="*" element={<Navigate to="/login" replace/>}/>
        </Routes>
      </DocumentProvider>
    </AuthProvider>
  );
};

export default App;
