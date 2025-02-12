'use client';

import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import {
  ChartBarIcon,
  AcademicCapIcon,
  TrophyIcon,
} from '@heroicons/react/24/outline';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import Settings from './Settings';
import { fetchAllStats } from '@/lib/api';
import { StatCardSkeleton, ChartSkeleton, TopicProgressSkeleton } from './Skeleton';
import Link from 'next/link';
import { useTheme } from './ThemeContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface UserProfiles {
  leetcode: string;
  codechef: string;
  hackerrank: string;
}

interface Stats {
  totalProblems: number;
  easyProblems: number;
  mediumProblems: number;
  hardProblems: number;
  leetcodeRanking: number;
  leetcodeReputation: number;
  codechefRating: number;
  hackerrankPoints: number;
}

interface RankingHistory {
  leetcode: number[];
  codechef: number[];
  hackerrank: number[];
  dates: string[];
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const DIFFICULTY_COLORS = {
  Easy: { name: 'Easy', color: 'from-[#20BEFF] to-[#00A8F3]' },
  Medium: { name: 'Medium', color: 'from-[#00A8F3] to-[#0096D6]' },
  Hard: { name: 'Hard', color: 'from-[#0096D6] to-[#007AB8]' },
};

export default function HomeContent() {
  const { isDark } = useTheme();
  const { scrollY } = useScroll();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const titleOpacity = useTransform(scrollY, [0, 200], [1, 0]);
  const titleScale = useTransform(scrollY, [0, 200], [1, 0.9]);

  const [showSettings, setShowSettings] = useState(false);
  const [profiles, setProfiles] = useState<UserProfiles>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('userProfiles');
      return saved ? JSON.parse(saved) : { leetcode: '', codechef: '', hackerrank: '' };
    }
    return { leetcode: '', codechef: '', hackerrank: '' };
  });

  const [stats, setStats] = useState<Stats>({
    totalProblems: 0,
    easyProblems: 0,
    mediumProblems: 0,
    hardProblems: 0,
    leetcodeRanking: 0,
    leetcodeReputation: 0,
    codechefRating: 0,
    hackerrankPoints: 0
  });

  const [rankingHistory, setRankingHistory] = useState<RankingHistory>({
    leetcode: [],
    codechef: [],
    hackerrank: [],
    dates: []
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rankingData = {
    labels: rankingHistory.dates,
    datasets: [
      {
        label: 'LeetCode Ranking',
        data: rankingHistory.leetcode,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.4,
        borderWidth: 3,
        fill: false,
      },
      {
        label: 'CodeChef Ranking',
        data: rankingHistory.codechef,
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.4,
        borderWidth: 3,
        fill: false,
      },
      {
        label: 'HackerRank Ranking',
        data: rankingHistory.hackerrank,
        borderColor: 'rgb(255, 206, 86)',
        tension: 0.4,
        borderWidth: 3,
        fill: false,
      }
    ],
  };

  useEffect(() => {
    const fetchStats = async () => {
      if (!profiles.leetcode && !profiles.codechef && !profiles.hackerrank) {
        return;
      }

      setIsLoading(true);
      setError(null);
      
      try {
        const allStats = await fetchAllStats(
          profiles.leetcode,
          profiles.codechef,
          profiles.hackerrank
        );
        console.log('Fetched stats:', allStats);
        
        setStats({
          totalProblems: allStats.leetcode?.total || 0,
          easyProblems: allStats.leetcode?.easy || 0,
          mediumProblems: allStats.leetcode?.medium || 0,
          hardProblems: allStats.leetcode?.hard || 0,
          leetcodeRanking: allStats.leetcode?.ranking || 0,
          leetcodeReputation: allStats.leetcode?.reputation || 0,
          codechefRating: allStats.codechefRating || 0,
          hackerrankPoints: allStats.hackerrankPoints || 0
        });

        // Generate last 6 months of dates
        const dates = Array.from({ length: 6 }, (_, i) => {
          const date = new Date();
          date.setMonth(date.getMonth() - (5 - i));
          return date.toLocaleDateString('en-US', { month: 'short' });
        });

        // Generate ranking history (this should come from your API in a real app)
        setRankingHistory({
          dates,
          leetcode: allStats.leetcode?.rankingHistory || [],
          codechef: allStats.codechefRankingHistory || [],
          hackerrank: allStats.hackerrankRankingHistory || []
        });

      } catch (err: any) {
        console.error('Error fetching stats:', err);
        setError(err.message || 'Failed to fetch your coding stats. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [profiles]);

  const handleSaveProfiles = (newProfiles: UserProfiles) => {
    setProfiles(newProfiles);
    localStorage.setItem('userProfiles', JSON.stringify(newProfiles));
    setShowSettings(false);
  };

  const statCards = [
    { 
      title: 'Total Problems',
      value: stats.totalProblems,
      icon: ChartBarIcon,
      color: 'from-blue-600 to-indigo-600'
    },
    { 
      title: 'LeetCode Ranking',
      value: stats.leetcodeRanking > 0 ? `#${stats.leetcodeRanking.toLocaleString()}` : 'N/A',
      subtitle: stats.leetcodeReputation > 0 ? `${stats.leetcodeReputation} reputation` : undefined,
      icon: AcademicCapIcon,
      color: 'from-green-600 to-emerald-600'
    },
    { 
      title: 'CodeChef Rating',
      value: stats.codechefRating > 0 ? stats.codechefRating : 'N/A',
      icon: TrophyIcon,
      color: 'from-purple-600 to-pink-600'
    },
    {
      title: 'HackerRank Points',
      value: stats.hackerrankPoints > 0 ? stats.hackerrankPoints : 'N/A',
      icon: AcademicCapIcon,
      color: 'from-yellow-600 to-orange-600'
    }
  ];

  return (
    <motion.div
      initial="initial"
      animate="animate"
      className="min-h-screen bg-gradient-to-br from-white via-[#F7FAFC] to-[#EDF2F7] dark:from-[#051C2C] dark:via-[#0F2D40] dark:to-[#051C2C] pt-16"
    >
      <div className="container mx-auto px-4 py-12">
        <motion.div
          style={{ opacity: titleOpacity, scale: titleScale }}
          className="relative z-10 py-24 text-center"
        >
          <motion.h1
            variants={fadeInUp}
            className="text-7xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-[#20BEFF] to-[#00A8F3]"
          >
            DSA Progress Tracker
          </motion.h1>
          <motion.p
            variants={fadeInUp}
            className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-12"
          >
            Master your coding journey with comprehensive tracking and analytics
          </motion.p>
          <motion.div
            variants={fadeInUp}
            className="flex justify-center space-x-6"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowSettings(!showSettings)}
              className="bg-[#20BEFF] hover:bg-[#00A8F3] text-white px-8 py-4 rounded-lg font-medium 
                shadow-lg shadow-[#20BEFF]/20 hover:shadow-[#20BEFF]/30 transition-all duration-300"
            >
              {showSettings ? 'Close Settings' : 'Configure Platforms'}
            </motion.button>
            <Link
              href="/study-plans"
              className="bg-white dark:bg-[#051C2C] text-[#2D3B48] dark:text-white px-8 py-4 rounded-lg font-medium 
                shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-[#20BEFF]/20"
            >
              View Study Plans
            </Link>
          </motion.div>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto mb-12 bg-[#20BEFF]/10 dark:bg-[#20BEFF]/5 text-[#20BEFF] p-6 rounded-xl border border-[#20BEFF]/20"
          >
            {error}
          </motion.div>
        )}

        {showSettings ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-4xl mx-auto"
          >
            <Settings onSave={handleSaveProfiles} initialProfiles={profiles} />
          </motion.div>
        ) : (
          <motion.div variants={staggerContainer} ref={ref}>
            {isLoading ? (
              <div className="space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {[1, 2, 3, 4].map((i) => (
                    <StatCardSkeleton key={i} />
                  ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <TopicProgressSkeleton />
                  <ChartSkeleton />
                </div>
              </div>
            ) : (
              <>
                <motion.div
                  variants={fadeInUp}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12"
                  animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  {statCards.map((stat, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ 
                        y: -5,
                        scale: 1.02,
                      }}
                      className="relative overflow-hidden bg-white/90 dark:bg-[#0F2D40]/90 backdrop-blur-xl p-8 rounded-xl shadow-xl
                        border border-gray-100 dark:border-[#20BEFF]/20"
                    >
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#20BEFF] to-[#00A8F3] opacity-75" />
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-medium text-gray-600 dark:text-gray-300">
                          {stat.title}
                        </h2>
                        <stat.icon className="w-6 h-6 text-[#20BEFF]" />
                      </div>
                      <p className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#20BEFF] to-[#00A8F3]">
                        {stat.value}
                      </p>
                      {stat.subtitle && (
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                          {stat.subtitle}
                        </p>
                      )}
                    </motion.div>
                  ))}
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <motion.div
                    variants={fadeInUp}
                    className="bg-white/90 dark:bg-[#0F2D40]/90 backdrop-blur-xl p-8 rounded-xl shadow-xl
                      border border-gray-100 dark:border-[#20BEFF]/20"
                  >
                    <h2 className="text-2xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-[#20BEFF] to-[#00A8F3]">
                      Difficulty Progress
                    </h2>
                    <div className="space-y-8">
                      {[
                        { name: 'Easy', value: stats.easyProblems, color: 'from-[#20BEFF] to-[#00A8F3]' },
                        { name: 'Medium', value: stats.mediumProblems, color: 'from-[#00A8F3] to-[#0096D6]' },
                        { name: 'Hard', value: stats.hardProblems, color: 'from-[#0096D6] to-[#007AB8]' },
                      ].map((difficulty, index) => (
                        <motion.div
                          key={index}
                          initial={{ width: 0 }}
                          whileInView={{ width: '100%' }}
                          viewport={{ once: true }}
                        >
                          <div className="flex justify-between mb-3">
                            <span className="font-medium text-gray-700 dark:text-gray-300">{difficulty.name}</span>
                            <span className="text-gray-600 dark:text-gray-400">
                              {difficulty.value} problems
                            </span>
                          </div>
                          <div className="h-3 bg-gray-100 dark:bg-[#051C2C] rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${(difficulty.value / stats.totalProblems) * 100}%` }}
                              transition={{ duration: 1.5, ease: "easeOut" }}
                              className={`h-full bg-gradient-to-r ${difficulty.color} relative`}
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent" />
                            </motion.div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>

                  <motion.div
                    variants={fadeInUp}
                    className="bg-white/90 dark:bg-[#0F2D40]/90 backdrop-blur-xl p-8 rounded-xl shadow-xl
                      border border-gray-100 dark:border-[#20BEFF]/20"
                  >
                    <h2 className="text-2xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-[#20BEFF] to-[#00A8F3]">
                      Global Ranking Progress
                    </h2>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                      Lower ranking indicates better performance
                    </div>
                    <Line
                      data={rankingData}
                      options={{
                        responsive: true,
                        plugins: {
                          legend: {
                            position: 'bottom',
                            labels: {
                              usePointStyle: true,
                              padding: 20,
                              color: isDark ? '#e5e7eb' : '#374151',
                            },
                          },
                          tooltip: {
                            backgroundColor: isDark ? 'rgba(5, 28, 44, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                            titleColor: isDark ? '#e5e7eb' : '#374151',
                            bodyColor: isDark ? '#e5e7eb' : '#374151',
                            padding: 12,
                            bodySpacing: 4,
                            boxPadding: 4,
                          },
                        },
                        scales: {
                          y: {
                            reverse: true,
                            grid: {
                              color: isDark ? 'rgba(32, 190, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                            },
                            ticks: {
                              color: isDark ? '#e5e7eb' : '#374151',
                            }
                          },
                          x: {
                            grid: {
                              display: false,
                            },
                            ticks: {
                              color: isDark ? '#e5e7eb' : '#374151',
                            }
                          },
                        },
                      }}
                    />
                  </motion.div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
} 