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
      // Simple password check for demo (in real app, use proper hashing)
      const { data: admin, error } = await supabase
        .from('admins')
        .select('*')
        .eq('email', email)
        .single();

      if (error || !admin) {
        ToastManager.show({
          message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
          type: 'error'
        });
        return false;
      }

      // For demo purposes, accept simple password
      if (password === 'admin123') {
        const newAdminState: AdminState = {
          loggedIn: true,
          adminId: admin.id,
          name: admin.name,
          email: admin.email
        };
        
        setAdminState(newAdminState);
        localStorage.setItem('kidfast_admin_auth', JSON.stringify(newAdminState));
        
        ToastManager.show({
          message: 'เข้าสู่ระบบผู้ดูแลเรียบร้อย!',
          type: 'success'
        });
        
        navigate('/admin');
        return true;
      } else {
        ToastManager.show({
          message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
          type: 'error'
        });
        return false;
      }
    } catch (error) {
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