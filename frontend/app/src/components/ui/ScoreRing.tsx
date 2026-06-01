"use client";

interface ScoreRingProps {
  score: number | null;
  size?: number;
  strokeWidth?: number;
}

export default function ScoreRing({ score, size = 80, strokeWidth = 6 }: ScoreRingProps) {
  const r = (size / 2) - (strokeWidth * 1.5);
  const circ = 2 * Math.PI * r;
  
  // Calculate stroke mapping bounds safely
  const dash = score == null ? 0 : (Math.min(Math.max(score, 0), 100) / 100) * circ;
  
  // Qualitative spectrum evaluation color rules
  const getColor = (val: number | null) => {
    if (val == null) return "#4b5563"; // gray-600
    if (val >= 80) return "var(--green)";
    if (val >= 60) return "var(--yellow)";
    return "var(--red)";
  };

  const currentColor = getColor(score);

  return (
    <div className="relative inline-block" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="drop-shadow-lg">
        {/* Circular Track Background Line */}
        <circle 
          cx={size / 2} 
          cy={size / 2} 
          r={r} 
          fill="none" 
          stroke="rgba(255, 255, 255, 0.06)" 
          strokeWidth={strokeWidth} 
        />
        {/* Animated Radial Percentage Value Fill */}
        <circle 
          cx={size / 2} 
          cy={size / 2} 
          r={r} 
          fill="none" 
          stroke={currentColor} 
          strokeWidth={strokeWidth}
          strokeDasharray={`${dash} ${circ}`} 
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`} 
          className="transition-all duration-1000 ease-out" 
        />
        {/* Center Numeric Typography Layout */}
        <text 
          x="50%" 
          y="53%" 
          textAnchor="middle" 
          dominantBaseline="middle"
          fill={currentColor} 
          fontSize={size * 0.22} 
          fontWeight="600" 
          className="font-sans transition-colors duration-500"
        >
          {score == null ? "—" : score}
        </text>
      </svg>
    </div>
  );
}