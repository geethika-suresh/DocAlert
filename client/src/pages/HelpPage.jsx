// SRS IR1: Help / About section
import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, FileText, Bell, Search, BarChart2, Shield, ExternalLink } from 'lucide-react';
import DocAlertLogo from '../components/DocAlertLogo.jsx';

const FAQ = [
  { q: 'What is DocAlert?', a: 'DocAlert is a free, browser-based document management and expiry tracking web application designed for students. It helps you organise important documents like passports, ID cards, certificates, and insurance, and alerts you before they expire.' },
  { q: 'How is my data stored?', a: 'All document data is stored in your browser\'s LocalStorage and IndexedDB. Your data never leaves your device in the MVP version. No data is sent to any external server unless you connect a backend.' },
  { q: 'What reminder periods are available?', a: 'You can choose from 7, 15, or 30 days. The reminder period determines how many days before expiry a document is flagged as "Expiring Soon". You can change this at any time from the dashboard.' },
  { q: 'Can I attach files to documents?', a: 'Yes! In the Document Details view, you can attach a PDF, PNG, JPEG, GIF, or WEBP file up to 5MB. Attachments are stored locally in IndexedDB and never uploaded to a server.' },
  { q: 'How does the category suggestion work?', a: 'When you type a document name, DocAlert uses a built-in rule-based AI (no paid API, no internet required) to suggest a category. For example, typing "Passport" will suggest "Identity Document". You can accept or ignore the suggestion.' },
  { q: 'Does DocAlert require a paid subscription?', a: 'No. DocAlert is completely free. It uses open-source technologies (React, Express, MongoDB free tier) and requires no credit card, no paid API, and no paid subscription.' },
  { q: 'What document categories are supported?', a: 'Identity Document, Certificate, Insurance, Government ID, and Other.' },
  { q: 'Can I use DocAlert offline?', a: 'Yes! Once loaded, the core features work offline because data is stored in your browser. You only need internet to initially load the app.' },
];

const features = [
  { icon: <FileText size={18}/>, title: 'FR1: Add Document',      desc: 'Add documents with name, category, issue date, and expiry date. Full validation included.',  color: 'bg-blue-100 text-blue-700' },
  { icon: <BarChart2 size={18}/>, title: 'FR2: Document Dashboard', desc: 'View all documents with Active, Expiring Soon, Expired status badges and summary counts.', color: 'bg-purple-100 text-purple-700' },
  { icon: <Bell size={18}/>,     title: 'FR3: Expiry Reminders',   desc: 'Reminder banners for 7, 15, or 30 days before expiry with optional browser notifications.',  color: 'bg-amber-100 text-amber-700' },
  { icon: <Search size={18}/>,   title: 'FR4: Search & Filter',    desc: 'Instant search by name, filter by category — results update without any page reload.',       color: 'bg-green-100 text-green-700' },
  { icon: <FileText size={18}/>, title: 'FR5: Document Details',   desc: 'Full document view with optional file or photo attachment stored securely in your browser.', color: 'bg-red-100 text-red-700' },
];

const FaqItem = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
        aria-expanded={open}
      >
        <span className="font-semibold text-gray-800 text-sm pr-4">{q}</span>
        {open ? <ChevronUp size={16} className="text-blue-600 flex-shrink-0"/> : <ChevronDown size={16} className="text-gray-400 flex-shrink-0"/>}
      </button>
      {open && (
        <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
          {a}
        </div>
      )}
    </div>
  );
};

const HelpPage = () => (
  <div className="page-container space-y-10">
    {/* Header */}
    <div className="text-center">
      <div className="flex justify-center mb-4">
        <DocAlertLogo size={56} showText={true} textSize="text-3xl"/>
      </div>
      <h1 className="section-title text-3xl mb-2">Help & About</h1>
      <p className="text-gray-500 max-w-xl mx-auto text-sm">
        DocAlert is a student-focused, browser-based document management and expiry reminder system. Free forever, no credit card needed.
      </p>
    </div>

    {/* 5 Core Features (SRS) */}
    <div className="card p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
        <HelpCircle size={20} className="text-blue-600"/> Core Features (SRS Requirements)
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map(({ icon, title, desc, color }) => (
          <div key={title} className={`rounded-xl p-4 border border-gray-100 bg-gray-50`}>
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${color}`}>{icon}</div>
            <h3 className="font-bold text-gray-800 text-sm mb-1">{title}</h3>
            <p className="text-gray-500 text-xs leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </div>

    {/* FAQ */}
    <div className="card p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-5">Frequently Asked Questions</h2>
      <div className="space-y-2">
        {FAQ.map((item, i) => <FaqItem key={i} {...item}/>)}
      </div>
    </div>


  </div>
);

export default HelpPage;
