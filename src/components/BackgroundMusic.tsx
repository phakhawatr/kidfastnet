import React from 'react';
import { Music, VolumeX, Volume2 } from 'lucide-react';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './ui/popover';
import { MusicTrack } from '../hooks/useBackgroundMusic';

interface BackgroundMusicProps {
  isPlaying: boolean;
  isEnabled: boolean;
  volume: number;
  selectedTrackId: string;
  tracks: MusicTrack[];
  onToggle: () => void;
  onVolumeChange: (volume: number) => void;
  onTrackChange: (trackId: string) => void;
}

export const BackgroundMusic: React.FC<BackgroundMusicProps> = ({
  isPlaying,
  isEnabled,
  volume,
  selectedTrackId,
  tracks,
  onToggle,
  onVolumeChange,
  onTrackChange,
}) => {
  const selectedTrack = tracks.find(t => t.id === selectedTrackId) || tracks[0];
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="h-12 w-12 rounded-full shadow-lg bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 hover:scale-110 transition-transform"
            title={isEnabled ? 'เพลงพื้นหลัง' : 'เพลงถูกปิด'}
          >
            {!isEnabled ? (
              <VolumeX className="h-5 w-5" />
            ) : isPlaying ? (
              <Music className="h-5 w-5 animate-pulse text-primary" />
            ) : (
              <Music className="h-5 w-5" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">เพลงพื้นหลัง</span>
              <Button
                variant={isEnabled ? "default" : "outline"}
                size="sm"
                onClick={onToggle}
                className={isEnabled ? "bg-primary" : ""}
              >
                {isEnabled ? 'เปิด' : 'ปิด'}
              </Button>
            </div>
            
            {/* Important Note */}
            {isEnabled && !isPlaying && (
              <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-xs text-amber-800">
                  💡 เพลงจะเล่นเมื่อคลิกที่ช่องตอบ
                </p>
              </div>
            )}
            
            {/* Music Selection */}
            <div className="space-y-2">
              <span className="text-sm text-muted-foreground">เลือกเพลง</span>
              <div className="space-y-2">
                {tracks.map((track) => (
                  <button
                    key={track.id}
                    onClick={() => onTrackChange(track.id)}
                    disabled={!isEnabled}
                    className={`w-full text-left px-3 py-2 rounded-lg border transition-all ${
                      selectedTrackId === track.id
                        ? 'bg-primary/10 border-primary text-primary font-medium'
                        : 'border-border hover:bg-accent hover:border-accent-foreground/20'
                    } ${!isEnabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <div className="flex items-center gap-2">
                      <Music className={`h-4 w-4 ${selectedTrackId === track.id ? 'text-primary' : 'text-muted-foreground'}`} />
                      <span className="text-sm">{track.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Volume Control */}
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

            {/* Status */}
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                {isPlaying ? (
                  <>
                    <span className="inline-block animate-pulse">🎵</span>
                    <span>กำลังเล่นเพลง: {selectedTrack?.name}</span>
                  </>
                ) : (
                  'เพลงจะเล่นเมื่อเริ่มทำโจทย์'
                )}
              </p>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
