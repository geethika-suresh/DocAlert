import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import DocAlertLogo from '../components/DocAlertLogo.jsx';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate     = useNavigate();

  const [form, setForm]         = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors]     = useState({});
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim())                            e.name     = 'Full name is required.';
    else if (form.name.trim().length < 2)             e.name     = 'Name must be at least 2 characters.';
    if (!form.email.trim())                           e.email    = 'Email is required.';
    else if (!/^\S+@\S+\.\S+$/.test(form.email))     e.email    = 'Enter a valid email.';
    if (!form.password)                               e.password = 'Password is required.';
    else if (form.password.length < 6)                e.password = 'Password must be at least 6 characters.';
    if (!form.confirm)                                e.confirm  = 'Please confirm your password.';
    else if (form.confirm !== form.password)          e.confirm  = 'Passwords do not match.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await register(form.name.trim(), form.email.trim(), form.password);
      toast.success(res.message || 'Account created! Welcome to DocAlert.');
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(msg);
      setErrors({ server: msg });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field) => (e) => {
    setForm((p) => ({ ...p, [field]: e.target.value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: '' }));
  };

  const strength = form.password.length >= 8 ? 'strong' : form.password.length >= 6 ? 'medium' : form.password.length > 0 ? 'weak' : '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-500 rounded-full opacity-10 blur-3xl"/>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-300 rounded-full opacity-10 blur-3xl"/>
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex justify-center">
            <DocAlertLogo size={64} showText={true} textSize="text-4xl" />
          </div>
          <p className="mt-3 text-blue-200 text-sm">Never miss a document renewal again</p>
        </div>

        <div className="bg-white rounded-3xl shadow-hero p-8 animate-fade-in">
          <div className="mb-7">
            <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
            <p className="text-gray-500 text-sm mt-1">Free forever — no credit card needed</p>
          </div>

          {errors.server && (
            <div className="mb-5 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              <AlertCircle size={16} className="mt-0.5 flex-shrink-0"/>
              {errors.server}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Name */}
            <div>
              <label htmlFor="name" className="form-label">Full name</label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
                <input
                  id="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange('name')}
                  placeholder="Your full name"
                  className={`form-input pl-10 ${errors.name ? 'border-red-400 focus:ring-red-400' : ''}`}
                  autoComplete="name"
                  autoFocus
                />
              </div>
              {errors.name && <p className="form-error"><AlertCircle size={12}/>{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="reg-email" className="form-label">Email address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
                <input
                  id="reg-email"
                  type="email"
                  value={form.email}
                  onChange={handleChange('email')}
                  placeholder="you@example.com"
                  className={`form-input pl-10 ${errors.email ? 'border-red-400 focus:ring-red-400' : ''}`}
                  autoComplete="email"
                />
              </div>
              {errors.email && <p className="form-error"><AlertCircle size={12}/>{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="reg-password" className="form-label">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
                <input
                  id="reg-password"
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange('password')}
                  placeholder="Min. 6 characters"
                  className={`form-input pl-10 pr-11 ${errors.password ? 'border-red-400 focus:ring-red-400' : ''}`}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
              {/* Password strength */}
              {strength && (
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="flex gap-1 flex-1">
                    {['weak', 'medium', 'strong'].map((level, i) => (
                      <div key={level} className={`h-1 flex-1 rounded-full transition-colors ${
                        strength === 'strong' ? 'bg-green-500' :
                        strength === 'medium' && i < 2 ? 'bg-amber-400' :
                        strength === 'weak' && i === 0 ? 'bg-red-400' : 'bg-gray-200'
                      }`}/>
                    ))}
                  </div>
                  <span className={`text-xs font-medium capitalize ${
                    strength === 'strong' ? 'text-green-600' :
                    strength === 'medium' ? 'text-amber-600' : 'text-red-500'
                  }`}>{strength}</span>
                </div>
              )}
              {errors.password && <p className="form-error"><AlertCircle size={12}/>{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirm" className="form-label">Confirm password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
                <input
                  id="confirm"
                  type={showPass ? 'text' : 'password'}
                  value={form.confirm}
                  onChange={handleChange('confirm')}
                  placeholder="Re-enter password"
                  className={`form-input pl-10 pr-10 ${errors.confirm ? 'border-red-400 focus:ring-red-400' : form.confirm && form.confirm === form.password ? 'border-green-400' : ''}`}
                  autoComplete="new-password"
                />
                {form.confirm && form.confirm === form.password && (
                  <CheckCircle size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-green-500 pointer-events-none"/>
                )}
              </div>
              {errors.confirm && <p className="form-error"><AlertCircle size={12}/>{errors.confirm}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-base mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2 justify-center">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                  Creating account...
                </span>
              ) : 'Create free account'}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 font-semibold hover:text-blue-800 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
