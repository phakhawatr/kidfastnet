import { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SkillsSection from '../components/SkillsSection';
import { useAuth } from '../hooks/useAuth';
const Profile = () => {
  const {
    username,
    isDemo,
    logout
  } = useAuth();
  const [selectedGrade, setSelectedGrade] = useState('1');
  const grades = [{
    id: '1',
    label: 'การบวก'
  }, {
    id: '2',
    label: 'การลบ'
  }, {
    id: '3',
    label: 'การคูณ'
  }, {
    id: '4',
    label: 'การหาร'
  }, {
    id: '5',
    label: 'บอกเวลา'
  }, {
    id: '6',
    label: 'บอกน้ำหนัก'
  }];
  const achievements = [{
    icon: '⚡',
    name: 'นักคิดเร็ว'
  }, {
    icon: '🔥',
    name: 'ติดไฟ'
  }, {
    icon: '👑',
    name: 'ราชันย์'
  }, {
    icon: '❄️',
    name: 'เซียนน้ำแข็ง'
  }, {
    icon: '🐧',
    name: 'เพนกวินเก่ง'
  }];
  const subjects = [{
    title: 'การนับเลข',
    progress: 100,
    lessons: '5/5 บทเรียน',
    difficulty: 'ง่าย',
    status: 'completed',
    tags: ['นับ 1-10', 'นับ 11-50', 'นับ 51-100'],
    color: 'bg-green-100'
  }, {
    title: 'การบวก',
    progress: 75,
    lessons: '3/4 บทเรียน',
    difficulty: 'ง่าย',
    status: 'active',
    tags: ['บวก 1-5', 'บวก 6-10', 'มากกว่า 10', 'บวก 2 หลัก'],
    color: 'bg-blue-100'
  }, {
    title: 'การลบ 2 หลัก',
    progress: 50,
    lessons: '2/4 บทเรียน',
    difficulty: 'ง่าย',
    status: 'active',
    tags: ['ลบ 1-5', 'ลบ 6-10', 'ลบมากกว่า 10', 'ลบ 2 หลัก'],
    color: 'bg-yellow-100'
  }, {
    title: 'รูปทรง',
    progress: 0,
    lessons: '0/3 บทเรียน',
    difficulty: 'ปานกลาง',
    status: 'locked',
    tags: [],
    color: 'bg-gray-100'
  }];
  return <div className="min-h-screen">
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
        {grades.map(grade => <button key={grade.id} onClick={() => setSelectedGrade(grade.id)} className={`chip whitespace-nowrap ${selectedGrade === grade.id ? 'active' : ''}`}>
              {grade.label}
            </button>)}
        </div>

        {/* Recommendation Card */}
        <div className="card-glass p-6 mb-6 border-l-4 border-orange-400">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">🎯</span>
            <h2 className="text-xl font-bold text-[hsl(var(--text-primary))]">แนะนำสำหรับคุณ</h2>
          </div>
          
          {selectedGrade === '1' && (
            <>
              <div className="bg-[hsl(var(--grade-1))] rounded-xl p-6 mb-4">
                <h3 className="font-bold text-lg mb-2">➕ การบวกเลข</h3>
                <p className="text-sm text-[hsl(var(--text-secondary))] mb-4">
                  มาฝึกบวกเลขให้เก่งขึ้น! เริ่มจากเลขง่ายๆ ไปจนถึงการบวก 2 หลัก
                </p>
                <Link to="/addition" className="btn-primary text-sm inline-block">
                  เริ่มฝึกเลย!
                </Link>
              </div>
              
              <div className="bg-[hsl(var(--grade-2))] rounded-xl p-6 mb-4">
                <h3 className="font-bold text-lg mb-2">📏 เปรียบเทียบความยาว</h3>
                <p className="text-sm text-[hsl(var(--text-secondary))] mb-4">
                  ฝึกเปรียบเทียบความยาวของวัตถุต่างๆ เรียนรู้แบบสนุกและเข้าใจง่าย!
                </p>
                <Link to="/length-comparison" className="btn-primary text-sm inline-block">
                  เริ่มฝึกเลย!
                </Link>
              </div>
              
              <div className="bg-[hsl(var(--grade-3))] rounded-xl p-6 mb-4">
                <h3 className="font-bold text-lg mb-2">🔢 ทายตัวเลขในลำดับ</h3>
                <p className="text-sm text-[hsl(var(--text-secondary))] mb-4">
                  ฝึกสังเกตและหาตัวเลขในลำดับ พัฒนาทักษะการคิดวิเคราะห์!
                </p>
                <Link to="/number-series" className="btn-primary text-sm inline-block">
                  เริ่มฝึกเลย!
                </Link>
              </div>
            </>
          )}
          
          {selectedGrade === '2' && (
            <>
              <div className="bg-[hsl(var(--grade-2))] rounded-xl p-6 mb-4">
                <h3 className="font-bold text-lg mb-2">➖ การลบเลข 2 หลัก</h3>
                <p className="text-sm text-[hsl(var(--text-secondary))] mb-4">
                  มาฝึกลบเลข 2 หลักให้เก่งขึ้น! เริ่มจากเลขง่ายๆ ไปจนถึงโจทย์ที่ท้าทาย
                </p>
                <Link to="/subtraction" className="btn-primary text-sm inline-block">
                  เริ่มฝึกเลย!
                </Link>
              </div>
              
              <div className="bg-[hsl(var(--grade-1))] rounded-xl p-6 mb-4">
                <h3 className="font-bold text-lg mb-2">➕ ทบทวนการบวก</h3>
                <p className="text-sm text-[hsl(var(--text-secondary))] mb-4">
                  ทบทวนการบวกเลขเพื่อเสริมความแม่นยำ พื้นฐานที่แข็งแรงสำคัญมาก!
                </p>
                <Link to="/addition" className="btn-primary text-sm inline-block">
                  เริ่มฝึกเลย!
                </Link>
              </div>
              
              <div className="bg-[hsl(var(--grade-3))] rounded-xl p-6 mb-4">
                <h3 className="font-bold text-lg mb-2">🔷 จับคู่รูปทรง</h3>
                <p className="text-sm text-[hsl(var(--text-secondary))] mb-4">
                  เรียนรู้รูปทรงเรขาคณิตต่างๆ พัฒนาทักษะการมองเห็นเชิงพื้นที่!
                </p>
                <Link to="/shapes" className="btn-primary text-sm inline-block">
                  เริ่มฝึกเลย!
                </Link>
              </div>
            </>
          )}
          
          {selectedGrade === '3' && (
            <>
              <div className="bg-[hsl(var(--grade-3))] rounded-xl p-6 mb-4">
                <h3 className="font-bold text-lg mb-2">✖️ การคูณ</h3>
                <p className="text-sm text-[hsl(var(--text-secondary))] mb-4">
                  ฝึกสูตรคูณให้แม่นและเร็วขึ้น! พื้นฐานสำคัญสำหรับคณิตศาสตร์ขั้นสูง
                </p>
                <Link to="/multiplication" className="btn-primary text-sm inline-block">
                  เริ่มฝึกเลย!
                </Link>
              </div>
              
              <div className="bg-[hsl(var(--grade-4))] rounded-xl p-6 mb-4">
                <h3 className="font-bold text-lg mb-2">📊 ตารางคูณ</h3>
                <p className="text-sm text-[hsl(var(--text-secondary))] mb-4">
                  เรียนรู้ตารางคูณแบบครบถ้วน ฝึกจนจำได้แม่นและรวดเร็ว!
                </p>
                <Link to="/multiplication-table" className="btn-primary text-sm inline-block">
                  เริ่มฝึกเลย!
                </Link>
              </div>
              
              <div className="bg-[hsl(var(--grade-2))] rounded-xl p-6 mb-4">
                <h3 className="font-bold text-lg mb-2">📐 การวัด</h3>
                <p className="text-sm text-[hsl(var(--text-secondary))] mb-4">
                  ฝึกการวัดความยาวและการแปลงหน่วย ทักษะที่ใช้ในชีวิตประจำวัน!
                </p>
                <Link to="/measurement" className="btn-primary text-sm inline-block">
                  เริ่มฝึกเลย!
                </Link>
              </div>
            </>
          )}
          
          {selectedGrade === '4' && (
            <>
              <div className="bg-[hsl(var(--grade-4))] rounded-xl p-6 mb-4">
                <h3 className="font-bold text-lg mb-2">➗ การหาร</h3>
                <p className="text-sm text-[hsl(var(--text-secondary))] mb-4">
                  มาเรียนรู้การหารให้เข้าใจและคำนวณได้รวดเร็ว! ทักษะสำคัญสำหรับการแก้โจทย์
                </p>
                <Link to="/division" className="btn-primary text-sm inline-block">
                  เริ่มฝึกเลย!
                </Link>
              </div>
              
              <div className="bg-[hsl(var(--grade-5))] rounded-xl p-6 mb-4">
                <h3 className="font-bold text-lg mb-2">🍕 เศษส่วน</h3>
                <p className="text-sm text-[hsl(var(--text-secondary))] mb-4">
                  ฝึกจับคู่และเปรียบเทียบเศษส่วน เข้าใจแนวคิดที่สำคัญของคณิตศาสตร์!
                </p>
                <Link to="/fractions" className="btn-primary text-sm inline-block">
                  เริ่มฝึกเลย!
                </Link>
              </div>
              
              <div className="bg-[hsl(var(--grade-3))] rounded-xl p-6 mb-4">
                <h3 className="font-bold text-lg mb-2">✖️ ทบทวนการคูณ</h3>
                <p className="text-sm text-[hsl(var(--text-secondary))] mb-4">
                  ทบทวนการคูณเพื่อเตรียมพร้อมสำหรับการหาร พื้นฐานที่แข็งแรงช่วยได้มาก!
                </p>
                <Link to="/multiplication" className="btn-primary text-sm inline-block">
                  เริ่มฝึกเลย!
                </Link>
              </div>
            </>
          )}
          
          {selectedGrade === '5' && (
            <>
              <div className="bg-[hsl(var(--grade-5))] rounded-xl p-6 mb-4">
                <h3 className="font-bold text-lg mb-2">🕐 บอกเวลา</h3>
                <p className="text-sm text-[hsl(var(--text-secondary))] mb-4">
                  ฝึกอ่านนาฬิกาและบอกเวลาให้แม่นยำ ทักษะที่ใช้ทุกวันในชีวิตจริง!
                </p>
                <Link to="/time" className="btn-primary text-sm inline-block">
                  เริ่มฝึกเลย!
                </Link>
              </div>
              
              <div className="bg-[hsl(var(--grade-4))] rounded-xl p-6 mb-4">
                <h3 className="font-bold text-lg mb-2">🍕 เศษส่วนขั้นสูง</h3>
                <p className="text-sm text-[hsl(var(--text-secondary))] mb-4">
                  ฝึกเศษส่วนในระดับที่ซับซ้อนขึ้น เพื่อพัฒนาความเข้าใจอย่างลึกซึ้ง!
                </p>
                <Link to="/fractions" className="btn-primary text-sm inline-block">
                  เริ่มฝึกเลย!
                </Link>
              </div>
              
              <div className="bg-[hsl(var(--grade-6))] rounded-xl p-6 mb-4">
                <h3 className="font-bold text-lg mb-2">📊 เปอร์เซ็นต์</h3>
                <p className="text-sm text-[hsl(var(--text-secondary))] mb-4">
                  เรียนรู้การคำนวณเปอร์เซ็นต์ ใช้ได้ในการซื้อของ การลดราคา และอีกมากมาย!
                </p>
                <Link to="/percentage" className="btn-primary text-sm inline-block">
                  เริ่มฝึกเลย!
                </Link>
              </div>
            </>
          )}
          
          {selectedGrade === '6' && (
            <>
              <div className="bg-[hsl(var(--grade-6))] rounded-xl p-6 mb-4">
                <h3 className="font-bold text-lg mb-2">⚖️ บอกน้ำหนัก</h3>
                <p className="text-sm text-[hsl(var(--text-secondary))] mb-4">
                  ฝึกการชั่งน้ำหนักและเปรียบเทียบมวล ทักษะสำคัญในวิทยาศาสตร์และชีวิตประจำวัน!
                </p>
                <Link to="/weighing" className="btn-primary text-sm inline-block">
                  เริ่มฝึกเลย!
                </Link>
              </div>
              
              <div className="bg-[hsl(var(--grade-5))] rounded-xl p-6 mb-4">
                <h3 className="font-bold text-lg mb-2">⚡ คณิตเร็ว</h3>
                <p className="text-sm text-[hsl(var(--text-secondary))] mb-4">
                  ท้าทายความเร็วในการคำนวณ! ฝึกทั้ง บวก ลบ คูณ หาร ให้รวดเร็วและแม่นยำ
                </p>
                <Link to="/quick-math" className="btn-primary text-sm inline-block">
                  เริ่มฝึกเลย!
                </Link>
              </div>
              
              <div className="bg-[hsl(var(--grade-4))] rounded-xl p-6 mb-4">
                <h3 className="font-bold text-lg mb-2">🧩 ปริศนาตารางเลข</h3>
                <p className="text-sm text-[hsl(var(--text-secondary))] mb-4">
                  แก้ปริศนาตารางเลขที่ท้าทายสมอง ฝึกทักษะการคิดวิเคราะห์แบบสนุก!
                </p>
                <Link to="/sum-grid" className="btn-primary text-sm inline-block">
                  เริ่มฝึกเลย!
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Achievements */}
        <div className="card-glass p-6 mb-6">
          <h2 className="text-xl font-bold text-[hsl(var(--text-primary))] mb-4">
            🏆 ความสำเร็จของคุณ
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {achievements.map((achievement, index) => <div key={index} className="flex-shrink-0 bg-yellow-100 rounded-full w-16 h-16 flex items-center justify-center text-2xl border-2 border-yellow-300" title={achievement.name}>
                {achievement.icon}
              </div>)}
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
              <div className="text-2xl font-bold text-orange-500 mb-1">10</div>
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
    </div>;
};
export default Profile;