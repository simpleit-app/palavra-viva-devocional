
import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Check, CheckCircle, Edit, Save, Trash2, Loader2 } from 'lucide-react';
import { UserReflection } from '@/data/bibleData';

export interface BibleVerse {
  id: string;
  title: string;
  subtitle?: string;
  text: string;
  book: string;
  chapter: number;
  verses: string;
  source: string;
}

interface BibleVerseCardProps {
  verse: BibleVerse;
  isRead: boolean;
  userReflection?: UserReflection;
  onMarkAsRead: (verseId: string) => void;
  onSaveReflection: (verseId: string, text: string) => void;
  onDeleteReflection?: (reflectionId: string, verseId: string) => void;
  highlight?: boolean;
  disabled?: boolean;
}

const BibleVerseCard: React.FC<BibleVerseCardProps> = ({
  verse,
  isRead,
  userReflection,
  onMarkAsRead,
  onSaveReflection,
  onDeleteReflection,
  highlight = false,
  disabled = false,
}) => {
  const [reflectionText, setReflectionText] = useState(userReflection?.text || '');
  const [isEditing, setIsEditing] = useState(!userReflection && !isRead);
  
  const handleSave = () => {
    if (reflectionText.trim()) {
      onSaveReflection(verse.id, reflectionText);
      setIsEditing(false);
    }
  };
  
  const handleDelete = () => {
    if (userReflection && onDeleteReflection) {
      onDeleteReflection(userReflection.id, verse.id);
    }
  };

  return (
    <Card className={`transition-all ${highlight ? 'border-primary shadow-md ring-2 ring-primary ring-opacity-50' : ''}`}>
      <CardHeader>
        <CardTitle>{verse.title}</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-lg italic">&ldquo;{verse.text}&rdquo;</p>
        
        {verse.subtitle && (
          <p className="text-sm text-muted-foreground">{verse.subtitle}</p>
        )}
        
        {!isRead && (
          <div className="pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onMarkAsRead(verse.id)}
              className="flex items-center gap-1"
              disabled={disabled}
            >
              {disabled ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              <span>Marcar como lido</span>
            </Button>
          </div>
        )}
        
        <div className="pt-2">
          <h3 className="text-lg font-medium mb-2">Minha Reflexão</h3>
          
          {isEditing ? (
            <div className="space-y-2">
              <Textarea
                placeholder="Escreva sua reflexão sobre este texto..."
                value={reflectionText}
                onChange={(e) => setReflectionText(e.target.value)}
                className="min-h-[100px]"
                disabled={disabled}
              />
              
              <div className="flex justify-end gap-2">
                {userReflection && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setIsEditing(false)}
                    disabled={disabled}
                  >
                    Cancelar
                  </Button>
                )}
                
                <Button 
                  size="sm" 
                  onClick={handleSave}
                  disabled={!reflectionText.trim() || disabled}
                >
                  {disabled ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  ) : (
                    <Save className="h-4 w-4 mr-1" />
                  )}
                  Salvar reflexão
                </Button>
              </div>
            </div>
          ) : (
            <>
              {userReflection ? (
                <div className="space-y-2">
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p>{userReflection.text}</p>
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setIsEditing(true)}
                      disabled={disabled}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    
                    {onDeleteReflection && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleDelete}
                        disabled={disabled}
                      >
                        {disabled ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-1" />
                        ) : (
                          <Trash2 className="h-4 w-4 mr-1" />
                        )}
                        Excluir
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">Você ainda não escreveu uma reflexão.</p>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setIsEditing(true)}
                    className="mt-2"
                    disabled={disabled}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Escrever reflexão
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <div className="text-xs text-muted-foreground">
          {verse.book} {verse.chapter}:{verse.verses}
        </div>
        
        <div className="text-xs text-muted-foreground">
          {isRead ? "Lido" : "Não lido"}
          {isRead && <Check className="inline-block h-3 w-3 ml-1" />}
        </div>
      </CardFooter>
    </Card>
  );
};

export default BibleVerseCard;
