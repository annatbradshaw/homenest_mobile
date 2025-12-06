import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../stores/AuthContext';
import { useProject } from '../stores/ProjectContext';
import { InviteToProjectRequest, MemberRole } from '../types/database';

interface InviteParams {
  email: string;
  role: MemberRole;
  linkedSupplierId?: string;
  allowedStageIds?: string[];
}

export function useInviteToProject() {
  const queryClient = useQueryClient();
  const { user, currentTenant } = useAuth();
  const { currentProject } = useProject();

  return useMutation({
    mutationFn: async ({ email, role, linkedSupplierId, allowedStageIds }: InviteParams) => {
      if (!currentProject?.id) {
        throw new Error('No project selected');
      }
      if (!currentTenant?.id) {
        throw new Error('No tenant selected');
      }
      if (!user?.id) {
        throw new Error('Not authenticated');
      }

      // Generate a unique invitation token
      const token = crypto.randomUUID ? crypto.randomUUID() :
        'xxxx-xxxx-xxxx-xxxx'.replace(/x/g, () => Math.floor(Math.random() * 16).toString(16));

      // Set expiration to 7 days from now
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const { data, error } = await supabase
        .from('project_members')
        .insert({
          project_id: currentProject.id,
          invitation_email: email.toLowerCase().trim(),
          role,
          linked_supplier_id: linkedSupplierId || null,
          allowed_stage_ids: allowedStageIds || null,
          invitation_token: token,
          invitation_status: 'pending',
          invited_by: user.id,
          expires_at: expiresAt.toISOString(),
        })
        .select()
        .single();

      if (error) {
        // Check for duplicate invitation
        if (error.code === '23505') {
          throw new Error('This email has already been invited to this project');
        }
        throw error;
      }

      // Optionally trigger email notification via edge function
      // await supabase.functions.invoke('send-invitation-email', {
      //   body: { invitationId: data.id, email, projectName: currentProject.name }
      // });

      return data;
    },
    onSuccess: () => {
      // Invalidate project members queries
      queryClient.invalidateQueries({ queryKey: ['projectMembers'] });
      queryClient.invalidateQueries({ queryKey: ['teamMembers'] });
    },
  });
}

export function useProjectInvitations(projectId: string | undefined) {
  const { currentTenant } = useAuth();

  return {
    queryKey: ['projectInvitations', projectId, currentTenant?.id],
    queryFn: async () => {
      if (!projectId) return [];

      const { data, error } = await supabase
        .from('project_members')
        .select(`
          *,
          supplier:suppliers(id, name, company)
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!projectId,
  };
}
