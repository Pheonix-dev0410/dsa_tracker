import { NextResponse } from 'next/server';
import axios from 'axios';

// LeetCode API endpoint and query
const LEETCODE_API = 'https://leetcode.com/graphql';
const LEETCODE_QUERY = `
  query userProfile($username: String!) {
    matchedUser(username: $username) {
      submitStatsGlobal {
        acSubmissionNum {
          difficulty
          count
        }
      }
      profile {
        ranking
        reputation
      }
    }
  }
`;

// CodeChef API endpoint
const CODECHEF_API = 'https://www.codechef.com/users';

// HackerRank API endpoint
const HACKERRANK_API = 'https://www.hackerrank.com/rest/hackers';

// Add retry logic helper
const fetchWithRetry = async (fn: () => Promise<any>, retries = 3, delay = 2000) => {
  try {
    return await fn();
  } catch (error: any) {
    if (retries > 0 && (error.code === 'ECONNABORTED' || error.message.includes('timeout'))) {
      console.log(`Retrying... ${retries} attempts left`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchWithRetry(fn, retries - 1, delay);
    }
    throw error;
  }
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const leetcodeUsername = searchParams.get('leetcode');
    const codechefUsername = searchParams.get('codechef');
    const hackerrankUsername = searchParams.get('hackerrank');

    console.log('Received request with usernames:', {
      leetcode: leetcodeUsername,
      codechef: codechefUsername,
      hackerrank: hackerrankUsername
    });

    if (!leetcodeUsername && !codechefUsername && !hackerrankUsername) {
      return NextResponse.json({ error: 'No usernames provided' }, { status: 400 });
    }

    let leetcodeStats = null;
    let codechefRating = 0;
    let hackerrankPoints = 0;

    // Fetch LeetCode stats
    if (leetcodeUsername) {
      try {
        console.log('Fetching LeetCode stats for username:', leetcodeUsername);
        
        const leetcodeResponse = await fetchWithRetry(async () => {
          return axios.post(
            LEETCODE_API,
            {
              query: LEETCODE_QUERY,
              variables: { username: leetcodeUsername },
              operationName: 'userProfile'
            },
            {
              headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                'Accept': 'application/json',
                'Accept-Language': 'en-US,en;q=0.9',
                'Origin': 'https://leetcode.com',
                'Referer': 'https://leetcode.com/',
                'Cookie': '',
                'sec-ch-ua': '"Not A(Brand";v="99", "Google Chrome";v="121", "Chromium";v="121"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'same-origin',
                'x-requested-with': 'XMLHttpRequest'
              },
              timeout: 30000 // Increased timeout to 30 seconds
            }
          );
        });

        console.log('LeetCode API raw response:', leetcodeResponse.data);

        if (leetcodeResponse.data.errors) {
          console.error('LeetCode GraphQL errors:', leetcodeResponse.data.errors);
          throw new Error(leetcodeResponse.data.errors[0].message || 'GraphQL error occurred');
        }

        const userData = leetcodeResponse.data?.data?.matchedUser;
        if (!userData) {
          console.error('No user data found in response');
          throw new Error('User not found on LeetCode');
        }

        const stats = userData.submitStatsGlobal?.acSubmissionNum;
        if (!stats || !Array.isArray(stats)) {
          console.error('Invalid stats format:', stats);
          throw new Error('Invalid response format from LeetCode');
        }

        console.log('Raw LeetCode stats:', stats);
          
        // Generate ranking history based on current ranking
        const globalRanking = userData.profile?.ranking || 100000;
        const rankingHistory = Array.from({ length: 6 }, (_, i) => {
          const baseRanking = globalRanking;
          const randomVariation = Math.floor((Math.random() * 0.1 - 0.05) * baseRanking);
          return Math.max(1, baseRanking + randomVariation);
        }).sort((a, b) => b - a);

        // Map difficulty levels correctly
        const easyCount = stats.find((s: any) => s.difficulty === 'Easy')?.count || 0;
        const mediumCount = stats.find((s: any) => s.difficulty === 'Medium')?.count || 0;
        const hardCount = stats.find((s: any) => s.difficulty === 'Hard')?.count || 0;
        const totalCount = easyCount + mediumCount + hardCount;

        console.log('Problem counts:', { easy: easyCount, medium: mediumCount, hard: hardCount, total: totalCount });

        leetcodeStats = {
          total: totalCount,
          easy: easyCount,
          medium: mediumCount,
          hard: hardCount,
          ranking: globalRanking,
          reputation: userData.profile?.reputation || 0,
          rankingHistory
        };

        console.log('Processed LeetCode stats:', leetcodeStats);
      } catch (error: any) {
        console.error('LeetCode API error:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          stack: error.stack
        });
        
        if (error.response?.status === 429) {
          throw new Error('Too many requests to LeetCode API. Please try again later.');
        } else if (error.response?.data?.errors) {
          const errorMessage = error.response.data.errors[0]?.message || 'Unknown GraphQL error';
          throw new Error(`LeetCode API error: ${errorMessage}`);
        } else {
          throw new Error(`Failed to fetch LeetCode stats: ${error.message}`);
        }
      }
    }

    // Fetch CodeChef stats
    if (codechefUsername) {
      try {
        const codechefResponse = await axios.get(`${CODECHEF_API}/${codechefUsername}`, {
          headers: {
            'User-Agent': 'Mozilla/5.0',
            'Accept': 'text/html',
          },
          timeout: 10000
        });
        
        // Extract rating from HTML response
        const ratingMatch = codechefResponse.data.match(/Rating\s*:\s*(\d+)/);
        if (ratingMatch) {
          codechefRating = parseInt(ratingMatch[1]);
        }
      } catch (error) {
        console.error('CodeChef API error:', error);
      }
    }

    // Fetch HackerRank stats
    if (hackerrankUsername) {
      try {
        const hackerrankResponse = await axios.get(`${HACKERRANK_API}/${hackerrankUsername}/scores`, {
          headers: {
            'User-Agent': 'Mozilla/5.0',
            'Accept': 'application/json',
          },
          timeout: 10000
        });
        
        hackerrankPoints = hackerrankResponse.data?.models?.[0]?.total_points || 0;
      } catch (error) {
        console.error('HackerRank API error:', error);
      }
    }

    // Generate ranking history for CodeChef (lower is better)
    const codechefRankingHistory = Array.from({ length: 6 }, (_, i) => {
      const baseRanking = 50000; // Example base ranking
      const randomVariation = Math.floor((Math.random() * 0.1 - 0.05) * baseRanking);
      return Math.max(1, baseRanking + randomVariation);
    }).sort((a, b) => b - a);

    // Generate ranking history for HackerRank (lower is better)
    const hackerrankRankingHistory = Array.from({ length: 6 }, (_, i) => {
      const baseRanking = 30000; // Example base ranking
      const randomVariation = Math.floor((Math.random() * 0.1 - 0.05) * baseRanking);
      return Math.max(1, baseRanking + randomVariation);
    }).sort((a, b) => b - a);

    const responseData = {
      leetcode: leetcodeStats,
      codechefRating,
      codechefRankingHistory,
      hackerrankPoints,
      hackerrankRankingHistory
    };

    console.log('Sending response:', responseData);
    return NextResponse.json(responseData);
    
  } catch (error: any) {
    console.error('Error in platform-stats route:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch platform stats',
        message: error.message
      },
      { status: 500 }
    );
  }
} 