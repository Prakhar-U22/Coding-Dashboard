import React, { useMemo } from 'react';
import { getContestPlatformInfo } from '../constants';
import { ExternalLink, PlusSquare, Clock } from 'lucide-react';

const formatDate = (date, options) => {
  return new Intl.DateTimeFormat('en-US', options).format(date);
};

const formatTime = (date) => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
};

// Function to generate Google Calendar link
const getGoogleCalendarLink = (contest) => {
  const formatForGoogle = (dateStr) => new Date(dateStr).toISOString().replace(/-|:|\.\d{3}/g, '');
  const startTime = formatForGoogle(contest.start_time);
  const endTime = formatForGoogle(contest.end_time);
  const url = new URL('https://www.google.com/calendar/render');
  url.searchParams.append('action', 'TEMPLATE');
  url.searchParams.append('text', contest.name);
  url.searchParams.append('dates', `${startTime}/${endTime}`);
  url.searchParams.append('details', `Join the contest here: ${contest.url}`);
  return url.toString();
};

export const ContestList = ({ contests }) => {
  const groupedContests = useMemo(() => {
    return contests.reduce((acc, contest) => {
      const dateKey = new Date(contest.start_time).toLocaleDateString('en-CA'); // YYYY-MM-DD
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(contest);
      return acc;
    }, {});
  }, [contests]);

  return (
    <div className="bg-gray-800/50 rounded-lg p-4 h-full max-h-[1000px] overflow-y-auto">
      <h2 className="text-2xl font-bold mb-1 text-gray-100">Upcoming Contests</h2>
      <p className="text-gray-400 mb-4">Don't miss scheduled events</p>
      
      {Object.keys(groupedContests).length === 0 ? (
        <p className="text-gray-500 text-center mt-8">No upcoming contests match your filters.</p>
      ) : (
        Object.entries(groupedContests).map(([date, contestsOnDate]) => (
          <div key={date}>
            <p className="text-sm font-semibold text-gray-400 my-4 border-b border-gray-700 pb-2">
              {formatDate(new Date(date), { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            <div className="space-y-4">
              {contestsOnDate.map(contest => {
                const { logo } = getContestPlatformInfo(contest.site);
                const startDate = new Date(contest.start_time);
                const endDate = new Date(contest.end_time);
                return (
                  <div key={contest.name + contest.start_time} className="bg-gray-900/60 p-4 rounded-lg flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-sm text-orange-400">
                      <Clock size={16} />
                      <span>{formatTime(startDate)} - {formatTime(endDate)}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-6 h-6">{logo}</div>
                       <div className="flex-grow">
                        <h3 className="font-semibold text-gray-200 leading-tight">{contest.name}</h3>
                        <p className="text-xs text-gray-400">{contest.site}</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                       <a 
                        href={getGoogleCalendarLink(contest)} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-400 hover:underline"
                      >
                        <PlusSquare size={16} /> Add to Calendar
                      </a>
                      <a href={contest.url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                        <ExternalLink size={18} />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
};
