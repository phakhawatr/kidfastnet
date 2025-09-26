import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '../hooks/useAuth';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ToastManager } from '../components/Toast';

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
  acceptTerms: boolean;
  acceptNewsletter: boolean;
}

const Signup = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<SignupData>({
    nickname: '',
    age: '',
    grade: '',
    avatar: '',
    learningStyle: '',
    parentEmail: '',
    parentPhone: '',
    password: '',
    acceptTerms: false,
    acceptNewsletter: false
  });

  const navigate = useNavigate();
  const { signup } = useAuth();

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
        // Validate phone number format before submission
        if (!validatePhoneNumber(formData.parentPhone)) {
          ToastManager.show({
            message: 'รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง กรุณากรอกในรูปแบบ 08X-XXX-XXXX',
            type: 'error'
          });
          return;
        }

        // First create registration request for admin approval
        const { error: registrationError } = await supabase
          .from('user_registrations')
          .insert({
            nickname: formData.nickname,
            age: parseInt(formData.age),
            grade: `ป.${formData.grade}`,
            avatar: formData.avatar,
            learning_style: formData.learningStyle,
            parent_email: formData.parentEmail,
            parent_phone: formData.parentPhone,
            password_hash: formData.password, // Will be hashed by trigger
            status: 'pending'
          });

        if (registrationError) throw registrationError;

        ToastManager.show({
          message: 'ส่งคำขอสมัครเรียบร้อย! กรุณารอการอนุมัติจากผู้ดูแล คุณจะได้รับอีเมลเมื่อได้รับการอนุมัติแล้ว',
          type: 'success'
        });
        
        navigate('/login');
      } catch (error) {
        console.error('Error during signup:', error);
        ToastManager.show({
          message: 'เกิดข้อผิดพลาดในการสมัครสมาชิก',
          type: 'error'
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
                  <input
                    type="tel"
                    placeholder="08X-XXX-XXXX"
                    className={`input-field ${formData.parentPhone && !validatePhoneNumber(formData.parentPhone) ? 'border-red-500' : ''}`}
                    value={formData.parentPhone}
                    onChange={(e) => updateFormData('parentPhone', e.target.value)}
                    required
                  />
                  <p className="text-sm text-[hsl(var(--text-muted))] mt-1">
                    {formData.parentPhone && !validatePhoneNumber(formData.parentPhone) 
                      ? <span className="text-red-500">รูปแบบเบอร์โทรไม่ถูกต้อง (ตัวอย่าง: 081-234-5678)</span>
                      : 'ไม่บังคับ - สำหรับติดต่อในกรณีเร่งด่วน'
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
    </div>
  );
};

export default Signup;