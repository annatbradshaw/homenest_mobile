-- Migration: Add foreign keys to user_profiles for PostgREST embedded resources
--
-- The project_members table has FKs to auth.users for user_id and invited_by.
-- However, PostgREST requires explicit FKs to user_profiles for embedded joins to work.
-- This migration adds the necessary relationships.

-- ============================================================================
-- PART 1: ADD FOREIGN KEYS TO USER_PROFILES
-- ============================================================================

-- Add FK from project_members.user_id to user_profiles.id
-- Note: This is in addition to the existing FK to auth.users
ALTER TABLE project_members
ADD CONSTRAINT project_members_user_profile_fkey
FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE;

-- Add FK from project_members.invited_by to user_profiles.id
ALTER TABLE project_members
ADD CONSTRAINT project_members_inviter_profile_fkey
FOREIGN KEY (invited_by) REFERENCES user_profiles(id) ON DELETE SET NULL;

-- ============================================================================
-- PART 2: ADD COLLABORATORS TRANSLATIONS (for documentation)
-- ============================================================================
-- Note: Translation keys to add to src/locales/*/settings.json:
-- - "collaborators": "Collaborators" / "Współpracownicy"
-- - "externalCollaborators": "External Collaborators" / "Zewnętrzni współpracownicy"
-- - "inviteCollaborator": "Invite Collaborator" / "Zaproś współpracownika"
-- - "noCollaborators": "No external collaborators yet" / "Brak zewnętrznych współpracowników"
-- - "stageAccess": "Stage Access" / "Dostęp do etapów"
-- - "allStages": "All Stages" / "Wszystkie etapy"
-- - "resendInvitation": "Resend Invitation" / "Wyślij ponownie zaproszenie"
-- - "revokeAccess": "Revoke Access" / "Cofnij dostęp"
-- - "expires": "Expires" / "Wygasa"
-- - "expired": "Expired" / "Wygasło"

-- ============================================================================
-- PART 3: VERIFICATION
-- ============================================================================

DO $$
BEGIN
    -- Verify FK to user_profiles exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'project_members_user_profile_fkey'
    ) THEN
        RAISE EXCEPTION 'project_members_user_profile_fkey not created';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'project_members_inviter_profile_fkey'
    ) THEN
        RAISE EXCEPTION 'project_members_inviter_profile_fkey not created';
    END IF;

    RAISE NOTICE 'Migration verified successfully';
END $$;
