import { PlatformId } from '../constants';

export const fetchStats = async (username, platform) => {
  if (!username.trim()) {
    throw new Error('Username cannot be empty.');
  }

  // Special handling for Codeforces to fetch both user info and submission status
  if (platform.id === PlatformId.Codeforces) {
    try {
      const userInfoPromise = fetch(platform.apiUrl(username)).then(res => {
        if (!res.ok) throw new Error(`Codeforces API error: ${res.statusText}`);
        return res.json();
      });
      const userStatusPromise = fetch(`https://codeforces.com/api/user.status?handle=${username}`).then(res => {
        if (!res.ok) throw new Error(`Codeforces API error: ${res.statusText}`);
        return res.json();
      });

      const [userInfoData, userStatusData] = await Promise.all([userInfoPromise, userStatusPromise]);

      if (userInfoData.status === 'FAILED') {
        throw new Error(userInfoData.comment);
      }
      
      const combinedData = {
        userInfo: userInfoData,
        userStatus: userStatusData,
      };

      return platform.parser(combinedData);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch Codeforces data: ${error.message}`);
      }
      throw new Error('An unknown error occurred while fetching Codeforces data.');
    }
  }

  // Generic logic for all other platforms (now includes CodeChef and LeetCode)
  const url = platform.apiUrl(username);
  try {
    console.log(`Fetching from: ${url}`);
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      mode: 'cors'
    });
    console.log(`Response status: ${response.status}`);
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }
    const data = await response.json();
    console.log('API Response:', data);
    return platform.parser(data);
  } catch (error) {
    console.error('Fetch error:', error);
    if (error.message.includes('Failed to fetch') || error.message.includes('CORS')) {
      throw new Error('CORS error: The API server does not allow requests from this domain. Try using a different API endpoint or contact the API provider.');
    }
    if (error instanceof Error) {
        throw new Error(`Failed to fetch data: ${error.message}`);
    }
    throw new Error('An unknown error occurred.');
  }
};

export const fetchCodeforcesRatingHistory = async (username) => {
  if (!username.trim()) {
    throw new Error('Username cannot be empty.');
  }

  const url = `https://codeforces.com/api/user.rating?handle=${username}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }
    const data = await response.json();
    if (data.status === 'FAILED') {
      throw new Error(data.comment);
    }
    return data.result;
  } catch (error) {
    if (error instanceof Error) {
        throw new Error(`Failed to fetch rating history: ${error.message}`);
    }
    throw new Error('An unknown error occurred while fetching rating history.');
  }
};

export const fetchLeetCodeContestHistory = async (username) => {
  if (!username.trim()) {
    throw new Error('Username cannot be empty.');
  }

  // Try multiple CORS proxies in case one fails
  const corsProxies = [
    'https://thingproxy.freeboard.io/fetch/',
    'https://cors.bridged.cc/',
    'https://api.allorigins.win/raw?url=',
    'https://cors-anywhere.herokuapp.com/',
    'https://corsproxy.io/?'
  ];

  let lastError;
  
  for (const proxy of corsProxies) {
    try {
      const targetUrl = `https://leetcode-api-pied.vercel.app/user/${username}/contests`;
      const url = proxy + targetUrl;
      
      console.log(`Trying CORS proxy: ${proxy}`);
      
      const response = await fetch(url, {
        headers: {
          'Origin': 'http://localhost:5173',
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Successfully fetched contest data via proxy:', proxy);
      return data.userContestRankingHistory || [];
    } catch (error) {
      lastError = error;
      console.log(`CORS proxy ${proxy} failed:`, error.message);
      continue;
    }
  }
  
  // If all proxies fail, try alternative approach
  console.log('All CORS proxies failed, trying alternative approach...');
  
  try {
    // Try to get contest data from a different source or format
    // For now, return empty array to prevent the app from crashing
    console.log('Returning empty contest data as fallback');
    return [];
  } catch (error) {
    console.log('Alternative approach also failed:', error.message);
  }
  
  // If all approaches fail, throw the last error
  if (lastError instanceof Error) {
    throw new Error(`Failed to fetch LeetCode contest history: ${lastError.message}`);
  }
  throw new Error('An unknown error occurred while fetching LeetCode contest history.');
};

// Helper to derive a name from a URL slug
const getNameFromUrl = (url) => {
  if (!url) return '';
  try {
    const path = new URL(url).pathname;
    const parts = path.split('/').filter(p => p); // Get all non-empty path segments

    // Find the last segment that isn't purely numeric
    for (let i = parts.length - 1; i >= 0; i--) {
      if (!/^\d+$/.test(parts[i])) {
        const meaningfulPart = parts[i];
        // Capitalize and replace separators
        return meaningfulPart
          .replace(/[-_]/g, ' ')
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      }
    }
  } catch (e) {
    // Silently fail on invalid URLs
    return '';
  }
  return '';
};

export const fetchContests = async () => {
  const url = 'https://competeapi.vercel.app/contests/upcoming/';
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }
    const rawData = await response.json();
    
    // API can return an array or an object with an 'upcoming' property
    const contestsData = Array.isArray(rawData) ? rawData : rawData.upcoming;
    if (!Array.isArray(contestsData)) {
        throw new Error("Unexpected API response format for contests.");
    }

    const mappedData = contestsData.map((contest) => {
        const startTime = new Date(contest.startTime || contest.start_time);
        const endTime = new Date(contest.endTime || contest.end_time);
        const durationSeconds = (endTime.getTime() - startTime.getTime()) / 1000;
        
        let site = contest.site || contest.platform || 'Other';
        if (typeof site === 'string') {
            site = site.charAt(0).toUpperCase() + site.slice(1);
        }

        const derivedName = getNameFromUrl(contest.url);

        return {
          name: contest.title || derivedName || `${site} Contest`,
          url: contest.url,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          duration: String(durationSeconds),
          site: site,
          in_24_hours: 'No', // This field is not critical for the UI
          status: 'BEFORE', // Assuming all are 'BEFORE' as it's an upcoming list
        }
    });

    const uniqueContests = new Map();
    mappedData.forEach(contest => {
      const key = `${contest.name}|${contest.start_time}|${contest.end_time}`;
      if (!uniqueContests.has(key)) {
        uniqueContests.set(key, contest);
      }
    });

    const deduplicatedData = Array.from(uniqueContests.values());

    return deduplicatedData
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
  } catch (error) {
    if (error instanceof Error) {
        throw new Error(`Failed to fetch contests: ${error.message}`);
    }
    throw new Error('An unknown error occurred while fetching contests.');
  }
};
