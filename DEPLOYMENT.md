# Production deployment

This deployment uses Neon Postgres, the Render web service defined in `render.yaml`, and a Vercel project rooted at `client`.

## 1. Prepare Neon

1. Create a Neon project and production branch in the region closest to Render.
2. Apply the schema and migrations from `server/src/database` in the same order listed in the [local setup](./README.md#local-setup). Use Neon's **direct/unpooled** connection for schema changes. The app runtime should use the pooled connection.
3. Keep the connection string in the hosting provider's secret settings only. For Render's `DATABASE_URL`, use Neon's pooled connection string (its hostname contains `-pooler`). Do not put credentials in this repository or in Vercel.
4. Take a database backup/snapshot before production migrations. Test migrations on a separate Neon branch first.

The local development `DATABASE_URL` is not suitable for Render. A `localhost` database URL points at the Render container itself, not your development computer or Neon.

## 2. Deploy the backend to Render

1. Connect the GitHub repository to Render and select the Blueprint from the repository root (`render.yaml`).
2. The Blueprint creates a Node web service rooted at `server`, installs with `npm ci`, and starts with `npm start`.
3. Set the Blueprint's `DATABASE_URL` to Neon's pooled connection string and `JWT_SECRET` to a generated random value of at least 32 bytes.
4. Deploy the frontend once to obtain its production origin, then set `CLIENT_URL` to that exact HTTPS origin (for example `https://your-app.vercel.app`). For additional Vercel preview origins, add their exact origins as a comma-separated list; do not use a wildcard.
5. Keep `DATABASE_SSL=true` and `DATABASE_SSL_REJECT_UNAUTHORIZED=true`. Render's health check uses `/api/v1/health/live`; check `/api/v1/health/ready` separately to verify database connectivity.

Do not set the database's direct URL on the web service. Do not set `ADMIN_PASSWORD` or other bootstrap credentials on the long-running service. Bootstrap the first administrator as a one-off operation from a trusted environment, then remove the bootstrap variables.

## 3. Deploy the frontend to Vercel

1. Import the same GitHub repository into Vercel and set **Root Directory** to `client`.
2. Vercel uses the client package scripts and `client/vercel.json` for SPA route fallback and asset caching.
3. Configure these environment variables for the Production environment:
   - `VITE_API_BASE_URL`: the Render API origin followed by `/api/v1` (for example `https://your-api.onrender.com/api/v1`).
   - `VITE_SITE_URL`: the actual public HTTPS frontend origin without a trailing path (for example `https://your-app.vercel.app`). The production build fails if this is missing or invalid.
4. Redeploy after changing environment variables. Add the final Vercel origin to Render's `CLIENT_URL`.

## 4. Verify deployment

- Open the Vercel home page and directly load `/about`, `/features`, `/contact`, and `/request-access`; each should resolve through the SPA fallback.
- `GET https://<render-service>/api/v1/health/live` should return `200` when the API process is up.
- `GET https://<render-service>/api/v1/health/ready` should return `200` only when PostgreSQL is reachable; it returns `503` during a database outage.
- Submit contact/access forms only after applying migration `008_public_requests.sql`.
- Confirm CORS works from the production frontend origin and that administrator-only routes remain protected.

The API starts while Neon is temporarily unavailable so Render does not restart-loop during a transient outage. Database-backed requests still require a reachable database. If readiness remains `503`, verify the Neon branch is active, the pooled connection string and password are current, the database permits connections, and production TLS verification remains enabled.
