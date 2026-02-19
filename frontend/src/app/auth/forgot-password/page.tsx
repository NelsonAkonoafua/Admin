'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { authAPI } from '@/lib/api';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await authAPI.forgotPassword(email);
      setSent(true);
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-20 bg-white">
      <div className="w-full max-w-md">
        <Link href="/auth/login" className="flex items-center gap-2 text-sm text-gray-400 hover:text-brand-charcoal transition-colors mb-10">
          <ArrowLeft size={16} />
          Back to login
        </Link>

        <div className="text-center mb-8">
          <Link href="/" className="logo-text text-3xl">forAbby</Link>
        </div>

        {sent ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-brand-beige rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl">✉️</span>
            </div>
            <h1 className="font-display text-3xl mb-3">Check your email</h1>
            <p className="text-gray-400 text-sm mb-6">
              If <strong>{email}</strong> is registered, you'll receive a password reset link shortly.
            </p>
            <Link href="/auth/login" className="btn-primary block">Return to Login</Link>
          </div>
        ) : (
          <>
            <h1 className="font-display text-3xl mb-2">Forgot Password</h1>
            <p className="text-gray-400 text-sm mb-8">
              Enter your email address and we'll send you a link to reset your password.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="label-field">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="input-field"
                  placeholder="your@email.com"
                  required
                />
              </div>
              <button type="submit" className="btn-primary w-full" disabled={isLoading}>
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
