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
  awaiting_approval_referrals: number;
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
  user_status?: string;
  approved_at?: string | null;
}

const ParentDashboard = () => {
  const { user, isLoading: authLoading, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<AffiliateStats>({
    affiliate_code: '',
    total_referrals: 0,
    paid_referrals: 0,
    total_points: 0,
    pending_referrals: 0,
    awaiting_approval_referrals: 0
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
        // Get member_id from user data
        const { data: memberData, error: memberError } = await supabase
          .from('user_registrations')
          .select('member_id')
          .eq('id', userData.id)
          .maybeSingle();

        console.log('Member data:', memberData, 'Error:', memberError);

        if (memberError || !memberData?.member_id) {
          console.error('Error fetching member_id:', memberError);
          const errorMsg = 'ไม่สามารถโหลดรหัสสมาชิกได้';
          setError(errorMsg);
          toast.error(errorMsg);
          setIsLoading(false);
          return;
        }

        const memberId = memberData.member_id;

        // Set affiliate link using member_id
        const link = `${window.location.origin}/signup?ref=${memberId}`;
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
            affiliate_code: memberId || '',
            total_referrals: 0,
            paid_referrals: 0,
            total_points: 0,
            pending_referrals: 0,
            awaiting_approval_referrals: 0
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
          title: 'มาเรียนคณิตศาสตร์กับ KidFastAI.com',
          text: 'สมัครสมาชิกกับ KidFastAI.com ผ่านลิงก์นี้',
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

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculateExpiration = (payment_date: string | null, approved_at: string | null) => {
    const baseDate = payment_date || approved_at;
    if (!baseDate) return null;
    
    const date = new Date(baseDate);
    date.setFullYear(date.getFullYear() + 1);
    return date.toISOString();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <Badge className="bg-[hsl(var(--status-success-bg))] text-[hsl(var(--status-success-fg))] hover:opacity-90 font-semibold border-2 border-[hsl(var(--status-success-bg))]">
            ชำระแล้ว
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-[hsl(var(--status-warning-bg))] text-[hsl(var(--status-warning-fg))] hover:opacity-90 font-semibold border-2 border-[hsl(var(--status-warning-bg))]">
            รอชำระ
          </Badge>
        );
      case 'failed':
        return (
          <Badge className="bg-[hsl(var(--status-error-bg))] text-[hsl(var(--status-error-fg))] hover:opacity-90 font-semibold border-2 border-[hsl(var(--status-error-bg))]">
            ล้มเหลว
          </Badge>
        );
      default:
        return <Badge variant="secondary" className="font-semibold">{status}</Badge>;
    }
  };

  const getUserStatusBadge = (status?: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-[hsl(var(--status-success-light))] text-[hsl(var(--status-success-bg))] border-2 border-[hsl(var(--status-success-border))] font-semibold">
            อนุมัติแล้ว
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-[hsl(var(--status-info-light))] text-[hsl(var(--status-info-bg))] border-2 border-[hsl(var(--status-info-border))] font-semibold">
            รออนุมัติจากแอดมิน
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-[hsl(var(--status-error-light))] text-[hsl(var(--status-error-bg))] border-2 border-[hsl(var(--status-error-border))] font-semibold">
            ปฏิเสธ
          </Badge>
        );
      case 'suspended':
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800 border-2 border-gray-400 dark:bg-gray-800 dark:text-gray-200 font-semibold">
            ระงับการใช้งาน
          </Badge>
        );
      default:
        return <Badge variant="outline" className="font-semibold">{status || 'ไม่ทราบ'}</Badge>;
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
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <div className="text-4xl mb-4 text-center">❌</div>
              <CardTitle className="text-xl text-center text-red-600">เกิดข้อผิดพลาด</CardTitle>
              <CardDescription className="text-center">{error}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3 justify-center">
                <Button 
                  onClick={() => navigate('/profile')}
                  variant="outline"
                >
                  กลับหน้าโปรไฟล์
                </Button>
                <Button 
                  onClick={() => {
                    setError(null);
                    setIsLoading(true);
                    loadAffiliateData();
                  }}
                >
                  ลองใหม่
                </Button>
              </div>
            </CardContent>
          </Card>
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

        {/* Statistics Cards - WCAG 2.1 Compliant */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Card 1: ทั้งหมด */}
          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" aria-hidden="true" />
                <span>ทั้งหมด</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-4xl font-bold text-foreground" aria-label={`จำนวนสมาชิกทั้งหมด ${stats?.total_referrals || 0} คน`}>
                {stats?.total_referrals || 0}
              </div>
              <p className="text-base font-medium text-[hsl(var(--text-secondary))]">
                สมาชิกที่แนะนำ
              </p>
            </CardContent>
          </Card>

          {/* Card 2: ชำระแล้ว */}
          <Card className="border-2 border-[hsl(var(--status-success-border))] bg-[hsl(var(--status-success-light))] hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[hsl(var(--status-success-bg))]" aria-hidden="true" />
                <span className="text-[hsl(var(--status-success-bg))]">ชำระแล้ว</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-4xl font-bold text-[hsl(var(--status-success-bg))]" aria-label={`จำนวนสมาชิกที่ชำระแล้ว ${stats?.paid_referrals || 0} คน`}>
                {stats?.paid_referrals || 0}
              </div>
              <p className="text-base font-medium text-[hsl(var(--text-secondary))]">
                ได้รับคะแนนแล้ว
              </p>
            </CardContent>
          </Card>

          {/* Card 3: รออนุมัติ */}
          <Card className="border-2 border-[hsl(var(--status-info-border))] bg-[hsl(var(--status-info-light))] hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <QrCode className="w-5 h-5 text-[hsl(var(--status-info-bg))]" aria-hidden="true" />
                <span className="text-[hsl(var(--status-info-bg))]">รออนุมัติ</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-4xl font-bold text-[hsl(var(--status-info-bg))]" aria-label={`จำนวนสมาชิกรออนุมัติ ${stats?.awaiting_approval_referrals || 0} คน`}>
                {stats?.awaiting_approval_referrals || 0}
              </div>
              <p className="text-base font-medium text-[hsl(var(--text-secondary))]">
                จากแอดมิน
              </p>
            </CardContent>
          </Card>

          {/* Card 4: รอชำระเงิน */}
          <Card className="border-2 border-[hsl(var(--status-warning-border))] bg-[hsl(var(--status-warning-light))] hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Award className="w-5 h-5 text-[hsl(var(--status-warning-bg))]" aria-hidden="true" />
                <span className="text-[hsl(var(--status-warning-bg))]">รอชำระเงิน</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-4xl font-bold text-[hsl(var(--status-warning-bg))]" aria-label={`จำนวนสมาชิกรอชำระเงิน ${stats?.pending_referrals || 0} คน`}>
                {stats?.pending_referrals || 0}
              </div>
              <p className="text-base font-medium text-[hsl(var(--text-secondary))]">
                อนุมัติแล้ว
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Points Card - WCAG 2.1 Enhanced */}
        <Card className="mb-8 border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 shadow-lg">
          <CardHeader className="space-y-3">
            <CardTitle className="flex items-center gap-3 text-xl font-bold text-amber-800 dark:text-amber-300">
              <Award className="w-6 h-6" aria-hidden="true" />
              <span>คะแนนสะสมทั้งหมด</span>
            </CardTitle>
            <CardDescription className="text-base font-medium text-[hsl(var(--text-secondary))]">
              🎁 ได้รับ <strong className="text-amber-800 dark:text-amber-300">50 คะแนน</strong>ต่อเพื่อนที่ชำระเงินแล้ว
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div 
              className="text-5xl font-bold text-amber-700 dark:text-amber-400" 
              aria-label={`คะแนนสะสมทั้งหมด ${stats?.total_points || 0} คะแนน`}
            >
              {stats?.total_points || 0} <span className="text-3xl">คะแนน</span>
            </div>
          </CardContent>
        </Card>

        {/* Referrals Table - WCAG 2.1 Enhanced */}
        <Card className="border-2">
          <CardHeader className="space-y-2">
            <CardTitle className="text-xl font-bold">รายชื่อสมาชิกที่แนะนำ</CardTitle>
            <CardDescription className="text-base font-medium">
              รายชื่อสมาชิกที่สมัครผ่านลิงก์ของคุณ
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableCaption className="text-base font-medium">
                  {referrals.length === 0 ? 'ยังไม่มีสมาชิกที่แนะนำ' : `มีสมาชิกทั้งหมด ${referrals.length} คน`}
                </TableCaption>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead className="font-bold text-base text-foreground">ชื่อเล่น</TableHead>
                    <TableHead className="font-bold text-base text-foreground">อีเมล์ผู้ปกครอง</TableHead>
                    <TableHead className="font-bold text-base text-foreground">วันที่สมัคร</TableHead>
                    <TableHead className="font-bold text-base text-foreground">สถานะอนุมัติ</TableHead>
                    <TableHead className="font-bold text-base text-foreground">วันอนุมัติ</TableHead>
                    <TableHead className="font-bold text-base text-foreground">วันที่ชำระเงิน</TableHead>
                    <TableHead className="font-bold text-base text-foreground">สถานะชำระ</TableHead>
                    <TableHead className="font-bold text-base text-foreground">วันครบกำหนด 1 ปี</TableHead>
                    <TableHead className="text-right font-bold text-base text-foreground">คะแนนที่ได้</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {referrals.map((referral) => {
                    const expirationDate = calculateExpiration(referral.payment_date, referral.approved_at);
                    return (
                      <TableRow key={referral.id} className="hover:bg-muted/30">
                        <TableCell className="font-semibold text-base py-4">{referral.nickname}</TableCell>
                        <TableCell className="text-base py-4">{referral.parent_email}</TableCell>
                        <TableCell className="text-base py-4">{formatDate(referral.signup_date)}</TableCell>
                        <TableCell className="py-4">{getUserStatusBadge(referral.user_status)}</TableCell>
                        <TableCell className="text-base py-4">{formatDateTime(referral.approved_at)}</TableCell>
                        <TableCell className="text-base py-4">{formatDate(referral.payment_date)}</TableCell>
                        <TableCell className="py-4">{getStatusBadge(referral.payment_status)}</TableCell>
                        <TableCell className="py-4">
                          {expirationDate ? (
                            <span className="text-base font-medium">{formatDate(expirationDate)}</span>
                          ) : (
                            <span className="text-base text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right py-4">
                          {referral.points_earned > 0 ? (
                            <span className="text-lg font-bold text-[hsl(var(--primary))]">+{referral.points_earned}</span>
                          ) : (
                            <span className="text-base text-muted-foreground font-medium">0</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ParentDashboard;
