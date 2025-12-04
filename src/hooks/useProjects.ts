import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../stores/AuthContext';
import {
  Project,
  CreateProjectRequest,
  UpdateProjectRequest,
} from '../types/database';

const PROJECTS_KEY = 'projects';

export function useProjects() {
  const { currentTenant } = useAuth();

  return useQuery({
    queryKey: [PROJECTS_KEY, currentTenant?.id],
    queryFn: async () => {
      if (!currentTenant?.id) return [];

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('tenant_id', currentTenant.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data as Project[];
    },
    enabled: !!currentTenant?.id,
  });
}

export function useProject(projectId: string | undefined) {
  return useQuery({
    queryKey: [PROJECTS_KEY, projectId],
    queryFn: async () => {
      if (!projectId) return null;

      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          stages(*),
          todos(*),
          expenses(*),
          suppliers(*)
        `)
        .eq('id', projectId)
        .single();

      if (error) throw error;
      return data as Project;
    },
    enabled: !!projectId,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  const { currentTenant, user } = useAuth();

  return useMutation({
    mutationFn: async (project: CreateProjectRequest) => {
      if (!currentTenant?.id || !user?.id) {
        throw new Error('No tenant or user selected');
      }

      const { data, error } = await supabase
        .from('projects')
        .insert({
          ...project,
          tenant_id: currentTenant.id,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Project;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROJECTS_KEY] });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: UpdateProjectRequest;
    }) => {
      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Project;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [PROJECTS_KEY] });
      queryClient.invalidateQueries({ queryKey: [PROJECTS_KEY, data.id] });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (projectId: string) => {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROJECTS_KEY] });
    },
  });
}
