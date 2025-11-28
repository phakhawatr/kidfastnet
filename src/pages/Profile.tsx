import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SkillsSection from '../components/SkillsSection';
import AchievementBadge from '../components/AchievementBadge';
import { useAuth } from '../hooks/useAuth';
import { useAchievements } from '../hooks/useAchievements';
import { useTeacherRole } from '../hooks/useTeacherRole';
import { useTrainingCalendar } from '../hooks/useTrainingCalendar';
import { useRecentApps } from '../hooks/useRecentApps';
import { appRegistry } from '../config/appRegistry';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, Sparkles, Edit, Upload, X, Trophy, GraduationCap, ChevronRight, Star, Clock, CheckCircle, Zap, ChevronDown, ChevronUp, Target, Award, Calendar as CalendarIcon, Check, MessageSquare, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { SubscriptionTab } from '../components/SubscriptionTab';
import { toast } from '@/hooks/use-toast';

// Define recommendation categories (translations in profile.json)
const recommendationCategories = {
  'interactive-games': {
    titleKey: 'recommendations.categories.interactiveGames.title',
    descriptionKey: 'recommendations.categories.interactiveGames.description',
    icon: '🎮',
    color: 'from-purple-500 via-pink-500 to-rose-500',
    apps: [
      { key: 'flowerMath', icon: '🌸', link: '/flower-math', isNew: true },
      { key: 'balloonMath', icon: '🎈', link: '/balloon-math', isNew: true },
      { key: 'countingChallenge', icon: '🐠', link: '/counting-challenge', isNew: true },
      { key: 'compareStars', icon: '⭐', link: '/compare-stars', isNew: true },
      { key: 'boardCounting', icon: '🐴', link: '/board-counting', isNew: true },
      { key: 'fruitCounting', icon: '🍎', link: '/fruit-counting', isNew: true },
      { key: 'fractionShapes', icon: '🧩', link: '/fraction-shapes' },
      { key: 'shapeSeries', icon: '🔄', link: '/shape-series' },
      { key: 'shapeMatching', icon: '🔷', link: '/shape-matching' }
    ]
  },
  'basics': {
    titleKey: 'recommendations.categories.basics.title',
    descriptionKey: 'recommendations.categories.basics.description',
    icon: '📚',
    color: 'from-blue-500 via-cyan-500 to-teal-500',
    apps: [
      { key: 'addition', icon: '➕', link: '/addition' },
      { key: 'subtraction', icon: '➖', link: '/subtraction' },
      { key: 'multiplication', icon: '✖️', link: '/multiply' },
      { key: 'division', icon: '➗', link: '/division' },
      { key: 'multiplicationTable', icon: '📊', link: '/multiplication-table' },
      { key: 'money', icon: '💰', link: '/money' },
      { key: 'time', icon: '🕐', link: '/time' },
      { key: 'weighing', icon: '⚖️', link: '/weighing' },
      { key: 'measurement', icon: '📐', link: '/measurement' },
      { key: 'fractionMatching', icon: '🍕', link: '/fraction-matching' },
      { key: 'lengthComparison', icon: '📏', link: '/length-comparison' },
      { key: 'percentage', icon: '📊', link: '/percentage' },
      { key: 'placeValue', icon: '🔢', link: '/place-value' }
    ]
  },
  'advanced': {
    titleKey: 'recommendations.categories.advanced.title',
    descriptionKey: 'recommendations.categories.advanced.description',
    icon: '🧠',
    color: 'from-orange-500 via-amber-500 to-yellow-500',
    apps: [
      { key: 'mentalMath', icon: '⚡', link: '/mental-math' },
      { key: 'quickMath', icon: '⏱️', link: '/quick-math' },
      { key: 'sumGridPuzzles', icon: '🧩', link: '/SumGridPuzzles' },
      { key: 'numberBonds', icon: '🔗', link: '/number-bonds' },
      { key: 'areaModel', icon: '📐', link: '/area-model' },
      { key: 'barModel', icon: '📊', link: '/bar-model' },
      { key: 'numberSeries', icon: '🔢', link: '/NumberSeries' },
      { key: 'wordProblems', icon: '📝', link: '/word-problems' }
    ]
  }
};

const Profile = () => {
  const { t } = useTranslation('profile');
  const {
    username,
    isDemo,
    logout,
    registrationId: authRegistrationId
  } = useAuth();
  
  // Get registrationId from localStorage as backup
  const getRegistrationId = () => {
    try {
      const stored = localStorage.getItem('kidfast_auth');
      if (stored) {
        const authState = JSON.parse(stored);
        return authState.registrationId || authState.userId;
      }
    } catch (e) {
      console.error('Error getting registrationId:', e);
    }
    return null;
  };
  
  const registrationId = authRegistrationId || getRegistrationId();
  
  console.log('🔍 Profile - registrationId:', registrationId);
  
  const { isTeacher, isLoading: teacherLoading } = useTeacherRole(registrationId);
  
  const { userAchievements, getAchievementProgress } = useAchievements(registrationId || null);
  const { recentApps, clearHistory } = useRecentApps();
  
  // Training calendar data
  const { 
    missions, 
    streak, 
    isLoading: missionsLoading,
    generateTodayMission,
    isGenerating,
    userId: calendarUserId 
  } = useTrainingCalendar();
  
  const isMobile = useIsMobile();
  
  // Helper function to get local date string
  const getLocalDateString = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };
  
  // Calculate today's missions
  const todayStr = getLocalDateString(new Date());
  const todayMissions = missions.filter(m => m.mission_date.split('T')[0] === todayStr);
  const completedCount = todayMissions.filter(m => m.status === 'completed' || m.completed_at !== null).length;
  const totalStarsToday = todayMissions.reduce((sum, m) => sum + (m.stars_earned || 0), 0);

  // Auto-generate missions on login if fewer than 3 exist for today
  useEffect(() => {
    const autoGenerateOnLogin = async () => {
      // Skip if loading, generating, or no userId
      if (missionsLoading || isGenerating || !calendarUserId) return;
      
      // Skip if weekend
      const today = new Date();
      const dayOfWeek = today.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) return;
      
      // Check if today has fewer than 3 missions
      if (todayMissions.length < 3) {
        console.log('🚀 Profile: Auto-generating missions (', todayMissions.length, '/3)');
        await generateTodayMission();
      }
    };
    
    autoGenerateOnLogin();
  }, [missions.length, missionsLoading, isGenerating, calendarUserId, todayMissions.length]);
  
  // Get active tab from URL
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';
  
  // Helper function to get mission status display
  const getMissionStatusDisplay = (status: string, completed_at: string | null) => {
    const isCompleted = status === 'completed' || completed_at !== null;
    if (isCompleted) return { icon: '✅', text: 'สำเร็จ', color: 'bg-green-500/30 text-green-200 border-green-400' };
    if (status === 'skipped') return { icon: '⏭️', text: 'ข้าม', color: 'bg-red-500/30 text-red-200 border-red-400' };
    if (status === 'catchup') return { icon: '🔄', text: 'ตามทัน', color: 'bg-blue-500/30 text-blue-200 border-blue-400' };
    return { icon: '⏳', text: 'รอทำ', color: 'bg-yellow-500/30 text-yellow-200 border-yellow-400' };
  };

  // Profile editing states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showAllMissions, setShowAllMissions] = useState(false);
  const [nickname, setNickname] = useState('');
  const [studentClass, setStudentClass] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [lineUserId, setLineUserId] = useState('');
  const [lineDisplayName, setLineDisplayName] = useState('');
  const [linePictureUrl, setLinePictureUrl] = useState('');
  const [lineUserId2, setLineUserId2] = useState('');
  const [lineDisplayName2, setLineDisplayName2] = useState('');
  const [linePictureUrl2, setLinePictureUrl2] = useState('');
  const [showLinkCodeDialog, setShowLinkCodeDialog] = useState(false);
  const [linkCode, setLinkCode] = useState('');
  const [linkCodeExpiry, setLinkCodeExpiry] = useState<Date | null>(null);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [linkingAccountNumber, setLinkingAccountNumber] = useState<1 | 2>(1);
  const [isLinking, setIsLinking] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  
  // PWA Install states
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  
  // Get member ID from auth state
  const getMemberId = () => {
    try {
      const stored = localStorage.getItem('kidfast_auth');
      if (stored) {
        const authState = JSON.parse(stored);
        return authState.memberId;
      }
    } catch (e) {
      // ignore
    }
    return null;
  };
  
  const memberId = getMemberId();
  
  // Debug logs (after all state declarations)
  useEffect(() => {
    console.log('🔍 Profile Debug:', {
      registrationId,
      isTeacher,
      teacherLoading,
      nickname,
      username
    });
  }, [registrationId, isTeacher, teacherLoading, nickname, username]);
  
  const [registrationData, setRegistrationData] = useState<{
    created_at: string | null;
    approved_at: string | null;
    last_login_at: string | null;
    payment_date: string | null;
    subscription_tier: string | null;
    ai_features_enabled: boolean | null;
    ai_monthly_quota: number | null;
    ai_usage_count: number | null;
  } | null>(null);

  // Fetch user registration data
  useEffect(() => {
    const fetchRegistrationData = async () => {
      console.log('Profile - isDemo:', isDemo);
      console.log('Profile - username:', username);
      
      try {
        const stored = localStorage.getItem('kidfast_auth');
        console.log('Profile - localStorage auth:', stored ? JSON.parse(stored) : null);
        
        if (!stored) {
          console.log('No auth state in localStorage');
          return;
        }
        
        const authState = JSON.parse(stored);
        
        // Skip only if explicitly in demo mode
        if (authState.isDemo === true) {
          console.log('Skipping registration data fetch - demo mode');
          return;
        }
        
        // Use registrationId if available, otherwise fall back to email
        const registrationId = authState.registrationId;
        
        if (registrationId) {
          console.log('Fetching registration data by ID:', registrationId);
          const { data, error } = await supabase
            .from('user_registrations')
            .select('created_at, approved_at, last_login_at, payment_date, id, subscription_tier, ai_features_enabled, ai_monthly_quota, ai_usage_count')
            .eq('id', registrationId)
            .maybeSingle();
          
          console.log('Registration data query result:', { data, error });
          
          if (data && !error) {
            console.log('✅ Successfully loaded registration data');
            setRegistrationData(data);
          } else if (error) {
            console.error('❌ Error loading registration data:', error);
          } else {
            console.log('⚠️ No registration data found for ID:', registrationId);
          }
          return;
        }
        
        // Fallback to email query
        const email = authState.email || authState.username;
        console.log('Profile - email/username for query:', email);
        
        if (!email) {
          console.log('No email or username in auth state');
          return;
        }
        
        console.log('Fetching registration data for:', email);
        const { data, error } = await supabase
          .from('user_registrations')
          .select('created_at, approved_at, last_login_at, payment_date, id, subscription_tier, ai_features_enabled, ai_monthly_quota, ai_usage_count')
          .eq('parent_email', email)
          .maybeSingle();
        
        console.log('Registration data query result:', { data, error });
        
        if (data && !error) {
          console.log('✅ Successfully loaded registration data');
          setRegistrationData(data);
        } else if (error) {
          console.error('❌ Error loading registration data:', error);
        } else {
          console.log('⚠️ No registration data found for:', email);
        }
      } catch (e) {
        console.error('❌ Exception fetching registration data:', e);
      }
    };
    
    fetchRegistrationData();
  }, [isDemo, username]);

  // PWA Install prompt handler
  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setIsInstalled(true);
      setIsInstallable(false);
    }

    setDeferredPrompt(null);
  };

  // Calculate membership expiration (1 year from payment_date or approved_at)
  const getMembershipExpiration = () => {
    if (!registrationData) return null;
    
    const baseDate = registrationData.payment_date || registrationData.approved_at;
    if (!baseDate) return null;
    
    const date = new Date(baseDate);
    date.setFullYear(date.getFullYear() + 1);
    return date;
  };

  // Format date to Thai format
  const formatThaiDate = (dateString: string | null) => {
    if (!dateString) return '-';
    
    const date = new Date(dateString);
    const thaiYear = date.getFullYear() + 543;
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${day}/${month}/${thaiYear} ${hours}:${minutes}`;
  };

  const membershipExpiration = getMembershipExpiration();
  const formattedExpiration = membershipExpiration 
    ? formatThaiDate(membershipExpiration.toISOString()) 
    : '-';

  // Load profile data from localStorage and LINE token
  useEffect(() => {
    const loadProfileData = async () => {
      try {
        const stored = localStorage.getItem('kidfast_profile');
        if (stored) {
          const profileData = JSON.parse(stored);
          setNickname(profileData.nickname || username || '');
          setStudentClass(profileData.studentClass || '');
          setSchoolName(profileData.schoolName || '');
          setProfileImage(profileData.profileImage || null);
        } else {
          setNickname(username || '');
        }

        // Load LINE connection status if editing and registration data exists
        if (isEditingProfile && registrationData) {
          const authStored = localStorage.getItem('kidfast_auth');
          if (authStored) {
            const authState = JSON.parse(authStored);
            const registrationId = authState.registrationId;

            if (registrationId) {
              const { data, error } = await supabase
                .from('user_registrations')
                .select('line_user_id, line_display_name, line_picture_url, line_user_id_2, line_display_name_2, line_picture_url_2')
                .eq('id', registrationId)
                .single();

              if (data && !error) {
        setLineUserId(data.line_user_id || '');
        setLineDisplayName(data.line_display_name || '');
        setLinePictureUrl(data.line_picture_url || '');
        setLineUserId2(data.line_user_id_2 || '');
        setLineDisplayName2(data.line_display_name_2 || '');
        setLinePictureUrl2(data.line_picture_url_2 || '');
              }
            }
          }
        }
      } catch (e) {
        console.error('Error loading profile data:', e);
        setNickname(username || '');
      }
    };
    loadProfileData();
  }, [username, isEditingProfile, registrationData]);

  // Handle profile editing
  const handleEditProfile = () => {
    setIsEditingProfile(true);
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setProfileImage(null);
    setImageFile(null);
  };

  const handleSaveProfile = async () => {
    try {
      setIsSavingProfile(true);

      // Trim and validate nickname
      const trimmedNickname = nickname.trim();
      if (!trimmedNickname) {
        toast({
          title: t('alerts.nicknameRequired'),
          variant: 'destructive'
        });
        setIsSavingProfile(false);
        return;
      }

      // Trim all fields
      const trimmedClass = studentClass.trim();
      const trimmedSchool = schoolName.trim();

      const profileData = {
        nickname: trimmedNickname,
        studentClass: trimmedClass,
        schoolName: trimmedSchool,
        profileImage
      };
      
      localStorage.setItem('kidfast_profile', JSON.stringify(profileData));
      
      // Update auth state with trimmed nickname
      const authStored = localStorage.getItem('kidfast_auth');
      if (authStored) {
        const authState = JSON.parse(authStored);
        authState.username = trimmedNickname;
        localStorage.setItem('kidfast_auth', JSON.stringify(authState));
      }
      
      // Update state immediately (React will re-render)
      setNickname(trimmedNickname);
      setStudentClass(trimmedClass);
      setSchoolName(trimmedSchool);
      
      // Show success message with beautiful toast
      toast({
        title: '✅ ' + t('alerts.saveSuccess'),
        description: 'ข้อมูลของคุณได้รับการอัปเดตเรียบร้อยแล้ว',
      });
      
      // Close edit mode
      setIsSavingProfile(false);
      setIsEditingProfile(false);
    } catch (e) {
      console.error('Error saving profile:', e);
      toast({
        title: t('alerts.saveError', { message: e instanceof Error ? e.message : 'กรุณาลองใหม่อีกครั้ง' }),
        variant: 'destructive'
      });
      setIsSavingProfile(false);
    }
  };

  const handleGenerateLinkCode = async (accountNumber: 1 | 2 = 1) => {
    try {
      const authStored = localStorage.getItem('kidfast_auth');
      if (!authStored) return;

      const authState = JSON.parse(authStored);
      const registrationId = authState.registrationId;

      if (!registrationId) return;

      // Generate link code
      const { data, error } = await supabase.functions.invoke('line-generate-link-code', {
        body: { 
          userId: registrationId,
          accountNumber: accountNumber
        }
      });

      if (error || !data.linkCode) {
        toast({
          title: t('alerts.linkCodeError'),
          variant: 'destructive'
        });
        return;
      }

      setLinkCode(data.linkCode);
      setShowLinkCodeDialog(true);
      setIsLinking(true);

      // Start polling to check if linked (check every 3 seconds for 5 minutes)
      let attempts = 0;
      const maxAttempts = 100; // 5 minutes
      
      const checkInterval = setInterval(async () => {
        attempts++;
        
        if (attempts > maxAttempts) {
          clearInterval(checkInterval);
          setIsLinking(false);
          return;
        }

        const { data: userData } = await supabase
          .from('user_registrations')
          .select('line_user_id, line_display_name, line_picture_url, line_user_id_2, line_display_name_2, line_picture_url_2')
          .eq('id', registrationId)
          .single();

        const lineUserId = accountNumber === 1 ? userData?.line_user_id : userData?.line_user_id_2;

        if (userData && lineUserId) {
          clearInterval(checkInterval);
          
          if (accountNumber === 1) {
            setLineUserId(userData.line_user_id || '');
            setLineDisplayName(userData.line_display_name || '');
            setLinePictureUrl(userData.line_picture_url || '');
          } else {
            setLineUserId2(userData.line_user_id_2 || '');
            setLineDisplayName2(userData.line_display_name_2 || '');
            setLinePictureUrl2(userData.line_picture_url_2 || '');
          }
          
          setShowLinkCodeDialog(false);
          setIsLinking(false);
          toast({
            title: '✅ ' + t('alerts.linkSuccess'),
            description: 'เชื่อมต่อบัญชี LINE สำเร็จแล้ว',
          });
          window.location.reload();
        }
      }, 3000);

      // Clean up interval when dialog closes
      return () => clearInterval(checkInterval);
    } catch (err) {
      console.error('Connect LINE error:', err);
      toast({
        title: t('alerts.linkError'),
        variant: 'destructive'
      });
    }
  };

  const handleDisconnectLine = async (accountNumber: 1 | 2 = 1) => {
    const confirmed = window.confirm(t('alerts.disconnectConfirm'));
    if (!confirmed) return;

    try {
      const authStored = localStorage.getItem('kidfast_auth');
      if (!authStored) return;

      const authState = JSON.parse(authStored);
      const registrationId = authState.registrationId;

      if (!registrationId) return;

      const { error } = await supabase
        .from('user_registrations')
        .update({
          line_user_id: null,
          line_display_name: null,
          line_picture_url: null,
          line_connected_at: null
        })
        .eq('id', registrationId);

      if (!error) {
        setLineUserId('');
        setLineDisplayName('');
        setLinePictureUrl('');
        toast({
          title: '✅ ' + t('alerts.disconnectSuccess'),
          description: 'ยกเลิกการเชื่อมต่อ LINE สำเร็จแล้ว',
        });
      }
    } catch (err) {
      console.error('Disconnect LINE error:', err);
      toast({
        title: t('alerts.disconnectError'),
        variant: 'destructive'
      });
    }
  };

  const handleTestLineMessage = async (accountNumber: 1 | 2 = 1) => {
    const lineId = accountNumber === 1 ? lineUserId : lineUserId2;
    
    if (!lineId) {
      toast({
        title: t('alerts.connectLineFirst'),
        variant: 'destructive'
      });
      return;
    }

    try {
      toast({
        title: `กำลังส่งข้อความทดสอบไปยังผู้ปกครอง ${accountNumber}...`,
      });

      const authStored = localStorage.getItem('kidfast_auth');
      if (!authStored) return;

      const authState = JSON.parse(authStored);
      const registrationId = authState.registrationId;

      if (!registrationId) return;

      const { error } = await supabase.functions.invoke('send-line-message', {
        body: {
          userId: registrationId,
          exerciseType: 'test',
          nickname: nickname || username || 'ทดสอบ',
          score: 8,
          total: 10,
          percentage: 80,
          timeSpent: '2 นาที 30 วินาที',
          level: 'ทดสอบ',
          problems: [],
          accountNumber: accountNumber
        }
      });

      if (error) {
        toast({
          title: 'ส่งข้อความไม่สำเร็จ',
          variant: 'destructive'
        });
      } else {
        toast({
          title: `ส่งข้อความทดสอบสำเร็จ!`,
        });
      }
    } catch (err) {
      console.error('Test message error:', err);
      toast({
        title: 'เกิดข้อผิดพลาด',
        variant: 'destructive'
      });
    }
  };

  const handleCancelEdit = () => {
    // Reset to original values
    const stored = localStorage.getItem('kidfast_profile');
    if (stored) {
      const profileData = JSON.parse(stored);
      setNickname(profileData.nickname || username || '');
      setStudentClass(profileData.studentClass || '');
      setSchoolName(profileData.schoolName || '');
      setProfileImage(profileData.profileImage || null);
    } else {
      setNickname(username || '');
      setStudentClass('');
      setSchoolName('');
      setProfileImage(null);
    }
    setImageFile(null);
    setIsEditingProfile(false);
  };


  return <div className="min-h-screen">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        {/* Welcome Header */}
        <div className="card-glass p-4 md:p-6 mb-6">
          {!isMobile ? (
            /* Desktop Layout */
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Profile Image */}
                {profileImage && (
                  <img 
                    src={profileImage} 
                    alt="Profile" 
                    className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                )}
                <div>
                  <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))] mb-2">
                    {isDemo ? t('welcomeDemo') : (
                      <>
                        {t('welcome').replace(` {{nickname}}`, '')} 🌟
                        <span className="text-blue-600 ml-2">
                          {isTeacher ? `คุณครู ${nickname || username}` : `น้อง${nickname || username}`}
                        </span>
                      </>
                    )}
                    {!isDemo && memberId && (
                      <span className="text-lg font-normal text-[hsl(var(--text-secondary))] ml-3 bg-blue-50 px-3 py-1 rounded-full">
                        {t('memberCode', { code: memberId })}
                      </span>
                    )}
                  </h1>
                  <p className="text-[hsl(var(--text-secondary))]">
                    {studentClass && `${studentClass}`}
                    {schoolName && (studentClass ? ` • ${schoolName}` : schoolName)}
                    {(studentClass || schoolName) && ' • '}
                    {t('welcomeBack')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {/* Edit Profile Button */}
                <Button
                  onClick={handleEditProfile}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 hover:bg-blue-50 border-blue-300"
                >
                  <Edit className="w-4 h-4" />
                  <span>{t('editProfile')}</span>
                </Button>
                
                {/* Subscription Badge */}
                {!isDemo && registrationData && (
                  <div className={`px-5 py-3 rounded-xl font-semibold text-lg shadow-md ${
                    registrationData.subscription_tier === 'premium'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                      : 'bg-gray-100 text-gray-800 border-2 border-gray-300'
                  }`}>
                    {registrationData.subscription_tier === 'premium' ? (
                      <span className="flex items-center gap-2">
                        <span>👑</span>
                        <span>{t('premium')}</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <span>📦</span>
                        <span>{t('basic')}</span>
                      </span>
                    )}
                  </div>
                )}
                
                {!isDemo && memberId && (
                  <Link
                    to="/parent"
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <Users className="w-5 h-5" />
                    <span>{t('referralProgram')}</span>
                  </Link>
                )}
              </div>
            </div>
          ) : (
            /* Mobile Layout - Stack แนวตั้ง กึ่งกลาง */
            <div className="flex flex-col items-center text-center">
              {/* รูปโปรไฟล์ - กลาง */}
              {profileImage && (
                <img 
                  src={profileImage} 
                  alt="Profile" 
                  className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg mb-4"
                />
              )}
              
              {/* ข้อความทักทาย */}
              <h1 className="text-xl font-bold text-[hsl(var(--text-primary))] mb-1">
                {isDemo ? t('welcomeDemo') : (
                  <>
                    {t('welcome').replace(` {{nickname}}`, '')} 🌟
                  </>
                )}
              </h1>
              {!isDemo && (
                <p className="text-lg font-semibold text-blue-600 mb-1">
                  {isTeacher ? `คุณครู ${nickname || username}` : `น้อง${nickname || username}`}
                </p>
              )}
              
              {/* รหัสสมาชิก - แยกบรรทัด */}
              {!isDemo && memberId && (
                <span className="text-sm text-[hsl(var(--text-secondary))] bg-blue-50 px-3 py-1 rounded-full mb-2">
                  {t('memberCode', { code: memberId })}
                </span>
              )}
              
              {/* ข้อความต้อนรับ */}
              <p className="text-sm text-[hsl(var(--text-secondary))] mb-4">
                {studentClass && `${studentClass}`}
                {schoolName && (studentClass ? ` • ${schoolName}` : schoolName)}
                {(studentClass || schoolName) && ' • '}
                {t('welcomeBack')}
              </p>
              
              {/* ปุ่มแก้ไขโปรไฟล์ - กว้างเต็ม */}
              <Button
                onClick={handleEditProfile}
                variant="outline"
                className="w-full mb-3 flex items-center justify-center gap-2 hover:bg-blue-50 border-blue-300"
              >
                <Edit className="w-4 h-4" />
                <span>{t('editProfile')}</span>
              </Button>
              
              {/* ปุ่ม Premium และ แนะนำเพื่อน - แถวเดียวกัน */}
              <div className="flex items-center gap-2 w-full">
                {/* Premium Badge */}
                {!isDemo && registrationData && (
                  <div 
                    className={`flex-1 px-4 py-2 rounded-xl font-semibold text-sm text-center ${
                      registrationData.subscription_tier === 'premium'
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                        : 'bg-gray-100 text-gray-800 border-2 border-gray-300'
                    }`}
                  >
                    {registrationData.subscription_tier === 'premium' ? (
                      <span className="flex items-center justify-center gap-1">
                        <span>👑</span>
                        <span>{t('premium')}</span>
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-1">
                        <span>📦</span>
                        <span>{t('basic')}</span>
                      </span>
                    )}
                  </div>
                )}
                
                {/* Referral Program Button */}
                {!isDemo && memberId && (
                  <Link
                    to="/parent"
                    className="flex-1 flex items-center justify-center gap-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-medium text-sm transition-all duration-300 shadow-lg"
                  >
                    <Users className="w-4 h-4" />
                    <span>{t('referralProgram')}</span>
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>

        {/* PWA Install Card - แสดงเมื่อ isInstallable */}
        {isInstallable && !isInstalled && (
          <Card className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white mb-6">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="bg-white/20 p-3 rounded-lg">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">
                    {t('installApp.title')}
                  </h3>
                  <p className="text-white/90 mb-4">
                    {t('installApp.description')}
                  </p>
                  <Button 
                    onClick={handleInstallClick}
                    className="bg-white text-indigo-600 hover:bg-white/90 font-bold"
                  >
                    {t('installApp.button')}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Already Installed Card */}
        {isInstalled && (
          <Card className="bg-gradient-to-r from-green-400 to-emerald-500 text-white mb-6">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-3 rounded-lg">
                  <Trophy className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold">
                    {t('installApp.installed')}
                  </h3>
                  <p className="text-white/90 text-sm">
                    {t('installApp.installedDescription')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* iOS Instructions - แสดงเฉพาะ iOS devices */}
        {/iPad|iPhone|iPod/.test(navigator.userAgent) && !isInstalled && (
          <Card className="bg-blue-50 border-blue-200 mb-6">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="text-4xl">🍎</div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-blue-900 mb-2">
                    {t('installApp.iosTitle')}
                  </h3>
                  <ol className="text-blue-800 text-sm space-y-1 list-decimal list-inside">
                    <li>{t('installApp.iosStep1')}</li>
                    <li>{t('installApp.iosStep2')}</li>
                    <li>{t('installApp.iosStep3')}</li>
                    <li>{t('installApp.iosStep4')}</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Member Information */}
        {registrationData && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-white/80 border-2 border-purple-200">
              <CardContent className="p-4 text-center">
                <div className="text-3xl mb-2">📅</div>
                <div className="text-sm text-[hsl(var(--text-secondary))] mb-1">{t('memberInfo.registeredOn')}</div>
                <div className="text-xs font-semibold text-[hsl(var(--text-primary))]">
                  {formatThaiDate(registrationData.created_at)}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 border-2 border-green-200">
              <CardContent className="p-4 text-center">
                <div className="text-3xl mb-2">✅</div>
                <div className="text-sm text-[hsl(var(--text-secondary))] mb-1">{t('memberInfo.approvedOn')}</div>
                <div className="text-xs font-semibold text-[hsl(var(--text-primary))]">
                  {formatThaiDate(registrationData.approved_at)}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 border-2 border-orange-200">
              <CardContent className="p-4 text-center">
                <div className="text-3xl mb-2">⏰</div>
                <div className="text-sm text-[hsl(var(--text-secondary))] mb-1">{t('memberInfo.expiresOn')}</div>
                <div className="text-xs font-semibold text-[hsl(var(--text-primary))]">
                  {formattedExpiration}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 border-2 border-blue-200">
              <CardContent className="p-4 text-center">
                <div className="text-3xl mb-2">🔐</div>
                <div className="text-sm text-[hsl(var(--text-secondary))] mb-1">{t('memberInfo.lastLogin')}</div>
                <div className="text-xs font-semibold text-[hsl(var(--text-primary))]">
                  {formatThaiDate(registrationData.last_login_at)}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Achievement Badges Section */}
        {!isDemo && userAchievements.length > 0 && (
          <div className="card-glass p-6 mb-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Trophy className="w-8 h-8 text-yellow-600" />
                <div>
                  <h2 className="text-2xl font-bold text-[hsl(var(--text-primary))]">
                    ตราสัญลักษณ์ความสำเร็จ
                  </h2>
                  <p className="text-sm text-[hsl(var(--text-secondary))]">
                    ปลดล็อคแล้ว {getAchievementProgress().earned} จาก {getAchievementProgress().total} เหรียญ ({getAchievementProgress().percentage}%)
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6">
              <div className="flex flex-wrap gap-6 justify-center">
                {userAchievements.map((ua) => (
                  <AchievementBadge
                    key={ua.id}
                    code={ua.achievement?.icon || 'award'}
                    name={ua.achievement?.name_th || ''}
                    description={ua.achievement?.description_th}
                    color={ua.achievement?.color || 'blue'}
                    size="lg"
                    showName={true}
                    earnedAt={ua.earned_at}
                  />
                ))}
              </div>
              
              {getAchievementProgress().percentage < 100 && (
                <div className="mt-6 pt-4 border-t border-yellow-200">
                  <p className="text-center text-sm text-gray-600">
                    💡 ทำแบบทดสอบต่อไปเพื่อปลดล็อคเหรียญความสำเร็จเพิ่มเติม!
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* AI Features Section */}
        {!isDemo && registrationData && (
          <div className="card-glass p-6 mb-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Sparkles className="w-8 h-8 text-purple-500" />
                <div>
                  <h2 className="text-2xl font-bold text-[hsl(var(--text-primary))]">
                    {t('aiFeatures.title')}
                  </h2>
                  <p className="text-sm text-[hsl(var(--text-secondary))]">
                    {t('aiFeatures.subtitle')}
                  </p>
                </div>
              </div>
            </div>

            {registrationData.subscription_tier === 'premium' && registrationData.ai_features_enabled ? (
              <>
                {/* AI Quota Display */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-xl p-5 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm text-[hsl(var(--text-secondary))] mb-1">{t('aiFeatures.quotaThisMonth')}</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-purple-600">
                          {registrationData.ai_monthly_quota - registrationData.ai_usage_count}
                        </span>
                        <span className="text-lg text-[hsl(var(--text-secondary))]">
                          {t('aiFeatures.remaining', { quota: registrationData.ai_monthly_quota })}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-[hsl(var(--text-secondary))] mb-1">{t('aiFeatures.used')}</p>
                      <div className="text-2xl font-bold text-orange-500">
                        {registrationData.ai_usage_count}
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-500 rounded-full"
                      style={{ 
                        width: `${((registrationData.ai_monthly_quota - registrationData.ai_usage_count) / registrationData.ai_monthly_quota) * 100}%` 
                      }}
                    />
                  </div>
                  
                  <p className="text-xs text-[hsl(var(--text-secondary))] mt-2">
                    {t('aiFeatures.resetInfo')}
                  </p>
                </div>

                {/* AI Access Button */}
                <Link 
                  to="/ai-math-tutor"
                  className="block w-full"
                >
                  <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 hover:from-purple-600 hover:via-pink-600 hover:to-purple-700 text-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                          <Sparkles className="w-6 h-6" />
                          {t('aiFeatures.startTutor')}
                        </h3>
                        <p className="text-sm text-white/90 mb-3">
                          {t('aiFeatures.tutorDescription')}
                        </p>
                        <ul className="text-xs space-y-1 text-white/80">
                          <li>{t('aiFeatures.benefit1')}</li>
                          <li>{t('aiFeatures.benefit2')}</li>
                          <li>{t('aiFeatures.benefit3')}</li>
                        </ul>
                      </div>
                      <div className="text-6xl ml-4">
                        🚀
                      </div>
                    </div>
                  </div>
                </Link>

                {/* Training Calendar Button */}
                <Link 
                  to="/training-calendar"
                  className="block w-full mt-4"
                >
                  <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 hover:from-orange-600 hover:via-amber-600 hover:to-yellow-600 text-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                          <Trophy className="w-6 h-6" />
                          ปฏิทินการฝึกของฉัน
                        </h3>
                        <p className="text-sm text-white/90 mb-3">
                          ติดตามความก้าวหน้าในแต่ละวัน พร้อม AI ช่วยสร้างภารกิจที่เหมาะกับคุณ
                        </p>
                        <ul className="text-xs space-y-1 text-white/80">
                          <li>🎯 ภารกิจประจำวันจาก AI</li>
                          <li>🔥 สะสม Streak และดาว</li>
                          <li>🏆 แลกรางวัลพิเศษ</li>
                        </ul>
                      </div>
                      <div className="flex flex-col items-center bg-white/20 rounded-xl p-3 shadow-lg ml-4">
                        <span className="text-lg font-bold uppercase tracking-wide">
                          {new Date().toLocaleString('th-TH', { month: 'short' })}
                        </span>
                        <span className="text-4xl font-bold">{new Date().getDate()}</span>
                      </div>
                    </div>
                  </div>
                </Link>

                {/* Today's Missions Summary */}
                {!isDemo && registrationData && (
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-2xl p-5 mt-4 shadow-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-bold flex items-center gap-2">
                        <Zap className="w-5 h-5" />
                        ภารกิจวันนี้
                      </h4>
                      <Link to="/today-mission" className="text-xs bg-white/20 px-3 py-1 rounded-full hover:bg-white/30 transition-colors">
                        ดูทั้งหมด →
                      </Link>
                    </div>
                    
                    {missionsLoading ? (
                      <div className="text-center py-4">
                        <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full mx-auto" />
                      </div>
                    ) : todayMissions.length === 0 ? (
                      <div className="text-center py-3">
                        <p className="text-white/80 text-sm">ยังไม่มีภารกิจวันนี้</p>
                        <Link to="/today-mission" className="text-xs underline mt-1 inline-block">
                          สร้างภารกิจใหม่ →
                        </Link>
                      </div>
                    ) : (
                      <>
                        {/* Progress Summary */}
                        <div className="grid grid-cols-3 gap-3 mb-3">
                          <div className="bg-white/20 rounded-lg p-2 text-center">
                            <div className="text-2xl font-bold">{completedCount}/{todayMissions.length}</div>
                            <div className="text-xs text-white/80">ภารกิจสำเร็จ</div>
                          </div>
                          <div className="bg-white/20 rounded-lg p-2 text-center">
                            <div className="text-2xl font-bold flex items-center justify-center gap-1">
                              {totalStarsToday} <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            </div>
                            <div className="text-xs text-white/80">ดาววันนี้</div>
                          </div>
                          <div className="bg-white/20 rounded-lg p-2 text-center">
                            <div className="text-2xl font-bold flex items-center justify-center gap-1">
                              {streak?.current_streak || 0} <span className="text-lg">🔥</span>
                            </div>
                            <div className="text-xs text-white/80">Streak</div>
                          </div>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="w-full bg-white/10 rounded-full h-2 mb-3">
                          <div 
                            className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${(completedCount / todayMissions.length) * 100}%` }}
                          />
                        </div>

                        {/* Mission Cards (Full List) */}
                        <div className="space-y-2">
                          {(showAllMissions ? todayMissions : todayMissions.slice(0, 5)).map((mission, idx) => {
                            const statusDisplay = getMissionStatusDisplay(mission.status, mission.completed_at);
                            const isCompleted = mission.status === 'completed' || mission.completed_at !== null;
                            return (
                              <div 
                                key={mission.id} 
                                className={`flex items-start gap-3 p-3 rounded-lg ${isCompleted ? 'bg-green-500/20' : 'bg-white/10'} border border-white/20`}
                              >
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${isCompleted ? 'bg-green-500' : 'bg-white/20'}`}>
                                  {isCompleted ? <CheckCircle className="w-4 h-4" /> : <span className="text-xs font-bold">{mission.mission_option || (idx + 1)}</span>}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <p className="text-sm font-semibold truncate">{mission.skill_name}</p>
                                  </div>
                                  <div className="flex items-center gap-2 flex-wrap text-xs text-white/70">
                                    <span className="flex items-center gap-1">
                                      <Target className="w-3 h-3" />
                                      {mission.difficulty === 'easy' ? 'ง่าย' : mission.difficulty === 'medium' ? 'ปานกลาง' : 'ยาก'}
                                    </span>
                                    <Badge variant="outline" className={`${statusDisplay.color} text-xs px-2 py-0`}>
                                      {statusDisplay.icon} {statusDisplay.text}
                                    </Badge>
                                  </div>
                                </div>
                                {isCompleted && mission.stars_earned !== null && mission.stars_earned > 0 && (
                                  <div className="flex items-center gap-0.5">
                                    {[...Array(mission.stars_earned)].map((_, i) => (
                                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Expand/Collapse Button */}
                        {todayMissions.length > 5 && (
                          <button
                            onClick={() => setShowAllMissions(!showAllMissions)}
                            className="w-full mt-2 py-2 text-xs text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors flex items-center justify-center gap-1"
                          >
                            {showAllMissions ? (
                              <>
                                <ChevronUp className="w-4 h-4" />
                                ย่อลง
                              </>
                            ) : (
                              <>
                                <ChevronDown className="w-4 h-4" />
                                แสดงทั้งหมด ({todayMissions.length - 5} ภารกิจ)
                              </>
                            )}
                          </button>
                        )}
                      </>
                    )}
                  </div>
                )}

              </>
            ) : (
              /* Basic/No AI Access */
              <div className="text-center py-8">
                <div className="text-6xl mb-4">🔒</div>
                <h3 className="text-xl font-bold text-[hsl(var(--text-primary))] mb-2">
                  {t('aiFeatures.premiumOnly')}
                </h3>
                <p className="text-[hsl(var(--text-secondary))] mb-6 max-w-md mx-auto">
                  {t('aiFeatures.premiumDescription')}
                </p>
                <Link 
                  to="/profile?tab=subscription"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <Sparkles className="w-5 h-5" />
                  {t('aiFeatures.upgradePremium')}
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Teacher Mode Card */}
        {!isDemo && isTeacher && !teacherLoading && (
          <div className="card-glass p-6 mb-6 border-l-4 border-orange-400">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center shadow-lg">
                  <GraduationCap className="w-8 h-8 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-bold text-[hsl(var(--text-primary))]">
                      {t('teacherMode.title')}
                    </h3>
                    <span className="px-3 py-1 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-semibold shadow-md">
                      👨‍🏫 {t('teacherMode.badge')}
                    </span>
                  </div>
                  <p className="text-[hsl(var(--text-secondary))] text-sm">
                    {t('teacherMode.description')}
                  </p>
                </div>
              </div>
              <Link to="/teacher">
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
                >
                  {t('teacherMode.enterButton')}
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setSearchParams({ tab: value })}>
          {/* Tabs hidden as requested */}

          <TabsContent value="overview">
        {/* Recommendations by Category */}
        <div className="space-y-6 mb-6">
          <div className="flex items-center gap-3 px-4">
            <span className="text-2xl">🎯</span>
            <h2 className="text-2xl font-bold text-[hsl(var(--text-primary))]">
              {t('recommendations.title')}
            </h2>
          </div>

          {Object.entries(recommendationCategories).map(([categoryKey, category]) => (
            <div key={categoryKey} className="card-glass overflow-hidden">
              {/* Category Header */}
              <div className={`bg-gradient-to-r ${category.color} p-5`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <span className="text-2xl">{category.icon}</span>
                      {t(category.titleKey)}
                    </h3>
                    <p className="text-white/90 text-sm mt-1">
                      {t(category.descriptionKey)}
                    </p>
                  </div>
                  <Link 
                    to="/profile#skills" 
                    className="text-white/90 hover:text-white text-sm flex items-center gap-1 bg-white/20 px-3 py-1.5 rounded-full hover:bg-white/30 transition-colors"
                  >
                    {t('recommendations.viewAll')}
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Apps Carousel */}
              <div className="p-5">
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {category.apps.map((app) => (
                    <Link 
                      key={app.key}
                      to={app.link}
                      className="flex-shrink-0 text-center group"
                    >
                      <div className="relative">
                        <div 
                          className={`bg-gradient-to-br ${category.color} rounded-full w-20 h-20 flex items-center justify-center text-3xl border-3 border-white shadow-lg group-hover:scale-110 transition-transform duration-300 cursor-pointer mb-2`}
                          title={t(`recommendations.apps.${app.key}.title`)}
                        >
                          {app.icon}
                        </div>
                        {app.isNew && (
                          <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] px-1.5 py-0.5 animate-pulse">
                            {t('recommendations.newBadge')}
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs font-medium text-[hsl(var(--text-primary))] max-w-[80px] truncate">
                        {t(`recommendations.apps.${app.key}.title`)}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Learning Apps */}
        <div className="card-glass p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[hsl(var(--text-primary))]">
              {t('recentApps.title')}
            </h2>
            {recentApps.length > 0 && (
              <button
                onClick={clearHistory}
                className="text-xs text-[hsl(var(--text-muted))] hover:text-[hsl(var(--text-primary))] transition-colors"
              >
                {t('recentApps.clearHistory')}
              </button>
            )}
          </div>
          
          {recentApps.length > 0 ? (
            <div className="flex gap-4 overflow-x-auto pb-2">
              {recentApps.map((app) => {
                const appInfo = appRegistry[app.appId];
                if (!appInfo) return null;
                
                return (
                  <Link 
                    key={app.appId} 
                    to={appInfo.link}
                    className="flex-shrink-0 text-center"
                  >
                    <div 
                      className={`${appInfo.color} rounded-full w-20 h-20 flex items-center justify-center text-3xl border-3 border-white shadow-lg hover:scale-110 transition-transform duration-300 cursor-pointer mb-2`}
                      title={t(appInfo.nameKey)}
                    >
                      {appInfo.icon}
                    </div>
                    <div className="text-xs font-medium text-[hsl(var(--text-primary))] max-w-[80px] truncate">
                      {t(appInfo.nameKey)}
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">🎯</div>
              <h3 className="text-lg font-semibold text-[hsl(var(--text-primary))] mb-2">
                {t('recentApps.emptyTitle')}
              </h3>
              <p className="text-sm text-[hsl(var(--text-muted))] max-w-md mx-auto">
                {t('recentApps.emptyDescription')}
              </p>
            </div>
          )}
        </div>

        {/* Grade Progress */}
        <div className="card-glass p-6 mb-6">
          <h2 className="text-xl font-bold text-[hsl(var(--text-primary))] mb-4">
            {t('appDetails.title')}
          </h2>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <button className="bg-gradient-to-r from-cyan-400 via-emerald-400 to-purple-500 text-white px-6 py-3 rounded-full text-sm font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center gap-2 mx-auto">
                <span className="text-lg">✨</span>
                {t('appDetails.aiGenerate')}
              </button>
              <div className="text-sm text-[hsl(var(--text-muted))] mt-2">{t('appDetails.technology')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500 mb-1">22+</div>
              <div className="text-sm text-[hsl(var(--text-muted))]">{t('appDetails.lessons')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500 mb-1">{t('appDetails.unlimited')}</div>
              <div className="text-sm text-[hsl(var(--text-muted))]">{t('appDetails.exercises')}</div>
            </div>
          </div>
        </div>

        {/* Skills Section */}
        <SkillsSection />

      </TabsContent>

      <TabsContent value="subscription">
        <SubscriptionTab />
      </TabsContent>
    </Tabs>

      </main>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditingProfile} onOpenChange={setIsEditingProfile}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">{t('editDialog.title')}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Profile Image Upload */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                {profileImage ? (
                  <div className="relative">
                    <img 
                      src={profileImage} 
                      alt="Profile Preview" 
                      className="w-32 h-32 rounded-full object-cover border-4 border-purple-300 shadow-lg"
                    />
                    <button
                      onClick={handleRemoveImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors shadow-md"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 border-4 border-purple-300 flex items-center justify-center">
                    <Upload className="w-12 h-12 text-purple-400" />
                  </div>
                )}
              </div>
              
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="profile-image-upload"
                />
                <label htmlFor="profile-image-upload">
                  <Button variant="outline" size="sm" className="cursor-pointer" asChild>
                    <span className="flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      {profileImage ? t('editDialog.changeImage') : t('editDialog.uploadImage')}
                    </span>
                  </Button>
                </label>
              </div>
            </div>

            {/* Nickname Input */}
            <div className="space-y-2">
              <Label htmlFor="nickname" className="text-base font-semibold">
                {t('editDialog.nickname')} <span className="text-red-500">{t('editDialog.nicknameRequired')}</span>
              </Label>
              <Input
                id="nickname"
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder={t('editDialog.nicknamePlaceholder')}
                className="text-base"
              />
              {nickname && nickname.trim().length === 0 && (
                <p className="text-xs text-red-500 mt-1">
                  {t('editDialog.nicknameError')}
                </p>
              )}
            </div>

            {/* Class Dropdown */}
            <div className="space-y-2">
              <Label htmlFor="studentClass" className="text-base font-semibold">
                {t('editDialog.class')}
              </Label>
              <Select value={studentClass} onValueChange={setStudentClass}>
                <SelectTrigger className="text-base">
                  <SelectValue placeholder="เลือกชั้นเรียน" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="อนุบาล 1">อนุบาล 1</SelectItem>
                  <SelectItem value="อนุบาล 2">อนุบาล 2</SelectItem>
                  <SelectItem value="อนุบาล 3">อนุบาล 3</SelectItem>
                  <SelectItem value="ประถมศึกษาปีที่ 1">ประถมศึกษาปีที่ 1</SelectItem>
                  <SelectItem value="ประถมศึกษาปีที่ 2">ประถมศึกษาปีที่ 2</SelectItem>
                  <SelectItem value="ประถมศึกษาปีที่ 3">ประถมศึกษาปีที่ 3</SelectItem>
                  <SelectItem value="ประถมศึกษาปีที่ 4">ประถมศึกษาปีที่ 4</SelectItem>
                  <SelectItem value="ประถมศึกษาปีที่ 5">ประถมศึกษาปีที่ 5</SelectItem>
                  <SelectItem value="ประถมศึกษาปีที่ 6">ประถมศึกษาปีที่ 6</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* School Name Input */}
            <div className="space-y-2">
              <Label htmlFor="schoolName" className="text-base font-semibold">
                {t('editDialog.school')}
              </Label>
              <Input
                id="schoolName"
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                placeholder={t('editDialog.schoolPlaceholder')}
                className="text-base"
              />
            </div>

            {/* LINE Connection Settings - 2 Accounts */}
            {!isDemo && registrationData && (
              <div className="space-y-3 pt-4 border-t-2 border-purple-200">
                <div className="flex items-center gap-2">
                  <div className="text-lg">📱</div>
                  <Label className="text-base font-semibold">
                    {t('editDialog.lineNotifications')}
                  </Label>
                </div>
                
                {/* Parent 1 */}
                <div className="space-y-2">
                  <Label className="text-sm text-gray-600">👤 ผู้ปกครอง 1</Label>
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-xl">
                    {lineUserId ? (
                      <>
                        <div className="flex items-center gap-3 mb-3">
                          {linePictureUrl && (
                            <img 
                              src={linePictureUrl} 
                              alt="LINE Profile" 
                              className="w-10 h-10 rounded-full border-2 border-green-400"
                            />
                          )}
                          <div className="flex-1">
                            <div className="text-green-600 font-semibold flex items-center gap-2">
                              {t('editDialog.lineConnected')}
                            </div>
                            <div className="text-xs text-gray-600">{lineDisplayName}</div>
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleDisconnectLine(1)}
                            className="text-xs"
                          >
                            {t('editDialog.lineDisconnect')}
                          </Button>
                        </div>
                        <Button 
                          onClick={() => handleTestLineMessage(1)} 
                          className="w-full bg-[#00B900] hover:bg-[#00A000] text-white"
                          size="sm"
                        >
                          {t('editDialog.lineTestMessage')}
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-orange-500 font-semibold">{t('editDialog.lineNotConnected')}</span>
                        </div>
                        
                        <div className="bg-white p-3 rounded-lg mb-3 text-sm">
                          <p className="font-semibold mb-2">{t('editDialog.lineStepsTitle')}</p>
                          <ol className="list-decimal ml-4 space-y-1 text-xs">
                            <li>{t('editDialog.lineStep1')} <a href="https://line.me/R/ti/p/@kidfast" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold underline">@kidfast</a></li>
                            <li>{t('editDialog.lineStep2')}</li>
                            <li>{t('editDialog.lineStep3')}</li>
                            <li>{t('editDialog.lineStep4')}</li>
                          </ol>
                        </div>
                        
                        <Button 
                          onClick={() => handleGenerateLinkCode(1)}
                          className="w-full bg-[#00B900] hover:bg-[#00A000] text-white"
                          size="sm"
                        >
                          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="white">
                            <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
                          </svg>
                          {t('editDialog.lineConnect')}
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {/* Parent 2 */}
                <div className="space-y-2">
                  <Label className="text-sm text-gray-600">👤 ผู้ปกครอง 2</Label>
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-xl">
                    {lineUserId2 ? (
                      <>
                        <div className="flex items-center gap-3 mb-3">
                          {linePictureUrl2 && (
                            <img 
                              src={linePictureUrl2} 
                              alt="LINE Profile" 
                              className="w-10 h-10 rounded-full border-2 border-green-400"
                            />
                          )}
                          <div className="flex-1">
                            <div className="text-green-600 font-semibold flex items-center gap-2">
                              {t('editDialog.lineConnected')}
                            </div>
                            <div className="text-xs text-gray-600">{lineDisplayName2}</div>
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleDisconnectLine(2)}
                            className="text-xs"
                          >
                            {t('editDialog.lineDisconnect')}
                          </Button>
                        </div>
                        <Button 
                          onClick={() => handleTestLineMessage(2)} 
                          className="w-full bg-[#00B900] hover:bg-[#00A000] text-white"
                          size="sm"
                        >
                          {t('editDialog.lineTestMessage')}
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-orange-500 font-semibold">{t('editDialog.lineNotConnected')}</span>
                        </div>
                        
                        <div className="bg-white p-3 rounded-lg mb-3 text-sm">
                          <p className="font-semibold mb-2">{t('editDialog.lineStepsTitle')}</p>
                          <ol className="list-decimal ml-4 space-y-1 text-xs">
                            <li>{t('editDialog.lineStep1')} <a href="https://line.me/R/ti/p/@kidfast" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold underline">@kidfast</a></li>
                            <li>{t('editDialog.lineStep2')}</li>
                            <li>{t('editDialog.lineStep3')}</li>
                            <li>{t('editDialog.lineStep4')}</li>
                          </ol>
                        </div>
                        
                        <Button 
                          onClick={() => handleGenerateLinkCode(2)}
                          className="w-full bg-[#00B900] hover:bg-[#00A000] text-white"
                          size="sm"
                        >
                          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="white">
                            <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
                          </svg>
                          {t('editDialog.lineConnect')}
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleCancelEdit}
                variant="outline"
                className="flex-1 text-base py-6"
              >
                {t('editDialog.cancel')}
              </Button>
              <Button
                onClick={handleSaveProfile}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-base py-6"
                disabled={nickname.trim().length === 0 || isSavingProfile}
              >
                {isSavingProfile ? t('editDialog.saving') : t('editDialog.save')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Link Code Dialog */}
      <Dialog open={showLinkCodeDialog} onOpenChange={setShowLinkCodeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('linkDialog.title')}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm mb-2">{t('linkDialog.instruction')}</p>
              <div className="text-4xl font-bold text-green-600 bg-green-50 py-4 rounded-lg tracking-widest">
                {linkCode}
              </div>
              <p className="text-xs text-gray-500 mt-2">{t('linkDialog.codeExpiry')}</p>
            </div>
            
            <div className="bg-blue-50 p-3 rounded-lg text-sm">
              <p className="font-semibold mb-1">{t('linkDialog.stepsTitle')}</p>
              <ol className="list-decimal ml-4 space-y-1 text-xs">
                <li>{t('linkDialog.step1')}</li>
                <li>{t('linkDialog.step2')}</li>
                <li>{t('linkDialog.step3')}</li>
                <li>{t('linkDialog.step4')}</li>
              </ol>
            </div>
            
            {isLinking && (
              <div className="text-center text-sm text-gray-600">
                <div className="animate-spin h-6 w-6 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                {t('linkDialog.waiting')}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>;
};
export default Profile;