import { useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase, realtime } from '../lib/supabase';

type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

interface UseRealtimeOptions {
  table: string;
  filter?: string;
  event?: RealtimeEvent;
  queryKey?: string[];
  enabled?: boolean;
  debounceMs?: number;
}

export function useRealtime({
  table,
  filter,
  event = '*',
  queryKey,
  enabled = true,
  debounceMs = 100,
}: UseRealtimeOptions) {
  const queryClient = useQueryClient();
  const channelRef = useRef<any>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const invalidateQueries = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      if (queryKey) {
        queryClient.invalidateQueries({ queryKey });
      } else {
        queryClient.invalidateQueries({ queryKey: [table] });
      }
    }, debounceMs);
  }, [queryClient, queryKey, table, debounceMs]);

  useEffect(() => {
    if (!enabled) return;

    const channel = supabase
      .channel(`${table}:${filter || 'all'}`)
      .on(
        'postgres_changes',
        {
          event,
          schema: 'public',
          table,
          filter,
        },
        (payload) => {
          console.log(`Realtime update for ${table}:`, payload);
          invalidateQueries();
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [table, filter, event, enabled, invalidateQueries]);

  return {
    unsubscribe: () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    },
  };
}

// Hook for project-level real-time updates
export function useProjectRealtime(projectId: string | undefined) {
  const enabled = !!projectId;

  // Subscribe to stages
  useRealtime({
    table: 'stages',
    filter: projectId ? `project_id=eq.${projectId}` : undefined,
    queryKey: ['stages', projectId],
    enabled,
  });

  // Subscribe to todos
  useRealtime({
    table: 'todos',
    filter: projectId ? `project_id=eq.${projectId}` : undefined,
    queryKey: ['todos', projectId],
    enabled,
  });

  // Subscribe to expenses
  useRealtime({
    table: 'expenses',
    filter: projectId ? `project_id=eq.${projectId}` : undefined,
    queryKey: ['expenses', projectId],
    enabled,
  });

  // Subscribe to documents
  useRealtime({
    table: 'documents',
    filter: projectId ? `project_id=eq.${projectId}` : undefined,
    queryKey: ['documents', projectId],
    enabled,
  });

  // Subscribe to suppliers
  useRealtime({
    table: 'suppliers',
    filter: projectId ? `project_id=eq.${projectId}` : undefined,
    queryKey: ['suppliers', projectId],
    enabled,
  });
}

// Hook for tenant-level real-time updates
export function useTenantRealtime(tenantId: string | undefined) {
  const enabled = !!tenantId;

  // Subscribe to projects
  useRealtime({
    table: 'projects',
    filter: tenantId ? `tenant_id=eq.${tenantId}` : undefined,
    queryKey: ['projects', tenantId],
    enabled,
  });

  // Subscribe to memberships
  useRealtime({
    table: 'tenant_memberships',
    filter: tenantId ? `tenant_id=eq.${tenantId}` : undefined,
    queryKey: ['memberships', tenantId],
    enabled,
  });
}

export default useRealtime;
