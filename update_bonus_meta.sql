-- Adicionar colunas de requisitos de bônus no catálogo de intermediários
ALTER TABLE public.intermediary_catalog 
ADD COLUMN IF NOT EXISTS bonus_required_hours NUMERIC(4,2) DEFAULT 5.00,
ADD COLUMN IF NOT EXISTS bonus_condition_text TEXT DEFAULT 'Completar 5 horas de gravação na semana';

-- Atualizar dados dos intermediários
UPDATE public.intermediary_catalog
SET 
    current_rate_usd = 3.50,
    promo_rate_usd = 4.00,
    bonus_required_hours = 5.00,
    active_promotion = 'Bônus Turbinado KGeN',
    bonus_condition_text = 'Grave pelo menos 5 horas na semana para desbloquear a taxa de US$ 4.00/h em vez de US$ 3.50/h'
WHERE slug = 'kgen';

UPDATE public.intermediary_catalog
SET 
    current_rate_usd = 4.00,
    promo_rate_usd = 5.00,
    bonus_required_hours = 5.00,
    active_promotion = 'Bônus de Volume Semanal',
    bonus_condition_text = 'Atinja 5 horas gravadas para elevar sua remuneração para US$ 5.00/h'
WHERE slug = 'hub-data';

UPDATE public.intermediary_catalog
SET 
    current_rate_usd = 4.00,
    promo_rate_usd = 4.50,
    bonus_required_hours = 4.00,
    active_promotion = 'Multiplicador de Tarefas Físicas',
    bonus_condition_text = 'Grave 4 horas de tarefas domésticas complexas na semana para ativar a taxa de US$ 4.50/h'
WHERE slug = 'humyn-labs';
