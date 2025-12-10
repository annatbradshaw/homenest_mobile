-- =============================================
-- NOTIFICATION QUEUE SYSTEM WITH PGMQ
-- Replaces direct HTTP calls with queue-based processing
-- =============================================

-- 1. Enable pgmq extension
CREATE EXTENSION IF NOT EXISTS pgmq;

-- 2. Create the notifications queue
SELECT pgmq.create('notifications');

-- 3. Unschedule old cron jobs (if they exist)
DO $$
BEGIN
  PERFORM cron.unschedule('send-todo-reminders');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
  PERFORM cron.unschedule('send-stage-reminders');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
  PERFORM cron.unschedule('send-overdue-todo-reminders');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- 4. Queue todo due reminders (replaces send_todo_due_reminders)
CREATE OR REPLACE FUNCTION queue_todo_due_reminders()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  todo_record RECORD;
  user_prefs JSONB;
  days_before INTEGER;
BEGIN
  FOR todo_record IN
    SELECT
      t.id AS todo_id,
      t.title AS todo_title,
      t.due_date,
      t.project_id,
      p.name AS project_name,
      t.created_by AS user_id,
      up.preferences
    FROM todos t
    JOIN projects p ON t.project_id = p.id
    JOIN user_profiles up ON t.created_by = up.id
    WHERE t.due_date IS NOT NULL
      AND t.is_completed = false
      AND t.status != 'cancelled'
  LOOP
    user_prefs := COALESCE(todo_record.preferences->'notifications', '{}'::jsonb);

    -- Skip if todo reminders are disabled
    IF NOT COALESCE((user_prefs->>'todoReminders')::boolean, true) THEN
      CONTINUE;
    END IF;

    days_before := COALESCE((user_prefs->>'todoReminderDaysBefore')::integer, 1);

    -- Check if due date matches the user's reminder window
    IF todo_record.due_date::date = (CURRENT_DATE + days_before)::date THEN
      PERFORM pgmq.send('notifications', jsonb_build_object(
        'userId', todo_record.user_id,
        'type', 'todo_due_reminder',
        'title', 'Task Due Soon: ' || todo_record.todo_title,
        'body', 'Your task "' || todo_record.todo_title || '" is due ' ||
                CASE WHEN days_before = 1 THEN 'tomorrow' ELSE 'in ' || days_before || ' days' END,
        'data', jsonb_build_object(
          'projectId', todo_record.project_id,
          'projectName', todo_record.project_name,
          'relatedId', todo_record.todo_id
        ),
        'relatedType', 'todo',
        'relatedId', todo_record.todo_id
      ));
    END IF;
  END LOOP;
END;
$$;

-- 5. Queue overdue todo reminders (replaces send_overdue_todo_reminders)
CREATE OR REPLACE FUNCTION queue_overdue_todo_reminders()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  todo_record RECORD;
  user_prefs JSONB;
  reminder_frequency INTEGER;
  days_overdue INTEGER;
BEGIN
  FOR todo_record IN
    SELECT
      t.id AS todo_id,
      t.title AS todo_title,
      t.due_date,
      t.project_id,
      p.name AS project_name,
      t.created_by AS user_id,
      up.preferences,
      (CURRENT_DATE - t.due_date::date) AS days_past_due
    FROM todos t
    JOIN projects p ON t.project_id = p.id
    JOIN user_profiles up ON t.created_by = up.id
    WHERE t.due_date IS NOT NULL
      AND t.due_date::date < CURRENT_DATE
      AND t.is_completed = false
      AND t.status != 'cancelled'
  LOOP
    user_prefs := COALESCE(todo_record.preferences->'notifications', '{}'::jsonb);

    -- Skip if overdue reminders are disabled
    IF NOT COALESCE((user_prefs->>'overdueReminders')::boolean, true) THEN
      CONTINUE;
    END IF;

    reminder_frequency := COALESCE((user_prefs->>'overdueReminderFrequency')::integer, 1);
    days_overdue := todo_record.days_past_due;

    -- Send reminder based on user's frequency setting
    IF days_overdue > 0 AND (days_overdue % reminder_frequency) = 0 THEN
      PERFORM pgmq.send('notifications', jsonb_build_object(
        'userId', todo_record.user_id,
        'type', 'todo_overdue',
        'title', 'Overdue: ' || todo_record.todo_title,
        'body', 'Your task "' || todo_record.todo_title || '" is ' ||
                CASE WHEN days_overdue = 1 THEN '1 day overdue' ELSE days_overdue || ' days overdue' END ||
                '. Please complete or reschedule it.',
        'data', jsonb_build_object(
          'projectId', todo_record.project_id,
          'projectName', todo_record.project_name,
          'relatedId', todo_record.todo_id,
          'daysOverdue', days_overdue
        ),
        'relatedType', 'todo',
        'relatedId', todo_record.todo_id
      ));
    END IF;
  END LOOP;
END;
$$;

-- 6. Queue stage starting reminders (replaces send_stage_starting_reminders)
CREATE OR REPLACE FUNCTION queue_stage_starting_reminders()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  stage_record RECORD;
  user_prefs JSONB;
  days_before INTEGER;
BEGIN
  FOR stage_record IN
    SELECT
      s.id AS stage_id,
      s.name AS stage_name,
      s.planned_start_date,
      s.project_id,
      p.name AS project_name,
      p.created_by AS user_id,
      up.preferences
    FROM stages s
    JOIN projects p ON s.project_id = p.id
    JOIN user_profiles up ON p.created_by = up.id
    WHERE s.planned_start_date IS NOT NULL
      AND s.status = 'not-started'
  LOOP
    user_prefs := COALESCE(stage_record.preferences->'notifications', '{}'::jsonb);

    -- Skip if stage starting notifications are disabled
    IF NOT COALESCE((user_prefs->>'stageStarting')::boolean, true) THEN
      CONTINUE;
    END IF;

    days_before := COALESCE((user_prefs->>'stageStartingDaysBefore')::integer, 3);

    -- Check if start date matches the user's reminder window
    IF stage_record.planned_start_date::date = (CURRENT_DATE + days_before)::date THEN
      PERFORM pgmq.send('notifications', jsonb_build_object(
        'userId', stage_record.user_id,
        'type', 'stage_starting',
        'title', 'Stage Starting Soon: ' || stage_record.stage_name,
        'body', 'The "' || stage_record.stage_name || '" stage is scheduled to start ' ||
                CASE WHEN days_before = 1 THEN 'tomorrow' ELSE 'in ' || days_before || ' days' END,
        'data', jsonb_build_object(
          'projectId', stage_record.project_id,
          'projectName', stage_record.project_name,
          'relatedId', stage_record.stage_id
        ),
        'relatedType', 'stage',
        'relatedId', stage_record.stage_id
      ));
    END IF;
  END LOOP;
END;
$$;

-- 7. Budget alert trigger using queue (replaces check_budget_and_alert)
CREATE OR REPLACE FUNCTION check_budget_and_queue_alert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  project_record RECORD;
  budget_percentage NUMERIC;
  user_prefs JSONB;
  notification_type TEXT;
  notification_title TEXT;
  notification_body TEXT;
BEGIN
  -- Get project details with current spending
  SELECT
    p.id,
    p.name,
    p.total_budget,
    p.created_by AS user_id,
    COALESCE(SUM(e.amount), 0) AS total_spent,
    up.preferences
  INTO project_record
  FROM projects p
  LEFT JOIN expenses e ON e.project_id = p.id
  JOIN user_profiles up ON p.created_by = up.id
  WHERE p.id = NEW.project_id
  GROUP BY p.id, p.name, p.total_budget, p.created_by, up.preferences;

  -- Skip if no budget set
  IF project_record.total_budget IS NULL OR project_record.total_budget <= 0 THEN
    RETURN NEW;
  END IF;

  -- Check user preferences
  user_prefs := COALESCE(project_record.preferences->'notifications', '{}'::jsonb);

  -- Skip if budget alerts are disabled
  IF NOT COALESCE((user_prefs->>'budgetAlerts')::boolean, true) THEN
    RETURN NEW;
  END IF;

  -- Calculate budget percentage
  budget_percentage := (project_record.total_spent / project_record.total_budget) * 100;

  -- Determine notification type based on threshold
  IF budget_percentage >= 100 THEN
    notification_type := 'budget_exceeded';
    notification_title := 'Budget Exceeded: ' || project_record.name;
    notification_body := 'Your project "' || project_record.name || '" has exceeded its budget. ' ||
                        'Spent: ' || ROUND(project_record.total_spent, 2)::text ||
                        ' / Budget: ' || ROUND(project_record.total_budget, 2)::text;
  ELSIF budget_percentage >= 80 THEN
    notification_type := 'budget_warning';
    notification_title := 'Budget Warning: ' || project_record.name;
    notification_body := 'Your project "' || project_record.name || '" has used ' ||
                        ROUND(budget_percentage)::text || '% of its budget. ' ||
                        'Remaining: ' || ROUND(project_record.total_budget - project_record.total_spent, 2)::text;
  ELSE
    -- No alert needed
    RETURN NEW;
  END IF;

  -- Add to queue
  PERFORM pgmq.send('notifications', jsonb_build_object(
    'userId', project_record.user_id,
    'type', notification_type,
    'title', notification_title,
    'body', notification_body,
    'data', jsonb_build_object(
      'projectId', project_record.id,
      'projectName', project_record.name,
      'budgetPercentage', ROUND(budget_percentage),
      'totalBudget', project_record.total_budget,
      'totalSpent', project_record.total_spent
    ),
    'relatedType', 'project',
    'relatedId', project_record.id
  ));

  RETURN NEW;
END;
$$;

-- 8. Update the budget alert trigger
DROP TRIGGER IF EXISTS budget_alert_on_expense ON expenses;
CREATE TRIGGER budget_alert_on_expense
  AFTER INSERT OR UPDATE OF amount ON expenses
  FOR EACH ROW
  EXECUTE FUNCTION check_budget_and_queue_alert();

-- 9. Schedule new cron jobs for queue population (9 AM UTC)
SELECT cron.schedule(
  'queue-todo-reminders',
  '0 9 * * *',
  'SELECT queue_todo_due_reminders();'
);

SELECT cron.schedule(
  'queue-stage-reminders',
  '0 9 * * *',
  'SELECT queue_stage_starting_reminders();'
);

SELECT cron.schedule(
  'queue-overdue-reminders',
  '0 9 * * *',
  'SELECT queue_overdue_todo_reminders();'
);

-- 10. Create helper functions for pgmq operations (for Edge Function RPC calls)
CREATE OR REPLACE FUNCTION pgmq_read(queue_name text, vt integer, qty integer)
RETURNS TABLE(msg_id bigint, read_ct integer, enqueued_at timestamptz, vt timestamptz, message jsonb)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM pgmq.read(queue_name, vt, qty);
$$;

CREATE OR REPLACE FUNCTION pgmq_delete(queue_name text, msg_id bigint)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT pgmq.delete(queue_name, msg_id);
$$;

CREATE OR REPLACE FUNCTION pgmq_archive(queue_name text, msg_id bigint)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT pgmq.archive(queue_name, msg_id);
$$;

-- 11. Function to trigger queue processor Edge Function
CREATE OR REPLACE FUNCTION trigger_queue_processor()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  service_role_key TEXT;
BEGIN
  -- Get service role key from vault
  SELECT decrypted_secret INTO service_role_key
  FROM vault.decrypted_secrets
  WHERE name = 'service_role_key'
  LIMIT 1;

  IF service_role_key IS NULL THEN
    RAISE NOTICE 'Service role key not found in vault';
    RETURN;
  END IF;

  -- Call the Edge Function
  PERFORM net.http_post(
    url := 'https://xcueqjasyxutnkvhhkxj.supabase.co/functions/v1/process-notification-queue',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || service_role_key
    ),
    body := '{}'::jsonb
  );
END;
$$;

-- 12. Schedule queue processor to run every minute
SELECT cron.schedule(
  'process-notification-queue',
  '* * * * *',
  'SELECT trigger_queue_processor();'
);

-- 13. Drop old functions (cleanup)
DROP FUNCTION IF EXISTS send_todo_due_reminders();
DROP FUNCTION IF EXISTS send_overdue_todo_reminders();
DROP FUNCTION IF EXISTS send_stage_starting_reminders();
DROP FUNCTION IF EXISTS check_budget_and_alert();
