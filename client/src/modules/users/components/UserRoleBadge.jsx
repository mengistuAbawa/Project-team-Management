import { ROLE_LABELS } from '../../../config/roles.js';
export function UserRoleBadge({ role }) { return <span className="text-xs font-semibold text-indigo-700">{ROLE_LABELS[role] || role}</span>; }
