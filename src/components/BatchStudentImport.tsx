import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Download } from 'lucide-react';

interface BatchStudentImportProps {
  schoolId: string;
  classes: { id: string; name: string; grade: number }[];
  onComplete: () => void;
}

interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
}

const BatchStudentImport = ({ schoolId, classes, onComplete }: BatchStudentImportProps) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [csvContent, setCsvContent] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setCsvContent(event.target?.result as string);
    };
    reader.readAsText(file);
  };

  const downloadTemplate = () => {
    const template = 'email,student_number,password\nstudent1@gmail.com,1,123456\nstudent2@gmail.com,2,123456\nstudent3@gmail.com,3,123456';
    const blob = new Blob(['\ufeff' + template], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'student_import_template.csv';
    link.click();
  };

  const handleImport = async () => {
    if (!csvContent || !selectedClassId) {
      toast({ title: 'กรุณาเลือกห้องเรียนและอัปโหลดไฟล์', variant: 'destructive' });
      return;
    }

    setIsImporting(true);
    setResult(null);

    const lines = csvContent.split('\n').filter(l => l.trim());
    // Skip header row
    const dataLines = lines.slice(1);

    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const line of dataLines) {
      const parts = line.split(',').map(p => p.trim().replace(/"/g, ''));
      const email = parts[0];
      const studentNumber = parts[1] ? parseInt(parts[1]) : null;
      const password = parts[2] || '123456';

      if (!email || !email.includes('@')) {
        errors.push(`"${email}" — อีเมลไม่ถูกต้อง`);
        failed++;
        continue;
      }

      try {
        // Find user by email
        const { data: user } = await supabase
          .from('user_registrations')
          .select('id')
          .eq('parent_email', email)
          .maybeSingle();

        let studentId: string;

        if (user) {
          studentId = user.id;
          // Update password if provided
          if (password) {
            await supabase
              .from('user_registrations')
              .update({ password_hash: password })
              .eq('id', user.id);
          }
        } else {
          // Create new student registration
          const { data: newUser, error: createError } = await supabase
            .from('user_registrations')
            .insert({
              parent_email: email,
              password_hash: password,
              nickname: email.split('@')[0],
              age: 7,
              grade: 'ป.1',
              avatar: '🧒',
              status: 'approved',
            })
            .select('id')
            .single();

          if (createError || !newUser) {
            errors.push(`"${email}" — สร้างบัญชีไม่สำเร็จ: ${createError?.message}`);
            failed++;
            continue;
          }
          studentId = newUser.id;
        }

        // Check duplicate in class
        const { data: existing } = await supabase
          .from('class_students')
          .select('id')
          .eq('class_id', selectedClassId)
          .eq('student_id', user.id)
          .eq('is_active', true)
          .maybeSingle();

        if (existing) {
          errors.push(`"${email}" — อยู่ในห้องนี้แล้ว`);
          failed++;
          continue;
        }

        // Add to class
        await supabase.from('class_students').insert([{
          class_id: selectedClassId,
          student_id: studentId,
          student_number: studentNumber,
          is_active: true,
        }]);

        // Ensure school membership
        const { data: memberExists } = await supabase
          .from('school_memberships')
          .select('id')
          .eq('school_id', schoolId)
          .eq('user_id', user.id)
          .eq('role', 'student')
          .maybeSingle();

        if (!memberExists) {
          await supabase.from('school_memberships').insert([{
            school_id: schoolId,
            user_id: user.id,
            role: 'student',
            is_active: true,
          }]);
        }

        success++;
      } catch (error: any) {
        errors.push(`"${email}" — ${error.message}`);
        failed++;
      }
    }

    setResult({ success, failed, errors });
    setIsImporting(false);

    if (success > 0) {
      toast({ title: `นำเข้าสำเร็จ ${success} คน`, description: failed > 0 ? `ไม่สำเร็จ ${failed} คน` : undefined });
      onComplete();
    }
  };

  const resetState = () => {
    setCsvContent('');
    setSelectedClassId('');
    setResult(null);
  };

  return (
    <>
      <Button
        variant="outline"
        className="border-emerald-500/50 text-emerald-300 hover:bg-emerald-500/20"
        onClick={() => { setIsOpen(true); resetState(); }}
      >
        <Upload className="w-4 h-4 mr-2" />
        นำเข้า CSV
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
              นำเข้านักเรียนจากไฟล์ CSV
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 mt-4">
            {/* Template Download */}
            <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
              <p className="text-slate-300 text-sm mb-2">รูปแบบไฟล์: <code className="bg-slate-700 px-2 py-0.5 rounded text-emerald-300">email,student_number</code></p>
              <Button variant="ghost" size="sm" onClick={downloadTemplate} className="text-emerald-400 hover:text-emerald-300">
                <Download className="w-4 h-4 mr-1" />
                ดาวน์โหลดตัวอย่าง
              </Button>
            </div>

            {/* Class Selection */}
            <div>
              <Label className="text-slate-300">เลือกห้องเรียน *</Label>
              <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                <SelectTrigger className="bg-slate-900 border-slate-600 text-white mt-1">
                  <SelectValue placeholder="เลือกห้องเรียน" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id} className="text-white">
                      {cls.name} (ป.{cls.grade})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* File Upload */}
            <div>
              <Label className="text-slate-300">ไฟล์ CSV *</Label>
              <div className="mt-1">
                <input
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileUpload}
                  className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 file:cursor-pointer"
                />
              </div>
              {csvContent && (
                <p className="text-emerald-400 text-xs mt-1">
                  ✓ โหลดไฟล์แล้ว ({csvContent.split('\n').filter(l => l.trim()).length - 1} แถว)
                </p>
              )}
            </div>

            {/* Import Result */}
            {result && (
              <div className="p-4 rounded-lg border space-y-2 bg-slate-900/50 border-slate-700">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-sm font-medium">สำเร็จ: {result.success}</span>
                  </div>
                  {result.failed > 0 && (
                    <div className="flex items-center gap-1 text-red-400">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">ไม่สำเร็จ: {result.failed}</span>
                    </div>
                  )}
                </div>
                {result.errors.length > 0 && (
                  <div className="max-h-32 overflow-y-auto text-xs text-red-300 space-y-1">
                    {result.errors.map((err, i) => (
                      <p key={i}>• {err}</p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="ghost" onClick={() => setIsOpen(false)} className="text-slate-400">
              {result ? 'ปิด' : 'ยกเลิก'}
            </Button>
            {!result && (
              <Button onClick={handleImport} disabled={isImporting || !csvContent || !selectedClassId} className="bg-emerald-600 hover:bg-emerald-700">
                {isImporting ? 'กำลังนำเข้า...' : 'นำเข้านักเรียน'}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BatchStudentImport;
