import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../hooks/useAuth';
import SessionConflictDialog from '../components/SessionConflictDialog';
import { loginSchema } from '../utils/validation';
import { rateLimiter } from '../utils/rateLimiter';
import { ToastManager } from '../components/Toast';

const Login = () => {
  const { t } = useTranslation('login');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [sessionConflict, setSessionConflict] = useState({
    show: false,
    message: '',
    userNickname: ''
  });

  const { login } = useAuth();

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
                <span className="text-sm">{t('rememberMe')}</span>
              </label>

              {/* Login Button */}
              <button type="submit" className="w-full btn-primary text-lg">
                {t('loginButton')}
              </button>
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