-- Query-supporting indexes for frequent list and activity lookups.
CREATE INDEX IF NOT EXISTS idx_users_created_at
  ON users (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_users_role_created_at
  ON users (role_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_users_status_created_at
  ON users (account_status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_projects_created_at
  ON projects (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_projects_status_created_at
  ON projects (status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_tasks_project_status_due_date
  ON tasks (project_id, status, due_date, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_activity_logs_user_created_at
  ON activity_logs (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_activity_logs_entity_created_at
  ON activity_logs (entity_type, entity_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at
  ON contact_messages (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_access_requests_created_at
  ON access_requests (created_at DESC);
