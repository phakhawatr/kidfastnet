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

  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(formData.email, formData.password);
  };


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

            {/* Footer Links */}
            <div className="text-center mt-6 space-y-2">
              <div className="flex items-center gap-2 justify-center text-sm text-[hsl(var(--text-muted))]">
                📚 <span className="text-yellow-600">ลืมรหัส?</span>
                😊 <Link to="/signup" className="text-blue-600 hover:underline">ยังไม่มีบัญชี?</Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Login;