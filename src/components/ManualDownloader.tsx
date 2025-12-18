import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { BookOpen, Download, Loader2, School, GraduationCap, Users, Heart } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import {
  generateSchoolAdminManual,
  generateTeacherManual,
  generateStudentManual,
  generateParentManual
} from '@/utils/manualGeneratorUtils';

interface ManualDownloaderProps {
  defaultManual?: 'school-admin' | 'teacher' | 'student' | 'parent';
  showDropdown?: boolean;
  buttonVariant?: 'default' | 'outline' | 'ghost' | 'secondary';
  buttonSize?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

const ManualDownloader = ({ 
  defaultManual,
  showDropdown = true,
  buttonVariant = 'outline',
  buttonSize = 'default',
  className = ''
}: ManualDownloaderProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingType, setGeneratingType] = useState<string | null>(null);

  const manuals = [
    { 
      key: 'school-admin', 
      label: 'คู่มือผู้ดูแลโรงเรียน', 
      icon: School,
      generate: generateSchoolAdminManual 
    },
    { 
      key: 'teacher', 
      label: 'คู่มือครู', 
      icon: GraduationCap,
      generate: generateTeacherManual 
    },
    { 
      key: 'student', 
      label: 'คู่มือนักเรียน', 
      icon: Users,
      generate: generateStudentManual 
    },
    { 
      key: 'parent', 
      label: 'คู่มือผู้ปกครอง', 
      icon: Heart,
      generate: generateParentManual 
    },
  ];

  const handleGenerate = async (manualKey: string) => {
    const manual = manuals.find(m => m.key === manualKey);
    if (!manual) return;

    setIsGenerating(true);
    setGeneratingType(manualKey);

    try {
      toast({
        title: '📚 กำลังสร้างคู่มือ...',
        description: 'กรุณารอสักครู่',
      });

      await manual.generate();

      toast({
        title: '✅ สร้างคู่มือสำเร็จ!',
        description: `ดาวน์โหลด ${manual.label} เรียบร้อยแล้ว`,
      });
    } catch (error) {
      console.error('Error generating manual:', error);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถสร้างคู่มือได้ กรุณาลองใหม่',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
      setGeneratingType(null);
    }
  };

  // Single button mode (no dropdown)
  if (!showDropdown && defaultManual) {
    const manual = manuals.find(m => m.key === defaultManual);
    if (!manual) return null;

    const Icon = manual.icon;

    return (
      <Button
        variant={buttonVariant}
        size={buttonSize}
        onClick={() => handleGenerate(defaultManual)}
        disabled={isGenerating}
        className={className}
      >
        {isGenerating ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <BookOpen className="w-4 h-4 mr-2" />
        )}
        {isGenerating ? 'กำลังสร้าง...' : manual.label}
      </Button>
    );
  }

  // Dropdown mode
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={buttonVariant}
          size={buttonSize}
          disabled={isGenerating}
          className={className}
        >
          {isGenerating ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <BookOpen className="w-4 h-4 mr-2" />
          )}
          {isGenerating ? 'กำลังสร้าง...' : '📖 ดาวน์โหลดคู่มือ'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-slate-800 border-slate-700">
        {manuals.map((manual) => {
          const Icon = manual.icon;
          const isCurrentGenerating = generatingType === manual.key;
          
          return (
            <DropdownMenuItem
              key={manual.key}
              onClick={() => handleGenerate(manual.key)}
              disabled={isGenerating}
              className="text-white hover:bg-slate-700 cursor-pointer"
            >
              {isCurrentGenerating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Icon className="w-4 h-4 mr-2" />
              )}
              {manual.label}
              <Download className="w-3 h-3 ml-auto opacity-50" />
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ManualDownloader;
