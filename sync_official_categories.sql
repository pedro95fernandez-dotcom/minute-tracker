-- Atualizar categorias do sistema para bater 100% com o Minute Data Oficial

INSERT INTO public.categories (team_id, name, icon, is_favorite)
VALUES
    (NULL, 'Arrumação e Limpeza', 'sparkles', true),
    (NULL, 'Cozinha, Culinária e Louça', 'utensils', true),
    (NULL, 'Cuidados com o Veículo Pessoal', 'car', false),
    (NULL, 'Interações', 'users', false),
    (NULL, 'Organização e Armazenamento', 'home', true),
    (NULL, 'Animais de Estimação', 'dog', false),
    (NULL, 'Lavanderia e Roupas', 'shirt', true),
    (NULL, 'Tarefas Externas', 'shopping-bag', false),
    (NULL, 'Hotel ou Hospedagem', 'hotel', false),
    (NULL, 'Limpeza Comercial ou Zeladoria', 'briefcase', false),
    (NULL, 'Tarefas de memória', 'brain', false)
ON CONFLICT DO NOTHING;
