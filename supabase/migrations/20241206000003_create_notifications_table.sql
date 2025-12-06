-- Create enum types for notifications
CREATE TYPE notification_status AS ENUM ('pending', 'sent', 'failed');
CREATE TYPE notification_channel AS ENUM ('push', 'email');
CREATE TYPE notification_type AS ENUM (
  'todo_due_reminder',
  'stage_starting',
  'stage_completed',
  'budget_warning',
  'budget_exceeded'
);

-- Create notifications table for audit/history
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  channel notification_channel NOT NULL,
  status notification_status DEFAULT 'pending',
  sent_at TIMESTAMPTZ,
  error_message TEXT,
  related_type TEXT, -- 'todo', 'stage', 'project'
  related_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for efficient queries
CREATE INDEX idx_notifications_user_created ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_status ON notifications(status) WHERE status = 'pending';
CREATE INDEX idx_notifications_related ON notifications(related_type, related_id);

-- Note: Duplicate prevention is handled in the Edge Function by checking
-- for existing notifications before inserting

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can only view their own notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Only service role can insert/update notifications (via Edge Functions)
CREATE POLICY "Service role can manage notifications"
  ON notifications FOR ALL
  USING (auth.role() = 'service_role');
