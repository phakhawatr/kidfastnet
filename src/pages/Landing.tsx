import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SkillsSection from '../components/SkillsSection';
const Landing = () => {
  const benefits = [{
    icon: '🎮',
    title: 'เรียนผ่านเกม',
    description: 'เกมเลขง่ายๆ ช่วยให้การเรียนคณิตสนุกไม่น่าเบื่อ'
  }, {
    icon: '⚡',
    title: 'คิดเร็ว แม่นยำ',
    description: 'ฝึกใหม่การคิดคำนวณให้ไวขึ้นพร้อมความแม่นยำสูง'
  }, {
    icon: '🏆',
    title: 'รางวัลและแต้ม',
    description: 'ระบบสะสมแต้มและสะสมแบดจ์ เพิ่มแรงจูงใจในการเรียน'
  }, {
    icon: '🧑‍🏫',
    title: 'ครูออนไลน์',
    description: 'ผู้ช่วยเรียนซิ่งเข้าใจบริบทจะคอยช่วยส่วนที่เด็กยากจังหวะ'
  }];
  return <div className="min-h-screen">
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
            <span className="animate-bounce" style={{
            animationDelay: '0s'
          }}>🎯</span>
            <span className="animate-bounce" style={{
            animationDelay: '0.1s'
          }}>🏆</span>
            <span className="animate-bounce" style={{
            animationDelay: '0.2s'
          }}>🎮</span>
            <span className="animate-bounce" style={{
            animationDelay: '0.3s'
          }}>⭐</span>
            <span className="animate-bounce" style={{
            animationDelay: '0.4s'
          }}>✍️</span>
          </div>
        </section>

        {/* Skills Section */}
        <SkillsSection buttonText="ดูตัวอย่างแบบฝึกหัด" />

        {/* Benefits Section */}
        <section className="mb-12">
          <div className="card-glass p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-[hsl(var(--text-primary))] mb-4">
                🌟 ทำไมต้อง KidFast?
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.map((benefit, index) => <div key={index} className="text-center p-6 rounded-2xl bg-white/50 hover:bg-white/70 transition-all duration-300 hover:scale-105">
                  <div className="text-4xl mb-4">{benefit.icon}</div>
                  <h3 className="font-bold text-lg mb-3 text-[hsl(var(--text-primary))]">
                    {benefit.title}
                  </h3>
                  <p className="text-sm text-[hsl(var(--text-secondary))]">
                    {benefit.description}
                  </p>
                </div>)}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center">
          <div className="p-8 md:p-12 rounded-2xl border border-white/20 backdrop-blur-sm shadow-[0_8px_30px_hsl(251_100%_69%/0.15)]">
            <Link 
              to="/signup" 
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400 text-white font-medium text-lg md:text-xl px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 animate-pulse-slow drop-shadow-sm"
            >
              ✨ สมัครสมาชิกเลย ! ✨
            </Link>
            <p className="text-sm text-[hsl(var(--text-secondary))] mt-4">
              เริ่มต้นการเรียนรู้ที่สนุกได้เลย!
            </p>
          </div>
        </section>
      </main>

      {/* Floating Elements */}
      <div className="fixed top-20 left-4 text-4xl opacity-20 animate-pulse pointer-events-none">⭐</div>
      <div className="fixed top-40 right-8 text-3xl opacity-20 animate-pulse pointer-events-none" style={{
      animationDelay: '1s'
    }}>📚</div>
      <div className="fixed bottom-32 left-8 text-5xl opacity-20 animate-pulse pointer-events-none" style={{
      animationDelay: '2s'
    }}>✏️</div>
      <div className="fixed top-60 left-1/4 text-2xl opacity-20 animate-pulse pointer-events-none" style={{
      animationDelay: '0.5s'
    }}>🎯</div>
      
      <Footer />
    </div>;
};
export default Landing;