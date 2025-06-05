
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardFooter, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { UserReflection } from '@/data/bibleData';
import { BookOpen, CheckCircle, Edit, Trash2, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export interface BibleVerse {
  id: string;
  title: string;
  subtitle: string;
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
  onMarkAsUnread: (verseId: string) => void;
  onSaveReflection: (verseId: string, text: string) => void;
  onDeleteReflection?: (reflectionId: string, verseId: string) => void;
  highlight?: boolean;
}

const BibleVerseCard: React.FC<BibleVerseCardProps> = ({
  verse,
  isRead,
  userReflection,
  onMarkAsRead,
  onMarkAsUnread,
  onSaveReflection,
  onDeleteReflection,
  highlight = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showReflectionInput, setShowReflectionInput] = useState(isRead);
  const [reflectionText, setReflectionText] = useState(userReflection?.text || '');
  
  const handleSave = () => {
    if (reflectionText.trim()) {
      onSaveReflection(verse.id, reflectionText);
      setIsEditing(false);
      setShowReflectionInput(true);
    }
  };

  const handleDelete = () => {
    if (onDeleteReflection && userReflection) {
      onDeleteReflection(userReflection.id, verse.id);
    }
  };
  
  const formatReflectionDate = (date: Date) => {
    return format(date, "d 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  return (
    <Card className={`mb-6 ${highlight ? 'border-primary shadow-lg' : ''}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div>
            <span>{verse.title}</span>
            {isRead && (
              <span className="ml-2 inline-flex items-center text-xs font-medium text-green-500">
                <CheckCircle className="h-3 w-3 mr-1" /> Lido
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!isRead ? (
              <>
                {!showReflectionInput && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setShowReflectionInput(true)}
                    className="flex items-center gap-1"
                  >
                    <Edit className="h-4 w-4" /> 
                    Adicionar reflexão
                  </Button>
                )}
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => onMarkAsRead(verse.id)}
                  className="flex items-center gap-1"
                  disabled={!reflectionText.trim()}
                >
                  <BookOpen className="h-4 w-4" /> 
                  Marcar como lido
                </Button>
              </>
            ) : (
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => onMarkAsUnread(verse.id)}
                className="flex items-center gap-1"
              >
                <RotateCcw className="h-4 w-4" /> 
                Marcar como não lido
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground font-medium">{verse.subtitle}</p>
        <div className="text-lg whitespace-pre-wrap">{verse.text}</div>
        <div className="text-right text-sm text-muted-foreground italic">
          {verse.book} {verse.chapter}:{verse.verses}
        </div>
        
        {userReflection && !isEditing && (
          <div className="mt-4 border-t pt-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-medium">Sua reflexão</h4>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                
                {onDeleteReflection && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir reflexão</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir esta reflexão? 
                          Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-1">
              {formatReflectionDate(userReflection.createdAt)}
            </p>
            <div className="bg-muted/30 p-3 rounded-md whitespace-pre-wrap">
              {userReflection.text}
            </div>
          </div>
        )}
        
        {(isEditing || (!userReflection && showReflectionInput)) && (
          <div className="mt-4 border-t pt-4">
            <h4 className="text-sm font-medium mb-2">Sua reflexão</h4>
            <Textarea
              value={reflectionText}
              onChange={(e) => setReflectionText(e.target.value)}
              placeholder="Escreva suas reflexões sobre este texto..."
              rows={4}
              className="mb-2"
            />
            <div className="flex justify-end gap-2">
              {isEditing ? (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setIsEditing(false);
                    setReflectionText(userReflection?.text || '');
                  }}
                >
                  Cancelar
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowReflectionInput(false)}
                >
                  Cancelar
                </Button>
              )}
              <Button size="sm" onClick={handleSave} disabled={!reflectionText.trim()}>
                Salvar
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BibleVerseCard;
