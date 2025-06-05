
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface RandomVerseButtonProps {
  onClick: () => void;
}

const RandomVerseButton: React.FC<RandomVerseButtonProps> = ({ onClick }) => {
  return (
    <Button 
      variant="outline" 
      className="w-full h-auto py-6 flex flex-col gap-2"
      onClick={onClick}
    >
      <RefreshCw className="h-6 w-6" />
      <span>Versículo Diário</span>
    </Button>
  );
};

export default RandomVerseButton;
