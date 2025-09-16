import { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../hooks/useAuth';

const Profile = () => {
  const { username, isDemo, logout } = useAuth();
  const [selectedGrade, setSelectedGrade] = useState('1');

  const grades = ['1', '2', '3', '4', '5', '6'];
  
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
                สวัสดี {isDemo ? 'นักเรียนทดลอง' : 'น้องแมวเหมียว'}! 🌟
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
              key={grade}
              onClick={() => setSelectedGrade(grade)}
              className={`chip whitespace-nowrap ${selectedGrade === grade ? 'active' : ''}`}
            >
              ป.{grade}
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

        {/* Subject Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {subjects.map((subject, index) => (
            <div key={index} className="card-glass p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${subject.color}`}>
                    {subject.status === 'completed' ? '✅' : 
                     subject.status === 'active' ? '📚' : 
                     subject.status === 'locked' ? '🔒' : '➕'}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{subject.title}</h3>
                    <p className="text-sm text-[hsl(var(--text-secondary))]">{subject.lessons}</p>
                  </div>
                </div>
                <div className="text-right text-xs">
                  <div className="flex gap-1 mb-1">
                    {'⭐'.repeat(3)}
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>ความคืบหน้า</span>
                  <span>{subject.progress}%</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${subject.progress}%` }}
                  />
                </div>
              </div>

              {subject.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {subject.tags.map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      className={`chip text-xs ${
                        tagIndex < Math.floor(subject.progress / 25) ? 'bg-green-100 text-green-700' : ''
                      }`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex gap-3">
                {subject.status === 'active' && (
                  <>
                    {subject.title === 'การลบ 2 หลัก' ? (
                      <Link to="/subtraction" className="btn-primary text-sm flex-1 text-center">
                        เริ่มเรียนทันที
                      </Link>
                    ) : (
                      <button className="btn-primary text-sm flex-1">
                        เรียนต่อ
                      </button>
                    )}
                  </>
                )}
                {subject.status === 'completed' && (
                  <button className="btn-secondary text-sm flex-1">
                    ทบทวน
                  </button>
                )}
                {subject.status === 'locked' && (
                  <div className="text-center text-sm text-[hsl(var(--text-muted))] flex-1 py-2">
                    🔒 ปลดล็อกเมื่อทำภารกิจครบตามแผน
                  </div>
                )}
                {subject.status !== 'locked' && (
                  <button className="chip text-sm">
                    ทบทวน
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

      </main>

      <Footer />
    </div>
  );
};

export default Profile;