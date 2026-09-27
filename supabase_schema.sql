-- ==========================================================
-- MINUTE DATA TRACKER - SUPABASE DATABASE SCHEMA
-- ==========================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. PROFILES TABLE (vinculado ao auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Trigger para criar perfil automaticamente no cadastro
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        NEW.email
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. TEAMS / WORKSPACES (Trabalho Solo ou Casal/Equipe)
CREATE TABLE IF NOT EXISTS public.teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL DEFAULT 'Minha Equipe',
    invite_code TEXT UNIQUE NOT NULL,
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    weekly_goal_brl NUMERIC(10,2) DEFAULT 500.00,
    weekly_goal_hours NUMERIC(6,2) DEFAULT 20.00,
    usd_to_brl_rate NUMERIC(6,4) DEFAULT 5.5000,
    payout_cutoff_day TEXT DEFAULT 'Terça-feira',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. TEAM MEMBERS
CREATE TABLE IF NOT EXISTS public.team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    nickname TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'member', -- 'owner' | 'member'
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(team_id, user_id)
);

-- 5. CATÁLOGO GLOBAL DE INTERMEDIÁRIOS & VALORES
CREATE TABLE IF NOT EXISTS public.intermediary_catalog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    current_rate_usd NUMERIC(6,2) NOT NULL DEFAULT 4.00,
    promo_rate_usd NUMERIC(6,2),
    active_promotion TEXT,
    payout_frequency TEXT DEFAULT 'Semanal (Sexta-feira)',
    payout_methods TEXT DEFAULT 'PIX, USDT',
    cutoff_day TEXT DEFAULT 'Terça-feira',
    is_active BOOLEAN DEFAULT true,
    last_checked_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Inserir dados padrão dos principais intermediários
INSERT INTO public.intermediary_catalog (name, slug, description, current_rate_usd, promo_rate_usd, active_promotion, payout_frequency, payout_methods, cutoff_day)
VALUES
    (
        'KGeN',
        'kgen',
        'Parceira de coleta para IA com gravação no Minute Data. Pagamento semanal via PIX.',
        3.50,
        4.00,
        'Bônus progressivo por horas aprovadas na semana (metas de 5h/10h).',
        'Semanal (Sexta-feira)',
        'PIX, USDT',
        'Terça-feira'
    ),
    (
        'Humyn Labs',
        'humyn-labs',
        'Coleta de dados corporificados em primeira pessoa para robótica assistiva.',
        4.00,
        NULL,
        'Campanhas pontuais com multiplicador para tarefas complexas de cozinha.',
        'Semanal',
        'PIX, Deel',
        'Domingo'
    ),
    (
        'Hub Data / Hub XYZ',
        'hub-data',
        'Multimodal Data Lab. Tarefas domésticas e comerciais com gravação POV.',
        4.00,
        5.00,
        'Bônus de boas-vindas na primeira hora aprovada para novos membros.',
        'Semanal',
        'PIX, PayPal',
        'Segunda-feira'
    )
ON CONFLICT (slug) DO UPDATE SET
    current_rate_usd = EXCLUDED.current_rate_usd,
    promo_rate_usd = EXCLUDED.promo_rate_usd,
    active_promotion = EXCLUDED.active_promotion,
    last_checked_at = now();

-- 6. REPORTE DE DIVERGÊNCIAS / PROMOÇÕES
CREATE TABLE IF NOT EXISTS public.rate_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    intermediary_id UUID NOT NULL REFERENCES public.intermediary_catalog(id) ON DELETE CASCADE,
    reported_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reported_rate_usd NUMERIC(6,2) NOT NULL,
    promo_details TEXT,
    proof_notes TEXT,
    status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. CATEGORIAS DE TAREFAS
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE, -- null = categoria do sistema
    name TEXT NOT NULL,
    icon TEXT DEFAULT 'sparkles',
    is_favorite BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Inserir categorias padrão do sistema
INSERT INTO public.categories (team_id, name, icon, is_favorite)
VALUES
    (NULL, 'Lavar Louça / Cozinha', 'utensils', true),
    (NULL, 'Dobrar Roupas / Lavanderia', 'shirt', true),
    (NULL, 'Organização de Armários / Quarto', 'home', true),
    (NULL, 'Limpeza de Chão / Aspirador', 'sparkles', false),
    (NULL, 'Preparar Refeição / Alimentos', 'cooking-pot', false),
    (NULL, 'Tarefas de Trabalho / Comercial', 'briefcase', false)
ON CONFLICT DO NOTHING;

-- 8. TAREFAS / GRAVAÇÕES REALIZADAS
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES public.team_members(id) ON DELETE CASCADE,
    intermediary_id UUID REFERENCES public.intermediary_catalog(id) ON DELETE SET NULL,
    category_name TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
    rate_usd NUMERIC(6,2) NOT NULL DEFAULT 4.00,
    usd_to_brl_rate NUMERIC(6,4) NOT NULL DEFAULT 5.5000,
    calculated_usd NUMERIC(10,2) GENERATED ALWAYS AS (ROUND((duration_minutes::numeric / 60.0) * rate_usd, 2)) STORED,
    calculated_brl NUMERIC(10,2) GENERATED ALWAYS AS (ROUND((duration_minutes::numeric / 60.0) * rate_usd * usd_to_brl_rate, 2)) STORED,
    status TEXT NOT NULL DEFAULT 'analyzing', -- 'analyzing', 'approved', 'rejected', 'paid'
    rejection_reason TEXT,
    external_task_code TEXT,
    task_date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 9. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intermediary_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Profiles: leitura pública de perfis autenticados, edição do próprio perfil
CREATE POLICY "Permitir leitura de perfis autenticados" ON public.profiles
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Permitir atualização do próprio perfil" ON public.profiles
    FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Teams: membros da equipe podem ver a equipe
CREATE POLICY "Membros podem ver suas equipes" ON public.teams
    FOR SELECT TO authenticated
    USING (
        id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid())
        OR owner_id = auth.uid()
    );

CREATE POLICY "Usuários autenticados podem criar equipes" ON public.teams
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Dono pode atualizar sua equipe" ON public.teams
    FOR UPDATE TO authenticated
    USING (auth.uid() = owner_id);

-- Team Members:
CREATE POLICY "Membros podem ver companheiros da mesma equipe" ON public.team_members
    FOR SELECT TO authenticated
    USING (
        team_id IN (
            SELECT team_id FROM public.team_members WHERE user_id = auth.uid()
        )
        OR user_id = auth.uid()
    );

CREATE POLICY "Usuário pode se adicionar ou dono pode adicionar membro" ON public.team_members
    FOR INSERT TO authenticated
    WITH CHECK (
        user_id = auth.uid()
        OR team_id IN (SELECT id FROM public.teams WHERE owner_id = auth.uid())
    );

CREATE POLICY "Membro pode atualizar seu próprio registro ou dono da equipe" ON public.team_members
    FOR UPDATE TO authenticated
    USING (
        user_id = auth.uid()
        OR team_id IN (SELECT id FROM public.teams WHERE owner_id = auth.uid())
    );

-- Intermediary Catalog: leitura pública para todos autenticados
CREATE POLICY "Qualquer autenticado pode ler catálogo" ON public.intermediary_catalog
    FOR SELECT TO authenticated USING (true);

-- Rate Reports: qualquer autenticado pode criar reporte
CREATE POLICY "Autenticado pode reportar divergência" ON public.rate_reports
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = reported_by);

CREATE POLICY "Autenticado pode ler reportes" ON public.rate_reports
    FOR SELECT TO authenticated USING (true);

-- Categories:
CREATE POLICY "Leitura de categorias globais ou da equipe" ON public.categories
    FOR SELECT TO authenticated
    USING (
        team_id IS NULL
        OR team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid())
    );

CREATE POLICY "Criar categorias na própria equipe" ON public.categories
    FOR INSERT TO authenticated
    WITH CHECK (
        team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid())
    );

-- Tasks:
CREATE POLICY "Membros da equipe podem ver tarefas da equipe" ON public.tasks
    FOR SELECT TO authenticated
    USING (
        team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid())
    );

CREATE POLICY "Membros da equipe podem inserir tarefas" ON public.tasks
    FOR INSERT TO authenticated
    WITH CHECK (
        team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid())
    );

CREATE POLICY "Membros da equipe podem atualizar tarefas da equipe" ON public.tasks
    FOR UPDATE TO authenticated
    USING (
        team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid())
    );

CREATE POLICY "Membros da equipe podem excluir tarefas da equipe" ON public.tasks
    FOR DELETE TO authenticated
    USING (
        team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid())
    );
