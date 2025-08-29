import React, { useState, useCallback } from 'react';
import { fetchStats } from '../services/api';
import { PlatformId } from '../constants';
import { Spinner } from './Spinner';
import { ErrorMessage } from './ErrorMessage';
import { StatItem } from './StatItem';
import { Trophy, Star, TrendingUp, BarChart2, CheckCircle, Percent } from 'lucide-react';

const renderPrimaryStats = (stats, platformId) => {
  switch (platformId) {
    case PlatformId.Codeforces: {
      const s = stats;
      return (
        <>
          <StatItem icon={<Trophy size={18} className="text-yellow-400" />} label="Rating" value={s.rating} />
          <StatItem icon={<CheckCircle size={18} className="text-green-400" />} label="Problems Solved" value={s.problemsSolved} />
        </>
      );
    }
    case PlatformId.LeetCode: {
      const s = stats;
      return (
        <>
          <StatItem icon={<CheckCircle size={18} className="text-green-400" />} label="Total Solved" value={s.totalSolved} />
          <StatItem icon={<BarChart2 size={18} className="text-blue-400" />} label="Ranking" value={s.ranking > 0 ? s.ranking.toLocaleString() : 'N/A'} />
        </>
      );
    }
    case PlatformId.CodeChef: {
      const s = stats;
      return (
        <>
          <StatItem icon={<Trophy size={18} className="text-yellow-400" />} label="Rating" value={`${s.currentRating} (${s.stars})`} />
          <StatItem icon={<CheckCircle size={18} className="text-green-400" />} label="Problems Solved" value={s.problemsSolved} />
        </>
      );
    }
    default:
      return null;
  }
};

export const PlatformCard = ({ platform, onShowDetails }) => {
  const [username, setUsername] = useState(() => localStorage.getItem(`coder-stats-username-${platform.id}`) || '');
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const handleFetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setStats(null);

    try {
      const data = await fetchStats(username, platform);
      setStats(data);
      localStorage.setItem(`coder-stats-username-${platform.id}`, username);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [username, platform]);

  const handleSubmit = (e) => {
    e.preventDefault();
    handleFetch();
  };

  return (
    <div className={`group bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl shadow-lg border-t-4 ${platform.primaryColor} transition-all duration-300 hover:shadow-2xl hover:-translate-y-1`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-900/50 rounded-lg transition-all duration-300 ease-in-out group-hover:scale-110 group-hover:rotate-[-6deg] group-hover:shadow-lg">
            {platform.logo}
          </div>
          <h2 className="text-2xl font-bold text-gray-200">{platform.name}</h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter username..."
          className="flex-grow bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
          disabled={isLoading}
          aria-label={`${platform.name} username`}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          disabled={isLoading || !username}
        >
          {isLoading ? <Spinner /> : 'Fetch Stats'}
        </button>
      </form>

      <div className="min-h-[100px]">
        {isLoading && (
          <div className="flex justify-center items-center h-full pt-8">
            <Spinner size="lg" />
          </div>
        )}
        {error && <ErrorMessage message={error} />}
        {stats && (
          <div className="animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {renderPrimaryStats(stats, platform.id)}
            </div>
             <button 
                onClick={() => onShowDetails(platform, username, stats)}
                className="w-full text-center mt-6 bg-gray-700 hover:bg-gray-600 text-blue-300 font-semibold py-2 px-4 rounded-md transition-colors"
            >
                View More Info & Graphs
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
