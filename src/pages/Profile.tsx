import { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SkillsSection from '../components/SkillsSection';
import { useAuth } from '../hooks/useAuth';

const Profile = () => {
  const { username, isDemo, logout } = useAuth();
  const [selectedGrade, setSelectedGrade] = useState('1');

  const grades = [
    { id: '1', label: 'การบวก' },
    { id: '2', label: 'ป.2' },
    { id: '3', label: 'ป.3' },
    { id: '4', label: 'ป.4' },
    { id: '5', label: 'ป.5' },
    { id: '6', label: 'ป.6' }
  ];
  
  const achievements = [
    { icon: '⚡', name: 'นักคิดเร็ว' },
    { icon: '🔥', name: 'ติดไฟ' }, 
    { icon: '👑', name: 'ราชันย์' },
    { icon: '❄️', name: 'เซียนน้ำแข็ง' },
    { icon: '🐧', name: 'เพนกวินเก่ง' }
  ];

  const subjects = [
    {
      title: 'การนับเลข',
      progress: 100,
      lessons: '5/5 บทเรียน',
      difficulty: 'ง่าย',
      status: 'completed',
      tags: ['นับ 1-10', 'นับ 11-50', 'นับ 51-100'],
      color: 'bg-green-100'
    },
    {
      title: 'การบวก',
      progress: 75,
      lessons: '3/4 บทเรียน', 
      difficulty: 'ง่าย',
      status: 'active',
      tags: ['บวก 1-5', 'บวก 6-10', 'มากกว่า 10', 'บวก 2 หลัก'],
      color: 'bg-blue-100'
    },
    {
      title: 'การลบ 2 หลัก',
      progress: 50,
      lessons: '2/4 บทเรียน',
      difficulty: 'ง่าย', 
      status: 'active',
      tags: ['ลบ 1-5', 'ลบ 6-10', 'ลบมากกว่า 10', 'ลบ 2 หลัก'],
      color: 'bg-yellow-100'
    },
    {
      title: 'รูปทรง',
      progress: 0,
      lessons: '0/3 บทเรียน',
      difficulty: 'ปานกลาง',
      status: 'locked',
      tags: [],
      color: 'bg-gray-100'
    }
  ];

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        {/* Welcome Header */}
        <div className="card-glass p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))] mb-2">
                สวัสดี {isDemo ? 'นักเรียนทดลอง' : `น้อง${username}`}! 🌟
              </h1>
              <p className="text-[hsl(var(--text-secondary))]">ยินดีต้อนรับกลับสู่การเรียนรู้ที่สนุก</p>
            </div>
            <div className="flex gap-2">
              <button className="chip">โปรไฟล์</button>
              <button className="chip">ผู้ปกครอง</button>
              <button onClick={logout} className="chip hover:bg-red-100 hover:text-red-600">
                ออกจากระบบ
              </button>
            </div>
          </div>
        </div>

        {/* Grade Selection */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {grades.map((grade) => (
            <button
              key={grade.id}
              onClick={() => setSelectedGrade(grade.id)}
              className={`chip whitespace-nowrap ${selectedGrade === grade.id ? 'active' : ''}`}
            >
              {grade.label}
            </button>
          ))}
        </div>

        {/* Recommendation Card */}
        <div className="card-glass p-6 mb-6 border-l-4 border-orange-400">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">🎯</span>
            <h2 className="text-xl font-bold text-[hsl(var(--text-primary))]">แนะนำสำหรับคุณ</h2>
          </div>
          
          <div className="bg-[hsl(var(--grade-3))] rounded-xl p-6 mb-4">
            <h3 className="font-bold text-lg mb-2">📊 การบวกเลข 2 หลัก</h3>
            <p className="text-sm text-[hsl(var(--text-secondary))] mb-4">
              มาฝึกบวกเลข 2 หลักให้เก่งขึ้น เพราะเป็นพื้นฐานสำคัญของคณิตศาสตร์!
            </p>
            <Link to="/subtraction" className="btn-primary text-sm inline-block">
              เริ่มเรียนทันที!
            </Link>
          </div>
        </div>

        {/* Achievements */}
        <div className="card-glass p-6 mb-6">
          <h2 className="text-xl font-bold text-[hsl(var(--text-primary))] mb-4">
            🏆 ความสำเร็จของคุณ
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {achievements.map((achievement, index) => (
              <div
                key={index}
                className="flex-shrink-0 bg-yellow-100 rounded-full w-16 h-16 flex items-center justify-center text-2xl border-2 border-yellow-300"
                title={achievement.name}
              >
                {achievement.icon}
              </div>
            ))}
          </div>
        </div>

        {/* Grade Progress */}
        <div className="card-glass p-6 mb-6">
          <h2 className="text-xl font-bold text-[hsl(var(--text-primary))] mb-4">
            🌱 ประถม {selectedGrade} – ฐานการคณิต
          </h2>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500 mb-1">85%</div>
              <div className="text-sm text-[hsl(var(--text-muted))]">ความก้าวหน้า</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500 mb-1">12/15</div>
              <div className="text-sm text-[hsl(var(--text-muted))]">บทเรียน</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500 mb-1">450</div>
              <div className="text-sm text-[hsl(var(--text-muted))]">แต้มรวม</div>
            </div>
          </div>
        </div>

        {/* Skills Section */}
        <SkillsSection />

      </main>

      <Footer />
    </div>
  );
};

export default Profile;