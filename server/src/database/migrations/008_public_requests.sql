-- Public contact and access-request intake, with administrator review tracking.
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(180) NOT NULL,
  organization VARCHAR(180) NOT NULL,
  subject VARCHAR(80) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'read', 'closed')),
  reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_contact_message_review_state
    CHECK (
      (status = 'new' AND reviewed_at IS NULL)
      OR (status IN ('read', 'closed') AND reviewed_at IS NOT NULL)
    )
);

CREATE INDEX IF NOT EXISTS idx_contact_messages_status_created
  ON contact_messages (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_messages_email_lower
  ON contact_messages (lower(email));

CREATE TABLE IF NOT EXISTS access_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(180) NOT NULL,
  organization VARCHAR(180) NOT NULL,
  job_title VARCHAR(120) NOT NULL,
  phone VARCHAR(30),
  reason TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  review_note VARCHAR(1000),
  approved_role VARCHAR(50) REFERENCES roles(name),
  invitation_id UUID UNIQUE REFERENCES user_invitations(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_access_request_review_state
    CHECK (
      (status = 'pending'
        AND reviewed_by IS NULL
        AND reviewed_at IS NULL
        AND approved_role IS NULL
        AND invitation_id IS NULL)
      OR (status = 'approved'
        AND reviewed_by IS NOT NULL
        AND reviewed_at IS NOT NULL
        AND approved_role IS NOT NULL
        AND approved_role <> 'system_admin'
        AND invitation_id IS NOT NULL)
      OR (status = 'rejected'
        AND reviewed_by IS NOT NULL
        AND reviewed_at IS NOT NULL
        AND approved_role IS NULL
        AND invitation_id IS NULL)
    )
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_access_requests_pending_email
  ON access_requests (lower(email))
  WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_access_requests_status_created
  ON access_requests (status, created_at DESC);
