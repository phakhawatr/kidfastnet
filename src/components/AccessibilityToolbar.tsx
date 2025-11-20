import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Type, 
  Contrast, 
  Minus, 
  Plus, 
  RotateCcw,
  Keyboard,
  Eye
} from 'lucide-react';
import { useAccessibility, FontSize } from '@/hooks/useAccessibility';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface AccessibilityToolbarProps {
  showKeyboardShortcuts?: boolean;
}

export const AccessibilityToolbar = ({ showKeyboardShortcuts = true }: AccessibilityToolbarProps) => {
  const { 
    fontSize, 
    highContrast, 
    setFontSize, 
    toggleHighContrast,
    increaseFontSize,
    decreaseFontSize,
    resetSettings 
  } = useAccessibility();

  const fontSizes: { value: FontSize; label: string }[] = [
    { value: 'small', label: 'เล็ก' },
    { value: 'medium', label: 'ปกติ' },
    { value: 'large', label: 'ใหญ่' },
    { value: 'extra-large', label: 'ใหญ่มาก' },
  ];

  return (
    <Card className="p-4 mb-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Eye className="w-5 h-5 text-muted-foreground" />
          <span className="text-sm font-medium">การช่วยเหลือการมองเห็น:</span>
        </div>

        {/* Font Size Controls */}
        <div className="flex items-center gap-1 border rounded-md">
          <Button
            variant="ghost"
            size="sm"
            onClick={decreaseFontSize}
            disabled={fontSize === 'small'}
            aria-label="ลดขนาดตัวอักษร"
            title="ลดขนาดตัวอักษร (Ctrl + -)"
          >
            <Minus className="w-4 h-4" />
          </Button>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                aria-label="เลือกขนาดตัวอักษร"
              >
                <Type className="w-4 h-4 mr-1" />
                <span className="text-xs">
                  {fontSizes.find(s => s.value === fontSize)?.label}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-40 p-2">
              <div className="space-y-1">
                {fontSizes.map(size => (
                  <Button
                    key={size.value}
                    variant={fontSize === size.value ? "default" : "ghost"}
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => setFontSize(size.value)}
                  >
                    {size.label}
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <Button
            variant="ghost"
            size="sm"
            onClick={increaseFontSize}
            disabled={fontSize === 'extra-large'}
            aria-label="เพิ่มขนาดตัวอักษร"
            title="เพิ่มขนาดตัวอักษร (Ctrl + +)"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* High Contrast Toggle */}
        <Button
          variant={highContrast ? "default" : "outline"}
          size="sm"
          onClick={toggleHighContrast}
          aria-label={highContrast ? "ปิดโหมดความคมชัดสูง" : "เปิดโหมดความคมชัดสูง"}
          title="สลับโหมดความคมชัดสูง (Ctrl + H)"
          className="gap-2"
        >
          <Contrast className="w-4 h-4" />
          ความคมชัดสูง
        </Button>

        {/* Reset Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={resetSettings}
          aria-label="รีเซ็ตการตั้งค่า"
          className="gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          รีเซ็ต
        </Button>

        {/* Keyboard Shortcuts Info */}
        {showKeyboardShortcuts && (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                aria-label="ดูคีย์ลัด"
                className="gap-2 ml-auto"
              >
                <Keyboard className="w-4 h-4" />
                คีย์ลัด
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-3">
                <h3 className="font-semibold text-sm">แป้นพิมพ์ลัด</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">เลือกตัวเลือก:</span>
                    <kbd className="px-2 py-1 text-xs bg-muted rounded">1-4</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ข้อถัดไป:</span>
                    <kbd className="px-2 py-1 text-xs bg-muted rounded">→</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ข้อก่อนหน้า:</span>
                    <kbd className="px-2 py-1 text-xs bg-muted rounded">←</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ส่งคำตอบ:</span>
                    <kbd className="px-2 py-1 text-xs bg-muted rounded">Ctrl + Enter</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">เพิ่มขนาดตัวอักษร:</span>
                    <kbd className="px-2 py-1 text-xs bg-muted rounded">Ctrl + +</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ลดขนาดตัวอักษร:</span>
                    <kbd className="px-2 py-1 text-xs bg-muted rounded">Ctrl + -</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ความคมชัดสูง:</span>
                    <kbd className="px-2 py-1 text-xs bg-muted rounded">Ctrl + H</kbd>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>
    </Card>
  );
};
