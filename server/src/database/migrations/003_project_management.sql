
-- Phase 3: Project management
-- Run this after the Phase 1 and Phase 2 schema.

ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS manager_id UUID REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS status VARCHAR(30) NOT NULL DEFAULT 'planning',
  ADD COLUMN IF NOT EXISTS start_date DATE,
  ADD COLUMN IF NOT EXISTS due_date DATE,
  ADD COLUMN IF NOT EXISTS budget NUMERIC(14, 2);

ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

ALTER TABLE project_members
  ADD COLUMN IF NOT EXISTS joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Prevent duplicate project membership.
CREATE UNIQUE INDEX IF NOT EXISTS uq_project_members_project_user
  ON project_members(project_id, user_id);

CREATE INDEX IF NOT EXISTS idx_projects_manager
  ON projects(manager_id);

CREATE INDEX IF NOT EXISTS idx_projects_organization
  ON projects(organization_id);

CREATE INDEX IF NOT EXISTS idx_project_members_user
  ON project_members(user_id);

CREATE INDEX IF NOT EXISTS idx_project_members_project
  ON project_members(project_id);
