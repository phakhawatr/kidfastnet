import { useState, useEffect, useCallback, useRef } from 'react';
import { convertToThaiSpeech } from '@/utils/thaiTextToSpeech';

interface UseTextToSpeechOptions {
  lang?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
}

export const useTextToSpeech = (options: UseTextToSpeechOptions = {}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const {
    lang = 'th-TH',
    rate = 0.9,
    pitch = 1,
    volume = 1
  } = options;

  useEffect(() => {
    // Check if browser supports Web Speech API
    setIsSupported('speechSynthesis' in window);
  }, []);

  const speak = useCallback((text: string) => {
    if (!isSupported) {
      console.warn('Text-to-Speech is not supported in this browser');
      return;
    }

    console.log('🔊 Original text:', text);

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    // Convert text to proper Thai speech format
    const thaiSpeechText = convertToThaiSpeech(text);
    console.log('🔊 Converted Thai text:', thaiSpeechText);

    if (!thaiSpeechText) {
      console.warn('🔊 No text to speak after conversion');
      return;
    }

    const utterance = new SpeechSynthesisUtterance(thaiSpeechText);
    console.log('🔊 Created utterance, about to speak');
    utterance.lang = lang;
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;

    utterance.onstart = () => {
      console.log('🔊 Speech started');
      setIsSpeaking(true);
    };
    utterance.onend = () => {
      console.log('🔊 Speech ended');
      setIsSpeaking(false);
    };
    utterance.onerror = (event) => {
      console.error('🔊 Speech error:', event);
      setIsSpeaking(false);
    };

    utteranceRef.current = utterance;
    
    // Small delay to ensure browser is ready
    setTimeout(() => {
      console.log('🔊 Calling speechSynthesis.speak()');
      window.speechSynthesis.speak(utterance);
    }, 100);
  }, [isSupported, lang, rate, pitch, volume]);

  const stop = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [isSupported]);

  const pause = useCallback(() => {
    if (isSupported && isSpeaking) {
      window.speechSynthesis.pause();
    }
  }, [isSupported, isSpeaking]);

  const resume = useCallback(() => {
    if (isSupported && !isSpeaking) {
      window.speechSynthesis.resume();
    }
  }, [isSupported, isSpeaking]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isSupported) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isSupported]);

  return {
    speak,
    stop,
    pause,
    resume,
    isSpeaking,
    isSupported
  };
};
