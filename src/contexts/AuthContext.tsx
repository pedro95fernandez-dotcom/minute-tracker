import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { Profile, Team, TeamMember } from '../types/database';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  currentTeam: Team | null;
  members: TeamMember[];
  loading: boolean;
  refreshTeamData: () => Promise<void>;
  createTeam: (
    name: string,
    weeklyGoalBrl: number,
    weeklyGoalHours: number,
    dailyGoalHours: number,
    usdToBrlRate: number
  ) => Promise<Team>;
  joinTeamWithCode: (inviteCode: string, nickname?: string) => Promise<Team>;
  updateTeamSettings: (updates: Partial<Team>) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar usuário e perfil
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserData(session.user);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserData(session.user);
      } else {
        setProfile(null);
        setCurrentTeam(null);
        setMembers([]);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserData = async (currentUser: User) => {
    try {
      setLoading(true);
      // 1. Carregar Perfil
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();
      
      setProfile(profileData || null);

      const storedTeamId = localStorage.getItem('active_team_id');

      // 2. Carregar Equipes (como membro)
      const { data: memberEntries } = await supabase
        .from('team_members')
        .select('team_id, created_at')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });

      let teamId: string | null = null;
      if (storedTeamId && memberEntries?.some((m) => m.team_id === storedTeamId)) {
        teamId = storedTeamId;
      } else if (memberEntries && memberEntries.length > 0) {
        teamId = memberEntries[0].team_id;
      } else {
        // Checar se é dono direto de alguma equipe
        const { data: ownedTeams } = await supabase
          .from('teams')
          .select('id')
          .eq('owner_id', currentUser.id)
          .limit(1);
        if (ownedTeams && ownedTeams.length > 0) {
          teamId = ownedTeams[0].id;
        }
      }

      if (teamId) {
        await loadTeamDetails(teamId);
      } else {
        setCurrentTeam(null);
        setMembers([]);
      }
    } catch (err) {
      console.error('Erro ao carregar dados do usuário:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadTeamDetails = async (teamId: string) => {
    localStorage.setItem('active_team_id', teamId);
    const { data: teamData } = await supabase
      .from('teams')
      .select('*')
      .eq('id', teamId)
      .single();

    if (teamData) {
      setCurrentTeam(teamData);

      // Carregar membros da equipe
      const { data: membersData } = await supabase
        .from('team_members')
        .select('*')
        .eq('team_id', teamId)
        .eq('is_active', true);

      setMembers(membersData || []);
    }
  };

  const refreshTeamData = async () => {
    if (currentTeam) {
      await loadTeamDetails(currentTeam.id);
    } else if (user) {
      await loadUserData(user);
    }
  };

  const createTeam = async (
    name: string,
    weeklyGoalBrl: number,
    weeklyGoalHours: number,
    dailyGoalHours: number,
    usdToBrlRate: number
  ): Promise<Team> => {
    if (!user) throw new Error('Usuário não autenticado');

    // Gerar código único de 6 caracteres alfanuméricos
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Inserir equipe
    const { data: newTeam, error: teamError } = await supabase
      .from('teams')
      .insert({
        name,
        invite_code: inviteCode,
        owner_id: user.id,
        weekly_goal_brl: weeklyGoalBrl,
        weekly_goal_hours: weeklyGoalHours,
        daily_goal_hours: dailyGoalHours,
        usd_to_brl_rate: usdToBrlRate,
      })
      .select()
      .single();

    if (teamError) throw teamError;

    // Adicionar dono como membro da equipe
    const nickname = profile?.full_name?.split(' ')[0] || user.email?.split('@')[0] || 'Eu';
    const { error: memberError } = await supabase
      .from('team_members')
      .insert({
        team_id: newTeam.id,
        user_id: user.id,
        nickname: nickname,
        role: 'owner',
      });

    if (memberError) console.error('Erro ao adicionar dono como membro:', memberError);

    await loadTeamDetails(newTeam.id);
    return newTeam;
  };

  const joinTeamWithCode = async (inviteCode: string, nickname?: string): Promise<Team> => {
    if (!user) throw new Error('Usuário não autenticado');

    const cleanCode = inviteCode.trim().toUpperCase();

    // 1. Buscar equipe pelo código
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('*')
      .eq('invite_code', cleanCode)
      .single();

    if (teamError || !team) {
      throw new Error('Código de convite não encontrado. Verifique com quem te enviou.');
    }

    if (currentTeam?.id === team.id) {
      throw new Error('Você já está conectado nesta equipe.');
    }

    // 2. Adicionar como membro ou reativar
    const finalNickname =
      nickname?.trim() ||
      profile?.full_name?.split(' ')[0] ||
      user.email?.split('@')[0] ||
      'Parceiro(a)';

    const { error: memberError } = await supabase
      .from('team_members')
      .upsert(
        {
          team_id: team.id,
          user_id: user.id,
          nickname: finalNickname,
          role: 'member',
          is_active: true,
        },
        { onConflict: 'team_id, user_id' }
      );

    if (memberError) {
      throw memberError;
    }

    localStorage.setItem('active_team_id', team.id);
    await loadTeamDetails(team.id);
    return team;
  };

  const updateTeamSettings = async (updates: Partial<Team>) => {
    if (!currentTeam) return;

    const { error } = await supabase
      .from('teams')
      .update(updates)
      .eq('id', currentTeam.id);

    if (error) throw error;
    await refreshTeamData();
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setCurrentTeam(null);
    setMembers([]);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        currentTeam,
        members,
        loading,
        refreshTeamData,
        createTeam,
        joinTeamWithCode,
        updateTeamSettings,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
