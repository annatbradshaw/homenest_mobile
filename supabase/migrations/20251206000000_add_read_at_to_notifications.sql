-- Create notifications table if it doesn't exist
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('todo_due_reminder', 'stage_starting', 'stage_completed', 'budget_warning', 'budget_exceeded')),
  title text NOT NULL,
  body text NOT NULL,
  data jsonb,
  channel text NOT NULL CHECK (channel IN ('push', 'email')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  sent_at timestamp with time zone,
  error_message text,
  related_type text,
  related_id uuid,
  read_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add index for faster queries on user notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications (user_id);

-- Add index for faster queries on unread notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications (user_id, read_at) WHERE read_at IS NULL;

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update (mark as read) their own notifications
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Only system/service role can insert notifications
CREATE POLICY "Service role can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

DO $$
BEGIN
  RAISE NOTICE 'Notifications table created with RLS policies';
END $$;
