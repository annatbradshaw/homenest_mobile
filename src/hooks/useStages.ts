import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../stores/AuthContext';
import {
  Stage,
  CreateStageRequest,
  UpdateStageRequest,
} from '../types/database';

const STAGES_KEY = 'stages';
const PROJECTS_KEY = 'projects';

export function useStages(projectId: string | undefined) {
  const { currentTenant } = useAuth();

  return useQuery({
    queryKey: [STAGES_KEY, projectId, currentTenant?.id],
    queryFn: async () => {
      if (!projectId || !currentTenant?.id) return [];

      const { data, error } = await supabase
        .from('stages')
        .select('*')
        .eq('project_id', projectId)
        .eq('tenant_id', currentTenant.id)
        .order('planned_start_date', { ascending: true });

      if (error) throw error;
      return data as Stage[];
    },
    enabled: !!projectId && !!currentTenant?.id,
  });
}

export function useStage(stageId: string | undefined) {
  const { currentTenant } = useAuth();

  return useQuery({
    queryKey: [STAGES_KEY, 'detail', stageId, currentTenant?.id],
    queryFn: async () => {
      if (!stageId || !currentTenant?.id) return null;

      const { data, error } = await supabase
        .from('stages')
        .select('*')
        .eq('id', stageId)
        .eq('tenant_id', currentTenant.id)
        .single();

      if (error) throw error;
      return data as Stage;
    },
    enabled: !!stageId && !!currentTenant?.id,
  });
}

export function useCreateStage() {
  const queryClient = useQueryClient();
  const { user, currentTenant } = useAuth();

  return useMutation({
    mutationFn: async (stage: CreateStageRequest) => {
      if (!currentTenant?.id) {
        throw new Error('No tenant selected');
      }

      const { data, error } = await supabase
        .from('stages')
        .insert({
          ...stage,
          tenant_id: currentTenant.id,
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Stage;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [STAGES_KEY, data.project_id] });
      queryClient.invalidateQueries({ queryKey: [PROJECTS_KEY, data.project_id] });
    },
  });
}

export function useUpdateStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: UpdateStageRequest;
    }) => {
      const { data, error } = await supabase
        .from('stages')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Stage;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [STAGES_KEY, data.project_id] });
      queryClient.invalidateQueries({ queryKey: [STAGES_KEY, 'detail', data.id] });
      queryClient.invalidateQueries({ queryKey: [PROJECTS_KEY, data.project_id] });
    },
  });
}

export function useDeleteStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (stageId: string) => {
      // First get the stage to know the project_id for cache invalidation
      const { data: stage } = await supabase
        .from('stages')
        .select('project_id')
        .eq('id', stageId)
        .single();

      const { error } = await supabase.from('stages').delete().eq('id', stageId);

      if (error) throw error;
      return stage?.project_id;
    },
    onSuccess: (projectId) => {
      if (projectId) {
        queryClient.invalidateQueries({ queryKey: [STAGES_KEY, projectId] });
        queryClient.invalidateQueries({ queryKey: [PROJECTS_KEY, projectId] });
      }
    },
  });
}
