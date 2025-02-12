'use client';

import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRightIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import Logo from '@/components/Logo';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const justRegistered = searchParams.get('registered') === 'true';

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
      } else {
        router.push('/');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-[#F7FAFC] to-[#EDF2F7] dark:from-[#051C2C] dark:via-[#0F2D40] dark:to-[#051C2C] px-4">
      <div className="animated-background" />
      <div className="floating-shapes" />
      <div className="animated-circles">
        <div className="circle" />
        <div className="circle" />
        <div className="circle" />
      </div>
      <div className="gradient-lines">
        <div className="line" />
        <div className="line" />
        <div className="line" />
        <div className="line" />
      </div>
      <div className="background-pattern" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        {justRegistered && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute -top-16 left-0 right-0 flex items-center justify-center gap-2 text-green-500 dark:text-green-400 bg-white/80 dark:bg-[#0F2D40]/80 backdrop-blur-xl p-4 rounded-xl shadow-lg mb-4"
          >
            <CheckCircleIcon className="w-5 h-5" />
            <span>Account created successfully! Please sign in.</span>
          </motion.div>
        )}

        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white/80 dark:bg-[#0F2D40]/80 backdrop-blur-xl p-8 rounded-t-2xl shadow-xl shadow-[#20BEFF]/10 border border-gray-100 dark:border-[#20BEFF]/20 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#20BEFF] to-[#00A8F3]" />
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <Logo showText={false} />
              </div>
              <div>
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#20BEFF] to-[#00A8F3]">
                  Welcome Back
                </h2>
                <p className="text-base text-gray-600 dark:text-gray-400 mt-2">
                  Continue your DSA learning journey
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white/80 dark:bg-[#0F2D40]/80 backdrop-blur-xl p-8 rounded-b-2xl shadow-xl shadow-[#20BEFF]/10 border border-gray-100 dark:border-[#20BEFF]/20 border-t-0"
          >
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-5">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="mt-2 block w-full px-4 py-3 bg-white dark:bg-[#051C2C] border border-gray-200 dark:border-[#20BEFF]/20 rounded-xl text-sm placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white focus:border-[#20BEFF] focus:ring-2 focus:ring-[#20BEFF]/20 dark:focus:ring-[#20BEFF]/20 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="mt-2 block w-full px-4 py-3 bg-white dark:bg-[#051C2C] border border-gray-200 dark:border-[#20BEFF]/20 rounded-xl text-sm placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white focus:border-[#20BEFF] focus:ring-2 focus:ring-[#20BEFF]/20 dark:focus:ring-[#20BEFF]/20 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your password"
                  />
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-sm text-center bg-red-50 dark:bg-red-500/10 py-3 px-4 rounded-xl"
                >
                  {error}
                </motion.div>
              )}

              <div className="space-y-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="relative w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl text-sm font-medium text-white bg-gradient-to-r from-[#20BEFF] to-[#00A8F3] hover:from-[#00A8F3] hover:to-[#20BEFF] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#20BEFF] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#20BEFF]/20 hover:shadow-[#20BEFF]/30 transition-all duration-200 group"
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    <>
                      <span>Sign in</span>
                      <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                    </>
                  )}
                </motion.button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200 dark:border-[#20BEFF]/20" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 text-gray-500 dark:text-gray-400 bg-white/80 dark:bg-[#0F2D40]/80">
                      or
                    </span>
                  </div>
                </div>

                <div className="text-center text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Don't have an account? </span>
                  <Link
                    href="/register"
                    className="font-medium text-[#20BEFF] hover:text-[#00A8F3] transition-colors"
                  >
                    Create one
                  </Link>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
} 