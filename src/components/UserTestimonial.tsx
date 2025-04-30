
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Check } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type UserTestimonialProps = {
  onUpdate?: () => void;
};

type Testimonial = {
  id: string;
  quote: string;
  author_role: string | null;
  is_approved: boolean | null;
};

const UserTestimonial = ({ onUpdate }: UserTestimonialProps) => {
  const { currentUser } = useAuth();
  const [testimonial, setTestimonial] = useState<Testimonial | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [quote, setQuote] = useState('');
  const [role, setRole] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    
    const fetchUserTestimonial = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('user_testimonials')
          .select('*')
          .eq('user_id', currentUser.id)
          .single();
          
        if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
          console.error('Error fetching user testimonial:', error);
          throw error;
        }
        
        if (data) {
          setTestimonial(data);
          setQuote(data.quote);
          setRole(data.author_role || '');
        }
      } catch (error) {
        toast({
          title: "Erro",
          description: "Não foi possível carregar seu depoimento.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserTestimonial();
  }, [currentUser]);
  
  const handleSave = async () => {
    if (!currentUser || !quote.trim()) return;
    
    setIsSaving(true);
    
    try {
      if (testimonial) {
        // Update existing testimonial
        const { error } = await supabase
          .from('user_testimonials')
          .update({
            quote: quote.trim(),
            author_role: role.trim() || null,
            updated_at: new Date().toISOString(),
            is_approved: false // Reset approval status when edited
          })
          .eq('id', testimonial.id);
          
        if (error) throw error;
        
        setTestimonial({
          ...testimonial,
          quote: quote.trim(),
          author_role: role.trim() || null,
          is_approved: false
        });
        
      } else {
        // Create new testimonial
        const { data, error } = await supabase
          .from('user_testimonials')
          .insert({
            user_id: currentUser.id,
            quote: quote.trim(),
            author_role: role.trim() || null
          })
          .select()
          .single();
          
        if (error) throw error;
        
        setTestimonial(data);
      }
      
      toast({
        title: "Sucesso!",
        description: "Seu depoimento foi salvo e será revisado antes de aparecer na página principal.",
      });
      
      setIsEditing(false);
      if (onUpdate) onUpdate();
      
    } catch (error) {
      console.error('Error saving testimonial:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar seu depoimento. Tente novamente mais tarde.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleCancel = () => {
    if (testimonial) {
      setQuote(testimonial.quote);
      setRole(testimonial.author_role || '');
    } else {
      setQuote('');
      setRole('');
    }
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6 flex justify-center items-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Seu Depoimento
          {testimonial?.is_approved && (
            <div className="flex items-center text-sm font-normal text-green-600 dark:text-green-500 bg-green-50 dark:bg-green-950/30 px-2 py-1 rounded-full">
              <Check className="h-4 w-4 mr-1" />
              Aprovado
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="testimonial">Seu depoimento</Label>
              <Textarea
                id="testimonial"
                placeholder="Compartilhe sua experiência com o Palavra Viva..."
                rows={5}
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                className="resize-none"
              />
            </div>
            <div>
              <Label htmlFor="role">Profissão ou comunidade (opcional)</Label>
              <Input
                id="role"
                placeholder="Ex: Pastor, Líder de Célula, Estudante..."
                value={role}
                onChange={(e) => setRole(e.target.value)}
              />
            </div>
          </div>
        ) : testimonial ? (
          <div className="space-y-2">
            <p className="italic text-gray-700 dark:text-gray-300">"{testimonial.quote}"</p>
            {testimonial.author_role && (
              <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.author_role}</p>
            )}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-500 dark:text-gray-400">
              Você ainda não compartilhou seu depoimento.
              Clique no botão abaixo para adicionar.
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        {isEditing ? (
          <>
            <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={isSaving || !quote.trim()}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando
                </>
              ) : 'Salvar'}
            </Button>
          </>
        ) : (
          <Button onClick={() => setIsEditing(true)}>
            {testimonial ? 'Editar' : 'Adicionar'} Depoimento
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default UserTestimonial;
