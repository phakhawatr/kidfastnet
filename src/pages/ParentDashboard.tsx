import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Copy, Share2, QrCode, TrendingUp, Users, Award } from 'lucide-react';
import { toast } from 'sonner';
import Header from '../components/Header';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface AffiliateStats {
  affiliate_code: string;
  total_referrals: number;
  paid_referrals: number;
  total_points: number;
  pending_referrals: number;
}

interface Referral {
  id: string;
  nickname: string;
  parent_email: string;
  signup_date: string;
  payment_date: string | null;
  payment_status: string;
  points_earned: number;
  referral_status: string;
}

const ParentDashboard = () => {
  const { user, isLoading: authLoading, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<AffiliateStats>({
    affiliate_code: '',
    total_referrals: 0,
    paid_referrals: 0,
    total_points: 0,
    pending_referrals: 0
  });
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [affiliateLink, setAffiliateLink] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('ParentDashboard Auth state:', { user, authLoading, isLoggedIn });
    
    // Check localStorage auth as fallback
    const authState = localStorage.getItem('kidfast_auth');
    const hasLocalAuth = authState ? JSON.parse(authState).loggedIn === true : false;
    
    console.log('Local auth state:', hasLocalAuth);
    
    if (!authLoading) {
      if (!isLoggedIn && !hasLocalAuth) {
        console.log('Not logged in, redirecting to login');
        navigate('/login');
      } else {
        console.log('Authenticated, loading affiliate data');
        loadAffiliateData();
      }
    }
  }, [user, authLoading, isLoggedIn, navigate]);

  const loadAffiliateData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Loading affiliate data...');
      
      // Get email from multiple sources
      let email = user?.email;
      
      // Fallback 1: Get from localStorage last email
      if (!email) {
        const lastEmail = localStorage.getItem('kidfast_last_email');
        if (lastEmail) {
          email = lastEmail;
          console.log('Using last email from storage:', email);
        }
      }
      
      // Fallback 2: Fetch from database using registration_id
      if (!email) {
        const authState = localStorage.getItem('kidfast_auth');
        if (authState) {
          try {
            const parsed = JSON.parse(authState);
            console.log('Auth state from localStorage:', parsed);
            
            // Fetch email from user_registrations using registration_id
            if (parsed.registrationId) {
              console.log('Fetching email from database for registration:', parsed.registrationId);
              const { data: regData, error: regError } = await supabase
                .from('user_registrations')
                .select('parent_email')
                .eq('id', parsed.registrationId)
                .maybeSingle();
              
              if (regError) {
                console.error('Error fetching user registration:', regError);
              } else if (regData) {
                email = regData.parent_email;
                console.log('Fetched email from registration:', email);
                // Store for future use
                localStorage.setItem('kidfast_last_email', email);
              }
            }
          } catch (e) {
            console.error('Error parsing auth state:', e);
          }
        }
      }
      
      if (!email) {
        console.error('No user email found in any source');
        const errorMsg = 'ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบใหม่';
        setError(errorMsg);
        toast.error(errorMsg);
        setTimeout(() => navigate('/login'), 2000);
        return;
      }
      
      console.log('Using email for affiliate data:', email);
      
      // Get or create affiliate code
      const { data: userData, error: userError } = await supabase
        .from('user_registrations')
        .select('id')
        .eq('parent_email', email)
        .maybeSingle();

      console.log('User data:', userData, 'Error:', userError);

      if (userError) {
        console.error('Error fetching user:', userError);
        const errorMsg = 'ไม่สามารถโหลดข้อมูลผู้ใช้ได้: ' + userError.message;
        setError(errorMsg);
        toast.error(errorMsg);
        setIsLoading(false);
        return;
      }

      if (!userData) {
        const errorMsg = 'ไม่พบข้อมูลสมาชิก กรุณาติดต่อผู้ดูแลระบบ';
        setError(errorMsg);
        toast.error(errorMsg);
        setIsLoading(false);
        return;
      }

      if (userData) {
        // Check if user has affiliate code
        const { data: codeData, error: codeError } = await supabase
          .from('affiliate_codes')
          .select('affiliate_code')
          .eq('user_id', userData.id)
          .maybeSingle();

        console.log('Code data:', codeData, 'Error:', codeError);

        let code = codeData?.affiliate_code;
        
        if (!code) {
          // Generate new code
          console.log('Generating new affiliate code for user:', userData.id);
          const { data: newCode, error: genError } = await supabase.rpc('generate_affiliate_code', {
            p_user_id: userData.id
          });
          console.log('Generated code:', newCode, 'Error:', genError);
          
          if (genError) {
            console.error('Error generating code:', genError);
            toast.error('ไม่สามารถสร้างรหัส affiliate ได้');
            return;
          }
          code = newCode;
        }

        // Set affiliate link
        const link = `${window.location.origin}/signup?ref=${code}`;
        setAffiliateLink(link);
        console.log('Affiliate link set:', link);

        // Get stats
        console.log('Fetching stats for:', email);
        const { data: statsData, error: statsError } = await supabase.rpc('get_user_affiliate_stats', {
          p_user_email: email
        });

        console.log('Stats data:', statsData, 'Error:', statsError);

        if (statsError) {
          console.error('Error fetching stats:', statsError);
        }

        if (statsData && statsData.length > 0) {
          setStats(statsData[0]);
        } else {
          // Set default stats if no data
          setStats({
            affiliate_code: code || '',
            total_referrals: 0,
            paid_referrals: 0,
            total_points: 0,
            pending_referrals: 0
          });
        }

        // Get referrals
        console.log('Fetching referrals for:', email);
        const { data: referralsData, error: referralsError } = await supabase.rpc('get_affiliate_referrals', {
          p_user_email: email
        });

        console.log('Referrals data:', referralsData, 'Error:', referralsError);

        if (referralsError) {
          console.error('Error fetching referrals:', referralsError);
        }

        if (referralsData) {
          setReferrals(referralsData);
        }
      }
    } catch (error) {
      console.error('Error loading affiliate data:', error);
      const errorMsg = 'เกิดข้อผิดพลาดในการโหลดข้อมูล: ' + (error as Error).message;
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(affiliateLink);
    toast.success('คัดลอกลิงก์สำเร็จ!');
  };

  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'มาเรียนคณิตศาสตร์กับ KidFast.net',
          text: 'สมัครสมาชิกกับ KidFast.net ผ่านลิงก์นี้',
          url: affiliateLink,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      copyToClipboard();
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-500">ชำระแล้ว</Badge>;
      case 'pending':
        return <Badge variant="outline">รอชำระ</Badge>;
      case 'failed':
        return <Badge variant="destructive">ล้มเหลว</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-secondary to-accent">
        <Header />
        <div className="flex items-center justify-center h-[80vh]">
          <div className="card-glass p-8 text-center">
            <div className="text-4xl mb-4">🔄</div>
            <p className="text-text-secondary">กำลังตรวจสอบผู้ใช้...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-secondary to-accent">
        <Header />
        <div className="flex items-center justify-center h-[80vh]">
          <div className="card-glass p-8 text-center max-w-md">
            <div className="text-4xl mb-4">❌</div>
            <h2 className="text-xl font-bold text-red-600 mb-4">เกิดข้อผิดพลาด</h2>
            <p className="text-text-secondary mb-6">{error}</p>
            <div className="flex gap-3 justify-center">
              <button 
                onClick={() => navigate('/profile')}
                className="btn-secondary"
              >
                กลับหน้าโปรไฟล์
              </button>
              <button 
                onClick={() => window.location.reload()}
                className="btn-primary"
              >
                ลองใหม่
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-secondary to-accent">
        <Header />
        <div className="flex items-center justify-center h-[80vh]">
          <div className="card-glass p-8 text-center">
            <div className="text-4xl mb-4">🔄</div>
            <p className="text-text-secondary">กำลังโหลดข้อมูล affiliate...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-secondary to-accent">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">
          🎁 ระบบแนะนำเพื่อน Affiliate
        </h1>

        {/* Affiliate Link Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5" />
              ลิงก์แนะนำเพื่อนของคุณ
            </CardTitle>
            <CardDescription>
              แชร์ลิงก์นี้กับเพื่อนๆ เมื่อเพื่อนสมัครและชำระเงิน คุณจะได้รับ 50 คะแนน
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <input
                type="text"
                value={affiliateLink}
                readOnly
                className="flex-1 px-4 py-2 border rounded-lg bg-muted"
              />
              <Button onClick={copyToClipboard} variant="outline" size="icon">
                <Copy className="w-4 h-4" />
              </Button>
              <Button onClick={shareLink} variant="outline" size="icon">
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
            {stats && (
              <div className="mt-4 text-sm text-muted-foreground">
                รหัส Affiliate ของคุณ: <span className="font-mono font-bold">{stats.affiliate_code}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="w-4 h-4" />
                ทั้งหมด
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.total_referrals || 0}</div>
              <p className="text-xs text-muted-foreground">สมาชิกที่แนะนำ</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                ชำระแล้ว
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{stats?.paid_referrals || 0}</div>
              <p className="text-xs text-muted-foreground">สมาชิกที่ชำระเงิน</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <QrCode className="w-4 h-4 text-yellow-500" />
                รอชำระ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-500">{stats?.pending_referrals || 0}</div>
              <p className="text-xs text-muted-foreground">สมาชิกที่รอชำระ</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Award className="w-4 h-4 text-purple-500" />
                คะแนนสะสม
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-500">{stats?.total_points || 0}</div>
              <p className="text-xs text-muted-foreground">คะแนนทั้งหมด</p>
            </CardContent>
          </Card>
        </div>

        {/* Referrals Table */}
        <Card>
          <CardHeader>
            <CardTitle>รายชื่อสมาชิกที่แนะนำ</CardTitle>
            <CardDescription>
              รายชื่อสมาชิกที่สมัครผ่านลิงก์ของคุณ
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableCaption>
                {referrals.length === 0 ? 'ยังไม่มีสมาชิกที่แนะนำ' : `มีสมาชิกทั้งหมด ${referrals.length} คน`}
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>ชื่อเล่น</TableHead>
                  <TableHead>อีเมล์ผู้ปกครอง</TableHead>
                  <TableHead>วันที่สมัคร</TableHead>
                  <TableHead>วันที่ชำระเงิน</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead className="text-right">คะแนนที่ได้</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {referrals.map((referral) => (
                  <TableRow key={referral.id}>
                    <TableCell className="font-medium">{referral.nickname}</TableCell>
                    <TableCell>{referral.parent_email}</TableCell>
                    <TableCell>{formatDate(referral.signup_date)}</TableCell>
                    <TableCell>{formatDate(referral.payment_date)}</TableCell>
                    <TableCell>{getStatusBadge(referral.payment_status)}</TableCell>
                    <TableCell className="text-right">
                      {referral.points_earned > 0 ? (
                        <span className="text-purple-500 font-bold">+{referral.points_earned}</span>
                      ) : (
                        <span className="text-muted-foreground">0</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ParentDashboard;
