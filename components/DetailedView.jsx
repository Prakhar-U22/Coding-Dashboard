import React, { useState, useEffect } from 'react';
import { fetchCodeforcesRatingHistory, fetchLeetCodeContestHistory } from '../services/api';
import { PlatformId } from '../constants';
import { Spinner } from './Spinner';
import { ErrorMessage } from './ErrorMessage';
import { StatItem } from './StatItem';
import { Trophy, Star, TrendingUp, BarChart2, CheckCircle, Percent, Users, ArrowLeft } from 'lucide-react';
import { LineChart } from './LineChart';
import { PieChart } from './PieChart';
import { BarChart } from './BarChart';

const renderDetails = (stats, platformId, detailedStats) => {
    switch (platformId) {
        case PlatformId.Codeforces: {
            const s = stats;
            return (
                 <div className="grid grid-cols-2 gap-4">
                    <StatItem icon={<Trophy size={18} className="text-yellow-400" />} label="Current Rating" value={s.rating} />
                    <StatItem icon={<Star size={18} className="text-blue-400" />} label="Current Rank" value={s.rank} capitalize={true} />
                    <StatItem icon={<TrendingUp size={18} className="text-green-400" />} label="Max Rating" value={s.maxRating} />
                    <StatItem icon={<Star size={18} className="text-indigo-400" />} label="Max Rank" value={s.maxRank} capitalize={true} />
                    <StatItem icon={<Users size={18} className="text-teal-400" />} label="Friend of" value={`${s.friendOfCount} users`} />
                    <StatItem icon={<CheckCircle size={18} className="text-green-400" />} label="Problems Solved" value={s.problemsSolved} />
                </div>
            )
        }
        case PlatformId.LeetCode: {
            const s = stats;
            const contestStats = detailedStats;
            
            // Get the most recent contest rating (last attended contest)
            const attendedContests = contestStats?.filter(c => c.attended) || [];
            const currentRating = attendedContests.length > 0 
                ? Math.round(attendedContests[attendedContests.length - 1]?.rating || 0)
                : 0;
            const attendedCount = attendedContests.length;
            
            return (
                <div className="grid grid-cols-2 gap-4">
                    <StatItem icon={<CheckCircle size={18} className="text-green-400" />} label="Total Solved" value={s.totalSolved} />
                    <StatItem icon={<BarChart2 size={18} className="text-blue-400" />} label="Ranking" value={s.ranking > 0 ? s.ranking.toLocaleString() : 'N/A'} />
                    <StatItem icon={<Trophy size={18} className="text-yellow-400" />} label="Contest Rating" value={attendedContests.length > 0 ? currentRating : 'N/A'} />
                    <StatItem icon={<Star size={18} className="text-purple-400" />} label="Contests Attended" value={attendedContests.length > 0 ? attendedCount : 'N/A'} />
                    <StatItem icon={<CheckCircle size={18} className="text-green-500" />} label="Easy Solved" value={s.easySolved} />
                    <StatItem icon={<CheckCircle size={18} className="text-amber-500" />} label="Medium Solved" value={s.mediumSolved} />
                    <StatItem icon={<CheckCircle size={18} className="text-red-500" />} label="Hard Solved" value={s.hardSolved} />
                </div>
            )
        }
        case PlatformId.CodeChef: {
             const s = stats;
            return (
                <div className="grid grid-cols-2 gap-4">
                    <StatItem icon={<Trophy size={18} className="text-yellow-400" />} label="Rating" value={`${s.currentRating} (${s.stars})`} />
                    <StatItem icon={<TrendingUp size={18} className="text-green-400" />} label="Highest Rating" value={s.highestRating} />
                    <StatItem icon={<BarChart2 size={18} className="text-blue-400" />} label="Global Rank" value={s.globalRank} />
                    <StatItem icon={<BarChart2 size={18} className="text-indigo-400" />} label="Country Rank" value={s.countryRank} />
                    <StatItem icon={<CheckCircle size={18} className="text-teal-400" />} label="Problems Solved" value={s.problemsSolved} />
                </div>
            )
        }
        default: return null;
    }
};

const renderChart = (
  platformId,
  stats,
  detailedStats,
  isFetchingDetails,
  detailsError
) => {
  if (isFetchingDetails) {
    return <div className="flex justify-center items-center h-full min-h-[400px]"><Spinner size="lg" /></div>;
  }
  if (detailsError) {
    return <ErrorMessage message={detailsError} />;
  }

  const TAG_COLORS = [
    '#F87171', '#FBBF24', '#34D399', '#60A5FA', '#A78BFA', '#F472B6',
    '#FCA5A5', '#FCD34D', '#6EE7B7', '#93C5FD', '#C4B5FD', '#F9A8D4',
    '#FB923C', '#D97706', '#059669', '#2563EB', '#7C3AED', '#DB2777'
  ];

  switch (platformId) {
    case PlatformId.Codeforces: {
      const s = stats;
      const history = detailedStats;
      const ratingHistoryChartData = history?.map(item => ({ x: item.ratingUpdateTimeSeconds, y: item.newRating })).sort((a, b) => a.x - b.x) || [];

      const ratingColor = (rating) => {
        if (rating < 1200) return '#9CA3AF'; // gray-400
        if (rating < 1400) return '#4ADE80'; // green-400
        if (rating < 1600) return '#2DD4BF'; // teal-400
        if (rating < 1900) return '#60A5FA'; // blue-400
        if (rating < 2100) return '#A78BFA'; // violet-400
        if (rating < 2400) return '#FBBF24'; // amber-400
        return '#F87171'; // red-400
      };

      const problemRatingsData = Object.entries(s.problemRatings || {})
        .sort(([a], [b]) => Number(a) - Number(b))
        .map(([rating, count]) => ({
          label: rating,
          value: count,
          color: ratingColor(Number(rating)),
        }));

      const problemTagsData = Object.entries(s.problemTags || {})
        .sort(([, a], [, b]) => b - a)
        .slice(0, 20)
        .map(([tag, count], i) => ({
          label: tag,
          value: count,
          color: TAG_COLORS[i % TAG_COLORS.length],
        }));

      return (
          <div className="flex flex-col gap-8 w-full">
              <LineChart data={ratingHistoryChartData} width={1000} height={500} />
              {problemRatingsData.length > 0 && <BarChart data={problemRatingsData} title="Problem Ratings" width={1000} height={500} />}
              {problemTagsData.length > 0 && (
                <PieChart data={problemTagsData} title="Tags Solved" width={250} height={250} innerRadius={80} />
              )}
          </div>
      );
    }
    case PlatformId.LeetCode: {
      const s = stats;
      const history = detailedStats;
      
      // Create rating history chart data from contest history
      const ratingHistoryChartData = history?.filter(contest => contest.attended)
        .map(contest => ({ 
          x: contest.contest.startTime, 
          y: Math.ceil(contest.rating),
          contest: contest.contest.title
        }))
        .sort((a, b) => a.x - b.x) // Sort by timestamp (oldest to newest)
        .slice(-20) || []; // Take only the last 20 contests for better chart readability

      const distributionChartData = [
        { label: 'Easy', value: s.easySolved, color: '#22c55e' },
        { label: 'Medium', value: s.mediumSolved, color: '#f59e0b' },
        { label: 'Hard', value: s.hardSolved, color: '#ef4444' },
      ];
      
      const problemTagsData = Object.entries(s.problemTags || {})
        .sort(([, a], [, b]) => b - a)
        .slice(0, 20)
        .map(([tag, count], i) => ({
          label: tag,
          value: count,
          color: TAG_COLORS[i % TAG_COLORS.length],
        }));

      return (
        <div className="flex flex-col gap-8 w-full">
          {ratingHistoryChartData.length > 0 ? (
            <div className="bg-gray-900/70 p-4 rounded-lg">
              <h4 className="text-md font-semibold mb-2 text-gray-300">Contest Rating History</h4>
              <LineChart data={ratingHistoryChartData} width={1000} height={500} />
            </div>
          ) : (
            <div className="bg-gray-900/70 p-4 rounded-lg">
              <p className="text-center text-gray-500">No contest rating data available for this user.</p>
            </div>
          )}
          <PieChart data={distributionChartData} title="Solved Problems Distribution" width={250} height={250} />
          {problemTagsData.length > 0 && (
            <PieChart data={problemTagsData} title="Tags Solved" width={250} height={250} innerRadius={80} />
          )}
        </div>
      );
    }
     case PlatformId.CodeChef: {
      const s = stats;
      const problemTagsData = Object.entries(s.problemTags || {})
        .sort(([, a], [, b]) => b - a)
        .slice(0, 20)
        .map(([tag, count], i) => ({
          label: tag,
          value: count,
          color: TAG_COLORS[i % TAG_COLORS.length],
        }));

      if (problemTagsData.length === 0) {
        return <div className="flex items-center justify-center h-full min-h-[400px]"><p className="text-center text-gray-500">No tag data available for this user.</p></div>;
      }

      return (
        <div className="flex flex-col gap-8 w-full">
          <PieChart data={problemTagsData} title="Tags Solved" width={250} height={250} innerRadius={80} />
        </div>
      );
    }
    default:
      return <div className="flex items-center justify-center h-full min-h-[400px]"><p className="text-center text-gray-500">No graphs available for this platform.</p></div>;
  }
};

export const DetailedView = ({ platform, username, stats, onBack }) => {
  const [detailedStats, setDetailedStats] = useState(null);
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      if (platform.id === PlatformId.Codeforces || platform.id === PlatformId.LeetCode) {
        setIsFetchingDetails(true);
        setDetailsError(null);
        try {
          let history;
          if (platform.id === PlatformId.Codeforces) {
            history = await fetchCodeforcesRatingHistory(username);
          } else if (platform.id === PlatformId.LeetCode) {
            history = await fetchLeetCodeContestHistory(username);
          }
          setDetailedStats(history);
        } catch(err) {
             if (err instanceof Error) {
                setDetailsError(err.message);
            } else {
                setDetailsError('An unexpected error occurred while fetching details.');
            }
        } finally {
            setIsFetchingDetails(false);
        }
      }
    };
    fetchDetails();
  }, [platform.id, username]);

  return (
    <div className={`bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl shadow-lg border-t-4 ${platform.primaryColor} animate-fade-in`}>
        <div className="flex items-center justify-between mb-6">
             <button onClick={onBack} className="flex items-center gap-2 text-blue-400 hover:text-blue-300 font-semibold transition-colors">
                <ArrowLeft size={20} />
                Back to all platforms
            </button>
            <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-gray-200">{platform.name}</h2>
                {platform.logo}
            </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div className="lg:col-span-1">
                <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-gray-400 mb-4">
                    Stats for <span className="text-blue-400">{username}</span>
                </h3>
                                 {renderDetails(stats, platform.id, detailedStats)}
            </div>
            <div className="lg:col-span-1 w-full flex justify-center items-center">
                {renderChart(platform.id, stats, detailedStats, isFetchingDetails, detailsError)}
            </div>
        </div>
    </div>
  );
};
