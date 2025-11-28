interface AppInfo {
  nameKey: string;
  icon: string;
  color: string;
  link: string;
}

export const appRegistry: Record<string, AppInfo> = {
  // Interactive Math Games
  'flower-math': {
    nameKey: 'recommendations.apps.flowerMath.title',
    icon: '🌸',
    color: 'bg-gradient-to-br from-pink-200 to-pink-300',
    link: '/flower-math'
  },
  'balloon-math': {
    nameKey: 'recommendations.apps.balloonMath.title',
    icon: '🎈',
    color: 'bg-gradient-to-br from-sky-200 to-sky-300',
    link: '/balloon-math'
  },
  'counting-challenge': {
    nameKey: 'recommendations.apps.countingChallenge.title',
    icon: '🐠',
    color: 'bg-gradient-to-br from-cyan-200 to-cyan-300',
    link: '/counting-challenge'
  },
  'compare-stars': {
    nameKey: 'recommendations.apps.compareStars.title',
    icon: '⭐',
    color: 'bg-gradient-to-br from-yellow-200 to-yellow-300',
    link: '/compare-stars'
  },
  'board-counting': {
    nameKey: 'recommendations.apps.boardCounting.title',
    icon: '🐴',
    color: 'bg-gradient-to-br from-amber-200 to-amber-300',
    link: '/board-counting'
  },
  'fruit-counting': {
    nameKey: 'recommendations.apps.fruitCounting.title',
    icon: '🍎',
    color: 'bg-gradient-to-br from-red-200 to-red-300',
    link: '/fruit-counting'
  },
  'shape-series': {
    nameKey: 'recommendations.apps.shapeSeries.title',
    icon: '🔄',
    color: 'bg-gradient-to-br from-purple-200 to-purple-300',
    link: '/shape-series'
  },
  'fraction-shapes': {
    nameKey: 'recommendations.apps.fractionShapes.title',
    icon: '🧩',
    color: 'bg-gradient-to-br from-indigo-200 to-indigo-300',
    link: '/fraction-shapes'
  },
  'shape-matching': {
    nameKey: 'recommendations.apps.shapeMatching.title',
    icon: '🔷',
    color: 'bg-gradient-to-br from-blue-200 to-blue-300',
    link: '/shape-matching'
  },
  
  // Basic Math Skills
  'addition': {
    nameKey: 'recommendations.apps.addition.title',
    icon: '➕',
    color: 'bg-gradient-to-br from-green-200 to-green-300',
    link: '/addition'
  },
  'subtraction': {
    nameKey: 'recommendations.apps.subtraction.title',
    icon: '➖',
    color: 'bg-gradient-to-br from-orange-200 to-orange-300',
    link: '/subtraction'
  },
  'multiplication': {
    nameKey: 'recommendations.apps.multiplication.title',
    icon: '✖️',
    color: 'bg-gradient-to-br from-purple-200 to-purple-300',
    link: '/multiply'
  },
  'division': {
    nameKey: 'recommendations.apps.division.title',
    icon: '➗',
    color: 'bg-gradient-to-br from-pink-200 to-pink-300',
    link: '/division'
  },
  'money': {
    nameKey: 'recommendations.apps.money.title',
    icon: '💰',
    color: 'bg-gradient-to-br from-yellow-200 to-yellow-300',
    link: '/money'
  },
  'time': {
    nameKey: 'recommendations.apps.time.title',
    icon: '🕐',
    color: 'bg-gradient-to-br from-blue-200 to-blue-300',
    link: '/time'
  },
  'weighing': {
    nameKey: 'recommendations.apps.weighing.title',
    icon: '⚖️',
    color: 'bg-gradient-to-br from-teal-200 to-teal-300',
    link: '/weighing'
  },
  'measurement': {
    nameKey: 'recommendations.apps.measurement.title',
    icon: '📏',
    color: 'bg-gradient-to-br from-cyan-200 to-cyan-300',
    link: '/measurement'
  },
  'place-value': {
    nameKey: 'recommendations.apps.placeValue.title',
    icon: '🔢',
    color: 'bg-gradient-to-br from-indigo-200 to-indigo-300',
    link: '/place-value'
  },
  'fraction-matching': {
    nameKey: 'recommendations.apps.fractionMatching.title',
    icon: '🍕',
    color: 'bg-gradient-to-br from-red-200 to-red-300',
    link: '/fraction-matching'
  },
  'length-comparison': {
    nameKey: 'recommendations.apps.lengthComparison.title',
    icon: '📐',
    color: 'bg-gradient-to-br from-lime-200 to-lime-300',
    link: '/length-comparison'
  },
  
  // Advanced Skills
  'mental-math': {
    nameKey: 'recommendations.apps.mentalMath.title',
    icon: '⚡',
    color: 'bg-gradient-to-br from-yellow-200 to-amber-300',
    link: '/mental-math'
  },
  'quick-math': {
    nameKey: 'recommendations.apps.quickMath.title',
    icon: '⏱️',
    color: 'bg-gradient-to-br from-orange-200 to-orange-300',
    link: '/quick-math'
  },
  'sum-grid-puzzles': {
    nameKey: 'recommendations.apps.sumGridPuzzles.title',
    icon: '🧩',
    color: 'bg-gradient-to-br from-purple-200 to-purple-300',
    link: '/SumGridPuzzles'
  },
  'number-bonds': {
    nameKey: 'recommendations.apps.numberBonds.title',
    icon: '🔗',
    color: 'bg-gradient-to-br from-blue-200 to-blue-300',
    link: '/number-bonds'
  },
  'area-model': {
    nameKey: 'recommendations.apps.areaModel.title',
    icon: '📐',
    color: 'bg-gradient-to-br from-teal-200 to-teal-300',
    link: '/area-model'
  },
  'bar-model': {
    nameKey: 'recommendations.apps.barModel.title',
    icon: '📊',
    color: 'bg-gradient-to-br from-green-200 to-green-300',
    link: '/bar-model'
  },
  'word-problems': {
    nameKey: 'recommendations.apps.wordProblems.title',
    icon: '📝',
    color: 'bg-gradient-to-br from-pink-200 to-pink-300',
    link: '/word-problems'
  },
  'number-series': {
    nameKey: 'recommendations.apps.numberSeries.title',
    icon: '🔢',
    color: 'bg-gradient-to-br from-indigo-200 to-indigo-300',
    link: '/number-series'
  },
  'percentage': {
    nameKey: 'recommendations.apps.percentage.title',
    icon: '💯',
    color: 'bg-gradient-to-br from-cyan-200 to-cyan-300',
    link: '/percentage'
  },
  'multiplication-table': {
    nameKey: 'recommendations.apps.multiplicationTable.title',
    icon: '✖️📋',
    color: 'bg-gradient-to-br from-violet-200 to-violet-300',
    link: '/multiplication-table'
  }
};
