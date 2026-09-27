DROP POLICY IF EXISTS "Qualquer autenticado pode ler catálogo" ON public.intermediary_catalog;
DROP POLICY IF EXISTS "Leitura pública do catálogo de intermediários" ON public.intermediary_catalog;

CREATE POLICY "Leitura pública do catálogo de intermediários" 
ON public.intermediary_catalog 
FOR SELECT 
TO authenticated, anon 
USING (true);

DROP POLICY IF EXISTS "Leitura de categorias globais ou da equipe" ON public.categories;
CREATE POLICY "Leitura pública de categorias globais ou da equipe"
ON public.categories
FOR SELECT
TO authenticated, anon
USING (
    team_id IS NULL 
    OR team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid())
);
