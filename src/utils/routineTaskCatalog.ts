import type { HouseholdAnswers, RoutineTask } from '../types/database';

export const DEFAULT_HOUSEHOLD_ANSWERS: HouseholdAnswers = {
  // Cozinha
  hasDishwasher: false,
  cooksDaily: true,
  preparesCoffeeOrTea: true,
  doesGroceryShopping: true,

  // Lavanderia
  hasWashingMachine: true,
  doesHandWashClothes: false,
  hasIron: false,

  // Arrumação & Limpeza
  housingType: 'casa',
  hasVacuum: false,
  hasMop: true,
  hasKidsToys: false,
  hasHomeGym: false,

  // Área Externa & Quintal
  hasYard: true,
  hasLawnOrGarden: true,
  hasPressureWasher: false,
  hasPool: false,

  // Veículos
  hasVehicle: true,
  refuelsVehicle: true,

  // Pets
  hasPet: true,
  hasDog: true,
  hasCat: false,

  // Organização & Bricolagem
  hasWorkDesk: true,
  hasGarageStorage: true,
  hasPlants: true,
  hasToolsDIY: true,

  // Interações & Comercial
  recordsWithPartner: false,
  hasCommercialAccess: false,
  worksInHotelOrLaundry: false,
};

export interface QuestionDefinition {
  key: keyof HouseholdAnswers;
  category: string;
  title: string;
  description: string;
  type: 'boolean' | 'choice';
  options?: { value: string; label: string }[];
  icon: string;
}

export const QUESTIONNAIRE_QUESTIONS: QuestionDefinition[] = [
  // ==================== 1. COZINHA & ALIMENTAÇÃO ====================
  {
    key: 'hasDishwasher',
    category: 'Cozinha, Culinária e Louça',
    title: 'Você possui máquina de lavar louças?',
    description: 'Se NÃO tiver: ativa "Lavar Louça à Mão" (uma das tarefas com mais horas aprovadas no Minute!). Se SIM: ativa "Usar a Lava-louças".',
    type: 'boolean',
    icon: 'Utensils',
  },
  {
    key: 'cooksDaily',
    category: 'Cozinha, Culinária e Louça',
    title: 'Você costuma cozinhar almoço, jantar ou lanches em casa?',
    description: 'Ativa as tarefas oficiais "Cozinhar" e "Pôr a Mesa".',
    type: 'boolean',
    icon: 'CookingPot',
  },
  {
    key: 'preparesCoffeeOrTea',
    category: 'Cozinha, Culinária e Louça',
    title: 'Você costuma preparar café passado, café expresso ou chá?',
    description: 'Ativa a tarefa oficial "Preparar Café ou Chá" no checklist diário.',
    type: 'boolean',
    icon: 'Coffee',
  },
  {
    key: 'doesGroceryShopping',
    category: 'Cozinha, Culinária e Louça',
    title: 'Você costuma ir ao supermercado e trazer compras para guardar?',
    description: 'Ativa as tarefas "Fazer Compras" e "Guardar Compras e Alimentos" na despensa/geladeira.',
    type: 'boolean',
    icon: 'ShoppingBag',
  },

  // ==================== 2. LAVANDERIA & ROUPAS ====================
  {
    key: 'hasWashingMachine',
    category: 'Lavanderia e Roupas',
    title: 'Você possui máquina de lavar roupas?',
    description: 'Ativa a tarefa oficial "Usar a Máquina de Lavar" (separar, sabão e programar ciclo).',
    type: 'boolean',
    icon: 'Shirt',
  },
  {
    key: 'doesHandWashClothes',
    category: 'Lavanderia e Roupas',
    title: 'Você costuma lavar roupas à mão no tanque ou bacia?',
    description: 'Ativa a tarefa oficial "Lavar Roupa à Mão" (peças delicadas, tênis ou roupas no tanque).',
    type: 'boolean',
    icon: 'Shirt',
  },

  // ==================== 3. ARRUMAÇÃO & LIMPEZA ====================
  {
    key: 'housingType',
    category: 'Arrumação e Limpeza',
    title: 'Qual é o tipo da sua moradia?',
    description: 'Ajuda a dimensionar as tarefas de pisos, varandas e quintal.',
    type: 'choice',
    options: [
      { value: 'casa', label: 'Casa (térrea ou sobrado)' },
      { value: 'apartamento', label: 'Apartamento' },
    ],
    icon: 'Home',
  },
  {
    key: 'hasVacuum',
    category: 'Arrumação e Limpeza',
    title: 'Você possui aspirador de pó?',
    description: 'Ajuda na limpeza profunda de tapetes, sofás e interior do carro.',
    type: 'boolean',
    icon: 'Sparkles',
  },
  {
    key: 'hasMop',
    category: 'Arrumação e Limpeza',
    title: 'Você costuma passar pano no chão com balde ou mop?',
    description: 'Passar pano úmido em quartos, salas e banheiros.',
    type: 'boolean',
    icon: 'Brush',
  },
  {
    key: 'hasKidsToys',
    category: 'Arrumação e Limpeza',
    title: 'Tem crianças pequenas ou brinquedos/roupas para recolher pela casa?',
    description: 'Ativa a tarefa oficial "Recolher Brinquedos ou Roupas" no checklist diário.',
    type: 'boolean',
    icon: 'Smile',
  },
  {
    key: 'hasHomeGym',
    category: 'Arrumação e Limpeza',
    title: 'Você treina em casa ou possui halteres, colchonetes ou pesos?',
    description: 'Ativa a tarefa oficial "Limpar os Equipamentos de Academia".',
    type: 'boolean',
    icon: 'Dumbbell',
  },

  // ==================== 4. ÁREA EXTERNA & QUINTAL ====================
  {
    key: 'hasYard',
    category: 'Área Externa e Quintal',
    title: 'Sua residência possui varanda, pátio ou quintal?',
    description: 'Ativa as tarefas oficiais "Varrer a Varanda" e "Arrumar Móveis de Área Externa".',
    type: 'boolean',
    icon: 'TreePine',
  },
  {
    key: 'hasLawnOrGarden',
    category: 'Área Externa e Quintal',
    title: 'Possui gramado, canteiros, árvores ou cerca viva?',
    description: 'Ativa "Regar Plantas Externas", "Juntar ou Soprar Folhas", "Podar Cercas Vivas" e "Arrancar Ervas Daninhas".',
    type: 'boolean',
    icon: 'Flower2',
  },
  {
    key: 'hasPressureWasher',
    category: 'Área Externa e Quintal',
    title: 'Possui lavadora de alta pressão (jato d\'água / Wap)?',
    description: 'Ativa a tarefa de alto valor "Lavar com Alta Pressão" (limpeza pesada de pátio ou calçadas).',
    type: 'boolean',
    icon: 'Sparkles',
  },
  {
    key: 'hasPool',
    category: 'Área Externa e Quintal',
    title: 'Possui piscina em casa?',
    description: 'Ativa a tarefa oficial "Limpeza da Piscina" (peneirar folhas e limpar bordas).',
    type: 'boolean',
    icon: 'Waves',
  },

  // ==================== 5. CUIDADOS COM O VEÍCULO ====================
  {
    key: 'hasVehicle',
    category: 'Cuidados com o Veículo Pessoal',
    title: 'Você possui carro ou moto?',
    description: 'Ativa as 4 tarefas oficiais: "Limpar o Carro", "Verificar Óleo", "Calibrar Pneus" e "Trocar Pneu".',
    type: 'boolean',
    icon: 'Car',
  },
  {
    key: 'refuelsVehicle',
    category: 'Cuidados com o Veículo Pessoal',
    title: 'Costuma abastecer o veículo em postos de combustível?',
    description: 'Ativa a tarefa oficial "Abastecer o Carro" (Tarefas Externas).',
    type: 'boolean',
    icon: 'Fuel',
  },

  // ==================== 6. ANIMAIS DE ESTIMAÇÃO ====================
  {
    key: 'hasPet',
    category: 'Animais de Estimação',
    title: 'Você possui algum animal de estimação em casa?',
    description: 'Ativa a tarefa essencial "Alimentar o Pet" (ração e água fresca todos os dias).',
    type: 'boolean',
    icon: 'Dog',
  },
  {
    key: 'hasDog',
    category: 'Animais de Estimação',
    title: 'Você tem cachorro e costuma passear com ele na rua?',
    description: 'Ativa a tarefa oficial "Passear com o Cachorro" (colocar coleira, guia e recolher dejetos).',
    type: 'boolean',
    icon: 'Dog',
  },
  {
    key: 'hasCat',
    category: 'Animais de Estimação',
    title: 'Você tem gato e utiliza caixa de areia higiênica?',
    description: 'Ativa a tarefa diária "Limpar a Caixa de Areia" (peneirar e completar areia limpa).',
    type: 'boolean',
    icon: 'Sparkles',
  },

  // ==================== 7. ORGANIZAÇÃO & FERRAMENTAS ====================
  {
    key: 'hasWorkDesk',
    category: 'Organização e Armazenamento',
    title: 'Possui mesa de trabalho, escrivaninha ou computador de home office?',
    description: 'Ativa a tarefa oficial "Arrumar a Mesa de Trabalho" no checklist diário.',
    type: 'boolean',
    icon: 'Laptop',
  },
  {
    key: 'hasGarageStorage',
    category: 'Organização e Armazenamento',
    title: 'Possui garagem ou área de depósito / ferramentas?',
    description: 'Ativa "Organizar a Garagem" e "Buscar e Guardar Itens em Depósito".',
    type: 'boolean',
    icon: 'Boxes',
  },
  {
    key: 'hasPlants',
    category: 'Manutenção e Projetos Domésticos',
    title: 'Possui vasos de plantas dentro de casa (sala, quartos ou varanda)?',
    description: 'Ativa a tarefa diária "Regar Plantas de Interior".',
    type: 'boolean',
    icon: 'Flower2',
  },
  {
    key: 'hasToolsDIY',
    category: 'Manutenção e Projetos Domésticos',
    title: 'Costuma fazer pequenos reparos, apertar parafusos ou usar furadeira/ferramentas?',
    description: 'Ativa "Montagem de Móveis", "Pendurar Quadros", "Apertar Dobradiças" e "Trocar Chuveiro".',
    type: 'boolean',
    icon: 'Wrench',
  },

  // ==================== 8. DUPLA & AMBIENTE COMERCIAL ====================
  {
    key: 'recordsWithPartner',
    category: 'Interações',
    title: 'Você tem alguém em casa (parceiro/família) para gravar tarefas em dupla?',
    description: 'Ativa as tarefas oficiais da categoria Interações: "Copiar a Tarefa de Alguém" e "Jogos de Tabuleiro/Cartas".',
    type: 'boolean',
    icon: 'Users',
  },
  {
    key: 'worksInHotelOrLaundry',
    category: 'Hotel / Zeladoria Comercial',
    title: 'Trabalha ou tem acesso autorizado a hotel, pousada ou lavanderia industrial?',
    description: 'Ativa as tarefas oficiais "Lavanderia de Hotel" e "Operação de Lavanderia Industrial".',
    type: 'boolean',
    icon: 'Briefcase',
  },
];

export const ALL_ROUTINE_TASKS: (RoutineTask & {
  matches: (a: HouseholdAnswers) => boolean;
})[] = [
  // =========================================================================
  // ☀️ TAREFAS DIÁRIAS (ROTINA DE HOJE - 15 ATIVIDADES FREQUENTES)
  // =========================================================================

  // 1. Cozinha: Lavar Louça à Mão
  {
    id: 'minute-lavar-louca-mao',
    title: 'Lavar Louça à Mão',
    categoryName: 'Cozinha, Culinária e Louça',
    frequency: 'daily',
    recommendedMinutes: 25,
    timesPerWeek: 7,
    description: 'Lavar pratos, panelas e utensílios à mão na pia e colocá-los para secar.',
    antiRejectionTips: [
      'Ambas as mãos no campo de visão manipulando a bucha e louça',
      'Água corrente e espuma claramente visíveis',
      'Câmera firme na cabeça apontando para a cuba da pia'
    ],
    icon: 'Utensils',
    badge: 'Alta Aprovação',
    matches: (a) => !a.hasDishwasher,
  },

  // 2. Cozinha: Usar a Lava-louças
  {
    id: 'minute-usar-lava-loucas',
    title: 'Usar a Lava-louças',
    categoryName: 'Cozinha, Culinária e Louça',
    frequency: 'daily',
    recommendedMinutes: 20,
    timesPerWeek: 7,
    description: 'Colocar louça suja na lava-louças e ligá-la, ou retirar a louça limpa e guardá-la.',
    antiRejectionTips: [
      'Encaixe ordenado dos pratos ou retirada para guardar nos armários',
      'Adicionar pastilha/sabão e acionar painel'
    ],
    icon: 'Utensils',
    matches: (a) => a.hasDishwasher,
  },

  // 3. Cozinha: Pôr a Mesa
  {
    id: 'minute-por-a-mesa',
    title: 'Pôr a Mesa',
    categoryName: 'Cozinha, Culinária e Louça',
    frequency: 'daily',
    recommendedMinutes: 15,
    timesPerWeek: 7,
    description: 'Pôr a mesa com pratos, talheres, copos e outros itens para uma refeição.',
    antiRejectionTips: [
      'Dispor os pratos, guardanapos e copos de forma organizada',
      'Não focalize o rosto de familiares sentados'
    ],
    icon: 'Utensils',
    matches: (a) => a.cooksDaily,
  },

  // 4. Cozinha: Cozinhar
  {
    id: 'minute-cozinhar',
    title: 'Cozinhar',
    categoryName: 'Cozinha, Culinária e Louça',
    frequency: 'daily',
    recommendedMinutes: 30,
    timesPerWeek: 7,
    description: 'Preparar ou cozinhar alimentos, como lavar, picar, misturar e cozinhar ingredientes no fogão.',
    antiRejectionTips: [
      'Boa iluminação sobre a bancada e fogão',
      'Manuseio bimanual claro de facas, colheres e panelas'
    ],
    icon: 'CookingPot',
    badge: 'Essencial Diária',
    matches: (a) => a.cooksDaily,
  },

  // 5. Cozinha: Preparar Café ou Chá
  {
    id: 'minute-preparar-cafe-cha',
    title: 'Preparar Café ou Chá',
    categoryName: 'Cozinha, Culinária e Louça',
    frequency: 'daily',
    recommendedMinutes: 15,
    timesPerWeek: 7,
    description: 'Preparar café ou outra bebida e arrumar a estação.',
    antiRejectionTips: [
      'Filmar a água fervendo, filtro/coador, xícaras e organização',
      'Mãos livres interagindo com a cafeteira ou utensílios'
    ],
    icon: 'Coffee',
    matches: (a) => Boolean(a.preparesCoffeeOrTea ?? true),
  },

  // 6. Arrumação: Limpar e Arrumar a Cozinha
  {
    id: 'minute-limpar-arrumar-cozinha',
    title: 'Limpar e Arrumar a Cozinha',
    categoryName: 'Arrumação e Limpeza',
    frequency: 'daily',
    recommendedMinutes: 20,
    timesPerWeek: 7,
    description: 'Limpar ou arrumar a cozinha, como limpar bancadas, armários, pia ou eletrodomésticos.',
    antiRejectionTips: [
      'Passar pano na bancada, fogão e mesa com desengordurante',
      'Evite reflexos que mostrem seu rosto na tampa de vidro do fogão'
    ],
    icon: 'Sparkles',
    matches: () => true,
  },

  // 7. Arrumação: Levar o Lixo para Fora
  {
    id: 'minute-levar-lixo-fora',
    title: 'Levar o Lixo para Fora',
    categoryName: 'Arrumação e Limpeza',
    frequency: 'daily',
    recommendedMinutes: 15,
    timesPerWeek: 7,
    description: 'Retirar sacos de lixo cheios, levá-los à lixeira externa e colocar sacos novos.',
    antiRejectionTips: [
      'Amarrar o saco de lixo, transportar e repor saco novo na lixeira',
      'Não filmar placas de carros ou pedestres na rua'
    ],
    icon: 'Trash2',
    matches: () => true,
  },

  // 8. Arrumação: Limpar e Arrumar o Quarto
  {
    id: 'minute-limpar-arrumar-quarto',
    title: 'Limpar e Arrumar o Quarto',
    categoryName: 'Arrumação e Limpeza',
    frequency: 'daily',
    recommendedMinutes: 20,
    timesPerWeek: 7,
    description: 'Limpar ou arrumar um quarto, como tirar o pó, limpar superfícies, organizar itens e ajeitar a cama.',
    antiRejectionTips: [
      'Ambiente bem iluminado, cortinas abertas',
      'Mãos ajeitando almofadas, roupas e limpando superfícies'
    ],
    icon: 'Home',
    matches: () => true,
  },

  // 9. Lavanderia: Dobrar, Pendurar ou Estender
  {
    id: 'minute-dobrar-pendurar-estender',
    title: 'Dobrar, Pendurar ou Estender',
    categoryName: 'Lavanderia e Roupas',
    frequency: 'daily',
    recommendedMinutes: 25,
    timesPerWeek: 7,
    description: 'Dobrar roupas limpas ou roupas de cama e banho, pendurá-las em cabides ou estender no varal.',
    antiRejectionTips: [
      'Mãos dobrando as peças sobre a cama ou mesa com luz clara',
      'Ritmo de dobra natural e ordenado, peça por peça',
      'Sem áudio de televisão ou rádio ligado ao fundo'
    ],
    icon: 'Shirt',
    badge: 'Campeã de Horas',
    matches: () => true,
  },

  // 10. Pets: Alimentar o Pet
  {
    id: 'minute-alimentar-o-pet',
    title: 'Alimentar o Pet',
    categoryName: 'Animais de Estimação',
    frequency: 'daily',
    recommendedMinutes: 15,
    timesPerWeek: 7,
    description: 'Encher a tigela de comida e trocar a água limpa do animal de estimação.',
    antiRejectionTips: [
      'Mãos dosando a ração no pote e lavando/enchendo a tigela de água',
      'O animal pode aparecer interagindo, sem filmar rostos humanos'
    ],
    icon: 'Dog',
    matches: (a) => a.hasPet,
  },

  // 11. Pets: Limpar a Caixa de Areia
  {
    id: 'minute-limpar-caixa-areia',
    title: 'Limpar a Caixa de Areia',
    categoryName: 'Animais de Estimação',
    frequency: 'daily',
    recommendedMinutes: 15,
    timesPerWeek: 7,
    description: 'Retirar os dejetos da caixa de areia, completar com areia limpa e descartar o lixo.',
    antiRejectionTips: [
      'Pá higiênica peneirando a areia e saco de descarte visível'
    ],
    icon: 'Sparkles',
    matches: (a) => Boolean(a.hasCat),
  },

  // 12. Pets: Passear com o Cachorro
  {
    id: 'minute-passear-com-cachorro',
    title: 'Passear com o Cachorro',
    categoryName: 'Animais de Estimação',
    frequency: 'daily',
    recommendedMinutes: 25,
    timesPerWeek: 7,
    description: 'Levar o cachorro para passear, incluindo colocar a coleira e recolher os dejetos pelo caminho.',
    antiRejectionTips: [
      'Colocar a guia na coleira e segurar com as mãos',
      'Não focalize pedestres ou vizinhos na calçada'
    ],
    icon: 'Dog',
    matches: (a) => Boolean(a.hasDog),
  },

  // 13. Organização: Arrumar a Mesa de Trabalho
  {
    id: 'minute-arrumar-mesa-trabalho',
    title: 'Arrumar a Mesa de Trabalho',
    categoryName: 'Organização e Armazenamento',
    frequency: 'daily',
    recommendedMinutes: 15,
    timesPerWeek: 7,
    description: 'Limpar e organizar a mesa e o espaço de trabalho.',
    antiRejectionTips: [
      'Organizar cadernos, teclado, canetas e passar flanela',
      'Não deixar cartões bancários ou documentos pessoais legíveis'
    ],
    icon: 'Laptop',
    matches: (a) => Boolean(a.hasWorkDesk),
  },

  // 14. Área Externa: Varrer a Varanda
  {
    id: 'minute-varrer-varanda',
    title: 'Varrer a Varanda',
    categoryName: 'Área Externa e Quintal',
    frequency: 'daily',
    recommendedMinutes: 20,
    timesPerWeek: 7,
    description: 'Varrer sujeira e detritos de uma varanda, pátio ou deck.',
    antiRejectionTips: [
      'Vassoura varrendo poeira em direção à pá',
      'Não filmar a rua pública ou pessoas passando'
    ],
    icon: 'Brush',
    matches: (a) => a.housingType === 'casa' || a.hasYard,
  },

  // 15. Manutenção: Regar Plantas de Interior
  {
    id: 'minute-regar-plantas-interior',
    title: 'Regar Plantas de Interior',
    categoryName: 'Manutenção e Projetos Domésticos',
    frequency: 'daily',
    recommendedMinutes: 15,
    timesPerWeek: 7,
    description: 'Regar plantas de interior e cuidar delas conforme necessário.',
    antiRejectionTips: [
      'Mãos com regador pequeno ou borrifador umedecendo vasos internos'
    ],
    icon: 'Flower2',
    matches: (a) => a.hasPlants,
  },

  // 16. Arrumação: Recolher Brinquedos ou Roupas
  {
    id: 'minute-recolher-brinquedos-roupas',
    title: 'Recolher Brinquedos ou Roupas',
    categoryName: 'Arrumação e Limpeza',
    frequency: 'daily',
    recommendedMinutes: 15,
    timesPerWeek: 7,
    description: 'Recolher brinquedos ou roupas espalhadas e devolvê-los a suas caixas, prateleiras ou lugares.',
    antiRejectionTips: [
      'Mãos pegando objetos do chão e guardando nos cestos/caixas',
      'NUNCA filmar crianças presentes na residência'
    ],
    icon: 'Smile',
    matches: (a) => Boolean(a.hasKidsToys),
  },

  // =========================================================================
  // 📅 TAREFAS SEMANAIS (PLANEJAMENTO PERIÓDICO - 33 ATIVIDADES)
  // =========================================================================

  // 17. Arrumação: Limpar e Arrumar o Banheiro
  {
    id: 'minute-limpar-arrumar-banheiro',
    title: 'Limpar e Arrumar o Banheiro',
    categoryName: 'Arrumação e Limpeza',
    frequency: 'weekly',
    recommendedMinutes: 35,
    timesPerWeek: 2,
    description: 'Limpar ou arrumar um banheiro, como esfregar o vaso, a pia, a banheira ou o chuveiro.',
    antiRejectionTips: [
      'ATENÇÃO CRÍTICA: Não filme o espelho mostrando seu reflexo ou rosto!',
      'Mãos com luvas manuseando escovinha, bucha e desinfetante'
    ],
    icon: 'Sparkles',
    badge: 'Cuidado com Espelho',
    matches: () => true,
  },

  // 18. Arrumação: Trocar Lençóis e Arrumar a Cama
  {
    id: 'minute-trocar-lencois-arrumar-cama',
    title: 'Trocar Lençóis e Arrumar a Cama',
    categoryName: 'Arrumação e Limpeza',
    frequency: 'weekly',
    recommendedMinutes: 20,
    timesPerWeek: 2,
    description: 'Tirar a roupa de cama e refazer a cama com lençóis, cobertas e travesseiros limpos.',
    antiRejectionTips: [
      'Mãos esticando os lençóis de elástico, colocando fronhas e ajeitando edredom',
      'Movimentos contínuos e organizados'
    ],
    icon: 'Bed',
    badge: 'Alta Aprovação',
    matches: () => true,
  },

  // 19. Lavanderia: Usar a Máquina de Lavar
  {
    id: 'minute-usar-maquina-lavar',
    title: 'Usar a Máquina de Lavar',
    categoryName: 'Lavanderia e Roupas',
    frequency: 'weekly',
    recommendedMinutes: 20,
    timesPerWeek: 4,
    description: 'Colocar roupas na máquina de lavar, adicionar sabão e amaciante, selecionar ciclo e iniciar.',
    antiRejectionTips: [
      'Separar peças, dosar sabão no compartimento, fechar tampa e apertar botões'
    ],
    icon: 'Shirt',
    matches: (a) => a.hasWashingMachine,
  },

  // 20. Lavanderia: Lavar Roupa à Mão
  {
    id: 'minute-lavar-roupa-mao',
    title: 'Lavar Roupa à Mão',
    categoryName: 'Lavanderia e Roupas',
    frequency: 'weekly',
    recommendedMinutes: 30,
    timesPerWeek: 2,
    description: 'Lavar roupas à mão em uma pia, bacia ou tanque, e torcer ou pendurar para secar.',
    antiRejectionTips: [
      'Foco nas duas mãos esfregando o tecido na água com sabão',
      'Câmera não pode ser respingada de água'
    ],
    icon: 'Shirt',
    matches: (a) => Boolean(a.doesHandWashClothes ?? (!a.hasWashingMachine)),
  },

  // 21. Cozinha: Guardar Compras e Alimentos
  {
    id: 'minute-guardar-compras-alimentos',
    title: 'Guardar Compras e Alimentos',
    categoryName: 'Cozinha, Culinária e Louça',
    frequency: 'weekly',
    recommendedMinutes: 20,
    timesPerWeek: 2,
    description: 'Desembalar as compras e guardar os itens em seus lugares, ou organizar e transferir alimentos.',
    antiRejectionTips: [
      'Retirar itens da sacola, organizar na despensa ou geladeira',
      'Movimentos claros com ambas as mãos guardando os produtos'
    ],
    icon: 'ShoppingBag',
    matches: (a) => Boolean(a.doesGroceryShopping ?? true),
  },

  // 22. Tarefas Externas: Fazer Compras
  {
    id: 'minute-fazer-compras',
    title: 'Fazer Compras',
    categoryName: 'Tarefas Externas',
    frequency: 'weekly',
    recommendedMinutes: 35,
    timesPerWeek: 2,
    description: 'Comprar mantimentos, itens domésticos ou roupas, incluindo olhar, escolher produtos e colocar na sacola.',
    antiRejectionTips: [
      'Mãos selecionando produtos nas gôndolas e colocando no carrinho',
      'NUNCA filmar o rosto de caixas ou outros clientes'
    ],
    icon: 'ShoppingBag',
    badge: 'Oficial Minute Data',
    matches: (a) => Boolean(a.doesGroceryShopping ?? true),
  },

  // 23. Veículo: Limpar o Carro
  {
    id: 'minute-limpar-o-carro',
    title: 'Limpar o Carro',
    categoryName: 'Cuidados com o Veículo Pessoal',
    frequency: 'weekly',
    recommendedMinutes: 40,
    timesPerWeek: 1,
    description: 'Limpar o interior ou exterior de um carro, como remover lixo, aspirar, limpar superfícies e lataria.',
    antiRejectionTips: [
      'IMPORTANTE: Não enquadre a placa do veículo',
      'Mãos aspirando estofados ou lavando a lataria'
    ],
    icon: 'Car',
    badge: 'Alta Renda (~40min)',
    matches: (a) => a.hasVehicle,
  },

  // 24. Veículo: Verificar e Completar o Óleo
  {
    id: 'minute-verificar-completar-oleo',
    title: 'Verificar e Completar o Óleo',
    categoryName: 'Cuidados com o Veículo Pessoal',
    frequency: 'weekly',
    recommendedMinutes: 15,
    timesPerWeek: 1,
    description: 'Verificar o nível de óleo do motor e completar se necessário.',
    antiRejectionTips: [
      'Puxar a vareta do óleo, limpar com estopa, recolocar e verificar nível'
    ],
    icon: 'Car',
    matches: (a) => a.hasVehicle,
  },

  // 25. Veículo: Verificar a Pressão dos Pneus
  {
    id: 'minute-verificar-pressao-pneus',
    title: 'Verificar a Pressão dos Pneus',
    categoryName: 'Cuidados com o Veículo Pessoal',
    frequency: 'weekly',
    recommendedMinutes: 15,
    timesPerWeek: 1,
    description: 'Verificar a pressão dos pneus com um calibrador e adicionar ar conforme necessário.',
    antiRejectionTips: [
      'Desrosquear tampa da válvula e acoplar calibrador no pneu'
    ],
    icon: 'Car',
    matches: (a) => a.hasVehicle,
  },

  // 26. Veículo: Trocar um Pneu
  {
    id: 'minute-trocar-um-pneu',
    title: 'Trocar um Pneu',
    categoryName: 'Cuidados com o Veículo Pessoal',
    frequency: 'weekly',
    recommendedMinutes: 35,
    timesPerWeek: 1,
    description: 'Remover um pneu do veículo e montar um estepe ou pneu de substituição.',
    antiRejectionTips: [
      'Chave de roda soltando os parafusos e operação do macaco'
    ],
    icon: 'Car',
    matches: (a) => a.hasVehicle,
  },

  // 27. Tarefas Externas: Abastecer o Carro
  {
    id: 'minute-abastecer-o-carro',
    title: 'Abastecer o Carro',
    categoryName: 'Tarefas Externas',
    frequency: 'weekly',
    recommendedMinutes: 15,
    timesPerWeek: 2,
    description: 'Abastecer um veículo em um posto de combustível.',
    antiRejectionTips: [
      'Abrir bocal do combustível e interagir com o posto',
      'Não filmar placas de outros veículos ou rostos de frentistas'
    ],
    icon: 'Fuel',
    badge: 'Oficial Minute Data',
    matches: (a) => Boolean(a.refuelsVehicle ?? true) && a.hasVehicle,
  },

  // 28. Área Externa: Regar Plantas Externas
  {
    id: 'minute-regar-plantas-externas',
    title: 'Regar Plantas Externas',
    categoryName: 'Área Externa e Quintal',
    frequency: 'weekly',
    recommendedMinutes: 20,
    timesPerWeek: 3,
    description: 'Regar plantas, canteiros ou uma horta ao ar livre.',
    antiRejectionTips: [
      'Mãos com mangueira ou regador molhando a terra e canteiros'
    ],
    icon: 'Flower2',
    matches: (a) => Boolean(a.hasLawnOrGarden),
  },

  // 29. Área Externa: Lavar com Alta Pressão
  {
    id: 'minute-lavar-alta-pressao',
    title: 'Lavar com Alta Pressão',
    categoryName: 'Área Externa e Quintal',
    frequency: 'weekly',
    recommendedMinutes: 35,
    timesPerWeek: 1,
    description: 'Lavar com jato de alta pressão superfícies externas, como um pátio ou a entrada da garagem.',
    antiRejectionTips: [
      'Mãos empunhando a lança da lavadora de alta pressão',
      'Foco no jato retirando a sujeira do piso'
    ],
    icon: 'Sparkles',
    badge: 'R$ Alto Potencial',
    matches: (a) => Boolean(a.hasPressureWasher),
  },

  // 30. Área Externa: Juntar ou Soprar Folhas
  {
    id: 'minute-juntar-soprar-folhas',
    title: 'Juntar ou Soprar Folhas',
    categoryName: 'Área Externa e Quintal',
    frequency: 'weekly',
    recommendedMinutes: 30,
    timesPerWeek: 2,
    description: 'Juntar folhas e detritos do quintal em pilhas com rastelo ou soprador, e ensacar ou remover.',
    antiRejectionTips: [
      'Mãos operando o ancinho/rastelo juntando o monte de folhas no gramado'
    ],
    icon: 'TreePine',
    matches: (a) => Boolean(a.hasLawnOrGarden),
  },

  // 31. Área Externa: Podar Cercas Vivas e Galhos
  {
    id: 'minute-podar-cercas-vivas',
    title: 'Podar Cercas Vivas e Galhos',
    categoryName: 'Área Externa e Quintal',
    frequency: 'weekly',
    recommendedMinutes: 35,
    timesPerWeek: 1,
    description: 'Aparar, modelar ou podar cercas vivas, arbustos ou galhos de árvores e recolher os restos.',
    antiRejectionTips: [
      'Mãos empunhando tesoura de poda ou aparador',
      'Recolher os galhos cortados em seguida'
    ],
    icon: 'Scissors',
    matches: (a) => Boolean(a.hasLawnOrGarden),
  },

  // 32. Área Externa: Plantar ou Arrancar Ervas Daninhas
  {
    id: 'minute-plantar-arrancar-ervas',
    title: 'Plantar ou Arrancar Ervas Daninhas',
    categoryName: 'Área Externa e Quintal',
    frequency: 'weekly',
    recommendedMinutes: 30,
    timesPerWeek: 2,
    description: 'Plantar flores, mudas ou cultivos, ou arrancar ervas daninhas de canteiros, bordas ou do jardim.',
    antiRejectionTips: [
      'Mãos com pazinha de jardinagem ou luvas arrancando matinhos e plantando'
    ],
    icon: 'Flower2',
    matches: (a) => Boolean(a.hasLawnOrGarden),
  },

  // 33. Área Externa: Arrumar Móveis de Área Externa
  {
    id: 'minute-arrumar-moveis-externos',
    title: 'Arrumar Móveis de Área Externa',
    categoryName: 'Área Externa e Quintal',
    frequency: 'weekly',
    recommendedMinutes: 25,
    timesPerWeek: 2,
    description: 'Organizar e limpar móveis de área externa ou de pátio.',
    antiRejectionTips: [
      'Passar pano em mesas de varanda, ajeitar cadeiras e almofadas de pátio'
    ],
    icon: 'Home',
    matches: (a) => a.hasYard,
  },

  // 34. Área Externa: Limpeza da Piscina
  {
    id: 'minute-limpeza-piscina',
    title: 'Limpeza da Piscina',
    categoryName: 'Área Externa e Quintal',
    frequency: 'weekly',
    recommendedMinutes: 25,
    timesPerWeek: 2,
    description: 'Peneirar ou limpar a piscina e manter a área ao redor.',
    antiRejectionTips: [
      'Mãos segurando a haste da peneira e retirando folhas da água',
      'Cuidado com reflexo do rosto na água da piscina'
    ],
    icon: 'Waves',
    matches: (a) => Boolean(a.hasPool),
  },

  // 35. Área Externa: Limpeza de Calhas
  {
    id: 'minute-limpeza-calhas',
    title: 'Limpeza de Calhas',
    categoryName: 'Área Externa e Quintal',
    frequency: 'weekly',
    recommendedMinutes: 30,
    timesPerWeek: 1,
    description: 'Remover folhas e detritos de calhas e condutores.',
    antiRejectionTips: [
      'Mãos com luvas retirando a sujeira acumulada na calha'
    ],
    icon: 'Home',
    matches: (a) => a.housingType === 'casa',
  },

  // 36. Área Externa: Empilhar Lenha
  {
    id: 'minute-empilhar-lenha',
    title: 'Empilhar Lenha',
    categoryName: 'Área Externa e Quintal',
    frequency: 'weekly',
    recommendedMinutes: 25,
    timesPerWeek: 1,
    description: 'Empilhar lenha cortada em uma pilha ou suporte firme e organizado.',
    antiRejectionTips: [
      'Mãos pegando pedaços de madeira e empilhando alinhadamente'
    ],
    icon: 'Boxes',
    matches: (a) => a.housingType === 'casa',
  },

  // 37. Organização: Organizar a Garagem
  {
    id: 'minute-organizar-a-garagem',
    title: 'Organizar a Garagem',
    categoryName: 'Organização e Armazenamento',
    frequency: 'weekly',
    recommendedMinutes: 35,
    timesPerWeek: 1,
    description: 'Separar e organizar itens, prateleiras ou bagunça em uma garagem ou área de armazenamento.',
    antiRejectionTips: [
      'Mãos reposicionando caixas plásticas, ferramentas e itens nas prateleiras'
    ],
    icon: 'Boxes',
    matches: (a) => Boolean(a.hasGarageStorage),
  },

  // 38. Organização: Carregar ou Descarregar o Carro
  {
    id: 'minute-carregar-descarregar-carro',
    title: 'Carregar ou Descarregar o Carro',
    categoryName: 'Organização e Armazenamento',
    frequency: 'weekly',
    recommendedMinutes: 20,
    timesPerWeek: 1,
    description: 'Colocar malas e itens no carro para uma viagem, ou retirá-los na volta.',
    antiRejectionTips: [
      'Mãos acomodando malas e caixas no porta-malas'
    ],
    icon: 'Car',
    matches: (a) => a.hasVehicle,
  },

  // 39. Organização: Buscar e Guardar Itens em Depósito
  {
    id: 'minute-buscar-guardar-armazenamento',
    title: 'Buscar e Guardar Itens em Depósito',
    categoryName: 'Organização e Armazenamento',
    frequency: 'weekly',
    recommendedMinutes: 20,
    timesPerWeek: 2,
    description: 'Levar itens para uma área de armazenamento ou trazê-los de lá, e guardar organizadamente.',
    antiRejectionTips: [
      'Mãos transportando recipientes e organizando no armário alto/depósito'
    ],
    icon: 'Boxes',
    matches: () => true,
  },

  // 40. Arrumação: Limpar os Equipamentos de Academia
  {
    id: 'minute-limpar-equipamentos-academia',
    title: 'Limpar os Equipamentos de Academia',
    categoryName: 'Arrumação e Limpeza',
    frequency: 'weekly',
    recommendedMinutes: 20,
    timesPerWeek: 3,
    description: 'Limpar os equipamentos da academia após o uso e colocar os pesos de volta no lugar.',
    antiRejectionTips: [
      'Passar pano com álcool em halteres, banco, colchonete e organizar pesos'
    ],
    icon: 'Dumbbell',
    matches: (a) => Boolean(a.hasHomeGym),
  },

  // 41. Manutenção: Apertar Dobradiças de Armários
  {
    id: 'minute-apertar-dobradicas',
    title: 'Apertar Dobradiças de Armários',
    categoryName: 'Manutenção e Projetos Domésticos',
    frequency: 'weekly',
    recommendedMinutes: 20,
    timesPerWeek: 1,
    description: 'Apertar ou ajustar dobradiças, puxadores e maçanetas de armários e portas.',
    antiRejectionTips: [
      'Mãos usando chave de fenda/Philips ou parafusadeira ajustando os parafusos'
    ],
    icon: 'Wrench',
    matches: (a) => Boolean(a.hasToolsDIY),
  },

  // 42. Manutenção: Trocar Lâmpadas ou Pilhas
  {
    id: 'minute-trocar-lampadas-pilhas',
    title: 'Trocar Lâmpadas ou Pilhas',
    categoryName: 'Manutenção e Projetos Domésticos',
    frequency: 'weekly',
    recommendedMinutes: 15,
    timesPerWeek: 1,
    description: 'Trocar lâmpadas em luminárias ou pilhas em aparelhos domésticos.',
    antiRejectionTips: [
      'Desrosquear a lâmpada do soquete ou abrir compartimento de pilhas'
    ],
    icon: 'Zap',
    matches: () => true,
  },

  // 43. Manutenção: Trocar o Chuveiro
  {
    id: 'minute-trocar-chuveiro',
    title: 'Trocar o Chuveiro',
    categoryName: 'Manutenção e Projetos Domésticos',
    frequency: 'weekly',
    recommendedMinutes: 30,
    timesPerWeek: 1,
    description: 'Remover um chuveiro antigo ou acessório semelhante e instalar um novo.',
    antiRejectionTips: [
      'Passar fita veda-rosca, rosquear cano com as mãos',
      'Cuidado com reflexo de espelhos no banheiro'
    ],
    icon: 'Wrench',
    matches: (a) => Boolean(a.hasToolsDIY),
  },

  // 44. Manutenção: Montagem de Móveis
  {
    id: 'minute-montagem-moveis',
    title: 'Montagem de Móveis',
    categoryName: 'Manutenção e Projetos Domésticos',
    frequency: 'weekly',
    recommendedMinutes: 45,
    timesPerWeek: 1,
    description: 'Montar móveis ou itens semelhantes a partir de suas peças, usando ferramentas conforme instruções.',
    antiRejectionTips: [
      'Mãos parafusando, encaixando cavilhas e seguindo o manual',
      'Gravação longa e contínua'
    ],
    icon: 'Wrench',
    badge: 'Alta Duração (~45min)',
    matches: (a) => Boolean(a.hasToolsDIY),
  },

  // 45. Manutenção: Pendurar Quadros e Espelhos
  {
    id: 'minute-pendurar-quadros-espelhos',
    title: 'Pendurar Quadros e Espelhos',
    categoryName: 'Manutenção e Projetos Domésticos',
    frequency: 'weekly',
    recommendedMinutes: 30,
    timesPerWeek: 1,
    description: 'Pendurar quadros ou espelhos, incluindo medir, furar e fixar.',
    antiRejectionTips: [
      'Trena medindo a parede, furadeira/martelo e fixação do quadro',
      'ATENÇÃO: Se for espelho, não filme seu rosto refletido'
    ],
    icon: 'Wrench',
    matches: (a) => Boolean(a.hasToolsDIY),
  },

  // 46. Manutenção: Pendurar Cortinas
  {
    id: 'minute-pendurar-cortinas',
    title: 'Pendurar Cortinas',
    categoryName: 'Manutenção e Projetos Domésticos',
    frequency: 'weekly',
    recommendedMinutes: 25,
    timesPerWeek: 1,
    description: 'Instalar os suportes e pendurar cortinas ou persianas.',
    antiRejectionTips: [
      'Mãos encaixando ilhoses no varão e fixando nos suportes da parede'
    ],
    icon: 'Home',
    matches: () => true,
  },

  // 47. Manutenção: Montar Decoração de Festas
  {
    id: 'minute-montar-decoracao-festas',
    title: 'Montar Decoração de Festas',
    categoryName: 'Manutenção e Projetos Domésticos',
    frequency: 'weekly',
    recommendedMinutes: 30,
    timesPerWeek: 1,
    description: 'Colocar ou retirar decorações festivas pela casa.',
    antiRejectionTips: [
      'Pendurar enfeites, luzinhas ou enfeites de mesa com cuidado'
    ],
    icon: 'Sparkles',
    matches: () => true,
  },

  // 48. Interações: Copiar a Tarefa de Alguém
  {
    id: 'minute-copiar-tarefa-alguem',
    title: 'Copiar a Tarefa de Alguém',
    categoryName: 'Interações',
    frequency: 'weekly',
    recommendedMinutes: 25,
    timesPerWeek: 2,
    description: 'Observe alguém realizar qualquer tarefa com as mãos e, em seguida, copie o que a pessoa fez.',
    antiRejectionTips: [
      'Foco nas mãos da outra pessoa primeiro, e depois nas suas reproduzindo',
      'Não focalizar rostos de perto'
    ],
    icon: 'Users',
    badge: 'Gravação em Dupla',
    matches: (a) => Boolean(a.recordsWithPartner),
  },

  // 49. Interações: Jogos de Tabuleiro ou Cartas
  {
    id: 'minute-jogos-tabuleiro-cartas',
    title: 'Jogos de Tabuleiro ou Cartas',
    categoryName: 'Interações',
    frequency: 'weekly',
    recommendedMinutes: 30,
    timesPerWeek: 2,
    description: 'Embaralhar, distribuir cartas, mover peças de tabuleiro e jogar em interação.',
    antiRejectionTips: [
      'Mãos manipulando as cartas e peças na mesa',
      'Boa luz sobre o tabuleiro'
    ],
    icon: 'Users',
    badge: 'Interação Lúdica',
    matches: (a) => Boolean(a.recordsWithPartner),
  },

  // 50. Hotel: Lavanderia de Hotel
  {
    id: 'minute-hotel-rouparia',
    title: 'Lavanderia ou Rouparia de Hotel',
    categoryName: 'Hotel ou Hospedagem',
    frequency: 'weekly',
    recommendedMinutes: 40,
    timesPerWeek: 3,
    description: 'Separar, lavar, secar ou dobrar o enxoval do hotel. Deve ser em ambiente de hotel.',
    antiRejectionTips: [
      'Deve ser obrigatoriamente gravado em ambiente de hotel/pousada',
      'Mãos manuseando lençóis e toalhas do enxoval'
    ],
    icon: 'Hotel',
    badge: 'Ambiente Hotel',
    matches: (a) => Boolean(a.worksInHotelOrLaundry),
  },

  // 51. Comercial: Operação de Lavanderia Industrial
  {
    id: 'minute-lavanderia-industrial',
    title: 'Operação de Lavanderia Industrial',
    categoryName: 'Limpeza Comercial ou Zeladoria',
    frequency: 'weekly',
    recommendedMinutes: 45,
    timesPerWeek: 3,
    description: 'Operar lavadoras ou secadoras industriais para enxoval institucional ou uniformes.',
    antiRejectionTips: [
      'Ambiente comercial com maquinário industrial',
      'Não filmar crachás ou outros funcionários'
    ],
    icon: 'Briefcase',
    badge: 'Taxa Comercial',
    matches: (a) => Boolean(a.worksInHotelOrLaundry || a.hasCommercialAccess),
  },

  // 52. Memória: Localizar e Lembrar de Objetos
  {
    id: 'minute-tarefas-memoria-objetos',
    title: 'Localizar e Lembrar de Objetos',
    categoryName: 'Tarefas de memória',
    frequency: 'weekly',
    recommendedMinutes: 20,
    timesPerWeek: 1,
    description: 'Procurar e resgatar itens armazenados exercitando localização e memória visual.',
    antiRejectionTips: [
      'Movimentos contínuos procurando e encontrando os itens solicitados'
    ],
    icon: 'Brain',
    matches: () => true,
  },
];

export function getFilteredRoutineTasks(answers: HouseholdAnswers) {
  const eligible = ALL_ROUTINE_TASKS.filter((t) => t.matches(answers));

  const dailyTasks = eligible.filter((t) => t.frequency === 'daily');
  const weeklyTasks = eligible.filter((t) => t.frequency === 'weekly');

  const dailyTotalMinutesWeek = dailyTasks.reduce(
    (acc, t) => acc + t.recommendedMinutes * t.timesPerWeek,
    0
  );
  const weeklyTotalMinutesWeek = weeklyTasks.reduce(
    (acc, t) => acc + t.recommendedMinutes * t.timesPerWeek,
    0
  );

  const totalPotentialMinutesPerWeek = dailyTotalMinutesWeek + weeklyTotalMinutesWeek;
  const potentialHoursPerWeek = (totalPotentialMinutesPerWeek / 60).toFixed(1);

  const dailyMinutesPerDay = dailyTasks.reduce((acc, t) => acc + t.recommendedMinutes, 0);
  const dailyHoursPerDay = (dailyMinutesPerDay / 60).toFixed(1);

  return {
    allEligible: eligible,
    dailyTasks,
    weeklyTasks,
    dailyMinutesPerDay,
    dailyHoursPerDay: parseFloat(dailyHoursPerDay),
    totalPotentialMinutesPerWeek,
    potentialHoursPerWeek: parseFloat(potentialHoursPerWeek),
  };
}

export const MINUTE_DATA_GOLDEN_RULES = [
  {
    title: 'Ângulo POV Correto (Head Mount)',
    description: 'O celular deve estar na testa ou no peito apontando diretamente para as suas mãos e os objetos da tarefa.',
    badge: 'Obrigatório',
    color: 'emerald',
  },
  {
    title: 'Duas Mãos Sempre Visíveis',
    description: 'A IA aprende observando a manipulação bimanual (segurar com uma mão e cortar/lavar com a outra).',
    badge: 'Essencial',
    color: 'emerald',
  },
  {
    title: 'Privacidade Total (Zero Rostos)',
    description: 'Nunca filme rostos de familiares, crianças ou vizinhos. Evite também espelhos que revelem você e documentos pessoais.',
    badge: 'Regra de Ouro',
    color: 'amber',
  },
  {
    title: 'Sem Músicas ou TV ao Fundo',
    description: 'Televisões ligadas, rádios ou músicas protegidas por direitos autorais levam à rejeição sumária do vídeo.',
    badge: 'Áudio Limpo',
    color: 'amber',
  },
  {
    title: 'Ritmo Natural e Sem Pausas',
    description: 'Não acelere e nem desacelere artificialmente os movimentos. Não pause a gravação no meio.',
    badge: 'Qualidade',
    color: 'teal',
  },
  {
    title: 'Tempo Mínimo Respeitado',
    description: 'Grave sempre pelo menos a duração mínima exigida para aquela categoria (geralmente entre 15 e 30 minutos contínuos).',
    badge: 'Aprovação',
    color: 'teal',
  },
];
