import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Building2, LogIn, Eye, EyeOff, ArrowLeft, Shield } from 'lucide-react';
import logoAI from '@/assets/kidfastai-logo-3d.png';

interface SchoolInfo {
  id: string;
  name: string;
  code: string;
  logo_url: string | null;
  background_url: string | null;
  province: string | null;
}

const SchoolLogin = () => {
  const { schoolId } = useParams<{ schoolId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [school, setSchool] = useState<SchoolInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Fetch school data
  useEffect(() => {
    const fetchSchool = async () => {
      if (!schoolId) return;

      try {
        const { data, error } = await supabase
          .from('schools')
          .select('id, name, code, logo_url, background_url, province')
          .eq('id', schoolId)
          .eq('is_active', true)
          .single();

        if (error || !data) {
          navigate('/', { replace: true });
          return;
        }

        setSchool(data);
      } catch {
        navigate('/', { replace: true });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchool();
  }, [schoolId, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!school || !email || !password) return;

    setIsSubmitting(true);

    try {
      // Authenticate using custom auth (same as main login)
      const { data: authResult, error: authError } = await supabase
        .rpc('authenticate_user', {
          user_email: email,
          user_password: password,
        });

      if (authError) throw authError;

      const user = authResult?.[0];
      if (!user?.is_valid) {
        toast({
          title: 'เข้าสู่ระบบไม่สำเร็จ',
          description: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
          variant: 'destructive',
        });
        setIsSubmitting(false);
        return;
      }

      // Check if user is school_admin or teacher for this school
      const { data: membership, error: memberError } = await supabase
        .from('school_memberships')
        .select('role')
        .eq('school_id', school.id)
        .eq('user_id', user.user_id)
        .eq('is_active', true)
        .in('role', ['school_admin', 'teacher'])
        .maybeSingle();

      if (memberError) throw memberError;

      if (!membership) {
        toast({
          title: 'ไม่มีสิทธิ์เข้าถึง',
          description: 'คุณไม่ได้เป็นผู้ดูแลหรือครูของโรงเรียนนี้',
          variant: 'destructive',
        });
        setIsSubmitting(false);
        return;
      }

      // Save auth to localStorage
      localStorage.setItem('kidfast_auth', JSON.stringify({
        registrationId: user.user_id,
        nickname: user.nickname,
        email: user.email,
        memberId: user.member_id,
        schoolId: school.id,
        schoolRole: membership.role,
      }));

      toast({
        title: 'เข้าสู่ระบบสำเร็จ',
        description: `ยินดีต้อนรับสู่ ${school.name}`,
      });

      navigate('/school-admin', { replace: true });
    } catch (error: any) {
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: error.message || 'ไม่สามารถเข้าสู่ระบบได้',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-400"></div>
      </div>
    );
  }

  if (!school) return null;

  const backgroundImage = school.background_url || '';

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
      {/* Background Layer */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950">
        {backgroundImage && (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${backgroundImage})`,
              animation: 'slowZoom 30s ease-in-out infinite alternate',
            }}
          />
        )}
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/70 via-indigo-950/60 to-purple-950/70 backdrop-blur-[2px]" />
        
        {/* Animated Light Orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
      </div>

      {/* Back Button */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 z-20 flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>กลับหน้าหลัก</span>
      </button>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 md:p-10 shadow-2xl">
          {/* Co-branding Header */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <img src={logoAI} alt="KidFastAI" className="w-10 h-10 object-contain" />
            <div className="w-px h-8 bg-white/30" />
            <span className="text-white/60 text-xs font-medium">SCHOOL ACCOUNT</span>
          </div>

          {/* School Logo & Name */}
          <div className="text-center mb-8">
            <div className="w-24 h-24 rounded-2xl bg-white/10 border-2 border-white/20 flex items-center justify-center mx-auto mb-4 shadow-xl overflow-hidden">
              {school.logo_url ? (
                <img src={school.logo_url} alt={school.name} className="w-full h-full object-cover" />
              ) : (
                <Building2 className="w-12 h-12 text-white/60" />
              )}
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-white mb-1">{school.name}</h1>
            {school.province && (
              <p className="text-white/50 text-sm">จ.{school.province}</p>
            )}
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <Label className="text-white/80 text-sm mb-1.5 block">อีเมล</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="teacher@email.com"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:border-indigo-400 focus:ring-indigo-400/30 h-12 rounded-xl"
                required
              />
            </div>

            <div>
              <Label className="text-white/80 text-sm mb-1.5 block">รหัสผ่าน</Label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:border-indigo-400 focus:ring-indigo-400/30 h-12 rounded-xl pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-base shadow-lg shadow-indigo-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/40"
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white" />
              ) : (
                <>
                  <LogIn className="w-5 h-5 mr-2" />
                  เข้าสู่ระบบ
                </>
              )}
            </Button>
          </form>

          {/* Security Note */}
          <div className="mt-6 flex items-center justify-center gap-2 text-white/30 text-xs">
            <Shield className="w-3.5 h-3.5" />
            <span>เฉพาะผู้ดูแลโรงเรียนและครูเท่านั้น</span>
          </div>
        </div>
      </div>

      {/* CSS Animation */}
      <style>{`
        @keyframes slowZoom {
          from { transform: scale(1); }
          to { transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
};

export default SchoolLogin;
