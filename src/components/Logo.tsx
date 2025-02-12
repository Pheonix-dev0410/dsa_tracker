'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { CodeBracketSquareIcon } from '@heroicons/react/24/outline';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export default function Logo({ className = '', showText = true }: LogoProps) {
  return (
    <Link href="/" className={`flex items-center gap-2 ${className}`}>
      <motion.div
        initial={{ rotate: -90 }}
        animate={{ rotate: 0 }}
        transition={{ duration: 0.5, type: 'spring', stiffness: 200 }}
        className="relative"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#20BEFF] to-[#00A8F3] blur-lg opacity-50" />
        <CodeBracketSquareIcon className="w-8 h-8 text-[#20BEFF] relative" />
      </motion.div>
      {showText && (
        <motion.span
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#20BEFF] to-[#00A8F3]"
        >
          DSA Tracker
        </motion.span>
      )}
    </Link>
  );
} 