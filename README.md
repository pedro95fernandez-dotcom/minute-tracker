# ⏱️ Minute Tracker

> **Plataforma completa de gestão, assistência de gravação e controle financeiro para gravadores do Minute Data (KGeN, Humyn Labs, Hub Data).**

![Minute Tracker](https://img.shields.io/badge/Status-Ativo-emerald?style=for-the-badge)
![React 19](https://img.shields.io/badge/React-19.2-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=for-the-badge&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)
![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Auth-3ECF8E?style=for-the-badge&logo=supabase)

---

## 🌟 Visão Geral

O **Minute Tracker** foi criado para profissionalizar a rotina de quem grava vídeos em primeira pessoa (POV) para treinamento de Inteligência Artificial no aplicativo **Minute Data**. 

Ele resolve as maiores dores do gravador:
1. **Controle Financeiro Preciso:** Acompanhamento de horas gravadas, tarefas em análise, aprovadas e pagas, com conversão em tempo real de Dólar (USD) para Real (BRL).
2. **Meta Semanal & Bônus:** Contador dinâmico de quanto falta para atingir a meta semanal e desbloquear os bônus progressivos de cada intermediário (ex: KGeN US$ 4.00/h ao atingir 5h/10h).
3. **Assistente de Rotina Residencial:** Um questionário interativo mapeia os equipamentos e a estrutura da sua casa (lava-louças, máquina de lavar, pets, quintal, ferramentas, etc.) e gera um **Checklist Diário** e um **Planejamento Semanal** sob medida para você não perder tempo pensando no que gravar.
4. **Catálogo Oficial Minute Data:** Todas as 13 categorias oficiais e 50+ tarefas do app mapeadas com nomes exatos, tempos recomendados e botão "Gravar Agora" com pré-preenchimento automático.
5. **Guia Anti-Rejeição:** Dicas práticas e as 6 Regras de Ouro para garantir 100% de taxa de aprovação dos vídeos.
6. **Modo Equipe / Casal:** Permite convidar seu parceiro(a) ou trabalhar em equipe através de um código de convite seguro com sincronização em tempo real via Supabase.

---

## 🚀 Funcionalidades Principais

### 📊 Painel & Dashboard
- **Valor a Receber em Destaque:** Exibe claramente os ganhos confirmados a receber e em análise em R$ e US$.
- **Dólar Hoje:** Cotação comercial em tempo real via API do Banco Central / AwesomeAPI, com setinha dinâmica de variação diária (verde/vermelha) e valores de mínima/máxima.
- **Progresso de Metas:** Barra de avanço semanal em horas e reais.
- **Histórico & Filtro por Membro:** Visualize tarefas de todos ou de membros individuais da equipe.

### 📋 Assistente de Tarefas & Checklist
- **Questionário do Lar:** Configuração em 1 minuto do ambiente residencial.
- **Checklist Diário:** 16 atividades diárias reais (Lavar louça, Cozinhar, Preparar café/chá, Dobrar roupas, Alimentar pet, Arrumar escrivaninha, etc.).
- **Planejamento Semanal:** 33 atividades periódicas de alto valor (Lavar banheiro, Lavar carro, Trocar lençóis, Fazer compras, Lavar com alta pressão, etc.).
- **Busca em Tempo Real:** Campo de busca idêntico ao do Minute Data para encontrar qualquer tarefa por palavra-chave.
- **Pílulas de Categorias com Contadores:** Filtro visual instantâneo por categoria.
- **Checkboxes com Persistência:** Marque tarefas concluídas hoje e acompanhe sua barra de progresso.

### 🏷️ As 13 Categorias Oficiais Mapeadas:
- 🌿 Área Externa e Quintal (12)
- 🔧 Manutenção e Projetos Domésticos (8)
- ✨ Arrumação e Limpeza (7)
- 🍽️ Cozinha, Culinária e Louça (6)
- 🚗 Cuidados com o Veículo Pessoal (4)
- 👥 Interações (4)
- 📦 Organização e Armazenamento (4)
- 🐶 Animais de Estimação (3)
- 🧺 Lavanderia e Roupas (3)
- 🛒 Tarefas Externas (2)
- 🏨 Hotel ou Hospedagem (1)
- 🏢 Limpeza Comercial ou Zeladoria (1)
- 🧠 Tarefas de memória (1)

---

## 🛠️ Tecnologias Utilizadas

- **Frontend:** [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/)
- **Estilização:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Ícones:** [Lucide React](https://lucide.dev/)
- **Backend & Banco de Dados:** [Supabase](https://supabase.com/) (PostgreSQL, Row Level Security, Realtime Subscriptions)
- **API Externa:** Cotação do Dólar em tempo real via AwesomeAPI

---

## 💻 Como Rodar o Projeto Localmente

### 1. Clonar o Repositório
```bash
git clone https://github.com/pedro95fernandez-dotcom/minute-tracker.git
cd minute-tracker
```

### 2. Instalar as Dependências
```bash
npm install
```

### 3. Configurar as Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto baseado no `.env.example`:
```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-do-supabase
```

### 4. Executar os Scripts SQL no Banco
Execute os arquivos SQL na ordem:
1. `supabase_schema.sql` (Estrutura principal de tabelas e RLS)
2. `fix_recursion.sql` (Funções seguras de políticas RLS)
3. `sync_all_official_categories.sql` (13 categorias oficiais)
4. `household_profiles.sql` (Tabela de perfil residencial)

### 5. Iniciar o Servidor de Desenvolvimento
```bash
npm run dev -- --host
```
Acesse no seu navegador: `http://localhost:5173/` ou no celular conectado ao mesmo Wi-Fi.

---

## 🤝 Contribuições & Feedback

Avaliações, sugestões e issues são super bem-vindas! Sinta-se à vontade para:
- Abrir uma **Issue** reportando dúvidas, bugs ou novas tarefas do Minute Data.
- Enviar um **Pull Request** com melhorias de interface ou recursos adicionais.

---

## 📄 Licença

Distribuído sob a licença MIT. Veja `LICENSE` para mais informações.
