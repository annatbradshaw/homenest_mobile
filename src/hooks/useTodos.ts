import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../stores/AuthContext';
import { Todo, CreateTodoRequest, UpdateTodoRequest } from '../types/database';

const TODOS_KEY = 'todos';
const PROJECTS_KEY = 'projects';

export function useTodos(projectId: string | undefined) {
  const { currentTenant } = useAuth();

  return useQuery({
    queryKey: [TODOS_KEY, projectId, currentTenant?.id],
    queryFn: async () => {
      if (!projectId || !currentTenant?.id) return [];

      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .eq('project_id', projectId)
        .eq('tenant_id', currentTenant.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Todo[];
    },
    enabled: !!projectId && !!currentTenant?.id,
  });
}

export function useTodo(todoId: string | undefined) {
  const { currentTenant } = useAuth();

  return useQuery({
    queryKey: [TODOS_KEY, 'detail', todoId, currentTenant?.id],
    queryFn: async () => {
      if (!todoId || !currentTenant?.id) return null;

      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .eq('id', todoId)
        .eq('tenant_id', currentTenant.id)
        .single();

      if (error) throw error;
      return data as Todo;
    },
    enabled: !!todoId && !!currentTenant?.id,
  });
}

export function useCreateTodo() {
  const queryClient = useQueryClient();
  const { user, currentTenant } = useAuth();

  return useMutation({
    mutationFn: async (todo: CreateTodoRequest) => {
      if (!currentTenant?.id) {
        throw new Error('No tenant selected');
      }

      const { data, error } = await supabase
        .from('todos')
        .insert({
          ...todo,
          tenant_id: currentTenant.id,
          created_by: user?.id,
          is_completed: false,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Todo;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [TODOS_KEY, data.project_id] });
      queryClient.invalidateQueries({ queryKey: [PROJECTS_KEY, data.project_id] });
    },
  });
}

export function useUpdateTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: UpdateTodoRequest;
    }) => {
      const { data, error } = await supabase
        .from('todos')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Todo;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [TODOS_KEY, data.project_id] });
      queryClient.invalidateQueries({ queryKey: [TODOS_KEY, 'detail', data.id] });
      queryClient.invalidateQueries({ queryKey: [PROJECTS_KEY, data.project_id] });
    },
  });
}

export function useToggleTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      isCompleted,
    }: {
      id: string;
      isCompleted: boolean;
    }) => {
      const { data, error } = await supabase
        .from('todos')
        .update({
          is_completed: isCompleted,
          completed_at: isCompleted ? new Date().toISOString() : null,
          status: isCompleted ? 'completed' : 'todo',
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Todo;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [TODOS_KEY, data.project_id] });
      queryClient.invalidateQueries({ queryKey: [TODOS_KEY, 'detail', data.id] });
    },
  });
}

export function useDeleteTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (todoId: string) => {
      const { data: todo } = await supabase
        .from('todos')
        .select('project_id')
        .eq('id', todoId)
        .single();

      const { error } = await supabase.from('todos').delete().eq('id', todoId);

      if (error) throw error;
      return todo?.project_id;
    },
    onSuccess: (projectId) => {
      if (projectId) {
        queryClient.invalidateQueries({ queryKey: [TODOS_KEY, projectId] });
        queryClient.invalidateQueries({ queryKey: [PROJECTS_KEY, projectId] });
      }
    },
  });
}
