import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ArrowRight, Code, RefreshCw, Trophy, Star, CheckCircle2, XCircle, Lightbulb, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

type GameMode = 'menu' | 'sequencing' | 'patterns' | 'loops' | 'conditionals' | 'results';
type Difficulty = 'easy' | 'medium' | 'hard';
type QuestionCount = 10 | 15 | 20 | 30;

interface Challenge {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number[];
  explanation: string;
  hint: string;
  emoji?: string;
}

interface AnswerHistory {
  questionIndex: number;
  selectedAnswer: number[];
  isCorrect: boolean;
  challenge: Challenge;
}

const CodingBasicsApp = () => {
  const { t } = useTranslation('codingbasics');
  const navigate = useNavigate();

  const [gameMode, setGameMode] = useState<GameMode>('menu');
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [questionCount, setQuestionCount] = useState<QuestionCount>(10);
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [answerHistory, setAnswerHistory] = useState<AnswerHistory[]>([]);

  // Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && gameMode !== 'menu' && gameMode !== 'results') {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, gameMode]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Generate Sequencing Challenges
  const generateSequencingChallenges = (): Challenge[] => {
    const allChallenges = [
      { id: 'seq-1', question: t('challenges.sequencing.wake_up'), emoji: '🛏️',
        options: [t('challenges.sequencing.options.wake_up'), t('challenges.sequencing.options.brush_teeth'), t('challenges.sequencing.options.eat_breakfast'), t('challenges.sequencing.options.go_to_school')],
        correctAnswer: [0, 1, 2, 3], explanation: t('challenges.sequencing.explanation_wake_up'), hint: t('challenges.sequencing.hint_morning') },
      { id: 'seq-2', question: t('challenges.sequencing.plant_tree'), emoji: '🌱',
        options: [t('challenges.sequencing.options.dig_hole'), t('challenges.sequencing.options.put_seed'), t('challenges.sequencing.options.cover_soil'), t('challenges.sequencing.options.water')],
        correctAnswer: [0, 1, 2, 3], explanation: t('challenges.sequencing.explanation_plant'), hint: t('challenges.sequencing.hint_plant') },
      { id: 'seq-3', question: t('challenges.sequencing.make_sandwich'), emoji: '🥪',
        options: [t('challenges.sequencing.options.get_bread'), t('challenges.sequencing.options.spread_butter'), t('challenges.sequencing.options.put_filling'), t('challenges.sequencing.options.close_sandwich')],
        correctAnswer: [0, 1, 2, 3], explanation: t('challenges.sequencing.explanation_sandwich'), hint: t('challenges.sequencing.hint_sandwich') },
      { id: 'seq-4', question: t('challenges.sequencing.wash_hands'), emoji: '🧼',
        options: [t('challenges.sequencing.options.wet_hands'), t('challenges.sequencing.options.apply_soap'), t('challenges.sequencing.options.scrub'), t('challenges.sequencing.options.rinse'), t('challenges.sequencing.options.dry')],
        correctAnswer: [0, 1, 2, 3, 4], explanation: t('challenges.sequencing.explanation_wash_hands'), hint: t('challenges.sequencing.hint_wash_hands') },
      { id: 'seq-5', question: t('challenges.sequencing.bake_cookie'), emoji: '🍪',
        options: [t('challenges.sequencing.options.mix_ingredients'), t('challenges.sequencing.options.preheat_oven'), t('challenges.sequencing.options.shape_dough'), t('challenges.sequencing.options.bake'), t('challenges.sequencing.options.cool')],
        correctAnswer: [1, 0, 2, 3, 4], explanation: t('challenges.sequencing.explanation_bake_cookie'), hint: t('challenges.sequencing.hint_bake_cookie') },
      { id: 'seq-6', question: t('challenges.sequencing.use_atm'), emoji: '💳',
        options: [t('challenges.sequencing.options.insert_card'), t('challenges.sequencing.options.enter_pin'), t('challenges.sequencing.options.select_amount'), t('challenges.sequencing.options.take_cash'), t('challenges.sequencing.options.take_card')],
        correctAnswer: [0, 1, 2, 3, 4], explanation: t('challenges.sequencing.explanation_use_atm'), hint: t('challenges.sequencing.hint_use_atm') },
      { id: 'seq-7', question: t('challenges.sequencing.send_email'), emoji: '📧',
        options: [t('challenges.sequencing.options.open_email'), t('challenges.sequencing.options.click_compose'), t('challenges.sequencing.options.type_message'), t('challenges.sequencing.options.add_recipient'), t('challenges.sequencing.options.click_send')],
        correctAnswer: [0, 1, 3, 2, 4], explanation: t('challenges.sequencing.explanation_send_email'), hint: t('challenges.sequencing.hint_send_email') },
      { id: 'seq-8', question: t('challenges.sequencing.do_homework'), emoji: '📚',
        options: [t('challenges.sequencing.options.read_instructions'), t('challenges.sequencing.options.gather_materials'), t('challenges.sequencing.options.complete_work'), t('challenges.sequencing.options.check_answers')],
        correctAnswer: [0, 1, 2, 3], explanation: t('challenges.sequencing.explanation_do_homework'), hint: t('challenges.sequencing.hint_do_homework') },
      { id: 'seq-9', question: t('challenges.sequencing.wash_clothes'), emoji: '🧺',
        options: [t('challenges.sequencing.options.sort_clothes'), t('challenges.sequencing.options.load_washer'), t('challenges.sequencing.options.add_detergent'), t('challenges.sequencing.options.start_wash'), t('challenges.sequencing.options.dry_clothes')],
        correctAnswer: [0, 1, 2, 3, 4], explanation: t('challenges.sequencing.explanation_wash_clothes'), hint: t('challenges.sequencing.hint_wash_clothes') },
      { id: 'seq-10', question: t('challenges.sequencing.make_ice'), emoji: '🧊',
        options: [t('challenges.sequencing.options.fill_tray'), t('challenges.sequencing.options.place_in_freezer'), t('challenges.sequencing.options.wait_freeze'), t('challenges.sequencing.options.remove_ice')],
        correctAnswer: [0, 1, 2, 3], explanation: t('challenges.sequencing.explanation_make_ice'), hint: t('challenges.sequencing.hint_make_ice') },
      { id: 'seq-11', question: t('challenges.sequencing.read_book'), emoji: '📖',
        options: [t('challenges.sequencing.options.open_book'), t('challenges.sequencing.options.read_page'), t('challenges.sequencing.options.take_notes'), t('challenges.sequencing.options.close_book')],
        correctAnswer: [0, 1, 2, 3], explanation: t('challenges.sequencing.explanation_read_book'), hint: t('challenges.sequencing.hint_read_book') },
      { id: 'seq-12', question: t('challenges.sequencing.draw_picture'), emoji: '🎨',
        options: [t('challenges.sequencing.options.prepare_materials'), t('challenges.sequencing.options.sketch'), t('challenges.sequencing.options.color'), t('challenges.sequencing.options.dry')],
        correctAnswer: [0, 1, 2, 3], explanation: t('challenges.sequencing.explanation_draw_picture'), hint: t('challenges.sequencing.hint_draw_picture') },
      { id: 'seq-13', question: t('challenges.sequencing.drive_car'), emoji: '🚗',
        options: [t('challenges.sequencing.options.check_car'), t('challenges.sequencing.options.start_engine'), t('challenges.sequencing.options.exit_parking'), t('challenges.sequencing.options.drive')],
        correctAnswer: [0, 1, 2, 3], explanation: t('challenges.sequencing.explanation_drive_car'), hint: t('challenges.sequencing.hint_drive_car') },
      { id: 'seq-14', question: t('challenges.sequencing.exercise_run'), emoji: '🏃‍♂️',
        options: [t('challenges.sequencing.options.change_clothes'), t('challenges.sequencing.options.warm_up'), t('challenges.sequencing.options.run'), t('challenges.sequencing.options.cool_down')],
        correctAnswer: [0, 1, 2, 3], explanation: t('challenges.sequencing.explanation_exercise_run'), hint: t('challenges.sequencing.hint_exercise_run') },
      { id: 'seq-15', question: t('challenges.sequencing.order_pizza'), emoji: '🍕',
        options: [t('challenges.sequencing.options.call'), t('challenges.sequencing.options.choose_menu'), t('challenges.sequencing.options.give_address'), t('challenges.sequencing.options.wait')],
        correctAnswer: [0, 1, 2, 3], explanation: t('challenges.sequencing.explanation_order_pizza'), hint: t('challenges.sequencing.hint_order_pizza') },
      { id: 'seq-16', question: t('challenges.sequencing.play_game'), emoji: '🎮',
        options: [t('challenges.sequencing.options.open_game'), t('challenges.sequencing.options.create_character'), t('challenges.sequencing.options.play'), t('challenges.sequencing.options.save')],
        correctAnswer: [0, 1, 2, 3], explanation: t('challenges.sequencing.explanation_play_game'), hint: t('challenges.sequencing.hint_play_game') },
      { id: 'seq-17', question: t('challenges.sequencing.clean_house'), emoji: '🧹',
        options: [t('challenges.sequencing.options.organize'), t('challenges.sequencing.options.sweep'), t('challenges.sequencing.options.mop'), t('challenges.sequencing.options.wipe')],
        correctAnswer: [0, 1, 2, 3], explanation: t('challenges.sequencing.explanation_clean_house'), hint: t('challenges.sequencing.hint_clean_house') },
      { id: 'seq-18', question: t('challenges.sequencing.make_omelet'), emoji: '🍳',
        options: [t('challenges.sequencing.options.beat_eggs'), t('challenges.sequencing.options.heat_pan'), t('challenges.sequencing.options.pour_eggs'), t('challenges.sequencing.options.flip'), t('challenges.sequencing.options.serve')],
        correctAnswer: [0, 1, 2, 3, 4], explanation: t('challenges.sequencing.explanation_make_omelet'), hint: t('challenges.sequencing.hint_make_omelet') },
      { id: 'seq-19', question: t('challenges.sequencing.make_cake'), emoji: '🎂',
        options: [t('challenges.sequencing.options.mix_flour'), t('challenges.sequencing.options.pour_into_pan'), t('challenges.sequencing.options.bake'), t('challenges.sequencing.options.decorate'), t('challenges.sequencing.options.serve')],
        correctAnswer: [0, 1, 2, 3, 4], explanation: t('challenges.sequencing.explanation_make_cake'), hint: t('challenges.sequencing.hint_make_cake') },
      { id: 'seq-20', question: t('challenges.sequencing.turn_on_computer'), emoji: '💻',
        options: [t('challenges.sequencing.options.plug_in'), t('challenges.sequencing.options.press_power'), t('challenges.sequencing.options.wait_boot'), t('challenges.sequencing.options.enter_password'), t('challenges.sequencing.options.use')],
        correctAnswer: [0, 1, 2, 3, 4], explanation: t('challenges.sequencing.explanation_turn_on_computer'), hint: t('challenges.sequencing.hint_turn_on_computer') },
      { id: 'seq-21', question: t('challenges.sequencing.play_music'), emoji: '🎵',
        options: [t('challenges.sequencing.options.turn_on_device'), t('challenges.sequencing.options.select_song'), t('challenges.sequencing.options.adjust_volume'), t('challenges.sequencing.options.play')],
        correctAnswer: [0, 1, 2, 3], explanation: t('challenges.sequencing.explanation_play_music'), hint: t('challenges.sequencing.hint_play_music') },
      { id: 'seq-22', question: t('challenges.sequencing.charge_phone'), emoji: '📱',
        options: [t('challenges.sequencing.options.get_cable'), t('challenges.sequencing.options.plug_in'), t('challenges.sequencing.options.connect_phone'), t('challenges.sequencing.options.wait_full')],
        correctAnswer: [0, 1, 2, 3], explanation: t('challenges.sequencing.explanation_charge_phone'), hint: t('challenges.sequencing.hint_charge_phone') },
      { id: 'seq-23', question: t('challenges.sequencing.swim'), emoji: '🏊‍♂️',
        options: [t('challenges.sequencing.options.change_clothes'), t('challenges.sequencing.options.shower'), t('challenges.sequencing.options.warm_up'), t('challenges.sequencing.options.enter_pool'), t('challenges.sequencing.options.swim')],
        correctAnswer: [0, 1, 2, 3, 4], explanation: t('challenges.sequencing.explanation_swim'), hint: t('challenges.sequencing.hint_swim') },
      { id: 'seq-24', question: t('challenges.sequencing.go_shopping'), emoji: '🛒',
        options: [t('challenges.sequencing.options.make_list'), t('challenges.sequencing.options.go_to_store'), t('challenges.sequencing.options.pick_items'), t('challenges.sequencing.options.pay'), t('challenges.sequencing.options.go_home')],
        correctAnswer: [0, 1, 2, 3, 4], explanation: t('challenges.sequencing.explanation_go_shopping'), hint: t('challenges.sequencing.hint_go_shopping') },
      { id: 'seq-25', question: t('challenges.sequencing.take_photo'), emoji: '📷',
        options: [t('challenges.sequencing.options.open_camera'), t('challenges.sequencing.options.compose'), t('challenges.sequencing.options.focus'), t('challenges.sequencing.options.take'), t('challenges.sequencing.options.save')],
        correctAnswer: [0, 1, 2, 3, 4], explanation: t('challenges.sequencing.explanation_take_photo'), hint: t('challenges.sequencing.hint_take_photo') },
      { id: 'seq-26', question: t('challenges.sequencing.make_taco'), emoji: '🌮',
        options: [t('challenges.sequencing.options.prepare_shell'), t('challenges.sequencing.options.cook_meat'), t('challenges.sequencing.options.add_vegetables'), t('challenges.sequencing.options.add_sauce'), t('challenges.sequencing.options.wrap')],
        correctAnswer: [0, 1, 2, 3, 4], explanation: t('challenges.sequencing.explanation_make_taco'), hint: t('challenges.sequencing.hint_make_taco') },
      { id: 'seq-27', question: t('challenges.sequencing.wrap_gift'), emoji: '🎁',
        options: [t('challenges.sequencing.options.place_gift'), t('challenges.sequencing.options.wrap_paper'), t('challenges.sequencing.options.tape'), t('challenges.sequencing.options.tie_bow'), t('challenges.sequencing.options.add_card')],
        correctAnswer: [0, 1, 2, 3, 4], explanation: t('challenges.sequencing.explanation_wrap_gift'), hint: t('challenges.sequencing.hint_wrap_gift') },
      { id: 'seq-28', question: t('challenges.sequencing.take_shower'), emoji: '🚿',
        options: [t('challenges.sequencing.options.turn_on_water'), t('challenges.sequencing.options.adjust_temp'), t('challenges.sequencing.options.use_soap'), t('challenges.sequencing.options.wash_hair'), t('challenges.sequencing.options.rinse'), t('challenges.sequencing.options.dry')],
        correctAnswer: [0, 1, 2, 3, 4, 5], explanation: t('challenges.sequencing.explanation_take_shower'), hint: t('challenges.sequencing.hint_take_shower') },
      { id: 'seq-29', question: t('challenges.sequencing.prepare_for_school'), emoji: '🎓',
        options: [t('challenges.sequencing.options.wake_up'), t('challenges.sequencing.options.shower'), t('challenges.sequencing.options.get_dressed'), t('challenges.sequencing.options.eat'), t('challenges.sequencing.options.pack_bag'), t('challenges.sequencing.options.leave')],
        correctAnswer: [0, 1, 2, 3, 4, 5], explanation: t('challenges.sequencing.explanation_prepare_for_school'), hint: t('challenges.sequencing.hint_prepare_for_school') },
      { id: 'seq-30', question: t('challenges.sequencing.organize_party'), emoji: '🎪',
        options: [t('challenges.sequencing.options.plan'), t('challenges.sequencing.options.book_venue'), t('challenges.sequencing.options.buy_decorations'), t('challenges.sequencing.options.decorate'), t('challenges.sequencing.options.receive_guests')],
        correctAnswer: [0, 1, 2, 3, 4], explanation: t('challenges.sequencing.explanation_organize_party'), hint: t('challenges.sequencing.hint_organize_party') },
    ];

    return allChallenges;
  };

  // Generate Pattern Challenges
  const generatePatternChallenges = (): Challenge[] => {
    const allChallenges = [
      {
        id: 'pat-1',
        question: t('challenges.patterns.number_pattern') + ': 2, 4, 6, 8, ?',
        options: ['9', '10', '11', '12'],
        correctAnswer: [1],
        explanation: t('challenges.patterns.explanation_even'),
        hint: t('challenges.patterns.hint_add_two')
      },
      {
        id: 'pat-2',
        question: t('challenges.patterns.shape_pattern') + ': ⭐🔵⭐🔵⭐?',
        options: ['⭐', '🔵', '🔴', '⚫'],
        correctAnswer: [1],
        explanation: t('challenges.patterns.explanation_alternate'),
        hint: t('challenges.patterns.hint_repeat')
      },
      {
        id: 'pat-3',
        question: t('challenges.patterns.color_pattern') + ': 🔴🔴🔵🔴🔴🔵🔴🔴?',
        options: ['🔴', '🔵', '🟡', '🟢'],
        correctAnswer: [1],
        explanation: t('challenges.patterns.explanation_two_one'),
        hint: t('challenges.patterns.hint_group')
      },
      { id: 'pat-4', question: t('challenges.patterns.pat_4'), options: ['8', '9', '10', '12'], correctAnswer: [2], explanation: t('challenges.patterns.explanation_pat_4'), hint: t('challenges.patterns.hint_pat_4') },
      { id: 'pat-5', question: t('challenges.patterns.pat_5'), options: ['11', '12', '13', '14'], correctAnswer: [2], explanation: t('challenges.patterns.explanation_pat_5'), hint: t('challenges.patterns.hint_pat_5') },
      { id: 'pat-6', question: t('challenges.patterns.pat_6'), options: ['50', '60', '65', '70'], correctAnswer: [1], explanation: t('challenges.patterns.explanation_pat_6'), hint: t('challenges.patterns.hint_pat_6') },
      { id: 'pat-7', question: t('challenges.patterns.pat_7'), options: ['24', '28', '32', '64'], correctAnswer: [2], explanation: t('challenges.patterns.explanation_pat_7'), hint: t('challenges.patterns.hint_pat_7') },
      { id: 'pat-8', question: t('challenges.patterns.pat_8'), options: ['5', '6', '7', '8'], correctAnswer: [3], explanation: t('challenges.patterns.explanation_pat_8'), hint: t('challenges.patterns.hint_pat_8') },
      { id: 'pat-9', question: t('challenges.patterns.pat_9'), options: ['8', '9', '10', '11'], correctAnswer: [1], explanation: t('challenges.patterns.explanation_pat_9'), hint: t('challenges.patterns.hint_pat_9') },
      { id: 'pat-10', question: t('challenges.patterns.pat_10'), options: ['40', '45', '50', '55'], correctAnswer: [2], explanation: t('challenges.patterns.explanation_pat_10'), hint: t('challenges.patterns.hint_pat_10') },
      { id: 'pat-11', question: t('challenges.patterns.pat_11'), options: ['25', '30', '32', '35'], correctAnswer: [1], explanation: t('challenges.patterns.explanation_pat_11'), hint: t('challenges.patterns.hint_pat_11') },
      { id: 'pat-12', question: t('challenges.patterns.pat_12'), options: ['13', '14', '15', '16'], correctAnswer: [2], explanation: t('challenges.patterns.explanation_pat_12'), hint: t('challenges.patterns.hint_pat_12') },
      { id: 'pat-13', question: t('challenges.patterns.pat_13'), options: ['🌙', '🌟', '⭐', '☀️'], correctAnswer: [1], explanation: t('challenges.patterns.explanation_pat_13'), hint: t('challenges.patterns.hint_pat_13') },
      { id: 'pat-14', question: t('challenges.patterns.pat_14'), options: ['⬛', '⬜', '🔲', '🔳'], correctAnswer: [0], explanation: t('challenges.patterns.explanation_pat_14'), hint: t('challenges.patterns.hint_pat_14') },
      { id: 'pat-15', question: t('challenges.patterns.pat_15'), options: ['🔴', '🔵', '🟡', '🟢'], correctAnswer: [2], explanation: t('challenges.patterns.explanation_pat_15'), hint: t('challenges.patterns.hint_pat_15') },
      { id: 'pat-16', question: t('challenges.patterns.pat_16'), options: ['H', 'I', 'J', 'K'], correctAnswer: [1], explanation: t('challenges.patterns.explanation_pat_16'), hint: t('challenges.patterns.hint_pat_16') },
      { id: 'pat-17', question: t('challenges.patterns.pat_17'), options: ['20', '22', '25', '30'], correctAnswer: [2], explanation: t('challenges.patterns.explanation_pat_17'), hint: t('challenges.patterns.hint_pat_17') },
      { id: 'pat-18', question: t('challenges.patterns.pat_18'), options: ['2', '4', '6', '8'], correctAnswer: [1], explanation: t('challenges.patterns.explanation_pat_18'), hint: t('challenges.patterns.hint_pat_18') },
      { id: 'pat-19', question: t('challenges.patterns.pat_19'), options: ['20', '22', '24', '25'], correctAnswer: [3], explanation: t('challenges.patterns.explanation_pat_19'), hint: t('challenges.patterns.hint_pat_19') },
      { id: 'pat-20', question: t('challenges.patterns.pat_20'), options: ['12', '13', '14', '15'], correctAnswer: [1], explanation: t('challenges.patterns.explanation_pat_20'), hint: t('challenges.patterns.hint_pat_20') },
      { id: 'pat-21', question: t('challenges.patterns.pat_21'), options: ['🍎', '🍌', '🍊', '🍇'], correctAnswer: [0], explanation: t('challenges.patterns.explanation_pat_21'), hint: t('challenges.patterns.hint_pat_21') },
      { id: 'pat-22', question: t('challenges.patterns.pat_22'), options: ['❤️', '💛', '💚', '💙'], correctAnswer: [0], explanation: t('challenges.patterns.explanation_pat_22'), hint: t('challenges.patterns.hint_pat_22') },
      { id: 'pat-23', question: t('challenges.patterns.pat_23'), options: ['25', '28', '30', '35'], correctAnswer: [2], explanation: t('challenges.patterns.explanation_pat_23'), hint: t('challenges.patterns.hint_pat_23') },
      { id: 'pat-24', question: t('challenges.patterns.pat_24'), options: ['12', '14', '16', '18'], correctAnswer: [2], explanation: t('challenges.patterns.explanation_pat_24'), hint: t('challenges.patterns.hint_pat_24') },
      { id: 'pat-25', question: t('challenges.patterns.pat_25'), options: ['⭐', '🌟', '💫', '✨'], correctAnswer: [0], explanation: t('challenges.patterns.explanation_pat_25'), hint: t('challenges.patterns.hint_pat_25') },
      { id: 'pat-26', question: t('challenges.patterns.pat_26'), options: ['6', '7', '8', '9'], correctAnswer: [2], explanation: t('challenges.patterns.explanation_pat_26'), hint: t('challenges.patterns.hint_pat_26') },
      { id: 'pat-27', question: t('challenges.patterns.pat_27'), options: ['🔴', '🔵', '🟢', '🟡'], correctAnswer: [0], explanation: t('challenges.patterns.explanation_pat_27'), hint: t('challenges.patterns.hint_pat_27') },
      { id: 'pat-28', question: t('challenges.patterns.pat_28'), options: ['10', '11', '12', '13'], correctAnswer: [3], explanation: t('challenges.patterns.explanation_pat_28'), hint: t('challenges.patterns.hint_pat_28') },
      { id: 'pat-29', question: t('challenges.patterns.pat_29'), options: ['50', '52', '55', '60'], correctAnswer: [2], explanation: t('challenges.patterns.explanation_pat_29'), hint: t('challenges.patterns.hint_pat_29') },
      { id: 'pat-30', question: t('challenges.patterns.pat_30'), options: ['🔴', '🔵', '🟢', '🟡'], correctAnswer: [0], explanation: t('challenges.patterns.explanation_pat_30'), hint: t('challenges.patterns.hint_pat_30') }
    ];

    return allChallenges;
  };

  // Generate Loop Challenges
  const generateLoopChallenges = (): Challenge[] => {
    const allChallenges = [
      { id: 'loop-1', question: t('challenges.loops.jump_5_times'), emoji: '🦘',
        options: [t('challenges.loops.options.jump_once'), t('challenges.loops.options.repeat_5'), t('challenges.loops.options.jump_twice'), t('challenges.loops.options.stop')],
        correctAnswer: [1], explanation: t('challenges.loops.explanation_repeat'), hint: t('challenges.loops.hint_loop') },
      { id: 'loop-2', question: t('challenges.loops.draw_3_stars'), emoji: '⭐',
        options: [t('challenges.loops.options.draw_star'), t('challenges.loops.options.repeat_3'), t('challenges.loops.options.draw_circle'), t('challenges.loops.options.color_red')],
        correctAnswer: [1], explanation: t('challenges.loops.explanation_three_times'), hint: t('challenges.loops.hint_same_action') },
      { id: 'loop-3', question: t('challenges.loops.count_to_10'), emoji: '🔢',
        options: [t('challenges.loops.options.say_numbers'), t('challenges.loops.options.repeat_10'), t('challenges.loops.options.add_one'), t('challenges.loops.options.start_at_1')],
        correctAnswer: [1], explanation: t('challenges.loops.explanation_count'), hint: t('challenges.loops.hint_increment') },
      { id: 'loop-4', question: t('challenges.loops.draw_square'), emoji: '⬛',
        options: [t('challenges.loops.options.draw_line'), t('challenges.loops.options.turn_90'), t('challenges.loops.options.repeat_4'), t('challenges.loops.options.stop')],
        correctAnswer: [2], explanation: t('challenges.loops.explanation_square'), hint: t('challenges.loops.hint_square') },
      { id: 'loop-5', question: t('challenges.loops.print_1_to_20'), emoji: '📝',
        options: [t('challenges.loops.options.print_number'), t('challenges.loops.options.repeat_20'), t('challenges.loops.options.add_one'), t('challenges.loops.options.start_at_1')],
        correctAnswer: [1], explanation: t('challenges.loops.explanation_print'), hint: t('challenges.loops.hint_print') },
      { id: 'loop-6', question: t('challenges.loops.countdown'), emoji: '⏰',
        options: [t('challenges.loops.options.print_number'), t('challenges.loops.options.repeat_10'), t('challenges.loops.options.subtract_one'), t('challenges.loops.options.start_at_10')],
        correctAnswer: [1], explanation: t('challenges.loops.explanation_countdown'), hint: t('challenges.loops.hint_countdown') },
      { id: 'loop-7', question: t('challenges.loops.clap_8_times'), emoji: '👏',
        options: [t('challenges.loops.options.clap_once'), t('challenges.loops.options.repeat_8'), t('challenges.loops.options.clap_twice'), t('challenges.loops.options.stop')],
        correctAnswer: [1], explanation: t('challenges.loops.explanation_clap'), hint: t('challenges.loops.hint_clap') },
      { id: 'loop-8', question: t('challenges.loops.draw_star'), emoji: '⭐',
        options: [t('challenges.loops.options.draw_line'), t('challenges.loops.options.turn_144'), t('challenges.loops.options.repeat_5'), t('challenges.loops.options.stop')],
        correctAnswer: [2], explanation: t('challenges.loops.explanation_star'), hint: t('challenges.loops.hint_star') },
      { id: 'loop-9', question: t('challenges.loops.deal_cards'), emoji: '🃏',
        options: [t('challenges.loops.options.pick_card'), t('challenges.loops.options.give_player'), t('challenges.loops.options.repeat_4'), t('challenges.loops.options.shuffle')],
        correctAnswer: [2], explanation: t('challenges.loops.explanation_cards'), hint: t('challenges.loops.hint_cards') },
      { id: 'loop-10', question: t('challenges.loops.draw_circles'), emoji: '⭕',
        options: [t('challenges.loops.options.draw_circle'), t('challenges.loops.options.move_position'), t('challenges.loops.options.repeat_6'), t('challenges.loops.options.stop')],
        correctAnswer: [2], explanation: t('challenges.loops.explanation_circles'), hint: t('challenges.loops.hint_circles') },
      { id: 'loop-11', question: t('challenges.loops.loop_11'), emoji: '🎵', options: [t('challenges.loops.options.loop_11_1'), t('challenges.loops.options.loop_11_2'), t('challenges.loops.options.loop_11_3'), t('challenges.loops.options.loop_11_4')], correctAnswer: [1], explanation: t('challenges.loops.explanation_loop_11'), hint: t('challenges.loops.hint_loop_11') },
      { id: 'loop-12', question: t('challenges.loops.loop_12'), emoji: '🏃', options: [t('challenges.loops.options.loop_12_1'), t('challenges.loops.options.loop_12_2'), t('challenges.loops.options.loop_12_3'), t('challenges.loops.options.loop_12_4')], correctAnswer: [1], explanation: t('challenges.loops.explanation_loop_12'), hint: t('challenges.loops.hint_loop_12') },
      { id: 'loop-13', question: t('challenges.loops.loop_13'), emoji: '📖', options: [t('challenges.loops.options.loop_13_1'), t('challenges.loops.options.loop_13_2'), t('challenges.loops.options.loop_13_3'), t('challenges.loops.options.loop_13_4')], correctAnswer: [1], explanation: t('challenges.loops.explanation_loop_13'), hint: t('challenges.loops.hint_loop_13') },
      { id: 'loop-14', question: t('challenges.loops.loop_14'), emoji: '🎯', options: [t('challenges.loops.options.loop_14_1'), t('challenges.loops.options.loop_14_2'), t('challenges.loops.options.loop_14_3'), t('challenges.loops.options.loop_14_4')], correctAnswer: [1], explanation: t('challenges.loops.explanation_loop_14'), hint: t('challenges.loops.hint_loop_14') },
      { id: 'loop-15', question: t('challenges.loops.loop_15'), emoji: '✏️', options: [t('challenges.loops.options.loop_15_1'), t('challenges.loops.options.loop_15_2'), t('challenges.loops.options.loop_15_3'), t('challenges.loops.options.loop_15_4')], correctAnswer: [1], explanation: t('challenges.loops.explanation_loop_15'), hint: t('challenges.loops.hint_loop_15') },
      { id: 'loop-16', question: t('challenges.loops.loop_16'), emoji: '🎨', options: [t('challenges.loops.options.loop_16_1'), t('challenges.loops.options.loop_16_2'), t('challenges.loops.options.loop_16_3'), t('challenges.loops.options.loop_16_4')], correctAnswer: [1], explanation: t('challenges.loops.explanation_loop_16'), hint: t('challenges.loops.hint_loop_16') },
      { id: 'loop-17', question: t('challenges.loops.loop_17'), emoji: '🧮', options: [t('challenges.loops.options.loop_17_1'), t('challenges.loops.options.loop_17_2'), t('challenges.loops.options.loop_17_3'), t('challenges.loops.options.loop_17_4')], correctAnswer: [1], explanation: t('challenges.loops.explanation_loop_17'), hint: t('challenges.loops.hint_loop_17') },
      { id: 'loop-18', question: t('challenges.loops.loop_18'), emoji: '🏀', options: [t('challenges.loops.options.loop_18_1'), t('challenges.loops.options.loop_18_2'), t('challenges.loops.options.loop_18_3'), t('challenges.loops.options.loop_18_4')], correctAnswer: [1], explanation: t('challenges.loops.explanation_loop_18'), hint: t('challenges.loops.hint_loop_18') },
      { id: 'loop-19', question: t('challenges.loops.loop_19'), emoji: '🔔', options: [t('challenges.loops.options.loop_19_1'), t('challenges.loops.options.loop_19_2'), t('challenges.loops.options.loop_19_3'), t('challenges.loops.options.loop_19_4')], correctAnswer: [1], explanation: t('challenges.loops.explanation_loop_19'), hint: t('challenges.loops.hint_loop_19') },
      { id: 'loop-20', question: t('challenges.loops.loop_20'), emoji: '🎹', options: [t('challenges.loops.options.loop_20_1'), t('challenges.loops.options.loop_20_2'), t('challenges.loops.options.loop_20_3'), t('challenges.loops.options.loop_20_4')], correctAnswer: [1], explanation: t('challenges.loops.explanation_loop_20'), hint: t('challenges.loops.hint_loop_20') },
      { id: 'loop-21', question: t('challenges.loops.loop_21'), emoji: '🍪', options: [t('challenges.loops.options.loop_21_1'), t('challenges.loops.options.loop_21_2'), t('challenges.loops.options.loop_21_3'), t('challenges.loops.options.loop_21_4')], correctAnswer: [1], explanation: t('challenges.loops.explanation_loop_21'), hint: t('challenges.loops.hint_loop_21') },
      { id: 'loop-22', question: t('challenges.loops.loop_22'), emoji: '💡', options: [t('challenges.loops.options.loop_22_1'), t('challenges.loops.options.loop_22_2'), t('challenges.loops.options.loop_22_3'), t('challenges.loops.options.loop_22_4')], correctAnswer: [1], explanation: t('challenges.loops.explanation_loop_22'), hint: t('challenges.loops.hint_loop_22') },
      { id: 'loop-23', question: t('challenges.loops.loop_23'), emoji: '📝', options: [t('challenges.loops.options.loop_23_1'), t('challenges.loops.options.loop_23_2'), t('challenges.loops.options.loop_23_3'), t('challenges.loops.options.loop_23_4')], correctAnswer: [1], explanation: t('challenges.loops.explanation_loop_23'), hint: t('challenges.loops.hint_loop_23') },
      { id: 'loop-24', question: t('challenges.loops.loop_24'), emoji: '🎪', options: [t('challenges.loops.options.loop_24_1'), t('challenges.loops.options.loop_24_2'), t('challenges.loops.options.loop_24_3'), t('challenges.loops.options.loop_24_4')], correctAnswer: [1], explanation: t('challenges.loops.explanation_loop_24'), hint: t('challenges.loops.hint_loop_24') },
      { id: 'loop-25', question: t('challenges.loops.loop_25'), emoji: '🌸', options: [t('challenges.loops.options.loop_25_1'), t('challenges.loops.options.loop_25_2'), t('challenges.loops.options.loop_25_3'), t('challenges.loops.options.loop_25_4')], correctAnswer: [1], explanation: t('challenges.loops.explanation_loop_25'), hint: t('challenges.loops.hint_loop_25') },
      { id: 'loop-26', question: t('challenges.loops.loop_26'), emoji: '🎲', options: [t('challenges.loops.options.loop_26_1'), t('challenges.loops.options.loop_26_2'), t('challenges.loops.options.loop_26_3'), t('challenges.loops.options.loop_26_4')], correctAnswer: [1], explanation: t('challenges.loops.explanation_loop_26'), hint: t('challenges.loops.hint_loop_26') },
      { id: 'loop-27', question: t('challenges.loops.loop_27'), emoji: '🎭', options: [t('challenges.loops.options.loop_27_1'), t('challenges.loops.options.loop_27_2'), t('challenges.loops.options.loop_27_3'), t('challenges.loops.options.loop_27_4')], correctAnswer: [1], explanation: t('challenges.loops.explanation_loop_27'), hint: t('challenges.loops.hint_loop_27') },
      { id: 'loop-28', question: t('challenges.loops.loop_28'), emoji: '🏐', options: [t('challenges.loops.options.loop_28_1'), t('challenges.loops.options.loop_28_2'), t('challenges.loops.options.loop_28_3'), t('challenges.loops.options.loop_28_4')], correctAnswer: [1], explanation: t('challenges.loops.explanation_loop_28'), hint: t('challenges.loops.hint_loop_28') },
      { id: 'loop-29', question: t('challenges.loops.loop_29'), emoji: '🧩', options: [t('challenges.loops.options.loop_29_1'), t('challenges.loops.options.loop_29_2'), t('challenges.loops.options.loop_29_3'), t('challenges.loops.options.loop_29_4')], correctAnswer: [1], explanation: t('challenges.loops.explanation_loop_29'), hint: t('challenges.loops.hint_loop_29') },
      { id: 'loop-30', question: t('challenges.loops.loop_30'), emoji: '🎺', options: [t('challenges.loops.options.loop_30_1'), t('challenges.loops.options.loop_30_2'), t('challenges.loops.options.loop_30_3'), t('challenges.loops.options.loop_30_4')], correctAnswer: [1], explanation: t('challenges.loops.explanation_loop_30'), hint: t('challenges.loops.hint_loop_30') },
    ];

    return allChallenges;
  };

  // Generate Conditional Challenges
  const generateConditionalChallenges = (): Challenge[] => {
    const allChallenges = [
      { id: 'cond-1', question: t('challenges.conditionals.if_raining'), emoji: '🌧️',
        options: [t('challenges.conditionals.options.take_umbrella'), t('challenges.conditionals.options.wear_sunglasses'), t('challenges.conditionals.options.go_swimming'), t('challenges.conditionals.options.play_outside')],
        correctAnswer: [0], explanation: t('challenges.conditionals.explanation_umbrella'), hint: t('challenges.conditionals.hint_weather') },
      { id: 'cond-2', question: t('challenges.conditionals.if_hungry'), emoji: '🍔',
        options: [t('challenges.conditionals.options.sleep'), t('challenges.conditionals.options.eat_food'), t('challenges.conditionals.options.play_game'), t('challenges.conditionals.options.read_book')],
        correctAnswer: [1], explanation: t('challenges.conditionals.explanation_eat'), hint: t('challenges.conditionals.hint_feeling') },
      { id: 'cond-3', question: t('challenges.conditionals.if_red_light'), emoji: '🚦',
        options: [t('challenges.conditionals.options.stop'), t('challenges.conditionals.options.go_fast'), t('challenges.conditionals.options.turn_left'), t('challenges.conditionals.options.honk')],
        correctAnswer: [0], explanation: t('challenges.conditionals.explanation_traffic'), hint: t('challenges.conditionals.hint_safety') },
      { id: 'cond-4', question: t('challenges.conditionals.if_score_50'), emoji: '📊',
        options: [t('challenges.conditionals.options.pass'), t('challenges.conditionals.options.fail'), t('challenges.conditionals.options.retry'), t('challenges.conditionals.options.celebrate')],
        correctAnswer: [0], explanation: t('challenges.conditionals.explanation_score'), hint: t('challenges.conditionals.hint_score') },
      { id: 'cond-5', question: t('challenges.conditionals.if_age_18'), emoji: '🗳️',
        options: [t('challenges.conditionals.options.can_vote'), t('challenges.conditionals.options.cannot_vote'), t('challenges.conditionals.options.maybe'), t('challenges.conditionals.options.ask_parent')],
        correctAnswer: [0], explanation: t('challenges.conditionals.explanation_age'), hint: t('challenges.conditionals.hint_age') },
      { id: 'cond-6', question: t('challenges.conditionals.if_temp_37'), emoji: '🌡️',
        options: [t('challenges.conditionals.options.sick'), t('challenges.conditionals.options.normal'), t('challenges.conditionals.options.cold'), t('challenges.conditionals.options.exercise')],
        correctAnswer: [0], explanation: t('challenges.conditionals.explanation_temp'), hint: t('challenges.conditionals.hint_temp') },
      { id: 'cond-7', question: t('challenges.conditionals.if_money_100'), emoji: '💰',
        options: [t('challenges.conditionals.options.can_buy'), t('challenges.conditionals.options.cannot_buy'), t('challenges.conditionals.options.borrow'), t('challenges.conditionals.options.save')],
        correctAnswer: [0], explanation: t('challenges.conditionals.explanation_money'), hint: t('challenges.conditionals.hint_money') },
      { id: 'cond-8', question: t('challenges.conditionals.if_battery_20'), emoji: '🔋',
        options: [t('challenges.conditionals.options.charge'), t('challenges.conditionals.options.use_more'), t('challenges.conditionals.options.turn_off'), t('challenges.conditionals.options.buy_new')],
        correctAnswer: [0], explanation: t('challenges.conditionals.explanation_battery'), hint: t('challenges.conditionals.hint_battery') },
      { id: 'cond-9', question: t('challenges.conditionals.if_sunny'), emoji: '☀️',
        options: [t('challenges.conditionals.options.wear_hat'), t('challenges.conditionals.options.take_umbrella'), t('challenges.conditionals.options.wear_jacket'), t('challenges.conditionals.options.stay_inside')],
        correctAnswer: [0], explanation: t('challenges.conditionals.explanation_sunny'), hint: t('challenges.conditionals.hint_sunny') },
      { id: 'cond-10', question: t('challenges.conditionals.if_tired'), emoji: '😴',
        options: [t('challenges.conditionals.options.sleep'), t('challenges.conditionals.options.run'), t('challenges.conditionals.options.study'), t('challenges.conditionals.options.play')],
        correctAnswer: [0], explanation: t('challenges.conditionals.explanation_tired'), hint: t('challenges.conditionals.hint_tired') },
      { id: 'cond-11', question: t('challenges.conditionals.cond_11'), emoji: '❄️', options: [t('challenges.conditionals.options.cond_11_1'), t('challenges.conditionals.options.cond_11_2'), t('challenges.conditionals.options.cond_11_3'), t('challenges.conditionals.options.cond_11_4')], correctAnswer: [0], explanation: t('challenges.conditionals.explanation_cond_11'), hint: t('challenges.conditionals.hint_cond_11') },
      { id: 'cond-12', question: t('challenges.conditionals.cond_12'), emoji: '📚', options: [t('challenges.conditionals.options.cond_12_1'), t('challenges.conditionals.options.cond_12_2'), t('challenges.conditionals.options.cond_12_3'), t('challenges.conditionals.options.cond_12_4')], correctAnswer: [0], explanation: t('challenges.conditionals.explanation_cond_12'), hint: t('challenges.conditionals.hint_cond_12') },
      { id: 'cond-13', question: t('challenges.conditionals.cond_13'), emoji: '🚪', options: [t('challenges.conditionals.options.cond_13_1'), t('challenges.conditionals.options.cond_13_2'), t('challenges.conditionals.options.cond_13_3'), t('challenges.conditionals.options.cond_13_4')], correctAnswer: [0], explanation: t('challenges.conditionals.explanation_cond_13'), hint: t('challenges.conditionals.hint_cond_13') },
      { id: 'cond-14', question: t('challenges.conditionals.cond_14'), emoji: '🔊', options: [t('challenges.conditionals.options.cond_14_1'), t('challenges.conditionals.options.cond_14_2'), t('challenges.conditionals.options.cond_14_3'), t('challenges.conditionals.options.cond_14_4')], correctAnswer: [0], explanation: t('challenges.conditionals.explanation_cond_14'), hint: t('challenges.conditionals.hint_cond_14') },
      { id: 'cond-15', question: t('challenges.conditionals.cond_15'), emoji: '💰', options: [t('challenges.conditionals.options.cond_15_1'), t('challenges.conditionals.options.cond_15_2'), t('challenges.conditionals.options.cond_15_3'), t('challenges.conditionals.options.cond_15_4')], correctAnswer: [0], explanation: t('challenges.conditionals.explanation_cond_15'), hint: t('challenges.conditionals.hint_cond_15') },
      { id: 'cond-16', question: t('challenges.conditionals.cond_16'), emoji: '🌙', options: [t('challenges.conditionals.options.cond_16_1'), t('challenges.conditionals.options.cond_16_2'), t('challenges.conditionals.options.cond_16_3'), t('challenges.conditionals.options.cond_16_4')], correctAnswer: [0], explanation: t('challenges.conditionals.explanation_cond_16'), hint: t('challenges.conditionals.hint_cond_16') },
      { id: 'cond-17', question: t('challenges.conditionals.cond_17'), emoji: '📵', options: [t('challenges.conditionals.options.cond_17_1'), t('challenges.conditionals.options.cond_17_2'), t('challenges.conditionals.options.cond_17_3'), t('challenges.conditionals.options.cond_17_4')], correctAnswer: [0], explanation: t('challenges.conditionals.explanation_cond_17'), hint: t('challenges.conditionals.hint_cond_17') },
      { id: 'cond-18', question: t('challenges.conditionals.cond_18'), emoji: '🚗', options: [t('challenges.conditionals.options.cond_18_1'), t('challenges.conditionals.options.cond_18_2'), t('challenges.conditionals.options.cond_18_3'), t('challenges.conditionals.options.cond_18_4')], correctAnswer: [0], explanation: t('challenges.conditionals.explanation_cond_18'), hint: t('challenges.conditionals.hint_cond_18') },
      { id: 'cond-19', question: t('challenges.conditionals.cond_19'), emoji: '🤒', options: [t('challenges.conditionals.options.cond_19_1'), t('challenges.conditionals.options.cond_19_2'), t('challenges.conditionals.options.cond_19_3'), t('challenges.conditionals.options.cond_19_4')], correctAnswer: [0], explanation: t('challenges.conditionals.explanation_cond_19'), hint: t('challenges.conditionals.hint_cond_19') },
      { id: 'cond-20', question: t('challenges.conditionals.cond_20'), emoji: '🎮', options: [t('challenges.conditionals.options.cond_20_1'), t('challenges.conditionals.options.cond_20_2'), t('challenges.conditionals.options.cond_20_3'), t('challenges.conditionals.options.cond_20_4')], correctAnswer: [0], explanation: t('challenges.conditionals.explanation_cond_20'), hint: t('challenges.conditionals.hint_cond_20') },
      { id: 'cond-21', question: t('challenges.conditionals.cond_21'), emoji: '🌡️', options: [t('challenges.conditionals.options.cond_21_1'), t('challenges.conditionals.options.cond_21_2'), t('challenges.conditionals.options.cond_21_3'), t('challenges.conditionals.options.cond_21_4')], correctAnswer: [0], explanation: t('challenges.conditionals.explanation_cond_21'), hint: t('challenges.conditionals.hint_cond_21') },
      { id: 'cond-22', question: t('challenges.conditionals.cond_22'), emoji: '📱', options: [t('challenges.conditionals.options.cond_22_1'), t('challenges.conditionals.options.cond_22_2'), t('challenges.conditionals.options.cond_22_3'), t('challenges.conditionals.options.cond_22_4')], correctAnswer: [0], explanation: t('challenges.conditionals.explanation_cond_22'), hint: t('challenges.conditionals.hint_cond_22') },
      { id: 'cond-23', question: t('challenges.conditionals.cond_23'), emoji: '🏃‍♂️', options: [t('challenges.conditionals.options.cond_23_1'), t('challenges.conditionals.options.cond_23_2'), t('challenges.conditionals.options.cond_23_3'), t('challenges.conditionals.options.cond_23_4')], correctAnswer: [0], explanation: t('challenges.conditionals.explanation_cond_23'), hint: t('challenges.conditionals.hint_cond_23') },
      { id: 'cond-24', question: t('challenges.conditionals.cond_24'), emoji: '🍽️', options: [t('challenges.conditionals.options.cond_24_1'), t('challenges.conditionals.options.cond_24_2'), t('challenges.conditionals.options.cond_24_3'), t('challenges.conditionals.options.cond_24_4')], correctAnswer: [0], explanation: t('challenges.conditionals.explanation_cond_24'), hint: t('challenges.conditionals.hint_cond_24') },
      { id: 'cond-25', question: t('challenges.conditionals.cond_25'), emoji: '🎯', options: [t('challenges.conditionals.options.cond_25_1'), t('challenges.conditionals.options.cond_25_2'), t('challenges.conditionals.options.cond_25_3'), t('challenges.conditionals.options.cond_25_4')], correctAnswer: [0], explanation: t('challenges.conditionals.explanation_cond_25'), hint: t('challenges.conditionals.hint_cond_25') },
      { id: 'cond-26', question: t('challenges.conditionals.cond_26'), emoji: '🚦', options: [t('challenges.conditionals.options.cond_26_1'), t('challenges.conditionals.options.cond_26_2'), t('challenges.conditionals.options.cond_26_3'), t('challenges.conditionals.options.cond_26_4')], correctAnswer: [0], explanation: t('challenges.conditionals.explanation_cond_26'), hint: t('challenges.conditionals.hint_cond_26') },
      { id: 'cond-27', question: t('challenges.conditionals.cond_27'), emoji: '📖', options: [t('challenges.conditionals.options.cond_27_1'), t('challenges.conditionals.options.cond_27_2'), t('challenges.conditionals.options.cond_27_3'), t('challenges.conditionals.options.cond_27_4')], correctAnswer: [0], explanation: t('challenges.conditionals.explanation_cond_27'), hint: t('challenges.conditionals.hint_cond_27') },
      { id: 'cond-28', question: t('challenges.conditionals.cond_28'), emoji: '🔑', options: [t('challenges.conditionals.options.cond_28_1'), t('challenges.conditionals.options.cond_28_2'), t('challenges.conditionals.options.cond_28_3'), t('challenges.conditionals.options.cond_28_4')], correctAnswer: [0], explanation: t('challenges.conditionals.explanation_cond_28'), hint: t('challenges.conditionals.hint_cond_28') },
      { id: 'cond-29', question: t('challenges.conditionals.cond_29'), emoji: '🎵', options: [t('challenges.conditionals.options.cond_29_1'), t('challenges.conditionals.options.cond_29_2'), t('challenges.conditionals.options.cond_29_3'), t('challenges.conditionals.options.cond_29_4')], correctAnswer: [0], explanation: t('challenges.conditionals.explanation_cond_29'), hint: t('challenges.conditionals.hint_cond_29') },
      { id: 'cond-30', question: t('challenges.conditionals.cond_30'), emoji: '💧', options: [t('challenges.conditionals.options.cond_30_1'), t('challenges.conditionals.options.cond_30_2'), t('challenges.conditionals.options.cond_30_3'), t('challenges.conditionals.options.cond_30_4')], correctAnswer: [0], explanation: t('challenges.conditionals.explanation_cond_30'), hint: t('challenges.conditionals.hint_cond_30') },
    ];

    return allChallenges;
  };

  const startGame = (mode: 'sequencing' | 'patterns' | 'loops' | 'conditionals') => {
    let allChallenges: Challenge[] = [];
    
    switch (mode) {
      case 'sequencing':
        allChallenges = generateSequencingChallenges();
        break;
      case 'patterns':
        allChallenges = generatePatternChallenges();
        break;
      case 'loops':
        allChallenges = generateLoopChallenges();
        break;
      case 'conditionals':
        allChallenges = generateConditionalChallenges();
        break;
    }

    // Shuffle and select based on questionCount
    const shuffled = [...allChallenges].sort(() => Math.random() - 0.5);
    const selectedChallenges = shuffled.slice(0, Math.min(questionCount, allChallenges.length));

    setChallenges(selectedChallenges);
    setGameMode(mode);
    setCurrentChallenge(0);
    setScore(0);
    setAttempts(0);
    setTimeElapsed(0);
    setSelectedAnswer([]);
    setShowExplanation(false);
    setShowHint(false);
    setIsRunning(true);
    setAnswerHistory([]);
  };

  const handleAnswerSelect = (index: number) => {
    if (gameMode === 'sequencing') {
      // For sequencing, allow multiple selections in order
      if (!selectedAnswer.includes(index)) {
        setSelectedAnswer([...selectedAnswer, index]);
      }
    } else {
      // For other modes, single selection
      setSelectedAnswer([index]);
    }
  };

  const checkAnswer = () => {
    const challenge = challenges[currentChallenge];
    const isCorrect = JSON.stringify(selectedAnswer) === JSON.stringify(challenge.correctAnswer);

    // Save to history
    setAnswerHistory([...answerHistory, {
      questionIndex: currentChallenge,
      selectedAnswer: [...selectedAnswer],
      isCorrect,
      challenge
    }]);

    if (isCorrect) {
      setScore(score + 1);
      toast.success(t('feedback.correct'));
    } else {
      toast.error(t('feedback.incorrect'));
    }

    setAttempts(attempts + 1);
    setShowExplanation(true);
  };

  const nextChallenge = () => {
    if (currentChallenge < challenges.length - 1) {
      setCurrentChallenge(currentChallenge + 1);
      setSelectedAnswer([]);
      setShowExplanation(false);
      setShowHint(false);
    } else {
      setIsRunning(false);
      setGameMode('results');
    }
  };

  const resetSequence = () => {
    setSelectedAnswer([]);
  };

  const calculateStars = (): number => {
    const percentage = (score / challenges.length) * 100;
    if (percentage >= 90) return 3;
    if (percentage >= 70) return 2;
    if (percentage >= 50) return 1;
    return 0;
  };

  const renderMenu = () => {
    const categories = [
      {
        id: 'sequencing',
        icon: '🔢',
        color: 'from-blue-500 to-cyan-600',
        title: t('categories.sequencing.title'),
        description: t('categories.sequencing.description')
      },
      {
        id: 'patterns',
        icon: '🔄',
        color: 'from-purple-500 to-pink-600',
        title: t('categories.patterns.title'),
        description: t('categories.patterns.description')
      },
      {
        id: 'loops',
        icon: '🔁',
        color: 'from-green-500 to-emerald-600',
        title: t('categories.loops.title'),
        description: t('categories.loops.description')
      },
      {
        id: 'conditionals',
        icon: '🔀',
        color: 'from-orange-500 to-amber-600',
        title: t('categories.conditionals.title'),
        description: t('categories.conditionals.description')
      }
    ];

    return (
      <div className="max-w-6xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full mb-6">
            <Code className="w-8 h-8 text-yellow-300" />
            <h1 className="text-4xl font-bold text-white">{t('title')}</h1>
          </div>
          <p className="text-xl text-white/90 mb-2">{t('subtitle')}</p>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">{t('description')}</p>
        </div>

        {/* Difficulty Selection */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 mb-8">
          <CardHeader>
            <CardTitle className="text-white text-center">{t('select_difficulty')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 justify-center">
              {(['easy', 'medium', 'hard'] as Difficulty[]).map((level) => (
                <Button
                  key={level}
                  onClick={() => setDifficulty(level)}
                  variant={difficulty === level ? 'default' : 'outline'}
                  className={difficulty === level ? 'bg-blue-600 text-white' : 'bg-white/20 text-white border-white/30'}
                >
                  {t(`difficulty.${level}`)}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Question Count Selection */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 mb-8">
          <CardHeader>
            <CardTitle className="text-white text-center">{t('question_count')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 justify-center">
              {([10, 15, 20, 30] as QuestionCount[]).map((count) => (
                <Button
                  key={count}
                  onClick={() => setQuestionCount(count)}
                  variant={questionCount === count ? 'default' : 'outline'}
                  className={questionCount === count ? 'bg-green-600 text-white' : 'bg-white/20 text-white border-white/30'}
                >
                  {count} {t('questions')}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((category) => (
            <Card
              key={category.id}
              className="group hover:scale-105 transition-all duration-300 bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 cursor-pointer"
              onClick={() => startGame(category.id as any)}
            >
              <CardHeader>
                <div className={`w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br ${category.color} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow`}>
                  <span className="text-4xl">{category.icon}</span>
                </div>
                <CardTitle className="text-center text-white text-xl">
                  {category.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-white/80 text-sm mb-4">
                  {category.description}
                </p>
                <Button className="w-full bg-white/20 text-white border-white/30 hover:bg-white/30">
                  {t('start')} <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Button
            onClick={() => navigate('/stem')}
            variant="outline"
            className="bg-white/20 text-white border-white/30 hover:bg-white/30"
          >
            <ArrowLeft className="mr-2 w-4 h-4" />
            {t('back_to_stem')}
          </Button>
        </div>
      </div>
    );
  };

  const renderChallenge = () => {
    if (challenges.length === 0) return null;
    const challenge = challenges[currentChallenge];

    return (
      <div className="max-w-4xl mx-auto">
        {/* Progress */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 mb-6">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-white font-semibold">
                {t('question')} {currentChallenge + 1} / {challenges.length}
              </span>
              <span className="text-white font-semibold">
                ⏱️ {formatTime(timeElapsed)}
              </span>
              <span className="text-white font-semibold">
                ⭐ {score} / {challenges.length}
              </span>
            </div>
            <Progress value={((currentChallenge + 1) / challenges.length) * 100} className="h-2" />
          </CardContent>
        </Card>

        {/* Challenge */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 mb-6">
          <CardHeader>
            <CardTitle className="text-white text-xl text-center">
              {challenge.question}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Sequencing shows order */}
            {gameMode === 'sequencing' && selectedAnswer.length > 0 && (
              <div className="mb-4 p-4 bg-blue-500/20 rounded-lg">
                <div className="text-white text-center mb-2">{t('your_order')}:</div>
                <div className="flex flex-wrap gap-2 justify-center">
                  {selectedAnswer.map((idx, pos) => (
                    <div key={pos} className="bg-white/20 px-3 py-2 rounded-lg text-white text-sm">
                      {pos + 1}. {challenge.options[idx]}
                    </div>
                  ))}
                </div>
                <Button
                  onClick={resetSequence}
                  variant="outline"
                  size="sm"
                  className="mt-2 mx-auto block bg-white/20 text-white border-white/30"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {t('reset')}
                </Button>
              </div>
            )}

            {/* Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {challenge.options.map((option, index) => (
                <Button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={showExplanation || (gameMode === 'sequencing' && selectedAnswer.includes(index))}
                  variant="outline"
                  className={`h-auto py-4 text-left justify-start ${
                    selectedAnswer.includes(index)
                      ? 'bg-blue-500 text-white border-blue-400'
                      : 'bg-white/20 text-white border-white/30 hover:bg-white/30'
                  } ${gameMode === 'sequencing' && selectedAnswer.includes(index) ? 'opacity-50' : ''}`}
                >
                  <span className="font-bold mr-2">{index + 1}.</span>
                  {option}
                </Button>
              ))}
            </div>

            {/* Hint */}
            {!showExplanation && (
              <div className="flex gap-2">
                <Button
                  onClick={() => setShowHint(!showHint)}
                  variant="outline"
                  className="flex-1 bg-yellow-500/20 text-white border-yellow-400/30 hover:bg-yellow-500/30"
                >
                  <Lightbulb className="w-4 h-4 mr-2" />
                  {showHint ? t('hide_hint') : t('show_hint')}
                </Button>
              </div>
            )}

            {showHint && !showExplanation && (
              <div className="mt-4 p-4 bg-yellow-500/20 rounded-lg border border-yellow-400/30">
                <p className="text-white text-sm">💡 {challenge.hint}</p>
              </div>
            )}

            {/* Explanation */}
            {showExplanation && (
              <div className={`mt-4 p-4 rounded-lg border ${
                JSON.stringify(selectedAnswer) === JSON.stringify(challenge.correctAnswer)
                  ? 'bg-green-500/20 border-green-400/30'
                  : 'bg-red-500/20 border-red-400/30'
              }`}>
                <div className="flex items-start gap-2 mb-2">
                  {JSON.stringify(selectedAnswer) === JSON.stringify(challenge.correctAnswer) ? (
                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  )}
                  <p className="text-white text-sm">{challenge.explanation}</p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-6 flex gap-4">
              {!showExplanation ? (
                <Button
                  onClick={checkAnswer}
                  disabled={selectedAnswer.length === 0 || 
                    (gameMode === 'sequencing' && selectedAnswer.length !== challenge.options.length)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {t('check_answer')}
                </Button>
              ) : (
                <Button
                  onClick={nextChallenge}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  {currentChallenge < challenges.length - 1 ? t('next') : t('see_results')}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderResults = () => {
    const stars = calculateStars();
    const percentage = Math.round((score / challenges.length) * 100);

    return (
      <div className="max-w-2xl mx-auto">
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <div className="text-center">
              <Trophy className="w-20 h-20 mx-auto mb-4 text-yellow-300" />
              <CardTitle className="text-white text-3xl mb-2">
                {t('results.title')}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {/* Stars */}
            <div className="flex justify-center gap-2 mb-6">
              {[1, 2, 3].map((star) => (
                <Star
                  key={star}
                  className={`w-12 h-12 ${
                    star <= stars ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'
                  }`}
                />
              ))}
            </div>

            {/* Stats */}
            <div className="space-y-4 mb-6">
              <div className="bg-white/10 rounded-lg p-4">
                <div className="flex justify-between items-center text-white">
                  <span>{t('results.correct_answers')}:</span>
                  <span className="font-bold text-xl">{score} / {challenges.length}</span>
                </div>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <div className="flex justify-between items-center text-white">
                  <span>{t('results.percentage')}:</span>
                  <span className="font-bold text-xl">{percentage}%</span>
                </div>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <div className="flex justify-between items-center text-white">
                  <span>{t('results.time')}:</span>
                  <span className="font-bold text-xl">{formatTime(timeElapsed)}</span>
                </div>
              </div>
            </div>

            {/* Message */}
            <div className="text-center mb-6">
              <p className="text-white text-lg">
                {percentage >= 90 ? t('results.excellent') :
                 percentage >= 70 ? t('results.good') :
                 percentage >= 50 ? t('results.fair') :
                 t('results.keep_practicing')}
              </p>
            </div>

            {/* Detailed Answer Review */}
            <div className="mt-6 mb-6 space-y-3">
              <h4 className="font-bold text-white text-xl mb-4 text-center">
                📋 {t('results.answer_review')}
              </h4>
              {challenges.map((challenge, index) => {
                const history = answerHistory[index];
                const isCorrect = history?.isCorrect || false;
                
                // Format user answer
                let userAnswerText = '';
                if (gameMode === 'sequencing') {
                  userAnswerText = history?.selectedAnswer.map((idx, pos) => 
                    `${pos + 1}. ${challenge.options[idx]}`
                  ).join(' → ') || '-';
                } else {
                  userAnswerText = history?.selectedAnswer.map(idx => challenge.options[idx]).join(', ') || '-';
                }

                // Format correct answer
                let correctAnswerText = '';
                if (gameMode === 'sequencing') {
                  correctAnswerText = challenge.correctAnswer.map((idx, pos) => 
                    `${pos + 1}. ${challenge.options[idx]}`
                  ).join(' → ');
                } else {
                  correctAnswerText = challenge.correctAnswer.map(idx => challenge.options[idx]).join(', ');
                }

                return (
                  <Card key={index} className="bg-white/5 border-white/10">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`text-3xl flex-shrink-0 ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                          {isCorrect ? '✅' : '❌'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h5 className="font-bold text-white">
                              {t('results.question')} {index + 1}:
                            </h5>
                            {challenge.emoji && (
                              <span className="text-2xl">{challenge.emoji}</span>
                            )}
                          </div>
                          <p className="text-white/90 mb-3">{challenge.question}</p>
                          
                          <div className="space-y-2">
                            <div className="text-sm bg-white/5 p-2 rounded border border-white/10">
                              <span className="font-semibold text-white/70">{t('results.your_answer')}:</span>
                              <p className={`mt-1 ${isCorrect ? 'text-green-300' : 'text-red-300'}`}>
                                {userAnswerText}
                              </p>
                            </div>
                            
                            {!isCorrect && (
                              <div className="text-sm bg-green-500/10 p-2 rounded border border-green-400/30">
                                <span className="font-semibold text-green-300">{t('results.correct_answer')}:</span>
                                <p className="text-green-200 mt-1">
                                  {correctAnswerText}
                                </p>
                              </div>
                            )}
                            
                            <div className="text-sm bg-blue-500/10 p-3 rounded border border-blue-400/30">
                              <span className="font-semibold text-blue-300">💡 {t('results.explanation')}:</span>
                              <p className="text-white/80 mt-1">
                                {challenge.explanation}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <Button
                onClick={() => setGameMode('menu')}
                variant="outline"
                className="flex-1 bg-white/20 text-white border-white/30 hover:bg-white/30"
              >
                {t('back_to_menu')}
              </Button>
              <Button
                onClick={() => startGame(gameMode as any)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                {t('play_again')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {gameMode === 'menu' && renderMenu()}
        {(gameMode === 'sequencing' || gameMode === 'patterns' || gameMode === 'loops' || gameMode === 'conditionals') && renderChallenge()}
        {gameMode === 'results' && renderResults()}
      </main>

      <Footer />
    </div>
  );
};

export default CodingBasicsApp;
