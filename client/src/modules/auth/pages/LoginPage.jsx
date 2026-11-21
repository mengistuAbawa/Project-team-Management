import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowRight, BriefcaseBusiness, Mail, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../../app/providers/AuthProvider.jsx';
import { Button } from '../../../components/ui/Button.jsx';
import { PasswordInput } from '../../../components/ui/PasswordInput.jsx';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to sign in with those credentials.');
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <section className="w-full max-w-110 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xl shadow-slate-900/5 sm:p-9">
      <div className="mb-8">
        <div className="mb-7 flex items-center gap-3 lg:hidden">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-blue-600/20">
            <BriefcaseBusiness size={19} />
          </span>
          <span className="text-base font-extrabold tracking-tight text-slate-900">PTMS</span>
        </div>
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700">
          <ShieldCheck size={14} />
          Your workspace awaits
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Welcome back</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">Sign in to pick up where your team left off.</p>
      </div>

      <form onSubmit={submit} className="space-y-5">
        <label className="block text-sm font-semibold text-slate-700">
          Email address
          <span className="relative mt-2 block">
            <Mail size={17} aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="form-input block h-11 pl-11 pr-4"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </span>
        </label>

        <label className="block text-sm font-semibold text-slate-700">
          Password
          <PasswordInput
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={8}
          />
        </label>

        {error && (
          <p role="alert" className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
            <AlertCircle size={17} className="mt-0.5 shrink-0" />
            {error}
          </p>
        )}

        <Button className="w-full justify-between px-5 py-3 shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5" type="submit" disabled={submitting}>
          Sign in
          <ArrowRight size={17} />
        </Button>
      </form>

      <p className="mt-7 text-center text-sm text-slate-500">
        Have an invitation? <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-700">Accept invitation</Link>
      </p>

      <div className="mt-6 flex gap-3 rounded-2xl border border-amber-200/70 bg-amber-50/80 p-4 text-xs leading-relaxed text-amber-900">
        <AlertCircle size={16} className="mt-0.5 shrink-0 text-amber-600" />
        <p><span className="font-bold">Secure access:</span> accounts are created by administrator invitation. Contact your system administrator if you need access.</p>
      </div>
    </section>
  );
}
