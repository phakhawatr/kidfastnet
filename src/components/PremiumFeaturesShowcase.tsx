import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Crown, Sparkles, Brain, FlaskConical, Wallet, Calculator, Users, Lock, ChevronRight, Star, Rocket, Zap } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Import mascot images
import mascotAddition from '@/assets/mascot-addition.png';
import mascotMultiplication from '@/assets/mascot-multiplication.png';
import mascotFractions from '@/assets/mascot-fractions.png';
import mascotMoney from '@/assets/mascot-money.png';
import mascotMeasurement from '@/assets/mascot-measurement.png';
import mascotShapes from '@/assets/mascot-shapes.png';
import mascotTime from '@/assets/mascot-time.png';
import mascotWeighing from '@/assets/mascot-weighing.png';
import logoAiBrain from '@/assets/logo-ai-brain.png';

interface FeatureCardProps {
  icon: string;
  mascotImage?: string;
  title: string;
  description: string;
  badge?: string;
  badgeColor?: string;
  isActive?: boolean;
  link?: string;
  isNew?: boolean;
  isPopular?: boolean;
}

const FeatureCard = ({ 
  icon, 
  mascotImage, 
  title, 
  description, 
  badge, 
  badgeColor = 'bg-yellow-400 text-yellow-900',
  isActive = false, 
  link,
  isNew = false,
  isPopular = false
}: FeatureCardProps) => {
  const CardContent = () => (
    <div className={`relative group h-full rounded-2xl p-5 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-2xl overflow-hidden ${
      isActive 
        ? 'bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 text-white' 
        : 'bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800'
    }`}>
      {/* Badges */}
      <div className="absolute top-3 right-3 flex flex-col gap-1 items-end z-10">
        {isNew && (
          <span className="bg-gradient-to-r from-green-400 to-emerald-500 text-white px-2 py-0.5 rounded-full text-xs font-bold shadow-md animate-pulse">
            ใหม่!
          </span>
        )}
        {isPopular && (
          <span className="bg-gradient-to-r from-orange-400 to-red-500 text-white px-2 py-0.5 rounded-full text-xs font-bold shadow-md">
            ยอดนิยม
          </span>
        )}
        {badge && (
          <span className={`${badgeColor} px-2 py-0.5 rounded-full text-xs font-bold shadow-md`}>
            {badge}
          </span>
        )}
      </div>

      {/* Lock icon for inactive */}
      {!isActive && (
        <div className="absolute top-3 left-3 z-10">
          <div className="bg-gray-800/80 text-white p-1.5 rounded-full">
            <Lock className="w-3 h-3" />
          </div>
        </div>
      )}

      {/* Mascot or Icon */}
      <div className="flex justify-center mb-4">
        {mascotImage ? (
          <div className="w-20 h-20 rounded-full overflow-hidden bg-white/20 shadow-lg">
            <img 
              src={mascotImage} 
              alt={title}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className={`text-5xl ${!isActive && 'opacity-70'}`}>
            {icon}
          </div>
        )}
      </div>

      {/* Title */}
      <h3 className={`font-bold text-lg mb-2 text-center ${
        isActive ? 'text-white' : 'text-[hsl(var(--text-primary))]'
      }`}>
        {title}
      </h3>

      {/* Description */}
      <p className={`text-sm text-center leading-relaxed ${
        isActive ? 'text-white/90' : 'text-[hsl(var(--text-secondary))]'
      }`}>
        {description}
      </p>

      {/* CTA for active */}
      {isActive && link && (
        <div className="mt-4 text-center">
          <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium group-hover:bg-white/30 transition-colors">
            เริ่มเลย <ChevronRight className="w-4 h-4" />
          </span>
        </div>
      )}
    </div>
  );

  if (link && isActive) {
    return (
      <Link to={link} className="block h-full">
        <CardContent />
      </Link>
    );
  }

  return <CardContent />;
};

interface FeatureItem {
  icon: string;
  mascotImage?: string;
  title: string;
  description: string;
  badge?: string;
  badgeColor?: string;
  isActive?: boolean;
  link?: string;
  isNew?: boolean;
  isPopular?: boolean;
}

const PremiumFeaturesShowcase = () => {
  const { t, i18n } = useTranslation('landing');
  const [activeTab, setActiveTab] = useState('ai');

  const categories = [
    { id: 'ai', icon: <Brain className="w-4 h-4" />, label: i18n.language === 'th' ? '🤖 AI Features' : '🤖 AI Features' },
    { id: 'stem', icon: <FlaskConical className="w-4 h-4" />, label: i18n.language === 'th' ? '🔬 STEM Hub' : '🔬 STEM Hub' },
    { id: 'realworld', icon: <Wallet className="w-4 h-4" />, label: i18n.language === 'th' ? '💰 ทักษะชีวิต' : '💰 Life Skills' },
    { id: 'advanced', icon: <Calculator className="w-4 h-4" />, label: i18n.language === 'th' ? '🧮 คณิตขั้นสูง' : '🧮 Advanced' },
    { id: 'parents', icon: <Users className="w-4 h-4" />, label: i18n.language === 'th' ? '👨‍👩‍👧 ผู้ปกครอง' : '👨‍👩‍👧 Parents' },
  ];

  const aiFeatures: FeatureItem[] = [
    {
      icon: '🤖',
      mascotImage: logoAiBrain,
      title: i18n.language === 'th' ? 'AI ครูคณิตศาสตร์' : 'AI Math Tutor',
      description: i18n.language === 'th' 
        ? 'คุณครู AI พร้อมตอบคำถาม อธิบายโจทย์ และให้คำแนะนำเป็นภาษาไทย' 
        : 'AI teacher ready to answer questions and explain problems in Thai',
      isActive: true,
      link: '/ai-math-tutor',
      isPopular: true,
    },
    {
      icon: '📚',
      title: i18n.language === 'th' ? 'AI สร้างแผนการสอน' : 'AI Lesson Planner',
      description: i18n.language === 'th' 
        ? 'สร้างแผนการเรียนรู้ที่เหมาะกับเด็กแต่ละคน' 
        : 'Create personalized learning plans for each child',
      isActive: true,
      link: '/ai-lesson-planner',
      isNew: true,
    },
    {
      icon: '🎯',
      title: i18n.language === 'th' ? 'AI วิเคราะห์จุดอ่อน' : 'AI Weakness Analysis',
      description: i18n.language === 'th' 
        ? 'วิเคราะห์ผลการเรียนและแนะนำทักษะที่ต้องพัฒนา' 
        : 'Analyze learning results and recommend skills to improve',
      isActive: true,
      link: '/adaptive-learning',
    },
    {
      icon: '📊',
      title: i18n.language === 'th' ? 'AI สร้างโจทย์ Adaptive' : 'AI Adaptive Problems',
      description: i18n.language === 'th' 
        ? 'สร้างโจทย์ที่ปรับความยากตามระดับความสามารถ' 
        : 'Create problems that adapt to ability level',
      isActive: true,
      link: '/adaptive-learning',
    },
  ];

  const stemFeatures: FeatureItem[] = [
    {
      icon: '⚗️',
      title: i18n.language === 'th' ? 'ห้องทดลองวิทยาศาสตร์' : 'Science Lab',
      description: i18n.language === 'th' 
        ? 'การทดลองวิทยาศาสตร์แบบ Interactive' 
        : 'Interactive science experiments',
      isActive: true,
      link: '/science-lab',
      isNew: true,
    },
    {
      icon: '🔬',
      title: i18n.language === 'th' ? 'ห้องทดลองฟิสิกส์' : 'Physics Lab',
      description: i18n.language === 'th' 
        ? 'เรียนรู้หลักฟิสิกส์ผ่านการทดลองจำลอง' 
        : 'Learn physics through simulated experiments',
      isActive: true,
      link: '/physics-lab',
    },
    {
      icon: '🧪',
      title: i18n.language === 'th' ? 'ห้องทดลองเคมี' : 'Chemistry Lab',
      description: i18n.language === 'th' 
        ? 'ทดลองผสมสารเคมีอย่างปลอดภัย' 
        : 'Safely mix chemicals in virtual lab',
      isActive: true,
      link: '/chemistry-lab',
    },
    {
      icon: '🔭',
      title: i18n.language === 'th' ? 'ห้องดาราศาสตร์' : 'Astronomy Lab',
      description: i18n.language === 'th' 
        ? 'สำรวจดวงดาวและจักรวาล' 
        : 'Explore stars and the universe',
      isActive: true,
      link: '/astronomy-lab',
    },
    {
      icon: '🧬',
      title: i18n.language === 'th' ? 'ห้องชีววิทยา' : 'Biology Lab',
      description: i18n.language === 'th' 
        ? 'เรียนรู้เกี่ยวกับสิ่งมีชีวิต' 
        : 'Learn about living things',
      isActive: true,
      link: '/biology-lab',
    },
    {
      icon: '🔧',
      title: i18n.language === 'th' ? 'วิศวกรรมท้าทาย' : 'Engineering Challenges',
      description: i18n.language === 'th' 
        ? 'สร้างและแก้ปัญหาแบบวิศวกร' 
        : 'Build and solve problems like engineers',
      isActive: true,
      link: '/engineering-challenges',
    },
    {
      icon: '💻',
      title: i18n.language === 'th' ? 'พื้นฐานโค้ดดิ้ง' : 'Coding Basics',
      description: i18n.language === 'th' 
        ? 'เริ่มต้นเรียนรู้การเขียนโปรแกรม' 
        : 'Start learning programming',
      isActive: true,
      link: '/coding-basics',
      isPopular: true,
    },
  ];

  const realworldFeatures: FeatureItem[] = [
    {
      icon: '💰',
      mascotImage: mascotMoney,
      title: i18n.language === 'th' ? 'เรียนรู้เรื่องเงิน' : 'Money Learning',
      description: i18n.language === 'th' 
        ? 'นับเงิน ทอนเงิน และจำลองการซื้อขาย' 
        : 'Count money, give change, and simulate shopping',
      isActive: true,
      link: '/money',
      isPopular: true,
    },
    {
      icon: '⏰',
      mascotImage: mascotTime,
      title: i18n.language === 'th' ? 'บอกเวลา' : 'Telling Time',
      description: i18n.language === 'th' 
        ? 'เรียนรู้การอ่านนาฬิกาและบอกเวลา' 
        : 'Learn to read clocks and tell time',
      isActive: true,
      link: '/time',
    },
    {
      icon: '⚖️',
      mascotImage: mascotWeighing,
      title: i18n.language === 'th' ? 'ชั่งน้ำหนัก' : 'Weighing',
      description: i18n.language === 'th' 
        ? 'อ่านค่าน้ำหนักจากตาชั่ง' 
        : 'Read weight from scales',
      isActive: true,
      link: '/weighing',
    },
    {
      icon: '📏',
      mascotImage: mascotMeasurement,
      title: i18n.language === 'th' ? 'วัดความยาว' : 'Measurement',
      description: i18n.language === 'th' 
        ? 'ฝึกวัดความยาวด้วยไม้บรรทัด' 
        : 'Practice measuring with rulers',
      isActive: true,
      link: '/measurement',
    },
    {
      icon: '📐',
      title: i18n.language === 'th' ? 'เปรียบเทียบความยาว' : 'Compare Lengths',
      description: i18n.language === 'th' 
        ? 'เปรียบเทียบสิ่งของว่าอะไรยาว/สั้นกว่า' 
        : 'Compare objects - which is longer/shorter',
      isActive: true,
      link: '/length-comparison',
    },
  ];

  const advancedFeatures: FeatureItem[] = [
    {
      icon: '🔢',
      title: i18n.language === 'th' ? 'ค่าประจำหลัก' : 'Place Value',
      description: i18n.language === 'th' 
        ? 'เรียนรู้หลักหน่วย สิบ ร้อย พัน' 
        : 'Learn ones, tens, hundreds, thousands',
      isActive: true,
      link: '/place-value',
    },
    {
      icon: '🧩',
      title: i18n.language === 'th' ? 'Number Bonds' : 'Number Bonds',
      description: i18n.language === 'th' 
        ? 'ฝึกการแยกและรวมจำนวน' 
        : 'Practice breaking and combining numbers',
      isActive: true,
      link: '/number-bonds',
    },
    {
      icon: '🍕',
      mascotImage: mascotFractions,
      title: i18n.language === 'th' ? 'เศษส่วน' : 'Fractions',
      description: i18n.language === 'th' 
        ? 'เรียนรู้เศษส่วนจากภาพและรูปทรง' 
        : 'Learn fractions from pictures and shapes',
      isActive: true,
      link: '/fraction-shapes',
      isPopular: true,
    },
    {
      icon: '%',
      title: i18n.language === 'th' ? 'เปอร์เซ็นต์' : 'Percentages',
      description: i18n.language === 'th' 
        ? 'คำนวณเปอร์เซ็นต์และส่วนลด' 
        : 'Calculate percentages and discounts',
      isActive: true,
      link: '/percentage',
      isNew: true,
    },
    {
      icon: '📝',
      title: i18n.language === 'th' ? 'โจทย์ปัญหา' : 'Word Problems',
      description: i18n.language === 'th' 
        ? 'ฝึกแก้โจทย์ปัญหาคณิตศาสตร์' 
        : 'Practice solving math word problems',
      isActive: true,
      link: '/word-problems',
    },
    {
      icon: '🧠',
      title: i18n.language === 'th' ? 'คิดเลขเร็ว' : 'Mental Math',
      description: i18n.language === 'th' 
        ? 'ฝึกคิดเลขในใจให้ไวขึ้น' 
        : 'Practice faster mental calculations',
      isActive: true,
      link: '/mental-math',
    },
  ];

  const parentFeatures: FeatureItem[] = [
    {
      icon: '📊',
      title: i18n.language === 'th' ? 'รายงานความก้าวหน้า' : 'Progress Reports',
      description: i18n.language === 'th' 
        ? 'ติดตามผลการเรียนของลูกแบบ Real-time' 
        : 'Track your child\'s learning progress in real-time',
      isActive: true,
      link: '/child-progress',
      isPopular: true,
    },
    {
      icon: '📅',
      title: i18n.language === 'th' ? 'ปฏิทินฝึกซ้อม' : 'Training Calendar',
      description: i18n.language === 'th' 
        ? 'วางแผนการฝึกซ้อมรายวัน/รายสัปดาห์' 
        : 'Plan daily/weekly practice sessions',
      isActive: true,
      link: '/training-calendar',
    },
    {
      icon: '🎯',
      title: i18n.language === 'th' ? 'ภารกิจรายวัน' : 'Daily Missions',
      description: i18n.language === 'th' 
        ? 'ภารกิจที่ AI เลือกให้เหมาะกับลูก' 
        : 'AI-selected missions suited for your child',
      isActive: true,
      link: '/today-focus',
      isNew: true,
    },
    {
      icon: '📱',
      title: i18n.language === 'th' ? 'แจ้งเตือน LINE' : 'LINE Notifications',
      description: i18n.language === 'th' 
        ? 'รับแจ้งเตือนผลการเรียนผ่าน LINE' 
        : 'Receive learning notifications via LINE',
      isActive: true,
      link: '/profile',
    },
  ];

  const stats = [
    { value: '40+', label: i18n.language === 'th' ? 'กิจกรรมการเรียนรู้' : 'Learning Activities' },
    { value: '8', label: i18n.language === 'th' ? 'ห้องทดลอง STEM' : 'STEM Labs' },
    { value: '∞', label: i18n.language === 'th' ? 'AI สร้างโจทย์ไม่จำกัด' : 'Unlimited AI Problems' },
    { value: '24/7', label: i18n.language === 'th' ? 'ติดตามผลเรียน' : 'Learning Tracking' },
  ];

  const renderFeatures = (features: typeof aiFeatures) => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {features.map((feature, index) => (
        <FeatureCard key={index} {...feature} />
      ))}
    </div>
  );

  return (
    <section className="mb-12">
      <div className="card-glass p-6 md:p-8 border-4 border-purple-400/50 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-orange-500/10 to-yellow-500/10 rounded-full blur-3xl -z-10" />

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <Crown className="w-6 h-6 text-yellow-500" />
            <span className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white px-6 py-2 rounded-full text-lg font-bold shadow-lg">
              {t('premiumFeatures.badge')}
            </span>
            <Crown className="w-6 h-6 text-yellow-500" />
          </div>
          
          <h2 className="text-2xl md:text-3xl font-bold text-[hsl(var(--text-primary))] mb-4">
            <span dangerouslySetInnerHTML={{ __html: t('premiumFeatures.title') }} />
          </h2>
          
          <p className="text-lg text-[hsl(var(--text-secondary))] max-w-3xl mx-auto">
            {t('premiumFeatures.subtitle')}
          </p>
        </div>

        {/* Stats Banner */}
        <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-2xl p-1 mb-8">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl md:text-3xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-sm text-[hsl(var(--text-secondary))]">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full flex flex-wrap justify-center gap-2 bg-transparent h-auto mb-6">
            {categories.map((cat) => (
              <TabsTrigger
                key={cat.id}
                value={cat.id}
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white px-4 py-2 rounded-full text-sm font-medium transition-all"
              >
                {cat.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="ai" className="mt-0">
            {renderFeatures(aiFeatures)}
          </TabsContent>

          <TabsContent value="stem" className="mt-0">
            {renderFeatures(stemFeatures)}
          </TabsContent>

          <TabsContent value="realworld" className="mt-0">
            {renderFeatures(realworldFeatures)}
          </TabsContent>

          <TabsContent value="advanced" className="mt-0">
            {renderFeatures(advancedFeatures)}
          </TabsContent>

          <TabsContent value="parents" className="mt-0">
            {renderFeatures(parentFeatures)}
          </TabsContent>
        </Tabs>

        {/* Upgrade CTA */}
        <div className="mt-8 text-center">
          <div className="inline-block bg-gradient-to-r from-yellow-100 via-orange-100 to-pink-100 dark:from-yellow-900/30 dark:via-orange-900/30 dark:to-pink-900/30 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              <span className="text-lg font-bold text-[hsl(var(--text-primary))]">
                {i18n.language === 'th' ? 'ปลดล็อกทุกฟีเจอร์วันนี้!' : 'Unlock All Features Today!'}
              </span>
              <Sparkles className="w-5 h-5 text-yellow-500" />
            </div>
            <p className="text-sm text-[hsl(var(--text-secondary))] mb-4">
              {i18n.language === 'th' 
                ? 'เริ่มต้นเพียง ฿199/เดือน หรือ ฿399/6 เดือน (ประหยัด 67%!)'
                : 'Starting at ฿199/month or ฿399/6 months (Save 67%!)'}
            </p>
            <Link 
              to="/profile?tab=subscription"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-lg px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <Rocket className="w-5 h-5" />
              <span>{t('premiumFeatures.upgradeButton')}</span>
              <Crown className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Trust badges */}
        <div className="mt-6 flex flex-wrap justify-center gap-4">
          <div className="flex items-center gap-2 text-sm text-[hsl(var(--text-secondary))] bg-white/50 dark:bg-gray-800/50 px-4 py-2 rounded-full">
            <Star className="w-4 h-4 text-yellow-500" />
            <span>{i18n.language === 'th' ? 'เชื่อมั่นโดย 500+ ครอบครัว' : 'Trusted by 500+ families'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-[hsl(var(--text-secondary))] bg-white/50 dark:bg-gray-800/50 px-4 py-2 rounded-full">
            <Zap className="w-4 h-4 text-orange-500" />
            <span>{i18n.language === 'th' ? 'ยกเลิกได้ทุกเมื่อ' : 'Cancel anytime'}</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PremiumFeaturesShowcase;
