
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Save, Edit } from 'lucide-react';

const UserTestimonial: React.FC = () => {
  const { currentUser } = useAuth();
  const [quote, setQuote] = useState('');
  const [authorRole, setAuthorRole] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [hasTestimonial, setHasTestimonial] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    
    const fetchUserTestimonial = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('user_testimonials')
          .select('*')
          .eq('user_id', currentUser.id)
          .maybeSingle();
        
        if (error) {
          console.error('Error fetching testimonial:', error);
          return;
        }
        
        if (data) {
          setQuote(data.quote);
          setAuthorRole(data.author_role || '');
          setHasTestimonial(true);
        } else {
          setIsEditing(true); // If no testimonial exists, show the edit form
        }
      } catch (error) {
        console.error('Error fetching testimonial:', error);
      } finally {
        setLoading(false);
        setInitialLoad(false);
      }
    };

    fetchUserTestimonial();
  }, [currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!quote.trim()) {
      toast({
        variant: "destructive",
        title: "Depoimento obrigatório",
        description: "Por favor, escreva seu depoimento.",
      });
      return;
    }
    
    setLoading(true);
    try {
      const testimonialData = {
        user_id: currentUser?.id,
        quote: quote.trim(),
        author_role: authorRole.trim() || null,
        updated_at: new Date().toISOString(),
      };
      
      let operation;
      
      if (hasTestimonial) {
        // Update existing testimonial
        operation = supabase
          .from('user_testimonials')
          .update(testimonialData)
          .eq('user_id', currentUser?.id);
      } else {
        // Insert new testimonial
        operation = supabase
          .from('user_testimonials')
          .insert(testimonialData);
      }
      
      const { error } = await operation;
      
      if (error) {
        console.error('Error saving testimonial:', error);
        toast({
          variant: "destructive",
          title: "Erro ao salvar",
          description: "Não foi possível salvar seu depoimento. Tente novamente.",
        });
        return;
      }
      
      toast({
        title: hasTestimonial ? "Depoimento atualizado" : "Depoimento salvo",
        description: "Obrigado por compartilhar sua experiência!",
      });
      
      setHasTestimonial(true);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving testimonial:', error);
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: "Não foi possível salvar seu depoimento. Tente novamente.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser || initialLoad) {
    return (
      <Card>
        <CardContent className="pt-6 flex justify-center items-center min-h-[200px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Seu Depoimento</CardTitle>
        <CardDescription>
          Compartilhe sua experiência com o Palavra Viva
        </CardDescription>
      </CardHeader>
      
      {!isEditing && hasTestimonial ? (
        <CardContent className="space-y-4">
          <div className="bg-muted/50 p-4 rounded-lg relative">
            <blockquote className="italic text-lg">&ldquo;{quote}&rdquo;</blockquote>
            {authorRole && (
              <p className="text-sm text-muted-foreground mt-2">{authorRole}</p>
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            <p>Seu depoimento poderá aparecer na página inicial do Palavra Viva após aprovação.</p>
          </div>
        </CardContent>
      ) : (
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="testimonial">Depoimento</Label>
              <Textarea
                id="testimonial"
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                placeholder="Compartilhe sua experiência com o Palavra Viva..."
                className="min-h-[120px]"
              />
              <p className="text-xs text-muted-foreground">
                Seu depoimento poderá aparecer na página inicial do Palavra Viva após aprovação.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role">Função/Cargo (opcional)</Label>
              <Input
                id="role"
                value={authorRole}
                onChange={(e) => setAuthorRole(e.target.value)}
                placeholder="Ex: Pastor, Ministro de Louvor, Estudante de Teologia..."
              />
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between">
            {hasTestimonial && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsEditing(false)}
                disabled={loading}
              >
                Cancelar
              </Button>
            )}
            <Button type="submit" className={hasTestimonial ? "" : "w-full"} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Depoimento
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      )}
      
      {!isEditing && hasTestimonial && (
        <CardFooter>
          <Button 
            variant="outline" 
            onClick={() => setIsEditing(true)}
            className="w-full"
          >
            <Edit className="mr-2 h-4 w-4" />
            Editar Depoimento
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default UserTestimonial;
