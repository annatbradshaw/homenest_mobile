-- Update notification functions to use new granular preference fields

-- Updated todo due reminders function
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

    IF NOT COALESCE((user_prefs->>'todoReminders')::boolean, true) THEN
      CONTINUE;
    END IF;

    -- Use new todoReminderDaysBefore field (default 1)
    days_before := COALESCE((user_prefs->>'todoReminderDaysBefore')::integer, 1);

    IF todo_record.due_date::date = (CURRENT_DATE + (days_before || ' days')::interval)::date THEN
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
                  CASE WHEN days_before = 1 THEN 'tomorrow' ELSE 'in ' || days_before || ' days' END,
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

-- New function for overdue task reminders
CREATE OR REPLACE FUNCTION send_overdue_reminders()
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
      up.preferences
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

    -- Get reminder frequency (default 1 = daily)
    reminder_frequency := COALESCE((user_prefs->>'overdueReminderFrequency')::integer, 1);
    days_overdue := CURRENT_DATE - todo_record.due_date::date;

    -- Only send if days_overdue is divisible by frequency (e.g., every 2 days)
    IF days_overdue % reminder_frequency = 0 THEN
      PERFORM net.http_post(
        url := edge_function_url,
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || service_role_key
        ),
        body := jsonb_build_object(
          'userId', todo_record.user_id,
          'type', 'todo_due_reminder',
          'title', 'Overdue Task: ' || todo_record.todo_title,
          'body', 'Your task "' || todo_record.todo_title || '" is ' || days_overdue || ' day(s) overdue',
          'data', jsonb_build_object(
            'projectId', todo_record.project_id,
            'projectName', todo_record.project_name,
            'relatedId', todo_record.todo_id,
            'isOverdue', true
          ),
          'relatedType', 'todo',
          'relatedId', todo_record.todo_id
        )
      );
    END IF;
  END LOOP;
END;
$$;

-- Updated stage starting reminders function
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
    IF NOT COALESCE((user_prefs->>'stageStarting')::boolean,
                    COALESCE((user_prefs->>'stageUpdates')::boolean, true)) THEN
      CONTINUE;
    END IF;

    -- Use new stageStartingDaysBefore field (default 3)
    days_before := COALESCE((user_prefs->>'stageStartingDaysBefore')::integer, 3);

    IF stage_record.planned_start_date::date = (CURRENT_DATE + (days_before || ' days')::interval)::date THEN
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
                  CASE WHEN days_before = 1 THEN 'tomorrow' ELSE 'in ' || days_before || ' days' END,
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

-- Add cron job for overdue reminders (runs daily at 9 AM)
SELECT cron.schedule(
  'send-overdue-reminders',
  '0 9 * * *',
  'SELECT send_overdue_reminders();'
);
