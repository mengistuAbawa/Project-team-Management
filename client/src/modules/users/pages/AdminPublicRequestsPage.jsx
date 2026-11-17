import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ClipboardCopy, Inbox, Mail, Search } from 'lucide-react';
import { PageHeader } from '../../../components/layout/PageHeader.jsx';
import { Button } from '../../../components/ui/Button.jsx';
import { Modal } from '../../../components/ui/Modal.jsx';
import { SectionCard } from '../../../components/ui/SectionCard.jsx';
import { ROLE_LABELS, ROLES } from '../../../config/roles.js';
import { publicService, getRequestErrorMessage } from '../../../services/publicService.js';

const accessRoles = Object.entries(ROLE_LABELS).filter(([role]) => role !== ROLES.ADMIN);

function formatDate(value) {
  return new Date(value).toLocaleString();
}

function statusStyle(status) {
  if (status === 'approved' || status === 'closed') return 'bg-emerald-50 text-emerald-700';
  if (status === 'rejected') return 'bg-rose-50 text-rose-700';
  if (status === 'pending' || status === 'new') return 'bg-amber-50 text-amber-800';
  return 'bg-slate-100 text-slate-600';
}

export function AdminPublicRequestsPage() {
  const [type, setType] = useState('access');
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [reloadCount, setReloadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [record, setRecord] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionError, setActionError] = useState('');
  const [notice, setNotice] = useState('');
  const [role, setRole] = useState('');
  const [reviewNote, setReviewNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [invitationUrl, setInvitationUrl] = useState('');
  const detailRequestId = useRef(0);

  useEffect(() => {
    let active = true;
    const listRequests = type === 'access'
      ? publicService.listAccessRequests
      : publicService.listContactMessages;
    const params = {
      page,
      limit: 20,
      ...(status ? { status } : {}),
      ...(appliedSearch ? { search: appliedSearch } : {}),
    };
    listRequests(params)
      .then((response) => {
        if (!active) return;
        setItems(response.data.data);
        setPagination(response.data.pagination);
        setError('');
      })
      .catch((requestError) => {
        if (!active) return;
        setItems([]);
        setError(getRequestErrorMessage(requestError));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [type, status, appliedSearch, page, reloadCount]);

  function changeType(nextType) {
    if (nextType === type) return;
    setType(nextType);
    setStatus('');
    setPage(1);
    setSearch('');
    setAppliedSearch('');
    setRecord(null);
    setError('');
    setNotice('');
    setLoading(true);
  }

  function applySearch(event) {
    event.preventDefault();
    setAppliedSearch(search.trim());
    setPage(1);
    setLoading(true);
    setReloadCount((value) => value + 1);
  }

  function changeStatus(event) {
    setStatus(event.target.value);
    setPage(1);
    setLoading(true);
  }

  async function openRecord(item) {
    const requestId = detailRequestId.current + 1;
    detailRequestId.current = requestId;
    setRecord(item);
    setDetailLoading(true);
    setActionError('');
    setNotice('');
    setInvitationUrl('');
    setRole('');
    setReviewNote('');
    try {
      const response = type === 'access'
        ? await publicService.getAccessRequest(item.id)
        : await publicService.getContactMessage(item.id);
      if (requestId === detailRequestId.current) setRecord(response.data.data);
    } catch (requestError) {
      if (requestId === detailRequestId.current) setActionError(getRequestErrorMessage(requestError));
    } finally {
      if (requestId === detailRequestId.current) setDetailLoading(false);
    }
  }

  async function updateContactStatus(nextStatus) {
    if (!record) return;
    setSubmitting(true);
    setActionError('');
    setNotice('');
    try {
      const response = await publicService.updateContactStatus(record.id, nextStatus);
      setRecord({ ...record, ...response.data.data });
      setNotice('Contact message status updated.');
      setLoading(true);
      setReloadCount((value) => value + 1);
    } catch (requestError) {
      setActionError(getRequestErrorMessage(requestError));
    } finally {
      setSubmitting(false);
    }
  }

  async function decideAccessRequest(decision) {
    if (!record) return;
    if (decision === 'approved' && !role) {
      setActionError('Choose the approved role before approving this request.');
      return;
    }
    setSubmitting(true);
    setActionError('');
    setNotice('');
    setInvitationUrl('');
    try {
      const response = await publicService.reviewAccessRequest(record.id, {
        decision,
        ...(decision === 'approved' ? { role } : {}),
        ...(reviewNote.trim() ? { reviewNote: reviewNote.trim() } : {}),
      });
      setRecord({ ...record, ...response.data.data.request });
      setInvitationUrl(response.data.data.invitation?.invitationUrl || '');
      setNotice(response.data.message);
      setLoading(true);
      setReloadCount((value) => value + 1);
    } catch (requestError) {
      setActionError(getRequestErrorMessage(requestError));
    } finally {
      setSubmitting(false);
    }
  }

  async function copyInvitation() {
    try {
      await navigator.clipboard.writeText(invitationUrl);
      setNotice('Invitation link copied. Deliver it directly and securely to the requester.');
    } catch {
      setActionError('Clipboard access is unavailable. Select and copy the invitation link manually.');
    }
  }

  const statusOptions = type === 'access'
    ? [['', 'All access requests'], ['pending', 'Pending'], ['approved', 'Approved'], ['rejected', 'Rejected']]
    : [['', 'All contact messages'], ['new', 'New'], ['read', 'Read'], ['closed', 'Closed']];

  return (
    <>
      <PageHeader title="Public requests" description="Review contact messages and access requests submitted through the public website." />
      {error && <p role="alert" className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
      {notice && !record && <p role="status" className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{notice}</p>}

      <div className="mb-4 flex flex-wrap gap-2" role="tablist" aria-label="Public request type">
        <button type="button" role="tab" aria-selected={type === 'access'} onClick={() => changeType('access')}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold ${type === 'access' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'}`}>
          <Inbox size={16} /> Access requests
        </button>
        <button type="button" role="tab" aria-selected={type === 'contact'} onClick={() => changeType('contact')}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold ${type === 'contact' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'}`}>
          <Mail size={16} /> Contact messages
        </button>
      </div>

      <SectionCard
        title={`${type === 'access' ? 'Access requests' : 'Contact messages'} (${pagination.total})`}
        description="Search and filter requests, then open a record to review it."
        actions={
          <div className="flex flex-col gap-2 sm:flex-row">
            <form className="flex gap-2" onSubmit={applySearch}>
              <label className="sr-only" htmlFor="request-search">Search requests</label>
              <input id="request-search" className="form-input min-w-0 sm:w-56" value={search} maxLength={180} onChange={(event) => setSearch(event.target.value)} placeholder="Search name or email" />
              <Button type="submit" aria-label="Search"><Search size={16} /></Button>
            </form>
            <label>
              <span className="sr-only">Filter by status</span>
              <select className="form-input sm:w-44" value={status} onChange={changeStatus}>
                {statusOptions.map(([value, label]) => <option value={value} key={value}>{label}</option>)}
              </select>
            </label>
          </div>
        }
      >
        {loading ? <p className="py-8 text-center text-sm text-slate-500">Loading requests…</p> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[690px] text-left text-sm">
              <thead><tr className="border-b border-slate-100 text-xs uppercase text-slate-500">
                <th className="px-4 py-3">Requester</th>
                <th className="px-4 py-3">{type === 'access' ? 'Organization / job title' : 'Subject / organization'}</th>
                <th className="px-4 py-3">Submitted</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"><span className="sr-only">Action</span></th>
              </tr></thead>
              <tbody>
                {items.map((item) => (
                  <tr className="border-b border-slate-50" key={item.id}>
                    <td className="px-4 py-3"><span className="block font-semibold text-slate-800">{item.full_name}</span><span className="text-xs text-slate-500">{item.email}</span></td>
                    <td className="px-4 py-3 text-slate-600">{item.organization}<span className="block text-xs text-slate-400">{type === 'access' ? item.job_title : item.subject}</span></td>
                    <td className="px-4 py-3 text-xs text-slate-500">{formatDate(item.created_at)}</td>
                    <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyle(item.status)}`}>{item.status}</span></td>
                    <td className="px-4 py-3"><Button variant="secondary" onClick={() => openRecord(item)}>Review</Button></td>
                  </tr>
                ))}
                {!items.length && <tr><td colSpan="5" className="px-4 py-10 text-center text-sm text-slate-500">No matching requests.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
        <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
          <span className="text-xs text-slate-500">Page {pagination.page || page} of {Math.max(pagination.totalPages || 1, 1)}</span>
          <div className="flex gap-2">
            <Button variant="secondary" disabled={page <= 1 || loading} onClick={() => { setPage((value) => value - 1); setLoading(true); }}><ArrowLeft size={15} /> Previous</Button>
            <Button variant="secondary" disabled={page >= (pagination.totalPages || 1) || loading} onClick={() => { setPage((value) => value + 1); setLoading(true); }}>Next <ArrowRight size={15} /></Button>
          </div>
        </div>
      </SectionCard>

      <Modal open={Boolean(record)} title={type === 'access' ? 'Review access request' : 'Review contact message'} onClose={() => { detailRequestId.current += 1; setRecord(null); }}>
        {record && (
          <div className="max-h-[75vh] space-y-4 overflow-y-auto">
            {detailLoading ? <p className="py-8 text-center text-sm text-slate-500">Loading request details…</p> : (
              <>
                <dl className="grid gap-3 rounded-xl bg-slate-50 p-4 text-sm sm:grid-cols-2">
                  <div><dt className="text-xs text-slate-500">Name</dt><dd className="mt-1 font-semibold">{record.full_name}</dd></div>
                  <div><dt className="text-xs text-slate-500">Email</dt><dd className="mt-1 break-all font-semibold">{record.email}</dd></div>
                  <div><dt className="text-xs text-slate-500">Organization</dt><dd className="mt-1 font-semibold">{record.organization}</dd></div>
                  {type === 'access' && <div><dt className="text-xs text-slate-500">Job title</dt><dd className="mt-1 font-semibold">{record.job_title}</dd></div>}
                  {type === 'access' && record.phone && <div><dt className="text-xs text-slate-500">Phone</dt><dd className="mt-1 font-semibold">{record.phone}</dd></div>}
                  {type === 'contact' && <div><dt className="text-xs text-slate-500">Subject</dt><dd className="mt-1 font-semibold">{record.subject}</dd></div>}
                  <div><dt className="text-xs text-slate-500">Submitted</dt><dd className="mt-1 font-semibold">{formatDate(record.created_at)}</dd></div>
                  <div><dt className="text-xs text-slate-500">Status</dt><dd className="mt-1 font-semibold capitalize">{record.status}</dd></div>
                  {record.reviewed_by_name && <div><dt className="text-xs text-slate-500">Reviewed by</dt><dd className="mt-1 font-semibold">{record.reviewed_by_name}</dd></div>}
                  {record.approved_role && <div><dt className="text-xs text-slate-500">Approved role</dt><dd className="mt-1 font-semibold">{ROLE_LABELS[record.approved_role] || record.approved_role}</dd></div>}
                  {record.review_note && <div className="sm:col-span-2"><dt className="text-xs text-slate-500">Review note</dt><dd className="mt-1 whitespace-pre-wrap">{record.review_note}</dd></div>}
                </dl>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">{type === 'access' ? 'Reason for access' : 'Message'}</h3>
                  <p className="mt-2 whitespace-pre-wrap break-words rounded-xl border border-slate-200 p-4 text-sm leading-6 text-slate-700">{type === 'access' ? record.reason : record.message}</p>
                </div>
                {actionError && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{actionError}</p>}
                {notice && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{notice}</p>}
                {invitationUrl && <div className="space-y-2 rounded-xl border border-amber-200 bg-amber-50 p-3">
                  <p className="text-xs font-semibold text-amber-900">Invitation link — shown once. Deliver it directly and securely to the requester.</p>
                  <div className="flex gap-2"><input className="form-input min-w-0 flex-1" aria-label="Invitation link" readOnly value={invitationUrl} onFocus={(event) => event.target.select()} /><Button onClick={copyInvitation}><ClipboardCopy size={15} /> Copy</Button></div>
                </div>}
                {type === 'access' && record.status === 'pending' ? (
                  <div className="space-y-3 border-t border-slate-100 pt-4">
                    <label className="block text-sm font-semibold text-slate-700">Approved role
                      <select className="form-input mt-1" value={role} onChange={(event) => setRole(event.target.value)} required>
                        <option value="" disabled>Select a role</option>
                        {accessRoles.map(([value, label]) => <option value={value} key={value}>{label}</option>)}
                      </select>
                    </label>
                    <label className="block text-sm font-semibold text-slate-700">Review note (optional)
                      <textarea className="form-input mt-1" rows="3" maxLength={1000} value={reviewNote} onChange={(event) => setReviewNote(event.target.value)} />
                    </label>
                    <div className="flex flex-wrap justify-end gap-2">
                      <Button variant="danger" disabled={submitting} onClick={() => decideAccessRequest('rejected')}>{submitting ? 'Saving…' : 'Reject request'}</Button>
                      <Button disabled={submitting || !role} onClick={() => decideAccessRequest('approved')}>{submitting ? 'Saving…' : 'Approve & create invitation'}</Button>
                    </div>
                  </div>
                ) : type === 'contact' ? (
                  <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4">
                    <Button variant="secondary" disabled={submitting || record.status === 'new'} onClick={() => updateContactStatus('new')}>Mark new</Button>
                    <Button variant="secondary" disabled={submitting || record.status === 'read'} onClick={() => updateContactStatus('read')}>Mark read</Button>
                    <Button disabled={submitting || record.status === 'closed'} onClick={() => updateContactStatus('closed')}>Close message</Button>
                  </div>
                ) : null}
              </>
            )}
          </div>
        )}
      </Modal>
    </>
  );
}
