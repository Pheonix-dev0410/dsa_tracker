import axios from 'axios';

// LeetCode API endpoints
const LEETCODE_API = 'https://leetcode.com/graphql';
const LEETCODE_USER_PROFILE = `
  query userProfile($username: String!) {
    matchedUser(username: $username) {
      submitStats {
        acSubmissionNum {
          difficulty
          count
        }
      }
      submitStatsGlobal {
        rating
      }
    }
  }
`;

// CodeChef API endpoint
const CODECHEF_API = 'https://www.codechef.com/api/ratings/all';

// HackerRank API endpoint
const HACKERRANK_API = 'https://www.hackerrank.com/rest/hackers';

export interface ProblemStats {
  total: number;
  easy: number;
  medium: number;
  hard: number;
  rating: number;
}

export const fetchLeetCodeStats = async (username: string): Promise<ProblemStats> => {
  try {
    const response = await axios.post(LEETCODE_API, {
      query: LEETCODE_USER_PROFILE,
      variables: { username },
    });

    const stats = response.data.data.matchedUser.submitStats.acSubmissionNum;
    const rating = response.data.data.matchedUser.submitStatsGlobal.rating;

    return {
      total: stats.reduce((acc: number, curr: any) => acc + curr.count, 0),
      easy: stats.find((s: any) => s.difficulty === 'Easy')?.count || 0,
      medium: stats.find((s: any) => s.difficulty === 'Medium')?.count || 0,
      hard: stats.find((s: any) => s.difficulty === 'Hard')?.count || 0,
      rating: rating || 0,
    };
  } catch (error) {
    console.error('Error fetching LeetCode stats:', error);
    return {
      total: 0,
      easy: 0,
      medium: 0,
      hard: 0,
      rating: 0,
    };
  }
};

export const fetchCodeChefStats = async (username: string): Promise<number> => {
  try {
    const response = await axios.get(`${CODECHEF_API}/${username}`);
    return response.data.rating || 0;
  } catch (error) {
    console.error('Error fetching CodeChef stats:', error);
    return 0;
  }
};

export const fetchHackerRankStats = async (username: string): Promise<number> => {
  try {
    const response = await axios.get(`${HACKERRANK_API}/${username}`);
    return response.data.model.total_points || 0;
  } catch (error) {
    console.error('Error fetching HackerRank stats:', error);
    return 0;
  }
};

export async function fetchAllStats(leetcodeUsername: string, codechefUsername: string, hackerrankUsername: string) {
  if (!leetcodeUsername && !codechefUsername && !hackerrankUsername) {
    throw new Error('Please provide at least one username');
  }

  const params = new URLSearchParams();
  if (leetcodeUsername) params.append('leetcode', leetcodeUsername);
  if (codechefUsername) params.append('codechef', codechefUsername);
  if (hackerrankUsername) params.append('hackerrank', hackerrankUsername);

  try {
    const response = await fetch(`/api/platform-stats?${params.toString()}`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch stats');
    }
    return await response.json();
  } catch (error: any) {
    console.error('Error fetching stats:', error);
    throw new Error(error.message || 'Failed to fetch your coding stats. Please try again later.');
  }
} 