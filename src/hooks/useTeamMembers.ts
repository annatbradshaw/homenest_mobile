import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../stores/AuthContext';

export interface TeamMember {
  id: string;
  user_id: string;
  name: string;
  email: string;
  role: string;
}

interface MembershipWithProfile {
  id: string;
  user_id: string;
  tenant_id: string;
  role: string;
  is_active: boolean;
  joined_at: string | null;
  first_name: string | null;
  last_name: string | null;
}

async function fetchTeamMembers(
  tenantId: string,
  currentUserId: string | undefined,
  currentUserEmail: string | undefined
): Promise<TeamMember[]> {
  const { data: memberships, error } = await supabase
    .from('tenant_memberships_team')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('is_active', true);

  if (error) throw error;

  return (memberships as MembershipWithProfile[] || []).map((member) => {
    let email = '';
    let name = '';

    if (member.user_id === currentUserId) {
      email = currentUserEmail || '';
      name =
        member.first_name && member.last_name
          ? `${member.first_name} ${member.last_name}`
          : currentUserEmail?.split('@')[0] || 'You';
    } else {
      name =
        member.first_name && member.last_name
          ? `${member.first_name} ${member.last_name}`
          : 'Team Member';
      email = 'Member';
    }

    return {
      id: member.id,
      user_id: member.user_id,
      name,
      email,
      role: member.role,
    };
  });
}

export function useTeamMembers() {
  const { currentTenant, user } = useAuth();
  const tenantId = currentTenant?.id;

  return useQuery({
    queryKey: ['teamMembers', tenantId],
    queryFn: () => fetchTeamMembers(tenantId!, user?.id, user?.email),
    enabled: !!tenantId,
  });
}
