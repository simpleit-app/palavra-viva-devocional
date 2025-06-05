
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { count = 10 } = await req.json();
    
    console.log(`Generating ${count} new verses with OpenAI`);

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY not found in environment variables');
    }

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

      const prompt = `Crie um versículo bíblico inspirador em português brasileiro com as seguintes características:
      
1. Deve ser reconfortante e motivacional
2. Incluir uma referência bíblica realista (livro, capítulo e versículo)
3. O texto deve ter entre 80-200 caracteres
4. Deve transmitir esperança, fé, amor, sabedoria ou coragem
5. Use linguagem moderna mas respeitosa
6. Varie entre diferentes livros bíblicos (Salmos, Provérbios, João, Romanos, Mateus, etc.)

Retorne no seguinte formato JSON:
{
  "book": "Nome do livro bíblico",
  "chapter": número_do_capítulo,
  "verse": número_do_versículo,
  "text": "Texto do versículo aqui",
  "summary": "Uma explicação devocional de 2-3 frases sobre o significado e aplicação do versículo"
}`;

      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: 'Você é um especialista em textos bíblicos e devocionais. Crie versículos inspiradores que tragam esperança e fé às pessoas. Sempre retorne um JSON válido.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            max_tokens: 500,
            temperature: 0.8,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`OpenAI API error: ${response.status} - ${errorText}`);
          
          // Check for quota exceeded error
          if (response.status === 429) {
            console.error('OpenAI quota exceeded - stopping generation');
            break; // Stop trying more verses
          }
          
          continue; // Skip this iteration but continue with others
        }

        const openaiData = await response.json();
        const generatedContent = openaiData.choices[0].message.content;
        
        console.log('Generated content:', generatedContent);

        let verseData;
        try {
          // Clean the response to extract JSON
          const jsonMatch = generatedContent.match(/\{[\s\S]*\}/);
          const jsonString = jsonMatch ? jsonMatch[0] : generatedContent;
          verseData = JSON.parse(jsonString);
        } catch (parseError) {
          console.error('Failed to parse OpenAI response:', generatedContent);
          // Use a fallback verse if parsing fails
          verseData = {
            book: "Salmos",
            chapter: 23 + (i % 10),
            verse: 1 + (i % 15),
            text: "O Senhor é meu pastor; nada me faltará. Ele me faz repousar em verdes pastos e me guia às águas tranquilas.",
            summary: "Este versículo nos lembra que Deus cuida de nós como um pastor cuida de suas ovelhas. Sua presença traz paz e provisão em nossa jornada."
          };
        }

        // Generate unique ID
        const verseId = `${verseData.book.toLowerCase().replace(/\s+/g, '-')}-${verseData.chapter}-${verseData.verse}-${Date.now()}-${i}`;

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

        successfulGenerations.push({
          id: verseId,
          ...verseData,
          verse_order: nextOrder,
          is_generated: true
        });

        nextOrder++;

      } catch (error) {
        console.error(`Error generating verse ${i + 1}:`, error);
        
        // If it's a quota error, break the loop
        if (error.message && error.message.includes('quota')) {
          console.error('Quota exceeded - stopping generation');
          break;
        }
        
        continue; // Continue with next verse
      }
    }

    console.log(`Successfully generated and saved ${successfulGenerations.length} out of ${count} requested verses`);

    // Return appropriate response based on success
    if (successfulGenerations.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Não foi possível gerar versículos. Verifique sua cota da OpenAI.",
          message: "Quota da OpenAI pode ter sido excedida ou há outro problema de API.",
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
