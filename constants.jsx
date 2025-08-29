import React from 'react';

const CodeforcesLogo = () => (
  <img src="/Images/codeforces.png" alt="Codeforces" width="24" height="24" />
);

const LeetCodeLogo = () => (
  <img src="/Images/leetcode.jpeg" alt="LeetCode" width="24" height="24" />
);

const CodeChefLogo = () => (
  <img src="/Images/codechef.png" alt="CodeChef" width="24" height="24" />
);

const AtCoderLogo = () => (
  <img src="/Images/atcoder.png" alt="AtCoder" width="24" height="24" />
);

const GenericLogo = () => (
  <img src="/Images/generic.png" alt="Platform" width="24" height="24" />
);

export const PlatformId = {
  Codeforces: 'codeforces',
  LeetCode: 'leetcode',
  CodeChef: 'codechef',
};

export const PLATFORMS = [
  {
    id: PlatformId.Codeforces,
    name: 'Codeforces',
    logo: <CodeforcesLogo />,
    apiUrl: (username) => `https://codeforces.com/api/user.info?handles=${username}`,
    parser: (data) => {
      const { userInfo, userStatus } = data;
      if (userInfo.status === 'FAILED') {
        throw new Error(userInfo.comment);
      }
      const user = userInfo.result[0];
      
      let problemsSolved = 0;
      const problemRatings = {};
      const problemTags = {};

      if (userStatus.status === 'OK') {
        const solvedSubmissions = userStatus.result.filter((sub) => sub.verdict === 'OK');
        const uniqueProblems = new Map();
        
        for (const sub of solvedSubmissions) {
          const problemId = `${sub.problem.contestId}-${sub.problem.index}`;
          if (!uniqueProblems.has(problemId)) {
            uniqueProblems.set(problemId, sub.problem);
          }
        }
        
        problemsSolved = uniqueProblems.size;

        uniqueProblems.forEach(problem => {
          if (problem.rating) {
            const ratingStr = String(problem.rating);
            problemRatings[ratingStr] = (problemRatings[ratingStr] || 0) + 1;
          }
          if (problem.tags) {
            problem.tags.forEach((tag) => {
              problemTags[tag] = (problemTags[tag] || 0) + 1;
            });
          }
        });
      }

      return {
        handle: user.handle,
        rating: user.rating || 0,
        maxRating: user.maxRating || 0,
        rank: user.rank || 'Unrated',
        maxRank: user.maxRank || 'Unrated',
        friendOfCount: user.friendOfCount,
        problemsSolved,
        problemRatings,
        problemTags,
      };
    },
    primaryColor: 'border-rose-500',
  },
  {
    id: PlatformId.LeetCode,
    name: 'LeetCode',
    logo: <LeetCodeLogo />,
    apiUrl: (username) => `/api/leetcode/user/${username}`,
    contestApiUrl: (username) => `https://leetcode-api-pied.vercel.app/user/${username}/contests`,
    parser: (data) => {
      if (data.errors) {
        throw new Error(data.errors[0].message || 'User not found or API error.');
      }

      const submissionStats = data.submitStats?.acSubmissionNum || [];
      const getSolvedCount = (difficulty) => {
        const entry = submissionStats.find((s) => s.difficulty === difficulty);
        return entry ? entry.count : 0;
      };
      
      const problemTags = {};
      
      return {
        totalSolved: getSolvedCount('All'),
        easySolved: getSolvedCount('Easy'),
        mediumSolved: getSolvedCount('Medium'),
        hardSolved: getSolvedCount('Hard'),
        ranking: data.profile?.ranking || 0,
        problemTags: problemTags,
      };
    },
    primaryColor: 'border-amber-500',
  },
  {
    id: PlatformId.CodeChef,
    name: 'CodeChef',
    logo: <CodeChefLogo />,
    apiUrl: (username) => `https://competeapi.vercel.app/user/codechef/${username}`,
    parser: (data) => {
      if (!data.username) {
        throw new Error('User not found');
      }
      
      return {
        name: data.username,
        currentRating: String(data.rating_number || 0),
        highestRating: String(data.max_rank || 0),
        globalRank: data.global_rank || 'N/A',
        countryRank: data.country_rank || 'N/A',
        stars: data.rating || 'Unrated',
        problemsSolved: 0, // API doesn't provide this information
        problemTags: data.all_rating || {},
      };
    },
    primaryColor: 'border-slate-500',
  },
];

export const getContestPlatformInfo = (site) => {
    const siteLower = (site || '').toLowerCase();
    if (siteLower.includes('codeforces')) return { logo: <CodeforcesLogo />, color: 'bg-rose-500/30 text-rose-300' };
    if (siteLower.includes('leetcode')) return { logo: <LeetCodeLogo />, color: 'bg-amber-500/30 text-amber-300' };
    if (siteLower.includes('codechef')) return { logo: <CodeChefLogo />, color: 'bg-slate-500/30 text-slate-300' };
    if (siteLower.includes('atcoder')) return { logo: <AtCoderLogo />, color: 'bg-blue-500/30 text-blue-300' };
    
    return { logo: <GenericLogo />, color: 'bg-gray-600/30 text-gray-300' };
};
