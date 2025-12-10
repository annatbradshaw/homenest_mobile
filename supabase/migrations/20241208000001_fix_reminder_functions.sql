-- First, unschedule old cron jobs
SELECT cron.unschedule('send-todo-reminders');
SELECT cron.unschedule('send-stage-reminders');

-- Update todo due reminder function to use user's custom daysBefore setting
CREATE OR REPLACE FUNCTION send_todo_due_reminders()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  todo_record RECORD;
  user_prefs JSONB;
  days_before INTEGER;
  edge_function_url TEXT := 'https://xcueqjasyxutnkvhhkxj.supabase.co/functions/v1/send-notification';
  service_role_key TEXT;
BEGIN
  SELECT decrypted_secret INTO service_role_key
  FROM vault.decrypted_secrets
  WHERE name = 'service_role_key'
  LIMIT 1;

  IF service_role_key IS NULL THEN
    RAISE NOTICE 'Service role key not found in vault';
    RETURN;
  END IF;

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

    -- Get user's custom days before setting (default 1)
    days_before := COALESCE((user_prefs->>'todoReminderDaysBefore')::integer, 1);

    -- Check if due date matches the user's reminder window
    IF todo_record.due_date::date = (CURRENT_DATE + days_before)::date THEN
      PERFORM net.http_post(
        url := edge_function_url,
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || service_role_key
        ),
        body := jsonb_build_object(
          'userId', todo_record.user_id,
          'type', 'todo_due_reminder',
          'title', 'Task Due Soon: ' || todo_record.todo_title,
          'body', 'Your task "' || todo_record.todo_title || '" is due ' ||
                  CASE
                    WHEN days_before = 1 THEN 'tomorrow'
                    ELSE 'in ' || days_before || ' days'
                  END,
          'data', jsonb_build_object(
            'projectId', todo_record.project_id,
            'projectName', todo_record.project_name,
            'relatedId', todo_record.todo_id
          ),
          'relatedType', 'todo',
          'relatedId', todo_record.todo_id
        )
      );
    END IF;
  END LOOP;
END;
$$;

-- New function to send overdue todo reminders using user's frequency setting
CREATE OR REPLACE FUNCTION send_overdue_todo_reminders()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  todo_record RECORD;
  user_prefs JSONB;
  reminder_frequency INTEGER;
  days_overdue INTEGER;
  edge_function_url TEXT := 'https://xcueqjasyxutnkvhhkxj.supabase.co/functions/v1/send-notification';
  service_role_key TEXT;
BEGIN
  SELECT decrypted_secret INTO service_role_key
  FROM vault.decrypted_secrets
  WHERE name = 'service_role_key'
  LIMIT 1;

  IF service_role_key IS NULL THEN
    RAISE NOTICE 'Service role key not found in vault';
    RETURN;
  END IF;

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

    -- Get user's reminder frequency (default 1 = daily)
    reminder_frequency := COALESCE((user_prefs->>'overdueReminderFrequency')::integer, 1);
    days_overdue := todo_record.days_past_due;

    -- Send reminder based on user's frequency setting
    -- e.g., frequency=1 sends daily, frequency=2 sends every 2 days, etc.
    IF days_overdue > 0 AND (days_overdue % reminder_frequency) = 0 THEN
      PERFORM net.http_post(
        url := edge_function_url,
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || service_role_key
        ),
        body := jsonb_build_object(
          'userId', todo_record.user_id,
          'type', 'todo_overdue',
          'title', 'Overdue: ' || todo_record.todo_title,
          'body', 'Your task "' || todo_record.todo_title || '" is ' ||
                  CASE
                    WHEN days_overdue = 1 THEN '1 day overdue'
                    ELSE days_overdue || ' days overdue'
                  END || '. Please complete or reschedule it.',
          'data', jsonb_build_object(
            'projectId', todo_record.project_id,
            'projectName', todo_record.project_name,
            'relatedId', todo_record.todo_id,
            'daysOverdue', days_overdue
          ),
          'relatedType', 'todo',
          'relatedId', todo_record.todo_id
        )
      );
    END IF;
  END LOOP;
END;
$$;

-- Update stage reminder to use user's custom daysBefore setting
CREATE OR REPLACE FUNCTION send_stage_starting_reminders()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  stage_record RECORD;
  user_prefs JSONB;
  days_before INTEGER;
  edge_function_url TEXT := 'https://xcueqjasyxutnkvhhkxj.supabase.co/functions/v1/send-notification';
  service_role_key TEXT;
BEGIN
  SELECT decrypted_secret INTO service_role_key
  FROM vault.decrypted_secrets
  WHERE name = 'service_role_key'
  LIMIT 1;

  IF service_role_key IS NULL THEN
    RAISE NOTICE 'Service role key not found in vault';
    RETURN;
  END IF;

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

    -- Get user's custom days before setting (default 3)
    days_before := COALESCE((user_prefs->>'stageStartingDaysBefore')::integer, 3);

    -- Check if start date matches the user's reminder window
    IF stage_record.planned_start_date::date = (CURRENT_DATE + days_before)::date THEN
      PERFORM net.http_post(
        url := edge_function_url,
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || service_role_key
        ),
        body := jsonb_build_object(
          'userId', stage_record.user_id,
          'type', 'stage_starting',
          'title', 'Stage Starting Soon: ' || stage_record.stage_name,
          'body', 'The "' || stage_record.stage_name || '" stage is scheduled to start ' ||
                  CASE
                    WHEN days_before = 1 THEN 'tomorrow'
                    ELSE 'in ' || days_before || ' days'
                  END,
          'data', jsonb_build_object(
            'projectId', stage_record.project_id,
            'projectName', stage_record.project_name,
            'relatedId', stage_record.stage_id
          ),
          'relatedType', 'stage',
          'relatedId', stage_record.stage_id
        )
      );
    END IF;
  END LOOP;
END;
$$;

-- Re-schedule the cron jobs
SELECT cron.schedule(
  'send-todo-reminders',
  '0 9 * * *',
  'SELECT send_todo_due_reminders();'
);

SELECT cron.schedule(
  'send-stage-reminders',
  '0 9 * * *',
  'SELECT send_stage_starting_reminders();'
);

SELECT cron.schedule(
  'send-overdue-todo-reminders',
  '0 9 * * *',
  'SELECT send_overdue_todo_reminders();'
);
