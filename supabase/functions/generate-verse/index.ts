
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
    const { count = 1 } = await req.json();
    
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

    const generatedVerses = [];

    for (let i = 0; i < count; i++) {
      console.log(`Generating verse ${i + 1} of ${count}`);

      const prompt = `Crie um versículo bíblico inspirador em português brasileiro com as seguintes características:
      
1. Deve ser reconfortante e motivacional
2. Incluir uma referência bíblica realista (livro, capítulo e versículo)
3. O texto deve ter entre 50-150 caracteres
4. Deve transmitir esperança, fé ou amor
5. Use linguagem moderna mas respeitosa

Retorne no seguinte formato JSON:
{
  "book": "Nome do livro bíblico",
  "chapter": número_do_capítulo,
  "verse": número_do_versículo,
  "text": "Texto do versículo aqui",
  "summary": "Uma explicação devocional de 2-3 frases sobre o significado e aplicação do versículo"
}`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'Você é um especialista em textos bíblicos e devocionais. Crie versículos inspiradores que tragam esperança e fé às pessoas.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 400,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        console.error('OpenAI API error:', await response.text());
        throw new Error(`OpenAI API returned ${response.status}`);
      }

      const openaiData = await response.json();
      const generatedContent = openaiData.choices[0].message.content;
      
      console.log('Generated content:', generatedContent);

      let verseData;
      try {
        verseData = JSON.parse(generatedContent);
      } catch (parseError) {
        console.error('Failed to parse OpenAI response:', generatedContent);
        // Fallback verse if parsing fails
        verseData = {
          book: "Salmos",
          chapter: 23,
          verse: 4,
          text: "Ainda que eu ande pelo vale da sombra da morte, não temerei mal algum, porque tu estás comigo.",
          summary: "Este versículo nos lembra que Deus está sempre conosco, especialmente nos momentos mais difíceis. Sua presença traz paz e coragem."
        };
      }

      // Insert the new verse into the database
      const { error: insertError } = await supabase
        .from('bible_verses')
        .insert({
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
        throw insertError;
      }

      generatedVerses.push({
        ...verseData,
        verse_order: nextOrder,
        is_generated: true
      });

      nextOrder++;
    }

    console.log(`Successfully generated and saved ${generatedVerses.length} verses`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Generated ${generatedVerses.length} new verses`,
        verses: generatedVerses
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
        success: false
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
