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
    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
    
    // Get selected track URL
    const selectedTrack = tracks.find(t => t.id === selectedTrackId);
    const musicUrl = selectedTrack?.url || tracks[0]?.url;
    
    if (!musicUrl) return;
    
    // Create new audio
    audioRef.current = new Audio(musicUrl);
    audioRef.current.loop = true;
    audioRef.current.volume = 0;

    // Resume playing if it was playing before
    if (wasPlaying && isEnabled) {
      fadeIn();
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
  }, [selectedTrackId, tracks]);

  // Save settings to localStorage
  const saveSettings = useCallback((enabled: boolean, vol: number, trackId: string) => {
    const settings: BackgroundMusicSettings = {
      isEnabled: enabled,
      volume: vol,
      selectedTrackId: trackId,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, []);

  // Fade in effect
  const fadeIn = useCallback(() => {
    if (!audioRef.current) return;

    audioRef.current.volume = 0;
    audioRef.current.play().catch(err => console.error('Audio play failed:', err));
    setIsPlaying(true);

    let currentVolume = 0;
    const targetVolume = volume;
    const step = targetVolume / 20; // 20 steps

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
