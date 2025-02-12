'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  CalendarIcon,
  FireIcon,
  TrophyIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { fetchAllStats } from '@/lib/api';
import { useTheme } from '@/components/ThemeContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface AnalyticsData {
  dailyProgress: {
    date: string;
    problemsSolved: number;
    timeSpent: number;
  }[];
  difficultyStats: {
    difficulty: string;
    solved: number;
    attempted: number;
  }[];
  successRates: {
    difficulty: string;
    rate: number;
  }[];
  streak: number;
  totalSolved: number;
  averageTime: number;
  strongestDifficulty: string;
  weakestDifficulty: string;
}

const DIFFICULTY_COLORS = {
  Easy: {
    bg: 'rgba(32, 190, 255, 0.8)',
    border: 'rgb(32, 190, 255)',
  },
  Medium: {
    bg: 'rgba(0, 168, 243, 0.8)',
    border: 'rgb(0, 168, 243)',
  },
  Hard: {
    bg: 'rgba(0, 150, 214, 0.8)',
    border: 'rgb(0, 150, 214)',
  },
};

export default function AnalyticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isDark } = useTheme();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Fetch user's platform usernames
  const { data: userProfiles } = useQuery({
    queryKey: ['userProfiles'],
    queryFn: async () => {
      const response = await fetch('/api/user/profiles');
      if (!response.ok) throw new Error('Failed to fetch user profiles');
      return response.json();
    },
    enabled: !!session,
  });

  // Fetch analytics data with auto-refresh
  const { data: analytics, isLoading } = useQuery<AnalyticsData>({
    queryKey: ['analytics', userProfiles],
    queryFn: async () => {
      const response = await fetch('/api/analytics');
      if (!response.ok) throw new Error('Failed to fetch analytics');
      return response.json();
    },
    enabled: !!session && !!userProfiles,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    refetchOnWindowFocus: true,
  });

  // Fetch platform stats in real-time
  const { data: platformStats } = useQuery({
    queryKey: ['platformStats', userProfiles],
    queryFn: async () => {
      if (!userProfiles) return null;
      return fetchAllStats(
        userProfiles.leetcode,
        userProfiles.codechef,
        userProfiles.hackerrank
      );
    },
    enabled: !!session && !!userProfiles,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    refetchOnWindowFocus: true,
    onSuccess: (data) => {
      // Update analytics data when platform stats change
      if (data) {
        queryClient.invalidateQueries({ queryKey: ['analytics'] });
      }
    },
  });

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-[#F7FAFC] to-[#EDF2F7] dark:from-[#051C2C] dark:via-[#0F2D40] dark:to-[#051C2C]">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 border-3 border-[#20BEFF]/30 border-t-[#20BEFF] rounded-full animate-spin" />
          <span className="text-gray-600 dark:text-gray-400">Loading your analytics...</span>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const progressData = {
    labels: analytics?.dailyProgress.map(d => new Date(d.date).toLocaleDateString()) || [],
    datasets: [
      {
        label: 'Problems Solved',
        data: analytics?.dailyProgress.map(d => d.problemsSolved) || [],
        borderColor: 'rgb(32, 190, 255)',
        backgroundColor: 'rgba(32, 190, 255, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const stats = [
    {
      icon: TrophyIcon,
      label: 'Total Problems Solved',
      value: analytics?.totalSolved || 0,
      color: 'from-[#20BEFF] to-[#00A8F3]',
    },
    {
      icon: FireIcon,
      label: 'Current Streak',
      value: `${analytics?.streak || 0} days`,
      color: 'from-[#00A8F3] to-[#0096D6]',
    },
    {
      icon: ClockIcon,
      label: 'Average Time per Problem',
      value: `${analytics?.averageTime || 0} mins`,
      color: 'from-[#0096D6] to-[#007AB8]',
    },
    {
      icon: CalendarIcon,
      label: 'Best Performance',
      value: analytics?.strongestDifficulty || 'N/A',
      color: 'from-[#20BEFF] to-[#00A8F3]',
    },
  ];

  const difficultyData = {
    labels: analytics?.difficultyStats.map(d => d.difficulty) || [],
    datasets: [
      {
        label: 'Problems Solved',
        data: analytics?.difficultyStats.map(d => d.solved) || [],
        backgroundColor: analytics?.difficultyStats.map(d => DIFFICULTY_COLORS[d.difficulty as keyof typeof DIFFICULTY_COLORS].bg) || [],
        borderColor: analytics?.difficultyStats.map(d => DIFFICULTY_COLORS[d.difficulty as keyof typeof DIFFICULTY_COLORS].border) || [],
        borderWidth: 1,
      },
      {
        label: 'Problems Attempted',
        data: analytics?.difficultyStats.map(d => d.attempted) || [],
        backgroundColor: analytics?.difficultyStats.map(d => 
          d.difficulty === 'Easy' ? 'rgba(32, 190, 255, 0.4)' :
          d.difficulty === 'Medium' ? 'rgba(0, 168, 243, 0.4)' :
          'rgba(0, 150, 214, 0.4)'
        ) || [],
        borderColor: analytics?.difficultyStats.map(d => DIFFICULTY_COLORS[d.difficulty as keyof typeof DIFFICULTY_COLORS].border) || [],
        borderWidth: 1,
      },
    ],
  };

  const successRateData = {
    labels: analytics?.successRates.map(d => d.difficulty) || [],
    datasets: [
      {
        data: analytics?.successRates.map(d => d.rate) || [],
        backgroundColor: analytics?.successRates.map(d => DIFFICULTY_COLORS[d.difficulty as keyof typeof DIFFICULTY_COLORS].bg) || [],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#F7FAFC] to-[#EDF2F7] dark:from-[#051C2C] dark:via-[#0F2D40] dark:to-[#051C2C] pt-16 sm:pt-20">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 sm:mb-12"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#20BEFF] to-[#00A8F3] mb-3 sm:mb-4">
            Your Progress Analytics
          </h1>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto px-4">
            Track your DSA learning progress with detailed statistics and visualizations
          </p>
          <div className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center space-x-2">
            <span>Auto-updates every 5 minutes</span>
            <span>•</span>
            <span>Last updated: {new Date().toLocaleTimeString()}</span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/90 dark:bg-[#0F2D40]/90 backdrop-blur-xl p-4 sm:p-6 rounded-xl shadow-xl shadow-[#20BEFF]/10 border border-gray-100 dark:border-[#20BEFF]/20 hover:shadow-lg transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-r ${stat.color} bg-opacity-10`}>
                  <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <span className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/90 dark:bg-[#0F2D40]/90 backdrop-blur-xl p-4 sm:p-6 rounded-xl shadow-xl shadow-[#20BEFF]/10 border border-gray-100 dark:border-[#20BEFF]/20"
          >
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4">Daily Progress</h3>
            <div className="h-[250px] sm:h-[300px] md:h-[350px]">
              <Line
                data={progressData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                    tooltip: {
                      mode: 'index',
                      intersect: false,
                      bodyFont: {
                        size: 12,
                      },
                      titleFont: {
                        size: 12,
                      },
                      backgroundColor: isDark ? 'rgba(5, 28, 44, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                      titleColor: isDark ? '#e5e7eb' : '#374151',
                      bodyColor: isDark ? '#e5e7eb' : '#374151',
                      borderColor: 'rgba(32, 190, 255, 0.2)',
                      borderWidth: 1,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: {
                        color: isDark ? 'rgba(32, 190, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                      },
                      ticks: {
                        color: isDark ? '#e5e7eb' : '#374151',
                        font: {
                          size: 11,
                        },
                      },
                    },
                    x: {
                      grid: {
                        display: false,
                      },
                      ticks: {
                        color: isDark ? '#e5e7eb' : '#374151',
                        font: {
                          size: 11,
                        },
                        maxRotation: 45,
                        minRotation: 45,
                      },
                    },
                  },
                }}
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/90 dark:bg-[#0F2D40]/90 backdrop-blur-xl p-4 sm:p-6 rounded-xl shadow-xl shadow-[#20BEFF]/10 border border-gray-100 dark:border-[#20BEFF]/20"
          >
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4">Difficulty Distribution</h3>
            <div className="h-[250px] sm:h-[300px] md:h-[350px]">
              <Bar
                data={difficultyData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top',
                      labels: {
                        color: isDark ? '#e5e7eb' : '#374151',
                        boxWidth: 12,
                        padding: 15,
                        font: {
                          size: 11,
                        },
                      },
                    },
                    tooltip: {
                      mode: 'index',
                      intersect: false,
                      backgroundColor: isDark ? 'rgba(5, 28, 44, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                      titleColor: isDark ? '#e5e7eb' : '#374151',
                      bodyColor: isDark ? '#e5e7eb' : '#374151',
                      borderColor: 'rgba(32, 190, 255, 0.2)',
                      borderWidth: 1,
                      bodyFont: {
                        size: 12,
                      },
                      titleFont: {
                        size: 12,
                      },
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: {
                        color: isDark ? 'rgba(32, 190, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                      },
                      ticks: {
                        color: isDark ? '#e5e7eb' : '#374151',
                        font: {
                          size: 11,
                        },
                      },
                    },
                    x: {
                      grid: {
                        display: false,
                      },
                      ticks: {
                        color: isDark ? '#e5e7eb' : '#374151',
                        font: {
                          size: 11,
                        },
                      },
                    },
                  },
                }}
              />
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/90 dark:bg-[#0F2D40]/90 backdrop-blur-xl p-4 sm:p-6 rounded-xl shadow-xl shadow-[#20BEFF]/10 border border-gray-100 dark:border-[#20BEFF]/20"
        >
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4">Success Rate by Difficulty</h3>
          <div className="h-[300px] sm:h-[350px] md:h-[400px]">
            <Doughnut
              data={successRateData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: window.innerWidth < 640 ? 'bottom' : 'right',
                    labels: {
                      color: isDark ? '#e5e7eb' : '#374151',
                      boxWidth: 12,
                      padding: 15,
                      font: {
                        size: 11,
                      },
                    },
                  },
                  tooltip: {
                    backgroundColor: isDark ? 'rgba(5, 28, 44, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                    titleColor: isDark ? '#e5e7eb' : '#374151',
                    bodyColor: isDark ? '#e5e7eb' : '#374151',
                    borderColor: 'rgba(32, 190, 255, 0.2)',
                    borderWidth: 1,
                    bodyFont: {
                      size: 12,
                    },
                    titleFont: {
                      size: 12,
                    },
                    callbacks: {
                      label: (context) => {
                        const value = context.raw as number;
                        return `Success Rate: ${value.toFixed(1)}%`;
                      },
                    },
                  },
                },
              }}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
} 