'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarIcon, ClockIcon, AcademicCapIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

interface StudyPlanFormData {
  duration: number;
  focusCategories: string[];
  difficulty: string;
  title: string;
  description: string;
}

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
  { id: 'BitManipulation', name: 'Bit Manipulation', icon: '⚡' },
  { id: 'Math', name: 'Math & Logic', icon: '🔢' },
  { id: 'Design', name: 'System Design', icon: '🏗️' },
];

const DIFFICULTY_LEVELS = [
  { id: 'Easy', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  { id: 'Medium', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
  { id: 'Hard', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
];

export default function StudyPlan() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<StudyPlanFormData>({
    title: '',
    description: '',
    duration: 30,
    focusCategories: [],
    difficulty: 'Medium',
  });

  const { data: studyPlans, isLoading } = useQuery({
    queryKey: ['studyPlans'],
    queryFn: async () => {
      const response = await fetch('/api/study-plan');
      if (!response.ok) throw new Error('Failed to fetch study plans');
      return response.json();
    },
  });

  const createStudyPlan = useMutation({
    mutationFn: async (data: StudyPlanFormData) => {
      const response = await fetch('/api/study-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create study plan');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studyPlans'] });
      setShowForm(false);
      setFormData({
        title: '',
        description: '',
        duration: 30,
        focusCategories: [],
        difficulty: 'Medium',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createStudyPlan.mutate(formData);
  };

  const toggleCategory = (category: string) => {
    setFormData(prev => ({
      ...prev,
      focusCategories: prev.focusCategories.includes(category)
        ? prev.focusCategories.filter(c => c !== category)
        : [...prev.focusCategories, category],
    }));
  };

  const getDifficultyColor = (difficulty: string) => {
    return DIFFICULTY_LEVELS.find(level => level.id === difficulty)?.color || '';
  };

  const calculateProgress = (problems: any[]) => {
    if (!problems.length) return 0;
    return Math.round((problems.filter(p => p.completed).length / problems.length) * 100);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Study Plans</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Create and manage your DSA learning journey</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowForm(!showForm)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl
            font-medium shadow-lg hover:shadow-xl transition-all duration-200"
        >
          {showForm ? 'Cancel' : 'Create New Plan'}
        </motion.button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            onSubmit={handleSubmit}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Plan Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 dark:border-gray-700
                    focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800
                    transition-all duration-200 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm"
                  placeholder="e.g., 30-Day DSA Challenge"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Duration (days)
                </label>
                <input
                  type="number"
                  min="1"
                  max="90"
                  value={formData.duration}
                  onChange={e => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                  className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 dark:border-gray-700
                    focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800
                    transition-all duration-200 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 dark:border-gray-700
                  focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800
                  transition-all duration-200 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm"
                rows={3}
                placeholder="Describe your study plan goals..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Focus Categories
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {DSA_CATEGORIES.map(category => (
                  <motion.button
                    key={category.id}
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => toggleCategory(category.id)}
                    className={`p-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2
                      ${formData.focusCategories.includes(category.id)
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}`}
                  >
                    <span>{category.icon}</span>
                    {category.name}
                  </motion.button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Difficulty Level
              </label>
              <div className="flex gap-4">
                {DIFFICULTY_LEVELS.map(level => (
                  <motion.button
                    key={level.id}
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setFormData(prev => ({ ...prev, difficulty: level.id }))}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                      ${formData.difficulty === level.id ? level.color : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}`}
                  >
                    {level.id}
                  </motion.button>
                ))}
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={createStudyPlan.isPending}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl
                font-medium shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
            >
              {createStudyPlan.isPending ? 'Creating...' : 'Create Study Plan'}
            </motion.button>
          </motion.form>
        )}
      </AnimatePresence>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg animate-pulse"
            >
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {studyPlans?.map((plan: any) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{plan.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(plan.difficulty)}`}>
                    {plan.difficulty}
                  </span>
                </div>
                
                <p className="text-gray-600 dark:text-gray-400 mb-4">{plan.description}</p>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <CalendarIcon className="w-5 h-5" />
                    <span>{new Date(plan.startDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <ClockIcon className="w-5 h-5" />
                    <span>{plan.duration} days</span>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress</span>
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                      {calculateProgress(plan.problems)}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300"
                      style={{ width: `${calculateProgress(plan.problems)}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  {plan.problems.slice(0, 3).map((problem: any) => (
                    <div
                      key={problem.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        {problem.completed ? (
                          <CheckCircleIcon className="w-5 h-5 text-green-500" />
                        ) : (
                          <XCircleIcon className="w-5 h-5 text-gray-400" />
                        )}
                        <a
                          href={problem.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          {problem.name}
                        </a>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {problem.category}
                      </span>
                    </div>
                  ))}
                  {plan.problems.length > 3 && (
                    <div className="text-center">
                      <button className="text-blue-600 dark:text-blue-400 text-sm hover:underline">
                        View all {plan.problems.length} problems
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
} 