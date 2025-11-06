import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Copy, Share2, QrCode, TrendingUp, Users, Award } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('parentdashboard');
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
        const errorMsg = t('error.noUser');
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
        const errorMsg = t('error.noUserData', { message: userError.message });
        setError(errorMsg);
        toast.error(errorMsg);
        setIsLoading(false);
        return;
      }

      if (!userData) {
        const errorMsg = t('error.noMember');
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
          const errorMsg = t('error.noMemberId');
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
      const errorMsg = t('error.loadError', { message: (error as Error).message });
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(affiliateLink);
    toast.success(t('affiliateLink.copySuccess'));
  };

  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: t('affiliateLink.shareTitle'),
          text: t('affiliateLink.shareText'),
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
            {t('status.payment.paid')}
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-[hsl(var(--status-warning-bg))] text-[hsl(var(--status-warning-fg))] hover:opacity-90 font-semibold border-2 border-[hsl(var(--status-warning-bg))]">
            {t('status.payment.pending')}
          </Badge>
        );
      case 'failed':
        return (
          <Badge className="bg-[hsl(var(--status-error-bg))] text-[hsl(var(--status-error-fg))] hover:opacity-90 font-semibold border-2 border-[hsl(var(--status-error-bg))]">
            {t('status.payment.failed')}
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
            {t('status.user.approved')}
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-[hsl(var(--status-info-light))] text-[hsl(var(--status-info-bg))] border-2 border-[hsl(var(--status-info-border))] font-semibold">
            {t('status.user.pending')}
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-[hsl(var(--status-error-light))] text-[hsl(var(--status-error-bg))] border-2 border-[hsl(var(--status-error-border))] font-semibold">
            {t('status.user.rejected')}
          </Badge>
        );
      case 'suspended':
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800 border-2 border-gray-400 dark:bg-gray-800 dark:text-gray-200 font-semibold">
            {t('status.user.suspended')}
          </Badge>
        );
      default:
        return <Badge variant="outline" className="font-semibold">{status || t('status.user.unknown')}</Badge>;
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-secondary to-accent">
        <Header />
        <div className="flex items-center justify-center h-[80vh]">
          <div className="card-glass p-8 text-center">
            <div className="text-4xl mb-4">🔄</div>
            <p className="text-text-secondary">{t('loading.checkingUser')}</p>
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
              <CardTitle className="text-xl text-center text-red-600">{t('error.title')}</CardTitle>
              <CardDescription className="text-center">{error}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3 justify-center">
                <Button 
                  onClick={() => navigate('/profile')}
                  variant="outline"
                >
                  {t('error.backToProfile')}
                </Button>
                <Button 
                  onClick={() => {
                    setError(null);
                    setIsLoading(true);
                    loadAffiliateData();
                  }}
                >
                  {t('error.retry')}
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
            <p className="text-text-secondary">{t('loading.loadingData')}</p>
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
          {t('pageTitle')}
        </h1>

        {/* Affiliate Link Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5" />
              {t('affiliateLink.title')}
            </CardTitle>
            <CardDescription>
              {t('affiliateLink.description')}
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
                {t('affiliateLink.affiliateCode', { code: stats.affiliate_code })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Statistics Cards - WCAG 2.1 Compliant */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Card 1: Total */}
          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" aria-hidden="true" />
                <span>{t('stats.total')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-4xl font-bold text-foreground" aria-label={`${t('stats.totalReferrals')} ${stats?.total_referrals || 0} ${t('stats.members')}`}>
                {stats?.total_referrals || 0}
              </div>
              <p className="text-base font-medium text-[hsl(var(--text-secondary))]">
                {t('stats.totalReferrals')}
              </p>
            </CardContent>
          </Card>

          {/* Card 2: Paid */}
          <Card className="border-2 border-[hsl(var(--status-success-border))] bg-[hsl(var(--status-success-light))] hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[hsl(var(--status-success-bg))]" aria-hidden="true" />
                <span className="text-[hsl(var(--status-success-bg))]">{t('stats.paid')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-4xl font-bold text-[hsl(var(--status-success-bg))]" aria-label={`${t('stats.paid')} ${stats?.paid_referrals || 0} ${t('stats.members')}`}>
                {stats?.paid_referrals || 0}
              </div>
              <p className="text-base font-medium text-[hsl(var(--text-secondary))]">
                {t('stats.paidReceived')}
              </p>
            </CardContent>
          </Card>

          {/* Card 3: Pending Approval */}
          <Card className="border-2 border-[hsl(var(--status-info-border))] bg-[hsl(var(--status-info-light))] hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <QrCode className="w-5 h-5 text-[hsl(var(--status-info-bg))]" aria-hidden="true" />
                <span className="text-[hsl(var(--status-info-bg))]">{t('stats.pending')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-4xl font-bold text-[hsl(var(--status-info-bg))]" aria-label={`${t('stats.pending')} ${stats?.awaiting_approval_referrals || 0} ${t('stats.members')}`}>
                {stats?.awaiting_approval_referrals || 0}
              </div>
              <p className="text-base font-medium text-[hsl(var(--text-secondary))]">
                {t('stats.pendingFromAdmin')}
              </p>
            </CardContent>
          </Card>

          {/* Card 4: Awaiting Payment */}
          <Card className="border-2 border-[hsl(var(--status-warning-border))] bg-[hsl(var(--status-warning-light))] hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Award className="w-5 h-5 text-[hsl(var(--status-warning-bg))]" aria-hidden="true" />
                <span className="text-[hsl(var(--status-warning-bg))]">{t('stats.awaitingPayment')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-4xl font-bold text-[hsl(var(--status-warning-bg))]" aria-label={`${t('stats.awaitingPayment')} ${stats?.pending_referrals || 0} ${t('stats.members')}`}>
                {stats?.pending_referrals || 0}
              </div>
              <p className="text-base font-medium text-[hsl(var(--text-secondary))]">
                {t('stats.awaitingPaymentApproved')}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Points Card - WCAG 2.1 Enhanced */}
        <Card className="mb-8 border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 shadow-lg">
          <CardHeader className="space-y-3">
            <CardTitle className="flex items-center gap-3 text-xl font-bold text-amber-800 dark:text-amber-300">
              <Award className="w-6 h-6" aria-hidden="true" />
              <span>{t('stats.totalPoints')}</span>
            </CardTitle>
            <CardDescription className="text-base font-medium text-[hsl(var(--text-secondary))]" dangerouslySetInnerHTML={{ __html: t('stats.pointsDescription') }} />
          </CardHeader>
          <CardContent className="pt-2">
            <div 
              className="text-5xl font-bold text-amber-700 dark:text-amber-400" 
              aria-label={`${t('stats.totalPoints')} ${stats?.total_points || 0} ${t('stats.points')}`}
            >
              {stats?.total_points || 0} <span className="text-3xl">{t('stats.points')}</span>
            </div>
          </CardContent>
        </Card>

        {/* Referrals Table - WCAG 2.1 Enhanced */}
        <Card className="border-2">
          <CardHeader className="space-y-2">
            <CardTitle className="text-xl font-bold">{t('table.title')}</CardTitle>
            <CardDescription className="text-base font-medium">
              {t('table.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableCaption className="text-base font-medium">
                  {referrals.length === 0 ? t('table.noReferrals') : t('table.totalReferrals', { count: referrals.length })}
                </TableCaption>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead className="font-bold text-base text-foreground">{t('table.headers.nickname')}</TableHead>
                    <TableHead className="font-bold text-base text-foreground">{t('table.headers.email')}</TableHead>
                    <TableHead className="font-bold text-base text-foreground">{t('table.headers.signupDate')}</TableHead>
                    <TableHead className="font-bold text-base text-foreground">{t('table.headers.approvalStatus')}</TableHead>
                    <TableHead className="font-bold text-base text-foreground">{t('table.headers.approvedDate')}</TableHead>
                    <TableHead className="font-bold text-base text-foreground">{t('table.headers.paymentDate')}</TableHead>
                    <TableHead className="font-bold text-base text-foreground">{t('table.headers.paymentStatus')}</TableHead>
                    <TableHead className="font-bold text-base text-foreground">{t('table.headers.expiryDate')}</TableHead>
                    <TableHead className="text-right font-bold text-base text-foreground">{t('table.headers.pointsEarned')}</TableHead>
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
