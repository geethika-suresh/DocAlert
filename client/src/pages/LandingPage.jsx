import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, ShieldCheck, Search, FileText, BarChart2, CheckCircle, ArrowRight, Star } from 'lucide-react';
import DocAlertLogo from '../components/DocAlertLogo.jsx';

const features = [
  { icon: <FileText size={24}/>, title: 'Add Documents',      desc: 'Store your passport, ID cards, certificates, and insurance with issue and expiry dates.',      color: 'bg-blue-100 text-blue-600' },
  { icon: <BarChart2 size={24}/>, title: 'Smart Dashboard',   desc: 'See all documents classified as Active, Expiring Soon, or Expired at a glance.',              color: 'bg-purple-100 text-purple-600' },
  { icon: <Bell size={24}/>,     title: 'Expiry Reminders',   desc: 'Get timely alerts at 7, 15, or 30 days before expiry — in-app banners and browser notifications.', color: 'bg-amber-100 text-amber-600' },
  { icon: <Search size={24}/>,   title: 'Search & Filter',    desc: 'Instantly search by name and filter by category without page reloads.',                        color: 'bg-green-100 text-green-600' },
  { icon: <FileText size={24}/>, title: 'Document Details',   desc: 'View complete document info and attach a photo or PDF for reference — stored locally.',        color: 'bg-red-100 text-red-600' },
  { icon: <ShieldCheck size={24}/>, title: 'Privacy First',   desc: 'All data stays in your browser. Nothing leaves your device without your consent.',             color: 'bg-teal-100 text-teal-600' },
];

const stats = [
  { value: '100%', label: 'Free Forever' },
  { value: '5',    label: 'Core Features' },
  { value: '0',    label: 'Paid Services' },
  { value: '∞',    label: 'Documents' },
];

const LandingPage = () => (
  <div className="min-h-screen bg-white overflow-x-hidden">
    {/* ── Navbar ── */}
    <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <DocAlertLogo size={36} showText={true} textSize="text-xl" />
        <div className="flex items-center gap-3">
          <Link to="/login"    className="btn-secondary text-sm px-4 py-2">Sign in</Link>
          <Link to="/register" className="btn-primary  text-sm px-4 py-2">Get started free</Link>
        </div>
      </div>
    </header>

    {/* ── Hero ── */}
    <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600 pt-20 pb-32 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400 rounded-full opacity-10 blur-3xl"/>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-200 rounded-full opacity-10 blur-3xl"/>
      </div>
      <div className="relative max-w-4xl mx-auto px-4 text-center">
        <div className="inline-flex items-center gap-2 bg-white/10 text-blue-100 text-sm px-4 py-1.5 rounded-full mb-8 border border-white/20">
          <Star size={14} className="text-amber-400"/>
          Free student document management tool
        </div>
        <div className="flex justify-center mb-8">
          <DocAlertLogo size={80} showText={false} />
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
          Never Miss a<br/>
          <span className="text-amber-400">Document Renewal</span><br/>
          Again
        </h1>
        <p className="text-blue-100 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          DocAlert helps students organise important documents, track expiry dates, and get timely reminders — all for free, right in your browser.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/register" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-amber-400 hover:bg-amber-300 text-blue-900 font-bold rounded-2xl text-lg transition-all duration-200 shadow-lg active:scale-95">
            Get started free <ArrowRight size={20}/>
          </Link>
          <Link to="/login" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-2xl text-lg transition-all duration-200 border border-white/30">
            Sign in
          </Link>
        </div>
      </div>
    </section>

    {/* ── Stats ── */}
    <section className="max-w-4xl mx-auto px-4 -mt-12 relative z-10">
      <div className="bg-white rounded-3xl shadow-hero p-8 grid grid-cols-2 sm:grid-cols-4 gap-6">
        {stats.map(({ value, label }) => (
          <div key={label} className="text-center">
            <p className="text-4xl font-extrabold text-blue-700">{value}</p>
            <p className="text-sm text-gray-500 mt-1 font-medium">{label}</p>
          </div>
        ))}
      </div>
    </section>

    {/* ── Features ── */}
    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="text-center mb-14">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">Everything you need to stay organised</h2>
        <p className="text-gray-500 text-lg max-w-2xl mx-auto">Five core features built exactly to help students manage important documents and never miss a renewal.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map(({ icon, title, desc, color }) => (
          <div key={title} className="card p-6 hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${color}`}>{icon}</div>
            <h3 className="font-bold text-gray-900 text-lg mb-2">{title}</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </section>

    {/* ── How it works ── */}
    <section className="bg-blue-50 py-20">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-12">Get started in 3 simple steps</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {[
            { step: '01', title: 'Create your account', desc: 'Sign up for free — no credit card or paid subscription required.' },
            { step: '02', title: 'Add your documents',  desc: 'Enter document name, category, issue date, and expiry date with full validation.' },
            { step: '03', title: 'Stay reminded',       desc: 'Get automatic reminders at 7, 15, or 30 days before any document expires.' },
          ].map(({ step, title, desc }) => (
            <div key={step} className="flex flex-col items-center">
              <div className="w-14 h-14 rounded-2xl bg-blue-700 text-white font-extrabold text-xl flex items-center justify-center mb-4 shadow-md">{step}</div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ── CTA ── */}
    <section className="bg-gradient-to-br from-blue-800 to-blue-900 py-20">
      <div className="max-w-2xl mx-auto px-4 text-center">
        <h2 className="text-3xl font-extrabold text-white mb-4">Ready to get organised?</h2>
        <p className="text-blue-200 mb-8 text-lg">Join students who never miss a document renewal with DocAlert.</p>
        <Link to="/register" className="inline-flex items-center gap-2 px-8 py-4 bg-amber-400 hover:bg-amber-300 text-blue-900 font-bold rounded-2xl text-lg transition-all shadow-lg active:scale-95">
          Start for free <ArrowRight size={20}/>
        </Link>
        <p className="text-blue-300 text-sm mt-4 flex items-center justify-center gap-2">
          <CheckCircle size={14}/> No credit card · No paid services · 100% browser-based
        </p>
      </div>
    </section>

    {/* ── Footer ── */}
    <footer className="bg-blue-950 text-blue-400 py-8 text-center text-sm">
      <DocAlertLogo size={28} showText={true} textSize="text-base" />
      <p className="mt-3">© 2026 DocAlert. Student Document Reminder System. Built as a Final Year CSE Project.</p>
      <p className="mt-1 text-blue-500 text-xs">Free · Open Source · No Paid Services Required</p>
    </footer>
  </div>
);

export default LandingPage;
