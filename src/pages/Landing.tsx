import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Landing = () => {
  const grades = [
    { 
      id: '1', 
      label: 'ป.1', 
      title: 'ประถม 1',
      description: 'การนับ บวก ลบ ง่ายๆ',
      color: 'bg-[hsl(var(--grade-1))]'
    },
    { 
      id: '2', 
      label: 'ป.2', 
      title: 'ประถม 2',
      description: 'บวกเลข 2 หลัก คูณ หาร',
      color: 'bg-[hsl(var(--grade-2))]'
    },
    { 
      id: '3', 
      label: 'ป.3', 
      title: 'ประถม 3',
      description: 'เตรียมทศนิยม เวลา',
      color: 'bg-[hsl(var(--grade-3))]'
    },
    { 
      id: '4', 
      label: 'ป.4', 
      title: 'ประถม 4',
      description: 'เลขยาง ที่บวกลบ ปรับค่า',
      color: 'bg-[hsl(var(--grade-4))]'
    },
    { 
      id: '5', 
      label: 'ป.5', 
      title: 'ประถม 5',
      description: 'ร้อยละ กราฟ สถิติ',
      color: 'bg-[hsl(var(--grade-5))]'
    },
    { 
      id: '6', 
      label: 'ป.6', 
      title: 'ประถม 6',
      description: 'หัดสัดส่วน เรขาคณิต',
      color: 'bg-[hsl(var(--grade-6))]'
    }
  ];

  const benefits = [
    {
      icon: '🎮',
      title: 'เรียนผ่านเกม',
      description: 'เกมเลขง่ายๆ ช่วยให้การเรียนคณิตสนุกไม่น่าเบื่อ'
    },
    {
      icon: '⚡',
      title: 'คิดเร็ว แม่นยำ',
      description: 'ฝึกใหม่การคิดคำนวณให้ไวขึ้นพร้อมความแม่นยำสูง'
    },
    {
      icon: '🏆',
      title: 'รางวัลและแต้ม',
      description: 'ระบบสะสมแต้มและสะสมแบดจ์ เพิ่มแรงจูงใจในการเรียน'
    },
    {
      icon: '🧑‍🏫',
      title: 'ครูออนไลน์',
      description: 'ผู้ช่วยเรียนซิ่งเข้าใจบริบทจะคอยช่วยส่วนที่เด็กยากจังหวะ'
    }
  ];

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="card-glass p-8 md:p-12 mb-12 text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-6 text-[hsl(var(--text-primary))]">
            🌟 เรียนคณิตแบบสนุกๆ ง่ายๆ 🌟
          </h1>
          <p className="text-lg md:text-xl text-[hsl(var(--text-secondary))] mb-8 max-w-3xl mx-auto">
            พัฒนาทักษะการคิดคำนวณสำหรับเด็กประถม ด้วยเกมและกิจกรรมสนุกๆ<br />
            ที่เตรียมไว้สำหรับน้อง ป.1 – ป.6
          </p>
          
          {/* Emoji Icons */}
          <div className="flex justify-center gap-4 text-4xl mb-8">
            <span className="animate-bounce" style={{animationDelay: '0s'}}>🎯</span>
            <span className="animate-bounce" style={{animationDelay: '0.1s'}}>🏆</span>
            <span className="animate-bounce" style={{animationDelay: '0.2s'}}>🎮</span>
            <span className="animate-bounce" style={{animationDelay: '0.3s'}}>⭐</span>
            <span className="animate-bounce" style={{animationDelay: '0.4s'}}>✍️</span>
          </div>
        </section>

        {/* Grade Selection */}
        <section className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              🏠 เลือกชั้นเรียนของคุณ
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 max-w-4xl mx-auto">
            {grades.map((grade) => (
              <Link
                key={grade.id}
                to="/signup"
                className={`grade-card ${grade.color} text-center group`}
              >
                <div className="w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold text-lg mx-auto mb-3">
                  {grade.id}
                </div>
                <h3 className="font-bold text-lg mb-2">{grade.title}</h3>
                <p className="text-sm text-[hsl(var(--text-secondary))]">{grade.description}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Benefits Section */}
        <section className="mb-12">
          <div className="card-glass p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-[hsl(var(--text-primary))] mb-4">
                🌟 ทำไมต้อง KidFast?
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.map((benefit, index) => (
                <div 
                  key={index} 
                  className="text-center p-6 rounded-2xl bg-white/50 hover:bg-white/70 transition-all duration-300 hover:scale-105"
                >
                  <div className="text-4xl mb-4">{benefit.icon}</div>
                  <h3 className="font-bold text-lg mb-3 text-[hsl(var(--text-primary))]">
                    {benefit.title}
                  </h3>
                  <p className="text-sm text-[hsl(var(--text-secondary))]">
                    {benefit.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center">
          <Link 
            to="/signup" 
            className="btn-primary text-xl px-12 py-6 inline-flex items-center gap-3"
          >
            🚀 เริ่มเรียนเลย! ฟรี! 🚀
          </Link>
          <p className="text-white/80 mt-4">ไม่มีค่าใช้จ่าย ทดลองเรียนฟรี 7 วัน!</p>
        </section>
      </main>

      {/* Floating Elements */}
      <div className="fixed top-20 left-4 text-4xl opacity-20 animate-pulse pointer-events-none">⭐</div>
      <div className="fixed top-40 right-8 text-3xl opacity-20 animate-pulse pointer-events-none" style={{animationDelay: '1s'}}>📚</div>
      <div className="fixed bottom-32 left-8 text-5xl opacity-20 animate-pulse pointer-events-none" style={{animationDelay: '2s'}}>✏️</div>
      <div className="fixed top-60 left-1/4 text-2xl opacity-20 animate-pulse pointer-events-none" style={{animationDelay: '0.5s'}}>🎯</div>
      
      <Footer />
    </div>
  );
};

export default Landing;