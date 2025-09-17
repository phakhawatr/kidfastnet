import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ToastManager } from '../components/Toast';

interface AdminState {
  loggedIn: boolean;
  adminId: string;
  name: string;
  email: string;
}

export const useAdmin = () => {
  const [adminState, setAdminState] = useState<AdminState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem('kidfast_admin_auth');
    if (stored) {
      try {
        setAdminState(JSON.parse(stored));
      } catch (e) {
        localStorage.removeItem('kidfast_admin_auth');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // Use secure authentication function
      const { data: authResult, error } = await supabase.rpc('authenticate_admin', {
        admin_email: email,
        admin_password: password
      });

      if (error) {
        console.error('Authentication error:', error);
        ToastManager.show({
          message: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ',
          type: 'error'
        });
        return false;
      }

      const result = authResult?.[0];
      if (result?.is_valid) {
        const adminState: AdminState = {
          loggedIn: true,
          adminId: result.admin_id,
          name: result.name,
          email: result.email
        };

        setAdminState(adminState);
        localStorage.setItem('kidfast_admin_auth', JSON.stringify(adminState));

        ToastManager.show({
          message: `ยินดีต้อนรับ ${result.name}!`,
          type: 'success'
        });

        navigate('/admin/dashboard');
        return true;
      } else {
        ToastManager.show({
          message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
          type: 'error'
        });
        return false;
      }
    } catch (err) {
      console.error('Login error:', err);
      ToastManager.show({
        message: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ',
        type: 'error'
      });
      return false;
    }
  };

  const logout = () => {
    setAdminState(null);
    localStorage.removeItem('kidfast_admin_auth');
    ToastManager.show({
      message: 'ออกจากระบบผู้ดูแลเรียบร้อย!',
      type: 'info'
    });
    navigate('/admin/login');
  };

  return {
    isLoggedIn: adminState?.loggedIn || false,
    adminId: adminState?.adminId,
    name: adminState?.name,
    email: adminState?.email,
    isLoading,
    login,
    logout
  };
};