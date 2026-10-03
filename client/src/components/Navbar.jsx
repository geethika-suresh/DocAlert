import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Bell, LogOut, Menu, X, User, FileText, HelpCircle, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useDocuments } from '../context/DocumentContext.jsx';
import DocAlertLogo from './DocAlertLogo.jsx';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { summary, reminderPeriod }       = useDocuments();
  const location  = useLocation();
  const navigate  = useNavigate();
  const [menuOpen, setMenuOpen]   = useState(false);
  const [dropOpen, setDropOpen]   = useState(false);
  const dropRef = useRef(null);

  const alertCount = (summary?.expiringSoon || 0) + (summary?.expired || 0);

  useEffect(() => {
    const handler = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  const handleLogout = () => { logout(); navigate('/login'); };

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const navLinks = [
    { to: '/dashboard',       label: 'Dashboard',  icon: <LayoutDashboard size={16}/> },
    { to: '/documents',       label: 'Documents',  icon: <FileText size={16}/> },
    { to: '/reminders',       label: 'Reminders',  icon: <Bell size={16}/> },
    { to: '/search',          label: 'Search',     icon: <Search size={16}/> },
    { to: '/help',            label: 'Help',       icon: <HelpCircle size={16}/> },
  ];

  if (!isAuthenticated) return null;

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex-shrink-0">
            <DocAlertLogo size={36} showText={true} textSize="text-xl" />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            {navLinks.map(({ to, label, icon }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 relative
                  ${isActive(to)
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
              >
                {icon}
                {label}
                {label === 'Reminders' && alertCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {alertCount > 9 ? '9+' : alertCount}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          {/* Right: User menu */}
          <div className="flex items-center gap-3">
            {/* Bell shortcut */}
            <Link to="/reminders" className="relative p-2 text-gray-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors">
              <Bell size={20} />
              {alertCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </Link>

            {/* User dropdown */}
            <div className="relative" ref={dropRef}>
              <button
                onClick={() => setDropOpen(!dropOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-100 transition-colors"
                aria-label="User menu"
                aria-expanded={dropOpen}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <span className="hidden md:block text-sm font-medium text-gray-700 max-w-[120px] truncate">
                  {user?.name}
                </span>
              </button>

              {dropOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-1 animate-slide-down">
                  <div className="px-4 py-2.5 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  </div>
                  <div className="px-2 py-1">
                    <div className="flex items-center gap-2 px-3 py-2 text-xs text-gray-500">
                      <Bell size={12} />
                      <span>Reminder: {reminderPeriod} days</span>
                    </div>
                  </div>
                  <div className="border-t border-gray-100 px-2 py-1">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <LogOut size={15} />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white animate-slide-down">
          <nav className="px-4 py-3 space-y-1">
            {navLinks.map(({ to, label, icon }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors
                  ${isActive(to) ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                {icon}
                {label}
                {label === 'Reminders' && alertCount > 0 && (
                  <span className="ml-auto w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {alertCount}
                  </span>
                )}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut size={16} /> Sign out
            </button>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
