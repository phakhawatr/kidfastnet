import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus, Minus, X, Divide, Sigma, Table, Clock, Ruler, Scale, Zap, Eye, Hash, Shapes, Percent, ArrowLeftRight, Calculator, Link2, BarChart3, Layers, Brain, Grid3x3, Coins } from 'lucide-react';

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
  translationKey?: string;
};

interface SkillsSectionProps {
  skills?: Skill[];
  onPreview?: (skill: Skill) => void;
  buttonText?: string;
  disableLinks?: boolean;
}

const getDefaultSkills = (t: any): Skill[] => [{
  icon: Layers,
  title: t('skills.placeValue.title'),
  desc: t('skills.placeValue.desc'),
  backgroundGradient: 'bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-600',
  textColor: 'text-white',
  sticker: '🔢',
  hrefPreview: '/place-value',
  mascotImage: additionMascot,
  translationKey: 'placeValue'
}, {
  icon: Brain,
  title: t('skills.mentalMath.title'),
  desc: t('skills.mentalMath.desc'),
  backgroundGradient: 'bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600',
  textColor: 'text-white',
  sticker: '⚡',
  hrefPreview: '/mental-math',
  mascotImage: additionMascot,
  translationKey: 'mentalMath'
}, {
  icon: Grid3x3,
  title: t('skills.areaModel.title'),
  desc: t('skills.areaModel.desc'),
  backgroundGradient: 'bg-gradient-to-br from-orange-400 via-red-500 to-pink-600',
  textColor: 'text-white',
  sticker: '📐',
  hrefPreview: '/area-model',
  mascotImage: multiplicationMascot,
  translationKey: 'areaModel'
}, {
  icon: Link2,
  title: t('skills.numberBonds.title'),
  desc: t('skills.numberBonds.desc'),
  backgroundGradient: 'bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600',
  textColor: 'text-white',
  sticker: '🔗',
  hrefPreview: '/number-bonds',
  mascotImage: additionMascot,
  translationKey: 'numberBonds'
}, {
  icon: BarChart3,
  title: t('skills.barModel.title'),
  desc: t('skills.barModel.desc'),
  backgroundGradient: 'bg-gradient-to-br from-purple-400 via-fuchsia-500 to-pink-600',
  textColor: 'text-white',
  sticker: '📊',
  hrefPreview: '/bar-model',
  mascotImage: additionMascot,
  translationKey: 'barModel'
}, {
  icon: Plus,
  title: t('skills.addition.title'),
  desc: t('skills.addition.desc'),
  backgroundGradient: 'bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600',
  textColor: 'text-white',
  sticker: '🧮',
  hrefPreview: '/addition',
  mascotImage: additionMascot,
  translationKey: 'addition'
}, {
  icon: Minus,
  title: t('skills.subtraction.title'),
  desc: t('skills.subtraction.desc'),
  backgroundGradient: 'bg-gradient-to-br from-purple-400 via-purple-500 to-indigo-600',
  textColor: 'text-white',
  sticker: '🧠',
  hrefPreview: '/subtraction',
  mascotImage: subtractionMascot,
  translationKey: 'subtraction'
}, {
  icon: X,
  title: t('skills.multiplication.title'),
  desc: t('skills.multiplication.desc'),
  backgroundGradient: 'bg-gradient-to-br from-orange-400 via-orange-500 to-red-500',
  textColor: 'text-white',
  sticker: '🐯',
  hrefPreview: '/multiply',
  mascotImage: multiplicationMascot,
  translationKey: 'multiplication'
}, {
  icon: Divide,
  title: t('skills.division.title'),
  desc: t('skills.division.desc'),
  backgroundGradient: 'bg-gradient-to-br from-green-400 via-green-500 to-emerald-600',
  textColor: 'text-white',
  sticker: '🦊',
  hrefPreview: '/division',
  mascotImage: divisionMascot,
  translationKey: 'division'
}, {
  icon: Sigma,
  title: t('skills.numberSeries.title'),
  desc: t('skills.numberSeries.desc'),
  backgroundGradient: 'bg-gradient-to-br from-violet-400 via-purple-500 to-indigo-600',
  textColor: 'text-white',
  sticker: '🧩',
  hrefPreview: '/NumberSeries',
  translationKey: 'numberSeries'
}, {
  icon: Table,
  title: t('skills.multiplicationTable.title'),
  desc: t('skills.multiplicationTable.desc'),
  backgroundGradient: 'bg-gradient-to-br from-sky-400 via-cyan-500 to-teal-600',
  textColor: 'text-white',
  sticker: '🐼',
  hrefPreview: '/multiplication-table',
  translationKey: 'multiplicationTable'
}, {
  icon: Clock,
  title: t('skills.time.title'),
  desc: t('skills.time.desc'),
  backgroundGradient: 'bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500',
  textColor: 'text-white',
  sticker: '⏰',
  hrefPreview: '/time',
  mascotImage: timeMascot,
  translationKey: 'time'
}, {
  icon: Ruler,
  title: t('skills.lengthComparison.title'),
  desc: t('skills.lengthComparison.desc'),
  backgroundGradient: 'bg-gradient-to-br from-pink-400 via-pink-500 to-fuchsia-600',
  textColor: 'text-white',
  sticker: '📏',
  hrefPreview: '/measurement',
  mascotImage: measurementMascot,
  translationKey: 'lengthComparison'
}, {
  icon: Scale,
  title: t('skills.weighing.title'),
  desc: t('skills.weighing.desc'),
  backgroundGradient: 'bg-gradient-to-br from-rose-400 via-pink-500 to-purple-600',
  textColor: 'text-white',
  sticker: '⚖️',
  hrefPreview: '/weighing',
  mascotImage: weighingMascot,
  translationKey: 'weighing'
}, {
  icon: Zap,
  title: t('skills.quickMath.title'),
  desc: t('skills.quickMath.desc'),
  backgroundGradient: 'bg-gradient-to-br from-slate-400 via-gray-500 to-zinc-600',
  textColor: 'text-white',
  sticker: '📏',
  hrefPreview: '/quick-math',
  translationKey: 'quickMath'
}, {
  icon: Hash,
  title: t('skills.sumGrid.title'),
  desc: t('skills.sumGrid.desc'),
  backgroundGradient: 'bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600',
  textColor: 'text-white',
  sticker: '🔢',
  hrefPreview: '/SumGridPuzzles',
  translationKey: 'sumGrid'
}, {
  icon: Shapes,
  title: t('skills.shapes.title'),
  desc: t('skills.shapes.desc'),
  backgroundGradient: 'bg-gradient-to-br from-teal-400 via-green-500 to-emerald-600',
  textColor: 'text-white',
  sticker: '🔷',
  hrefPreview: '/shape-matching',
  mascotImage: shapesMascot,
  translationKey: 'shapes'
}, {
  icon: Calculator,
  title: t('skills.fractions.title'),
  desc: t('skills.fractions.desc'),
  backgroundGradient: 'bg-gradient-to-br from-purple-400 via-violet-500 to-purple-600',
  textColor: 'text-white',
  sticker: '🍰',
  hrefPreview: '/fraction-matching',
  mascotImage: fractionsMascot,
  translationKey: 'fractions'
}, {
  icon: Percent,
  title: t('skills.percentage.title'),
  desc: t('skills.percentage.desc'),
  backgroundGradient: 'bg-gradient-to-br from-red-400 via-rose-500 to-pink-600',
  textColor: 'text-white',
  sticker: '💯',
  hrefPreview: '/percentage',
  translationKey: 'percentage'
}, {
  icon: ArrowLeftRight,
  title: t('skills.lengthComparisonAlt.title'),
  desc: t('skills.lengthComparisonAlt.desc'),
  backgroundGradient: 'bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500',
  textColor: 'text-white',
  sticker: '↔️',
  hrefPreview: '/length-comparison',
  translationKey: 'lengthComparisonAlt'
}, {
  icon: Coins,
  title: t('skills.money.title'),
  desc: t('skills.money.desc'),
  backgroundGradient: 'bg-gradient-to-br from-emerald-400 via-green-500 to-teal-500',
  textColor: 'text-white',
  sticker: '💰',
  hrefPreview: '/money',
  translationKey: 'money'
}];

const SkillCard: React.FC<{
  skill: Skill;
  onPreview?: (skill: Skill) => void;
  buttonText?: string;
  disableLinks?: boolean;
}> = ({
  skill,
  onPreview,
  buttonText = 'เริ่มทำแบบฝึกหัด',
  disableLinks = false
}) => {
  const handlePreviewClick = (e: React.MouseEvent) => {
    if (onPreview) {
      e.preventDefault();
      onPreview(skill);
    }
  };

  const cardContent = (
    <div 
      className={`relative rounded-3xl shadow-xl ${!disableLinks ? 'hover:-translate-y-2 hover:shadow-2xl cursor-pointer' : ''} transition-all duration-300 ${skill.backgroundGradient} overflow-hidden group`}
    >
      {/* Mascot Image */}
      <div className="absolute top-3 right-3 w-14 h-14 z-10">
        {skill.mascotImage ? (
          <img 
            src={skill.mascotImage} 
            alt={`${skill.title} mascot`}
            className="w-full h-full object-cover rounded-xl shadow-lg"
          />
        ) : (
          <div className="w-full h-full bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
            <span className="text-xl">{skill.sticker}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="block p-5 pr-20 pb-6 relative z-5">
        <h3 className={`font-bold text-lg mb-2 ${skill.textColor} drop-shadow-sm`}>
          {skill.title}
        </h3>
        <p className={`text-xs leading-relaxed ${skill.textColor} opacity-90 pr-2`}>
          {skill.desc}
        </p>
      </div>
    </div>
  );

  return skill.hrefPreview && !disableLinks ? (
    <Link to={skill.hrefPreview} onClick={handlePreviewClick}>
      {cardContent}
    </Link>
  ) : (
    <div onClick={onPreview && !disableLinks ? handlePreviewClick : undefined}>
      {cardContent}
    </div>
  );
};

const SkillsSection: React.FC<SkillsSectionProps> = ({
  skills,
  onPreview,
  buttonText,
  disableLinks = false
}) => {
  const { t } = useTranslation('skills');
  const defaultSkills = getDefaultSkills(t);
  const displaySkills = skills || defaultSkills;
  const displayButtonText = buttonText || t('defaultButtonText');

  return <section className="mb-12">
      <div className="text-center mb-8">
        <h2 className="text-2xl text-white mb-4 font-semibold md:text-4xl">{t('sectionTitle')}</h2>
        <p className="text-white/80 text-lg max-w-2xl mx-auto">{t('sectionSubtitle')}</p>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {displaySkills.map((skill, index) => <SkillCard key={index} skill={skill} onPreview={onPreview} buttonText={displayButtonText} disableLinks={disableLinks} />)}
        </div>
      </div>
    </section>;
};

export default SkillsSection;
