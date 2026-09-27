-- ==========================================================
-- CORREÇÃO DEFINITIVA DE RECURSÃO INFINITA EM RLS (Supabase)
-- ==========================================================

-- 1. Funções com SECURITY DEFINER (ignoram RLS durante a verificação interna)
CREATE OR REPLACE FUNCTION public.get_my_team_ids()
RETURNS SETOF UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT team_id FROM public.team_members WHERE user_id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_team_owner(lookup_team_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.teams WHERE id = lookup_team_id AND owner_id = auth.uid()
  );
$$;

-- 2. Recriar Políticas da tabela TEAMS
DROP POLICY IF EXISTS "Membros podem ver suas equipes" ON public.teams;
DROP POLICY IF EXISTS "Membros ou donos podem ver suas equipes" ON public.teams;
DROP POLICY IF EXISTS "Usuários autenticados podem criar equipes" ON public.teams;
DROP POLICY IF EXISTS "Dono pode atualizar sua equipe" ON public.teams;

CREATE POLICY "Membros ou donos podem ver suas equipes" ON public.teams
    FOR SELECT TO authenticated
    USING (
        owner_id = auth.uid()
        OR id IN (SELECT public.get_my_team_ids())
    );

CREATE POLICY "Usuários autenticados podem criar equipes" ON public.teams
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Dono pode atualizar sua equipe" ON public.teams
    FOR UPDATE TO authenticated
    USING (auth.uid() = owner_id);

-- 3. Recriar Políticas da tabela TEAM_MEMBERS
DROP POLICY IF EXISTS "Membros podem ver companheiros da mesma equipe" ON public.team_members;
DROP POLICY IF EXISTS "Membros podem ver equipe" ON public.team_members;
DROP POLICY IF EXISTS "Usuário pode se adicionar ou dono pode adicionar membro" ON public.team_members;
DROP POLICY IF EXISTS "Inserir membros na equipe" ON public.team_members;
DROP POLICY IF EXISTS "Membro pode atualizar seu próprio registro ou dono da equipe" ON public.team_members;
DROP POLICY IF EXISTS "Atualizar membros na equipe" ON public.team_members;

CREATE POLICY "Membros podem ver equipe" ON public.team_members
    FOR SELECT TO authenticated
    USING (
        user_id = auth.uid()
        OR team_id IN (SELECT public.get_my_team_ids())
        OR public.is_team_owner(team_id)
    );

CREATE POLICY "Inserir membros na equipe" ON public.team_members
    FOR INSERT TO authenticated
    WITH CHECK (
        user_id = auth.uid()
        OR public.is_team_owner(team_id)
    );

CREATE POLICY "Atualizar membros na equipe" ON public.team_members
    FOR UPDATE TO authenticated
    USING (
        user_id = auth.uid()
        OR public.is_team_owner(team_id)
    );

-- 4. Recriar Políticas da tabela TASKS
DROP POLICY IF EXISTS "Membros da equipe podem ver tarefas da equipe" ON public.tasks;
DROP POLICY IF EXISTS "Membros da equipe podem ver tarefas" ON public.tasks;
DROP POLICY IF EXISTS "Membros da equipe podem inserir tarefas" ON public.tasks;
DROP POLICY IF EXISTS "Membros da equipe podem atualizar tarefas da equipe" ON public.tasks;
DROP POLICY IF EXISTS "Membros da equipe podem atualizar tarefas" ON public.tasks;
DROP POLICY IF EXISTS "Membros da equipe podem excluir tarefas da equipe" ON public.tasks;
DROP POLICY IF EXISTS "Membros da equipe podem excluir tarefas" ON public.tasks;

CREATE POLICY "Membros da equipe podem ver tarefas" ON public.tasks
    FOR SELECT TO authenticated
    USING (
        team_id IN (SELECT public.get_my_team_ids())
        OR public.is_team_owner(team_id)
    );

CREATE POLICY "Membros da equipe podem inserir tarefas" ON public.tasks
    FOR INSERT TO authenticated
    WITH CHECK (
        team_id IN (SELECT public.get_my_team_ids())
        OR public.is_team_owner(team_id)
    );

CREATE POLICY "Membros da equipe podem atualizar tarefas" ON public.tasks
    FOR UPDATE TO authenticated
    USING (
        team_id IN (SELECT public.get_my_team_ids())
        OR public.is_team_owner(team_id)
    );

CREATE POLICY "Membros da equipe podem excluir tarefas" ON public.tasks
    FOR DELETE TO authenticated
    USING (
        team_id IN (SELECT public.get_my_team_ids())
        OR public.is_team_owner(team_id)
    );

-- 5. Recriar Políticas da tabela CATEGORIES
DROP POLICY IF EXISTS "Leitura de categorias globais ou da equipe" ON public.categories;
DROP POLICY IF EXISTS "Leitura pública de categorias globais ou da equipe" ON public.categories;
DROP POLICY IF EXISTS "Criar categorias na própria equipe" ON public.categories;

CREATE POLICY "Leitura pública de categorias globais ou da equipe" ON public.categories
    FOR SELECT TO authenticated, anon
    USING (
        team_id IS NULL
        OR team_id IN (SELECT public.get_my_team_ids())
        OR public.is_team_owner(team_id)
    );

CREATE POLICY "Criar categorias na própria equipe" ON public.categories
    FOR INSERT TO authenticated
    WITH CHECK (
        team_id IN (SELECT public.get_my_team_ids())
        OR public.is_team_owner(team_id)
    );
