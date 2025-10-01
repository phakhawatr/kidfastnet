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
  member_id?: string;
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
  login_count?: number;
  last_login_at?: string;
}

interface UserPresence {
  user_id: string;
  online_at: string;
}

const AdminDashboard = () => {
  const { name, email, logout, adminId } = useAdmin();
  const [registrations, setRegistrations] = useState<UserRegistration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'suspended' | 'online'>('pending');
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

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

  // Set up presence tracking for online users
  useEffect(() => {
    const channel = supabase.channel('admin-dashboard', {
      config: {
        presence: { key: 'admin' }
      }
    });

    // Listen for presence changes
    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      const onlineUserIds = new Set<string>();
      
      Object.values(state).forEach((presences: any[]) => {
        presences.forEach((presence) => {
          if (presence.user_id) {
            onlineUserIds.add(presence.user_id);
          }
        });
      });
      
      setOnlineUsers(onlineUserIds);
      console.log('Online users updated:', Array.from(onlineUserIds));
    });

    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        console.log('Admin dashboard subscribed to presence channel');
      }
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Check if user is currently online
  const isUserOnline = (userId: string) => {
    return onlineUsers.has(userId);
  };

  const fetchRegistrations = async () => {
    try {
      setIsLoading(true);
      // Use secure function to get registrations
      const { data, error } = await supabase.rpc('get_user_registrations');

      if (error) throw error;
      
      console.log('Fetched registrations with login stats:', data);
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

  // Calculate expiration date (1 year from approval date)
  const calculateExpirationDate = (approvedAt: string | null) => {
    if (!approvedAt) return null;
    const approvalDate = new Date(approvedAt);
    const expirationDate = new Date(approvalDate);
    expirationDate.setFullYear(expirationDate.getFullYear() + 1);
    return expirationDate;
  };

  // Check if membership is expired
  const isMembershipExpired = (approvedAt: string | null) => {
    const expirationDate = calculateExpirationDate(approvedAt);
    if (!expirationDate) return false;
    return new Date() > expirationDate;
  };

  // Format expiration date display
  const formatExpirationDisplay = (approvedAt: string | null) => {
    const expirationDate = calculateExpirationDate(approvedAt);
    if (!expirationDate) return null;
    
    const isExpired = isMembershipExpired(approvedAt);
    const formattedDate = expirationDate.toLocaleDateString('th-TH');
    
    return {
      date: formattedDate,
      isExpired,
      className: isExpired ? 'text-red-600 font-semibold' : 'text-green-700 font-semibold'
    };
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

  const handleForceLogout = async (userEmail: string, nickname: string) => {
    try {
      const { error } = await supabase.rpc('logout_user_session', {
        user_email: userEmail
      });

      if (error) throw error;

      ToastManager.show({
        message: `ออกจากระบบสมาชิก "${nickname}" เรียบร้อย!`,
        type: 'success'
      });

      fetchRegistrations();
    } catch (error) {
      console.error('Error forcing logout:', error);
      ToastManager.show({
        message: 'เกิดข้อผิดพลาดในการออกจากระบบ',
        type: 'error'
      });
    }
  };

  const filteredRegistrations = registrations.filter(reg => {
    // Apply status filter
    let matchesFilter = false;
    if (filter === 'online') {
      matchesFilter = isUserOnline(reg.id);
    } else {
      matchesFilter = filter === 'all' || reg.status === filter;
    }
    
    // Apply search query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = 
        reg.nickname.toLowerCase().includes(query) ||
        (reg.parent_phone && reg.parent_phone.includes(query)) ||
        (reg.member_id && reg.member_id.includes(query));
      
      return matchesFilter && matchesSearch;
    }
    
    return matchesFilter;
  });

  const stats = {
    total: registrations.length,
    pending: registrations.filter(r => r.status === 'pending').length,
    approved: registrations.filter(r => r.status === 'approved').length,
    rejected: registrations.filter(r => r.status === 'rejected').length,
    suspended: registrations.filter(r => r.status === 'suspended').length,
    online: registrations.filter(r => isUserOnline(r.id)).length
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
          <div className="flex gap-2">
            <button
              onClick={fetchRegistrations}
              className="btn-secondary flex items-center gap-2"
              disabled={isLoading}
            >
              {isLoading ? '🔄' : '🔄'} รีเฟรชข้อมูล
            </button>
            <button
              onClick={logout}
              className="btn-secondary"
            >
              ออกจากระบบ 🚪
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
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
        <div className="card-glass p-4 text-center">
          <div className="text-2xl font-bold text-blue-500">{stats.online}</div>
          <div className="text-sm text-[hsl(var(--text-secondary))]">กำลังใช้งาน</div>
        </div>
      </div>

      {/* Search Box */}
      <div className="card-glass p-4 mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="🔍 ค้นหาจากชื่อเล่น, เบอร์โทร, หรือรหัสสมาชิก..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[hsl(var(--primary))] focus:outline-none text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-secondary))]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xl"
            >
              ✕
            </button>
          )}
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
            { key: 'suspended', label: 'หยุดการใช้งาน', count: stats.suspended },
            { key: 'online', label: 'กำลังใช้งาน', count: stats.online }
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setFilter(key as typeof filter)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                filter === key
                  ? 'bg-[hsl(var(--primary))] text-blue-500'
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
                      <h3 className="font-bold text-[hsl(var(--text-primary))] flex items-center gap-2">
                        {registration.nickname}
                        {registration.member_id && (
                          <span className="text-sm font-normal text-[hsl(var(--text-secondary))] bg-blue-50 px-2 py-1 rounded-full">
                            รหัส: {registration.member_id}
                          </span>
                        )}
                        {(registration.status === 'approved' || registration.status === 'suspended') && (
                          isUserOnline(registration.id) ? (
                            <div className="flex items-center gap-1 px-2 py-1 bg-green-50 rounded-full border border-green-200">
                              <div className="w-3 h-3 bg-green-500 rounded-full animate-online-blink shadow-sm"></div>
                              <span className="text-xs text-green-700 font-semibold">🟢 กำลังใช้งาน</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-full border border-gray-200">
                              <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                              <span className="text-xs text-red-500 font-medium">🔴 ออฟไลน์</span>
                            </div>
                          )
                        )}
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
                      {registration.status === 'approved' && registration.approved_at && (
                        <p><strong>อนุมัติเมื่อ:</strong> {new Date(registration.approved_at).toLocaleDateString('th-TH')}</p>
                      )}
                       {(registration.status === 'approved' || registration.status === 'suspended') && registration.approved_at && (() => {
                         const expirationInfo = formatExpirationDisplay(registration.approved_at);
                         if (!expirationInfo) return null;
                         
                         return (
                           <div className="mt-2 space-y-1">
                             <p className={`${expirationInfo.className} flex items-center gap-2`}>
                               <strong>วันหมดอายุสมาชิก:</strong> 
                               <span>{expirationInfo.date}</span>
                               {expirationInfo.isExpired && (
                                 <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                                   หมดอายุสมาชิก
                                 </span>
                               )}
                             </p>
                             
                             {/* Login Statistics */}
                             <div className="mt-2 pt-2 border-t border-gray-200">
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                 <p className="text-blue-600">
                                   <strong>จำนวนครั้งการ Login:</strong> 
                                   <span className="ml-1 px-2 py-1 bg-blue-100 rounded-full text-xs font-semibold">
                                     {registration.login_count || 0} ครั้ง
                                   </span>
                                 </p>
                                 {registration.last_login_at ? (
                                   <p className="text-green-600">
                                     <strong>Login ครั้งล่าสุดเมื่อ:</strong> 
                                     <span className="ml-1 px-2 py-1 bg-green-100 rounded-full text-xs font-semibold">
                                       {new Date(registration.last_login_at).toLocaleString('th-TH', {
                                         year: 'numeric',
                                         month: '2-digit',
                                         day: '2-digit',
                                         hour: '2-digit',
                                         minute: '2-digit'
                                       })}
                                     </span>
                                   </p>
                                 ) : (
                                   <p className="text-gray-500">
                                     <strong>Login ครั้งล่าสุดเมื่อ:</strong> 
                                     <span className="ml-1 px-2 py-1 bg-gray-100 rounded-full text-xs">
                                       ยังไม่เคย Login
                                     </span>
                                   </p>
                                 )}
                               </div>
                             </div>
                           </div>
                         );
                       })()}
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
                    
                    {isUserOnline(registration.id) && (
                      <button
                        onClick={() => handleForceLogout(registration.parent_email, registration.nickname)}
                        className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
                      >
                        🚪 สมาชิกออกจากระบบ
                      </button>
                    )}
                    
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
                      <AlertDialogContent className="bg-white border border-gray-200 shadow-lg">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-gray-900 text-lg font-semibold">ยืนยันการลบสมาชิก</AlertDialogTitle>
                          <AlertDialogDescription className="text-gray-600">
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