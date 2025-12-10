-- Function to check budget and send alerts
CREATE OR REPLACE FUNCTION check_budget_and_alert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  project_record RECORD;
  budget_percentage NUMERIC;
  user_prefs JSONB;
  edge_function_url TEXT := 'https://xcueqjasyxutnkvhhkxj.supabase.co/functions/v1/send-notification';
  service_role_key TEXT;
  notification_type TEXT;
  notification_title TEXT;
  notification_body TEXT;
BEGIN
  -- Get service role key from vault
  SELECT decrypted_secret INTO service_role_key
  FROM vault.decrypted_secrets
  WHERE name = 'service_role_key'
  LIMIT 1;

  IF service_role_key IS NULL THEN
    RETURN NEW;
  END IF;

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

  -- Send notification via pg_net
  PERFORM net.http_post(
    url := edge_function_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || service_role_key
    ),
    body := jsonb_build_object(
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
    )
  );

  RETURN NEW;
END;
$$;

-- Create trigger on expenses table
DROP TRIGGER IF EXISTS budget_alert_on_expense ON expenses;
CREATE TRIGGER budget_alert_on_expense
  AFTER INSERT OR UPDATE OF amount ON expenses
  FOR EACH ROW
  EXECUTE FUNCTION check_budget_and_alert();
