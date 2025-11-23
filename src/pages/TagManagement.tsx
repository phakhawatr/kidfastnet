import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '@/hooks/useAdmin';
import { useQuestionBank } from '@/hooks/useQuestionBank';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Tag, Pencil, Trash2, Save, X, Search, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

interface TagWithCount {
  tag: string;
  count: number;
}

export default function TagManagement() {
  const { adminId, isLoggedIn, isLoading } = useAdmin();
  const navigate = useNavigate();
  const { fetchTagsWithCount, renameTag, deleteTag, createTag } = useQuestionBank(adminId, true);
  
  const [tags, setTags] = useState<TagWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [newTagName, setNewTagName] = useState('');
  const [deletingTag, setDeletingTag] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      navigate('/admin/login');
    } else if (!isLoading && isLoggedIn) {
      loadTags();
    }
  }, [isLoggedIn, isLoading, navigate]);

  const loadTags = async () => {
    setLoading(true);
    const tagsData = await fetchTagsWithCount();
    setTags(tagsData);
    setLoading(false);
  };

  const handleEditClick = (tag: string) => {
    setEditingTag(tag);
    setNewTagName(tag);
  };

  const handleSaveEdit = async () => {
    if (!editingTag || !newTagName.trim()) return;

    if (newTagName.trim() === editingTag) {
      setEditingTag(null);
      return;
    }

    const success = await renameTag(editingTag, newTagName.trim());
    if (success) {
      toast.success(`เปลี่ยนชื่อ tag จาก "${editingTag}" เป็น "${newTagName}" แล้ว`);
      setEditingTag(null);
      loadTags();
    }
  };

  const handleCancelEdit = () => {
    setEditingTag(null);
    setNewTagName('');
  };

  const handleDeleteClick = (tag: string) => {
    setDeletingTag(tag);
  };

  const handleConfirmDelete = async () => {
    if (!deletingTag) return;

    const success = await deleteTag(deletingTag);
    if (success) {
      toast.success(`ลบ tag "${deletingTag}" แล้ว`);
      setDeletingTag(null);
      loadTags();
    }
  };

  const handleCreateTag = async () => {
    if (!newTagInput.trim()) return;

    const success = await createTag(newTagInput.trim());
    if (success) {
      toast.success(`สร้าง tag "${newTagInput.trim()}" แล้ว`);
      setCreateDialogOpen(false);
      setNewTagInput('');
      loadTags();
    }
  };

  const filteredTags = tags.filter(t => 
    t.tag.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalQuestions = tags.reduce((sum, t) => sum + t.count, 0);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card-glass p-8 text-center">
          <div className="text-4xl mb-4">🔄</div>
          <p className="text-muted-foreground">กำลังตรวจสอบสิทธิ์...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />
      
      <div className="flex-1 container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" onClick={() => navigate('/admin/question-bank')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            กลับไปคลังข้อสอบ
          </Button>
          <Button onClick={() => setCreateDialogOpen(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            เพิ่ม Tag ใหม่
          </Button>
        </div>

        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Tag className="w-8 h-8 text-purple-600" />
            จัดการ Tags
          </h1>
          <p className="text-muted-foreground">
            จัดการป้ายกำกับข้อสอบ (Admin Only) - สามารถสร้าง แก้ไข หรือลบ tags ได้
          </p>
        </div>

        {/* Summary Card */}
        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {tags.length}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Tags ทั้งหมด
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {totalQuestions}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                ข้อสอบที่มี Tags
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {tags.length > 0 ? Math.round(totalQuestions / tags.length) : 0}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                เฉลี่ย/Tag
              </div>
            </div>
          </div>
        </Card>

        {/* Search */}
        <Card className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="ค้นหา tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </Card>

        {/* Tags List */}
        {loading ? (
          <Card className="p-8 text-center text-muted-foreground">
            กำลังโหลด...
          </Card>
        ) : filteredTags.length === 0 ? (
          <Card className="p-8 text-center">
            <Tag className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-2">
              {searchQuery ? 'ไม่พบ tags ที่ค้นหา' : 'ยังไม่มี tags ในระบบ'}
            </p>
            <p className="text-sm text-muted-foreground">
              เริ่มสร้างข้อสอบและเพิ่ม tags เพื่อจัดระเบียบข้อสอบของคุณ
            </p>
          </Card>
        ) : (
          <div className="grid gap-3">
            {filteredTags.map((item) => (
              <Card key={item.tag} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Tag className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                    
                    {editingTag === item.tag ? (
                      <div className="flex items-center gap-2 flex-1">
                        <Input
                          value={newTagName}
                          onChange={(e) => setNewTagName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit();
                            if (e.key === 'Escape') handleCancelEdit();
                          }}
                          autoFocus
                          className="max-w-md"
                        />
                        <Button size="sm" onClick={handleSaveEdit} disabled={!newTagName.trim()}>
                          <Save className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="flex-1 min-w-0">
                          <Badge
                            variant="secondary"
                            className="text-base px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800"
                          >
                            {item.tag}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-sm">
                            {item.count} ข้อ
                          </Badge>
                        </div>
                      </>
                    )}
                  </div>

                  {editingTag !== item.tag && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditClick(item.tag)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteClick(item.tag)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create Tag Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>เพิ่ม Tag ใหม่</DialogTitle>
            <DialogDescription>
              สร้างป้ายกำกับใหม่สำหรับจัดระเบียบข้อสอบ
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">ชื่อ Tag</label>
              <Input
                placeholder="เช่น ข้อสอบ NT 65, แนว O-NET, ข้อสอบกลางภาค"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newTagInput.trim()) {
                    handleCreateTag();
                  }
                }}
                autoFocus
              />
            </div>
            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-2">ตัวอย่าง Tags:</p>
              <ul className="space-y-1 ml-4 list-disc">
                <li>ข้อสอบ NT 64</li>
                <li>แนว O-NET</li>
                <li>ข้อสอบกลางภาค</li>
                <li>ข้อสอบปลายภาค</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setCreateDialogOpen(false);
              setNewTagInput('');
            }}>
              ยกเลิก
            </Button>
            <Button onClick={handleCreateTag} disabled={!newTagInput.trim()}>
              สร้าง Tag
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingTag} onOpenChange={(open) => !open && setDeletingTag(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลบ Tag</AlertDialogTitle>
            <AlertDialogDescription>
              คุณต้องการลบ tag "<strong>{deletingTag}</strong>" หรือไม่?
              <br />
              <br />
              Tag นี้จะถูกลบออกจากข้อสอบทั้งหมด ({tags.find(t => t.tag === deletingTag)?.count || 0} ข้อ)
              <br />
              <span className="text-destructive">การดำเนินการนี้ไม่สามารถย้อนกลับได้</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              ลบ Tag
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Footer />
    </div>
  );
}
