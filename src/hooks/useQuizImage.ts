import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Session-level cache to avoid re-fetching
const imageCache = new Map<string, string>();

export function useQuizImage(imagePrompt: string | undefined, skill: string | undefined, enabled: boolean) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!enabled || !imagePrompt) {
      setImageUrl(null);
      setIsLoading(false);
      return;
    }

    const cacheKey = `${imagePrompt}__${skill || ''}`;

    // Check session cache
    if (imageCache.has(cacheKey)) {
      setImageUrl(imageCache.get(cacheKey)!);
      setIsLoading(false);
      return;
    }

    // Abort previous request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);
    setImageUrl(null);

    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke('generate-quiz-image', {
          body: { imagePrompt, skill },
        });

        if (controller.signal.aborted) return;

        if (error) {
          console.error('Quiz image generation error:', error);
          setIsLoading(false);
          return;
        }

        if (data?.imageUrl) {
          imageCache.set(cacheKey, data.imageUrl);
          setImageUrl(data.imageUrl);
        }
      } catch (err) {
        if (controller.signal.aborted) return;
        console.error('Quiz image fetch error:', err);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      controller.abort();
    };
  }, [imagePrompt, skill, enabled]);

  return { imageUrl, isLoading };
}
