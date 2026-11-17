# Project Team Management System

A Project Team Management System (PTMS) built with React, Node.js, Express, and PostgreSQL. It streamlines project planning, team collaboration, task assignment, progress tracking, role-based access, and quality reviews for administrators, managers, team leaders, members, clients, and QA reviewers.

## Administrator-managed account access

Public self-registration is disabled. A system administrator can invite users to one of the six roles, assign organization/department and multiple project/team memberships, and manage account status. Invitations expire after 72 hours and can be accepted only once.

### Local setup

1. Configure `server/.env` with `DATABASE_URL`, a strong `JWT_SECRET`, and `CLIENT_URL` (for example `http://localhost:5173`). Do not commit environment files.
2. Against a local PostgreSQL database only, apply the base schema and existing migrations in order, then seed roles:
   ```powershell
   cd server
   psql "$env:DATABASE_URL" -f src/database/schema.sql
   npm run db:seed
   psql "$env:DATABASE_URL" -f src/database/migrations/003_project_management.sql
   psql "$env:DATABASE_URL" -f src/database/migrations/004_team_management.sql
   psql "$env:DATABASE_URL" -f src/database/migrations/005_task_management.sql
   psql "$env:DATABASE_URL" -f src/database/migrations/006_communication_collaboration.sql
   psql "$env:DATABASE_URL" -f src/database/migrations/007_admin_user_invitations.sql
   psql "$env:DATABASE_URL" -f src/database/migrations/008_public_requests.sql
   psql "$env:DATABASE_URL" -f src/database/migrations/009_admin_user_profiles_and_assignments.sql
   psql "$env:DATABASE_URL" -f src/database/migrations/010_production_query_indexes.sql
   ```
   `DATABASE_URL` is used above only if you explicitly point it at a local development database. The application changes in this workspace were not applied to any database.
3. Bootstrap the first system administrator using `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` in the server environment, then run `npm run db:create-admin`. The bootstrap password must be at least 12 characters. Remove these bootstrap values when finished.
4. From the repository root, install dependencies with `cd server; npm install`, then `cd ..\client; npm install` (or use separate terminals). Start the server in one terminal with `cd server; npm run dev`. Set the optional client variable `VITE_API_BASE_URL=http://localhost:5000/api/v1` (this is also the client default), then start the client in another terminal with `cd client; npm run dev`.
5. Before a production frontend build, set `VITE_SITE_URL` to the real public HTTPS origin (for example `https://ptms.your-company.com`). The build fails if it is missing or is not an HTTPS origin; it generates the public-only sitemap and robots policy from that origin. Keep the example value in `client/.env.example` out of production.

There is no email delivery provider configured in this repository. When an administrator creates an invitation, the API returns its link once; deliver it to the invited person through a trusted channel. The URL token is a temporary bearer credential. Do not put it in tickets, logs, or shared/public chat. The server stores only its SHA-256 digest.
The client stores the current JWT in tab-scoped `sessionStorage` and attaches it as a Bearer token to management requests.
The API uses `HS256` JWTs, verifies active users and current database roles on each request, and logs authentication failures without user identifiers. Production defaults to PostgreSQL TLS with certificate validation enabled; supply the database provider's CA configuration rather than disabling certificate validation. Set `TRUST_PROXY` only to the number of trusted reverse-proxy hops so rate-limit identity cannot be spoofed through forwarded headers. The production static host should serve hashed `/assets/*` files with long-lived immutable caching and keep `index.html`, `robots.txt`, and `sitemap.xml` revalidatable. The sitemap and robots rules do not replace API authorization.

## Public contact and access requests

The public website submits contact messages and access requests to the backend. Apply migration `008_public_requests.sql` before using these forms. No new environment variables are required; the client uses `VITE_API_BASE_URL` and the server uses the existing `DATABASE_URL` and `CLIENT_URL`.

Public submissions are limited to five per IP per 15 minutes on each endpoint. Public JSON request bodies are limited to 16 KB. The rate limiter uses the default per-process memory store; production deployments with multiple server instances should configure a shared express-rate-limit store. Contact and access submissions are persisted for administrator review. The API does not send email.
Login and invitation acceptance endpoints are also rate-limited per process. Configure a shared rate-limit store when deploying multiple API instances. Request logs are structured and omit request URLs, bodies, credentials, and client IP addresses. The readiness check at `/api/v1/health/ready` returns only service status and returns `503` when PostgreSQL is unavailable; `/api/v1/health/live` is a liveness-only check.

| Method and path | Purpose |
|---|---|
| `POST /api/v1/public/contact` | Store `{ "fullName", "email", "organization", "subject", "message" }`; subject is `access`, `information`, or `other` |
| `POST /api/v1/public/access-requests` | Store `{ "fullName", "email", "organization", "jobTitle", "phone?", "reason" }` as pending; public input cannot choose a role |
| `GET /api/v1/admin/public-requests/contact-messages` | System-admin only; search/filter with `search`, `status`, `page`, and `limit` |
| `GET /api/v1/admin/public-requests/contact-messages/:id` | System-admin only; retrieve an individual message |
| `PATCH /api/v1/admin/public-requests/contact-messages/:id/status` | System-admin only; set status to `new`, `read`, or `closed` |
| `GET /api/v1/admin/public-requests/access-requests` | System-admin only; search/filter with `search`, `status`, `page`, and `limit` |
| `GET /api/v1/admin/public-requests/access-requests/:id` | System-admin only; retrieve an individual access request |
| `PATCH /api/v1/admin/public-requests/access-requests/:id/decision` | System-admin only; approve with `{ "decision": "approved", "role": "team_member", "reviewNote?": "..." }` or reject with `{ "decision": "rejected", "reviewNote?": "..." }` |

Access approvals require an explicitly selected non-administrator role (`project_manager`, `team_leader`, `team_member`, `client`, or `qa_reviewer`). Approval and invitation creation are transactional and audited. An approved requester receives a one-time invitation URL in the admin response; deliver it securely. The requester sets their own password through the existing invitation acceptance flow. Access requests do not create accounts automatically, and public visitors can never grant themselves roles.

### Account API

All management endpoints require a valid Bearer JWT whose current database role is `system_admin`. Client-side role checks are only for presentation; the server enforces authorization.

| Method and path | Purpose |
|---|---|
| `POST /api/v1/auth/login` | Existing login; returns user and JWT |
| `GET /api/v1/auth/me` | Existing current-user endpoint |
| `POST /api/v1/auth/register` | Retained for compatibility; returns `410` because open registration is disabled |
| `POST /api/v1/auth/accept-invitation` | Accept `{ "token": "...", "password": "12+ characters" }`; creates account and returns JWT |
| `GET /api/v1/users` | Search/filter users by role, organization, department, status; paginated; system-admin only |
| `GET /api/v1/users/stats` | User totals, role counts, pending invitations, and recently created accounts |
| `GET /api/v1/users/invitations` | List pending invitations without exposing tokens |
| `POST /api/v1/users/invitations` | Create invitation with profile, role-specific attributes, and multiple project/team assignments; raw URL appears once in response |
| `POST /api/v1/users/invitations/:id/resend` | Revoke the prior pending link and return a replacement link once |
| `POST /api/v1/users` | Compatibility alias for invitation creation |
| `GET /api/v1/users/:id/assignments` | Retrieve project and team assignments |
| `POST /api/v1/users/:id/projects` | Add one or more validated project assignments |
| `POST /api/v1/users/:id/teams` | Add validated team assignments scoped to the user's role and organization |
| `PATCH /api/v1/users/:id/role` | Assign a role; project memberships are kept consistent, team-leader references and system-admin memberships are validated |
| `PATCH /api/v1/users/:id/activate` / `deactivate` / `suspend` | Change account status (self-deactivation and last-active-admin loss are blocked) |
| `PATCH /api/v1/users/:id` | Update profile data; status changes use the same last-admin protections |

Profile data and multi-project/team invitation assignments are introduced by migration `009_admin_user_profiles_and_assignments.sql`; role-specific attributes are stored as validated JSONB, while organization, department, job title, and employee code remain relational profile fields. Project/team memberships and audit events are created transactionally when an invitation is accepted. Project manager and team leader assignments update the corresponding manager/leader relationship. System administrators cannot carry project/team memberships, and granting that role requires explicit confirmation. Administrative user changes and invitation events are recorded in `activity_logs` in the same transaction. The database advisory lock serializes admin demotion/deactivation checks.

### Verification

Run backend tests: `cd server; npm test`. Run frontend checks: `cd client; npm run lint; npm run test:e2e`. For a build, set `VITE_SITE_URL` to the real public HTTPS origin before `npm run build`; the build generates the sitemap and robots file. Apply migrations against a local PostgreSQL database before running database-backed API verification; no live/external database was used.