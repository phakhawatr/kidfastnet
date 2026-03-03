import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';

export interface ComparisonSkillItem {
  skill: string;
  current: number;
  previous: number;
}

interface ComparisonRadarChartProps {
  data: ComparisonSkillItem[];
  currentAvg: number;
  previousAvg: number;
}

const getColorByScore = (score: number) => {
  if (score >= 85) return { fill: 'rgba(34, 197, 94, 0.35)', stroke: '#22c55e' };
  if (score >= 50) return { fill: 'rgba(234, 179, 8, 0.35)', stroke: '#eab308' };
  return { fill: 'rgba(239, 68, 68, 0.35)', stroke: '#ef4444' };
};

const ComparisonRadarChart = ({ data, currentAvg, previousAvg }: ComparisonRadarChartProps) => {
  const { fill: currentFill, stroke: currentStroke } = getColorByScore(currentAvg);

  const chartData = data.map(d => ({
    subject: d.skill,
    current: d.current,
    previous: d.previous,
    fullMark: 100,
  }));

  // Need at least 3 points
  while (chartData.length < 3) {
    chartData.push({ subject: '', current: 0, previous: 0, fullMark: 100 });
  }

  return (
    <div className="flex flex-col items-center">
      <ResponsiveContainer width={420} height={380}>
        <RadarChart data={chartData} outerRadius={130}>
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#374151' }} />
          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            name="ครั้งก่อน"
            dataKey="previous"
            stroke="#9ca3af"
            fill="rgba(156, 163, 175, 0.2)"
            strokeWidth={2}
            strokeDasharray="5 5"
          />
          <Radar
            name="ครั้งล่าสุด"
            dataKey="current"
            stroke={currentStroke}
            fill={currentFill}
            strokeWidth={2.5}
          />
          <Legend
            wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
            iconType="circle"
          />
        </RadarChart>
      </ResponsiveContainer>
      <div className="flex items-center gap-4 mt-1 text-sm">
        <span className="text-gray-500">ครั้งก่อน: <strong>{previousAvg.toFixed(0)}%</strong></span>
        <span style={{ color: currentStroke }}>ครั้งล่าสุด: <strong>{currentAvg.toFixed(0)}%</strong></span>
        {currentAvg > previousAvg ? (
          <span className="text-green-600 font-semibold">▲ +{(currentAvg - previousAvg).toFixed(0)}%</span>
        ) : currentAvg < previousAvg ? (
          <span className="text-red-600 font-semibold">▼ {(currentAvg - previousAvg).toFixed(0)}%</span>
        ) : (
          <span className="text-gray-500 font-semibold">= คงที่</span>
        )}
      </div>
    </div>
  );
};

export default ComparisonRadarChart;
