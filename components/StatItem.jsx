import React from 'react';

export const StatItem = ({ icon, label, value, capitalize = false, small = false }) => {
  const valueClass = capitalize ? 'capitalize' : '';

  if (small) {
    return (
        <div className="text-center">
            <p className="text-xs text-gray-400">{label}</p>
            <p className="font-bold text-gray-100">{value}</p>
        </div>
    );
  }

  return (
    <div className="bg-gray-700/60 p-3 rounded-lg flex items-center gap-3">
      {icon && <div className="flex-shrink-0">{icon}</div>}
      <div className="flex-grow">
        <p className="text-sm text-gray-400">{label}</p>
        <p className={`text-lg font-bold text-gray-100 ${valueClass}`}>{value}</p>
      </div>
    </div>
  );
};
