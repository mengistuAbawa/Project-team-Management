import { useCallback, useEffect, useMemo, useState } from 'react';
import { Copy, Eye, Pencil, RefreshCw, UserPlus, UsersRound } from 'lucide-react';
import { useAuth } from '../../../app/providers/AuthProvider.jsx';
import { PageHeader } from '../../../components/layout/PageHeader.jsx';
import { Avatar } from '../../../components/ui/Avatar.jsx';
import { Button } from '../../../components/ui/Button.jsx';
import { SectionCard } from '../../../components/ui/SectionCard.jsx';
import { Modal } from '../../../components/ui/Modal.jsx';
import { SearchField } from '../../../components/ui/SearchField.jsx';
import { ROLE_LABELS } from '../../../config/roles.js';
import { userService } from '../services/userService.js';
import { UserForm } from '../components/UserForm.jsx';
import { projectService } from '../../projects/services/projectService.js';
import { teamService } from '../../teams/services/teamService.js';

const roleOptions = Object.keys(ROLE_LABELS);

function messageFrom(error) {
  const validationErrors = error.response?.data?.errors;
  if (Array.isArray(validationErrors) && validationErrors.length) {
    return validationErrors.map(({ field, message }) => `${field}: ${message}`).join(' ');
  }
  return error.response?.data?.message || 'The request could not be completed.';
}

function accountStatus(user) {
  return user.account_status || (user.is_active ? 'active' : 'inactive');
}

function selectedValues(event) {
  return Array.from(event.target.selectedOptions, (option) => option.value);
}

export function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [invitations, setInvitations] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [filterDepartments, setFilterDepartments] = useState([]);
  const [formDepartments, setFormDepartments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [teams, setTeams] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [filters, setFilters] = useState({ role: '', organizationId: '', departmentId: '', status: '' });
  const [searchText, setSearchText] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [overviewLoading, setOverviewLoading] = useState(true);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [optionsError, setOptionsError] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [invitation, setInvitation] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formProjectIds, setFormProjectIds] = useState([]);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [editError, setEditError] = useState('');
  const [editSaving, setEditSaving] = useState(false);
  const [assignmentOpen, setAssignmentOpen] = useState(false);
  const [assignmentUser, setAssignmentUser] = useState(null);
  const [assignmentDetails, setAssignmentDetails] = useState({ projects: [], teams: [] });
  const [assignmentProjectIds, setAssignmentProjectIds] = useState([]);
  const [assignmentTeamIds, setAssignmentTeamIds] = useState([]);
  const [assignmentError, setAssignmentError] = useState('');
  const [assignmentSaving, setAssignmentSaving] = useState(false);
  const [assignmentLoading, setAssignmentLoading] = useState(false);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await userService.list({
        search,
        role: filters.role,
        organizationId: filters.organizationId,
        departmentId: filters.departmentId,
        status: filters.status,
        page,
        limit: 10,
      });
      setUsers(response.data.data);
      setPagination(response.data.pagination);
      setError('');
    } catch (requestError) {
      setError(messageFrom(requestError));
    } finally {
      setLoading(false);
    }
  }, [filters, page, search]);

  const loadOverview = useCallback(async () => {
    setOverviewLoading(true);
    try {
      const response = await userService.stats();
      setStats(response.data.data);
    } catch (requestError) {
      setError(messageFrom(requestError));
    }
    try {
      const response = await userService.invitations();
      setInvitations(response.data.data);
    } catch (requestError) {
      setError(messageFrom(requestError));
    } finally {
      setOverviewLoading(false);
    }
  }, []);

  const loadOrganizations = useCallback(async () => {
    try {
      const response = await userService.organizations();
      setOrganizations(response.data.data);
      setOptionsError('');
    } catch (requestError) {
      setOptionsError(`Organizations could not be loaded: ${messageFrom(requestError)}`);
    }
  }, []);

  const loadProjects = useCallback(async () => {
    setLoadingProjects(true);
    try {
      const response = await projectService.list({ limit: 100 });
      setProjects(response.data.data);
      setOptionsError('');
    } catch (requestError) {
      setOptionsError(`Projects could not be loaded: ${messageFrom(requestError)}`);
    } finally {
      setLoadingProjects(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchText.trim());
      setPage(1);
    }, 250);
    return () => window.clearTimeout(timer);
  }, [searchText]);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => { if (active) loadUsers(); });
    return () => { active = false; };
  }, [loadUsers]);
  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) {
        loadOverview();
        loadOrganizations();
      }
    });
    return () => { active = false; };
  }, [loadOverview, loadOrganizations]);

  useEffect(() => {
    let active = true;
    userService.departments(filters.organizationId || undefined)
      .then((response) => { if (active) setFilterDepartments(response.data.data); })
      .catch((requestError) => { if (active) setError(messageFrom(requestError)); });
    return () => { active = false; };
  }, [filters.organizationId]);

  const loadFormDepartments = useCallback(async (organizationId) => {
    try {
      const response = await userService.departments(organizationId || undefined);
      setFormDepartments(response.data.data);
      setOptionsError('');
    } catch (requestError) {
      setOptionsError(`Departments could not be loaded: ${messageFrom(requestError)}`);
    }
  }, []);

  useEffect(() => {
    if (!createOpen && !assignmentOpen) return undefined;
    const selectedProjectIds = createOpen ? formProjectIds : assignmentProjectIds;
    let active = true;
    if (!selectedProjectIds.length) {
      Promise.resolve().then(() => {
        if (active) {
          setTeams([]);
          setLoadingTeams(false);
        }
      });
      return () => { active = false; };
    }
    Promise.resolve()
      .then(() => {
        if (!active) return [];
        setLoadingTeams(true);
        return Promise.all(selectedProjectIds.map((projectId) =>
          teamService.listForProject(projectId, { limit: 100 })
            .then((response) => response.data.data)));
      })
      .then((results) => {
        if (active) setTeams(results.flat());
      })
      .catch((requestError) => {
        if (active) setOptionsError(`Teams could not be loaded: ${messageFrom(requestError)}`);
      })
      .finally(() => { if (active) setLoadingTeams(false); });
    return () => { active = false; };
  }, [assignmentOpen, assignmentProjectIds, createOpen, formProjectIds]);

  const handleFormProjectIds = useCallback((projectIds) => {
    setFormProjectIds((current) =>
      current.length === projectIds.length && current.every((id, index) => id === projectIds[index])
        ? current : projectIds);
  }, []);

  const openCreate = () => {
    setError('');
    setNotice('');
    setInvitation(null);
    setFormProjectIds([]);
    setCreateOpen(true);
    loadProjects();
    loadFormDepartments('');
  };

  const closeCreate = () => {
    setCreateOpen(false);
    setFormProjectIds([]);
    setTeams([]);
  };

  const refresh = async () => {
    await Promise.all([loadUsers(), loadOverview()]);
  };

  const createInvitation = async (payload) => {
    setSubmitting(true);
    setError('');
    setNotice('');
    try {
      const response = await userService.invite(payload);
      setInvitation(response.data.data);
      setNotice('Invitation link created. It is shown only once; copy and deliver it securely.');
      closeCreate();
      await refresh();
    } catch (requestError) {
      setError(messageFrom(requestError));
    } finally {
      setSubmitting(false);
    }
  };

  const copyInvitation = async () => {
    if (!invitation?.invitationUrl) return;
    try {
      await navigator.clipboard.writeText(invitation.invitationUrl);
      setNotice('Invitation link copied. Deliver it directly to the invited person.');
    } catch {
      setNotice('Clipboard access is unavailable. Select and copy the invitation link manually.');
    }
  };

  const resendInvitation = async (target) => {
    setError('');
    setNotice('');
    try {
      const response = await userService.resendInvitation(target.id);
      setInvitation(response.data.data);
      setNotice('A replacement invitation link was created. The previous link is now invalid.');
      await loadOverview();
    } catch (requestError) {
      setError(messageFrom(requestError));
    }
  };

  const changeRole = async (target, role) => {
    if (role === target.role) return;
    const confirmSystemAdmin = role === 'system_admin' &&
      window.confirm(`Grant global System Administrator access to ${target.full_name}?`);
    if (role === 'system_admin' && !confirmSystemAdmin) return;
    setError('');
    try {
      await userService.assignRole(target.id, role, confirmSystemAdmin);
      await refresh();
    } catch (requestError) {
      setError(messageFrom(requestError));
    }
  };

  const changeStatus = async (target, status) => {
    if (status === accountStatus(target)) return;
    if (target.id === currentUser?.id && status !== 'active') return;
    if (status !== 'active' &&
        !window.confirm(`${status === 'suspended' ? 'Suspend' : 'Deactivate'} ${target.full_name}?`)) return;
    setError('');
    try {
      if (status === 'active') await userService.activate(target.id);
      else if (status === 'suspended') await userService.suspend(target.id);
      else await userService.deactivate(target.id);
      await refresh();
    } catch (requestError) {
      setError(messageFrom(requestError));
    }
  };

  const openUserDetails = async (target, startEditing = false) => {
    setEditError('');
    setError('');
    try {
      const response = await userService.get(target.id);
      const details = response.data.data;
      setSelectedUser(details);
      setEditMode(startEditing);
      setEditForm({
        fullName: details.full_name,
        email: details.email,
        phone: details.phone || '',
        avatarUrl: details.avatar_url || '',
        organizationId: details.organization_id || '',
        departmentId: details.department_id || '',
        jobTitle: details.job_title || '',
        employeeCode: details.employee_code || '',
        roleAttributes: details.role_attributes || {},
      });
      setDetailOpen(true);
      await loadFormDepartments(details.organization_id || '');
    } catch (requestError) {
      setError(messageFrom(requestError));
    }
  };

  const saveUser = async (event) => {
    event.preventDefault();
    setEditSaving(true);
    setEditError('');
    try {
      await userService.update(selectedUser.id, {
        fullName: editForm.fullName.trim(),
        email: editForm.email.trim(),
        phone: editForm.phone.trim() || null,
        avatarUrl: editForm.avatarUrl.trim() || null,
        organizationId: editForm.organizationId || null,
        departmentId: editForm.departmentId || null,
        jobTitle: editForm.jobTitle.trim() || null,
        employeeCode: editForm.employeeCode.trim() || null,
        roleAttributes: editForm.roleAttributes,
      });
      const response = await userService.get(selectedUser.id);
      setSelectedUser(response.data.data);
      setEditMode(false);
      await refresh();
    } catch (requestError) {
      setEditError(messageFrom(requestError));
    } finally {
      setEditSaving(false);
    }
  };

  const openAssignments = async (target) => {
    setAssignmentOpen(true);
    setAssignmentUser(target);
    setAssignmentError('');
    setAssignmentLoading(true);
    setAssignmentProjectIds([]);
    setAssignmentTeamIds([]);
    loadProjects();
    try {
      const [userResponse, assignmentsResponse] = await Promise.all([
        userService.get(target.id),
        userService.assignments(target.id),
      ]);
      setAssignmentUser(userResponse.data.data);
      setAssignmentDetails(assignmentsResponse.data.data);
    } catch (requestError) {
      setAssignmentError(messageFrom(requestError));
    } finally {
      setAssignmentLoading(false);
    }
  };

  const saveAssignments = async () => {
    setAssignmentSaving(true);
    setAssignmentError('');
    try {
      if (assignmentProjectIds.length) {
        await userService.assignProjects(assignmentUser.id, assignmentProjectIds);
      }
      if (assignmentTeamIds.length) {
        await userService.assignTeams(assignmentUser.id, assignmentTeamIds);
      }
      const response = await userService.assignments(assignmentUser.id);
      setAssignmentDetails(response.data.data);
      setAssignmentProjectIds([]);
      setAssignmentTeamIds([]);
      await refresh();
    } catch (requestError) {
      setAssignmentError(messageFrom(requestError));
    } finally {
      setAssignmentSaving(false);
    }
  };

  const updateFilter = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value, ...(key === 'organizationId' ? { departmentId: '' } : {}) }));
    setPage(1);
  };

  const roleCounts = useMemo(() => stats?.byRole || [], [stats]);
  const assignmentProjects = projects.filter((project) =>
    !assignmentUser?.organization_id || project.organization_id === assignmentUser.organization_id);
  const selectedTeamOptions = teams.filter((team) => assignmentProjectIds.includes(team.project_id));

  return (
    <>
      <PageHeader title="User management"
        description="Create invited accounts, manage roles, and control organization and project access."
        actions={<Button onClick={openCreate}><UserPlus size={16} /> Create new user</Button>} />

      {error && <p role="alert" className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
      {notice && <p role="status" className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{notice}</p>}

      {invitation && (
        <SectionCard title="One-time invitation link"
          description={`For ${invitation.email}; expires ${new Date(invitation.expires_at).toLocaleString()}.`}>
          <div className="flex flex-col gap-3 p-5 sm:flex-row">
            <input className="form-input min-w-0 flex-1" aria-label="Invitation link" readOnly
              value={invitation.invitationUrl}
              onFocus={(event) => event.target.select()} />
            <Button onClick={copyInvitation}><Copy size={16} /> Copy link</Button>
          </div>
          <p className="px-5 pb-5 text-xs text-amber-700">
            This link is a temporary credential. Share it directly with the invitee and never post it publicly.
          </p>
        </SectionCard>
      )}

      <section className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ['Total users', stats?.total],
          ['Active', stats?.active],
          ['Inactive', stats?.inactive],
          ['Pending invitations', stats?.pendingInvitations],
        ].map(([label, value]) => (
          <article key={label} className="panel flex items-center justify-between p-5">
            <div><p className="text-sm text-slate-500">{label}</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{overviewLoading ? '—' : value ?? 0}</p>
            </div>
            <UsersRound className="text-indigo-500" size={22} />
          </article>
        ))}
      </section>

      <div className="mb-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <SectionCard title="Users by role" description="Role totals across active and inactive accounts.">
          <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3">
            {roleCounts.map((item) => (
              <div key={item.role} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                <span className="text-sm text-slate-600">{ROLE_LABELS[item.role] || item.role}</span>
                <span className="font-bold text-slate-900">{item.count}</span>
              </div>
            ))}
            {!roleCounts.length && !overviewLoading && <p className="text-sm text-slate-500">No accounts yet.</p>}
          </div>
        </SectionCard>
        <SectionCard title="Recently created accounts">
          <div className="divide-y divide-slate-100">
            {(stats?.recentUsers || []).map((recent) => (
              <div key={recent.id} className="flex items-center gap-3 px-5 py-3">
                <Avatar name={recent.full_name} image={recent.avatar_url} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-800">{recent.full_name}</p>
                  <p className="truncate text-xs text-slate-500">{recent.email}</p>
                </div>
                <span className="text-xs text-slate-500">{ROLE_LABELS[recent.role]}</span>
              </div>
            ))}
            {!stats?.recentUsers?.length && !overviewLoading &&
              <p className="p-5 text-sm text-slate-500">No accounts yet.</p>}
          </div>
        </SectionCard>
      </div>

      <SectionCard title={`Users (${pagination.total})`}
        description="Role and account changes are enforced by the server."
        actions={
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
            <SearchField value={searchText} onChange={setSearchText} placeholder="Search users" />
            <select className="form-input" aria-label="Filter by role" value={filters.role}
              onChange={(event) => updateFilter('role', event.target.value)}>
              <option value="">All roles</option>
              {roleOptions.map((role) => <option key={role} value={role}>{ROLE_LABELS[role]}</option>)}
            </select>
            <select className="form-input" aria-label="Filter by organization" value={filters.organizationId}
              onChange={(event) => updateFilter('organizationId', event.target.value)}>
              <option value="">All organizations</option>
              {organizations.map((organization) =>
                <option key={organization.id} value={organization.id}>{organization.name}</option>)}
            </select>
            <select className="form-input" aria-label="Filter by department" value={filters.departmentId}
              onChange={(event) => updateFilter('departmentId', event.target.value)}>
              <option value="">All departments</option>
              {filterDepartments.map((department) =>
                <option key={department.id} value={department.id}>{department.name}</option>)}
            </select>
            <select className="form-input" aria-label="Filter by account status" value={filters.status}
              onChange={(event) => updateFilter('status', event.target.value)}>
              <option value="">All statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        }>
        {loading ? <p className="py-8 text-center text-sm text-slate-500">Loading users…</p> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1120px] text-left text-sm">
              <thead><tr className="border-b border-slate-100 text-xs uppercase text-slate-500">
                <th className="px-3 py-3">User</th><th className="px-3 py-3">Phone</th>
                <th className="px-3 py-3">Role</th><th className="px-3 py-3">Organization / department</th>
                <th className="px-3 py-3">Status</th><th className="px-3 py-3">Registered</th>
                <th className="px-3 py-3">Actions</th>
              </tr></thead>
              <tbody>
                {users.map((target) => (
                  <tr className="border-b border-slate-50 align-top" key={target.id}>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={target.full_name} image={target.avatar_url} size="sm" />
                        <div><p className="font-semibold text-slate-800">{target.full_name}</p>
                          <p className="text-xs text-slate-500">{target.email}</p></div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-slate-600">{target.phone || '—'}</td>
                    <td className="px-3 py-3">
                      <select className="form-input max-w-52" aria-label={`Role for ${target.email}`}
                        value={target.role} onChange={(event) => changeRole(target, event.target.value)}>
                        {roleOptions.map((role) => <option key={role} value={role}>{ROLE_LABELS[role]}</option>)}
                      </select>
                    </td>
                    <td className="px-3 py-3 text-slate-600">
                      {target.organization_name || '—'}<br />
                      <span className="text-xs text-slate-400">{target.department_name || 'No department'}</span>
                    </td>
                    <td className="px-3 py-3">
                      <select className="form-input max-w-36" aria-label={`Status for ${target.email}`}
                        value={accountStatus(target)} disabled={target.id === currentUser?.id}
                        onChange={(event) => changeStatus(target, event.target.value)}>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="suspended">Suspended</option>
                      </select>
                    </td>
                    <td className="px-3 py-3 text-slate-600">{new Date(target.created_at).toLocaleDateString()}</td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button type="button" className="inline-flex items-center gap-1 font-semibold text-indigo-700 hover:text-indigo-900"
                          onClick={() => openUserDetails(target)}><Eye size={14} /> View</button>
                        <button type="button" className="inline-flex items-center gap-1 font-semibold text-indigo-700 hover:text-indigo-900"
                          onClick={() => openUserDetails(target, true)}><Pencil size={14} /> Edit</button>
                        <button type="button" className="font-semibold text-indigo-700 hover:text-indigo-900"
                          onClick={() => openAssignments(target)}>Assignments</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!users.length && <tr><td colSpan="7" className="px-3 py-8 text-center text-slate-500">No users found.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
        <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-sm">
          <span className="text-slate-500">Page {pagination.page} of {Math.max(1, pagination.totalPages)}</span>
          <div className="flex gap-2">
            <Button variant="secondary" disabled={page <= 1 || loading} onClick={() => setPage((value) => value - 1)}>Previous</Button>
            <Button variant="secondary" disabled={page >= pagination.totalPages || loading}
              onClick={() => setPage((value) => value + 1)}>Next</Button>
          </div>
        </div>
      </SectionCard>

      <SectionCard title={`Pending invitations (${invitations.length})`}
        description="Tokens are never listed or persisted in plaintext. Resending revokes the previous link.">
        {invitations.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead><tr className="border-b border-slate-100 text-xs uppercase text-slate-500">
                <th className="px-4 py-3">Invitee</th><th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Assignments</th><th className="px-4 py-3">Expires</th>
                <th className="px-4 py-3">Action</th>
              </tr></thead>
              <tbody>{invitations.map((pending) => (
                <tr key={pending.id} className="border-b border-slate-50">
                  <td className="px-4 py-3"><p className="font-semibold">{pending.full_name}</p><p className="text-xs text-slate-500">{pending.email}</p></td>
                  <td className="px-4 py-3">{ROLE_LABELS[pending.role]}</td>
                  <td className="px-4 py-3 text-slate-600">{pending.project_count} projects · {pending.team_count} teams</td>
                  <td className="px-4 py-3">{new Date(pending.expires_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <button className="inline-flex items-center gap-1 font-semibold text-indigo-700"
                      onClick={() => resendInvitation(pending)}><RefreshCw size={14} /> Resend link</button>
                  </td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        ) : <p className="p-5 text-sm text-slate-500">No pending invitations.</p>}
      </SectionCard>

      <Modal open={createOpen} title="Create user account" onClose={closeCreate} size="max-w-3xl">
        <UserForm
          organizations={organizations}
          departments={formDepartments}
          projects={projects}
          teams={teams}
          loadingProjects={loadingProjects}
          loadingTeams={loadingTeams}
          optionsError={optionsError}
          onOrganizationChange={loadFormDepartments}
          onProjectIdsChange={handleFormProjectIds}
          onSubmit={createInvitation}
          submitting={submitting}
          error={error}
          onCancel={closeCreate}
        />
      </Modal>

      <Modal open={detailOpen} title={editMode ? 'Edit user profile' : 'User profile'}
        onClose={() => { setDetailOpen(false); setEditMode(false); }} size="max-w-3xl">
        {selectedUser && (editMode ? (
          <form onSubmit={saveUser} className="space-y-4">
            {editError && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{editError}</p>}
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium">Full name
                <input className="form-input mt-1.5" required maxLength={150} value={editForm.fullName}
                  onChange={(event) => setEditForm({ ...editForm, fullName: event.target.value })} />
              </label>
              <label className="block text-sm font-medium">Email
                <input className="form-input mt-1.5" type="email" required maxLength={180} value={editForm.email}
                  onChange={(event) => setEditForm({ ...editForm, email: event.target.value })} />
              </label>
              <label className="block text-sm font-medium">Phone
                <input className="form-input mt-1.5" type="tel" maxLength={30} value={editForm.phone}
                  onChange={(event) => setEditForm({ ...editForm, phone: event.target.value })} />
              </label>
              <label className="block text-sm font-medium">Profile image URL
                <input className="form-input mt-1.5" type="url" maxLength={1000} value={editForm.avatarUrl}
                  onChange={(event) => setEditForm({ ...editForm, avatarUrl: event.target.value })} />
              </label>
              <label className="block text-sm font-medium">Organization
                <select className="form-input mt-1.5" value={editForm.organizationId}
                  onChange={(event) => {
                    setEditForm({ ...editForm, organizationId: event.target.value, departmentId: '' });
                    loadFormDepartments(event.target.value);
                  }}>
                  <option value="">No organization</option>
                  {organizations.map((organization) => <option key={organization.id} value={organization.id}>{organization.name}</option>)}
                </select>
              </label>
              <label className="block text-sm font-medium">Department
                <select className="form-input mt-1.5" value={editForm.departmentId}
                  disabled={!editForm.organizationId}
                  onChange={(event) => setEditForm({ ...editForm, departmentId: event.target.value })}>
                  <option value="">No department</option>
                  {formDepartments.map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}
                </select>
              </label>
              <label className="block text-sm font-medium">Job title
                <input className="form-input mt-1.5" maxLength={150} value={editForm.jobTitle}
                  onChange={(event) => setEditForm({ ...editForm, jobTitle: event.target.value })} />
              </label>
              <label className="block text-sm font-medium">Employee code
                <input className="form-input mt-1.5" maxLength={80} value={editForm.employeeCode}
                  onChange={(event) => setEditForm({ ...editForm, employeeCode: event.target.value })} />
              </label>
            </div>
            <p className="text-xs text-slate-500">Role-specific profile data is shown below and is managed with the account role.</p>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => setEditMode(false)}>Cancel</Button>
              <Button type="submit" disabled={editSaving}>{editSaving ? 'Saving…' : 'Save changes'}</Button>
            </div>
          </form>
        ) : (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <Avatar name={selectedUser.full_name} image={selectedUser.avatar_url} size="lg" />
              <div><h3 className="font-bold text-slate-900">{selectedUser.full_name}</h3>
                <p className="text-sm text-slate-500">{selectedUser.email}</p></div>
              <Button className="ml-auto" onClick={() => setEditMode(true)}><Pencil size={15} /> Edit</Button>
            </div>
            <dl className="grid gap-4 rounded-xl bg-slate-50 p-4 text-sm sm:grid-cols-2">
              <div><dt className="text-slate-500">Role</dt><dd className="mt-1 font-semibold">{ROLE_LABELS[selectedUser.role]}</dd></div>
              <div><dt className="text-slate-500">Status</dt><dd className="mt-1 font-semibold">{accountStatus(selectedUser)}</dd></div>
              <div><dt className="text-slate-500">Phone</dt><dd className="mt-1 font-semibold">{selectedUser.phone || 'Not provided'}</dd></div>
              <div><dt className="text-slate-500">Organization / department</dt><dd className="mt-1 font-semibold">{selectedUser.organization_name || 'None'} / {selectedUser.department_name || 'None'}</dd></div>
              <div><dt className="text-slate-500">Job title</dt><dd className="mt-1 font-semibold">{selectedUser.job_title || 'Not provided'}</dd></div>
              <div><dt className="text-slate-500">Employee code</dt><dd className="mt-1 font-semibold">{selectedUser.employee_code || 'Not provided'}</dd></div>
              <div><dt className="text-slate-500">Registered</dt><dd className="mt-1 font-semibold">{new Date(selectedUser.created_at).toLocaleString()}</dd></div>
              <div><dt className="text-slate-500">Email verified</dt><dd className="mt-1 font-semibold">{selectedUser.email_verified ? 'Yes' : 'No'}</dd></div>
            </dl>
            <div className="grid gap-5 sm:grid-cols-2">
              <div><h4 className="font-semibold">Projects</h4>
                <ul className="mt-2 list-inside list-disc text-sm text-slate-600">
                  {(selectedUser.projects || []).map((project) => <li key={project.id}>{project.name}</li>)}
                  {!selectedUser.projects?.length && <li className="list-none text-slate-400">No project assignments</li>}
                </ul>
              </div>
              <div><h4 className="font-semibold">Teams</h4>
                <ul className="mt-2 list-inside list-disc text-sm text-slate-600">
                  {(selectedUser.teams || []).map((team) => <li key={team.id}>{team.name}</li>)}
                  {!selectedUser.teams?.length && <li className="list-none text-slate-400">No team assignments</li>}
                </ul>
              </div>
            </div>
            {selectedUser.role_attributes && Object.keys(selectedUser.role_attributes).length > 0 && (
              <div><h4 className="font-semibold">Role-specific profile</h4>
                <dl className="mt-2 grid gap-2 text-sm sm:grid-cols-2">
                  {Object.entries(selectedUser.role_attributes).map(([key, value]) => (
                    <div key={key}><dt className="capitalize text-slate-500">{key.replace(/[A-Z]/g, (letter) => ` ${letter.toLowerCase()}`)}</dt>
                      <dd className="font-medium">{Array.isArray(value) ? value.join(', ') : String(value)}</dd></div>
                  ))}
                </dl>
              </div>
            )}
          </div>
        ))}
      </Modal>

      <Modal open={assignmentOpen} title="Manage project and team assignments"
        onClose={() => { setAssignmentOpen(false); setAssignmentUser(null); }} size="max-w-2xl">
        {assignmentUser && (
          <div className="space-y-5">
            {assignmentError && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{assignmentError}</p>}
            <p className="text-sm text-slate-600">
              Assign access for <strong>{assignmentUser.full_name}</strong>. Existing memberships are retained; selections below add access.
              {assignmentUser.role === 'project_manager' && ' Assigning a project transfers its manager role.'}
            </p>
            {assignmentLoading ? <p className="text-sm text-slate-500">Loading assignments…</p> : (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div><h4 className="text-sm font-semibold">Current projects</h4>
                    <p className="mt-1 text-xs text-slate-500">{assignmentDetails.projects.map((item) => item.name).join(', ') || 'None'}</p></div>
                  <div><h4 className="text-sm font-semibold">Current teams</h4>
                    <p className="mt-1 text-xs text-slate-500">{assignmentDetails.teams.map((item) => item.name).join(', ') || 'None'}</p></div>
                </div>
                {assignmentUser.role !== 'system_admin' ? (
                  <>
                    <label className="block text-sm font-medium">Add projects
                      <select className="form-input mt-1.5 min-h-28" multiple value={assignmentProjectIds}
                        disabled={loadingProjects}
                        onChange={(event) => setAssignmentProjectIds(selectedValues(event))}>
                        {assignmentProjects.filter((project) =>
                          !assignmentDetails.projects.some((item) => item.id === project.id))
                          .map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
                      </select>
                    </label>
                    {['team_leader', 'team_member'].includes(assignmentUser.role) && (
                      <label className="block text-sm font-medium">Add teams
                        <select className="form-input mt-1.5 min-h-28" multiple value={assignmentTeamIds}
                          disabled={loadingTeams || !assignmentProjectIds.length}
                          onChange={(event) => setAssignmentTeamIds(selectedValues(event))}>
                          {selectedTeamOptions.filter((team) =>
                            !assignmentDetails.teams.some((item) => item.id === team.id))
                            .map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
                        </select>
                      </label>
                    )}
                  </>
                ) : <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">System administrators do not have project or team memberships.</p>}
              </>
            )}
            <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
              <Button variant="secondary" onClick={() => setAssignmentOpen(false)}>Close</Button>
              {assignmentUser.role !== 'system_admin' && <Button onClick={saveAssignments}
                disabled={assignmentSaving || assignmentLoading || (!assignmentProjectIds.length && !assignmentTeamIds.length)}>
                {assignmentSaving ? 'Saving…' : 'Add assignments'}
              </Button>}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
