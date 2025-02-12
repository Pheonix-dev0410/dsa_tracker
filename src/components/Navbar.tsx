'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SunIcon, MoonIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useTheme } from './ThemeContext';
import Logo from './Logo';

export default function Navbar() {
  const { data: session } = useSession();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isDark, setIsDark } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const navLinks = [
    { href: '/', label: 'Dashboard' },
    { href: '/study-plans', label: 'Study Plans' },
    { href: '/analytics', label: 'Analytics' },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/90 dark:bg-[#051C2C]/90 backdrop-blur-xl shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Logo />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <div className="flex space-x-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-[#20BEFF] dark:hover:text-[#20BEFF] rounded-full hover:bg-[#20BEFF]/10 transition-all duration-200"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsDark(!isDark)}
              className="p-2 rounded-full hover:bg-[#20BEFF]/10 transition-all duration-200"
            >
              {isDark ? (
                <SunIcon className="h-5 w-5 text-[#20BEFF]" />
              ) : (
                <MoonIcon className="h-5 w-5 text-[#20BEFF]" />
              )}
            </motion.button>

            {session ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200 hidden lg:inline">
                  {session.user?.name || session.user?.email}
                </span>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => signOut()}
                  className="bg-[#20BEFF] hover:bg-[#00A8F3] text-white px-6 py-2 rounded-lg text-sm font-medium shadow-lg shadow-[#20BEFF]/20 hover:shadow-[#20BEFF]/30 transition-all duration-200"
                >
                  Sign Out
                </motion.button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-[#20BEFF] dark:hover:text-[#20BEFF] rounded-full hover:bg-[#20BEFF]/10 transition-all duration-200"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="bg-[#20BEFF] hover:bg-[#00A8F3] text-white px-6 py-2 rounded-lg text-sm font-medium shadow-lg shadow-[#20BEFF]/20 hover:shadow-[#20BEFF]/30 transition-all duration-200"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center space-x-4 md:hidden">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsDark(!isDark)}
              className="p-2 rounded-full hover:bg-[#20BEFF]/10 transition-all duration-200"
            >
              {isDark ? (
                <SunIcon className="h-5 w-5 text-[#20BEFF]" />
              ) : (
                <MoonIcon className="h-5 w-5 text-[#20BEFF]" />
              )}
            </motion.button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-full text-gray-700 dark:text-gray-200 hover:bg-[#20BEFF]/10 transition-all duration-200"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white/95 dark:bg-[#051C2C]/95 backdrop-blur-xl border-t border-gray-100 dark:border-[#20BEFF]/20 shadow-lg"
          >
            <div className="px-4 pt-2 pb-3 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block px-4 py-2 text-base font-medium text-gray-700 dark:text-gray-200 hover:text-[#20BEFF] dark:hover:text-[#20BEFF] hover:bg-[#20BEFF]/10 rounded-xl transition-all duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              {session ? (
                <>
                  <div className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                    {session.user?.name || session.user?.email}
                  </div>
                  <button
                    onClick={() => {
                      signOut();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-base font-medium text-[#20BEFF] hover:bg-[#20BEFF]/10 rounded-xl transition-all duration-200"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="block px-4 py-2 text-base font-medium text-gray-700 dark:text-gray-200 hover:text-[#20BEFF] dark:hover:text-[#20BEFF] hover:bg-[#20BEFF]/10 rounded-xl transition-all duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="block px-4 py-2 text-base font-medium text-white bg-[#20BEFF] hover:bg-[#00A8F3] rounded-xl shadow-lg shadow-[#20BEFF]/20 hover:shadow-[#20BEFF]/30 transition-all duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
} 