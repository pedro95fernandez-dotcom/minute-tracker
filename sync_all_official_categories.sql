-- ==========================================================
-- ATUALIZAÇÃO COMPLETA DAS 13 CATEGORIAS OFICIAIS DO MINUTE DATA
-- ==========================================================

INSERT INTO public.categories (name, icon, is_favorite)
VALUES
    ('Área Externa e Quintal', 'trees', true),
    ('Manutenção e Projetos Domésticos', 'wrench', true),
    ('Arrumação e Limpeza', 'sparkles', true),
    ('Cozinha, Culinária e Louça', 'utensils', true),
    ('Cuidados com o Veículo Pessoal', 'car', false),
    ('Interações', 'users', false),
    ('Organização e Armazenamento', 'home', true),
    ('Animais de Estimação', 'dog', false),
    ('Lavanderia e Roupas', 'shirt', true),
    ('Tarefas Externas', 'shopping-bag', false),
    ('Hotel ou Hospedagem', 'hotel', false),
    ('Limpeza Comercial ou Zeladoria', 'briefcase', false),
    ('Tarefas de memória', 'brain', false)
ON CONFLICT DO NOTHING;
