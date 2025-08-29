import React from 'react';

const getCoordinatesForPercent = (percent, radius) => {
  const x = Math.cos(2 * Math.PI * percent) * radius;
  const y = Math.sin(2 * Math.PI * percent) * radius;
  return [x, y];
};

export const PieChart = ({ data, title, width = 300, height = 300, innerRadius = 0 }) => {
  if (!data || data.length === 0) {
    return <p className="text-center text-gray-500">No data available for chart.</p>;
  }
  
  const sortedData = [...data].sort((a, b) => b.value - a.value);

  const total = sortedData.reduce((acc, d) => acc + d.value, 0);
  if (total === 0) {
    return <p className="text-center text-gray-500">No data to display in chart.</p>;
  }

  const radius = Math.min(width, height) / 2 - 10;
  const cx = width / 2;
  const cy = height / 2;
  let cumulativePercent = -0.25; // Start at 12 o'clock

  const slices = sortedData.map(d => {
    const percent = d.value / total;
    const [startX, startY] = getCoordinatesForPercent(cumulativePercent, radius);
    const [innerStartX, innerStartY] = getCoordinatesForPercent(cumulativePercent, innerRadius);
    
    cumulativePercent += percent;
    
    const [endX, endY] = getCoordinatesForPercent(cumulativePercent, radius);
    const [innerEndX, innerEndY] = getCoordinatesForPercent(cumulativePercent, innerRadius);
    
    const largeArcFlag = percent > 0.5 ? 1 : 0;

    const pathData = innerRadius > 0
      ? [
          `M ${cx + startX} ${cy + startY}`,
          `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${cx + endX} ${cy + endY}`,
          `L ${cx + innerEndX} ${cy + innerEndY}`,
          `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${cx + innerStartX} ${cy + innerStartY}`,
          'Z',
        ].join(' ')
      : [
          `M ${cx + startX} ${cy + startY}`,
          `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${cx + endX} ${cy + endY}`,
          `L ${cx} ${cy}`,
          'Z',
        ].join(' ');
    
    return { path: pathData, color: d.color, label: d.label, value: d.value };
  });

  return (
    <div className="bg-gray-800/60 p-4 rounded-lg w-full">
      <h4 className="text-lg font-semibold mb-4 text-center text-gray-300">{title}</h4>
      <div className="flex flex-col md:flex-row items-center justify-center gap-6">
        <div className="flex-shrink-0">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            role="img"
            aria-label={`${title} pie chart`}
            width={width}
            height={height}
          >
            {slices.map((slice, i) => (
              <path key={i} d={slice.path} fill={slice.color} />
            ))}
          </svg>
        </div>
        <div 
          className="w-full md:w-auto text-left max-h-[250px] overflow-y-auto pr-2"
          style={{ scrollbarWidth: 'thin' }} // For Firefox scrollbar styling
        >
          <ul className="space-y-2">
            {sortedData.map((item, i) => (
              <li key={i} className="flex items-center text-sm text-gray-300">
                <span 
                  className="w-3 h-3 rounded-sm mr-3 flex-shrink-0" 
                  style={{ backgroundColor: item.color }}
                  aria-hidden="true"
                ></span>
                <span className="truncate">{item.label} : {item.value}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
