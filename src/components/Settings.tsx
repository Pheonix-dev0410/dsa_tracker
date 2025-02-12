'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CodeBracketIcon, 
  CheckCircleIcon,
  InformationCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

interface UserProfiles {
  leetcode: string;
  codechef: string;
  hackerrank: string;
}

interface SettingsProps {
  onSave: (profiles: UserProfiles) => void;
  initialProfiles?: UserProfiles;
}

const platforms = [
  { 
    name: 'leetcode',
    label: 'LeetCode',
    icon: '🏆',
    placeholder: 'Enter your LeetCode username',
    description: 'Track your LeetCode progress, including problem counts and contest rating.',
    url: 'https://leetcode.com',
  },
  { 
    name: 'codechef',
    label: 'CodeChef',
    icon: '👨‍🍳',
    placeholder: 'Enter your CodeChef username',
    description: 'Monitor your CodeChef rating and problem-solving statistics.',
    url: 'https://www.codechef.com',
  },
  { 
    name: 'hackerrank',
    label: 'HackerRank',
    icon: '💻',
    placeholder: 'Enter your HackerRank username',
    description: 'Keep track of your HackerRank achievements and skill certifications.',
    url: 'https://www.hackerrank.com',
  },
];

export default function Settings({ onSave, initialProfiles }: SettingsProps) {
  const [profiles, setProfiles] = useState<UserProfiles>(
    initialProfiles || {
      leetcode: '',
      codechef: '',
      hackerrank: '',
    }
  );
  const [saving, setSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Partial<Record<keyof UserProfiles, string>>>({});
  const [showSuccess, setShowSuccess] = useState(false);

  const validateUsername = (username: string) => {
    return /^[a-zA-Z0-9_-]+$/.test(username);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setValidationErrors({});
    setShowSuccess(false);

    // Check if at least one username is provided
    const hasAtLeastOneUsername = Object.values(profiles).some(value => value.trim() !== '');
    if (!hasAtLeastOneUsername) {
      setValidationErrors({
        leetcode: 'At least one platform username is required',
        codechef: 'At least one platform username is required',
        hackerrank: 'At least one platform username is required'
      });
      setSaving(false);
      return;
    }

    // Validate usernames (only if they are provided)
    const errors: Partial<Record<keyof UserProfiles, string>> = {};
    Object.entries(profiles).forEach(([key, value]) => {
      if (value.trim() && !validateUsername(value)) {
        errors[key as keyof UserProfiles] = 'Invalid username format';
      }
    });

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setSaving(false);
      return;
    }

    try {
      await onSave(profiles);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving profiles:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setProfiles({
      leetcode: '',
      codechef: '',
      hackerrank: '',
    });
    setValidationErrors({});
    setShowSuccess(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto"
    >
      <div className="bg-white/90 dark:bg-[#0F2D40]/90 backdrop-blur-xl p-8 rounded-xl shadow-xl shadow-[#20BEFF]/10 border border-gray-100 dark:border-[#20BEFF]/20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#20BEFF] to-[#00A8F3]">
              Configure Platforms
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Connect your coding profiles to track your progress across platforms
            </p>
            <p className="mt-1 text-sm text-[#20BEFF] dark:text-[#20BEFF]/80">
              * At least one platform username is required
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleReset}
            className="p-2 text-gray-500 hover:text-[#20BEFF] transition-colors"
            title="Reset all fields"
          >
            <ArrowPathIcon className="w-5 h-5" />
          </motion.button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {platforms.map((platform) => (
            <motion.div
              key={platform.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: platforms.indexOf(platform) * 0.1 }}
              className="relative"
            >
              <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 dark:bg-[#051C2C] border border-gray-100 dark:border-[#20BEFF]/10 group hover:border-[#20BEFF]/30 dark:hover:border-[#20BEFF]/30 transition-colors">
                <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center text-2xl bg-white dark:bg-[#0F2D40] rounded-lg shadow-md">
                  {platform.icon}
                </div>
                
                <div className="flex-grow space-y-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {platform.label}
                    <span className="text-gray-400 dark:text-gray-500 text-xs ml-2">(Optional)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={profiles[platform.name as keyof UserProfiles]}
                      onChange={(e) =>
                        setProfiles((prev) => ({
                          ...prev,
                          [platform.name]: e.target.value,
                        }))
                      }
                      className={`w-full px-4 py-3 bg-white dark:bg-[#051C2C] border ${
                        validationErrors[platform.name as keyof UserProfiles]
                          ? 'border-red-500 dark:border-red-500'
                          : 'border-gray-200 dark:border-[#20BEFF]/20'
                      } rounded-lg text-sm placeholder-gray-400 dark:placeholder-gray-500
                        text-gray-900 dark:text-white
                        focus:border-[#20BEFF] focus:ring-2 focus:ring-[#20BEFF]/20 
                        dark:focus:border-[#20BEFF] dark:focus:ring-[#20BEFF]/20
                        transition-all duration-200`}
                      placeholder={platform.placeholder}
                    />
                    {validationErrors[platform.name as keyof UserProfiles] && (
                      <p className="mt-1 text-xs text-red-500">
                        {validationErrors[platform.name as keyof UserProfiles]}
                      </p>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <InformationCircleIcon className="w-4 h-4" />
                    {platform.description}
                  </p>
                </div>

                <a
                  href={platform.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 p-2 text-gray-400 hover:text-[#20BEFF] transition-colors"
                  title={`Visit ${platform.label}`}
                >
                  <CodeBracketIcon className="w-5 h-5" />
                </a>
              </div>
            </motion.div>
          ))}

          <div className="flex items-center justify-between pt-6 border-t border-gray-100 dark:border-[#20BEFF]/10">
            <AnimatedSuccess show={showSuccess} />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={saving}
              className="bg-[#20BEFF] hover:bg-[#00A8F3] text-white py-3 px-8 rounded-xl
                font-medium shadow-lg shadow-[#20BEFF]/20 hover:shadow-[#20BEFF]/30 
                transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center gap-2"
            >
              {saving ? (
                <>
                  <ArrowPathIcon className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </motion.button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}

function AnimatedSuccess({ show }: { show: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: show ? 1 : 0, x: show ? 0 : -20 }}
      className="flex items-center gap-2 text-green-600 dark:text-green-400"
    >
      <CheckCircleIcon className="w-5 h-5" />
      <span className="text-sm font-medium">Settings saved successfully!</span>
    </motion.div>
  );
} 