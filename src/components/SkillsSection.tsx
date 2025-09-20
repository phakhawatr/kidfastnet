import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Minus, X, Divide, Sigma, Table, Clock, Ruler, Scale, Zap, Eye } from 'lucide-react';
import SubtractionModal from './SubtractionModal';
type Skill = {
  icon: React.ComponentType<any>;
  title: string;
  desc: string;
  from: string;
  to: string;
  sticker?: string;
  hrefPreview?: string;
};
interface SkillsSectionProps {
  skills?: Skill[];
  onPreview?: (skill: Skill) => void;
}
const defaultSkills: Skill[] = [{
  icon: Plus,
  title: 'บวก',
  desc: 'ฝึกการบวกเลขพื้นฐาน เริ่มต้นจากเลขง่ายๆ ไปจนถึงเลขหลายหลัก',
  from: 'from-pink-100',
  to: 'to-red-100',
  sticker: '🧮',
  hrefPreview: '#'
}, {
  icon: Minus,
  title: 'ลบ',
  desc: 'เรียนรู้การลบเลข พัฒนาทักษะการคิดคำนวณแบบย้อนกลับ',
  from: 'from-blue-100',
  to: 'to-cyan-100',
  sticker: '🧠',
  hrefPreview: '/subtraction'
}, {
  icon: X,
  title: 'คูณ',
  desc: 'สนุกกับการคูณ เรียนรู้แม่สูตรคูณผ่านเกมและกิจกรรม',
  from: 'from-amber-100',
  to: 'to-orange-100',
  sticker: '🐯',
  hrefPreview: '#'
}, {
  icon: Divide,
  title: 'หาร',
  desc: 'ทำความเข้าใจการหาร แบ่งปันและกระจายตัวเลขอย่างสนุก',
  from: 'from-green-100',
  to: 'to-emerald-100',
  sticker: '🦊',
  hrefPreview: '#'
}, {
  icon: Sigma,
  title: 'เลขอนุกรม',
  desc: 'ค้นหาความสัมพันธ์ของตัวเลข เรียนรู้รูปแบบและลำดับ',
  from: 'from-violet-100',
  to: 'to-indigo-100',
  sticker: '🧩',
  hrefPreview: '#'
}, {
  icon: Table,
  title: 'ตาราง',
  desc: 'จดจำสูตรคูณด้วยตารางสีสันสวยงาม เรียนรู้แบบเป็นระบบ',
  from: 'from-sky-100',
  to: 'to-teal-100',
  sticker: '🐼',
  hrefPreview: '#'
}, {
  icon: Clock,
  title: 'เวลา',
  desc: 'เรียนรู้การอ่านเวลา เข้าใจนาฬิกาและการจัดการเวลา',
  from: 'from-yellow-100',
  to: 'to-lime-100',
  sticker: '⏰',
  hrefPreview: '#'
}, {
  icon: Ruler,
  title: 'ขนาด/ความยาว',
  desc: 'วัดและเปรียบเทียบขนาด เรียนรู้หน่วยการวัดต่างๆ',
  from: 'from-fuchsia-100',
  to: 'to-pink-100',
  sticker: '📏',
  hrefPreview: '#'
}, {
  icon: Scale,
  title: 'ชั่งน้ำหนัก',
  desc: 'เรียนรู้การชั่งน้ำหนัก เปรียบเทียบมวลและความหนัก',
  from: 'from-rose-100',
  to: 'to-purple-100',
  sticker: '⚖️',
  hrefPreview: '#'
}, {
  icon: Zap,
  title: 'คิดเร็ว',
  desc: 'ฝึกการคิดคำนวณแบบรวดเร็ว พัฒนาทักษะแก้ปัญหา',
  from: 'from-neutral-100',
  to: 'to-stone-100',
  sticker: '🚀',
  hrefPreview: '#'
}];
const SkillCard: React.FC<{
  skill: Skill;
  onPreview?: (skill: Skill) => void;
}> = ({
  skill,
  onPreview
}) => {
  const handlePreviewClick = (e: React.MouseEvent) => {
    if (onPreview) {
      e.preventDefault();
      onPreview(skill);
    }
  };
  const IconComponent = skill.icon;
  return <div className={`relative rounded-2xl shadow-lg hover:-translate-y-1 hover:shadow-xl transition-all duration-300 bg-gradient-to-br ${skill.from} ${skill.to} ring-1 ring-black/5 p-6`} role="button" tabIndex={0}>
      {/* Sticker emoji */}
      {skill.sticker && <div className="absolute top-3 right-3 text-2xl animate-bounce" aria-hidden="true">
          {skill.sticker}
        </div>}

      {/* Icon container */}
      <div className="flex items-center justify-center w-12 h-12 mb-4 bg-white/70 ring-1 ring-black/10 backdrop-blur rounded-xl">
        <IconComponent className="w-6 h-6 text-gray-700" />
      </div>

      {/* Content */}
      <div className="mb-6">
        <h3 className="font-extrabold text-lg text-gray-800 mb-2">
          {skill.title}
        </h3>
        <p className="text-sm leading-6 text-gray-600">
          {skill.desc}
        </p>
      </div>

      {/* Preview button */}
      <Link to={skill.hrefPreview || '#'} onClick={handlePreviewClick} className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-fuchsia-500 to-indigo-500 hover:from-fuchsia-400 hover:to-indigo-400 text-white text-sm font-medium rounded-full shadow-md ring-1 ring-black/10 hover:-translate-y-0.5 transition-all duration-200" aria-label={`เริ่มทำแบบฝึกหัด ${skill.title}`}>
        <Eye className="w-4 h-4" />
        เริ่มทำแบบฝึกหัด
      </Link>
    </div>;
};
const SkillsSection: React.FC<SkillsSectionProps> = ({
  skills = defaultSkills,
  onPreview
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSkillClick = (skill: Skill) => {
    if (skill.title === 'ลบ') {
      setIsModalOpen(true);
    } else if (onPreview) {
      onPreview(skill);
    }
  };

  return <section className="mb-12">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
          🎯 ความรู้และทักษะของคุณ
        </h2>
        <p className="text-white/80 text-lg max-w-2xl mx-auto">— เลือกทักษะที่อยากฝึกฝน — </p>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {skills.map((skill, index) => <SkillCard key={index} skill={skill} onPreview={handleSkillClick} />)}
        </div>
      </div>
      
      <SubtractionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </section>;
};
export default SkillsSection;