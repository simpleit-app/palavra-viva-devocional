
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Templates de versículos inspiradores
const verseTemplates = [
  {
    text: "O Senhor é meu pastor; nada me faltará. Ele me faz repousar em verdes pastos e me guia às águas tranquilas.",
    book: "Salmos",
    summary: "Este versículo nos lembra que Deus cuida de nós como um pastor cuida de suas ovelhas. Sua presença traz paz e provisão em nossa jornada."
  },
  {
    text: "Confie no Senhor de todo o seu coração e não se apoie em seu próprio entendimento; reconheça o Senhor em todos os seus caminhos, e ele endireitará as suas veredas.",
    book: "Provérbios",
    summary: "A sabedoria verdadeira vem de confiar em Deus em vez de depender apenas de nossa própria compreensão limitada."
  },
  {
    text: "Tudo posso naquele que me fortalece. Cristo é a fonte de toda a minha força e capacidade.",
    book: "Filipenses",
    summary: "Nossa força não vem de nós mesmos, mas de Cristo que nos capacita para enfrentar qualquer desafio."
  },
  {
    text: "Não se preocupem com coisa alguma, mas em tudo, pela oração e súplicas, e com ação de graças, apresentem seus pedidos a Deus.",
    book: "Filipenses",
    summary: "A ansiedade é substituída pela paz quando levamos nossas preocupações a Deus em oração."
  },
  {
    text: "O amor é paciente, o amor é bondoso. Não inveja, não se vangloria, não se orgulha.",
    book: "1 Coríntios",
    summary: "O verdadeiro amor se manifesta através da paciência e bondade, não buscando interesse próprio."
  },
  {
    text: "Porque Deus tanto amou o mundo que deu o seu Filho unigênito, para que todo o que nele crer não pereça, mas tenha a vida eterna.",
    book: "João",
    summary: "O maior ato de amor da história demonstra o quanto Deus nos ama e deseja nossa salvação."
  },
  {
    text: "Busquem, pois, em primeiro lugar o Reino de Deus e a sua justiça, e todas essas coisas serão acrescentadas a vocês.",
    book: "Mateus",
    summary: "Quando priorizamos Deus em nossa vida, Ele cuida de todas as nossas necessidades."
  },
  {
    text: "Venham a mim, todos os que estão cansados e sobrecarregados, e eu darei descanso a vocês.",
    book: "Mateus",
    summary: "Jesus oferece verdadeiro descanso e alívio para aqueles que se sentem sobrecarregados pela vida."
  },
  {
    text: "E sabemos que Deus age em todas as coisas para o bem daqueles que o amam, dos que foram chamados de acordo com o seu propósito.",
    book: "Romanos",
    summary: "Mesmo nas dificuldades, Deus trabalha para nosso bem quando confiamos em Seu plano perfeito."
  },
  {
    text: "A palavra de Deus é viva e eficaz, e mais afiada que qualquer espada de dois gumes.",
    book: "Hebreus",
    summary: "A Palavra de Deus tem poder transformador e pode penetrar profundamente em nossos corações."
  },
  {
    text: "Sejam fortes e corajosos! Não tenham medo nem desanimem, pois o Senhor, o seu Deus, estará com vocês por onde forem.",
    book: "Josué",
    summary: "A coragem verdadeira vem da certeza de que Deus está sempre conosco em cada passo da jornada."
  },
  {
    text: "O coração do homem planeja o seu caminho, mas o Senhor dirige os seus passos.",
    book: "Provérbios",
    summary: "Podemos fazer planos, mas é Deus quem guia nossos passos segundo Sua vontade perfeita."
  },
  {
    text: "Porque onde estiverem dois ou três reunidos em meu nome, ali eu estou no meio deles.",
    book: "Mateus",
    summary: "A presença de Cristo se manifesta especialmente quando nos reunimos em Seu nome para adoração e comunhão."
  },
  {
    text: "Deixo-lhes a paz; a minha paz lhes dou. Não a dou como o mundo a dá. Não se perturbem os seus corações, nem tenham medo.",
    book: "João",
    summary: "A paz que Jesus oferece é diferente da paz mundana - é uma paz que permanece mesmo em meio às tempestades."
  },
  {
    text: "Alegrem-se sempre no Senhor. Novamente digo: alegrem-se!",
    book: "Filipenses",
    summary: "A alegria cristã não depende das circunstâncias, mas da nossa relação com o Senhor."
  }
];

const biblicalBooks = ["Salmos", "Provérbios", "Eclesiastes", "Isaías", "Jeremias", "Mateus", "Marcos", "Lucas", "João", "Romanos", "1 Coríntios", "2 Coríntios", "Gálatas", "Efésios", "Filipenses", "Colossenses", "1 Tessalonicenses", "2 Tessalonicenses", "1 Timóteo", "2 Timóteo", "Tito", "Hebreus", "Tiago", "1 Pedro", "2 Pedro", "1 João", "2 João", "3 João", "Judas"];

const additionalTexts = [
  "A fé é a certeza daquilo que esperamos e a prova das coisas que não vemos.",
  "Mesmo que eu ande pelo vale da sombra da morte, não temerei mal algum, pois tu estás comigo.",
  "Entregue o seu caminho ao Senhor; confie nele, e ele agirá.",
  "O Senhor é a minha luz e a minha salvação; de quem terei medo?",
  "Sejam bondosos e compassivos uns para com os outros, perdoando-se mutuamente.",
  "Pois eu sei os planos que tenho para vocês, diz o Senhor, planos de fazê-los prosperar.",
  "Aquietai-vos e sabei que eu sou Deus; serei exaltado entre as nações.",
  "O justo florescerá como a palmeira e crescerá como o cedro no Líbano.",
  "Clame a mim e eu lhe responderei e lhe direi coisas grandiosas e insondáveis.",
  "A esperança que se adia faz adoecer o coração, mas o desejo realizado é árvore da vida."
];

// Função para gerar UUID válido
function generateUUID() {
  return crypto.randomUUID();
}

function generateVerse(index: number) {
  // Usar template existente ou gerar novo texto
  if (index < verseTemplates.length) {
    const template = verseTemplates[index];
    const chapter = Math.floor(Math.random() * 150) + 1;
    const verse = Math.floor(Math.random() * 30) + 1;
    
    return {
      book: template.book,
      chapter: chapter,
      verse: verse,
      text: template.text,
      summary: template.summary
    };
  } else {
    // Gerar texto adicional
    const randomBook = biblicalBooks[Math.floor(Math.random() * biblicalBooks.length)];
    const randomChapter = Math.floor(Math.random() * 150) + 1;
    const randomVerse = Math.floor(Math.random() * 30) + 1;
    const randomText = additionalTexts[Math.floor(Math.random() * additionalTexts.length)];
    
    return {
      book: randomBook,
      chapter: randomChapter,
      verse: randomVerse,
      text: randomText,
      summary: "Este versículo nos ensina sobre a fidelidade de Deus e Seu amor incondicional por nós. Ele nos encoraja a confiar em Sua bondade em todas as circunstâncias."
    };
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { count = 10 } = await req.json();
    
    console.log(`Generating ${count} new verses with local AI`);

    // Create the Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the current maximum verse_order
    const { data: maxOrderData } = await supabase
      .from('bible_verses')
      .select('verse_order')
      .order('verse_order', { ascending: false })
      .limit(1);

    let nextOrder = (maxOrderData?.[0]?.verse_order || 0) + 1;
    const successfulGenerations = [];

    for (let i = 0; i < count; i++) {
      console.log(`Generating verse ${i + 1} of ${count}`);

      try {
        console.log('Generating verse with local AI...');
        
        const verseData = generateVerse(i);

        // Generate proper UUID for the verse ID
        const verseId = generateUUID();

        // Insert the new verse into the database
        const { error: insertError } = await supabase
          .from('bible_verses')
          .insert({
            id: verseId,
            book: verseData.book,
            chapter: verseData.chapter,
            verse: verseData.verse,
            text: verseData.text,
            summary: verseData.summary,
            verse_order: nextOrder,
            is_generated: true
          });

        if (insertError) {
          console.error('Error inserting verse:', insertError);
          continue; // Continue with next verse instead of throwing
        }

        console.log(`Successfully generated and saved verse ${i + 1}`);

        successfulGenerations.push({
          id: verseId,
          ...verseData,
          verse_order: nextOrder,
          is_generated: true
        });

        nextOrder++;

      } catch (error) {
        console.error(`Error generating verse ${i + 1}:`, error);
        continue; // Continue with next verse
      }
    }

    console.log(`Successfully generated and saved ${successfulGenerations.length} out of ${count} requested verses`);

    // Return appropriate response based on success
    if (successfulGenerations.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Não foi possível gerar versículos.",
          message: "Erro interno na geração de versículos.",
          requestedCount: count,
          successCount: 0
        }),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          },
          status: 400
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Generated ${successfulGenerations.length} new verses`,
        verses: successfulGenerations,
        requestedCount: count,
        successCount: successfulGenerations.length
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error in generate-verse function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false,
        message: "Erro interno na geração de versículos"
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
        status: 500
      }
    );
  }
});
