import { Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { useToast } from '@/hooks/use-toast';

interface ReadAloudButtonProps {
  text: string;
  className?: string;
}

export const ReadAloudButton = ({ text, className = '' }: ReadAloudButtonProps) => {
  // Feature temporarily disabled
  return null;
};
