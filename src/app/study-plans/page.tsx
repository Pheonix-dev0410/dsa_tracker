'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { CalendarIcon, ClockIcon, AcademicCapIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface StudyPlan {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  categories: string[];
  difficulty: string;
  progress?: number;
}

const DIFFICULTY_LEVELS = [
  { id: 'Easy', color: 'bg-[#20BEFF]/10 text-[#20BEFF]' },
  { id: 'Medium', color: 'bg-[#00A8F3]/10 text-[#00A8F3]' },
  { id: 'Hard', color: 'bg-[#0096D6]/10 text-[#0096D6]' },
];

const DSA_CATEGORIES = [
  { id: 'Arrays', name: 'Arrays & Strings', icon: '📊' },
  { id: 'LinkedList', name: 'Linked Lists', icon: '🔗' },
  { id: 'Stack', name: 'Stacks & Queues', icon: '📚' },
  { id: 'Tree', name: 'Trees & BST', icon: '🌳' },
  { id: 'Graph', name: 'Graphs', icon: '🕸️' },
  { id: 'DynamicProgramming', name: 'Dynamic Programming', icon: '🧮' },
  { id: 'Recursion', name: 'Recursion & Backtracking', icon: '🔄' },
  { id: 'Sorting', name: 'Sorting & Searching', icon: '🔍' },
  { id: 'Greedy', name: 'Greedy Algorithms', icon: '🎯' },
];

export default function StudyPlansPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [studyPlans, setStudyPlans] = useState<StudyPlan[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState('Medium');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [duration, setDuration] = useState(30);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchStudyPlans();
    }
  }, [session]);

  const fetchStudyPlans = async () => {
    try {
      const response = await fetch('/api/study-plan');
      if (!response.ok) {
        throw new Error('Failed to fetch study plans');
      }
      const data = await response.json();
      setStudyPlans(data);
    } catch (error) {
      console.error('Error fetching study plans:', error);
      setError('Failed to fetch study plans');
    }
  };

  const handleCreatePlan = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCreating(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
      const data = {
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        duration,
        focusCategories: selectedCategories,
        difficulty: selectedDifficulty,
      };

      const response = await fetch('/api/study-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create study plan');
      }

      await fetchStudyPlans();
      e.currentTarget.reset();
      setSelectedCategories([]);
      setSelectedDifficulty('Medium');
      setDuration(30);
    } catch (error) {
      console.error('Error creating study plan:', error);
      setError('Failed to create study plan');
    } finally {
      setCreating(false);
    }
  };

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleEditPlan = (plan: StudyPlan) => {
    // Implement edit functionality
    console.log('Editing plan:', plan);
  };

  const handleDeletePlan = async (planId: string) => {
    try {
      const response = await fetch(`/api/study-plan/${planId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete study plan');
      }

      await fetchStudyPlans();
    } catch (error) {
      console.error('Error deleting study plan:', error);
      setError('Failed to delete study plan');
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-[#F7FAFC] to-[#EDF2F7] dark:from-[#051C2C] dark:via-[#0F2D40] dark:to-[#051C2C]">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 border-3 border-[#20BEFF]/30 border-t-[#20BEFF] rounded-full animate-spin" />
          <span className="text-gray-600 dark:text-gray-400">Loading study plans...</span>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#F7FAFC] to-[#EDF2F7] dark:from-[#051C2C] dark:via-[#0F2D40] dark:to-[#051C2C] px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      
      <div className="relative max-w-7xl mx-auto space-y-8 sm:space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-4"
        >
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#20BEFF] to-[#00A8F3]">
            Study Plans
          </h1>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Create and manage your DSA learning journey with personalized study plans
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white/90 dark:bg-[#0F2D40]/90 backdrop-blur-xl p-6 sm:p-8 rounded-xl shadow-xl shadow-[#20BEFF]/10 border border-gray-100 dark:border-[#20BEFF]/20"
          >
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-white mb-6">
              Create Study Plan
            </h2>
            <form onSubmit={handleCreatePlan} className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Plan Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  className="w-full px-4 py-3 bg-white dark:bg-[#051C2C] border border-gray-200 dark:border-[#20BEFF]/20 rounded-xl text-sm sm:text-base placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#20BEFF]/50 dark:focus:ring-[#20BEFF]/50 focus:border-transparent transition-all duration-200"
                  placeholder="Enter plan title"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  required
                  rows={3}
                  className="w-full px-4 py-3 bg-white dark:bg-[#051C2C] border border-gray-200 dark:border-[#20BEFF]/20 rounded-xl text-sm sm:text-base placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#20BEFF]/50 dark:focus:ring-[#20BEFF]/50 focus:border-transparent transition-all duration-200"
                  placeholder="Describe your study plan"
                />
              </div>

              <div>
                <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Duration (days)
                </label>
                <div className="flex items-center space-x-4">
                  {[7, 14, 30, 60, 90].map((days) => (
                    <motion.button
                      key={days}
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setDuration(days)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        duration === days
                          ? 'bg-[#20BEFF] text-white'
                          : 'bg-gray-100 dark:bg-[#051C2C] text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {days}d
                    </motion.button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Difficulty Level
                </label>
                <div className="flex space-x-4">
                  {DIFFICULTY_LEVELS.map((level) => (
                    <motion.button
                      key={level.id}
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedDifficulty(level.id)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        selectedDifficulty === level.id ? level.color : 'bg-gray-100 dark:bg-[#051C2C] text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {level.id}
                    </motion.button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Focus Categories
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {DSA_CATEGORIES.map((category) => (
                    <motion.button
                      key={category.id}
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => toggleCategory(category.id)}
                      className={`p-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2
                        ${selectedCategories.includes(category.id)
                          ? 'bg-[#20BEFF]/10 text-[#20BEFF]'
                          : 'bg-gray-100 dark:bg-[#051C2C] text-gray-600 dark:text-gray-400'
                        }`}
                    >
                      <span>{category.icon}</span>
                      {category.name}
                    </motion.button>
                  ))}
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={creating || selectedCategories.length === 0}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl text-sm sm:text-base font-medium text-white bg-[#20BEFF] hover:bg-[#00A8F3] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#20BEFF] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#20BEFF]/20 hover:shadow-[#20BEFF]/30 transition-all duration-200"
              >
                {creating ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Creating plan...</span>
                  </div>
                ) : (
                  'Create Plan'
                )}
              </motion.button>
            </form>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white/90 dark:bg-[#0F2D40]/90 backdrop-blur-xl p-6 sm:p-8 rounded-xl shadow-xl shadow-[#20BEFF]/10 border border-gray-100 dark:border-[#20BEFF]/20"
          >
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-white mb-6">
              Your Study Plans
            </h2>
            {error && (
              <div className="text-[#20BEFF] bg-[#20BEFF]/10 dark:bg-[#20BEFF]/5 p-4 rounded-lg mb-4">
                {error}
              </div>
            )}
            {studyPlans.length === 0 ? (
              <div className="text-center py-12">
                <AcademicCapIcon className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  You haven't created any study plans yet.
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  Create your first plan to start your structured learning journey!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {studyPlans.map((plan) => (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 bg-white dark:bg-[#051C2C] rounded-xl border border-gray-200 dark:border-[#20BEFF]/20 hover:shadow-lg transition-all duration-200"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
                          {plan.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {plan.description}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        DIFFICULTY_LEVELS.find(d => d.id === plan.difficulty)?.color
                      }`}>
                        {plan.difficulty}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <CalendarIcon className="w-4 h-4 mr-2" />
                        {new Date(plan.startDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <ClockIcon className="w-4 h-4 mr-2" />
                        {Math.ceil((new Date(plan.endDate).getTime() - new Date(plan.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {plan.categories.map((category) => (
                          <span
                            key={category}
                            className="px-2 py-1 text-xs font-medium bg-[#20BEFF]/10 text-[#20BEFF] rounded-lg"
                          >
                            {DSA_CATEGORIES.find(c => c.id === category)?.name || category}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress</span>
                        <span className="text-sm font-medium text-[#20BEFF]">{plan.progress || 0}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 dark:bg-[#051C2C] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#20BEFF] transition-all duration-300"
                          style={{ width: `${plan.progress || 0}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleEditPlan(plan)}
                        className="px-4 py-2 text-sm font-medium text-[#20BEFF] hover:text-[#00A8F3] transition-colors"
                      >
                        Edit
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDeletePlan(plan.id)}
                        className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                      >
                        Delete
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
} 