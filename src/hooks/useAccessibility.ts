import { useState, useEffect } from 'react';

export type FontSize = 'small' | 'medium' | 'large' | 'extra-large';
export type ContrastMode = 'normal' | 'high';

interface AccessibilitySettings {
  fontSize: FontSize;
  highContrast: boolean;
}

const STORAGE_KEY = 'exam-accessibility-settings';

const fontSizeClasses: Record<FontSize, string> = {
  'small': 'text-sm',
  'medium': 'text-base',
  'large': 'text-lg',
  'extra-large': 'text-xl'
};

const fontSizeValues: Record<FontSize, number> = {
  'small': 14,
  'medium': 16,
  'large': 18,
  'extra-large': 20
};

export const useAccessibility = () => {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return { fontSize: 'medium', highContrast: false };
      }
    }
    return { fontSize: 'medium', highContrast: false };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    
    // Apply high contrast class to body
    if (settings.highContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
  }, [settings]);

  const setFontSize = (size: FontSize) => {
    setSettings(prev => ({ ...prev, fontSize: size }));
  };

  const toggleHighContrast = () => {
    setSettings(prev => ({ ...prev, highContrast: !prev.highContrast }));
  };

  const increaseFontSize = () => {
    const sizes: FontSize[] = ['small', 'medium', 'large', 'extra-large'];
    const currentIndex = sizes.indexOf(settings.fontSize);
    if (currentIndex < sizes.length - 1) {
      setFontSize(sizes[currentIndex + 1]);
    }
  };

  const decreaseFontSize = () => {
    const sizes: FontSize[] = ['small', 'medium', 'large', 'extra-large'];
    const currentIndex = sizes.indexOf(settings.fontSize);
    if (currentIndex > 0) {
      setFontSize(sizes[currentIndex - 1]);
    }
  };

  const resetSettings = () => {
    setSettings({ fontSize: 'medium', highContrast: false });
  };

  return {
    fontSize: settings.fontSize,
    highContrast: settings.highContrast,
    fontSizeClass: fontSizeClasses[settings.fontSize],
    fontSizeValue: fontSizeValues[settings.fontSize],
    setFontSize,
    toggleHighContrast,
    increaseFontSize,
    decreaseFontSize,
    resetSettings
  };
};
