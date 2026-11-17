ALTER TABLE users
  ADD COLUMN IF NOT EXISTS account_status VARCHAR(20) NOT NULL DEFAULT 'active'
    CHECK (account_status IN ('active', 'inactive', 'suspended'));

UPDATE users
SET account_status = 'inactive'
WHERE is_active = FALSE AND account_status = 'active';

ALTER TABLE user_invitations
  ADD COLUMN IF NOT EXISTS organization_id UUID
    REFERENCES organizations(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS department_id UUID
    REFERENCES departments(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS phone VARCHAR(30),
  ADD COLUMN IF NOT EXISTS job_title VARCHAR(150),
  ADD COLUMN IF NOT EXISTS employee_code VARCHAR(80),
  ADD COLUMN IF NOT EXISTS role_attributes JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS account_active BOOLEAN NOT NULL DEFAULT TRUE;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'chk_user_invitation_role_attributes_object'
  ) THEN
    ALTER TABLE user_invitations
      ADD CONSTRAINT chk_user_invitation_role_attributes_object
      CHECK (jsonb_typeof(role_attributes) = 'object');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS user_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  job_title VARCHAR(150),
  employee_code VARCHAR(80),
  role_attributes JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_user_profile_role_attributes_object
    CHECK (jsonb_typeof(role_attributes) = 'object')
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_organization
  ON user_profiles (organization_id);

CREATE INDEX IF NOT EXISTS idx_user_profiles_department
  ON user_profiles (department_id);

CREATE TABLE IF NOT EXISTS user_invitation_project_assignments (
  invitation_id UUID NOT NULL
    REFERENCES user_invitations(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  PRIMARY KEY (invitation_id, project_id)
);

CREATE TABLE IF NOT EXISTS user_invitation_team_assignments (
  invitation_id UUID NOT NULL
    REFERENCES user_invitations(id) ON DELETE CASCADE,
  project_id UUID NOT NULL,
  team_id UUID NOT NULL,
  PRIMARY KEY (invitation_id, team_id),
  FOREIGN KEY (invitation_id, project_id)
    REFERENCES user_invitation_project_assignments(invitation_id, project_id)
    ON DELETE CASCADE,
  FOREIGN KEY (project_id, team_id)
    REFERENCES teams(project_id, id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_user_invitations_organization
  ON user_invitations (organization_id);

CREATE INDEX IF NOT EXISTS idx_user_invitations_department
  ON user_invitations (department_id);
