import { useState } from 'react';
import { PageHeader } from '../../../components/layout/PageHeader.jsx';
import { useAuth } from '../../../app/providers/AuthProvider.jsx';
import { Avatar } from '../../../components/ui/Avatar.jsx';
import { Button } from '../../../components/ui/Button.jsx';
import { ROLES } from '../../../config/roles.js';

export function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const isAdmin = user?.role === ROLES.ADMIN;
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  function cancelEdit() {
    setFullName(user?.name || '');
    setEmail(user?.email || '');
    setPhone(user?.phone || '');
    setError('');
    setIsEditing(false);
  }

  async function saveProfile(event) {
    event.preventDefault();
    setError('');
    setNotice('');
    setIsSaving(true);
    try {
      await updateProfile({ fullName: fullName.trim(), email: email.trim(), phone: phone.trim() || null });
      setIsEditing(false);
      setNotice('Profile updated.');
    } catch (saveError) {
      setError(saveError.response?.data?.message || saveError.message || 'Unable to update your profile.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <PageHeader title="My profile" description="Your workspace identity and account information." />
      <section className="panel max-w-2xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar name={user?.name} size="lg" />
            <div><h2 className="font-bold">{user?.name}</h2><p className="text-sm text-slate-500">{user?.email}</p></div>
          </div>
          {isAdmin && !isEditing && <Button type="button" onClick={() => { setNotice(''); setIsEditing(true); }}>Edit profile</Button>}
        </div>

        {notice && <p role="status" className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{notice}</p>}
        {error && <p role="alert" className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}

        {isEditing ? (
          <form onSubmit={saveProfile} className="mt-6 space-y-4">
            <label className="block text-sm font-semibold text-slate-700">
              Full name
              <input className="form-input mt-2" value={fullName} onChange={(event) => setFullName(event.target.value)} maxLength={150} required />
            </label>
            <label className="block text-sm font-semibold text-slate-700">
              Email
              <input className="form-input mt-2" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} maxLength={180} required />
            </label>
            <label className="block text-sm font-semibold text-slate-700">
              Phone
              <input className="form-input mt-2" type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} maxLength={30} />
            </label>
            <p className="text-xs text-slate-500">Your email is also used to sign in.</p>
            <div className="flex gap-3">
              <Button type="submit" disabled={isSaving || !fullName.trim()}>{isSaving ? 'Saving…' : 'Save changes'}</Button>
              <Button type="button" variant="secondary" onClick={cancelEdit} disabled={isSaving}>Cancel</Button>
            </div>
          </form>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div><p className="text-xs text-slate-400">Role</p><p className="mt-1 font-semibold">{user?.role}</p></div>
            <div><p className="text-xs text-slate-400">Phone</p><p className="mt-1 font-semibold">{user?.phone || 'Not provided'}</p></div>
          </div>
        )}
      </section>
    </>
  );
}
