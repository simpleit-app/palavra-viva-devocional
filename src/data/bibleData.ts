
// Types for Bible Study content
export type BibleVerse = {
  id: string;
  book: string;
  chapter: number;
  verse: number;
  text: string;
  summary: string;
  order: number;
};

export type UserReflection = {
  id: string;
  verseId: string;
  userId: string;
  text: string;
  createdAt: Date;
};

export type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: string;
  requiredCount: number;
  type: 'reading' | 'reflection' | 'streak';
};

// Mock Bible verses with devotional content
export const bibleVerses: BibleVerse[] = [
  {
    id: "1",
    book: "João",
    chapter: 3,
    verse: 16,
    text: "Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna.",
    summary: "Este é um dos versículos mais conhecidos da Bíblia. Ele resume o evangelho em uma única frase, destacando o amor incomparável de Deus pela humanidade. Deus enviou Jesus não para condenar, mas para salvar.",
    order: 1
  },
  {
    id: "2",
    book: "Salmos",
    chapter: 23,
    verse: 1,
    text: "O Senhor é o meu pastor, nada me faltará.",
    summary: "Escrito pelo rei Davi, este salmo expressa confiança absoluta na provisão de Deus. Assim como um pastor cuida de suas ovelhas, Deus cuida de nós com amor e atenção aos detalhes de nossas vidas.",
    order: 2
  },
  {
    id: "3",
    book: "Filipenses",
    chapter: 4,
    verse: 13,
    text: "Posso todas as coisas naquele que me fortalece.",
    summary: "Paulo escreve esta carta enquanto está preso. Ele aprendeu o segredo do contentamento em qualquer situação - confiar na força que Cristo provê. Esta força não é para realizações egoístas, mas para cumprir a vontade de Deus.",
    order: 3
  },
  {
    id: "4",
    book: "Romanos",
    chapter: 8,
    verse: 28,
    text: "Sabemos que todas as coisas cooperam para o bem daqueles que amam a Deus, daqueles que são chamados segundo o seu propósito.",
    summary: "Esta passagem nos lembra que Deus trabalha em todas as circunstâncias para o bem daqueles que o amam. Não significa que tudo o que acontece seja bom, mas que Deus pode usar todas as situações para um propósito maior.",
    order: 4
  },
  {
    id: "5",
    book: "Provérbios",
    chapter: 3,
    verse: 5,
    text: "Confie no Senhor de todo o seu coração e não se apoie em seu próprio entendimento.",
    summary: "Salomão nos ensina a importância de confiar em Deus acima de nossa própria sabedoria. Em um mundo que valoriza a autonomia, somos chamados a depender humildemente da sabedoria superior de Deus.",
    order: 5
  },
  {
    id: "6",
    book: "Isaías",
    chapter: 40,
    verse: 31,
    text: "Mas aqueles que esperam no Senhor renovarão as suas forças. Voarão alto como águias; correrão e não ficarão exaustos, caminharão e não se cansarão.",
    summary: "Isaías nos lembra que esperar em Deus não é passividade, mas uma postura ativa de confiança. Quando confiamos em Deus, ele renova nossas forças espirituais, emocionais e às vezes até físicas.",
    order: 6
  },
  {
    id: "7",
    book: "Mateus",
    chapter: 11,
    verse: 28,
    text: "Venham a mim, todos os que estão cansados e sobrecarregados, e eu lhes darei descanso.",
    summary: "Jesus oferece um convite radical: trocar nossos fardos pelo seu descanso. Em um mundo que glorifica o trabalho incessante, Jesus nos chama para encontrar descanso verdadeiro em relacionamento com ele.",
    order: 7
  }
];

// Mock user reflections
export const userReflections: UserReflection[] = [
  {
    id: "1",
    verseId: "1",
    userId: "1",
    text: "Este versículo me lembra que o amor de Deus é incondicional. Mesmo nos meus piores momentos, Deus me ama tanto que enviou seu único Filho para me salvar.",
    createdAt: new Date("2024-04-01")
  },
  {
    id: "2",
    verseId: "2",
    userId: "1",
    text: "Quando me sinto ansioso sobre o futuro, este versículo me traz paz. Se Deus é meu pastor, posso confiar que Ele suprirá todas as minhas necessidades.",
    createdAt: new Date("2024-04-05")
  },
  {
    id: "3",
    verseId: "5",
    userId: "1",
    text: "Muitas vezes tento resolver tudo sozinho, mas este versículo me lembra que preciso confiar em Deus primeiro, antes da minha própria compreensão.",
    createdAt: new Date("2024-04-10")
  }
];

// Mock achievements
export const achievements: Achievement[] = [
  {
    id: "1",
    title: "Primeira Reflexão",
    description: "Escreveu sua primeira reflexão bíblica",
    icon: "edit",
    requiredCount: 1,
    type: "reflection"
  },
  {
    id: "2",
    title: "Estudioso Iniciante",
    description: "Leu 5 passagens bíblicas",
    icon: "book-open",
    requiredCount: 5,
    type: "reading"
  },
  {
    id: "3",
    title: "Semana da Palavra",
    description: "Completou 7 dias consecutivos de leitura",
    icon: "calendar",
    requiredCount: 7,
    type: "streak"
  },
  {
    id: "4",
    title: "Escritor da Fé",
    description: "Escreveu 10 reflexões bíblicas",
    icon: "pen",
    requiredCount: 10,
    type: "reflection"
  },
  {
    id: "5",
    title: "Discípulo Dedicado",
    description: "Leu 20 passagens bíblicas",
    icon: "bookmark",
    requiredCount: 20,
    type: "reading"
  }
];

// Mock user progress data
export const userProgress = {
  chaptersRead: ["1", "2", "5"],
  lastReadDate: new Date("2024-04-10")
};
