
-- PTMS Phase 4: Team management

-- Add team leader and update timestamp.
ALTER TABLE teams
  ADD COLUMN IF NOT EXISTS leader_id UUID
    REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE teams
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ
    NOT NULL DEFAULT NOW();

ALTER TABLE team_members
  ADD COLUMN IF NOT EXISTS joined_at TIMESTAMPTZ
    NOT NULL DEFAULT NOW();

-- Prevent duplicate membership.
CREATE UNIQUE INDEX IF NOT EXISTS uq_team_members_team_user
  ON team_members(team_id, user_id);

-- Helpful indexes.
CREATE INDEX IF NOT EXISTS idx_teams_project
  ON teams(project_id);

CREATE INDEX IF NOT EXISTS idx_teams_leader
  ON teams(leader_id);

CREATE INDEX IF NOT EXISTS idx_team_members_user
  ON team_members(user_id);

CREATE INDEX IF NOT EXISTS idx_team_members_team
  ON team_members(team_id);
