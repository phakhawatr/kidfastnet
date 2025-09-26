import { useState, useEffect } from 'react';
import { useAdmin } from '../hooks/useAdmin';
import { supabase } from '@/integrations/supabase/client';
import { ToastManager } from '../components/Toast';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface UserRegistration {
  id: string;
  nickname: string;
  age: number;
  grade: string;
  avatar: string;
  learning_style: string;
  parent_email: string;
  parent_phone?: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  created_at: string;
  approved_at?: string;
}

const AdminDashboard = () => {
  const { name, email, logout, adminId } = useAdmin();
  const [registrations, setRegistrations] = useState<UserRegistration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'suspended'>('pending');

  const avatarEmojis: Record<string, string> = {
    cat: '🐱',
    dog: '🐶',
    rabbit: '🐰',
    frog: '🐸',
    unicorn: '🦄',
    fox: '🦊',
    panda: '🐼',
    tiger: '🐯'
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      setIsLoading(true);
      // Use secure function to get registrations
      const { data, error } = await supabase.rpc('get_user_registrations');

      if (error) throw error;
      setRegistrations((data || []) as UserRegistration[]);
    } catch (error) {
      console.error('Error fetching registrations:', error);
      ToastManager.show({
        message: 'เกิดข้อผิดพลาดในการโหลดข้อมูล',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (registrationId: string) => {
    try {
      const { error } = await supabase.rpc('approve_user_registration', {
        registration_id: registrationId,
        admin_id: adminId
      });

      if (error) throw error;

      ToastManager.show({
        message: 'อนุมัติสมาชิกเรียบร้อย!',
        type: 'success'
      });

      fetchRegistrations();
    } catch (error) {
      console.error('Error approving registration:', error);
      ToastManager.show({
        message: 'เกิดข้อผิดพลาดในการอนุมัติ',
        type: 'error'
      });
    }
  };

  const handleReject = async (registrationId: string) => {
    try {
      const { error } = await supabase.rpc('reject_user_registration', {
        registration_id: registrationId,
        admin_id: adminId
      });

      if (error) throw error;

      ToastManager.show({
        message: 'ปฏิเสธการสมัครเรียบร้อย',
        type: 'info'
      });

      fetchRegistrations();
    } catch (error) {
      console.error('Error rejecting registration:', error);
      ToastManager.show({
        message: 'เกิดข้อผิดพลาดในการปฏิเสธ',
        type: 'error'
      });
    }
  };

  const handleToggleSuspension = async (registrationId: string) => {
    try {
      const { error } = await supabase.rpc('toggle_user_suspension', {
        registration_id: registrationId,
        admin_id: adminId
      });

      if (error) throw error;

      const registration = registrations.find(r => r.id === registrationId);
      const isSuspended = registration?.status === 'suspended';
      
      ToastManager.show({
        message: isSuspended ? 'เปิดการใช้งานเรียบร้อย!' : 'หยุดการใช้งานเรียบร้อย!',
        type: 'success'
      });

      fetchRegistrations();
    } catch (error) {
      console.error('Error toggling suspension:', error);
      ToastManager.show({
        message: 'เกิดข้อผิดพลาดในการเปลี่ยนสถานะ',
        type: 'error'
      });
    }
  };

  const handleDelete = async (registrationId: string) => {
    try {
      const { error } = await supabase.rpc('delete_user_registration', {
        registration_id: registrationId,
        admin_id: adminId
      });

      if (error) throw error;

      ToastManager.show({
        message: 'ลบสมาชิกเรียบร้อย!',
        type: 'success'
      });

      fetchRegistrations();
    } catch (error) {
      console.error('Error deleting registration:', error);
      ToastManager.show({
        message: 'เกิดข้อผิดพลาดในการลบสมาชิก',
        type: 'error'
      });
    }
  };

  const filteredRegistrations = registrations.filter(reg => 
    filter === 'all' || reg.status === filter
  );

  const stats = {
    total: registrations.length,
    pending: registrations.filter(r => r.status === 'pending').length,
    approved: registrations.filter(r => r.status === 'approved').length,
    rejected: registrations.filter(r => r.status === 'rejected').length,
    suspended: registrations.filter(r => r.status === 'suspended').length
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card-glass p-8 text-center">
          <div className="text-4xl mb-4">🔄</div>
          <p className="text-[hsl(var(--text-secondary))]">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[hsl(var(--primary))] via-[hsl(var(--primary-variant))] to-[hsl(var(--accent))] p-4">
      {/* Header */}
      <div className="card-glass p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[hsl(var(--primary))] mb-1">
              🎛️ ระบบจัดการผู้ดูแล
            </h1>
            <p className="text-[hsl(var(--text-secondary))]">
              สวัสดี คุณ{name} ({email})
            </p>
          </div>
          <button
            onClick={logout}
            className="btn-secondary"
          >
            ออกจากระบบ 🚪
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="card-glass p-4 text-center">
          <div className="text-2xl font-bold text-[hsl(var(--primary))]">{stats.total}</div>
          <div className="text-sm text-[hsl(var(--text-secondary))]">ทั้งหมด</div>
        </div>
        <div className="card-glass p-4 text-center">
          <div className="text-2xl font-bold text-orange-500">{stats.pending}</div>
          <div className="text-sm text-[hsl(var(--text-secondary))]">รอการอนุมัติ</div>
        </div>
        <div className="card-glass p-4 text-center">
          <div className="text-2xl font-bold text-green-500">{stats.approved}</div>
          <div className="text-sm text-[hsl(var(--text-secondary))]">อนุมัติแล้ว</div>
        </div>
        <div className="card-glass p-4 text-center">
          <div className="text-2xl font-bold text-red-500">{stats.rejected}</div>
          <div className="text-sm text-[hsl(var(--text-secondary))]">ปฏิเสธ</div>
        </div>
        <div className="card-glass p-4 text-center">
          <div className="text-2xl font-bold text-yellow-500">{stats.suspended}</div>
          <div className="text-sm text-[hsl(var(--text-secondary))]">หยุดการใช้งาน</div>
        </div>
      </div>

      {/* Filters */}
      <div className="card-glass p-4 mb-6">
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'ทั้งหมด', count: stats.total },
            { key: 'pending', label: 'รอการอนุมัติ', count: stats.pending },
            { key: 'approved', label: 'อนุมัติแล้ว', count: stats.approved },
            { key: 'rejected', label: 'ปฏิเสธ', count: stats.rejected },
            { key: 'suspended', label: 'หยุดการใช้งาน', count: stats.suspended }
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setFilter(key as typeof filter)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                filter === key
                  ? 'bg-[hsl(var(--primary))] text-white'
                  : 'bg-white/60 text-[hsl(var(--text-primary))] hover:bg-white/80'
              }`}
            >
              {label} ({count})
            </button>
          ))}
        </div>
      </div>

      {/* Registrations List */}
      <div className="space-y-4">
        {filteredRegistrations.length === 0 ? (
          <div className="card-glass p-8 text-center">
            <div className="text-4xl mb-4">📭</div>
            <p className="text-[hsl(var(--text-secondary))]">ไม่มีข้อมูลการสมัครสมาชิก</p>
          </div>
        ) : (
          filteredRegistrations.map((registration) => (
            <div key={registration.id} className="card-glass p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{avatarEmojis[registration.avatar] || '🐱'}</span>
                    <div>
                      <h3 className="font-bold text-[hsl(var(--text-primary))]">
                        {registration.nickname}
                      </h3>
                      <p className="text-sm text-[hsl(var(--text-secondary))]">
                        {registration.age} ปี • {registration.grade}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      registration.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                      registration.status === 'approved' ? 'bg-green-100 text-green-800' :
                      registration.status === 'suspended' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {registration.status === 'pending' ? 'รอการอนุมัติ' :
                       registration.status === 'approved' ? 'อนุมัติแล้ว' : 
                       registration.status === 'suspended' ? 'หยุดการใช้งาน' : 'ปฏิเสธ'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p><strong>อีเมลผู้ปกครอง:</strong> {registration.parent_email}</p>
                      {registration.parent_phone && (
                        <p><strong>เบอร์โทร:</strong> {registration.parent_phone}</p>
                      )}
                    </div>
                    <div>
                      <p><strong>สไตล์การเรียน:</strong> {registration.learning_style}</p>
                      <p><strong>สมัครเมื่อ:</strong> {new Date(registration.created_at).toLocaleDateString('th-TH')}</p>
                    </div>
                  </div>
                </div>

                {registration.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(registration.id)}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                    >
                      ✅ อนุมัติ
                    </button>
                    <button
                      onClick={() => handleReject(registration.id)}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                    >
                      ❌ ปฏิเสธ
                    </button>
                  </div>
                )}

                {(registration.status === 'approved' || registration.status === 'suspended') && (
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => handleToggleSuspension(registration.id)}
                      className={`px-4 py-2 text-white rounded-lg transition-colors text-sm font-medium ${
                        registration.status === 'suspended' 
                          ? 'bg-green-500 hover:bg-green-600' 
                          : 'bg-yellow-500 hover:bg-yellow-600'
                      }`}
                    >
                      {registration.status === 'suspended' ? '✅ เปิดการใช้งาน' : '⏸️ หยุดการใช้งาน'}
                    </button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          className="text-sm font-medium"
                        >
                          🗑️ ลบสมาชิก
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>ยืนยันการลบสมาชิก</AlertDialogTitle>
                          <AlertDialogDescription>
                            คุณต้องการลบสมาชิก "{registration.nickname}" หรือไม่?
                            <br />
                            การดำเนินการนี้ไม่สามารถย้อนกลับได้
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(registration.id)}
                            className="bg-red-500 hover:bg-red-600"
                          >
                            ลบสมาชิก
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;