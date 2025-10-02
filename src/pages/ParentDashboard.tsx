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
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<AffiliateStats | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [affiliateLink, setAffiliateLink] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadAffiliateData();
    }
  }, [user]);

  const loadAffiliateData = async () => {
    try {
      setIsLoading(true);
      
      // Get or create affiliate code
      const { data: userData } = await supabase
        .from('user_registrations')
        .select('id')
        .eq('parent_email', user?.email)
        .single();

      if (userData) {
        // Check if user has affiliate code
        const { data: codeData } = await supabase
          .from('affiliate_codes')
          .select('affiliate_code')
          .eq('user_id', userData.id)
          .single();

        let code = codeData?.affiliate_code;
        
        if (!code) {
          // Generate new code
          const { data: newCode } = await supabase.rpc('generate_affiliate_code', {
            p_user_id: userData.id
          });
          code = newCode;
        }

        // Set affiliate link
        const link = `${window.location.origin}/signup?ref=${code}`;
        setAffiliateLink(link);

        // Get stats
        const { data: statsData } = await supabase.rpc('get_user_affiliate_stats', {
          p_user_email: user?.email
        });

        if (statsData && statsData.length > 0) {
          setStats(statsData[0]);
        }

        // Get referrals
        const { data: referralsData } = await supabase.rpc('get_affiliate_referrals', {
          p_user_email: user?.email
        });

        if (referralsData) {
          setReferrals(referralsData);
        }
      }
    } catch (error) {
      console.error('Error loading affiliate data:', error);
      toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูล');
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

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-secondary to-accent">
        <Header />
        <div className="flex items-center justify-center h-[80vh]">
          <div className="card-glass p-8 text-center">
            <div className="text-4xl mb-4">🔄</div>
            <p className="text-text-secondary">กำลังโหลดข้อมูล...</p>
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
