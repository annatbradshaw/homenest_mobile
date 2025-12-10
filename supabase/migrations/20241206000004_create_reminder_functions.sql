-- Function to send todo due reminders
-- Checks for todos due within the user's configured reminder timing window
CREATE OR REPLACE FUNCTION send_todo_due_reminders()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  todo_record RECORD;
  user_prefs JSONB;
  reminder_interval INTERVAL;
  edge_function_url TEXT := 'https://xcueqjasyxutnkvhhkxj.supabase.co/functions/v1/send-notification';
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

  -- Loop through todos that need reminders
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
    -- Get user's reminder timing preference
    user_prefs := COALESCE(todo_record.preferences->'notifications', '{}'::jsonb);

    -- Skip if todo reminders are disabled
    IF NOT COALESCE((user_prefs->>'todoReminders')::boolean, true) THEN
      CONTINUE;
    END IF;

    -- Determine reminder interval based on user preference
    reminder_interval := CASE COALESCE(user_prefs->>'reminderTiming', '1day')
      WHEN '1day' THEN INTERVAL '1 day'
      WHEN '3days' THEN INTERVAL '3 days'
      WHEN '1week' THEN INTERVAL '7 days'
      WHEN '2weeks' THEN INTERVAL '14 days'
      ELSE INTERVAL '1 day'
    END;

    -- Check if due date is within the reminder window
    IF todo_record.due_date::date = (CURRENT_DATE + reminder_interval)::date THEN
      -- Send notification via pg_net
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
                    WHEN reminder_interval = INTERVAL '1 day' THEN 'tomorrow'
                    WHEN reminder_interval = INTERVAL '3 days' THEN 'in 3 days'
                    WHEN reminder_interval = INTERVAL '7 days' THEN 'in 1 week'
                    WHEN reminder_interval = INTERVAL '14 days' THEN 'in 2 weeks'
                    ELSE 'soon'
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

-- Function to send stage starting reminders
CREATE OR REPLACE FUNCTION send_stage_starting_reminders()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  stage_record RECORD;
  user_prefs JSONB;
  reminder_interval INTERVAL;
  edge_function_url TEXT := 'https://xcueqjasyxutnkvhhkxj.supabase.co/functions/v1/send-notification';
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

  -- Loop through stages that are about to start
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

    -- Skip if stage updates are disabled
    IF NOT COALESCE((user_prefs->>'stageUpdates')::boolean, true) THEN
      CONTINUE;
    END IF;

    reminder_interval := CASE COALESCE(user_prefs->>'reminderTiming', '1day')
      WHEN '1day' THEN INTERVAL '1 day'
      WHEN '3days' THEN INTERVAL '3 days'
      WHEN '1week' THEN INTERVAL '7 days'
      WHEN '2weeks' THEN INTERVAL '14 days'
      ELSE INTERVAL '1 day'
    END;

    -- Check if start date is within the reminder window
    IF stage_record.planned_start_date::date = (CURRENT_DATE + reminder_interval)::date THEN
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
                    WHEN reminder_interval = INTERVAL '1 day' THEN 'tomorrow'
                    WHEN reminder_interval = INTERVAL '3 days' THEN 'in 3 days'
                    WHEN reminder_interval = INTERVAL '7 days' THEN 'in 1 week'
                    WHEN reminder_interval = INTERVAL '14 days' THEN 'in 2 weeks'
                    ELSE 'soon'
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

-- Schedule the reminder functions to run daily at 9 AM UTC
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
