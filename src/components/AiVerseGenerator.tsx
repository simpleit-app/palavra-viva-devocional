
import React from 'react';
import { useToast } from '@/hooks/use-toast';

interface AiVerseGeneratorProps {
  onVerseGenerated: (verse: any) => void;
}

const AiVerseGenerator: React.FC<AiVerseGeneratorProps> = ({ onVerseGenerated }) => {
  const { toast } = useToast();

  const generateAiVerse = async () => {
    try {
      toast({
        title: "Gerando versículo...",
        description: "Estamos criando um novo versículo para você com IA.",
      });

      // Create a randomly generated verse in the same format as our Bible verses
      const bookNames = ["Provérbios", "Salmos", "Eclesiastes", "Isaías", "Mateus", "João", "Romanos"];
      const randomBook = bookNames[Math.floor(Math.random() * bookNames.length)];
      const randomChapter = Math.floor(Math.random() * 150) + 1;
      const randomVerseNum = Math.floor(Math.random() * 30) + 1;
      
      const inspirationalTexts = [
        "O amor verdadeiro é paciente e bondoso. Não se vangloria, não se orgulha, não maltrata, não procura seus interesses.",
        "Todo aquele que busca a sabedoria com sinceridade encontrará o caminho da luz e da verdade eterna.",
        "Confie no caminho que o Senhor traça para você, mesmo quando não consegue ver onde ele leva.",
        "A palavra gentil é como mel para a alma, traz cura para o espírito e paz para o coração conturbado.",
        "Aquele que semeia bondade colherá amizades; aquele que compartilha sabedoria multiplica conhecimento."
      ];
      
      const randomText = inspirationalTexts[Math.floor(Math.random() * inspirationalTexts.length)];
      
      const aiGeneratedVerse = {
        id: "ai-" + Date.now(),
        book: randomBook,
        chapter: randomChapter,
        verse: randomVerseNum,
        text: randomText,
        summary: "Este versículo foi gerado especialmente para sua reflexão de hoje.",
        verse_order: -1,
        is_generated: true
      };
      
      onVerseGenerated(aiGeneratedVerse);
      
      toast({
        title: "Versículo Gerado com IA",
        description: "Um versículo inspirador foi criado para sua reflexão.",
      });
    } catch (error) {
      console.error("Erro ao gerar versículo:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível gerar um novo versículo. Tente novamente mais tarde.",
      });
    }
  };

  return { generateAiVerse };
};

export default AiVerseGenerator;
