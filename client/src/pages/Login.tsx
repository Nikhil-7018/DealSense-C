import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getErrorMessage } from '@/api/client';
import { useAuth } from '@/context/AuthContext';

export function Login() {
  const { login, register, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) navigate('/', { replace: true });
  }, [user, navigate]);

  if (authLoading) {
    return <p className="text-slate-400">Loading…</p>;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(email, password, name);
      }
      navigate('/', { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md rounded-3xl border border-white/10 bg-slate-900/70 p-8 shadow-xl">
      <h1 className="font-display text-2xl font-semibold text-white">
        {mode === 'login' ? 'Welcome back' : 'Create account'}
      </h1>
      <p className="mt-2 text-sm text-slate-400">
        Demo: <code className="text-cyan-300">demo@dealsense.ai</code> /{' '}
        <code className="text-cyan-300">password123</code>
      </p>

      <div className="mt-6 flex gap-2 rounded-xl bg-ink-950/80 p-1">
        <button
          type="button"
          className={`flex-1 rounded-lg py-2 text-sm font-medium ${
            mode === 'login' ? 'bg-cyan-500 text-ink-950' : 'text-slate-400'
          }`}
          onClick={() => setMode('login')}
        >
          Sign in
        </button>
        <button
          type="button"
          className={`flex-1 rounded-lg py-2 text-sm font-medium ${
            mode === 'register' ? 'bg-cyan-500 text-ink-950' : 'text-slate-400'
          }`}
          onClick={() => setMode('register')}
        >
          Register
        </button>
      </div>

      <form onSubmit={(e) => void onSubmit(e)} className="mt-6 space-y-4">
        {mode === 'register' && (
          <div>
            <label className="text-xs text-slate-400" htmlFor="name">
              Name
            </label>
            <input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-ink-950 px-3 py-2 text-slate-100 outline-none focus:ring-2 focus:ring-cyan-500/50"
              required
            />
          </div>
        )}
        <div>
          <label className="text-xs text-slate-400" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/10 bg-ink-950 px-3 py-2 text-slate-100 outline-none focus:ring-2 focus:ring-cyan-500/50"
            required
          />
        </div>
        <div>
          <label className="text-xs text-slate-400" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/10 bg-ink-950 px-3 py-2 text-slate-100 outline-none focus:ring-2 focus:ring-cyan-500/50"
            required
            minLength={6}
          />
        </div>
        {error && (
          <p className="rounded-lg border border-red-500/30 bg-red-950/40 px-3 py-2 text-sm text-red-200">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-xl bg-cyan-500 py-2.5 font-semibold text-ink-950 hover:bg-cyan-400 disabled:opacity-60"
        >
          {busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-slate-500">
        <Link to="/" className="text-cyan-400 hover:underline">
          Back to search
        </Link>
      </p>
    </div>
  );
}
