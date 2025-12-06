// Supabase Edge Function: invite-to-project
// Sends invitation emails for project collaboration
// Security: Validates inviter has permission to invite to the project

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface InviteRequest {
  projectMemberId: string  // ID of the project_members record
  projectId: string
}

// Email template for project invitation
function getEmailTemplate(
  projectName: string,
  inviterName: string,
  role: string,
  accessDescription: string,
  acceptUrl: string
): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Project Invitation</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #F8FAFC;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background: linear-gradient(135deg, #10B981 0%, #059669 100%);
      padding: 40px 20px;
      text-align: center;
    }
    .header-text {
      color: #ffffff;
      font-size: 24px;
      font-weight: 600;
      margin: 0;
    }
    .content {
      padding: 40px 30px;
    }
    .greeting {
      font-size: 18px;
      color: #0F172A;
      margin-bottom: 20px;
      font-weight: 600;
    }
    .message {
      font-size: 16px;
      color: #64748B;
      line-height: 1.6;
      margin-bottom: 20px;
    }
    .highlight-box {
      background-color: #F0FDF4;
      border: 1px solid #86EFAC;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
    }
    .highlight-title {
      font-size: 18px;
      font-weight: 600;
      color: #166534;
      margin: 0 0 10px 0;
    }
    .highlight-detail {
      font-size: 14px;
      color: #15803D;
      margin: 5px 0;
    }
    .button {
      display: inline-block;
      padding: 14px 32px;
      background-color: #10B981;
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
    }
    .button-container {
      text-align: center;
      margin: 30px 0;
    }
    .alternative {
      font-size: 14px;
      color: #94A3B8;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #E2E8F0;
    }
    .link {
      color: #10B981;
      word-break: break-all;
    }
    .footer {
      background-color: #F8FAFC;
      padding: 30px;
      text-align: center;
      color: #94A3B8;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <img src="https://xcueqjasyxutnkvhhkxj.supabase.co/storage/v1/object/public/logos/main_logo_transparent.png" alt="HomeNest" style="max-width: 160px; height: auto; margin-bottom: 16px;">
      <h1 class="header-text">You're Invited to Collaborate!</h1>
    </div>

    <div class="content">
      <p class="greeting">Hello!</p>

      <p class="message">
        <strong>${inviterName}</strong> has invited you to collaborate on their renovation project in HomeNest.
      </p>

      <div class="highlight-box">
        <p class="highlight-title">${projectName}</p>
        <p class="highlight-detail"><strong>Your Role:</strong> ${role}</p>
        <p class="highlight-detail"><strong>Access:</strong> ${accessDescription}</p>
      </div>

      <p class="message">
        As a collaborator, you'll be able to view project details, upload documents, and track expenses for the stages you have access to.
      </p>

      <div class="button-container">
        <a href="${acceptUrl}" class="button">Accept Invitation</a>
      </div>

      <p class="message" style="font-size: 14px;">
        This invitation will expire in 7 days. If you didn't expect this invitation, you can safely ignore this email.
      </p>

      <div class="alternative">
        <p><strong>Having trouble with the button?</strong></p>
        <p>Copy and paste this link into your browser:</p>
        <p class="link">${acceptUrl}</p>
      </div>
    </div>

    <div class="footer">
      <p>Need help? Contact us at support@app.gethomenest.com</p>
      <p style="margin-top: 15px; color: #CBD5E1;">
        HomeNest - Home Renovation Project Management
      </p>
    </div>
  </div>
</body>
</html>
`
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse request body
    const { projectMemberId, projectId }: InviteRequest = await req.json()

    if (!projectMemberId || !projectId) {
      return new Response(
        JSON.stringify({ error: 'Missing projectMemberId or projectId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Supabase client with admin privileges for email sending
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    )

    // Initialize Supabase client with user's auth token for permission checks
    const supabaseUser = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    )

    // Get the current user
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser()
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Authentication failed' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get the project member record
    const { data: projectMember, error: memberError } = await supabaseAdmin
      .from('project_members')
      .select(`
        *,
        projects:project_id(id, name, tenant_id),
        suppliers:linked_supplier_id(id, name, stage_ids)
      `)
      .eq('id', projectMemberId)
      .single()

    if (memberError || !projectMember) {
      return new Response(
        JSON.stringify({ error: 'Project member not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify the inviter has permission (must be tenant member with manager+ role)
    const { data: inviterMembership, error: inviterError } = await supabaseAdmin
      .from('tenant_memberships')
      .select('role')
      .eq('tenant_id', projectMember.projects.tenant_id)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (inviterError || !inviterMembership) {
      return new Response(
        JSON.stringify({ error: 'You do not have permission to invite to this project' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const allowedRoles = ['owner', 'admin', 'manager']
    if (!allowedRoles.includes(inviterMembership.role)) {
      return new Response(
        JSON.stringify({ error: 'You must be a manager or higher to invite collaborators' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get inviter's profile for the email
    const { data: inviterProfile } = await supabaseAdmin
      .from('user_profiles')
      .select('first_name, last_name')
      .eq('id', user.id)
      .single()

    const inviterName = inviterProfile?.first_name && inviterProfile?.last_name
      ? `${inviterProfile.first_name} ${inviterProfile.last_name}`
      : user.email?.split('@')[0] || 'A HomeNest user'

    // Determine access description
    let accessDescription = 'Full project access'
    if (projectMember.linked_supplier_id && projectMember.suppliers) {
      const stageCount = projectMember.suppliers.stage_ids?.length || 0
      accessDescription = `Linked to ${projectMember.suppliers.name} (${stageCount} stage${stageCount !== 1 ? 's' : ''})`
    } else if (projectMember.allowed_stage_ids?.length) {
      const stageCount = projectMember.allowed_stage_ids.length
      accessDescription = `${stageCount} specific stage${stageCount !== 1 ? 's' : ''}`
    }

    // Role display name
    const roleNames: Record<string, string> = {
      owner: 'Owner',
      admin: 'Admin',
      manager: 'Manager',
      contractor: 'Contractor',
      viewer: 'Viewer',
    }
    const roleDisplay = roleNames[projectMember.role] || projectMember.role

    // Build acceptance URL
    const baseUrl = Deno.env.get('SITE_URL') || 'http://localhost:5173'
    const acceptUrl = `${baseUrl}/accept-invitation?token=${projectMember.invitation_token}&type=project`

    // Generate email HTML
    const emailHtml = getEmailTemplate(
      projectMember.projects.name,
      inviterName,
      roleDisplay,
      accessDescription,
      acceptUrl
    )

    // Send email using Resend (or other email service)
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) {
      console.warn('RESEND_API_KEY not configured, skipping email send')
      return new Response(
        JSON.stringify({
          success: true,
          warning: 'Email service not configured',
          acceptUrl // Return URL so it can be shared manually
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'HomeNest <invitations@app.gethomenest.com>',
        to: [projectMember.invitation_email],
        subject: `You've been invited to collaborate on "${projectMember.projects.name}"`,
        html: emailHtml,
      }),
    })

    if (!emailResponse.ok) {
      const emailError = await emailResponse.text()
      console.error('Email send failed:', emailError)
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to send invitation email',
          acceptUrl // Return URL so it can be shared manually
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Invitation sent successfully'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Invite error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
