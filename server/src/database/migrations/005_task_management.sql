
-- PTMS Phase 5: Task management

ALTER TABLE tasks
  ADD COLUMN IF NOT EXISTS team_id UUID
    REFERENCES teams(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS created_by UUID
    REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS priority VARCHAR(20)
    NOT NULL DEFAULT 'medium',
  ADD COLUMN IF NOT EXISTS due_date DATE,
  ADD COLUMN IF NOT EXISTS estimated_hours NUMERIC(8,2),
  ADD COLUMN IF NOT EXISTS actual_hours NUMERIC(8,2),
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS qa_status VARCHAR(20)
    NOT NULL DEFAULT 'not_submitted',
  ADD COLUMN IF NOT EXISTS qa_feedback TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ
    NOT NULL DEFAULT NOW();

-- Standardize status and priority values.
ALTER TABLE tasks
  ALTER COLUMN status SET DEFAULT 'todo';

-- Task assignments: supports multiple assignees.
CREATE TABLE IF NOT EXISTS task_assignees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES users(id) ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(task_id, user_id)
);

-- Subtasks.
CREATE TABLE IF NOT EXISTS subtasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  title VARCHAR(180) NOT NULL,
  description TEXT,
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  position INTEGER NOT NULL DEFAULT 0,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Task dependencies.
CREATE TABLE IF NOT EXISTS task_dependencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  depends_on_task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_task_dependency UNIQUE(task_id, depends_on_task_id),
  CONSTRAINT chk_task_dependency_not_self
    CHECK (task_id <> depends_on_task_id)
);

-- Validate allowed values.
ALTER TABLE tasks
  DROP CONSTRAINT IF EXISTS tasks_priority_check,
  DROP CONSTRAINT IF EXISTS tasks_status_check,
  DROP CONSTRAINT IF EXISTS chk_tasks_priority,
  DROP CONSTRAINT IF EXISTS chk_tasks_status,
  DROP CONSTRAINT IF EXISTS chk_tasks_qa_status;

ALTER TABLE tasks
  ADD CONSTRAINT chk_tasks_priority
  CHECK (priority IN ('low', 'medium', 'high', 'urgent'));

ALTER TABLE tasks
  ADD CONSTRAINT chk_tasks_status
  CHECK (status IN ('todo', 'in_progress', 'review', 'done', 'blocked'));

ALTER TABLE tasks
  ADD CONSTRAINT chk_tasks_qa_status
  CHECK (qa_status IN (
    'not_submitted',
    'pending',
    'approved',
    'rejected',
    'changes_requested'
  ));

-- Indexes.
CREATE INDEX IF NOT EXISTS idx_tasks_project
  ON tasks(project_id);

CREATE INDEX IF NOT EXISTS idx_tasks_team
  ON tasks(team_id);

CREATE INDEX IF NOT EXISTS idx_tasks_status
  ON tasks(status);

CREATE INDEX IF NOT EXISTS idx_tasks_due_date
  ON tasks(due_date);

CREATE INDEX IF NOT EXISTS idx_task_assignees_user
  ON task_assignees(user_id);

CREATE INDEX IF NOT EXISTS idx_task_assignees_task
  ON task_assignees(task_id);

CREATE INDEX IF NOT EXISTS idx_subtasks_task
  ON subtasks(task_id);

CREATE INDEX IF NOT EXISTS idx_task_dependencies_task
  ON task_dependencies(task_id);
