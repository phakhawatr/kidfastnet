interface ShapeDisplayProps {
  shape: string;
  size?: number;
}

const ShapeDisplay = ({ shape, size = 48 }: ShapeDisplayProps) => {
  const shapeColors: Record<string, string> = {
    'circle-red': '#ef4444',
    'circle-blue': '#3b82f6',
    'circle-green': '#22c55e',
    'circle-orange': '#f97316',
    'circle-yellow': '#eab308',
    'circle-sky': '#0ea5e9',
    'square-red': '#ef4444',
    'square-blue': '#3b82f6',
    'square-green': '#22c55e',
    'square-orange': '#f97316',
    'square-yellow': '#eab308',
    'square-sky': '#0ea5e9',
    'triangle-red': '#ef4444',
    'triangle-blue': '#3b82f6',
    'triangle-green': '#22c55e',
    'triangle-orange': '#f97316',
    'triangle-yellow': '#eab308',
    'triangle-sky': '#0ea5e9',
  };

  const color = shapeColors[shape] || '#3b82f6';
  const [shapeType, shapeColor] = shape.split('-');

  if (shapeType === 'circle') {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" className="inline-block">
        <circle cx="50" cy="50" r="45" fill={color} stroke="#1e293b" strokeWidth="3" />
      </svg>
    );
  }

  if (shapeType === 'square') {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" className="inline-block">
        <rect x="5" y="5" width="90" height="90" fill={color} stroke="#1e293b" strokeWidth="3" />
      </svg>
    );
  }

  if (shapeType === 'triangle') {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" className="inline-block">
        <polygon points="50,10 95,90 5,90" fill={color} stroke="#1e293b" strokeWidth="3" />
      </svg>
    );
  }

  return <span className="text-2xl">{shape}</span>;
};

export default ShapeDisplay;
