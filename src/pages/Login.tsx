import { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../hooks/useAuth';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);

  const { login, demoLogin } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(formData.email, formData.password);
  };

  const handleQuickLogin = (email: string) => {
    setFormData(prev => ({ ...prev, email, password: '123456' }));
  };

  const avatars = [
    { id: 'cat', emoji: '🐱' },
    { id: 'dog', emoji: '🐶' },
    { id: 'rabbit', emoji: '🐰' },
    { id: 'unicorn', emoji: '🦄' }
  ];

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          {/* Welcome Message */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🧮</div>
            <h1 className="text-2xl font-bold text-white mb-2">KidFast</h1>
            <p className="text-white/80">กลับมาแล้ว! ยินดีต้อนรับ 🎉</p>
          </div>

          <div className="card-glass p-8">
            {/* Demo Button */}
            <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div className="flex items-center gap-3 mb-3">
                🎮 <span className="font-medium text-blue-700">ทดลองใช้งานฟรี</span>
              </div>
              <p className="text-sm text-blue-600 mb-3">ลองเล่นคอมไพล์สมการทันที ไม่ต้องสมัครเลย!</p>
              <button 
                onClick={demoLogin}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors duration-200"
              >
                เข้าสู่โหมดทดลอง
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div>
                <label className="flex items-center gap-2 text-lg font-medium mb-3">
                  📧 <span>อีเมลผู้ปกครอง <span className="text-red-500">*</span></span>
                </label>
                <input
                  type="email"
                  placeholder="parent@email.com"
                  className="input-field"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label className="flex items-center gap-2 text-lg font-medium mb-3">
                  🔒 <span>รหัสผ่าน</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="รหัสผ่านของหนู"
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
                <span className="text-sm">จำฉันไว้</span>
              </label>

              {/* Login Button */}
              <button type="submit" className="w-full btn-primary text-lg">
                🚀 เข้าสู่ระบบ!
              </button>
            </form>

            {/* Quick Login */}
            <div className="mt-8">
              <div className="flex items-center gap-2 text-lg font-medium mb-4">
                ⚡ <span>ล็อกอินด่วน</span>
              </div>
              <div className="flex justify-center gap-4">
                {avatars.map((avatar) => (
                  <button
                    key={avatar.id}
                    onClick={() => handleQuickLogin('demo@kidfast.net')}
                    className="avatar-option"
                    title="คลิกเพื่อใส่ข้อมูลทดสอบ"
                  >
                    {avatar.emoji}
                  </button>
                ))}
              </div>
              <p className="text-xs text-center text-[hsl(var(--text-muted))] mt-2">คลิกอวาตาร์เพื่อใส่ข้อมูลทดสอบ</p>
            </div>

            {/* Footer Links */}
            <div className="text-center mt-6 space-y-2">
              <div className="flex items-center gap-2 justify-center text-sm text-[hsl(var(--text-muted))]">
                📚 <span className="text-yellow-600">ลืมรหัส?</span>
                😊 <Link to="/signup" className="text-blue-600 hover:underline">ยังไม่มีบัญชี?</Link>
              </div>
            </div>

            {/* Demo Instructions */}
            <div className="mt-8 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
              <div className="flex items-center gap-2 mb-2">
                🌟 <span className="font-medium text-yellow-700">ยังไม่มีบัญชี?</span>
              </div>
              <Link 
                to="/signup" 
                className="inline-flex items-center gap-2 text-sm text-yellow-600 hover:text-yellow-800"
              >
                📝 สมัครสมาชิกใหม่
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Login;