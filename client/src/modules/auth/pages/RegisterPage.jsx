import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button.jsx';
import { PasswordInput } from '../../../components/ui/PasswordInput.jsx';
import { useAuth } from '../../../app/providers/AuthProvider.jsx';

function readInvitationToken() {
  return new URLSearchParams(window.location.hash.slice(1)).get('token') || '';
}

export function RegisterPage() {
  const [token] = useState(readInvitationToken);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { acceptInvitation } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (token) window.history.replaceState(null, '', window.location.pathname);
  }, [token]);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setSubmitting(true);
    try {
      const result = await acceptInvitation({ token, password });
      if (result.authenticated) {
        navigate('/dashboard', { replace: true });
      } else {
        setNotice('Your account was created but is inactive. Contact a system administrator to activate it before signing in.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to accept this invitation.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
      <h2 className="text-2xl font-bold">Accept your invitation</h2>
      <p className="mb-6 mt-1 text-sm text-slate-500">
        Set a password to activate the account assigned to you by your administrator.
      </p>
      {!token ? (
        <p role="alert" className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
          This invitation link is missing its token. Ask your administrator for a fresh invitation.
        </p>
      ) : notice ? (
        <div role="status" className="space-y-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
          <p>{notice}</p>
          <Link className="font-semibold underline" to="/login">Go to sign in</Link>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <label className="block text-sm font-semibold">
            Password
            <PasswordInput className="mt-1.5" autoComplete="new-password"
              value={password} onChange={(event) => setPassword(event.target.value)}
              minLength={12} maxLength={128} required />
          </label>
          <label className="block text-sm font-semibold">
            Confirm password
            <PasswordInput className="mt-1.5" autoComplete="new-password"
              value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)}
              minLength={12} maxLength={128} required />
          </label>
          {error && <p role="alert" className="text-sm text-rose-600">{error}</p>}
          <Button className="w-full" type="submit" disabled={submitting}>Activate account</Button>
        </form>
      )}
      <p className="mt-5 text-center text-sm text-slate-500">
        Already registered? <Link className="font-semibold text-indigo-600" to="/login">Sign in</Link>
      </p>
    </div>
  );
}
