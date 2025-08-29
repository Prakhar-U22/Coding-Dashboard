import React from 'react';

export const BarChart = ({ data, title, width = 600, height = 300 }) => {
  if (!data || data.length === 0) {
    return <p className="text-center text-gray-500">No data available for chart.</p>;
  }

  const padding = { top: 20, right: 20, bottom: 40, left: 40 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  
  const totalBars = data.length;
  const barWidth = chartWidth / totalBars * 0.7;
  const barSpacing = chartWidth / totalBars * 0.3;
  
  const yMax = data.reduce((max, d) => d.value > max ? d.value : max, 0);
  const yAxisMax = Math.ceil(yMax / 10) * 10 || 10;
  
  const scaleY = (value) => {
    if (yAxisMax === 0) return 0;
    return (value / yAxisMax) * chartHeight;
  };

  const yTicks = 5;
  const yAxisLabels = Array.from({ length: yTicks + 1 }, (_, i) => Math.round(yAxisMax - (i * (yAxisMax / yTicks))));

  return (
    <div className="bg-gray-800/60 p-4 rounded-lg mt-4 w-full">
      <h4 className="text-lg font-semibold mb-4 text-gray-300 text-center">{title}</h4>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`${title} bar chart`} className="w-full h-auto">
        <g transform={`translate(${padding.left}, ${padding.top})`}>
          {/* Y-Axis labels and grid lines */}
          {yAxisLabels.map(label => {
            const y = chartHeight - scaleY(label);
            return (
              <g key={`y-axis-${label}`}>
                <line x1={0} y1={y} x2={chartWidth} y2={y} stroke="#4b5563" strokeWidth="0.5" />
                <text x={-8} y={y + 4} textAnchor="end" fill="#9ca3af" fontSize="10">{label}</text>
              </g>
            );
          })}
          
          {/* X-Axis Line */}
          <line x1={0} y1={chartHeight} x2={chartWidth} y2={chartHeight} stroke="#4b5563" strokeWidth="1" />

          {data.map((d, i) => {
            const barX = i * (barWidth + barSpacing) + barSpacing / 2;
            const barH = scaleY(d.value);
            const barY = chartHeight - barH;

            return (
              <g key={`bar-${d.label}`}>
                <rect
                  x={barX}
                  y={barY}
                  width={barWidth}
                  height={barH}
                  fill={d.color}
                  stroke="#111827"
                  strokeWidth="1"
                  rx="1"
                />
                 <text
                  x={barX + barWidth / 2}
                  y={chartHeight + 15}
                  textAnchor="middle"
                  fill="#9ca3af"
                  fontSize="10"
                >
                  {d.label}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
};
