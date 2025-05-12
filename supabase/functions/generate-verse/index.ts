
// Esta é uma função Supabase Edge que gera versículos inspiradores usando metáforas aleatórias
// Para simular uma solução de IA sem necessidade de API keys externas

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const bookNames = [
      "Provérbios", "Salmos", "Eclesiastes", "Isaías", "Mateus", "João",
      "Romanos", "Coríntios", "Gálatas", "Efésios", "Filipenses", "Colossenses"
    ];
    
    const subjects = [
      "amor", "fé", "esperança", "caridade", "bondade", "paciência", 
      "sabedoria", "coragem", "paz", "gratidão", "perdão", "humildade"
    ];
    
    const verbs = [
      "é como", "assemelha-se a", "floresce como", "brilha como", 
      "cresce como", "expande-se como", "renova-se como", "fortalece como"
    ];
    
    const metaphors = [
      "uma luz no caminho escuro", "água fresca no deserto", "árvore que dá bons frutos",
      "ouro puro refinado pelo fogo", "semente plantada em solo fértil", "porto seguro na tempestade",
      "abrigo na tormenta", "orvalho na manhã", "estrela que guia o viajante",
      "rocha firme que não se abala", "mel que adoça a vida", "perfume que se espalha"
    ];
    
    const conclusions = [
      "Busque isto com todo seu coração.", 
      "Que isto seja seu tesouro eterno.",
      "Aquele que encontrar isto, encontrará a vida.",
      "Guarde isto no centro de seu ser.",
      "Caminhe nisto todos os dias.",
      "Não se afaste deste caminho.",
      "Nisto está a verdadeira sabedoria.",
      "Que isto seja sua força diária."
    ];

    // Selecionar aleatoriamente de cada lista
    const randomBook = bookNames[Math.floor(Math.random() * bookNames.length)];
    const randomChapter = Math.floor(Math.random() * 150) + 1;
    const randomVerseNum = Math.floor(Math.random() * 30) + 1;
    
    const subject = subjects[Math.floor(Math.random() * subjects.length)];
    const verb = verbs[Math.floor(Math.random() * verbs.length)];
    const metaphor = metaphors[Math.floor(Math.random() * metaphors.length)];
    const conclusion = conclusions[Math.floor(Math.random() * conclusions.length)];
    
    // Construir o versículo inspirador
    const capitalizedSubject = subject.charAt(0).toUpperCase() + subject.slice(1);
    const verseText = `${capitalizedSubject} ${verb} ${metaphor}. ${conclusion}`;
    
    // Construir um sumário inspirador
    const summaries = [
      `Este versículo nos lembra da importância de cultivar ${subject} em nossas vidas diárias.`,
      `A analogia entre ${subject} e ${metaphor.split(' ').slice(1).join(' ')} nos ajuda a entender seu valor eterno.`,
      `Refletir sobre como ${subject} se relaciona com ${metaphor} pode transformar nossa perspectiva espiritual.`,
      `Quando meditamos sobre ${subject}, encontramos força e propósito para nossa jornada.`
    ];
    
    const summary = summaries[Math.floor(Math.random() * summaries.length)];
    
    // Construir o objeto de resposta
    const aiGeneratedVerse = {
      id: `ai-${Date.now()}`,
      book: randomBook,
      chapter: randomChapter,
      verse: randomVerseNum,
      text: verseText,
      summary: summary,
      order: -1,
      isGenerated: true
    };
    
    return new Response(
      JSON.stringify({ verse: aiGeneratedVerse }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error('Error generating verse:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
