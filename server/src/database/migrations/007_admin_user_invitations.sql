-- Administrative account invitations. Run after the base schema and migrations 003-006.
-- Invitation tokens are stored only as SHA-256 digests; plaintext tokens are returned once.
CREATE UNIQUE INDEX IF NOT EXISTS uq_teams_project_and_id
  ON teams (project_id, id);

CREATE TABLE IF NOT EXISTS user_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(180) NOT NULL,
  role_id INTEGER NOT NULL REFERENCES roles(id),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  team_id UUID,
  token_hash CHAR(64) NOT NULL UNIQUE,
  invited_by UUID REFERENCES users(id) ON DELETE SET NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_user_invitation_team_scope
    CHECK (team_id IS NULL OR project_id IS NOT NULL),
  CONSTRAINT fk_user_invitation_team_project
    FOREIGN KEY (project_id, team_id)
    REFERENCES teams (project_id, id) ON DELETE CASCADE,
  CONSTRAINT chk_user_invitation_expiry
    CHECK (expires_at > created_at),
  CONSTRAINT chk_user_invitation_terminal_state
    CHECK (accepted_at IS NULL OR revoked_at IS NULL)
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_user_invitations_pending_email
  ON user_invitations (lower(email))
  WHERE accepted_at IS NULL AND revoked_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_user_invitations_expiry
  ON user_invitations (expires_at)
  WHERE accepted_at IS NULL AND revoked_at IS NULL;
