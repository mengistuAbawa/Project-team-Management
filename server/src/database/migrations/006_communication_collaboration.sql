
-- =====================================================
-- PTMS PHASE 6: COMMUNICATION AND COLLABORATION
-- =====================================================

-- Conversations can be direct, group, project, or team.
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  conversation_type VARCHAR(20) NOT NULL
    CHECK (conversation_type IN ('direct', 'group', 'project', 'team')),

  title VARCHAR(180),

  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,

  created_by UUID REFERENCES users(id) ON DELETE SET NULL,

  is_archived BOOLEAN NOT NULL DEFAULT FALSE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_conversation_scope CHECK (
    (conversation_type = 'project'
      AND project_id IS NOT NULL AND team_id IS NULL)
    OR
    (conversation_type = 'team'
      AND team_id IS NOT NULL AND project_id IS NULL)
    OR
    (conversation_type IN ('direct', 'group')
      AND project_id IS NULL AND team_id IS NULL)
  )
);

CREATE TABLE IF NOT EXISTS conversation_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  conversation_id UUID NOT NULL
    REFERENCES conversations(id) ON DELETE CASCADE,

  user_id UUID NOT NULL
    REFERENCES users(id) ON DELETE CASCADE,

  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_read_at TIMESTAMPTZ,

  is_muted BOOLEAN NOT NULL DEFAULT FALSE,

  UNIQUE(conversation_id, user_id)
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  conversation_id UUID NOT NULL
    REFERENCES conversations(id) ON DELETE CASCADE,

  sender_id UUID
    REFERENCES users(id) ON DELETE SET NULL,

  message TEXT NOT NULL,

  reply_to_id UUID
    REFERENCES chat_messages(id) ON DELETE SET NULL,

  edited_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_chat_message_not_empty
    CHECK (LENGTH(TRIM(message)) > 0)
);

CREATE TABLE IF NOT EXISTS message_reads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  message_id UUID NOT NULL
    REFERENCES chat_messages(id) ON DELETE CASCADE,

  user_id UUID NOT NULL
    REFERENCES users(id) ON DELETE CASCADE,

  read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(message_id, user_id)
);

-- Task-specific discussion.
CREATE TABLE IF NOT EXISTS task_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  task_id UUID NOT NULL
    REFERENCES tasks(id) ON DELETE CASCADE,

  user_id UUID
    REFERENCES users(id) ON DELETE SET NULL,

  parent_id UUID
    REFERENCES task_comments(id) ON DELETE CASCADE,

  content TEXT NOT NULL,

  edited_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_task_comment_not_empty
    CHECK (LENGTH(TRIM(content)) > 0)
);

-- Meetings.
CREATE TABLE IF NOT EXISTS collab_meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  project_id UUID NOT NULL
    REFERENCES projects(id) ON DELETE CASCADE,

  team_id UUID
    REFERENCES teams(id) ON DELETE SET NULL,

  title VARCHAR(180) NOT NULL,
  description TEXT,

  meeting_type VARCHAR(30) NOT NULL DEFAULT 'online'
    CHECK (meeting_type IN ('online', 'in_person')),

  meeting_link TEXT,
  location TEXT,

  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,

  status VARCHAR(20) NOT NULL DEFAULT 'scheduled'
    CHECK (status IN ('scheduled', 'completed', 'cancelled')),

  created_by UUID
    REFERENCES users(id) ON DELETE SET NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_meeting_time CHECK (end_time > start_time)
);

CREATE TABLE IF NOT EXISTS meeting_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  meeting_id UUID NOT NULL
    REFERENCES collab_meetings(id) ON DELETE CASCADE,

  user_id UUID NOT NULL
    REFERENCES users(id) ON DELETE CASCADE,

  response VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (response IN ('pending', 'accepted', 'declined')),

  responded_at TIMESTAMPTZ,

  UNIQUE(meeting_id, user_id)
);

-- Indexes.
CREATE INDEX IF NOT EXISTS idx_conversation_members_user
  ON conversation_members(user_id);

CREATE INDEX IF NOT EXISTS idx_conversation_project
  ON conversations(project_id);

CREATE INDEX IF NOT EXISTS idx_conversation_team
  ON conversations(team_id);

CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation
  ON chat_messages(conversation_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_message_reads_user
  ON message_reads(user_id);

CREATE INDEX IF NOT EXISTS idx_task_comments_task
  ON task_comments(task_id, created_at);

CREATE INDEX IF NOT EXISTS idx_collab_meetings_project
  ON collab_meetings(project_id, start_time);

CREATE INDEX IF NOT EXISTS idx_meeting_participants_user
  ON meeting_participants(user_id);
