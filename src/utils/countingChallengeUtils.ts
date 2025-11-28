export type ThemeName = 'fish' | 'beachBall' | 'apple' | 'star' | 'butterfly' | 'car' | 'flower' | 'bird';

export interface CountingChallenge {
  id: string;
  theme: ThemeName;
  count: number;
  correctAnswer: number;
  choices: number[];
  borderColor: string;
  buttonColor: string;
}

export const themeConfig = {
  fish: { borderColor: 'border-red-500', buttonColor: 'from-sky-400 to-sky-600 border-sky-700' },
  beachBall: { borderColor: 'border-blue-500', buttonColor: 'from-green-400 to-green-600 border-green-700' },
  apple: { borderColor: 'border-green-500', buttonColor: 'from-orange-400 to-orange-600 border-orange-700' },
  star: { borderColor: 'border-yellow-500', buttonColor: 'from-purple-400 to-purple-600 border-purple-700' },
  butterfly: { borderColor: 'border-pink-500', buttonColor: 'from-teal-400 to-teal-600 border-teal-700' },
  car: { borderColor: 'border-orange-500', buttonColor: 'from-blue-400 to-blue-600 border-blue-700' },
  flower: { borderColor: 'border-pink-500', buttonColor: 'from-green-400 to-green-600 border-green-700' },
  bird: { borderColor: 'border-sky-500', buttonColor: 'from-yellow-400 to-yellow-600 border-yellow-700' },
};

export const generateChallenge = (theme: ThemeName, maxCount: number = 12): CountingChallenge => {
  const count = Math.floor(Math.random() * maxCount) + 1;
  const config = themeConfig[theme];
  
  const wrongChoices = generateWrongChoices(count);
  const choices = [count, ...wrongChoices].sort(() => Math.random() - 0.5);
  
  return {
    id: Math.random().toString(36).substr(2, 9),
    theme,
    count,
    correctAnswer: count,
    choices,
    ...config,
  };
};

export const generateWrongChoices = (correct: number): number[] => {
  const choices = new Set<number>();
  
  while (choices.size < 2) {
    const offset = Math.floor(Math.random() * 4) - 2; // -2 to +2
    const wrong = correct + offset;
    if (wrong > 0 && wrong !== correct && wrong <= 12) {
      choices.add(wrong);
    }
  }
  
  return Array.from(choices);
};

export const getRandomTheme = (): ThemeName => {
  const themes: ThemeName[] = ['fish', 'beachBall', 'apple', 'star', 'butterfly', 'car', 'flower', 'bird'];
  return themes[Math.floor(Math.random() * themes.length)];
};

export const getTwoRandomThemes = (): [ThemeName, ThemeName] => {
  const themes: ThemeName[] = ['fish', 'beachBall', 'apple', 'star', 'butterfly', 'car', 'flower', 'bird'];
  const shuffled = [...themes].sort(() => Math.random() - 0.5);
  return [shuffled[0], shuffled[1]];
};
