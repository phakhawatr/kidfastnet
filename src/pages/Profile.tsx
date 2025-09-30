import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SkillsSection from '../components/SkillsSection';
import { useAuth } from '../hooks/useAuth';

// Import mascot images
import mascotAddition from '../assets/mascot-addition.png';
import mascotSubtraction from '../assets/mascot-subtraction.png';
import mascotMultiplication from '../assets/mascot-multiplication.png';
import mascotDivision from '../assets/mascot-division.png';
import mascotTime from '../assets/mascot-time.png';
import mascotWeighing from '../assets/mascot-weighing.png';

// Define all available recommendations for each grade
const allRecommendations = {
  '1': [
    {
      icon: '➕',
      title: 'การบวกเลข',
      description: 'มาฝึกบวกเลขให้เก่งขึ้น! เริ่มจากเลขง่ายๆ ไปจนถึงการบวก 2 หลัก',
      link: '/addition',
      color: 'bg-[hsl(var(--grade-1))]'
    },
    {
      icon: '📏',
      title: 'เปรียบเทียบความยาว',
      description: 'ฝึกเปรียบเทียบความยาวของวัตถุต่างๆ เรียนรู้แบบสนุกและเข้าใจง่าย!',
      link: '/length-comparison',
      color: 'bg-[hsl(var(--grade-2))]'
    },
    {
      icon: '🔢',
      title: 'ทายตัวเลขในลำดับ',
      description: 'ฝึกสังเกตและหาตัวเลขในลำดับ พัฒนาทักษะการคิดวิเคราะห์!',
      link: '/NumberSeries',
      color: 'bg-[hsl(var(--grade-3))]'
    },
    {
      icon: '🔷',
      title: 'จับคู่รูปทรง',
      description: 'เรียนรู้รูปทรงเรขาคณิตต่างๆ พัฒนาทักษะการมองเห็นเชิงพื้นที่!',
      link: '/shape-matching',
      color: 'bg-[hsl(var(--grade-3))]'
    }
  ],
  '2': [
    {
      icon: '➖',
      title: 'การลบเลข 2 หลัก',
      description: 'มาฝึกลบเลข 2 หลักให้เก่งขึ้น! เริ่มจากเลขง่ายๆ ไปจนถึงโจทย์ที่ท้าทาย',
      link: '/subtraction',
      color: 'bg-[hsl(var(--grade-2))]'
    },
    {
      icon: '➕',
      title: 'ทบทวนการบวก',
      description: 'ทบทวนการบวกเลขเพื่อเสริมความแม่นยำ พื้นฐานที่แข็งแรงสำคัญมาก!',
      link: '/addition',
      color: 'bg-[hsl(var(--grade-1))]'
    },
    {
      icon: '🔷',
      title: 'จับคู่รูปทรง',
      description: 'เรียนรู้รูปทรงเรขาคณิตต่างๆ พัฒนาทักษะการมองเห็นเชิงพื้นที่!',
      link: '/shape-matching',
      color: 'bg-[hsl(var(--grade-3))]'
    },
    {
      icon: '📏',
      title: 'เปรียบเทียบความยาว',
      description: 'ฝึกเปรียบเทียบความยาวของวัตถุต่างๆ เรียนรู้แบบสนุกและเข้าใจง่าย!',
      link: '/length-comparison',
      color: 'bg-[hsl(var(--grade-2))]'
    }
  ],
  '3': [
    {
      icon: '✖️',
      title: 'การคูณ',
      description: 'ฝึกสูตรคูณให้แม่นและเร็วขึ้น! พื้นฐานสำคัญสำหรับคณิตศาสตร์ขั้นสูง',
      link: '/multiply',
      color: 'bg-[hsl(var(--grade-3))]'
    },
    {
      icon: '📊',
      title: 'ตารางคูณ',
      description: 'เรียนรู้ตารางคูณแบบครบถ้วน ฝึกจนจำได้แม่นและรวดเร็ว!',
      link: '/multiplication-table',
      color: 'bg-[hsl(var(--grade-4))]'
    },
    {
      icon: '📐',
      title: 'การวัด',
      description: 'ฝึกการวัดความยาวและการแปลงหน่วย ทักษะที่ใช้ในชีวิตประจำวัน!',
      link: '/measurement',
      color: 'bg-[hsl(var(--grade-2))]'
    },
    {
      icon: '➕',
      title: 'การบวกเลข',
      description: 'ทบทวนการบวกเพื่อเสริมทักษะพื้นฐาน เตรียมพร้อมสำหรับคณิตศาสตร์ขั้นสูง!',
      link: '/addition',
      color: 'bg-[hsl(var(--grade-1))]'
    }
  ],
  '4': [
    {
      icon: '➗',
      title: 'การหาร',
      description: 'มาเรียนรู้การหารให้เข้าใจและคำนวณได้รวดเร็ว! ทักษะสำคัญสำหรับการแก้โจทย์',
      link: '/division',
      color: 'bg-[hsl(var(--grade-4))]'
    },
    {
      icon: '🍕',
      title: 'เศษส่วน',
      description: 'ฝึกจับคู่และเปรียบเทียบเศษส่วน เข้าใจแนวคิดที่สำคัญของคณิตศาสตร์!',
      link: '/fraction-matching',
      color: 'bg-[hsl(var(--grade-5))]'
    },
    {
      icon: '✖️',
      title: 'ทบทวนการคูณ',
      description: 'ทบทวนการคูณเพื่อเตรียมพร้อมสำหรับการหาร พื้นฐานที่แข็งแรงช่วยได้มาก!',
      link: '/multiply',
      color: 'bg-[hsl(var(--grade-3))]'
    },
    {
      icon: '📊',
      title: 'ตารางคูณ',
      description: 'เรียนรู้ตารางคูณแบบครบถ้วน ฝึกจนจำได้แม่นและรวดเร็ว!',
      link: '/multiplication-table',
      color: 'bg-[hsl(var(--grade-4))]'
    }
  ],
  '5': [
    {
      icon: '🕐',
      title: 'บอกเวลา',
      description: 'ฝึกอ่านนาฬิกาและบอกเวลาให้แม่นยำ ทักษะที่ใช้ทุกวันในชีวิตจริง!',
      link: '/time',
      color: 'bg-[hsl(var(--grade-5))]'
    },
    {
      icon: '🍕',
      title: 'เศษส่วนขั้นสูง',
      description: 'ฝึกเศษส่วนในระดับที่ซับซ้อนขึ้น เพื่อพัฒนาความเข้าใจอย่างลึกซึ้ง!',
      link: '/fraction-matching',
      color: 'bg-[hsl(var(--grade-4))]'
    },
    {
      icon: '📊',
      title: 'เปอร์เซ็นต์',
      description: 'เรียนรู้การคำนวณเปอร์เซ็นต์ ใช้ได้ในการซื้อของ การลดราคา และอีกมากมาย!',
      link: '/percentage',
      color: 'bg-[hsl(var(--grade-6))]'
    },
    {
      icon: '➗',
      title: 'การหาร',
      description: 'ทบทวนการหารเพื่อเสริมความแม่นยำ พื้นฐานสำคัญสำหรับคณิตศาสตร์ขั้นสูง!',
      link: '/division',
      color: 'bg-[hsl(var(--grade-4))]'
    }
  ],
  '6': [
    {
      icon: '⚖️',
      title: 'บอกน้ำหนัก',
      description: 'ฝึกการชั่งน้ำหนักและเปรียบเทียบมวล ทักษะสำคัญในวิทยาศาสตร์และชีวิตประจำวัน!',
      link: '/weighing',
      color: 'bg-[hsl(var(--grade-6))]'
    },
    {
      icon: '⚡',
      title: 'คณิตเร็ว',
      description: 'ท้าทายความเร็วในการคำนวณ! ฝึกทั้ง บวก ลบ คูณ หาร ให้รวดเร็วและแม่นยำ',
      link: '/quick-math',
      color: 'bg-[hsl(var(--grade-5))]'
    },
    {
      icon: '🧩',
      title: 'ปริศนาตารางเลข',
      description: 'แก้ปริศนาตารางเลขที่ท้าทายสมอง ฝึกทักษะการคิดวิเคราะห์แบบสนุก!',
      link: '/SumGridPuzzles',
      color: 'bg-[hsl(var(--grade-4))]'
    },
    {
      icon: '📊',
      title: 'เปอร์เซ็นต์',
      description: 'เรียนรู้การคำนวณเปอร์เซ็นต์ ใช้ได้ในการซื้อของ การลดราคา และอีกมากมาย!',
      link: '/percentage',
      color: 'bg-[hsl(var(--grade-6))]'
    }
  ]
};

const Profile = () => {
  const {
    username,
    isDemo,
    logout
  } = useAuth();
  const [selectedGrade, setSelectedGrade] = useState('1');
  const [randomRecommendations, setRandomRecommendations] = useState<any[]>([]);
  const grades = [{
    id: '1',
    label: 'การบวก',
    icon: '➕',
    mascot: mascotAddition
  }, {
    id: '2',
    label: 'การลบ',
    icon: '➖',
    mascot: mascotSubtraction
  }, {
    id: '3',
    label: 'การคูณ',
    icon: '✖️',
    mascot: mascotMultiplication
  }, {
    id: '4',
    label: 'การหาร',
    icon: '➗',
    mascot: mascotDivision
  }, {
    id: '5',
    label: 'บอกเวลา',
    icon: '🕐',
    mascot: mascotTime
  }, {
    id: '6',
    label: 'บอกน้ำหนัก',
    icon: '⚖️',
    mascot: mascotWeighing
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

  // Function to shuffle array and pick 3 random items
  const getRandomRecommendations = (grade: string) => {
    const recommendations = allRecommendations[grade as keyof typeof allRecommendations] || [];
    const shuffled = [...recommendations].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
  };

  // Randomize recommendations when selectedGrade changes
  useEffect(() => {
    setRandomRecommendations(getRandomRecommendations(selectedGrade));
  }, [selectedGrade]);

  // Get grade label for display
  const getGradeLabel = (gradeId: string) => {
    const grade = grades.find(g => g.id === gradeId);
    return grade ? grade.label : '';
  };

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
              <button className="chip">ผู้ปกครอง</button>
            </div>
          </div>
        </div>

        {/* Grade Selection */}
        <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
          {grades.map(grade => (
            <button 
              key={grade.id} 
              onClick={() => setSelectedGrade(grade.id)} 
              className={`relative flex flex-col items-center gap-2 px-4 py-3 rounded-2xl transition-all duration-300 whitespace-nowrap min-w-[120px] ${
                selectedGrade === grade.id 
                  ? 'bg-gradient-to-br from-purple-400 to-pink-400 text-white shadow-lg scale-105' 
                  : 'bg-white/80 hover:bg-white hover:shadow-md'
              }`}
            >
              {/* Mascot Image */}
              <div className={`w-12 h-12 rounded-full overflow-hidden bg-white/50 flex items-center justify-center transition-transform duration-300 ${
                selectedGrade === grade.id ? 'animate-bounce' : 'hover:scale-110'
              }`}>
                <img 
                  src={grade.mascot} 
                  alt={grade.label}
                  className="w-10 h-10 object-contain"
                />
              </div>
              
              {/* Label */}
              <span className={`text-sm font-bold ${
                selectedGrade === grade.id ? 'text-white' : 'text-[hsl(var(--text-primary))]'
              }`}>
                {grade.label}
              </span>
              
              {/* Active Indicator */}
              {selectedGrade === grade.id && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-white rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Recommendation Card */}
        <div className="card-glass p-6 mb-6 border-l-4 border-orange-400">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">🎯</span>
            <h2 className="text-xl font-bold text-[hsl(var(--text-primary))]">
              แนะนำสำหรับคุณ
            </h2>
          </div>
          
          {randomRecommendations.map((recommendation, index) => (
            <div key={index} className={`${recommendation.color} rounded-xl p-6 mb-4`}>
              <h3 className="font-bold text-lg mb-2">
                {recommendation.icon} {recommendation.title}
              </h3>
              <p className="text-sm text-[hsl(var(--text-secondary))] mb-4">
                {recommendation.description}
              </p>
              <Link to={recommendation.link} className="btn-primary text-sm inline-block">
                เริ่มฝึกเลย!
              </Link>
            </div>
          ))}
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
            รายละเอียด Kidfast AI Application
          </h2>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <button className="bg-gradient-to-r from-cyan-400 via-emerald-400 to-purple-500 text-white px-6 py-3 rounded-full text-sm font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center gap-2 mx-auto">
                <span className="text-lg">✨</span>
                AI สร้างโจทย์ใหม่
              </button>
              <div className="text-sm text-[hsl(var(--text-muted))] mt-2">เทคโนโลยี</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500 mb-1">15</div>
              <div className="text-sm text-[hsl(var(--text-muted))]">บทเรียน</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500 mb-1">ไม่จำกัด</div>
              <div className="text-sm text-[hsl(var(--text-muted))]">จำนวนแบบฝึกหัด</div>
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