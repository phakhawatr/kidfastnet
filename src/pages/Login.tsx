import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../hooks/useAuth';
import SessionConflictDialog from '../components/SessionConflictDialog';
import { loginSchema } from '../utils/validation';
import { rateLimiter } from '../utils/rateLimiter';
import { ToastManager } from '../components/Toast';
import { Separator } from '@/components/ui/separator';

const CREDENTIALS_KEY = 'kidfast_remembered_credentials';

const Login = () => {
  const { t } = useTranslation('login');
  const [formData, setFormData] = useState(() => {
    try {
      const saved = localStorage.getItem(CREDENTIALS_KEY);
      if (saved) {
        const decoded = JSON.parse(atob(saved));
        return { email: decoded.e || '', password: decoded.p || '', rememberMe: true };
      }
    } catch { /* ignore */ }
    return { email: '', password: '', rememberMe: false };
  });
  const [showPassword, setShowPassword] = useState(false);
  const [sessionConflict, setSessionConflict] = useState({
    show: false,
    message: '',
    userNickname: ''
  });
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const { login, signInWithGoogle } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate input
    const validation = loginSchema.safeParse({
      email: formData.email,
      password: formData.password,
    });

    if (!validation.success) {
      const firstError = validation.error.errors[0];
      ToastManager.show({
        message: firstError.message,
        type: 'error'
      });
      return;
    }

    // Check rate limiting
    const rateLimit = rateLimiter.checkRateLimit(formData.email);
    if (!rateLimit.allowed) {
      ToastManager.show({
        message: t('tooManyAttempts', { time: rateLimit.remainingTime }),
        type: 'error'
      });
      return;
    }

    // Record login attempt
    rateLimiter.recordAttempt(formData.email);
    
    const result = await login(formData.email, formData.password);
    
    // Reset rate limiter on successful login
    if (result.success) {
      rateLimiter.resetAttempts(formData.email);
      // Save or clear remembered credentials
      if (formData.rememberMe) {
        const encoded = btoa(JSON.stringify({ e: formData.email, p: formData.password }));
        localStorage.setItem(CREDENTIALS_KEY, encoded);
      } else {
        localStorage.removeItem(CREDENTIALS_KEY);
      }
    }
    
    if (!result.success && result.error) {
      // Check if this is a session conflict error
      if (result.error.includes('กำลังใช้งานอยู่')) {
        setSessionConflict({
          show: true,
          message: result.error,
          userNickname: formData.email.split('@')[0]
        });
      }
    }
  };

  const handleCloseSessionDialog = () => {
    setSessionConflict({
      show: false,
      message: '',
      userNickname: ''
    });
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      await signInWithGoogle();
    } finally {
      setIsGoogleLoading(false);
    }
  };


  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          {/* Welcome Message */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🧮</div>
            <h1 className="text-2xl font-bold text-white mb-2">{t('title')}</h1>
            <p className="text-white/80">{t('welcome')}</p>
          </div>

          <div className="card-glass p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div>
                <label className="flex items-center gap-2 text-lg font-medium mb-3">
                  📧 <span>{t('emailLabel')} <span className="text-red-500">{t('required')}</span></span>
                </label>
                <input
                  type="email"
                  placeholder={t('emailPlaceholder')}
                  className="input-field"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label className="flex items-center gap-2 text-lg font-medium mb-3">
                  🔒 <span>{t('passwordLabel')}</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder={t('passwordPlaceholder')}
                    className="input-field pr-12"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 focus:ring-2 focus:ring-[hsl(var(--focus-ring))]"
                  checked={formData.rememberMe}
                  onChange={(e) => setFormData(prev => ({ ...prev, rememberMe: e.target.checked }))}
                />
                <span className="text-sm">🔐 ช่วยจำรหัสอย่างถาวร</span>
              </label>

              {/* Login Button */}
              <button type="submit" className="w-full btn-primary text-lg">
                {t('loginButton')}
              </button>

              {/* Divider */}
              <div className="relative my-6">
                <Separator className="bg-border/50" />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-3 text-sm text-muted-foreground">
                  หรือ
                </span>
              </div>

              {/* Google Login Button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isGoogleLoading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-border rounded-xl bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="text-gray-700 dark:text-gray-200 font-medium">
                  {isGoogleLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบด้วย Google'}
                </span>
              </button>

              {/* Free member info */}
              <div className="text-center mt-4 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  🎉 <strong>สมัครด้วย Google ฟรี!</strong>
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  เข้าใช้งานได้ทันที พร้อมเล่น บวก ลบ คูณ หาร
                </p>
              </div>
            </form>

            {/* Footer Links */}
            <div className="text-center mt-6 space-y-2">
              <div className="flex items-center gap-2 justify-center text-sm text-[hsl(var(--text-muted))]">
                📚 <span className="text-yellow-600">{t('forgotPassword')}</span>
                😊 <Link to="/signup" className="text-blue-600 hover:underline">{t('noAccount')}</Link>
              </div>
              <div className="text-xs text-center text-[hsl(var(--text-muted))] mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-yellow-700"><strong>{t('hintTitle')}</strong></p>
                <p className="text-yellow-600">{t('hintText')}</p>
                <p className="text-yellow-600">{t('hintSignupLink')} <Link to="/signup" className="underline font-medium">{t('hintSignup')}</Link> {t('hintSignupLocation')}</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      
      {/* Session Conflict Dialog */}
      <SessionConflictDialog
        isOpen={sessionConflict.show}
        onClose={handleCloseSessionDialog}
        message={sessionConflict.message}
        userNickname={sessionConflict.userNickname}
      />
    </div>
  );
};

export default Login;