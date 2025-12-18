import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
  is_online?: boolean;
  last_activity_at?: string;
  payment_status?: 'pending' | 'paid';
  payment_date?: string;
  subscription_tier: 'basic' | 'premium';
  ai_features_enabled: boolean;
  ai_monthly_quota: number;
  ai_usage_count: number;
  is_teacher?: boolean;
}

interface UserPresence {
  user_id: string;
  online_at: string;
}

interface SchoolData {
  id: string;
  name: string;
  code: string;
  address?: string;
  district?: string;
  province?: string;
  phone?: string;
  email?: string;
  is_active: boolean;
  teacher_count?: number;
  student_count?: number;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { name, email, logout, adminId } = useAdmin();
  const [registrations, setRegistrations] = useState<UserRegistration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'suspended' | 'online' | 'paid' | 'unpaid' | 'teacher' | 'student'>('pending');
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentConfirmDialog, setPaymentConfirmDialog] = useState<{
    isOpen: boolean;
    registrationId: string;
    nickname: string;
  } | null>(null);
  const [createUserDialog, setCreateUserDialog] = useState(false);
  const [newUser, setNewUser] = useState({
    nickname: '',
    age: 10,
    grade: '1',
    avatar: 'cat',
    parent_email: '',
    parent_phone: '',
    password: '',
    learning_style: 'visual'
  });

  // School management states
  const [schools, setSchools] = useState<SchoolData[]>([]);
  const [createSchoolDialog, setCreateSchoolDialog] = useState(false);
  const [newSchool, setNewSchool] = useState({
    name: '',
    code: '',
    address: '',
    district: '',
    province: '',
    phone: '',
    email: '',
    selectedAdminId: ''
  });

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
    // Only fetch when email is available and component is mounted
    if (email && !isLoading) {
      console.log('useEffect: Fetching with email:', email);
      fetchRegistrations();
    } else {
      console.log('useEffect: Not fetching - email:', email, 'isLoading:', isLoading);
    }
  }, [email]); // Add email as dependency

  // Set up presence tracking for online users
  useEffect(() => {
    const channel = supabase.channel('admin-dashboard', {
      config: {
        presence: { key: 'admin' }
      }
    });

    // Listen for presence changes and sync with database
    channel.on('presence', { event: 'sync' }, async () => {
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
      console.log('Online users updated from presence:', Array.from(onlineUserIds));
      
      // Refresh registrations to get latest database status
      fetchRegistrations();
    });

    // Track when users join
    channel.on('presence', { event: 'join' }, async ({ key, newPresences }) => {
      console.log('User joined presence:', key, newPresences);
    });

    // Track when users leave and update database
    channel.on('presence', { event: 'leave' }, async ({ key, leftPresences }) => {
      console.log('User left presence:', key, leftPresences);
      // Refresh to see updated status
      fetchRegistrations();
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

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchRegistrations(true); // true = auto refresh
    }, 300000); // 5 minutes = 300,000 ms

    return () => clearInterval(intervalId);
  }, []);

  // Check if user is currently online (both presence and database)
  const isUserOnline = (userId: string, dbIsOnline?: boolean) => {
    // Check both presence channel and database status
    const isOnlineInPresence = onlineUsers.has(userId);
    const isOnlineInDb = dbIsOnline === true;
    const isOnline = isOnlineInPresence || isOnlineInDb;
    
    console.log(`Checking online status for ${userId}:`, { 
      presence: isOnlineInPresence,
      database: isOnlineInDb,
      final: isOnline,
      onlineUsers: Array.from(onlineUsers) 
    });
    
    return isOnline;
  };

  const fetchRegistrations = async (isAutoRefresh = false) => {
    try {
      setIsLoading(true);
      
      // Get admin email from hook or localStorage as fallback
      const adminEmail = email || (() => {
        try {
          const stored = localStorage.getItem('kidfast_admin_auth');
          if (stored) {
            const parsed = JSON.parse(stored);
            return parsed.email;
          }
        } catch (e) {
          console.error('Failed to parse admin auth from localStorage:', e);
        }
        return null;
      })();
      
      // Validate email exists
      if (!adminEmail) {
        console.error('Admin email is not available in hook or localStorage');
        ToastManager.show({
          message: 'ไม่พบข้อมูลอีเมลผู้ดูแล กรุณาเข้าสู่ระบบใหม่',
          type: 'error'
        });
        setIsLoading(false);
        return;
      }

      console.log('Fetching registrations for admin:', adminEmail);
      console.log('Calling RPC with params:', { admin_email: adminEmail });
      
      // Use new secure admin function with proper authorization
      const { data, error } = await supabase.rpc('admin_get_user_registrations', {
        admin_email: adminEmail
      });

      if (error) {
        console.error('RPC Error Details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }
      
      console.log('✅ Successfully fetched registrations:', data?.length || 0, 'records');
      
      // is_teacher is now included in the RPC response, no need to query separately
      setRegistrations(data as UserRegistration[]);
      
      // Show toast for auto-refresh
      if (isAutoRefresh) {
        ToastManager.show({
          message: '🔄 รีเฟรชข้อมูลอัตโนมัติแล้ว',
          type: 'info'
        });
      }
    } catch (error: any) {
      console.error('❌ Error fetching registrations:', error);
      ToastManager.show({
        message: 'เกิดข้อผิดพลาดในการโหลดข้อมูล: ' + (error?.message || 'Unknown error'),
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

  const handleApprove = async (registrationId: string, role: 'user' | 'teacher' | 'parent' = 'user') => {
    try {
      const { error } = await supabase.rpc('approve_user_registration', {
        registration_id: registrationId,
        admin_id: adminId
      });

      if (error) throw error;

      ToastManager.show({
        message: 'อนุมัติสมาชิกเรียบร้อย! หากต้องการมอบสิทธิ์ครู ให้กดปุ่ม "🎓 ครู" หลังจากอนุมัติ',
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

  const handleForceLogout = async (userEmail: string, nickname: string, userId: string) => {
    try {
      // Call the RPC to clear session in database
      const { error } = await supabase.rpc('logout_user_session', {
        user_email: userEmail
      });

      if (error) throw error;

      // Immediately remove from online users set
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });

      ToastManager.show({
        message: `ออกจากระบบสมาชิก "${nickname}" เรียบร้อย!`,
        type: 'success'
      });

      // Refresh data to get updated status
      await fetchRegistrations();
    } catch (error) {
      console.error('Error forcing logout:', error);
      ToastManager.show({
        message: 'เกิดข้อผิดพลาดในการออกจากระบบ',
        type: 'error'
      });
    }
  };

  const handleMarkPaymentCompleted = async (registrationId: string, nickname: string) => {
    try {
      const { data, error } = await supabase.rpc('mark_payment_completed', {
        p_registration_id: registrationId,
        p_admin_id: adminId
      });

      if (error) throw error;

      if (data) {
        ToastManager.show({
          message: `✅ บันทึกการชำระเงินของ "${nickname}" เรียบร้อย และมอบคะแนนให้ผู้แนะนำแล้ว!`,
          type: 'success'
        });
        fetchRegistrations();
      } else {
        ToastManager.show({
          message: 'ไม่สามารถบันทึกการชำระเงินได้ กรุณาตรวจสอบสถานะสมาชิก',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error marking payment completed:', error);
      ToastManager.show({
        message: 'เกิดข้อผิดพลาดในการบันทึกการชำระเงิน',
        type: 'error'
      });
    }
  };

  const handleResetPayment = async (registrationId: string, nickname: string) => {
    try {
      const { data, error } = await supabase.rpc('reset_payment_status', {
        p_registration_id: registrationId,
        p_admin_id: adminId
      });

      if (error) throw error;

      if (data) {
        ToastManager.show({
          message: `🔄 รีเซ็ตสถานะการชำระเงินของ "${nickname}" เรียบร้อย!`,
          type: 'info'
        });
        fetchRegistrations();
      } else {
        ToastManager.show({
          message: 'ไม่สามารถรีเซ็ตสถานะได้',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error resetting payment:', error);
      ToastManager.show({
        message: 'เกิดข้อผิดพลาดในการรีเซ็ตสถานะการชำระเงิน',
        type: 'error'
      });
    }
  };

  const handleUpgradeToPremium = async (registrationId: string, nickname: string) => {
    try {
      const { data, error } = await supabase.rpc('upgrade_to_premium', {
        p_registration_id: registrationId,
        p_admin_id: adminId
      });

      if (error) throw error;

      if (data) {
        ToastManager.show({
          message: `✨ อัพเกรด "${nickname}" เป็น Premium เรียบร้อย!`,
          type: 'success'
        });
        fetchRegistrations();
      } else {
        ToastManager.show({
          message: 'ไม่สามารถอัพเกรดได้ กรุณาตรวจสอบสถานะสมาชิก',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error upgrading to premium:', error);
      ToastManager.show({
        message: 'เกิดข้อผิดพลาดในการอัพเกรด Premium',
        type: 'error'
      });
    }
  };

  const handleDowngradeToBasic = async (registrationId: string, nickname: string) => {
    try {
      const { data, error } = await supabase.rpc('downgrade_to_basic', {
        p_registration_id: registrationId,
        p_admin_id: adminId
      });

      if (error) throw error;

      if (data) {
        ToastManager.show({
          message: `📉 ปรับ "${nickname}" เป็น Basic เรียบร้อย!`,
          type: 'info'
        });
        fetchRegistrations();
      } else {
        ToastManager.show({
          message: 'ไม่สามารถปรับเป็น Basic ได้',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error downgrading to basic:', error);
      ToastManager.show({
        message: 'เกิดข้อผิดพลาดในการปรับเป็น Basic',
        type: 'error'
      });
    }
  };

  const handleToggleTeacherRole = async (userId: string, nickname: string, isCurrentlyTeacher: boolean) => {
    try {
      if (!email) {
        throw new Error('Admin email not available');
      }

      if (isCurrentlyTeacher) {
        // Remove teacher role using RPC function
        const { data, error } = await supabase.rpc('remove_teacher_role', {
          p_user_id: userId,
          p_admin_email: email
        });

        if (error) throw error;

        if (data) {
          ToastManager.show({
            message: `✅ เปลี่ยน "${nickname}" เป็นนักเรียนเรียบร้อย!`,
            type: 'success'
          });
        }
      } else {
        // Add teacher role using RPC function
        const { data, error } = await supabase.rpc('assign_teacher_role', {
          p_user_id: userId,
          p_admin_email: email
        });

        if (error) throw error;

        if (data) {
          ToastManager.show({
            message: `🎓 มอบสิทธิ์ครูให้ "${nickname}" เรียบร้อย!`,
            type: 'success'
          });
        }
      }

      fetchRegistrations();
    } catch (error: any) {
      console.error('Error toggling teacher role:', error);
      ToastManager.show({
        message: 'เกิดข้อผิดพลาดในการเปลี่ยน Role: ' + error.message,
        type: 'error'
      });
    }
  };

  const openPaymentConfirmDialog = (registrationId: string, nickname: string) => {
    setPaymentConfirmDialog({
      isOpen: true,
      registrationId,
      nickname
    });
  };

  const handleConfirmPayment = async () => {
    if (!paymentConfirmDialog) return;

    try {
      const { data, error } = await supabase.rpc('mark_payment_completed', {
        p_registration_id: paymentConfirmDialog.registrationId,
        p_admin_id: adminId
      });

      if (error) throw error;

      if (data) {
        ToastManager.show({
          message: `✅ บันทึกการชำระเงินของ "${paymentConfirmDialog.nickname}" เรียบร้อย และมอบคะแนนให้ผู้แนะนำแล้ว!`,
          type: 'success'
        });
        setPaymentConfirmDialog(null);
        fetchRegistrations();
      } else {
        ToastManager.show({
          message: 'ไม่สามารถบันทึกการชำระเงินได้ กรุณาตรวจสอบสถานะสมาชิก',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error marking payment completed:', error);
      ToastManager.show({
        message: 'เกิดข้อผิดพลาดในการบันทึกการชำระเงิน',
        type: 'error'
      });
    }
  };

  const handleCreateUser = async () => {
    try {
      // Validate required fields
      if (!newUser.nickname || !newUser.parent_email || !newUser.password) {
        ToastManager.show({
          message: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน',
          type: 'error'
        });
        return;
      }

      // Call RPC to create user
      const { data: userId, error } = await supabase.rpc('register_new_user', {
        p_nickname: newUser.nickname,
        p_age: newUser.age,
        p_grade: newUser.grade,
        p_avatar: newUser.avatar,
        p_parent_email: newUser.parent_email,
        p_parent_phone: newUser.parent_phone || '',
        p_password: newUser.password,
        p_learning_style: newUser.learning_style
      });

      if (error) throw error;

      // Auto-approve the user
      const { error: approveError } = await supabase.rpc('approve_user_registration', {
        registration_id: userId,
        admin_id: adminId
      });

      if (approveError) throw approveError;

      ToastManager.show({
        message: `สร้างผู้ใช้ "${newUser.nickname}" เรียบร้อยและอนุมัติอัตโนมัติแล้ว! หากต้องการมอบสิทธิ์ครู ให้กดปุ่ม "🎓 ครู" ในรายการผู้ใช้`,
        type: 'success'
      });

      // Reset form and close dialog
      setNewUser({
        nickname: '',
        age: 10,
        grade: '1',
        avatar: 'cat',
        parent_email: '',
        parent_phone: '',
        password: '',
        learning_style: 'visual'
      });
      setCreateUserDialog(false);
      fetchRegistrations();
    } catch (error: any) {
      console.error('Error creating user:', error);
      ToastManager.show({
        message: 'เกิดข้อผิดพลาดในการสร้างผู้ใช้: ' + (error?.message || 'Unknown error'),
        type: 'error'
      });
    }
  };

  // Fetch schools
  const fetchSchools = async () => {
    try {
      const { data, error } = await supabase
        .from('schools')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get counts for each school
      const schoolsWithCounts = await Promise.all((data || []).map(async (school) => {
        const { count: teacherCount } = await supabase
          .from('school_memberships')
          .select('*', { count: 'exact', head: true })
          .eq('school_id', school.id)
          .eq('is_active', true)
          .in('role', ['teacher', 'school_admin']);

        const { count: studentCount } = await supabase
          .from('school_memberships')
          .select('*', { count: 'exact', head: true })
          .eq('school_id', school.id)
          .eq('is_active', true)
          .eq('role', 'student');

        return {
          ...school,
          teacher_count: teacherCount || 0,
          student_count: studentCount || 0
        };
      }));

      setSchools(schoolsWithCounts);
    } catch (error) {
      console.error('Error fetching schools:', error);
    }
  };

  // Create school
  const handleCreateSchool = async () => {
    try {
      if (!newSchool.name || !newSchool.code) {
        ToastManager.show({
          message: 'กรุณากรอกชื่อโรงเรียนและรหัสโรงเรียน',
          type: 'error'
        });
        return;
      }

      if (!newSchool.selectedAdminId) {
        ToastManager.show({
          message: 'กรุณาเลือก School Admin',
          type: 'error'
        });
        return;
      }

      // Insert school
      const { data: schoolData, error: schoolError } = await supabase
        .from('schools')
        .insert({
          name: newSchool.name,
          code: newSchool.code,
          address: newSchool.address || null,
          district: newSchool.district || null,
          province: newSchool.province || null,
          phone: newSchool.phone || null,
          email: newSchool.email || null,
          is_active: true
        })
        .select()
        .single();

      if (schoolError) throw schoolError;

      // Add school admin membership
      const { error: membershipError } = await supabase
        .from('school_memberships')
        .insert({
          school_id: schoolData.id,
          user_id: newSchool.selectedAdminId,
          role: 'school_admin',
          is_active: true
        });

      if (membershipError) throw membershipError;

      // Note: school_admin role is managed via school_memberships table
      // The user_roles table has app_role enum (admin, teacher, user, parent)
      // School admin permissions are checked via is_school_admin() function

      ToastManager.show({
        message: `🏫 สร้างโรงเรียน "${newSchool.name}" เรียบร้อย!`,
        type: 'success'
      });

      // Reset form and close dialog
      setNewSchool({
        name: '',
        code: '',
        address: '',
        district: '',
        province: '',
        phone: '',
        email: '',
        selectedAdminId: ''
      });
      setCreateSchoolDialog(false);
      fetchSchools();
    } catch (error: any) {
      console.error('Error creating school:', error);
      ToastManager.show({
        message: 'เกิดข้อผิดพลาดในการสร้างโรงเรียน: ' + (error?.message || 'Unknown error'),
        type: 'error'
      });
    }
  };

  // Fetch schools on mount
  useEffect(() => {
    if (email) {
      fetchSchools();
    }
  }, [email]);

  const filteredRegistrations = registrations.filter(reg => {
    // Apply status filter
    let matchesFilter = false;
    if (filter === 'online') {
      matchesFilter = isUserOnline(reg.id, reg.is_online);
    } else if (filter === 'paid') {
      matchesFilter = reg.status === 'approved' && reg.payment_status === 'paid';
    } else if (filter === 'unpaid') {
      matchesFilter = reg.status === 'approved' && reg.payment_status === 'pending';
    } else if (filter === 'teacher') {
      matchesFilter = reg.status === 'approved' && reg.is_teacher === true;
    } else if (filter === 'student') {
      matchesFilter = reg.status === 'approved' && reg.is_teacher !== true;
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
    online: registrations.filter(r => isUserOnline(r.id, r.is_online)).length,
    paid: registrations.filter(r => r.status === 'approved' && r.payment_status === 'paid').length,
    unpaid: registrations.filter(r => r.status === 'approved' && r.payment_status === 'pending').length,
    teacher: registrations.filter(r => r.status === 'approved' && r.is_teacher === true).length,
    student: registrations.filter(r => r.status === 'approved' && r.is_teacher !== true).length,
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
      <header className="card-glass p-6 mb-6" role="banner">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              🎛️ ระบบจัดการผู้ดูแล
            </h1>
            <p className="text-gray-700">
              สวัสดี คุณ{name} ({email})
            </p>
          </div>
          <div className="flex flex-wrap gap-3" role="group" aria-label="การดำเนินการหลัก">
            <Dialog open={createUserDialog} onOpenChange={setCreateUserDialog}>
              <DialogTrigger asChild>
                <button
                  className="btn-primary flex items-center gap-2 min-h-[44px] px-4 focus:ring-4 focus:ring-green-300 focus:outline-none"
                  aria-label="สร้างผู้ใช้ใหม่"
                >
                  <span aria-hidden="true">➕</span>
                  <span>สร้างผู้ใช้ใหม่</span>
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>สร้างผู้ใช้ใหม่</DialogTitle>
                  <DialogDescription>
                    กรอกข้อมูลผู้ใช้ใหม่ ระบบจะสร้างและอนุมัติอัตโนมัติ<br />
                    <span className="text-orange-600 font-medium">หมายเหตุ: สำหรับ System Teacher ใช้ระดับชั้น ป.1 หรือ ป.6 แล้วมอบสิทธิ์ครูภายหลัง</span>
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="nickname" className="text-right">
                      ชื่อเล่น *
                    </Label>
                    <Input
                      id="nickname"
                      value={newUser.nickname}
                      onChange={(e) => setNewUser({...newUser, nickname: e.target.value})}
                      className="col-span-3"
                      placeholder="เช่น KidFast System"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right">
                      อีเมล *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={newUser.parent_email}
                      onChange={(e) => setNewUser({...newUser, parent_email: e.target.value})}
                      className="col-span-3"
                      placeholder="system@kidfastai.com"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="password" className="text-right">
                      รหัสผ่าน *
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                      className="col-span-3"
                      placeholder="รหัสผ่าน"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="grade" className="text-right">
                      ระดับชั้น *
                    </Label>
                    <Select
                      value={newUser.grade}
                      onValueChange={(value) => setNewUser({...newUser, grade: value})}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="เลือกระดับชั้น" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">ป.1</SelectItem>
                        <SelectItem value="2">ป.2</SelectItem>
                        <SelectItem value="3">ป.3</SelectItem>
                        <SelectItem value="4">ป.4</SelectItem>
                        <SelectItem value="5">ป.5</SelectItem>
                        <SelectItem value="6">ป.6</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="age" className="text-right">
                      อายุ
                    </Label>
                    <Input
                      id="age"
                      type="number"
                      value={newUser.age}
                      onChange={(e) => setNewUser({...newUser, age: parseInt(e.target.value) || 10})}
                      className="col-span-3"
                      min={1}
                      max={100}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="phone" className="text-right">
                      เบอร์โทร
                    </Label>
                    <Input
                      id="phone"
                      value={newUser.parent_phone}
                      onChange={(e) => setNewUser({...newUser, parent_phone: e.target.value})}
                      className="col-span-3"
                      placeholder="เบอร์โทรศัพท์"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setCreateUserDialog(false)}>
                    ยกเลิก
                  </Button>
                  <Button onClick={handleCreateUser}>
                    สร้างผู้ใช้
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Create School Dialog */}
            <Dialog open={createSchoolDialog} onOpenChange={setCreateSchoolDialog}>
              <DialogTrigger asChild>
                <button
                  className="btn-primary flex items-center gap-2 min-h-[44px] px-4 focus:ring-4 focus:ring-indigo-300 focus:outline-none bg-indigo-600 hover:bg-indigo-700"
                  aria-label="สร้างโรงเรียนใหม่"
                >
                  <span aria-hidden="true">🏫</span>
                  <span>สร้างโรงเรียน</span>
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>🏫 สร้างโรงเรียนใหม่</DialogTitle>
                  <DialogDescription>
                    กรอกข้อมูลโรงเรียนและเลือกผู้ดูแลโรงเรียน (School Admin)
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="school-name" className="text-right">
                      ชื่อโรงเรียน *
                    </Label>
                    <Input
                      id="school-name"
                      value={newSchool.name}
                      onChange={(e) => setNewSchool({...newSchool, name: e.target.value})}
                      className="col-span-3"
                      placeholder="เช่น โรงเรียนอนุบาลสยาม"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="school-code" className="text-right">
                      รหัสโรงเรียน *
                    </Label>
                    <Input
                      id="school-code"
                      value={newSchool.code}
                      onChange={(e) => setNewSchool({...newSchool, code: e.target.value.toUpperCase()})}
                      className="col-span-3"
                      placeholder="เช่น ANB001"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="school-admin" className="text-right">
                      School Admin *
                    </Label>
                    <Select
                      value={newSchool.selectedAdminId}
                      onValueChange={(value) => setNewSchool({...newSchool, selectedAdminId: value})}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="เลือกผู้ดูแลโรงเรียน" />
                      </SelectTrigger>
                      <SelectContent>
                        {registrations
                          .filter(r => r.status === 'approved' && r.is_teacher)
                          .map(teacher => (
                            <SelectItem key={teacher.id} value={teacher.id}>
                              {teacher.nickname} ({teacher.parent_email})
                            </SelectItem>
                          ))
                        }
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="school-address" className="text-right">
                      ที่อยู่
                    </Label>
                    <Input
                      id="school-address"
                      value={newSchool.address}
                      onChange={(e) => setNewSchool({...newSchool, address: e.target.value})}
                      className="col-span-3"
                      placeholder="ที่อยู่โรงเรียน"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="school-district" className="text-right">
                      อำเภอ/เขต
                    </Label>
                    <Input
                      id="school-district"
                      value={newSchool.district}
                      onChange={(e) => setNewSchool({...newSchool, district: e.target.value})}
                      className="col-span-3"
                      placeholder="เช่น บางกะปิ"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="school-province" className="text-right">
                      จังหวัด
                    </Label>
                    <Input
                      id="school-province"
                      value={newSchool.province}
                      onChange={(e) => setNewSchool({...newSchool, province: e.target.value})}
                      className="col-span-3"
                      placeholder="เช่น กรุงเทพมหานคร"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="school-phone" className="text-right">
                      โทรศัพท์
                    </Label>
                    <Input
                      id="school-phone"
                      value={newSchool.phone}
                      onChange={(e) => setNewSchool({...newSchool, phone: e.target.value})}
                      className="col-span-3"
                      placeholder="02-XXX-XXXX"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="school-email" className="text-right">
                      อีเมล
                    </Label>
                    <Input
                      id="school-email"
                      type="email"
                      value={newSchool.email}
                      onChange={(e) => setNewSchool({...newSchool, email: e.target.value})}
                      className="col-span-3"
                      placeholder="school@example.com"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setCreateSchoolDialog(false)}>
                    ยกเลิก
                  </Button>
                  <Button onClick={handleCreateSchool} className="bg-indigo-600 hover:bg-indigo-700">
                    🏫 สร้างโรงเรียน
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            <button
              onClick={() => {
                console.log('🔘 คลังข้อสอบระบบ button clicked');
                navigate('/admin/question-bank');
              }}
              className="btn-primary flex items-center gap-2 min-h-[44px] px-4 focus:ring-4 focus:ring-purple-300 focus:outline-none"
              aria-label="จัดการคลังข้อสอบระบบ"
            >
              <span aria-hidden="true">📚</span>
              <span>คลังข้อสอบระบบ</span>
            </button>
            <button
              onClick={() => fetchRegistrations(false)}
              className="btn-secondary flex items-center gap-2 min-h-[44px] px-4 focus:ring-4 focus:ring-blue-300 focus:outline-none"
              disabled={isLoading}
              aria-label={isLoading ? 'กำลังโหลดข้อมูล' : 'รีเฟรชข้อมูล'}
            >
              <span className={isLoading ? 'animate-spin' : ''} aria-hidden="true">🔄</span>
              <span>{isLoading ? 'กำลังโหลด...' : 'รีเฟรชข้อมูล'}</span>
            </button>
            <button
              onClick={logout}
              className="btn-secondary min-h-[44px] px-4 focus:ring-4 focus:ring-red-300 focus:outline-none"
              aria-label="ออกจากระบบผู้ดูแล"
            >
              <span aria-hidden="true">🚪</span> ออกจากระบบ
            </button>
          </div>
        </div>
      </header>

      {/* Stats */}
      <section aria-label="สถิติสมาชิก" className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-6">
        <div className="card-glass p-4 text-center" role="status" aria-label="จำนวนสมาชิกทั้งหมด">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-700">ทั้งหมด</div>
        </div>
        <div className="card-glass p-4 text-center" role="status" aria-label="จำนวนสมาชิกรอการอนุมัติ">
          <div className="text-2xl font-bold text-orange-700">{stats.pending}</div>
          <div className="text-sm text-gray-700">รอการอนุมัติ</div>
        </div>
        <div className="card-glass p-4 text-center" role="status" aria-label="จำนวนสมาชิกที่อนุมัติแล้ว">
          <div className="text-2xl font-bold text-green-700">{stats.approved}</div>
          <div className="text-sm text-gray-700">อนุมัติแล้ว</div>
        </div>
        <div className="card-glass p-4 text-center" role="status" aria-label="จำนวนสมาชิกที่ถูกปฏิเสธ">
          <div className="text-2xl font-bold text-red-700">{stats.rejected}</div>
          <div className="text-sm text-gray-700">ปฏิเสธ</div>
        </div>
        <div className="card-glass p-4 text-center" role="status" aria-label="จำนวนสมาชิกที่หยุดการใช้งาน">
          <div className="text-2xl font-bold text-yellow-700">{stats.suspended}</div>
          <div className="text-sm text-gray-700">หยุดการใช้งาน</div>
        </div>
        <div className="card-glass p-4 text-center" role="status" aria-label="จำนวนสมาชิกที่กำลังใช้งาน">
          <div className="text-2xl font-bold text-blue-700">{stats.online}</div>
          <div className="text-sm text-gray-700">กำลังใช้งาน</div>
        </div>
        <div className="card-glass p-4 text-center" role="status" aria-label="จำนวนสมาชิกที่ชำระเงินแล้ว">
          <div className="text-2xl font-bold text-green-800">{stats.paid}</div>
          <div className="text-sm text-gray-700"><span aria-hidden="true">💰</span> ชำระเงินแล้ว</div>
        </div>
        <div className="card-glass p-4 text-center" role="status" aria-label="จำนวนสมาชิกที่รอการชำระเงิน">
          <div className="text-2xl font-bold text-orange-700">{stats.unpaid}</div>
          <div className="text-sm text-gray-700"><span aria-hidden="true">⏳</span> รอการชำระเงิน</div>
        </div>
      </section>

      {/* Schools Section */}
      {schools.length > 0 && (
        <section aria-label="รายการโรงเรียน" className="card-glass p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <span aria-hidden="true">🏫</span>
              โรงเรียนในระบบ ({schools.length})
            </h2>
            <button
              onClick={fetchSchools}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              🔄 รีเฟรช
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {schools.map(school => (
              <div key={school.id} className="bg-white/80 rounded-lg p-4 border border-gray-200">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900">{school.name}</h3>
                    <p className="text-sm text-gray-600">รหัส: {school.code}</p>
                  </div>
                  <button
                    onClick={() => navigate('/school-admin')}
                    className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded hover:bg-indigo-200"
                  >
                    จัดการ →
                  </button>
                </div>
                <div className="mt-2 flex gap-4 text-sm">
                  <span className="text-green-700">👨‍🏫 ครู: {school.teacher_count || 0}</span>
                  <span className="text-blue-700">👦 นักเรียน: {school.student_count || 0}</span>
                </div>
                {school.province && (
                  <p className="text-xs text-gray-500 mt-1">📍 {school.district && `${school.district}, `}{school.province}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Search Box */}
      <div className="card-glass p-4 mb-4" role="search">
        <label htmlFor="member-search" className="sr-only">ค้นหาสมาชิก</label>
        <div className="relative">
          <input
            id="member-search"
            type="search"
            placeholder="🔍 ค้นหาจากชื่อเล่น, เบอร์โทร, หรือรหัสสมาชิก..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 min-h-[44px] rounded-lg border-2 border-gray-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-200 focus:outline-none text-gray-900 placeholder:text-gray-600"
            aria-label="ค้นหาสมาชิกจากชื่อเล่น เบอร์โทร หรือรหัสสมาชิก"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-900 text-xl min-w-[44px] min-h-[44px] flex items-center justify-center focus:ring-4 focus:ring-blue-300 focus:outline-none rounded"
              aria-label="ล้างการค้นหา"
            >
              <span aria-hidden="true">✕</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <nav className="card-glass p-4 mb-6" aria-label="ตัวกรองสมาชิก">
        <div className="flex flex-wrap gap-2" role="group" aria-label="ตัวเลือกการกรอง">
          {[
            { key: 'all', label: 'ทั้งหมด', count: stats.total },
            { key: 'pending', label: 'รอการอนุมัติ', count: stats.pending },
            { key: 'approved', label: 'อนุมัติแล้ว', count: stats.approved },
            { key: 'rejected', label: 'ปฏิเสธ', count: stats.rejected },
            { key: 'suspended', label: 'หยุดการใช้งาน', count: stats.suspended },
            { key: 'online', label: 'กำลังใช้งาน', count: stats.online },
            { key: 'paid', label: '💰 ชำระเงินแล้ว', count: stats.paid },
            { key: 'unpaid', label: '⏳ รอการชำระเงิน', count: stats.unpaid }
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setFilter(key as typeof filter)}
              className={`min-h-[44px] px-4 py-2 rounded-full text-sm font-medium transition-all focus:ring-4 focus:outline-none ${
                filter === key
                  ? 'bg-blue-600 text-white focus:ring-blue-300'
                  : 'bg-white text-gray-900 hover:bg-gray-100 focus:ring-gray-300 border-2 border-gray-300'
              }`}
              aria-label={`กรอง${label} ${count} รายการ`}
              aria-pressed={filter === key}
            >
              {label} ({count})
            </button>
          ))}
        </div>
      </nav>

      {/* Registrations List */}
      <main className="space-y-4" role="main" aria-label="รายการสมาชิก">
        <h2 className="sr-only">รายการสมาชิก</h2>
        {filteredRegistrations.length === 0 ? (
          <div className="card-glass p-8 text-center" role="status">
            <div className="text-4xl mb-4" aria-hidden="true">📭</div>
            <p className="text-gray-700">ไม่มีข้อมูลการสมัครสมาชิก</p>
          </div>
        ) : (
          filteredRegistrations.map((registration) => (
            <article key={registration.id} className="card-glass p-6" aria-label={`ข้อมูลสมาชิก ${registration.nickname}`}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl" aria-hidden="true">{avatarEmojis[registration.avatar] || '🐱'}</span>
                    <div>
                      <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        {registration.nickname}
                        {registration.member_id && (
                          <span className="text-sm font-normal text-gray-700 bg-blue-100 px-2 py-1 rounded-full">
                            รหัส: {registration.member_id}
                          </span>
                        )}
                        {(registration.status === 'approved' || registration.status === 'suspended') && (
                          isUserOnline(registration.id, registration.is_online) ? (
                            <div className="flex items-center gap-1 px-2 py-1 bg-green-50 rounded-full border border-green-300" role="status" aria-label="สถานะออนไลน์">
                              <div className="w-3 h-3 bg-green-600 rounded-full animate-online-blink shadow-sm" aria-hidden="true"></div>
                              <span className="text-xs text-green-900 font-semibold"><span aria-hidden="true">🟢</span> กำลังใช้งาน</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full border border-gray-300" role="status" aria-label="สถานะออฟไลน์">
                              <div className="w-3 h-3 bg-gray-500 rounded-full" aria-hidden="true"></div>
                              <span className="text-xs text-gray-900 font-medium"><span aria-hidden="true">🔴</span> ออฟไลน์</span>
                            </div>
                          )
                        )}
                      </h3>
                      <p className="text-sm text-gray-700">
                        {registration.age} ปี • {registration.grade}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      registration.status === 'pending' ? 'bg-orange-100 text-orange-900 border border-orange-300' :
                      registration.status === 'approved' ? 'bg-green-100 text-green-900 border border-green-300' :
                      registration.status === 'suspended' ? 'bg-yellow-100 text-yellow-900 border border-yellow-300' :
                      'bg-red-100 text-red-900 border border-red-300'
                    }`} role="status" aria-label={`สถานะ: ${
                      registration.status === 'pending' ? 'รอการอนุมัติ' :
                      registration.status === 'approved' ? 'อนุมัติแล้ว' : 
                      registration.status === 'suspended' ? 'หยุดการใช้งาน' : 'ปฏิเสธ'
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

                               {/* Payment Status - Only for approved members */}
                              <div className="mt-2 pt-2 border-t border-gray-200">
                                <div className="flex items-center gap-2 text-sm">
                                  <span className="font-medium">💳 สถานะการชำระเงิน:</span>
                                  {registration.payment_status === 'paid' ? (
                                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                      ✅ ชำระเงินแล้ว
                                    </span>
                                  ) : (
                                    <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                                      ⏳ รอการชำระเงิน
                                    </span>
                                  )}
                                </div>
                                {registration.payment_date && (
                                  <p className="text-xs text-green-600 mt-1">
                                    <strong>วันที่ชำระ:</strong> {new Date(registration.payment_date).toLocaleString('th-TH', {
                                      year: 'numeric',
                                      month: '2-digit',
                                      day: '2-digit',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </p>
                                )}
                              </div>

                              {/* Subscription Tier */}
                              <div className="mt-2 pt-2 border-t border-gray-200">
                                <div className="flex items-center gap-2 text-sm flex-wrap">
                                  <span className="font-medium">✨ แพ็กเกจ:</span>
                                  {registration.subscription_tier === 'premium' ? (
                                    <span className="px-2 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 rounded-full text-xs font-medium border border-purple-300">
                                      👑 Premium
                                    </span>
                                  ) : (
                                    <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                                      🆓 Basic (Free)
                                    </span>
                                  )}
                                  {registration.ai_features_enabled && (
                                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                      🤖 AI: {registration.ai_usage_count || 0}/{registration.ai_monthly_quota || 0}
                                    </span>
                                  )}
                                  {/* Role Badge */}
                                  {registration.status === 'approved' && (
                                    registration.is_teacher ? (
                                      <span className="px-2 py-1 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-full text-xs font-medium shadow-sm">
                                        👨‍🏫 ครู
                                      </span>
                                    ) : (
                                      <span className="px-2 py-1 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-full text-xs font-medium shadow-sm">
                                        👨‍🎓 นักเรียน
                                      </span>
                                    )
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
                  <div className="space-y-3" role="group" aria-label="การดำเนินการอนุมัติ">
                    <div className="flex gap-3 items-center">
                      <label className="text-sm font-medium text-foreground">เลือก Role:</label>
                      <select
                        id={`role-select-${registration.id}`}
                        className="px-3 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        defaultValue="user"
                      >
                        <option value="user">👤 นักเรียน (User)</option>
                        <option value="teacher">👨‍🏫 ครู (Teacher)</option>
                        <option value="parent">👨‍👩‍👧 ผู้ปกครอง (Parent)</option>
                      </select>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          const select = document.getElementById(`role-select-${registration.id}`) as HTMLSelectElement;
                          const role = select?.value as 'user' | 'teacher' | 'parent' || 'user';
                          handleApprove(registration.id, role);
                        }}
                        className="min-h-[44px] px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-4 focus:ring-green-300 focus:outline-none transition-colors text-sm font-medium"
                        aria-label={`อนุมัติการสมัครของ ${registration.nickname}`}
                      >
                        <span aria-hidden="true">✅</span> อนุมัติ
                      </button>
                      <button
                        onClick={() => handleReject(registration.id)}
                        className="min-h-[44px] px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:ring-4 focus:ring-red-300 focus:outline-none transition-colors text-sm font-medium"
                        aria-label={`ปฏิเสธการสมัครของ ${registration.nickname}`}
                      >
                        <span aria-hidden="true">❌</span> ปฏิเสธ
                      </button>
                    </div>
                  </div>
                )}

                {/* Payment Action Buttons - Only for approved members */}
                {registration.status === 'approved' && (
                  <div className="flex gap-3 flex-wrap" role="group" aria-label="การดำเนินการชำระเงิน">
                    {registration.payment_status === 'pending' && (
                      <button
                        onClick={() => openPaymentConfirmDialog(registration.id, registration.nickname)}
                        className="min-h-[44px] px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg focus:ring-4 focus:ring-green-300 focus:outline-none transition-colors text-sm font-medium shadow-md"
                        aria-label={`ยืนยันการชำระเงินของ ${registration.nickname}`}
                      >
                        <span aria-hidden="true">💰</span> ชำระแล้ว
                      </button>
                    )}
                    {registration.payment_status === 'paid' && (
                      <button
                        onClick={() => handleResetPayment(registration.id, registration.nickname)}
                        className="min-h-[44px] px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg focus:ring-4 focus:ring-gray-300 focus:outline-none transition-colors text-sm font-medium"
                        aria-label={`รีเซ็ตสถานะการชำระเงินของ ${registration.nickname}`}
                      >
                        <span aria-hidden="true">🔄</span> รีเซ็ตการชำระเงิน
                      </button>
                    )}
                    
                    {/* Premium Management Buttons */}
                    {registration.subscription_tier === 'basic' ? (
                      <button
                        onClick={() => handleUpgradeToPremium(registration.id, registration.nickname)}
                        className="min-h-[44px] px-5 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg focus:ring-4 focus:ring-purple-300 focus:outline-none transition-all text-sm font-medium shadow-md"
                        aria-label={`อัพเกรดเป็น Premium สำหรับ ${registration.nickname}`}
                      >
                        <span aria-hidden="true">✨</span> อัพเกรด Premium
                      </button>
                    ) : (
                      <button
                        onClick={() => handleDowngradeToBasic(registration.id, registration.nickname)}
                        className="min-h-[44px] px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg focus:ring-4 focus:ring-gray-300 focus:outline-none transition-colors text-sm font-medium"
                        aria-label={`ปรับเป็น Basic สำหรับ ${registration.nickname}`}
                      >
                        <span aria-hidden="true">📉</span> ปรับเป็น Basic
                      </button>
                    )}
                  </div>
                )}

                {/* Teacher Role Toggle Button - Only for approved members */}
                {registration.status === 'approved' && (
                  <div className="flex gap-3 flex-wrap" role="group" aria-label="การจัดการ Role">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button
                          className={`min-h-[44px] px-5 py-2 text-white rounded-lg focus:ring-4 focus:outline-none transition-all text-sm font-medium shadow-md ${
                            registration.is_teacher
                              ? 'bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 focus:ring-blue-300'
                              : 'bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 focus:ring-purple-300'
                          }`}
                          aria-label={registration.is_teacher ? `เปลี่ยน ${registration.nickname} เป็นนักเรียน` : `มอบสิทธิ์ครูให้ ${registration.nickname}`}
                        >
                          {registration.is_teacher ? (
                            <><span aria-hidden="true">👨‍🎓</span> เปลี่ยนเป็นนักเรียน</>
                          ) : (
                            <><span aria-hidden="true">🎓</span> มอบสิทธิ์ครู</>
                          )}
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-white border border-gray-200 shadow-lg">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-gray-900 text-lg font-semibold">
                            {registration.is_teacher ? 'เปลี่ยนเป็นนักเรียน?' : 'มอบสิทธิ์ครู?'}
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-gray-700">
                            {registration.is_teacher ? (
                              <>
                                คุณต้องการเปลี่ยน "{registration.nickname}" จาก <strong>ครู</strong> เป็น <strong>นักเรียน</strong> หรือไม่?
                                <br /><br />
                                สมาชิกจะไม่สามารถเข้าถึงหน้า Teacher Dashboard ได้อีกต่อไป
                              </>
                            ) : (
                              <>
                                คุณต้องการมอบสิทธิ์ <strong>ครู</strong> ให้ "{registration.nickname}" หรือไม่?
                                <br /><br />
                                สมาชิกจะสามารถเข้าถึงหน้า Teacher Dashboard และสร้างข้อสอบได้
                              </>
                            )}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="bg-gray-200 text-gray-900 hover:bg-gray-300">
                            ยกเลิก
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleToggleTeacherRole(registration.id, registration.nickname, registration.is_teacher || false)}
                            className={registration.is_teacher 
                              ? 'bg-blue-600 hover:bg-blue-700 text-white'
                              : 'bg-purple-600 hover:bg-purple-700 text-white'
                            }
                          >
                            ยืนยัน
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}

                {/* Suspension and Logout Buttons */}
                {(registration.status === 'approved' || registration.status === 'suspended') && (
                  <div className="flex gap-3 flex-wrap" role="group" aria-label="การจัดการบัญชี">
                    {/* Force Logout Button - Shows only when user is online */}
                    {isUserOnline(registration.id, registration.is_online) && (
                      <button
                        onClick={() => {
                          console.log('Force logout clicked for:', registration.nickname, registration.id);
                          handleForceLogout(registration.parent_email, registration.nickname, registration.id);
                        }}
                        className="min-h-[44px] px-5 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 focus:ring-4 focus:ring-orange-300 focus:outline-none transition-colors text-sm font-medium shadow-md"
                        aria-label={`บังคับออกจากระบบ ${registration.nickname}`}
                      >
                        <span aria-hidden="true">🚪</span> สมาชิกออกจากระบบ
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleToggleSuspension(registration.id)}
                      className={`min-h-[44px] px-5 py-2 text-white rounded-lg focus:ring-4 focus:outline-none transition-colors text-sm font-medium ${
                        registration.status === 'suspended' 
                          ? 'bg-green-600 hover:bg-green-700 focus:ring-green-300' 
                          : 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-300'
                      }`}
                      aria-label={registration.status === 'suspended' ? `เปิดการใช้งาน ${registration.nickname}` : `หยุดการใช้งาน ${registration.nickname}`}
                    >
                      {registration.status === 'suspended' ? <><span aria-hidden="true">✅</span> เปิดการใช้งาน</> : <><span aria-hidden="true">⏸️</span> หยุดการใช้งาน</>}
                    </button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          className="min-h-[44px] text-sm font-medium focus:ring-4 focus:ring-red-300"
                          aria-label={`ลบสมาชิก ${registration.nickname}`}
                        >
                          <span aria-hidden="true">🗑️</span> ลบสมาชิก
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-white border border-gray-200 shadow-lg">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-gray-900 text-lg font-semibold">ยืนยันการลบสมาชิก</AlertDialogTitle>
                          <AlertDialogDescription className="text-gray-700">
                            คุณต้องการลบสมาชิก "{registration.nickname}" หรือไม่?
                            <br />
                            การดำเนินการนี้ไม่สามารถย้อนกลับได้
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="focus:ring-4 focus:ring-gray-300">ยกเลิก</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(registration.id)}
                            className="bg-red-600 hover:bg-red-700 focus:ring-4 focus:ring-red-300"
                          >
                            ลบสมาชิก
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </div>
            </article>
          ))
        )}
      </main>

      {/* Payment Confirmation Dialog */}
      <AlertDialog open={paymentConfirmDialog?.isOpen || false} onOpenChange={(open) => !open && setPaymentConfirmDialog(null)}>
        <AlertDialogContent className="bg-white border border-gray-200 shadow-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900 text-lg font-semibold">ยืนยันการชำระเงิน</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-700">
              รับชำระเงินเรียบร้อยแล้ว
              <br />
              <span className="font-semibold text-gray-900 mt-2 inline-block">
                สมาชิก: {paymentConfirmDialog?.nickname}
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPaymentConfirmDialog(null)} className="focus:ring-4 focus:ring-gray-300">ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmPayment}
              className="bg-green-600 hover:bg-green-700 focus:ring-4 focus:ring-green-300"
            >
              ยืนยันการชำระเงิน
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminDashboard;