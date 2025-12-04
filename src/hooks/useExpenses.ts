import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../stores/AuthContext';
import {
  Expense,
  CreateExpenseRequest,
  UpdateExpenseRequest,
} from '../types/database';

const EXPENSES_KEY = 'expenses';
const PROJECTS_KEY = 'projects';

export function useExpenses(projectId: string | undefined) {
  const { currentTenant } = useAuth();

  return useQuery({
    queryKey: [EXPENSES_KEY, projectId, currentTenant?.id],
    queryFn: async () => {
      if (!projectId || !currentTenant?.id) return [];

      const { data, error } = await supabase
        .from('expenses')
        .select(`
          *,
          stage:stages(id, name),
          supplier:suppliers(id, name, company)
        `)
        .eq('project_id', projectId)
        .eq('tenant_id', currentTenant.id)
        .order('date', { ascending: false });

      if (error) throw error;
      return data as Expense[];
    },
    enabled: !!projectId && !!currentTenant?.id,
  });
}

export function useExpense(expenseId: string | undefined) {
  const { currentTenant } = useAuth();

  return useQuery({
    queryKey: [EXPENSES_KEY, 'detail', expenseId, currentTenant?.id],
    queryFn: async () => {
      if (!expenseId || !currentTenant?.id) return null;

      const { data, error } = await supabase
        .from('expenses')
        .select(`
          *,
          stage:stages(id, name),
          supplier:suppliers(id, name, company)
        `)
        .eq('id', expenseId)
        .eq('tenant_id', currentTenant.id)
        .single();

      if (error) throw error;
      return data as Expense;
    },
    enabled: !!expenseId && !!currentTenant?.id,
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();
  const { user, currentTenant } = useAuth();

  return useMutation({
    mutationFn: async (expense: CreateExpenseRequest) => {
      if (!currentTenant?.id) {
        throw new Error('No tenant selected');
      }

      const { data, error } = await supabase
        .from('expenses')
        .insert({
          ...expense,
          tenant_id: currentTenant.id,
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Expense;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [EXPENSES_KEY, data.project_id] });
      queryClient.invalidateQueries({ queryKey: [PROJECTS_KEY, data.project_id] });
    },
  });
}

export function useUpdateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: UpdateExpenseRequest;
    }) => {
      const { data, error } = await supabase
        .from('expenses')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Expense;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [EXPENSES_KEY, data.project_id] });
      queryClient.invalidateQueries({ queryKey: [EXPENSES_KEY, 'detail', data.id] });
      queryClient.invalidateQueries({ queryKey: [PROJECTS_KEY, data.project_id] });
    },
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (expenseId: string) => {
      const { data: expense } = await supabase
        .from('expenses')
        .select('project_id')
        .eq('id', expenseId)
        .single();

      const { error } = await supabase.from('expenses').delete().eq('id', expenseId);

      if (error) throw error;
      return expense?.project_id;
    },
    onSuccess: (projectId) => {
      if (projectId) {
        queryClient.invalidateQueries({ queryKey: [EXPENSES_KEY, projectId] });
        queryClient.invalidateQueries({ queryKey: [PROJECTS_KEY, projectId] });
      }
    },
  });
}

// Calculate expense statistics
export function useExpenseStats(projectId: string | undefined) {
  const { data: expenses } = useExpenses(projectId);

  if (!expenses) return null;

  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const pendingAmount = expenses
    .filter((exp) => exp.status === 'pending')
    .reduce((sum, exp) => sum + exp.amount, 0);
  const paidAmount = expenses
    .filter((exp) => exp.status === 'paid')
    .reduce((sum, exp) => sum + exp.amount, 0);

  const byCategory = expenses.reduce((acc, exp) => {
    const category = exp.category || 'Uncategorized';
    acc[category] = (acc[category] || 0) + exp.amount;
    return acc;
  }, {} as Record<string, number>);

  return {
    totalSpent,
    pendingAmount,
    paidAmount,
    byCategory,
    count: expenses.length,
  };
}
