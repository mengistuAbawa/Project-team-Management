import { useEffect, useState } from 'react';
import { ROLE_LABELS } from '../../../config/roles.js';

const roleOptions = Object.keys(ROLE_LABELS);
const emptyForm = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  avatarUrl: '',
  organizationId: '',
  departmentId: '',
  role: 'team_member',
  jobTitle: '',
  employeeCode: '',
  roleAttributes: {},
  projectIds: [],
  teamIds: [],
  accountActive: true,
  confirmSystemAdmin: false,
};

const adminPermissions = [
  'users',
  'organizations',
  'projects',
  'audit_logs',
  'settings',
];

const arrayFields = new Set(['skills', 'testingExpertise']);

function selectedValues(event) {
  return Array.from(event.target.selectedOptions, (option) => option.value);
}

function TextField({ label, value, onChange, type = 'text', required = false, maxLength }) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      {label}
      <input className="form-input mt-1.5" type={type} value={value || ''}
        onChange={onChange} required={required} maxLength={maxLength} />
    </label>
  );
}

function TextAreaField({ label, value, onChange }) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      {label}
      <textarea className="form-input mt-1.5 min-h-24" value={value || ''}
        onChange={onChange} maxLength={2000} />
    </label>
  );
}

export function UserForm({
  organizations,
  departments,
  projects,
  teams,
  loadingProjects,
  loadingTeams,
  optionsError,
  onOrganizationChange,
  onProjectIdsChange,
  onSubmit,
  submitting,
  error,
  onCancel,
}) {
  const [form, setForm] = useState(emptyForm);
  const [step, setStep] = useState(0);

  useEffect(() => {
    onProjectIdsChange(form.role === 'system_admin' ? [] : form.projectIds);
  }, [form.projectIds, form.role, onProjectIdsChange]);

  const setField = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const setAttribute = (field, value) => setForm((current) => ({
    ...current,
    roleAttributes: { ...current.roleAttributes, [field]: value },
  }));
  const availableProjects = projects.filter((project) =>
    !form.organizationId || project.organization_id === form.organizationId);
  const availableTeams = teams.filter((team) => form.projectIds.includes(team.project_id));

  const changeOrganization = (organizationId) => {
    const retainedProjectIds = form.projectIds.filter((projectId) =>
      projects.some((project) => project.id === projectId &&
        (!organizationId || project.organization_id === organizationId)));
    setForm((current) => ({
      ...current,
      organizationId,
      departmentId: '',
      projectIds: retainedProjectIds,
      teamIds: current.teamIds.filter((teamId) =>
        teams.some((team) => team.id === teamId && retainedProjectIds.includes(team.project_id))),
    }));
    onOrganizationChange(organizationId);
  };

  const changeRole = (role) => {
    setForm((current) => ({
      ...current,
      role,
      roleAttributes: role === 'system_admin'
        ? { administratorLevel: 'global', administrativePermissions: [], managedOrganizationIds: [] }
        : {},
      projectIds: role === 'system_admin' ? [] : current.projectIds,
      teamIds: role === 'system_admin' ? [] : current.teamIds,
      confirmSystemAdmin: false,
    }));
  };

  const changeProjects = (event) => {
    const projectIds = selectedValues(event);
    setForm((current) => ({
      ...current,
      projectIds,
      teamIds: current.teamIds.filter((teamId) =>
        teams.some((team) => team.id === teamId && projectIds.includes(team.project_id))),
    }));
  };

  const renderRoleFields = () => {
    const text = (field, label, maxLength = 2000) => (
      <TextField key={field} label={label}
        value={form.roleAttributes[field]}
        maxLength={maxLength}
        onChange={(event) => setAttribute(field, event.target.value)} />
    );
    const area = (field, label) => (
      <TextAreaField key={field} label={label}
        value={form.roleAttributes[field]}
        onChange={(event) => setAttribute(field, event.target.value)} />
    );
    const list = (field, label, values = []) => (
      arrayFields.has(field) ? (
        <TextField key={field} label={label}
          value={(form.roleAttributes[field] || []).join(', ')}
          onChange={(event) => setAttribute(field, event.target.value.split(',').map((item) => item.trim()).filter(Boolean))} />
      ) : (
        <label key={field} className="block text-sm font-medium text-slate-700">
          {label}
          <select className="form-input mt-1.5 min-h-24" multiple
            value={form.roleAttributes[field] || []}
            onChange={(event) => setAttribute(field, selectedValues(event))}>
            {values.map((value) => <option key={value} value={value}>{value.replaceAll('_', ' ')}</option>)}
          </select>
          <span className="mt-1 block text-xs font-normal text-slate-500">Use Ctrl or Command to select multiple.</span>
        </label>
      )
    );

    switch (form.role) {
      case 'system_admin':
        return (
          <>
            <label className="block text-sm font-medium text-slate-700">Administrator level
              <select className="form-input mt-1.5"
                value={form.roleAttributes.administratorLevel || 'global'}
                onChange={(event) => setAttribute('administratorLevel', event.target.value)}>
                <option value="global">Global</option>
                <option value="organization">Organization metadata</option>
              </select>
            </label>
            {list('administrativePermissions', 'Administrative permissions', adminPermissions)}
            <label className="block text-sm font-medium text-slate-700">Managed organizations
              <select className="form-input mt-1.5 min-h-24" multiple
                value={form.roleAttributes.managedOrganizationIds || []}
                onChange={(event) => setAttribute('managedOrganizationIds', selectedValues(event))}>
                {organizations.map((organization) =>
                  <option key={organization.id} value={organization.id}>{organization.name}</option>)}
              </select>
              <span className="mt-1 block text-xs font-normal text-amber-700">
                System administrator access remains global; these selections are profile metadata only.
              </span>
            </label>
            <label className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              <input type="checkbox" className="mt-1" checked={form.confirmSystemAdmin}
                onChange={(event) => setField('confirmSystemAdmin', event.target.checked)} />
              <span>I confirm this account will receive global administrator privileges.</span>
            </label>
          </>
        );
      case 'project_manager':
        return <>{area('projectResponsibilities', 'Project responsibilities')}{area('approvalScope', 'Approval scope')}</>;
      case 'team_leader':
        return area('leadershipResponsibilities', 'Leadership responsibilities');
      case 'team_member':
        return (
          <>
            {list('skills', 'Skills', [
              'planning', 'design', 'development', 'documentation', 'communication', 'testing',
            ])}
            {text('specialization', 'Specialization')}
            <label className="block text-sm font-medium text-slate-700">Experience level
              <select className="form-input mt-1.5" value={form.roleAttributes.experienceLevel || ''}
                onChange={(event) => setAttribute('experienceLevel', event.target.value)}>
                <option value="">Not specified</option>
                {['entry', 'intermediate', 'senior', 'expert'].map((value) =>
                  <option key={value} value={value}>{value}</option>)}
              </select>
            </label>
            <label className="block text-sm font-medium text-slate-700">Availability
              <select className="form-input mt-1.5" value={form.roleAttributes.availabilityStatus || ''}
                onChange={(event) => setAttribute('availabilityStatus', event.target.value)}>
                <option value="">Not specified</option>
                <option value="available">Available</option>
                <option value="part_time">Part time</option>
                <option value="unavailable">Unavailable</option>
              </select>
            </label>
          </>
        );
      case 'client':
        return (
          <>
            {text('companyName', 'Company name', 180)}
            {text('clientCode', 'Client code', 80)}
            {text('contactPerson', 'Contact person', 150)}
            {area('billingAddress', 'Billing address')}
            {text('contractReference', 'Contract reference', 150)}
            {text('clientContactInformation', 'Client contact information', 180)}
          </>
        );
      case 'qa_reviewer':
        return (
          <>
            {text('qaIdentificationCode', 'QA identification code', 80)}
            {text('qaSpecialization', 'QA specialization', 150)}
            {list('testingExpertise', 'Testing expertise', [
              'functional', 'integration', 'regression', 'security', 'performance', 'accessibility',
            ])}
            {area('reviewResponsibilities', 'Review responsibilities')}
          </>
        );
      default:
        return null;
    }
  };

  const moveNext = () => {
    if (step === 0) {
      if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim()) return;
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return;
    }
    if (step === 1 && form.role === 'system_admin' && !form.confirmSystemAdmin) return;
    if (step === 2) {
      onSubmit({
        ...form,
        fullName: `${form.firstName.trim()} ${form.lastName.trim()}`,
        email: form.email.trim(),
        organizationId: form.organizationId || null,
        departmentId: form.departmentId || null,
        avatarUrl: form.avatarUrl.trim() || null,
        jobTitle: form.jobTitle.trim() || null,
        employeeCode: form.employeeCode.trim() || null,
        projectIds: form.role === 'system_admin' ? [] : form.projectIds,
        teamIds: form.role === 'system_admin' ? [] : form.teamIds,
      });
      return;
    }
    setStep((current) => current + 1);
  };

  const stepTitles = ['Personal information', 'Role and account', 'Assignments and review'];

  return (
    <form onSubmit={(event) => { event.preventDefault(); moveNext(); }} className="space-y-5">
      {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
      {optionsError && <p role="status" className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">{optionsError}</p>}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Step {step + 1} of 3</p>
        <h3 className="mt-1 text-lg font-bold text-slate-900">{stepTitles[step]}</h3>
      </div>

      {step === 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="First name" value={form.firstName} required maxLength={75}
            onChange={(event) => setField('firstName', event.target.value)} />
          <TextField label="Last name" value={form.lastName} required maxLength={75}
            onChange={(event) => setField('lastName', event.target.value)} />
          <TextField label="Email address" type="email" value={form.email} required maxLength={180}
            onChange={(event) => setField('email', event.target.value)} />
          <TextField label="Phone number" type="tel" value={form.phone} maxLength={30}
            onChange={(event) => setField('phone', event.target.value)} />
          <TextField label="Profile image URL" type="url" value={form.avatarUrl} maxLength={1000}
            onChange={(event) => setField('avatarUrl', event.target.value)} />
          <label className="block text-sm font-medium text-slate-700">Organization
            <select className="form-input mt-1.5" value={form.organizationId}
              onChange={(event) => changeOrganization(event.target.value)}>
              <option value="">No organization</option>
              {organizations.map((organization) =>
                <option key={organization.id} value={organization.id}>{organization.name}</option>)}
            </select>
          </label>
          <label className="block text-sm font-medium text-slate-700">Department
            <select className="form-input mt-1.5" value={form.departmentId}
              disabled={!form.organizationId}
              onChange={(event) => setField('departmentId', event.target.value)}>
              <option value="">No department</option>
              {departments.map((department) =>
                <option key={department.id} value={department.id}>{department.name}</option>)}
            </select>
          </label>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <label className="block text-sm font-medium text-slate-700">System role
            <select className="form-input mt-1.5" value={form.role}
              onChange={(event) => changeRole(event.target.value)}>
              {roleOptions.map((role) =>
                <option key={role} value={role}>{ROLE_LABELS[role]}</option>)}
            </select>
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="Job title" value={form.jobTitle} maxLength={150}
              onChange={(event) => setField('jobTitle', event.target.value)} />
            {['project_manager', 'team_leader', 'team_member'].includes(form.role) &&
              <TextField label="Employee code" value={form.employeeCode} maxLength={80}
                onChange={(event) => setField('employeeCode', event.target.value)} />}
          </div>
          {form.role === 'system_admin' && (
            <div className="space-y-4">
              {renderRoleFields()}
            </div>
          )}
          {form.role !== 'system_admin' && renderRoleFields()}
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={form.accountActive}
              onChange={(event) => setField('accountActive', event.target.checked)} />
            Activate account after the invitation is accepted
          </label>
          <p className="rounded-lg bg-indigo-50 p-3 text-xs leading-5 text-indigo-800">
            Email is the sign-in identifier. PTMS will create a secure invitation link; email delivery is not configured.
          </p>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-5">
          {form.role !== 'system_admin' ? (
            <div className="space-y-4">
              {['project_manager', 'team_leader', 'team_member', 'client', 'qa_reviewer'].includes(form.role) && (
                <label className="block text-sm font-medium text-slate-700">Assigned projects
                  <select className="form-input mt-1.5 min-h-32" multiple
                    value={form.projectIds} disabled={loadingProjects}
                    onChange={changeProjects}>
                    {availableProjects.map((project) =>
                      <option key={project.id} value={project.id}>
                        {project.name}{project.organization_name ? ` — ${project.organization_name}` : ''}
                      </option>)}
                  </select>
                  <span className="mt-1 block text-xs font-normal text-slate-500">
                    Select multiple projects. Project manager assignments transfer project management when accepted.
                  </span>
                </label>
              )}
              {['team_leader', 'team_member'].includes(form.role) && (
                <label className="block text-sm font-medium text-slate-700">Assigned teams
                  <select className="form-input mt-1.5 min-h-32" multiple
                    value={form.teamIds} disabled={loadingTeams || !form.projectIds.length}
                    onChange={(event) => setField('teamIds', selectedValues(event))}>
                    {form.projectIds.map((projectId) => {
                      const project = projects.find((item) => item.id === projectId);
                      return (
                        <optgroup key={projectId} label={project?.name || 'Project'}>
                          {availableTeams.filter((team) => team.project_id === projectId).map((team) =>
                            <option key={team.id} value={team.id}>{team.name}</option>)}
                        </optgroup>
                      );
                    })}
                  </select>
                  <span className="mt-1 block text-xs font-normal text-slate-500">
                    Teams are restricted to the projects selected above.
                  </span>
                </label>
              )}
              {loadingProjects && <p className="text-sm text-slate-500">Loading projects…</p>}
              {loadingTeams && <p className="text-sm text-slate-500">Loading teams…</p>}
            </div>
          ) : (
            <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
              System administrators receive global access and cannot be assigned project or team memberships.
            </p>
          )}

          <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h4 className="font-semibold text-slate-900">Account summary</h4>
            <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
              <div><dt className="text-slate-500">Name</dt><dd className="font-medium">{form.firstName} {form.lastName}</dd></div>
              <div><dt className="text-slate-500">Email</dt><dd className="font-medium">{form.email}</dd></div>
              <div><dt className="text-slate-500">Role</dt><dd className="font-medium">{ROLE_LABELS[form.role]}</dd></div>
              <div><dt className="text-slate-500">Organization</dt><dd className="font-medium">{organizations.find((item) => item.id === form.organizationId)?.name || 'None'}</dd></div>
              <div><dt className="text-slate-500">Department</dt><dd className="font-medium">{departments.find((item) => item.id === form.departmentId)?.name || 'None'}</dd></div>
              <div><dt className="text-slate-500">Account status</dt><dd className="font-medium">{form.accountActive ? 'Active after acceptance' : 'Inactive after acceptance'}</dd></div>
              <div><dt className="text-slate-500">Projects</dt><dd className="font-medium">{form.projectIds.map((id) => projects.find((item) => item.id === id)?.name).filter(Boolean).join(', ') || 'None'}</dd></div>
              <div><dt className="text-slate-500">Teams</dt><dd className="font-medium">{form.teamIds.map((id) => teams.find((item) => item.id === id)?.name).filter(Boolean).join(', ') || 'None'}</dd></div>
            </dl>
          </section>
        </div>
      )}

      <div className="sticky bottom-0 flex flex-wrap justify-between gap-2 border-t border-slate-100 bg-white pt-4">
        <div>
          {step > 0 && <button type="button" className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
            onClick={() => setStep((current) => current - 1)}>Back</button>}
        </div>
        <div className="flex gap-2">
          <button type="button" className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
            onClick={onCancel} disabled={submitting}>Cancel</button>
          <button type="submit" className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
            disabled={submitting || (step === 0 && (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim())) ||
              (step === 1 && form.role === 'system_admin' && !form.confirmSystemAdmin) ||
              (step === 2 && (loadingProjects || loadingTeams))}>
            {step < 2 ? 'Continue' : submitting ? 'Creating invitation…' : 'Create invitation'}
          </button>
        </div>
      </div>
    </form>
  );
}
