import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";
const RESEND_API_URL = "https://api.resend.com/emails";
const MAX_RETRIES = 3;
const BATCH_SIZE = 10;

interface QueueMessage {
  msg_id: number;
  read_ct: number;
  message: NotificationPayload;
}

interface NotificationPayload {
  userId: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  relatedType?: string;
  relatedId?: string;
}

interface UserPreferences {
  pushEnabled: boolean;
  emailEnabled: boolean;
  todoReminders: boolean;
  overdueReminders: boolean;
  stageUpdates: boolean;
  stageStarting: boolean;
  stageCompleted: boolean;
  budgetAlerts: boolean;
  budgetWarning: boolean;
  budgetExceeded: boolean;
}

// Escape HTML to prevent XSS
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Generate branded HTML email template
function generateEmailHtml(title: string, body: string, data?: Record<string, unknown>): string {
  const safeTitle = escapeHtml(title);
  const safeBody = escapeHtml(body);
  const projectName = data?.projectName ? escapeHtml(String(data.projectName)) : "";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeTitle}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); padding: 32px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">HomeNest</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              ${projectName ? `<p style="margin: 0 0 8px 0; color: #6366f1; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">${projectName}</p>` : ""}
              <h2 style="margin: 0 0 16px 0; color: #1f2937; font-size: 24px; font-weight: 600;">${safeTitle}</h2>
              <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">${safeBody}</p>
              <a href="homenest://open" style="display: inline-block; background-color: #6366f1; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px;">Open in App</a>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 40px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #9ca3af; font-size: 14px; text-align: center;">
                You received this email because you have notifications enabled in HomeNest.
                <br>
                <a href="homenest://settings/notifications" style="color: #6366f1; text-decoration: none;">Manage notification settings</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// Send push notification via Expo
async function sendPushNotification(
  tokens: string[],
  title: string,
  body: string,
  data?: Record<string, unknown>
): Promise<{ success: boolean; error?: string }> {
  const EXPO_ACCESS_TOKEN = Deno.env.get("EXPO_ACCESS_TOKEN");

  if (!EXPO_ACCESS_TOKEN) {
    return { success: false, error: "EXPO_ACCESS_TOKEN not configured" };
  }

  const messages = tokens.map((token) => ({
    to: token,
    sound: "default",
    title,
    body,
    data,
    priority: "high",
    channelId: "default",
  }));

  try {
    const response = await fetch(EXPO_PUSH_URL, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": `Bearer ${EXPO_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(messages),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { success: false, error: `Expo API error: ${errorText}` };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: `Push failed: ${error.message}` };
  }
}

// Send email via Resend
async function sendEmail(
  to: string,
  title: string,
  body: string,
  data?: Record<string, unknown>
): Promise<{ success: boolean; error?: string }> {
  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "HomeNest <notifications@gethomenest.com>";

  if (!RESEND_API_KEY) {
    return { success: false, error: "RESEND_API_KEY not configured" };
  }

  try {
    const response = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [to],
        subject: title,
        html: generateEmailHtml(title, body, data),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { success: false, error: `Resend API error: ${errorText}` };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: `Email failed: ${error.message}` };
  }
}

// Check if notification type is enabled in user preferences
function isNotificationTypeEnabled(type: string, prefs: UserPreferences): boolean {
  switch (type) {
    case "todo_due_reminder":
      return prefs.todoReminders;
    case "todo_overdue":
      return prefs.overdueReminders;
    case "stage_starting":
      return prefs.stageStarting ?? prefs.stageUpdates;
    case "stage_completed":
      return prefs.stageCompleted ?? prefs.stageUpdates;
    case "budget_warning":
      return prefs.budgetWarning ?? prefs.budgetAlerts;
    case "budget_exceeded":
      return prefs.budgetExceeded ?? prefs.budgetAlerts;
    default:
      return true;
  }
}

// Check for existing notification to prevent duplicates
async function hasDuplicateNotification(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  type: string,
  relatedId: string | undefined,
  channel: string
): Promise<boolean> {
  if (!relatedId) return false;

  const today = new Date().toISOString().split("T")[0];

  const { data } = await supabase
    .from("notifications")
    .select("id")
    .eq("user_id", userId)
    .eq("type", type)
    .eq("related_id", relatedId)
    .eq("channel", channel)
    .gte("created_at", today)
    .limit(1);

  return (data?.length ?? 0) > 0;
}

// Process a single notification
async function processNotification(
  supabase: ReturnType<typeof createClient>,
  payload: NotificationPayload
): Promise<{ success: boolean; error?: string }> {
  const { userId, type, title, body, data, relatedType, relatedId } = payload;

  // Get user data
  const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);

  if (userError || !userData.user) {
    return { success: false, error: "User not found" };
  }

  const userEmail = userData.user.email;

  // Get user preferences
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("preferences")
    .eq("id", userId)
    .single();

  const defaultPrefs: UserPreferences = {
    pushEnabled: true,
    emailEnabled: true,
    todoReminders: true,
    overdueReminders: true,
    stageUpdates: true,
    stageStarting: true,
    stageCompleted: true,
    budgetAlerts: true,
    budgetWarning: true,
    budgetExceeded: true,
  };

  const prefs: UserPreferences = profile?.preferences?.notifications || defaultPrefs;

  // Check if this notification type is enabled
  if (!isNotificationTypeEnabled(type, prefs)) {
    return { success: true }; // Not an error, just skipped
  }

  let hasError = false;

  // Send push notification if enabled
  if (prefs.pushEnabled) {
    const hasDuplicate = await hasDuplicateNotification(supabase, userId, type, relatedId, "push");

    if (!hasDuplicate) {
      const { data: tokens } = await supabase
        .from("push_tokens")
        .select("token")
        .eq("user_id", userId)
        .eq("is_active", true);

      if (tokens && tokens.length > 0) {
        const pushTokens = tokens.map((t) => t.token);
        const result = await sendPushNotification(pushTokens, title, body, data);

        await supabase.from("notifications").insert({
          user_id: userId,
          type,
          title,
          body,
          data,
          channel: "push",
          status: result.success ? "sent" : "failed",
          sent_at: result.success ? new Date().toISOString() : null,
          error_message: result.error,
          related_type: relatedType,
          related_id: relatedId,
        });

        if (!result.success) hasError = true;
      }
    }
  }

  // Send email notification if enabled
  if (prefs.emailEnabled && userEmail) {
    const hasDuplicate = await hasDuplicateNotification(supabase, userId, type, relatedId, "email");

    if (!hasDuplicate) {
      const result = await sendEmail(userEmail, title, body, data);

      await supabase.from("notifications").insert({
        user_id: userId,
        type,
        title,
        body,
        data,
        channel: "email",
        status: result.success ? "sent" : "failed",
        sent_at: result.success ? new Date().toISOString() : null,
        error_message: result.error,
        related_type: relatedType,
        related_id: relatedId,
      });

      if (!result.success) hasError = true;
    }
  }

  return { success: !hasError };
}

Deno.serve(async (req: Request) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Read messages from queue with 30 second visibility timeout
    const { data: messages, error: readError } = await supabase.rpc("pgmq_read", {
      queue_name: "notifications",
      vt: 30,
      qty: BATCH_SIZE,
    });

    if (readError) {
      // Try alternative: direct SQL query
      const { data: messagesAlt, error: altError } = await supabase
        .from("pgmq.q_notifications")
        .select("msg_id, read_ct, message")
        .limit(BATCH_SIZE);

      if (altError) {
        console.error("Failed to read queue:", altError);
        return new Response(
          JSON.stringify({ error: "Failed to read queue", details: altError.message }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    const queueMessages: QueueMessage[] = messages || [];

    if (queueMessages.length === 0) {
      return new Response(
        JSON.stringify({ message: "No messages to process" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    const results: { msgId: number; success: boolean; error?: string }[] = [];

    for (const msg of queueMessages) {
      const payload = msg.message;

      // Check retry count
      if (msg.read_ct > MAX_RETRIES) {
        // Move to dead letter / archive
        await supabase.rpc("pgmq_archive", {
          queue_name: "notifications",
          msg_id: msg.msg_id,
        });
        results.push({ msgId: msg.msg_id, success: false, error: "Max retries exceeded" });
        continue;
      }

      try {
        const result = await processNotification(supabase, payload);

        if (result.success) {
          // Delete successfully processed message
          await supabase.rpc("pgmq_delete", {
            queue_name: "notifications",
            msg_id: msg.msg_id,
          });
          results.push({ msgId: msg.msg_id, success: true });
        } else {
          // Leave in queue for retry (visibility timeout will expire)
          results.push({ msgId: msg.msg_id, success: false, error: result.error });
        }
      } catch (error) {
        console.error(`Error processing message ${msg.msg_id}:`, error);
        results.push({ msgId: msg.msg_id, success: false, error: error.message });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const failCount = results.filter((r) => !r.success).length;

    return new Response(
      JSON.stringify({
        processed: queueMessages.length,
        success: successCount,
        failed: failCount,
        results,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (error) {
    console.error("Error in process-notification-queue:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
});
