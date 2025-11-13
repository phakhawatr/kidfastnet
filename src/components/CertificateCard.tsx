import { forwardRef } from 'react';
import { Award, Star, Trophy, Calendar } from 'lucide-react';

interface CertificateCardProps {
  nickname: string;
  score: number;
  grade: number;
  semester: number;
  correctAnswers: number;
  totalQuestions: number;
  date: string;
  evaluation: {
    level: string;
    message: string;
    stars: number;
  };
  badges?: Array<{
    icon: string;
    color: string;
    name: string;
  }>;
}

const CertificateCard = forwardRef<HTMLDivElement, CertificateCardProps>(
  ({ nickname, score, grade, semester, correctAnswers, totalQuestions, date, evaluation, badges = [] }, ref) => {
    const getScoreColor = (score: number) => {
      if (score >= 80) return 'from-green-400 to-emerald-500';
      if (score >= 60) return 'from-yellow-400 to-orange-500';
      return 'from-red-400 to-pink-500';
    };

    const getScoreEmoji = (score: number) => {
      if (score >= 80) return '🎉';
      if (score >= 60) return '👍';
      return '💪';
    };

    return (
      <div ref={ref} className="bg-white p-8 rounded-2xl shadow-2xl" style={{ width: '800px', minHeight: '600px' }}>
        {/* Header with Logo */}
        <div className="flex items-center justify-between mb-6 border-b-4 border-purple-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-purple-900">Math Learning Platform</h1>
              <p className="text-sm text-purple-600">ใบประกาศผลการทำแบบทดสอบ</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">วันที่</p>
            <p className="text-sm font-semibold text-gray-700">{date}</p>
          </div>
        </div>

        {/* Certificate Title */}
        <div className="text-center mb-8">
          <div className="inline-block">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Star className="w-6 h-6 text-yellow-500" />
              <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                ใบรับรองผลการสอบ
              </h2>
              <Star className="w-6 h-6 text-yellow-500" />
            </div>
            <div className="h-1 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 rounded-full"></div>
          </div>
        </div>

        {/* Student Info */}
        <div className="text-center mb-6">
          <p className="text-lg text-gray-600 mb-2">ขอมอบใบประกาศนี้ให้แก่</p>
          <h3 className="text-4xl font-bold text-purple-900 mb-2">{nickname}</h3>
          <p className="text-md text-gray-600">
            ในการทำแบบทดสอบ <span className="font-semibold text-purple-700">ชั้นประถมศึกษาปีที่ {grade} ภาคเรียนที่ {semester}</span>
          </p>
        </div>

        {/* Score Display */}
        <div className="flex justify-center mb-6">
          <div className={`bg-gradient-to-br ${getScoreColor(score)} p-8 rounded-3xl shadow-lg transform hover:scale-105 transition-transform`}>
            <div className="text-center text-white">
              <p className="text-xl font-semibold mb-2">คะแนนที่ได้รับ</p>
              <div className="flex items-center justify-center gap-3">
                <span className="text-6xl font-bold">{score.toFixed(1)}</span>
                <div className="text-left">
                  <span className="text-3xl">%</span>
                  <p className="text-sm font-semibold">{correctAnswers}/{totalQuestions} ข้อ</p>
                </div>
              </div>
              <p className="text-2xl mt-2">{getScoreEmoji(score)}</p>
            </div>
          </div>
        </div>

        {/* Evaluation */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-8 h-8 ${
                  i < evaluation.stars ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <p className="text-xl font-bold text-purple-900 mb-2">{evaluation.level}</p>
          <p className="text-md text-gray-700 max-w-xl mx-auto">{evaluation.message}</p>
        </div>

        {/* Achievement Badges */}
        {badges && badges.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Trophy className="w-5 h-5 text-yellow-600" />
              <p className="text-sm font-semibold text-gray-700">ตราสัญลักษณ์ความสำเร็จ</p>
            </div>
            <div className="flex justify-center gap-3">
              {badges.map((badge, idx) => {
                const iconMap: Record<string, any> = {
                  trophy: Trophy,
                  zap: Star,
                  flame: Star,
                  star: Star,
                  'book-open': Award,
                  award: Award,
                };
                const Icon = iconMap[badge.icon] || Award;
                const colorMap: Record<string, string> = {
                  gold: 'bg-gradient-to-br from-yellow-400 to-yellow-600',
                  yellow: 'bg-gradient-to-br from-yellow-300 to-yellow-500',
                  orange: 'bg-gradient-to-br from-orange-400 to-orange-600',
                  purple: 'bg-gradient-to-br from-purple-400 to-purple-600',
                  blue: 'bg-gradient-to-br from-blue-400 to-blue-600',
                  green: 'bg-gradient-to-br from-green-400 to-green-600',
                };
                const bgClass = colorMap[badge.color] || colorMap.blue;

                return (
                  <div key={idx} className="text-center">
                    <div
                      className={`w-14 h-14 ${bgClass} rounded-full flex items-center justify-center shadow-lg border-4 border-white mx-auto mb-1`}
                      title={badge.name}
                    >
                      <Icon className="text-white" size={24} strokeWidth={2.5} />
                    </div>
                    <p className="text-xs font-semibold text-gray-700 max-w-20 mx-auto leading-tight">
                      {badge.name}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-6 border-t-2 border-purple-200">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-5 h-5" />
              <span className="text-sm">ออกให้ ณ วันที่ {date}</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-6 h-6 text-purple-600" />
              <span className="text-sm font-semibold text-purple-700">รับรองโดย Math Learning Platform</span>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-4 left-4 w-20 h-20 bg-purple-100 rounded-full opacity-50 -z-10"></div>
        <div className="absolute bottom-4 right-4 w-24 h-24 bg-pink-100 rounded-full opacity-50 -z-10"></div>
      </div>
    );
  }
);

CertificateCard.displayName = 'CertificateCard';

export default CertificateCard;
