import { motion } from 'framer-motion';

interface SkeletonProps {
  className?: string;
}

export default function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <motion.div
      className={`bg-gray-200 dark:bg-[#20BEFF]/10 rounded-lg animate-pulse ${className}`}
      initial={{ opacity: 0.6 }}
      animate={{ opacity: 1 }}
      transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
    />
  );
}

export function StatCardSkeleton() {
  return (
    <div className="bg-white/90 dark:bg-[#0F2D40]/90 backdrop-blur-xl p-8 rounded-xl shadow-xl shadow-[#20BEFF]/10 border border-gray-100 dark:border-[#20BEFF]/20">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-6 w-6 rounded-full" />
      </div>
      <Skeleton className="h-10 w-40" />
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="bg-white/90 dark:bg-[#0F2D40]/90 backdrop-blur-xl p-8 rounded-xl shadow-xl shadow-[#20BEFF]/10 border border-gray-100 dark:border-[#20BEFF]/20">
      <Skeleton className="h-8 w-48 mb-6" />
      <Skeleton className="h-[300px] w-full rounded-lg" />
    </div>
  );
}

export function TopicProgressSkeleton() {
  return (
    <div className="bg-white/90 dark:bg-[#0F2D40]/90 backdrop-blur-xl p-8 rounded-xl shadow-xl shadow-[#20BEFF]/10 border border-gray-100 dark:border-[#20BEFF]/20">
      <Skeleton className="h-8 w-48 mb-6" />
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i}>
            <div className="flex justify-between mb-2">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-16" />
            </div>
            <Skeleton className="h-3 w-full rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
} 