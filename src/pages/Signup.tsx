import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '../hooks/useAuth';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ToastManager } from '../components/Toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface SignupData {
  // Step 1
  nickname: string;
  age: string;
  grade: string;
  // Step 2
  avatar: string;
  learningStyle: string;
  // Step 3
  parentEmail: string;
  parentPhone: string;
  password: string;
  referrerMemberId: string;
  acceptTerms: boolean;
  acceptNewsletter: boolean;
}

const Signup = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [formData, setFormData] = useState<SignupData>({
    nickname: '',
    age: '',
    grade: '',
    avatar: '',
    learningStyle: '',
    parentEmail: '',
    parentPhone: '',
    password: '',
    referrerMemberId: '',
    acceptTerms: false,
    acceptNewsletter: false
  });
  const [affiliateCode, setAffiliateCode] = useState<string | null>(null);

  const navigate = useNavigate();
  const { signup } = useAuth();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode) {
      setAffiliateCode(refCode);
      updateFormData('referrerMemberId', refCode);
      ToastManager.show({
        message: `สมัครผ่านรหัสแนะนำ: ${refCode}`,
        type: 'info'
      });
    }
  }, [searchParams]);

  const grades = [
    { id: '1', label: 'ป.1', color: 'bg-[hsl(var(--grade-1))]' },
    { id: '2', label: 'ป.2', color: 'bg-[hsl(var(--grade-2))]' },
    { id: '3', label: 'ป.3', color: 'bg-[hsl(var(--grade-3))]' },
    { id: '4', label: 'ป.4', color: 'bg-[hsl(var(--grade-4))]' },
    { id: '5', label: 'ป.5', color: 'bg-[hsl(var(--grade-5))]' },
    { id: '6', label: 'ป.6', color: 'bg-[hsl(var(--grade-6))]' }
  ];

  const avatars = [
    { id: 'cat', emoji: '🐱' },
    { id: 'dog', emoji: '🐶' },
    { id: 'rabbit', emoji: '🐰' },
    { id: 'frog', emoji: '🐸' },
    { id: 'unicorn', emoji: '🦄' },
    { id: 'fox', emoji: '🦊' },
    { id: 'panda', emoji: '🐼' },
    { id: 'tiger', emoji: '🐯' }
  ];

  const learningStyles = [
    'เล่นเกมการเรียน',
    'ฝึกด่วนเดี่ยว',
    'จับเวลาผลึก',
    'แข่งขันคะแนน'
  ];

  const updateFormData = (field: keyof SignupData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        return formData.nickname && formData.age && formData.grade;
      case 2:
        return formData.avatar && formData.learningStyle;
      case 3:
        return formData.parentEmail && 
               formData.parentPhone && 
               validatePhoneNumber(formData.parentPhone) &&
               formData.password.length >= 6 && 
               formData.acceptTerms;
      default:
        return false;
    }
  };

  const validatePhoneNumber = (phone: string) => {
    // Thai phone number format: 08X-XXX-XXXX, 09X-XXX-XXXX, 06X-XXX-XXXX
    const phoneRegex = /^(08[0-9]|09[0-9]|06[0-9])-[0-9]{3}-[0-9]{4}$/;
    return phoneRegex.test(phone);
  };

  // Phase 1: Sanitize phone number - convert similar characters and clean format
  const sanitizePhoneNumber = (phone: string) => {
    let cleaned = phone
      // Convert similar characters to numbers
      .replace(/[ØøＯｏ]/g, '0')  // O with stroke, fullwidth O, etc → 0
      .replace(/[Oo]/g, '0')       // Letter O → 0
      .replace(/[lLｌＬ]/g, '1')   // Letter l/L → 1
      .replace(/[Ii]/g, '1')       // Letter i/I → 1
      // Remove all non-digit characters except hyphens
      .replace(/[^\d-]/g, '')
      // Remove extra hyphens
      .replace(/-+/g, '-')
      // Remove leading/trailing hyphens
      .replace(/^-|-$/g, '');
    
    // Auto-format: add hyphens if not present
    const digitsOnly = cleaned.replace(/-/g, '');
    if (digitsOnly.length === 10) {
      return `${digitsOnly.slice(0, 3)}-${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6, 10)}`;
    }
    
    return cleaned;
  };

  // Phase 2: Format phone number as user types
  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const digitsOnly = value.replace(/\D/g, '');
    
    // Apply formatting
    if (digitsOnly.length <= 3) {
      return digitsOnly;
    } else if (digitsOnly.length <= 6) {
      return `${digitsOnly.slice(0, 3)}-${digitsOnly.slice(3)}`;
    } else {
      return `${digitsOnly.slice(0, 3)}-${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6, 10)}`;
    }
  };

  // Handle phone input change with real-time sanitization and formatting
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    // First sanitize similar characters
    value = value
      .replace(/[ØøＯｏ]/g, '0')
      .replace(/[Oo]/g, '0')
      .replace(/[lLｌＬ]/g, '1')
      .replace(/[Ii]/g, '1');
    
    // Then format
    const formatted = formatPhoneNumber(value);
    updateFormData('parentPhone', formatted);
  };

  // Validate referrer member ID
  const validateReferrerMemberId = async (memberId: string) => {
    if (!memberId || memberId.trim() === '') return null;
    
    try {
      // Check if member_id exists and get affiliate_code
      const { data, error } = await supabase
        .from('user_registrations')
        .select('member_id, parent_email')
        .eq('member_id', memberId.trim())
        .eq('status', 'approved')
        .maybeSingle();
      
      if (error || !data) {
        return null;
      }
      
      // Get affiliate code for this user
      const { data: affiliateData } = await supabase
        .from('affiliate_codes')
        .select('affiliate_code')
        .eq('user_id', data.member_id)
        .maybeSingle();
      
      return affiliateData?.affiliate_code || null;
    } catch (error) {
      console.error('Error validating referrer:', error);
      return null;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    } else {
      ToastManager.show({
        message: 'กรุณากรอกข้อมูลให้ครบถ้วน',
        type: 'error'
      });
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (validateStep(3)) {
      try {
        // Phase 1: Sanitize phone number before validation
        const sanitizedPhone = sanitizePhoneNumber(formData.parentPhone);
        
        // Validate phone number format after sanitization
        if (!validatePhoneNumber(sanitizedPhone)) {
          ToastManager.show({
            message: 'รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง กรุณากรอกในรูปแบบ 08X-XXX-XXXX',
            type: 'error'
          });
          return;
        }

        // Validate and get affiliate code from member ID if provided
        let finalAffiliateCode = affiliateCode;
        if (formData.referrerMemberId && formData.referrerMemberId.trim() !== '') {
          const validatedCode = await validateReferrerMemberId(formData.referrerMemberId);
          if (validatedCode) {
            finalAffiliateCode = validatedCode;
            console.log('✅ Validated referrer member ID:', formData.referrerMemberId, '-> Code:', validatedCode);
          } else {
            ToastManager.show({
              message: 'ไม่พบรหัสสมาชิกที่แนะนำ กรุณาตรวจสอบรหัสอีกครั้ง',
              type: 'error'
            });
            return;
          }
        }

        // Debug logging
        console.log('📤 Calling register_new_user with:', {
          nickname: formData.nickname,
          age: parseInt(formData.age),
          grade: `ป.${formData.grade}`,
          email: formData.parentEmail,
          phone: sanitizedPhone,
          has_affiliate: !!finalAffiliateCode
        });

        // Call Security Definer function instead of direct INSERT
        // This bypasses RLS policies while maintaining security through database triggers
        const { data: userId, error: registrationError } = await supabase
          .rpc('register_new_user', {
            p_nickname: formData.nickname,
            p_age: parseInt(formData.age),
            p_grade: `ป.${formData.grade}`,
            p_avatar: formData.avatar,
            p_learning_style: formData.learningStyle,
            p_parent_email: formData.parentEmail,
            p_parent_phone: sanitizedPhone,
            p_password: formData.password,
            p_affiliate_code: finalAffiliateCode || null
          });

        if (registrationError) throw registrationError;

        // Create registrationData object for affiliate tracking
        const registrationData = userId ? { id: userId } : null;

        console.log('✅ Registration successful:', { userId });

        // Track affiliate referral if code exists
        if (finalAffiliateCode && registrationData) {
          try {
            await supabase.rpc('track_referral_signup', {
              p_referred_email: formData.parentEmail,
              p_affiliate_code: finalAffiliateCode
            });
          } catch (error) {
            console.error('Error tracking referral:', error);
          }
        }

        // Show success dialog instead of toast and immediate navigation
        setShowSuccessDialog(true);
      } catch (error: any) {
        console.error('Signup error:', error);
        
        // Phase 4: Enhanced Error Handling - Provide specific, actionable error messages
        let errorMessage = 'เกิดข้อผิดพลาดในการสมัครสมาชิก';
        let duration = 6000;
        
        // Check for phone validation errors from database trigger
        if (error.message?.includes('Invalid phone format')) {
          const phoneMatch = error.message.match(/Invalid phone format: ([^.]+)/);
          const attemptedPhone = phoneMatch ? phoneMatch[1] : formData.parentPhone;
          errorMessage = `🔴 รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง\n\nเบอร์ที่กรอก: "${attemptedPhone}"\n\n✅ รูปแบบที่ถูกต้อง:\n• 08X-XXX-XXXX\n• 09X-XXX-XXXX\n• 06X-XXX-XXXX\n\nตัวอย่าง: 081-234-5678`;
          duration = 8000;
        } 
        // Check for RLS policy violations
        else if (error.message?.includes('row-level security') || error.message?.includes('violates row-level security policy')) {
          errorMessage = '🛡️ ข้อมูลไม่ผ่านการตรวจสอบความปลอดภัย\n\nกรุณาตรวจสอบ:\n✓ ข้อมูลทั้งหมดกรอกครบถ้วน\n✓ รูปแบบข้อมูลถูกต้อง\n✓ ไม่มีอักขระพิเศษที่ไม่อนุญาต';
          duration = 7000;
        }
        // Check for duplicate email/phone
        else if (error.message?.includes('duplicate') || error.message?.includes('already exists') || error.message?.includes('unique constraint')) {
          errorMessage = '⚠️ อีเมลหรือเบอร์โทรศัพท์นี้ถูกใช้งานแล้ว\n\nกรุณา:\n• ใช้อีเมลอื่น\n• หรือเข้าสู่ระบบหากคุณมีบัญชีอยู่แล้ว';
          duration = 7000;
        }
        // Check for nickname validation
        else if (error.message?.includes('Nickname must be between')) {
          errorMessage = '📝 ชื่อเล่นต้องมีความยาว 1-50 ตัวอักษร';
        }
        // Check for age validation
        else if (error.message?.includes('Age must be between')) {
          errorMessage = '🎂 อายุต้องอยู่ระหว่าง 1-150 ปี';
        }
        // Check for grade validation
        else if (error.message?.includes('Grade must be between')) {
          errorMessage = '🏫 กรุณาระบุชั้นเรียนที่ถูกต้อง';
        }
        // Check for email validation
        else if (error.message?.includes('Invalid email format')) {
          errorMessage = '📧 รูปแบบอีเมลไม่ถูกต้อง\n\nตัวอย่างที่ถูกต้อง: example@email.com';
        }
        // Check for password validation
        else if (error.message?.includes('Password must be between')) {
          errorMessage = '🔐 รหัสผ่านต้องมีความยาว 6-100 ตัวอักษร';
        }
        // Check for network errors
        else if (error.message?.includes('Failed to fetch') || error.message?.includes('Network') || error.message?.includes('network')) {
          errorMessage = '🌐 ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์\n\nกรุณา:\n• ตรวจสอบการเชื่อมต่ออินเทอร์เน็ต\n• ลองใหม่อีกครั้ง';
        }
        // Default error with details
        else if (error.message) {
          errorMessage = `❌ เกิดข้อผิดพลาด:\n${error.message}`;
        }
        
        ToastManager.show({
          message: errorMessage,
          type: 'error',
          duration: duration
        });
      }
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Alert */}
          <div className="card-glass p-4 mb-8 border-l-4 border-green-500">
            <div className="flex items-center gap-3">
              🛡️ <span className="font-medium text-green-700">ความปลอดภัยของเด็กเป็นสิ่งสำคัญ</span>
            </div>
            <p className="text-sm text-green-600 mt-1 ml-8">
              ข้อมูลของลูกน้อยจะได้รับการปกป้องอย่างดี เราไม่แชร์ข้อมูลส่วนตัวกับบุคคลภายนอก และผู้ปกครองสามารถควบคุมความเป็นส่วนตัวของลูกได้ตลอดเวลา
            </p>
          </div>

          {/* Contact Warning */}
          <div className="card-glass p-6 mb-8 border-l-4 border-orange-500 bg-gradient-to-r from-orange-50 to-yellow-50">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">⚠️</span>
              <span className="font-bold text-xl text-orange-700">ก่อนสมัครกรุณาติดต่อ @kidfast เพื่อสร้างบัญชีผู้ใช้ใหม่</span>
            </div>
            <div className="flex justify-center mt-4">
              <a href="https://lin.ee/hFVAoTI" className="inline-block">
                <img 
                  src="https://scdn.line-apps.com/n/line_add_friends/btn/th.png" 
                  alt="เพิ่มเพื่อน" 
                  className="inline-block hover:opacity-80 transition-opacity" 
                  style={{ height: '36px' }}
                />
              </a>
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              🌟 มาเป็นนักคณิตคิดเร็วกันเถอะ! 🌟
            </h1>
            <p className="text-white/80">กรอกข้อมูลเพื่อเริ่มต้นการผจญภัยทางคณิตศาสตร์</p>
          </div>

          {/* Stepper */}
          <div className="flex justify-center items-center mb-8">
            {[1, 2, 3].map((step, index) => (
              <div key={step} className="flex items-center">
                <div className={`stepper-circle ${currentStep >= step ? 'active' : 'inactive'}`}>
                  {step}
                </div>
                {index < 2 && (
                  <div className={`w-16 h-1 mx-2 rounded ${currentStep > step ? 'bg-[hsl(var(--active-ring))]' : 'bg-gray-300'}`} />
                )}
              </div>
            ))}
          </div>

          {/* Form */}
          <div className="card-glass p-8">
            {/* Step 1: Kid Info */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <label className="flex items-center gap-2 text-lg font-medium mb-3">
                    🎯 <span>ชื่อเล่นของหนู <span className="text-red-500">*</span></span>
                  </label>
                  <input
                    type="text"
                    placeholder="xx"
                    className="input-field"
                    value={formData.nickname}
                    onChange={(e) => updateFormData('nickname', e.target.value)}
                  />
                  <p className="text-sm text-[hsl(var(--text-muted))] mt-1">ใช้ชื่อเล่นหรือชื่อจริง ไม่ต้องใส่นามสกุล</p>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-lg font-medium mb-3">
                    🍰 <span>อายุของหนู <span className="text-red-500">*</span></span>
                  </label>
                  <select
                    className="input-field"
                    value={formData.age}
                    onChange={(e) => updateFormData('age', e.target.value)}
                  >
                    <option value="">6 ขวบ</option>
                    {Array.from({ length: 7 }, (_, i) => i + 6).map(age => (
                      <option key={age} value={age}>{age} ขวบ</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-lg font-medium mb-3">
                    🏫 <span>ชั้นเรียนของหนู <span className="text-red-500">*</span></span>
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    {grades.map((grade) => (
                      <div
                        key={grade.id}
                        onClick={() => updateFormData('grade', grade.id)}
                        className={`grade-card ${grade.color} ${formData.grade === grade.id ? 'active' : ''} text-center`}
                      >
                        <div className="w-8 h-8 bg-blue-600 text-white rounded flex items-center justify-center font-bold mx-auto mb-2">
                          {grade.id}
                        </div>
                        <div className="font-medium">{grade.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end">
                  <button onClick={handleNext} className="btn-primary">
                    ถัดไป →
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Preferences */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <label className="flex items-center gap-2 text-lg font-medium mb-3">
                    😊 <span>เลือกตัวการ์ตูนที่หนูชอบ</span>
                  </label>
                  <div className="grid grid-cols-4 gap-4">
                    {avatars.map((avatar) => (
                      <div
                        key={avatar.id}
                        onClick={() => updateFormData('avatar', avatar.id)}
                        className={`avatar-option ${formData.avatar === avatar.id ? 'selected' : ''}`}
                      >
                        {avatar.emoji}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-lg font-medium mb-3">
                    🎮 <span>หนูชอบเรียนแบบไหน?</span>
                  </label>
                  <select
                    className="input-field"
                    value={formData.learningStyle}
                    onChange={(e) => updateFormData('learningStyle', e.target.value)}
                  >
                    <option value="">เลือกสไตล์การเรียน</option>
                    {learningStyles.map((style) => (
                      <option key={style} value={style}>{style}</option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-between">
                  <button onClick={handleBack} className="btn-secondary">
                    ← ย้อนกลับ
                  </button>
                  <button onClick={handleNext} className="btn-primary">
                    ถัดไป →
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Parent Info */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-lg font-medium mb-4">
                  👨‍👩‍👧‍👦 <span>ข้อมูลผู้ปกครอง</span>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-lg font-medium mb-3">
                    📧 <span>อีเมลผู้ปกครอง <span className="text-red-500">*</span></span>
                  </label>
                  <input
                    type="email"
                    placeholder="parent@email.com"
                    className="input-field"
                    value={formData.parentEmail}
                    onChange={(e) => updateFormData('parentEmail', e.target.value)}
                  />
                  <p className="text-sm text-[hsl(var(--text-muted))] mt-1">สำหรับรับข้อมูลความก้าวหน้าของลูกและการแจ้งเตือน</p>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-lg font-medium mb-3">
                    📱 <span>เบอร์โทรผู้ปกครอง <span className="text-red-500">*</span></span>
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      placeholder="08X-XXX-XXXX"
                      className={`input-field pr-10 ${
                        formData.parentPhone 
                          ? validatePhoneNumber(formData.parentPhone) 
                            ? 'border-green-500 focus:border-green-500' 
                            : 'border-red-500 focus:border-red-500'
                          : ''
                      }`}
                      value={formData.parentPhone}
                      onChange={handlePhoneChange}
                      maxLength={12}
                      required
                    />
                    {formData.parentPhone && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {validatePhoneNumber(formData.parentPhone) ? (
                          <span className="text-green-500 text-xl">✓</span>
                        ) : (
                          <span className="text-red-500 text-xl">✗</span>
                        )}
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-[hsl(var(--text-muted))] mt-1">
                    {formData.parentPhone && !validatePhoneNumber(formData.parentPhone) 
                      ? <span className="text-red-500">รูปแบบเบอร์โทรไม่ถูกต้อง (ตัวอย่าง: 081-234-5678)</span>
                      : <span>ตัวอย่าง: <strong>081-234-5678</strong> หรือ <strong>089-765-4321</strong></span>
                    }
                  </p>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-lg font-medium mb-3">
                    🔒 <span>สร้างรหัสผ่าน <span className="text-red-500">*</span></span>
                  </label>
                  <input
                    type="password"
                    placeholder="รหัสผ่าน (อย่างน้อย 6 ตัว)"
                    className="input-field"
                    value={formData.password}
                    onChange={(e) => updateFormData('password', e.target.value)}
                  />
                  <p className="text-sm text-[hsl(var(--text-muted))] mt-1">ควรเป็นรหัสที่เด็กจำง่ายแต่ปลอดภัย</p>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-lg font-medium mb-3">
                    🎁 <span>รหัสสมาชิกที่แนะนำ <span className="text-[hsl(var(--text-muted))]">(ถ้ามี)</span></span>
                  </label>
                  <input
                    type="text"
                    placeholder="กรอกรหัสสมาชิก 5 หลัก (เช่น 00001)"
                    className="input-field"
                    value={formData.referrerMemberId}
                    onChange={(e) => updateFormData('referrerMemberId', e.target.value)}
                    maxLength={5}
                  />
                  <p className="text-sm text-[hsl(var(--text-muted))] mt-1">
                    กรอกรหัสสมาชิกของผู้ที่แนะนำให้คุณสมัคร เพื่อให้ท่านได้รับสิทธิพิเศษ
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      className="mt-1 w-4 h-4 rounded border-gray-300 focus:ring-2 focus:ring-[hsl(var(--focus-ring))]"
                      checked={formData.acceptTerms}
                      onChange={(e) => updateFormData('acceptTerms', e.target.checked)}
                    />
                    <span className="text-sm">
                      ยินยอมรับ <span className="text-red-500 font-medium">นโยบายความเป็นส่วนตัว</span> และ <span className="text-red-500 font-medium">เงื่อนไขการใช้งาน</span> <span className="text-red-500">*</span>
                    </span>
                  </label>

                  <label className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      className="mt-1 w-4 h-4 rounded border-gray-300 focus:ring-2 focus:ring-[hsl(var(--focus-ring))]"
                      checked={formData.acceptNewsletter}
                      onChange={(e) => updateFormData('acceptNewsletter', e.target.checked)}
                    />
                    <span className="text-sm">รับข่าวสารและกิจกรรมพิเศษทางอีเมล 📖</span>
                  </label>
                </div>

                <div className="flex justify-between">
                  <button onClick={handleBack} className="btn-secondary">
                    ← ย้อน กลับ
                  </button>
                  <button onClick={handleSubmit} className="btn-primary text-lg px-8">
                    🚀 สมัครสมาชิก! 🚀
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />

      {/* Success Dialog */}
      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-500">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-green-700 text-center text-2xl flex items-center justify-center gap-3">
              <span className="text-4xl">🎉</span>
              สมัครสมาชิกสำเร็จ!
            </AlertDialogTitle>
            <AlertDialogDescription className="text-green-600 text-center text-base mt-4">
              <div className="space-y-3">
                <p className="font-semibold text-lg">ส่งคำขอสมัครเรียบร้อยแล้ว!</p>
                <div className="bg-white/60 rounded-lg p-4 text-left">
                  <p className="mb-2">📧 กรุณารอการอนุมัติจากผู้ดูแล</p>
                  <p>💬 ผู้ปกครองกรุณา เพิ่มเพื่อน @kidfast เพื่อแจ้งการสมัครสมาชิกใหม่</p>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="justify-center mt-4">
            <AlertDialogAction 
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg font-semibold"
              onClick={() => {
                setShowSuccessDialog(false);
                navigate('/login');
              }}
            >
              ตกลง
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Signup;