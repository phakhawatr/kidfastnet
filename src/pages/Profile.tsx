import { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SkillsSection from '../components/SkillsSection';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, Sparkles, Edit, Upload, X } from 'lucide-react';
import { SubscriptionTab } from '../components/SubscriptionTab';

// Import mascot images
import mascotAddition from '../assets/mascot-addition.png';
import mascotSubtraction from '../assets/mascot-subtraction.png';
import mascotMultiplication from '../assets/mascot-multiplication.png';
import mascotDivision from '../assets/mascot-division.png';
import mascotTime from '../assets/mascot-time.png';
import mascotWeighing from '../assets/mascot-weighing.png';

// Define all available recommendations for each grade
const allRecommendations = {
  '1': [
    {
      icon: '➕',
      title: 'การบวกเลข',
      description: 'มาฝึกบวกเลขให้เก่งขึ้น! เริ่มจากเลขง่ายๆ ไปจนถึงการบวก 2 หลัก',
      link: '/addition',
      color: 'bg-[hsl(var(--grade-1))]'
    },
    {
      icon: '📏',
      title: 'เทียบความยาว',
      description: 'ฝึกเปรียบเทียบความยาวของวัตถุต่างๆ เรียนรู้แบบสนุกและเข้าใจง่าย!',
      link: '/length-comparison',
      color: 'bg-[hsl(var(--grade-2))]'
    },
    {
      icon: '🔢',
      title: 'ทายตัวเลขในลำดับ',
      description: 'ฝึกสังเกตและหาตัวเลขในลำดับ พัฒนาทักษะการคิดวิเคราะห์!',
      link: '/NumberSeries',
      color: 'bg-[hsl(var(--grade-3))]'
    },
    {
      icon: '🔷',
      title: 'จับคู่รูปทรง',
      description: 'เรียนรู้รูปทรงเรขาคณิตต่างๆ พัฒนาทักษะการมองเห็นเชิงพื้นที่!',
      link: '/shape-matching',
      color: 'bg-[hsl(var(--grade-3))]'
    }
  ],
  '2': [
    {
      icon: '➖',
      title: 'การลบเลข 2 หลัก',
      description: 'มาฝึกลบเลข 2 หลักให้เก่งขึ้น! เริ่มจากเลขง่ายๆ ไปจนถึงโจทย์ที่ท้าทาย',
      link: '/subtraction',
      color: 'bg-[hsl(var(--grade-2))]'
    },
    {
      icon: '➕',
      title: 'ทบทวนการบวก',
      description: 'ทบทวนการบวกเลขเพื่อเสริมความแม่นยำ พื้นฐานที่แข็งแรงสำคัญมาก!',
      link: '/addition',
      color: 'bg-[hsl(var(--grade-1))]'
    },
    {
      icon: '🔷',
      title: 'จับคู่รูปทรง',
      description: 'เรียนรู้รูปทรงเรขาคณิตต่างๆ พัฒนาทักษะการมองเห็นเชิงพื้นที่!',
      link: '/shape-matching',
      color: 'bg-[hsl(var(--grade-3))]'
    },
    {
      icon: '📏',
      title: 'เทียบความยาว',
      description: 'ฝึกเปรียบเทียบความยาวของวัตถุต่างๆ เรียนรู้แบบสนุกและเข้าใจง่าย!',
      link: '/length-comparison',
      color: 'bg-[hsl(var(--grade-2))]'
    }
  ],
  '3': [
    {
      icon: '✖️',
      title: 'การคูณ',
      description: 'ฝึกสูตรคูณให้แม่นและเร็วขึ้น! พื้นฐานสำคัญสำหรับคณิตศาสตร์ขั้นสูง',
      link: '/multiply',
      color: 'bg-[hsl(var(--grade-3))]'
    },
    {
      icon: '📊',
      title: 'ตารางคูณ',
      description: 'เรียนรู้ตารางคูณแบบครบถ้วน ฝึกจนจำได้แม่นและรวดเร็ว!',
      link: '/multiplication-table',
      color: 'bg-[hsl(var(--grade-4))]'
    },
    {
      icon: '📐',
      title: 'การวัด',
      description: 'ฝึกการวัดความยาวและการแปลงหน่วย ทักษะที่ใช้ในชีวิตประจำวัน!',
      link: '/measurement',
      color: 'bg-[hsl(var(--grade-2))]'
    },
    {
      icon: '➕',
      title: 'การบวกเลข',
      description: 'ทบทวนการบวกเพื่อเสริมทักษะพื้นฐาน เตรียมพร้อมสำหรับคณิตศาสตร์ขั้นสูง!',
      link: '/addition',
      color: 'bg-[hsl(var(--grade-1))]'
    }
  ],
  '4': [
    {
      icon: '➗',
      title: 'การหาร',
      description: 'มาเรียนรู้การหารให้เข้าใจและคำนวณได้รวดเร็ว! ทักษะสำคัญสำหรับการแก้โจทย์',
      link: '/division',
      color: 'bg-[hsl(var(--grade-4))]'
    },
    {
      icon: '🍕',
      title: 'เศษส่วน',
      description: 'ฝึกจับคู่และเปรียบเทียบเศษส่วน เข้าใจแนวคิดที่สำคัญของคณิตศาสตร์!',
      link: '/fraction-matching',
      color: 'bg-[hsl(var(--grade-5))]'
    },
    {
      icon: '💰',
      title: 'เงินตรา',
      description: 'เรียนรู้การนับเงิน ทอนเงิน และคำนวณราคาสินค้า ทักษะที่ใช้ในชีวิตประจำวัน!',
      link: '/money',
      color: 'bg-[hsl(var(--grade-5))]'
    },
    {
      icon: '✖️',
      title: 'ทบทวนการคูณ',
      description: 'ทบทวนการคูณเพื่อเตรียมพร้อมสำหรับการหาร พื้นฐานที่แข็งแรงช่วยได้มาก!',
      link: '/multiply',
      color: 'bg-[hsl(var(--grade-3))]'
    }
  ],
  '5': [
    {
      icon: '🕐',
      title: 'บอกเวลา',
      description: 'ฝึกอ่านนาฬิกาและบอกเวลาให้แม่นยำ ทักษะที่ใช้ทุกวันในชีวิตจริง!',
      link: '/time',
      color: 'bg-[hsl(var(--grade-5))]'
    },
    {
      icon: '🍕',
      title: 'เศษส่วนขั้นสูง',
      description: 'ฝึกเศษส่วนในระดับที่ซับซ้อนขึ้น เพื่อพัฒนาความเข้าใจอย่างลึกซึ้ง!',
      link: '/fraction-matching',
      color: 'bg-[hsl(var(--grade-4))]'
    },
    {
      icon: '📊',
      title: 'เปอร์เซ็นต์',
      description: 'เรียนรู้การคำนวณเปอร์เซ็นต์ ใช้ได้ในการซื้อของ การลดราคา และอีกมากมาย!',
      link: '/percentage',
      color: 'bg-[hsl(var(--grade-6))]'
    },
    {
      icon: '➗',
      title: 'การหาร',
      description: 'ทบทวนการหารเพื่อเสริมความแม่นยำ พื้นฐานสำคัญสำหรับคณิตศาสตร์ขั้นสูง!',
      link: '/division',
      color: 'bg-[hsl(var(--grade-4))]'
    }
  ],
  '6': [
    {
      icon: '⚖️',
      title: 'บอกน้ำหนัก',
      description: 'ฝึกการชั่งน้ำหนักและเปรียบเทียบมวล ทักษะสำคัญในวิทยาศาสตร์และชีวิตประจำวัน!',
      link: '/weighing',
      color: 'bg-[hsl(var(--grade-6))]'
    },
    {
      icon: '⚡',
      title: 'คณิตเร็ว',
      description: 'ท้าทายความเร็วในการคำนวณ! ฝึกทั้ง บวก ลบ คูณ หาร ให้รวดเร็วและแม่นยำ',
      link: '/quick-math',
      color: 'bg-[hsl(var(--grade-5))]'
    },
    {
      icon: '🧩',
      title: 'ปริศนาตารางเลข',
      description: 'แก้ปริศนาตารางเลขที่ท้าทายสมอง ฝึกทักษะการคิดวิเคราะห์แบบสนุก!',
      link: '/SumGridPuzzles',
      color: 'bg-[hsl(var(--grade-4))]'
    },
    {
      icon: '📊',
      title: 'เปอร์เซ็นต์',
      description: 'เรียนรู้การคำนวณเปอร์เซ็นต์ ใช้ได้ในการซื้อของ การลดราคา และอีกมากมาย!',
      link: '/percentage',
      color: 'bg-[hsl(var(--grade-6))]'
    }
  ]
};

const Profile = () => {
  const {
    username,
    isDemo,
    logout
  } = useAuth();
  
  // Get active tab from URL
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';
  
  // Profile editing states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [nickname, setNickname] = useState('');
  const [studentClass, setStudentClass] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [lineUserId, setLineUserId] = useState('');
  const [lineDisplayName, setLineDisplayName] = useState('');
  const [linePictureUrl, setLinePictureUrl] = useState('');
  const [showLinkCodeDialog, setShowLinkCodeDialog] = useState(false);
  const [linkCode, setLinkCode] = useState('');
  const [isLinking, setIsLinking] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  
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
  
  const [selectedGrade, setSelectedGrade] = useState('1');
  const [randomRecommendations, setRandomRecommendations] = useState<any[]>([]);
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
  const grades = [{
    id: '1',
    label: 'การบวก',
    icon: '➕',
    mascot: mascotAddition
  }, {
    id: '2',
    label: 'การลบ',
    icon: '➖',
    mascot: mascotSubtraction
  }, {
    id: '3',
    label: 'การคูณ',
    icon: '✖️',
    mascot: mascotMultiplication
  }, {
    id: '4',
    label: 'การหาร',
    icon: '➗',
    mascot: mascotDivision
  }, {
    id: '5',
    label: 'บอกเวลา',
    icon: '🕐',
    mascot: mascotTime
  }, {
    id: '6',
    label: 'บอกน้ำหนัก',
    icon: '⚖️',
    mascot: mascotWeighing
  }];

  // Function to shuffle array and pick 3 random items
  const getRandomRecommendations = (grade: string) => {
    const recommendations = allRecommendations[grade as keyof typeof allRecommendations] || [];
    const shuffled = [...recommendations].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
  };

  // Randomize recommendations when selectedGrade changes
  useEffect(() => {
    setRandomRecommendations(getRandomRecommendations(selectedGrade));
  }, [selectedGrade]);

  // Get grade label for display
  const getGradeLabel = (gradeId: string) => {
    const grade = grades.find(g => g.id === gradeId);
    return grade ? grade.label : '';
  };

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
                .select('line_user_id, line_display_name, line_picture_url')
                .eq('id', registrationId)
                .single();

              if (data && !error) {
                setLineUserId(data.line_user_id || '');
                setLineDisplayName(data.line_display_name || '');
                setLinePictureUrl(data.line_picture_url || '');
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
        alert('กรุณากรอกชื่อเล่น');
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
      
      // Show success message
      alert('✅ บันทึกข้อมูลสำเร็จ');
      
      // Close edit mode
      setIsSavingProfile(false);
      setIsEditingProfile(false);
    } catch (e) {
      console.error('Error saving profile:', e);
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล: ' + (e instanceof Error ? e.message : 'กรุณาลองใหม่อีกครั้ง'));
      setIsSavingProfile(false);
    }
  };

  const handleConnectLine = async () => {
    try {
      const authStored = localStorage.getItem('kidfast_auth');
      if (!authStored) return;

      const authState = JSON.parse(authStored);
      const registrationId = authState.registrationId;

      if (!registrationId) return;

      // Generate link code
      const { data, error } = await supabase.functions.invoke('line-generate-link-code', {
        body: { userId: registrationId }
      });

      if (error || !data.linkCode) {
        alert('ไม่สามารถสร้างรหัสเชื่อมได้');
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
          .select('line_user_id, line_display_name, line_picture_url')
          .eq('id', registrationId)
          .single();

        if (userData && userData.line_user_id) {
          clearInterval(checkInterval);
          setLineUserId(userData.line_user_id);
          setLineDisplayName(userData.line_display_name || '');
          setLinePictureUrl(userData.line_picture_url || '');
          setShowLinkCodeDialog(false);
          setIsLinking(false);
          alert('✅ เชื่อมต่อสำเร็จ!');
          window.location.reload();
        }
      }, 3000);

      // Clean up interval when dialog closes
      return () => clearInterval(checkInterval);
    } catch (err) {
      console.error('Connect LINE error:', err);
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    }
  };

  const handleDisconnectLine = async () => {
    const confirmed = confirm('คุณต้องการยกเลิกการเชื่อมต่อ LINE หรือไม่?');
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
        alert('ยกเลิกการเชื่อมต่อแล้ว');
      }
    } catch (err) {
      console.error('Disconnect LINE error:', err);
      alert('เกิดข้อผิดพลาดในการยกเลิกการเชื่อมต่อ');
    }
  };

  const handleTestLineMessage = async () => {
    if (!lineUserId) {
      alert('กรุณาเชื่อมต่อ LINE ก่อน');
      return;
    }

    try {
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
          score: 0,
          total: 0,
          percentage: 0,
          timeSpent: '0:00',
          level: 'ทดสอบ',
          problems: []
        }
      });

      if (error) {
        alert('ส่งข้อความไม่สำเร็จ: ' + error.message);
      } else {
        alert('✅ ส่งข้อความทดสอบสำเร็จ! ตรวจสอบ LINE @kidfast');
      }
    } catch (err) {
      console.error('Test message error:', err);
      alert('เกิดข้อผิดพลาดในการทดสอบ');
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
        <div className="card-glass p-6 mb-6">
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
                  สวัสดี {isDemo ? 'นักเรียนทดลอง' : `น้อง${nickname || username}`}!
                  {!isDemo && memberId && (
                    <span className="text-lg font-normal text-[hsl(var(--text-secondary))] ml-2 bg-blue-50 px-3 py-1 rounded-full">
                      รหัส: {memberId}
                    </span>
                  )}
                  🌟
                </h1>
                <p className="text-[hsl(var(--text-secondary))]">
                  {studentClass && `${studentClass}`}
                  {schoolName && (studentClass ? ` • ${schoolName}` : schoolName)}
                  {(studentClass || schoolName) && ' • '}
                  ยินดีต้อนรับกลับสู่การเรียนรู้ที่สนุก
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
                <span>แก้ไขโปรไฟล์</span>
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
                      <span>Premium</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <span>📦</span>
                      <span>Basic</span>
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
                  <span>โปรแกรมแนะนำเพื่อน</span>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Member Information */}
        {registrationData && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-white/80 border-2 border-purple-200">
              <CardContent className="p-4 text-center">
                <div className="text-3xl mb-2">📅</div>
                <div className="text-sm text-[hsl(var(--text-secondary))] mb-1">สมัครเมื่อ</div>
                <div className="text-xs font-semibold text-[hsl(var(--text-primary))]">
                  {formatThaiDate(registrationData.created_at)}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 border-2 border-green-200">
              <CardContent className="p-4 text-center">
                <div className="text-3xl mb-2">✅</div>
                <div className="text-sm text-[hsl(var(--text-secondary))] mb-1">อนุมัติเมื่อ</div>
                <div className="text-xs font-semibold text-[hsl(var(--text-primary))]">
                  {formatThaiDate(registrationData.approved_at)}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 border-2 border-orange-200">
              <CardContent className="p-4 text-center">
                <div className="text-3xl mb-2">⏰</div>
                <div className="text-sm text-[hsl(var(--text-secondary))] mb-1">วันหมดอายุสมาชิก</div>
                <div className="text-xs font-semibold text-[hsl(var(--text-primary))]">
                  {formattedExpiration}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 border-2 border-blue-200">
              <CardContent className="p-4 text-center">
                <div className="text-3xl mb-2">🔐</div>
                <div className="text-sm text-[hsl(var(--text-secondary))] mb-1">Login ล่าสุด</div>
                <div className="text-xs font-semibold text-[hsl(var(--text-primary))]">
                  {formatThaiDate(registrationData.last_login_at)}
                </div>
              </CardContent>
            </Card>
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
                    🤖 AI Learning Assistant
                  </h2>
                  <p className="text-sm text-[hsl(var(--text-secondary))]">
                    ผู้ช่วยเรียนคณิตศาสตร์ด้วย AI ที่ฉลาด
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
                      <p className="text-sm text-[hsl(var(--text-secondary))] mb-1">โควต้า AI เดือนนี้</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-purple-600">
                          {registrationData.ai_monthly_quota - registrationData.ai_usage_count}
                        </span>
                        <span className="text-lg text-[hsl(var(--text-secondary))]">
                          / {registrationData.ai_monthly_quota} ครั้ง
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-[hsl(var(--text-secondary))] mb-1">ใช้ไปแล้ว</p>
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
                    💡 โควต้าจะรีเซ็ตในวันที่ 1 ของเดือนหน้า
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
                          เริ่มใช้ AI Math Tutor
                        </h3>
                        <p className="text-sm text-white/90 mb-3">
                          ถามคำถาม แก้โจทย์ และเรียนรู้กับ AI ที่เข้าใจคุณ
                        </p>
                        <ul className="text-xs space-y-1 text-white/80">
                          <li>✓ ตอบคำถามทันที 24/7</li>
                          <li>✓ อธิบายแบบเข้าใจง่าย</li>
                          <li>✓ แนะนำวิธีทำโจทย์ทีละขั้นตอน</li>
                        </ul>
                      </div>
                      <div className="text-6xl ml-4">
                        🚀
                      </div>
                    </div>
                  </div>
                </Link>

                {/* Quick Tips */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="bg-white/50 rounded-lg p-3 text-center border border-purple-200">
                    <div className="text-2xl mb-1">💬</div>
                    <p className="text-xs font-medium text-[hsl(var(--text-primary))]">ถามได้ทุกเรื่อง</p>
                  </div>
                  <div className="bg-white/50 rounded-lg p-3 text-center border border-pink-200">
                    <div className="text-2xl mb-1">📝</div>
                    <p className="text-xs font-medium text-[hsl(var(--text-primary))]">แก้โจทย์ให้</p>
                  </div>
                  <div className="bg-white/50 rounded-lg p-3 text-center border border-purple-200">
                    <div className="text-2xl mb-1">🎯</div>
                    <p className="text-xs font-medium text-[hsl(var(--text-primary))]">เรียนรู้ได้เร็ว</p>
                  </div>
                </div>
              </>
            ) : (
              /* Basic/No AI Access */
              <div className="text-center py-8">
                <div className="text-6xl mb-4">🔒</div>
                <h3 className="text-xl font-bold text-[hsl(var(--text-primary))] mb-2">
                  ฟีเจอร์ AI สำหรับสมาชิก Premium
                </h3>
                <p className="text-[hsl(var(--text-secondary))] mb-6 max-w-md mx-auto">
                  อัพเกรดเป็น Premium เพื่อใช้งาน AI Math Tutor และรับความช่วยเหลือจาก AI ได้ทันที
                </p>
                <Link 
                  to="/profile?tab=subscription"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <Sparkles className="w-5 h-5" />
                  อัพเกรด Premium ตอนนี้
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setSearchParams({ tab: value })}>
          {/* Tabs hidden as requested */}

          <TabsContent value="overview">
            {/* Grade Selection */}
            <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
          {grades.map(grade => (
            <button 
              key={grade.id} 
              onClick={() => setSelectedGrade(grade.id)} 
              className={`relative flex flex-col items-center gap-2 px-4 py-3 rounded-2xl transition-all duration-300 whitespace-nowrap min-w-[120px] ${
                selectedGrade === grade.id 
                  ? 'bg-gradient-to-br from-purple-400 to-pink-400 text-white shadow-lg scale-105' 
                  : 'bg-white/60 hover:bg-white/80 shadow-md hover:shadow-lg'
              }`}
            >
              {/* Mascot Image */}
              <div className={`w-12 h-12 rounded-full overflow-hidden bg-white/50 flex items-center justify-center transition-transform duration-300 ${
                selectedGrade === grade.id ? 'animate-bounce' : 'hover:scale-110'
              }`}>
                <img 
                  src={grade.mascot} 
                  alt={grade.label}
                  className="w-10 h-10 object-contain"
                />
              </div>
              
              {/* Label */}
              <span className={`text-sm font-bold ${
                selectedGrade === grade.id ? 'text-white' : 'text-[hsl(var(--text-primary))]'
              }`}>
                {grade.label}
              </span>
              
              {/* Active Indicator */}
              {selectedGrade === grade.id && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-white rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Recommendation Card */}
        <div className="card-glass p-6 mb-6 border-l-4 border-orange-400">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">🎯</span>
            <h2 className="text-xl font-bold text-[hsl(var(--text-primary))]">
              แนะนำสำหรับคุณ
            </h2>
          </div>
          
          {randomRecommendations.map((recommendation, index) => (
            <div key={index} className={`${recommendation.color} rounded-xl p-6 mb-4`}>
              <h3 className="font-bold text-lg mb-2">
                {recommendation.icon} {recommendation.title}
              </h3>
              <p className="text-sm text-[hsl(var(--text-secondary))] mb-4">
                {recommendation.description}
              </p>
              <Link to={recommendation.link} className="btn-primary text-sm inline-block">
                เริ่มฝึกเลย!
              </Link>
            </div>
          ))}
        </div>

        {/* Recent Learning Apps */}
        <div className="card-glass p-6 mb-6">
          <h2 className="text-xl font-bold text-[hsl(var(--text-primary))] mb-4">
            📚 แอปที่เรียนล่าสุด
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {[
              { name: 'การบวก', icon: '➕', color: 'bg-gradient-to-br from-pink-200 to-pink-300', link: '/addition' },
              { name: 'การลบ', icon: '➖', color: 'bg-gradient-to-br from-blue-200 to-blue-300', link: '/subtraction' },
              { name: 'การคูณ', icon: '✖️', color: 'bg-gradient-to-br from-purple-200 to-purple-300', link: '/multiply' },
              { name: 'การหาร', icon: '➗', color: 'bg-gradient-to-br from-green-200 to-green-300', link: '/division' },
              { name: 'เศษส่วน', icon: '🍕', color: 'bg-gradient-to-br from-orange-200 to-orange-300', link: '/fraction-matching' },
              { name: 'บอกเวลา', icon: '🕐', color: 'bg-gradient-to-br from-cyan-200 to-cyan-300', link: '/time' },
              { name: 'น้ำหนัก', icon: '⚖️', color: 'bg-gradient-to-br from-yellow-200 to-yellow-300', link: '/weighing' },
              { name: 'รูปทรง', icon: '🔷', color: 'bg-gradient-to-br from-indigo-200 to-indigo-300', link: '/shape-matching' },
              { name: 'ความยาว', icon: '📏', color: 'bg-gradient-to-br from-teal-200 to-teal-300', link: '/length-comparison' },
              { name: 'คณิตเร็ว', icon: '⚡', color: 'bg-gradient-to-br from-red-200 to-red-300', link: '/quick-math' }
            ].map((app, index) => (
              <Link 
                key={index} 
                to={app.link}
                className="flex-shrink-0 text-center"
              >
                <div 
                  className={`${app.color} rounded-full w-20 h-20 flex items-center justify-center text-3xl border-3 border-white shadow-lg hover:scale-110 transition-transform duration-300 cursor-pointer mb-2`}
                  title={app.name}
                >
                  {app.icon}
                </div>
                <div className="text-xs font-medium text-[hsl(var(--text-primary))] max-w-[80px] truncate">
                  {app.name}
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Grade Progress */}
        <div className="card-glass p-6 mb-6">
          <h2 className="text-xl font-bold text-[hsl(var(--text-primary))] mb-4">
            รายละเอียด Kidfast AI Application
          </h2>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <button className="bg-gradient-to-r from-cyan-400 via-emerald-400 to-purple-500 text-white px-6 py-3 rounded-full text-sm font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center gap-2 mx-auto">
                <span className="text-lg">✨</span>
                AI สร้างโจทย์ใหม่
              </button>
              <div className="text-sm text-[hsl(var(--text-muted))] mt-2">เทคโนโลยี</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500 mb-1">21+</div>
              <div className="text-sm text-[hsl(var(--text-muted))]">บทเรียน</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500 mb-1">ไม่จำกัด</div>
              <div className="text-sm text-[hsl(var(--text-muted))]">จำนวนแบบฝึกหัด</div>
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
            <DialogTitle className="text-2xl font-bold text-center">แก้ไขโปรไฟล์</DialogTitle>
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
                      {profileImage ? 'เปลี่ยนรูปภาพ' : 'อัปโหลดรูปภาพ'}
                    </span>
                  </Button>
                </label>
              </div>
            </div>

            {/* Nickname Input */}
            <div className="space-y-2">
              <Label htmlFor="nickname" className="text-base font-semibold">
                ชื่อเล่น <span className="text-red-500">*</span>
              </Label>
              <Input
                id="nickname"
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="ใส่ชื่อเล่น เช่น น้องApple"
                className="text-base"
              />
              {nickname && nickname.trim().length === 0 && (
                <p className="text-xs text-red-500 mt-1">
                  ⚠️ ชื่อเล่นต้องไม่เว้นว่างเปล่า
                </p>
              )}
            </div>

            {/* Class Input */}
            <div className="space-y-2">
              <Label htmlFor="studentClass" className="text-base font-semibold">
                ชั้นเรียน
              </Label>
              <Input
                id="studentClass"
                type="text"
                value={studentClass}
                onChange={(e) => setStudentClass(e.target.value)}
                placeholder="เช่น ชั้น ป.3, ม.1"
                className="text-base"
              />
            </div>

            {/* School Name Input */}
            <div className="space-y-2">
              <Label htmlFor="schoolName" className="text-base font-semibold">
                ชื่อโรงเรียน
              </Label>
              <Input
                id="schoolName"
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                placeholder="เช่น โรงเรียนอนุบาลกรุงเทพ"
                className="text-base"
              />
            </div>

            {/* LINE Connection Settings */}
            {!isDemo && registrationData && (
              <div className="space-y-3 pt-4 border-t-2 border-purple-200">
                <div className="flex items-center gap-2">
                  <div className="text-lg">📱</div>
                  <Label className="text-base font-semibold">
                    แจ้งผลการเรียนผ่าน LINE
                  </Label>
                </div>
                
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
                            ✅ เชื่อมต่อแล้ว
                          </div>
                          <div className="text-xs text-gray-600">{lineDisplayName}</div>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={handleDisconnectLine}
                          className="text-xs"
                        >
                          ยกเลิก
                        </Button>
                      </div>
                      <Button 
                        onClick={handleTestLineMessage} 
                        className="w-full bg-[#00B900] hover:bg-[#00A000] text-white"
                        size="sm"
                      >
                        📤 ทดสอบส่งข้อความ
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-orange-500 font-semibold">⚠️ ยังไม่ได้เชื่อมต่อ</span>
                      </div>
                      
                      <div className="bg-white p-3 rounded-lg mb-3 text-sm">
                        <p className="font-semibold mb-2">📍 ขั้นตอนการเชื่อมต่อ:</p>
                        <ol className="list-decimal ml-4 space-y-1 text-xs">
                          <li>Add Friend <a href="https://line.me/R/ti/p/@kidfast" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold underline">@kidfast</a></li>
                          <li>กดปุ่ม "เชื่อมต่อบัญชี" ด้านล่าง</li>
                          <li>ส่งรหัส 6 หลักในแชท LINE @kidfast</li>
                          <li>รอระบบยืนยัน (ประมาณ 5 วินาที)</li>
                        </ol>
                      </div>
                      
                      <Button 
                        onClick={handleConnectLine}
                        className="w-full bg-[#00B900] hover:bg-[#00A000] text-white"
                        size="sm"
                      >
                        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="white">
                          <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
                        </svg>
                        เชื่อมต่อบัญชี LINE
                      </Button>
                    </>
                  )}
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
                ยกเลิก
              </Button>
              <Button
                onClick={handleSaveProfile}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-base py-6"
                disabled={nickname.trim().length === 0 || isSavingProfile}
              >
                {isSavingProfile ? 'กำลังบันทึก...' : 'บันทึก'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Link Code Dialog */}
      <Dialog open={showLinkCodeDialog} onOpenChange={setShowLinkCodeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>🔗 เชื่อมต่อบัญชี LINE</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm mb-2">ส่งรหัสนี้ในแชท LINE @kidfast</p>
              <div className="text-4xl font-bold text-green-600 bg-green-50 py-4 rounded-lg tracking-widest">
                {linkCode}
              </div>
              <p className="text-xs text-gray-500 mt-2">รหัสจะหมดอายุใน 5 นาที</p>
            </div>
            
            <div className="bg-blue-50 p-3 rounded-lg text-sm">
              <p className="font-semibold mb-1">📋 ขั้นตอน:</p>
              <ol className="list-decimal ml-4 space-y-1 text-xs">
                <li>คัดลอกรหัส 6 หลักด้านบน</li>
                <li>เปิดแชท LINE @kidfast</li>
                <li>ส่งรหัส</li>
                <li>รอระบบยืนยัน</li>
              </ol>
            </div>
            
            {isLinking && (
              <div className="text-center text-sm text-gray-600">
                <div className="animate-spin h-6 w-6 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                กำลังรอการเชื่อมต่อ...
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>;
};
export default Profile;