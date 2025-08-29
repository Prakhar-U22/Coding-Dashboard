import React from 'react';
import { getContestPlatformInfo } from '../constants';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const isSameDay = (d1, d2) => 
  d1.getFullYear() === d2.getFullYear() &&
  d1.getMonth() === d2.getMonth() &&
  d1.getDate() === d2.getDate();
  
export const ContestCalendar = ({ contests, currentDate, onDateChange }) => {
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  
  const startingDay = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();
  
  const days = [];
  // Previous month's padding
  for (let i = 0; i < startingDay; i++) {
    days.push(null);
  }
  // Current month's days
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
  }
  
  const handlePrevMonth = () => {
    onDateChange(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    onDateChange(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };
  
  const today = new Date();

  return (
    <div className="bg-gray-800/50 rounded-lg p-4 h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-100">
          {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h2>
        <div className="flex gap-2">
          <button onClick={handlePrevMonth} className="p-1 rounded-md bg-gray-700 hover:bg-gray-600"><ChevronLeft size={20} /></button>
          <button onClick={handleNextMonth} className="p-1 rounded-md bg-gray-700 hover:bg-gray-600"><ChevronRight size={20} /></button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-400 font-semibold mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day}>{day}</div>)}
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          if (!day) return <div key={`empty-${index}`} className="h-28 rounded-md bg-gray-900/30"></div>;

          const contestsOnDay = contests.filter(c => isSameDay(new Date(c.start_time), day));
          const isToday = isSameDay(day, today);

          return (
            <div key={day.toISOString()} className="h-28 rounded-md bg-gray-900/50 p-1.5 flex flex-col overflow-hidden">
              <span className={`text-xs font-bold ${isToday ? 'bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center' : 'text-gray-300'}`}>
                {day.getDate()}
              </span>
              <div className="flex-grow mt-1 space-y-1 overflow-y-auto text-left pr-1" style={{ scrollbarWidth: 'thin' }}>
                {contestsOnDay.slice(0, 3).map(contest => {
                  const { logo, color } = getContestPlatformInfo(contest.site);
                  return (
                    <a href={contest.url} target="_blank" rel="noopener noreferrer" key={contest.name + contest.start_time} className={`block text-xs font-semibold p-1 rounded truncate ${color}`}>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 flex-shrink-0">{logo}</div>
                        <span className="truncate">{contest.name}</span>
                      </div>
                    </a>
                  )
                })}
                {contestsOnDay.length > 3 && (
                   <div className="text-xs text-gray-400 font-bold mt-1">+ {contestsOnDay.length - 3} more</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
