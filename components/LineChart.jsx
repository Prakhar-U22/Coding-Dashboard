import React, { useState, useRef, useCallback } from 'react';

export const LineChart = ({ data, width = 300, height = 150, color = '#3b82f6' }) => {
  const [tooltip, setTooltip] = useState(null);
  const svgRef = useRef(null);

  if (!data || data.length < 2) {
    return <div className="text-center text-gray-500 mt-4 col-span-2">Not enough data for chart.</div>;
  }

  const padding = 20;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const xData = data.map(d => d.x);
  const yData = data.map(d => d.y);

  const xMin = Math.min(...xData);
  const xMax = Math.max(...xData);
  const yMin = Math.min(...yData);
  const yMax = Math.max(...yData);

  const getX = useCallback((x) => {
    if (xMax === xMin) return padding;
    return padding + ((x - xMin) / (xMax - xMin)) * chartWidth;
  }, [xMin, xMax, chartWidth]);

  const getY = useCallback((y) => {
    if (yMax === yMin) return padding + chartHeight / 2;
    return padding + chartHeight - ((y - yMin) / (yMax - yMin)) * chartHeight;
  }, [yMin, yMax, chartHeight]);

  const path = data.map((d, i) => {
    const x = getX(d.x);
    const y = getY(d.y);
    return `${i === 0 ? 'M' : 'L'} ${x},${y}`;
  }).join(' ');

  const handleMouseMove = (event) => {
    if (!svgRef.current) return;
    const svgPoint = svgRef.current.createSVGPoint();
    svgPoint.x = event.clientX;
    svgPoint.y = event.clientY;

    const invertedPoint = svgPoint.matrixTransform(svgRef.current.getScreenCTM()?.inverse());
    const mouseX = invertedPoint.x;

    let closestPoint = data[0];
    let minDistance = Infinity;

    data.forEach(point => {
      const pointX = getX(point.x);
      const distance = Math.abs(mouseX - pointX);
      if (distance < minDistance) {
        minDistance = distance;
        closestPoint = point;
      }
    });
    
    setTooltip({
      xPos: getX(closestPoint.x),
      yPos: getY(closestPoint.y),
      point: closestPoint
    });
  };

  const handleMouseLeave = () => {
    setTooltip(null);
  };
  
  const formatDate = (timestamp) => {
      return new Date(timestamp * 1000).toLocaleDateString();
  }

  return (
    <div className="bg-gray-900/70 p-4 rounded-lg mt-4 col-span-2 relative">
        <h4 className="text-md font-semibold mb-2 text-gray-300">Rating History</h4>
        <svg ref={svgRef} viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Rating history line chart" className="w-full h-auto overflow-visible" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
            {/* Y-Axis Labels */}
            <text x={padding - 5} y={getY(yMax)} textAnchor="end" alignmentBaseline="middle" fill="#9ca3af" fontSize="10">{yMax}</text>
            <text x={padding - 5} y={getY(yMin)} textAnchor="end" alignmentBaseline="middle" fill="#9ca3af" fontSize="10">{yMin}</text>
            
            {/* Y-Axis Line */}
            <line x1={padding} y1={padding} x2={padding} y2={height-padding} stroke="#4b5563" strokeWidth="1" />
            {/* X-Axis Line */}
            <line x1={padding} y1={height-padding} x2={width-padding} y2={height-padding} stroke="#4b5563" strokeWidth="1" />

            <path d={path} fill="none" stroke={color} strokeWidth="2" />

            {tooltip && (
              <g>
                <line x1={tooltip.xPos} y1={padding} x2={tooltip.xPos} y2={height-padding} stroke="#6b7280" strokeDasharray="4" />
                <circle cx={tooltip.xPos} cy={tooltip.yPos} r="4" fill={color} stroke="white" strokeWidth="2" />
                 <g transform={`translate(${tooltip.xPos > width / 2 ? tooltip.xPos - 110 : tooltip.xPos + 10}, ${padding})`}>
                    <rect x="0" y="0" width="120" height="50" fill="rgba(17, 24, 39, 0.9)" rx="4" />
                    <text x="60" y="15" textAnchor="middle" fill="#e5e7eb" fontSize="12" fontWeight="bold">
                      Rating: {tooltip.point.y}
                    </text>
                    <text x="60" y="30" textAnchor="middle" fill="#9ca3af" fontSize="10">
                      {formatDate(tooltip.point.x)}
                    </text>
                    {tooltip.point.contest && (
                      <text x="60" y="45" textAnchor="middle" fill="#9ca3af" fontSize="9">
                        {tooltip.point.contest}
                      </text>
                    )}
                </g>
              </g>
            )}
        </svg>
    </div>
  );
};
