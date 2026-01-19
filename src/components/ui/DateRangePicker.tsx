import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from './Card';
import { Button } from './Button';

interface DateRange {
  startDate: Date;
  endDate: Date;
}

interface DateRangePickerProps {
  value: DateRange;
  onChange: (dateRange: DateRange) => void;
}

const QUICK_OPTIONS = [
  { label: '7 天', days: 7 },
  { label: '30 天', days: 30 },
  { label: '90 天', days: 90 },
  { label: '365 天', days: 365 },
];

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const [isCustom, setIsCustom] = useState(false);
  const [selectedQuickOption, setSelectedQuickOption] = useState(30);

  const formatDateForInput = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const formatDateForDisplay = (date: Date): string => {
    return date.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleQuickSelect = (days: number) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    setSelectedQuickOption(days);
    setIsCustom(false);
    onChange({ startDate, endDate });
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartDate = new Date(e.target.value + 'T00:00:00');

    // Validate: start date should not be after end date
    if (newStartDate <= value.endDate) {
      setIsCustom(true);
      onChange({ startDate: newStartDate, endDate: value.endDate });
    }
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEndDate = new Date(e.target.value + 'T23:59:59');

    // Validate: end date should not be before start date and not in future
    const today = new Date();
    if (newEndDate >= value.startDate && newEndDate <= today) {
      setIsCustom(true);
      onChange({ startDate: value.startDate, endDate: newEndDate });
    }
  };

  const getTodayDate = (): string => {
    return formatDateForInput(new Date());
  };

  return (
    <Card className="p-4" glowOnHover={false}>
      <motion.div
        className="space-y-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Quick Select Buttons */}
        <div>
          <label className="text-sm font-medium text-foreground-muted mb-2 block">
            快速選擇
          </label>
          <div className="flex flex-wrap gap-2">
            {QUICK_OPTIONS.map((option) => (
              <Button
                key={option.days}
                variant={selectedQuickOption === option.days && !isCustom ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => handleQuickSelect(option.days)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Custom Date Range */}
        <div>
          <label className="text-sm font-medium text-foreground-muted mb-2 block">
            自訂日期範圍
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-foreground-muted mb-1 block">開始日期</label>
              <input
                type="date"
                value={formatDateForInput(value.startDate)}
                onChange={handleStartDateChange}
                max={formatDateForInput(value.endDate)}
                className="
                  w-full px-3 py-2 rounded-lg
                  bg-bg-elevated border border-border
                  text-foreground text-sm
                  focus:outline-none focus:ring-2 focus:ring-accent/50
                  hover:border-border-hover
                  transition-colors
                "
              />
            </div>
            <div>
              <label className="text-xs text-foreground-muted mb-1 block">結束日期</label>
              <input
                type="date"
                value={formatDateForInput(value.endDate)}
                onChange={handleEndDateChange}
                min={formatDateForInput(value.startDate)}
                max={getTodayDate()}
                className="
                  w-full px-3 py-2 rounded-lg
                  bg-bg-elevated border border-border
                  text-foreground text-sm
                  focus:outline-none focus:ring-2 focus:ring-accent/50
                  hover:border-border-hover
                  transition-colors
                "
              />
            </div>
          </div>
        </div>

        {/* Selected Range Display */}
        <div className="pt-2 border-t border-border">
          <p className="text-sm text-foreground-muted">
            已選擇:{' '}
            <span className="text-foreground font-medium">
              {formatDateForDisplay(value.startDate)} - {formatDateForDisplay(value.endDate)}
            </span>
          </p>
          <p className="text-xs text-foreground-muted mt-1">
            共 {Math.ceil((value.endDate.getTime() - value.startDate.getTime()) / (1000 * 60 * 60 * 24))} 天
          </p>
        </div>
      </motion.div>
    </Card>
  );
}
