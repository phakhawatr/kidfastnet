import { useState, useEffect, useRef, useCallback } from 'react';

export interface MusicTrack {
  id: string;
  name: string;
  url: string;
}

interface BackgroundMusicSettings {
  isEnabled: boolean;
  volume: number;
  selectedTrackId: string;
}

const STORAGE_KEY = 'background-music-settings';
const DEFAULT_VOLUME = 0.3;

export const useBackgroundMusic = (tracks: MusicTrack[]) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isEnabled, setIsEnabled] = useState(true);
  const [volume, setVolume] = useState(DEFAULT_VOLUME);
  const [selectedTrackId, setSelectedTrackId] = useState(tracks[0]?.id || '');
  const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const unlockAttemptedRef = useRef(false);

  // Load settings from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const settings: BackgroundMusicSettings = JSON.parse(stored);
        setIsEnabled(settings.isEnabled);
        setVolume(settings.volume);
        if (settings.selectedTrackId && tracks.find(t => t.id === settings.selectedTrackId)) {
          setSelectedTrackId(settings.selectedTrackId);
        }
      } catch (e) {
        console.error('Failed to load music settings', e);
      }
    }
  }, [tracks]);

  // Initialize audio and change track when selection changes
  useEffect(() => {
    const wasPlaying = isPlaying;
    
    // Stop current audio if playing
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      }
      audioRef.current = null;
    }
    
    // Get selected track URL
    const selectedTrack = tracks.find(t => t.id === selectedTrackId);
    const musicUrl = selectedTrack?.url || tracks[0]?.url;
    
    if (!musicUrl) return;
    
    // Create new audio
    audioRef.current = new Audio(musicUrl);
    audioRef.current.loop = true;
    audioRef.current.volume = 0;
    audioRef.current.preload = 'auto';

    // Resume playing if it was playing before
    if (wasPlaying && isEnabled) {
      setIsPlaying(false); // Reset state first
      setTimeout(() => {
        fadeIn();
      }, 150);
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
      }
    };
  }, [selectedTrackId, tracks, isEnabled]);

  // Save settings to localStorage
  const saveSettings = useCallback((enabled: boolean, vol: number, trackId: string) => {
    const settings: BackgroundMusicSettings = {
      isEnabled: enabled,
      volume: vol,
      selectedTrackId: trackId,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, []);

  // Fade in effect with better error handling
  const fadeIn = useCallback(() => {
    if (!audioRef.current) return;

    // Reset volume
    audioRef.current.volume = 0;
    
    // Try to play with comprehensive error handling
    const playPromise = audioRef.current.play();
    
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
          unlockAttemptedRef.current = true;
          
          // Start fade in animation
          let currentVolume = 0;
          const targetVolume = volume;
          const step = targetVolume / 20;

          if (fadeIntervalRef.current) {
            clearInterval(fadeIntervalRef.current);
          }

          fadeIntervalRef.current = setInterval(() => {
            if (!audioRef.current) {
              if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
              return;
            }

            currentVolume += step;
            if (currentVolume >= targetVolume) {
              audioRef.current.volume = targetVolume;
              if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
            } else {
              audioRef.current.volume = currentVolume;
            }
          }, 50);
        })
        .catch(err => {
          // Log error but don't show to user
          console.log('Audio play error:', err.message);
          setIsPlaying(false);
        });
    }
  }, [volume]);

  // Fade out effect
  const fadeOut = useCallback(() => {
    if (!audioRef.current) return;

    let currentVolume = audioRef.current.volume;
    const step = currentVolume / 20;

    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
    }

    fadeIntervalRef.current = setInterval(() => {
      if (!audioRef.current) {
        if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
        return;
      }

      currentVolume -= step;
      if (currentVolume <= 0) {
        audioRef.current.volume = 0;
        audioRef.current.pause();
        setIsPlaying(false);
        if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
      } else {
        audioRef.current.volume = currentVolume;
      }
    }, 50);
  }, []);

  const play = useCallback(() => {
    if (isEnabled && audioRef.current) {
      fadeIn();
    }
  }, [isEnabled, fadeIn]);

  const stop = useCallback(() => {
    if (audioRef.current) {
      fadeOut();
    }
  }, [fadeOut]);

  const toggleEnabled = useCallback(() => {
    const newEnabled = !isEnabled;
    setIsEnabled(newEnabled);
    saveSettings(newEnabled, volume, selectedTrackId);
    
    if (!newEnabled && isPlaying) {
      stop();
    }
  }, [isEnabled, isPlaying, volume, selectedTrackId, saveSettings, stop]);

  const changeVolume = useCallback((newVolume: number) => {
    const vol = Math.max(0, Math.min(1, newVolume));
    setVolume(vol);
    saveSettings(isEnabled, vol, selectedTrackId);
    
    if (audioRef.current && isPlaying) {
      audioRef.current.volume = vol;
    }
  }, [isEnabled, isPlaying, selectedTrackId, saveSettings]);

  const changeTrack = useCallback((trackId: string) => {
    setSelectedTrackId(trackId);
    saveSettings(isEnabled, volume, trackId);
  }, [isEnabled, volume, saveSettings]);

  return {
    isPlaying,
    isEnabled,
    volume,
    selectedTrackId,
    tracks,
    play,
    stop,
    toggleEnabled,
    changeVolume,
    changeTrack,
  };
};
