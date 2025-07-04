'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';

interface DateRange {
  from: Date;
  to: Date;
}

interface DatePickerWithRangeProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  className?: string;
}

export function DatePickerWithRange({ value, onChange, className }: DatePickerWithRangeProps) {
  const [isOpen, setIsOpen] = useState(false);

  const formatDateRange = (range: DateRange) => {
    const from = range.from.toLocaleDateString();
    const to = range.to.toLocaleDateString();
    return `${from} - ${to}`;
  };

  const presets = [
    {
      label: 'Last 7 days',
      value: {
        from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        to: new Date()
      }
    },
    {
      label: 'Last 30 days',
      value: {
        from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        to: new Date()
      }
    },
    {
      label: 'Last 90 days',
      value: {
        from: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        to: new Date()
      }
    }
  ];

  return (
    <div className={`relative ${className}`}>
      <Button
        variant="outline"
        className="gap-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Calendar className="h-4 w-4" />
        {formatDateRange(value)}
      </Button>
      
      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-2 w-64 rounded-md border bg-popover p-4 shadow-md">
          <div className="space-y-2">
            <div className="text-sm font-medium">Select date range:</div>
            {presets.map((preset) => (
              <Button
                key={preset.label}
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  onChange(preset.value);
                  setIsOpen(false);
                }}
              >
                {preset.label}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}