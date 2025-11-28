import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus, Minus, X, Divide, Sigma, Table, Clock, Ruler, Scale, Zap, Eye, Hash, Shapes, Percent, ArrowLeftRight, Calculator, Link2, BarChart3, Layers, Brain, Grid3x3, Coins, GripVertical, Pin, Target, Flower, Waves, Puzzle, Apple } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy
} from '@dnd-kit/sortable';
import { DraggableSkillCard } from './DraggableSkillCard';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

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
  category?: 'basics' | 'interactive-games' | 'advanced';
};

interface SkillsSectionProps {
  skills?: Skill[];
  onPreview?: (skill: Skill) => void;
  buttonText?: string;
  disableLinks?: boolean;
}

const getDefaultSkills = (t: any): Skill[] => [
  // 🎮 Interactive Games
  {
    icon: Shapes,
    title: t('skills.flowerMath.title'),
    desc: t('skills.flowerMath.desc'),
    backgroundGradient: 'bg-gradient-to-br from-pink-400 via-rose-500 to-fuchsia-600',
    textColor: 'text-white',
    sticker: '🌸',
    hrefPreview: '/flower-math',
    mascotImage: multiplicationMascot,
    translationKey: 'flowerMath',
    category: 'interactive-games'
  }, {
    icon: Shapes,
    title: t('skills.balloonMath.title'),
    desc: t('skills.balloonMath.desc'),
    backgroundGradient: 'bg-gradient-to-br from-sky-400 via-cyan-500 to-blue-600',
    textColor: 'text-white',
    sticker: '🎈',
    hrefPreview: '/balloon-math',
    mascotImage: additionMascot,
    translationKey: 'balloonMath',
    category: 'interactive-games'
  }, {
    icon: Target,
    title: t('skills.countingChallenge.title'),
    desc: t('skills.countingChallenge.desc'),
    backgroundGradient: 'bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500',
    textColor: 'text-white',
    sticker: '🐠',
    hrefPreview: '/counting-challenge',
    translationKey: 'countingChallenge',
    category: 'interactive-games'
  }, {
    icon: ArrowLeftRight,
    title: t('skills.compareStars.title'),
    desc: t('skills.compareStars.desc'),
    backgroundGradient: 'bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500',
    textColor: 'text-white',
    sticker: '⭐',
    hrefPreview: '/compare-stars',
    translationKey: 'compareStars',
    category: 'interactive-games'
  }, {
    icon: Puzzle,
    title: t('skills.boardCounting.title'),
    desc: t('skills.boardCounting.desc'),
    backgroundGradient: 'bg-gradient-to-br from-amber-500 via-orange-500 to-red-500',
    textColor: 'text-white',
    sticker: '🐴',
    hrefPreview: '/board-counting',
    translationKey: 'boardCounting',
    category: 'interactive-games'
  }, {
    icon: Apple,
    title: t('skills.fruitCounting.title'),
    desc: t('skills.fruitCounting.desc'),
    backgroundGradient: 'bg-gradient-to-br from-yellow-400 via-orange-400 to-red-500',
    textColor: 'text-white',
    sticker: '🍎',
    hrefPreview: '/fruit-counting',
    translationKey: 'fruitCounting',
    category: 'interactive-games'
  }, {
    icon: Shapes,
    title: t('skills.shapeSeries.title'),
    desc: t('skills.shapeSeries.desc'),
    backgroundGradient: 'bg-gradient-to-br from-fuchsia-400 via-violet-500 to-purple-600',
    textColor: 'text-white',
    sticker: '🔄',
    hrefPreview: '/shape-series',
    translationKey: 'shapeSeries',
    category: 'interactive-games'
  }, {
    icon: Shapes,
    title: t('skills.fractionShapes.title'),
    desc: t('skills.fractionShapes.desc'),
    backgroundGradient: 'bg-gradient-to-br from-amber-400 via-orange-500 to-red-600',
    textColor: 'text-white',
    sticker: '🧩',
    hrefPreview: '/fraction-shapes',
    mascotImage: fractionsMascot,
    translationKey: 'fractionShapes',
    category: 'interactive-games'
  }, {
    icon: Shapes,
    title: t('skills.shapes.title'),
    desc: t('skills.shapes.desc'),
    backgroundGradient: 'bg-gradient-to-br from-teal-400 via-green-500 to-emerald-600',
    textColor: 'text-white',
    sticker: '🔷',
    hrefPreview: '/shape-matching',
    mascotImage: shapesMascot,
    translationKey: 'shapes',
    category: 'interactive-games'
  },
  // 📚 Basics
  {
    icon: Plus,
    title: t('skills.addition.title'),
    desc: t('skills.addition.desc'),
    backgroundGradient: 'bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600',
    textColor: 'text-white',
    sticker: '🧮',
    hrefPreview: '/addition',
    mascotImage: additionMascot,
    translationKey: 'addition',
    category: 'basics'
  }, {
    icon: Minus,
    title: t('skills.subtraction.title'),
    desc: t('skills.subtraction.desc'),
    backgroundGradient: 'bg-gradient-to-br from-purple-400 via-purple-500 to-indigo-600',
    textColor: 'text-white',
    sticker: '🧠',
    hrefPreview: '/subtraction',
    mascotImage: subtractionMascot,
    translationKey: 'subtraction',
    category: 'basics'
  }, {
    icon: X,
    title: t('skills.multiplication.title'),
    desc: t('skills.multiplication.desc'),
    backgroundGradient: 'bg-gradient-to-br from-orange-400 via-orange-500 to-red-500',
    textColor: 'text-white',
    sticker: '🐯',
    hrefPreview: '/multiply',
    mascotImage: multiplicationMascot,
    translationKey: 'multiplication',
    category: 'basics'
  }, {
    icon: Divide,
    title: t('skills.division.title'),
    desc: t('skills.division.desc'),
    backgroundGradient: 'bg-gradient-to-br from-green-400 via-green-500 to-emerald-600',
    textColor: 'text-white',
    sticker: '🦊',
    hrefPreview: '/division',
    mascotImage: divisionMascot,
    translationKey: 'division',
    category: 'basics'
  }, {
    icon: Sigma,
    title: t('skills.numberSeries.title'),
    desc: t('skills.numberSeries.desc'),
    backgroundGradient: 'bg-gradient-to-br from-violet-400 via-purple-500 to-indigo-600',
    textColor: 'text-white',
    sticker: '🧩',
    hrefPreview: '/NumberSeries',
    translationKey: 'numberSeries',
    category: 'basics'
  }, {
    icon: Table,
    title: t('skills.multiplicationTable.title'),
    desc: t('skills.multiplicationTable.desc'),
    backgroundGradient: 'bg-gradient-to-br from-sky-400 via-cyan-500 to-teal-600',
    textColor: 'text-white',
    sticker: '🐼',
    hrefPreview: '/multiplication-table',
    translationKey: 'multiplicationTable',
    category: 'basics'
  }, {
    icon: Clock,
    title: t('skills.time.title'),
    desc: t('skills.time.desc'),
    backgroundGradient: 'bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500',
    textColor: 'text-white',
    sticker: '⏰',
    hrefPreview: '/time',
    mascotImage: timeMascot,
    translationKey: 'time',
    category: 'basics'
  }, {
    icon: Ruler,
    title: t('skills.lengthComparison.title'),
    desc: t('skills.lengthComparison.desc'),
    backgroundGradient: 'bg-gradient-to-br from-pink-400 via-pink-500 to-fuchsia-600',
    textColor: 'text-white',
    sticker: '📏',
    hrefPreview: '/measurement',
    mascotImage: measurementMascot,
    translationKey: 'lengthComparison',
    category: 'basics'
  }, {
    icon: Scale,
    title: t('skills.weighing.title'),
    desc: t('skills.weighing.desc'),
    backgroundGradient: 'bg-gradient-to-br from-rose-400 via-pink-500 to-purple-600',
    textColor: 'text-white',
    sticker: '⚖️',
    hrefPreview: '/weighing',
    mascotImage: weighingMascot,
    translationKey: 'weighing',
    category: 'basics'
  }, {
    icon: ArrowLeftRight,
    title: t('skills.lengthComparisonAlt.title'),
    desc: t('skills.lengthComparisonAlt.desc'),
    backgroundGradient: 'bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500',
    textColor: 'text-white',
    sticker: '↔️',
    hrefPreview: '/length-comparison',
    translationKey: 'lengthComparisonAlt',
    category: 'basics'
  }, {
    icon: Coins,
    title: t('skills.money.title'),
    desc: t('skills.money.desc'),
    backgroundGradient: 'bg-gradient-to-br from-emerald-400 via-green-500 to-teal-500',
    textColor: 'text-white',
    sticker: '💰',
    hrefPreview: '/money',
    translationKey: 'money',
    category: 'basics'
  }, {
    icon: Calculator,
    title: t('skills.fractions.title'),
    desc: t('skills.fractions.desc'),
    backgroundGradient: 'bg-gradient-to-br from-purple-400 via-violet-500 to-purple-600',
    textColor: 'text-white',
    sticker: '🍰',
    hrefPreview: '/fraction-matching',
    mascotImage: fractionsMascot,
    translationKey: 'fractions',
    category: 'basics'
  }, {
    icon: Percent,
    title: t('skills.percentage.title'),
    desc: t('skills.percentage.desc'),
    backgroundGradient: 'bg-gradient-to-br from-red-400 via-rose-500 to-pink-600',
    textColor: 'text-white',
    sticker: '💯',
    hrefPreview: '/percentage',
    translationKey: 'percentage',
    category: 'basics'
  },
  // 🧠 Advanced
  {
    icon: Layers,
    title: t('skills.placeValue.title'),
    desc: t('skills.placeValue.desc'),
    backgroundGradient: 'bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-600',
    textColor: 'text-white',
    sticker: '🔢',
    hrefPreview: '/place-value',
    mascotImage: additionMascot,
    translationKey: 'placeValue',
    category: 'advanced'
  }, {
    icon: Brain,
    title: t('skills.mentalMath.title'),
    desc: t('skills.mentalMath.desc'),
    backgroundGradient: 'bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600',
    textColor: 'text-white',
    sticker: '⚡',
    hrefPreview: '/mental-math',
    mascotImage: additionMascot,
    translationKey: 'mentalMath',
    category: 'advanced'
  }, {
    icon: Grid3x3,
    title: t('skills.areaModel.title'),
    desc: t('skills.areaModel.desc'),
    backgroundGradient: 'bg-gradient-to-br from-orange-400 via-red-500 to-pink-600',
    textColor: 'text-white',
    sticker: '📐',
    hrefPreview: '/area-model',
    mascotImage: multiplicationMascot,
    translationKey: 'areaModel',
    category: 'advanced'
  }, {
    icon: Link2,
    title: t('skills.numberBonds.title'),
    desc: t('skills.numberBonds.desc'),
    backgroundGradient: 'bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600',
    textColor: 'text-white',
    sticker: '🔗',
    hrefPreview: '/number-bonds',
    mascotImage: additionMascot,
    translationKey: 'numberBonds',
    category: 'advanced'
  }, {
    icon: BarChart3,
    title: t('skills.barModel.title'),
    desc: t('skills.barModel.desc'),
    backgroundGradient: 'bg-gradient-to-br from-purple-400 via-fuchsia-500 to-pink-600',
    textColor: 'text-white',
    sticker: '📊',
    hrefPreview: '/bar-model',
    mascotImage: additionMascot,
    translationKey: 'barModel',
    category: 'advanced'
  }, {
    icon: Zap,
    title: t('skills.quickMath.title'),
    desc: t('skills.quickMath.desc'),
    backgroundGradient: 'bg-gradient-to-br from-slate-400 via-gray-500 to-zinc-600',
    textColor: 'text-white',
    sticker: '📏',
    hrefPreview: '/quick-math',
    translationKey: 'quickMath',
    category: 'advanced'
  }, {
    icon: Hash,
    title: t('skills.sumGrid.title'),
    desc: t('skills.sumGrid.desc'),
    backgroundGradient: 'bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600',
    textColor: 'text-white',
    sticker: '🔢',
    hrefPreview: '/SumGridPuzzles',
    translationKey: 'sumGrid',
    category: 'advanced'
  }, {
    icon: Calculator,
    title: t('skills.wordProblems.title'),
    desc: t('skills.wordProblems.desc'),
    backgroundGradient: 'bg-gradient-to-br from-rose-400 via-red-500 to-orange-500',
    textColor: 'text-white',
    sticker: '📝',
    hrefPreview: '/word-problems',
    translationKey: 'wordProblems',
    category: 'advanced'
  }
];

const SkillCard: React.FC<{
  skill: Skill;
  onPreview?: (skill: Skill) => void;
  buttonText?: string;
  disableLinks?: boolean;
  isEditMode?: boolean;
  isPinned?: boolean;
  onTogglePin?: (skillId: string) => void;
}> = ({
  skill,
  onPreview,
  buttonText = 'เริ่มทำแบบฝึกหัด',
  disableLinks = false,
  isEditMode = false,
  isPinned = false,
  onTogglePin
}) => {
  const handlePreviewClick = (e: React.MouseEvent) => {
    if (onPreview) {
      e.preventDefault();
      onPreview(skill);
    }
  };

  const handlePinClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onTogglePin && skill.hrefPreview) {
      onTogglePin(skill.hrefPreview);
    }
  };

  const cardContent = (
    <div 
      className={`relative rounded-3xl shadow-xl h-full min-h-[180px] flex flex-col ${!disableLinks && !isEditMode ? 'hover:-translate-y-2 hover:shadow-2xl' : ''} ${isEditMode ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'} transition-all duration-300 ${skill.backgroundGradient} overflow-hidden group ${isPinned ? 'ring-2 ring-yellow-400 ring-offset-2' : ''}`}
    >
      {/* Pin Button */}
      {!isEditMode && onTogglePin && (
        <button
          onClick={handlePinClick}
          className={`absolute top-2 left-2 rounded-full p-1.5 z-20 transition-all duration-200 ${
            isPinned 
              ? 'bg-yellow-400 hover:bg-yellow-500 shadow-lg' 
              : 'bg-white/60 hover:bg-white/80'
          }`}
          title={isPinned ? 'ยกเลิกปักหมุด' : 'ปักหมุด'}
        >
          <Pin className={`w-4 h-4 ${isPinned ? 'fill-white text-white' : 'text-gray-700'}`} />
        </button>
      )}
      
      {/* Edit Mode Indicator */}
      {isEditMode && (
        <div className="absolute top-2 right-2 bg-white/80 rounded-full p-1.5 z-20">
          <GripVertical className="w-4 h-4 text-gray-600" />
        </div>
      )}
      
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
      <div className="flex-1 flex flex-col justify-center p-5 pr-20 pb-6 relative z-5">
        <h3 className={`font-bold text-lg mb-2 ${skill.textColor} drop-shadow-sm`}>
          {skill.title}
        </h3>
        <p className={`text-xs leading-relaxed ${skill.textColor} opacity-90 pr-2`}>
          {skill.desc}
        </p>
      </div>
    </div>
  );

  return skill.hrefPreview && !disableLinks && !isEditMode ? (
    <Link to={skill.hrefPreview} onClick={handlePreviewClick}>
      {cardContent}
    </Link>
  ) : (
    <div onClick={onPreview && !disableLinks && !isEditMode ? handlePreviewClick : undefined}>
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
  const { toast } = useToast();
  const { user } = useAuth();
  
  const defaultSkills = getDefaultSkills(t);
  const initialSkills = skills || defaultSkills;
  const displayButtonText = buttonText || t('defaultButtonText');

  const [orderedSkills, setOrderedSkills] = useState<Skill[]>(initialSkills);
  const [isEditMode, setIsEditMode] = useState(false);
  const [pinnedSkills, setPinnedSkills] = useState<string[]>([]);

  // Load order and pinned skills from localStorage
  useEffect(() => {
    const userId = user?.id || 'guest';
    const savedOrder = localStorage.getItem(`skillsOrder_${userId}`);
    const savedPinned = localStorage.getItem(`skillsPinned_${userId}`);
    
    if (savedOrder) {
      try {
        const orderIds = JSON.parse(savedOrder);
        const reordered = orderIds
          .map((id: string) => initialSkills.find(s => s.hrefPreview === id))
          .filter(Boolean);
        
        if (reordered.length === initialSkills.length) {
          setOrderedSkills(reordered);
        }
      } catch (e) {
        console.error('Error loading skill order:', e);
      }
    }
    
    if (savedPinned) {
      try {
        setPinnedSkills(JSON.parse(savedPinned));
      } catch (e) {
        console.error('Error loading pinned skills:', e);
      }
    }
  }, [user?.id]); // Remove initialSkills from dependency to prevent infinite loop

  // Save order to localStorage
  const saveOrder = (skills: Skill[]) => {
    const userId = user?.id || 'guest';
    const orderIds = skills.map(s => s.hrefPreview);
    localStorage.setItem(`skillsOrder_${userId}`, JSON.stringify(orderIds));
  };

  // Save pinned skills to localStorage
  const savePinnedSkills = (pinned: string[]) => {
    const userId = user?.id || 'guest';
    localStorage.setItem(`skillsPinned_${userId}`, JSON.stringify(pinned));
  };

  // Toggle pin status
  const handleTogglePin = (skillId: string) => {
    setPinnedSkills((prev) => {
      const newPinned = prev.includes(skillId)
        ? prev.filter(id => id !== skillId)
        : [...prev, skillId];
      
      savePinnedSkills(newPinned);
      
      toast({
        title: prev.includes(skillId) ? t('unpinSuccess') : t('pinSuccess'),
        duration: 1500,
      });
      
      return newPinned;
    });
  };

  // Sort skills: pinned first, then ordered
  const sortedSkills = React.useMemo(() => {
    const pinned = orderedSkills.filter(s => pinnedSkills.includes(s.hrefPreview || ''));
    const unpinned = orderedSkills.filter(s => !pinnedSkills.includes(s.hrefPreview || ''));
    return [...pinned, ...unpinned];
  }, [orderedSkills, pinnedSkills]);

  // Group skills by category
  const groupedSkills = React.useMemo(() => {
    const groups: Record<string, Skill[]> = {
      'interactive-games': [],
      'basics': [],
      'advanced': []
    };
    
    sortedSkills.forEach(skill => {
      const category = skill.category || 'basics';
      groups[category].push(skill);
    });
    
    return groups;
  }, [sortedSkills]);

  // Setup sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag end (respecting pinned groups)
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setOrderedSkills((items) => {
        const oldIndex = items.findIndex(s => s.hrefPreview === active.id);
        const newIndex = items.findIndex(s => s.hrefPreview === over.id);
        
        // Check if both items are in same group (both pinned or both unpinned)
        const activeIsPinned = pinnedSkills.includes(active.id as string);
        const overIsPinned = pinnedSkills.includes(over.id as string);
        
        if (activeIsPinned === overIsPinned) {
          const newOrder = arrayMove(items, oldIndex, newIndex);
          saveOrder(newOrder);
          return newOrder;
        }
        
        return items; // Don't allow moving between pinned/unpinned groups
      });
    }
  };

  // Reset to default order and clear pinned
  const handleReset = () => {
    const userId = user?.id || 'guest';
    setOrderedSkills(initialSkills);
    setPinnedSkills([]);
    localStorage.removeItem(`skillsOrder_${userId}`);
    localStorage.removeItem(`skillsPinned_${userId}`);
    toast({
      title: t('resetSuccess'),
      duration: 2000,
    });
  };

  return (
    <section className="mb-12">
      <div className="text-center mb-8">
        <h2 className="text-2xl text-white mb-4 font-semibold md:text-4xl">{t('sectionTitle')}</h2>
        <p className="text-white/80 text-lg max-w-2xl mx-auto">{t('sectionSubtitle')}</p>
        
        {/* Edit Mode Controls */}
        <div className="flex flex-col items-center gap-2 mt-4">
          {pinnedSkills.length > 0 && (
            <div className="text-white/60 text-sm flex items-center gap-1">
              <Pin className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              {t('pinnedCount', { count: pinnedSkills.length })}
            </div>
          )}
          <div className="flex gap-2">
            <Button
              variant={isEditMode ? "default" : "outline"}
              size="sm"
              onClick={() => setIsEditMode(!isEditMode)}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20"
            >
              {isEditMode ? `✓ ${t('done')}` : `✏️ ${t('reorder')}`}
            </Button>
            {isEditMode && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleReset}
                className="text-white hover:bg-white/20"
              >
                🔄 {t('reset')}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sortedSkills.map(s => s.hrefPreview || '')}
            strategy={rectSortingStrategy}
          >
            {/* Interactive Games Category */}
            {groupedSkills['interactive-games'].length > 0 && (
              <div className="mb-10">
                <h3 className="text-2xl text-white font-bold mb-4 flex items-center gap-3">
                  <span>🎮 {t('category.interactiveGames')}</span>
                  <span className="bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs px-3 py-1 rounded-full animate-pulse">
                    New!
                  </span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-6 auto-rows-fr">
                  {groupedSkills['interactive-games'].map((skill) => (
                    <DraggableSkillCard
                      key={skill.hrefPreview}
                      id={skill.hrefPreview || ''}
                      isEditMode={isEditMode}
                    >
                      <SkillCard 
                        skill={skill} 
                        onPreview={onPreview} 
                        buttonText={displayButtonText} 
                        disableLinks={disableLinks || isEditMode}
                        isEditMode={isEditMode}
                        isPinned={pinnedSkills.includes(skill.hrefPreview || '')}
                        onTogglePin={handleTogglePin}
                      />
                    </DraggableSkillCard>
                  ))}
                </div>
              </div>
            )}

            {/* Basics Category */}
            {groupedSkills['basics'].length > 0 && (
              <div className="mb-10">
                <h3 className="text-2xl text-white font-bold mb-4 flex items-center gap-3">
                  📚 {t('category.basics')}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 auto-rows-fr">
                  {groupedSkills['basics'].map((skill) => (
                    <DraggableSkillCard
                      key={skill.hrefPreview}
                      id={skill.hrefPreview || ''}
                      isEditMode={isEditMode}
                    >
                      <SkillCard 
                        skill={skill} 
                        onPreview={onPreview} 
                        buttonText={displayButtonText} 
                        disableLinks={disableLinks || isEditMode}
                        isEditMode={isEditMode}
                        isPinned={pinnedSkills.includes(skill.hrefPreview || '')}
                        onTogglePin={handleTogglePin}
                      />
                    </DraggableSkillCard>
                  ))}
                </div>
              </div>
            )}

            {/* Advanced Category */}
            {groupedSkills['advanced'].length > 0 && (
              <div className="mb-10">
                <h3 className="text-2xl text-white font-bold mb-4 flex items-center gap-3">
                  🧠 {t('category.advanced')}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 auto-rows-fr">
                  {groupedSkills['advanced'].map((skill) => (
                    <DraggableSkillCard
                      key={skill.hrefPreview}
                      id={skill.hrefPreview || ''}
                      isEditMode={isEditMode}
                    >
                      <SkillCard 
                        skill={skill} 
                        onPreview={onPreview} 
                        buttonText={displayButtonText} 
                        disableLinks={disableLinks || isEditMode}
                        isEditMode={isEditMode}
                        isPinned={pinnedSkills.includes(skill.hrefPreview || '')}
                        onTogglePin={handleTogglePin}
                      />
                    </DraggableSkillCard>
                  ))}
                </div>
              </div>
            )}
          </SortableContext>
        </DndContext>
      </div>
    </section>
  );
};

export default SkillsSection;
