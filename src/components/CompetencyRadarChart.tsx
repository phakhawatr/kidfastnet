import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

export interface SkillDataItem {
  skill: string;
  percentage: number;
}

interface CompetencyRadarChartProps {
  skillData: SkillDataItem[];
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
  averageScore?: number;
}

const getColorByScore = (score: number) => {
  if (score >= 85) return { fill: 'rgba(34, 197, 94, 0.3)', stroke: '#22c55e' };
  if (score >= 50) return { fill: 'rgba(234, 179, 8, 0.3)', stroke: '#eab308' };
  return { fill: 'rgba(239, 68, 68, 0.3)', stroke: '#ef4444' };
};

const sizeMap = {
  sm: { width: 120, height: 120, fontSize: 0, outerRadius: 40 },
  md: { width: 300, height: 300, fontSize: 11, outerRadius: 100 },
  lg: { width: 400, height: 400, fontSize: 12, outerRadius: 140 },
};

const CompetencyRadarChart = ({ skillData, size = 'md', showLabels = true, averageScore }: CompetencyRadarChartProps) => {
  const avg = averageScore ?? (skillData.length > 0 ? skillData.reduce((s, d) => s + d.percentage, 0) / skillData.length : 0);
  const { fill, stroke } = getColorByScore(avg);
  const cfg = sizeMap[size];

  const data = skillData.map(d => ({
    subject: d.skill,
    value: d.percentage,
    fullMark: 100,
  }));

  if (data.length < 3) {
    // Need at least 3 points for a meaningful radar
    while (data.length < 3) {
      data.push({ subject: '', value: 0, fullMark: 100 });
    }
  }

  const renderLabel = size !== 'sm' && showLabels;

  return (
    <div className="flex flex-col items-center">
      <ResponsiveContainer width={cfg.width} height={cfg.height}>
        <RadarChart data={data} outerRadius={cfg.outerRadius}>
          <PolarGrid stroke="#e5e7eb" />
          {renderLabel && (
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fontSize: cfg.fontSize, fill: '#374151' }}
            />
          )}
          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            name="คะแนน"
            dataKey="value"
            stroke={stroke}
            fill={fill}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
      {size !== 'sm' && (
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm font-semibold" style={{ color: stroke }}>
            เฉลี่ย {avg.toFixed(0)}%
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: fill, color: stroke, border: `1px solid ${stroke}` }}>
            {avg >= 85 ? 'ดีมาก' : avg >= 50 ? 'ต้องปรับปรุง' : 'ควรปรับปรุง'}
          </span>
        </div>
      )}
    </div>
  );
};

export default CompetencyRadarChart;
