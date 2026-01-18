import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';

interface StatCardProps {
  title: string;
  value: number;
  icon: ReactNode;
  format?: (value: number) => string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  delay?: number;
}

export function StatCard({ title, value, icon, format, trend, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm text-foreground-muted">{title}</p>
            <div className="flex items-baseline gap-2">
              <AnimatedNumber
                value={value}
                format={format}
                className="text-3xl font-semibold text-foreground tracking-tight"
              />
              {trend && (
                <span
                  className={`text-sm font-medium ${
                    trend.isPositive ? 'text-success' : 'text-error'
                  }`}
                >
                  {trend.isPositive ? '+' : ''}
                  {trend.value}%
                </span>
              )}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-accent/10 text-accent">
            {icon}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
