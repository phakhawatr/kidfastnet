import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Minus, X, Divide, Sigma, Table, Clock, Ruler, Scale, Zap, Eye, Hash, Shapes, Percent, ArrowLeftRight, Calculator } from 'lucide-react';

// Import mascot images
import additionMascot from '../assets/mascot-addition.png';
import subtractionMascot from '../assets/mascot-subtraction.png';
import multiplicationMascot from '../assets/mascot-multiplication.png';
import divisionMascot from '../assets/mascot-division.png';
import timeMascot from '../assets/mascot-time.png';
import fractionsMascot from '../assets/mascot-fractions.png';
import shapesMascot from '../assets/mascot-shapes.png';
import measurementMascot from '../assets/mascot-measurement.png';
import weighingMascot from '../assets/mascot-weighing.png';
type Skill = {
  icon: React.ComponentType<any>;
  title: string;
  desc: string;
  backgroundGradient: string;
  textColor: string;
  sticker?: string;
  hrefPreview?: string;
  mascotImage?: string;
};
interface SkillsSectionProps {
  skills?: Skill[];
  onPreview?: (skill: Skill) => void;
  buttonText?: string;
}
const defaultSkills: Skill[] = [{
  icon: Plus,
  title: 'บวก',
  desc: 'ฝึกการบวกเลขพื้นฐาน เริ่มต้นจากเลขง่ายๆ ไปจนถึงเลขหลายหลัก',
  backgroundGradient: 'bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600',
  textColor: 'text-white',
  sticker: '🧮',
  hrefPreview: '/addition',
  mascotImage: additionMascot
}, {
  icon: Minus,
  title: 'ลบ',
  desc: 'เรียนรู้การลบเลข พัฒนาทักษะการคิดคำนวณแบบย้อนกลับ',
  backgroundGradient: 'bg-gradient-to-br from-purple-400 via-purple-500 to-indigo-600',
  textColor: 'text-white',
  sticker: '🧠',
  hrefPreview: '/subtraction',
  mascotImage: subtractionMascot
}, {
  icon: X,
  title: 'คูณ',
  desc: 'สนุกกับการคูณ เรียนรู้แม่สูตรคูณผ่านเกมและกิจกรรม',
  backgroundGradient: 'bg-gradient-to-br from-orange-400 via-orange-500 to-red-500',
  textColor: 'text-white',
  sticker: '🐯',
  hrefPreview: '#',
  mascotImage: multiplicationMascot
}, {
  icon: Divide,
  title: 'หาร',
  desc: 'ทำความเข้าใจการหาร แบ่งปันและกระจายตัวเลขอย่างสนุก',
  backgroundGradient: 'bg-gradient-to-br from-green-400 via-green-500 to-emerald-600',
  textColor: 'text-white',
  sticker: '🦊',
  hrefPreview: '#',
  mascotImage: divisionMascot
}, {
  icon: Sigma,
  title: 'เลขอนุกรม',
  desc: 'ค้นหาความสัมพันธ์ของตัวเลข เรียนรู้รูปแบบและลำดับ',
  backgroundGradient: 'bg-gradient-to-br from-violet-400 via-purple-500 to-indigo-600',
  textColor: 'text-white',
  sticker: '🧩',
  hrefPreview: '#'
}, {
  icon: Table,
  title: 'ตาราง',
  desc: 'จดจำสูตรคูณด้วยตารางสีสันสวยงาม เรียนรู้แบบเป็นระบบ',
  backgroundGradient: 'bg-gradient-to-br from-sky-400 via-cyan-500 to-teal-600',
  textColor: 'text-white',
  sticker: '🐼',
  hrefPreview: '/multiplication-table'
}, {
  icon: Clock,
  title: 'เวลา',
  desc: 'เรียนรู้การอ่านเวลา เข้าใจนาฬิกาและการจัดการเวลา',
  backgroundGradient: 'bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500',
  textColor: 'text-white',
  sticker: '⏰',
  hrefPreview: '/time',
  mascotImage: timeMascot
}, {
  icon: Ruler,
  title: 'ขนาด/ความยาว',
  desc: 'วัดและเปรียบเทียบขนาด เรียนรู้หน่วยการวัดต่างๆ',
  backgroundGradient: 'bg-gradient-to-br from-pink-400 via-pink-500 to-fuchsia-600',
  textColor: 'text-white',
  sticker: '📏',
  hrefPreview: '/measurement',
  mascotImage: measurementMascot
}, {
  icon: Scale,
  title: 'ชั่งน้ำหนัก',
  desc: 'เรียนรู้การชั่งน้ำหนัก เปรียบเทียบมวลและความหนัก',
  backgroundGradient: 'bg-gradient-to-br from-rose-400 via-pink-500 to-purple-600',
  textColor: 'text-white',
  sticker: '⚖️',
  hrefPreview: '/weighing',
  mascotImage: weighingMascot
}, {
  icon: Zap,
  title: 'การวัดด้วยไม้บันทัด',
  desc: 'ฝึกการวัดความยาวด้วยไม้บรรทัด เรียนรู้การแปลงหน่วย',
  backgroundGradient: 'bg-gradient-to-br from-slate-400 via-gray-500 to-zinc-600',
  textColor: 'text-white',
  sticker: '📏',
  hrefPreview: '/quick-math'
}, {
  icon: Hash,
  title: 'การนับ',
  desc: 'ฝึกทักษะการนับตัวเลข เรียนรู้การนับไปข้างหน้าและย้อนกลับ',
  backgroundGradient: 'bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600',
  textColor: 'text-white',
  sticker: '🔢',
  hrefPreview: '#'
}, {
  icon: Shapes,
  title: 'รูปทรง',
  desc: 'จดจำรูปทรงเรขาคณิต เรียนรู้คุณสมบัติของรูปต่างๆ',
  backgroundGradient: 'bg-gradient-to-br from-teal-400 via-green-500 to-emerald-600',
  textColor: 'text-white',
  sticker: '🔷',
  hrefPreview: '/shape-matching',
  mascotImage: shapesMascot
}, {
  icon: Calculator,
  title: 'เศษส่วน',
  desc: 'ทำความเข้าใจเศษส่วน เรียนรู้การแบ่งส่วนและเปรียบเทียบ',
  backgroundGradient: 'bg-gradient-to-br from-purple-400 via-violet-500 to-purple-600',
  textColor: 'text-white',
  sticker: '🍰',
  hrefPreview: '/fraction-matching',
  mascotImage: fractionsMascot
}, {
  icon: Percent,
  title: 'ร้อยละ',
  desc: 'เรียนรู้การคำนวณร้อยละ เข้าใจการแปลงเป็นทศนิยม',
  backgroundGradient: 'bg-gradient-to-br from-red-400 via-rose-500 to-pink-600',
  textColor: 'text-white',
  sticker: '💯',
  hrefPreview: '#'
}, {
  icon: ArrowLeftRight,
  title: 'เปรียบเทียบความยาว',
  desc: 'เปรียบเทียบความยาวของวัตถุ เรียนรู้การเรียงลำดับ',
  backgroundGradient: 'bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500',
  textColor: 'text-white',
  sticker: '↔️',
  hrefPreview: '/length-comparison'
}];
const SkillCard: React.FC<{
  skill: Skill;
  onPreview?: (skill: Skill) => void;
  buttonText?: string;
}> = ({
  skill,
  onPreview,
  buttonText = 'เริ่มทำแบบฝึกหัด'
}) => {
  const handlePreviewClick = (e: React.MouseEvent) => {
    if (onPreview) {
      e.preventDefault();
      onPreview(skill);
    }
  };

  return (
    <div 
      className={`relative rounded-3xl shadow-xl hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 ${skill.backgroundGradient} overflow-hidden group cursor-pointer`} 
      role="button" 
      tabIndex={0}
    >
      {/* Mascot Image */}
      <div className="absolute top-4 right-4 w-16 h-16 z-10">
        {skill.mascotImage ? (
          <img 
            src={skill.mascotImage} 
            alt={`${skill.title} mascot`}
            className="w-full h-full object-cover rounded-2xl shadow-lg"
          />
        ) : (
          <div className="w-full h-full bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
            <span className="text-2xl">{skill.sticker}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6 pt-8 pb-20 relative z-5">
        <h3 className={`font-bold text-xl mb-3 ${skill.textColor} drop-shadow-sm`}>
          {skill.title}
        </h3>
        <p className={`text-sm leading-relaxed ${skill.textColor} opacity-90`}>
          {skill.desc}
        </p>
      </div>

      {/* Bottom Badge */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-medium text-center shadow-lg">
          KidFast.net
        </div>
      </div>

      {/* Preview button - appears on hover */}
      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center rounded-3xl">
        <Link 
          to={skill.hrefPreview || '#'} 
          onClick={handlePreviewClick}
          className="bg-white text-gray-800 px-6 py-3 rounded-full font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
          aria-label={`${buttonText} ${skill.title}`}
        >
          <Eye className="w-4 h-4" />
          {buttonText}
        </Link>
      </div>
    </div>
  );
};
const SkillsSection: React.FC<SkillsSectionProps> = ({
  skills = defaultSkills,
  onPreview,
  buttonText = 'เริ่มทำแบบฝึกหัด'
}) => {
  return <section className="mb-12">
      <div className="text-center mb-8">
        <h2 className="text-2xl text-white mb-4 font-semibold md:text-4xl">🎯 เพิ่มพูนความรู้และทักษะของน้องๆ</h2>
        <p className="text-white/80 text-lg max-w-2xl mx-auto">— เลือกทักษะที่อยากฝึกฝน — </p>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {skills.map((skill, index) => <SkillCard key={index} skill={skill} onPreview={onPreview} buttonText={buttonText} />)}
        </div>
      </div>
    </section>;
};
export default SkillsSection;