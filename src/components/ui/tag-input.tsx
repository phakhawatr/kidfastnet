import { useState, useRef, useEffect } from 'react';
import { X, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  suggestions?: string[];
  placeholder?: string;
  label?: string;
}

export default function TagInput({ value, onChange, suggestions = [], placeholder = "พิมพ์แล้วกด Enter...", label }: TagInputProps) {
  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredSuggestions = suggestions.filter(
    (s) => s.toLowerCase().includes(input.toLowerCase()) && !value.includes(s)
  );

  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setInput('');
    setShowSuggestions(false);
  };

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter((t) => t !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (input.trim()) {
        addTag(input);
      }
    } else if (e.key === 'Backspace' && !input && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="space-y-2">
      {label && (
        <Label className="flex items-center gap-2">
          <Tag className="w-4 h-4" />
          {label}
        </Label>
      )}
      
      <div className="space-y-2">
        {/* Display selected tags */}
        {value.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {value.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="px-3 py-1.5 text-sm bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-2 hover:text-purple-900 dark:hover:text-purple-100"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        {/* Input field */}
        <div className="relative" ref={inputRef}>
          <Input
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setShowSuggestions(true);
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(true)}
            placeholder={placeholder}
            className="w-full"
          />

          {/* Suggestions dropdown */}
          {showSuggestions && filteredSuggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-auto">
              {filteredSuggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => addTag(suggestion)}
                  className="w-full px-4 py-2 text-left hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <Tag className="w-3 h-3 inline mr-2 text-muted-foreground" />
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          กด Enter หรือ Comma (,) เพื่อเพิ่ม tag • Backspace เพื่อลบ
        </p>
      </div>
    </div>
  );
}
