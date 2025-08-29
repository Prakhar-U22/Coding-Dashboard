import React, { useState, useEffect, useMemo } from 'react';
import { fetchContests } from '../services/api';
import { Spinner } from './Spinner';
import { ErrorMessage } from './ErrorMessage';
import { ContestList } from './ContestList';
import { ContestCalendar } from './ContestCalendar';
import { Search, ChevronDown } from 'lucide-react';

export const ContestsPage = () => {
  const [contests, setContests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [availablePlatforms, setAvailablePlatforms] = useState([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const loadContests = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchContests();
        setContests(data);

        const platforms = [...new Set(data.map(c => c.site))].sort();
        setAvailablePlatforms(platforms);
        setSelectedPlatforms(platforms); // Select all platforms by default
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unexpected error occurred.');
        }
      } finally {
        setIsLoading(false);
      }
    };
    loadContests();
  }, []);

  const filteredContests = useMemo(() => {
    return contests.filter(contest => {
      const matchesSearch = contest.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPlatform = selectedPlatforms.includes(contest.site);
      return matchesSearch && matchesPlatform;
    });
  }, [contests, searchTerm, selectedPlatforms]);
  
  const handlePlatformToggle = (platform) => {
    setSelectedPlatforms(prev => 
      prev.includes(platform) 
        ? prev.filter(p => p !== platform) 
        : [...prev, platform]
    );
  };

  const handleSelectAll = () => {
    if (selectedPlatforms.length === availablePlatforms.length) {
      setSelectedPlatforms([]);
    } else {
      setSelectedPlatforms(availablePlatforms);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-96"><Spinner size="lg" /></div>;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }
  
  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="Search Contests"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
        </div>
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full sm:w-64 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 flex justify-between items-center"
          >
            <span>
              {selectedPlatforms.length === availablePlatforms.length 
                ? 'All Platforms' 
                : `${selectedPlatforms.length} Selected`}
            </span>
            <ChevronDown className={`w-5 h-5 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          {isDropdownOpen && (
            <div className="absolute z-10 top-full mt-2 w-full sm:w-64 bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              <div className="p-2">
                <label className="flex items-center gap-2 px-2 py-1 hover:bg-gray-700 rounded cursor-pointer">
                  <input type="checkbox" checked={selectedPlatforms.length === availablePlatforms.length} onChange={handleSelectAll} className="form-checkbox h-4 w-4 text-blue-600 bg-gray-700 border-gray-600 rounded" />
                  Select All
                </label>
              </div>
              {availablePlatforms.map(platform => (
                <div key={platform} className="p-2 border-t border-gray-700">
                  <label className="flex items-center gap-2 px-2 py-1 hover:bg-gray-700 rounded cursor-pointer">
                    <input type="checkbox" checked={selectedPlatforms.includes(platform)} onChange={() => handlePlatformToggle(platform)} className="form-checkbox h-4 w-4 text-blue-600 bg-gray-700 border-gray-600 rounded"/>
                    {platform}
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <ContestList contests={filteredContests} />
        </div>
        <div className="lg:col-span-2">
          <ContestCalendar 
            contests={filteredContests}
            currentDate={currentDate}
            onDateChange={setCurrentDate}
           />
        </div>
      </div>
    </div>
  );
};
