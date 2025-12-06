# Email Templates

Beautiful, branded email templates for Supabase Auth emails.

## Templates Included

1. **confirmation.html** - Email confirmation for new signups
2. **invite.html** - User invitation emails
3. **recovery.html** - Password reset emails

## Features

- ✅ Modern, responsive design
- ✅ Branded with your logo
- ✅ Color-coded by email type
- ✅ Mobile-friendly
- ✅ Clear CTAs with fallback links
- ✅ Professional footer with links

## How to Apply These Templates

### Via Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Email Templates**
3. For each template type (Confirm signup, Invite user, Reset password):
   - Click on the template
   - Copy the contents from the corresponding HTML file
   - Paste into the template editor
   - Update the footer email address and links
   - Click **Save**

### Via Supabase CLI

You can also apply templates using the Supabase CLI, but this requires additional configuration in your `config.toml`.

## Customization

### Update Contact Information

Replace `support@yourdomain.com` with your actual support email in all three templates.

### Update Footer Links

Update the footer links to point to your actual:
- Privacy Policy
- Terms of Service  
- Help Center

### Color Schemes

Each template uses a different color scheme:
- **Confirmation**: Blue gradient (#2563EB → #1E40AF) - Primary brand
- **Invite**: Green gradient (#10B981 → #059669) - Success/Welcome
- **Recovery**: Orange gradient (#F59E0B → #D97706) - Warning/Action needed

## Template Variables

Supabase automatically replaces these variables:
- `{{ .ConfirmationURL }}` - The action link for the user

## Testing

Before going live, test your email templates by:
1. Creating a test account
2. Requesting password reset
3. Inviting a test user

Verify emails look good on:
- Desktop email clients
- Mobile devices
- Gmail, Outlook, Apple Mail

## Support

If you need help customizing these templates, refer to the [Supabase Email Templates documentation](https://supabase.com/docs/guides/auth/auth-email-templates).
