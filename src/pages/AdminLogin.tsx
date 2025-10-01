import { useState } from 'react';
import { useAdmin } from '../hooks/useAdmin';
import { Link } from 'react-router-dom';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAdmin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setIsLoading(true);
    await login(email, password);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[hsl(var(--primary))] via-[hsl(var(--primary-variant))] to-[hsl(var(--accent))] p-4 flex items-center justify-center">
      <div className="card-glass max-w-md w-full p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[hsl(var(--primary))] mb-2">
            🔐 ผู้ดูแลระบบ
          </h1>
          <p className="text-[hsl(var(--text-secondary))]">เข้าสู่ระบบจัดการ KidFast</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-[hsl(var(--text-primary))] mb-2">
              อีเมลผู้ดูแล
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              placeholder="admin@kidfast.net"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[hsl(var(--text-primary))] mb-2">
              รหัสผ่าน
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input pr-12"
                placeholder="รหัสผ่านผู้ดูแล"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))]"
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !email || !password}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบผู้ดูแล 🔐'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link 
            to="/"
            className="text-sm text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--primary))] underline"
          >
            ← กลับสู่หน้าแรก
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;