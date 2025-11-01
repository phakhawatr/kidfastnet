import React from 'react';
import { Music, VolumeX, Volume2 } from 'lucide-react';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './ui/popover';

interface BackgroundMusicProps {
  isPlaying: boolean;
  isEnabled: boolean;
  volume: number;
  onToggle: () => void;
  onVolumeChange: (volume: number) => void;
}

export const BackgroundMusic: React.FC<BackgroundMusicProps> = ({
  isPlaying,
  isEnabled,
  volume,
  onToggle,
  onVolumeChange,
}) => {
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="h-12 w-12 rounded-full shadow-lg bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
            title={isEnabled ? 'เพลงพื้นหลัง' : 'เพลงถูกปิด'}
          >
            {!isEnabled ? (
              <VolumeX className="h-5 w-5" />
            ) : isPlaying ? (
              <Music className="h-5 w-5 animate-pulse" />
            ) : (
              <Music className="h-5 w-5" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64" align="end">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">เพลงพื้นหลัง</span>
              <Button
                variant={isEnabled ? "default" : "outline"}
                size="sm"
                onClick={onToggle}
              >
                {isEnabled ? 'เปิด' : 'ปิด'}
              </Button>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">ระดับเสียง</span>
                <span className="text-sm font-medium">{Math.round(volume * 100)}%</span>
              </div>
              <div className="flex items-center gap-2">
                <VolumeX className="h-4 w-4 text-muted-foreground" />
                <Slider
                  value={[volume * 100]}
                  onValueChange={(values) => onVolumeChange(values[0] / 100)}
                  max={100}
                  step={1}
                  className="flex-1"
                  disabled={!isEnabled}
                />
                <Volume2 className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground">
                {isPlaying ? '🎵 กำลังเล่นเพลง...' : 'เพลงจะเล่นเมื่อเริ่มทำโจทย์'}
              </p>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
