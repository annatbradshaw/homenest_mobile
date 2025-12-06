import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../stores/AuthContext';
import {
  Supplier,
  CreateSupplierRequest,
  UpdateSupplierRequest,
} from '../types/database';

const SUPPLIERS_KEY = 'suppliers';
const PROJECTS_KEY = 'projects';

export function useSuppliers(projectId: string | undefined) {
  const { currentTenant } = useAuth();

  return useQuery({
    queryKey: [SUPPLIERS_KEY, projectId, currentTenant?.id],
    queryFn: async () => {
      if (!projectId || !currentTenant?.id) return [];

      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('project_id', projectId)
        .eq('tenant_id', currentTenant.id)
        .order('name', { ascending: true });

      if (error) throw error;
      return data as Supplier[];
    },
    enabled: !!projectId && !!currentTenant?.id,
  });
}

export function useSupplier(supplierId: string | undefined) {
  const { currentTenant } = useAuth();

  return useQuery({
    queryKey: [SUPPLIERS_KEY, 'detail', supplierId, currentTenant?.id],
    queryFn: async () => {
      if (!supplierId || !currentTenant?.id) return null;

      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('id', supplierId)
        .eq('tenant_id', currentTenant.id)
        .single();

      if (error) throw error;
      return data as Supplier;
    },
    enabled: !!supplierId && !!currentTenant?.id,
  });
}

export function useCreateSupplier() {
  const queryClient = useQueryClient();
  const { user, currentTenant } = useAuth();

  return useMutation({
    mutationFn: async (supplier: CreateSupplierRequest) => {
      if (!currentTenant?.id) {
        throw new Error('No tenant selected');
      }

      const { data, error } = await supabase
        .from('suppliers')
        .insert({
          ...supplier,
          tenant_id: currentTenant.id,
          created_by: user?.id,
          is_active: supplier.is_active ?? true,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Supplier;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [SUPPLIERS_KEY, data.project_id] });
      queryClient.invalidateQueries({ queryKey: [PROJECTS_KEY, data.project_id] });
    },
  });
}

export function useUpdateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: UpdateSupplierRequest;
    }) => {
      const { data, error } = await supabase
        .from('suppliers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Supplier;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [SUPPLIERS_KEY, data.project_id] });
      queryClient.invalidateQueries({ queryKey: [SUPPLIERS_KEY, 'detail', data.id] });
      queryClient.invalidateQueries({ queryKey: [PROJECTS_KEY, data.project_id] });
    },
  });
}

export function useDeleteSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (supplierId: string) => {
      const { data: supplier } = await supabase
        .from('suppliers')
        .select('project_id')
        .eq('id', supplierId)
        .single();

      const { error } = await supabase.from('suppliers').delete().eq('id', supplierId);

      if (error) throw error;
      return supplier?.project_id;
    },
    onSuccess: (projectId) => {
      if (projectId) {
        queryClient.invalidateQueries({ queryKey: [SUPPLIERS_KEY, projectId] });
        queryClient.invalidateQueries({ queryKey: [PROJECTS_KEY, projectId] });
      }
    },
  });
}
