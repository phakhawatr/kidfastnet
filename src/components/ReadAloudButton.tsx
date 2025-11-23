import { Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { useToast } from '@/hooks/use-toast';

interface ReadAloudButtonProps {
  text: string;
  className?: string;
}

export const ReadAloudButton = ({ text, className = '' }: ReadAloudButtonProps) => {
  const { speak, stop, isSpeaking, isSupported } = useTextToSpeech({
    lang: 'th-TH',
    rate: 0.9,
    pitch: 1,
    volume: 1
  });
  const { toast } = useToast();

  const handleClick = () => {
    if (!isSupported) {
      toast({
        title: "ไม่รองรับการอ่านเสียง",
        description: "เบราว์เซอร์ของคุณไม่รองรับการอ่านข้อความเป็นเสียง",
        variant: "destructive",
      });
      return;
    }

    if (isSpeaking) {
      stop();
    } else {
      speak(text);
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <Button
      onClick={handleClick}
      variant="outline"
      size="sm"
      className={`gap-2 ${className}`}
    >
      {isSpeaking ? (
        <>
          <VolumeX className="w-4 h-4" />
          หยุดอ่าน
        </>
      ) : (
        <>
          <Volume2 className="w-4 h-4" />
          อ่านโจทย์
        </>
      )}
    </Button>
  );
};
