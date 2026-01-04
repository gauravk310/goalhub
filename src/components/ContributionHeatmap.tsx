import React, { useMemo, useState } from 'react';
import { Goal } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ContributionHeatmapProps {
  goals: Goal[];
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Mon', 'Wed', 'Fri'];

const ContributionHeatmap: React.FC<ContributionHeatmapProps> = ({ goals }) => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const contributionData = useMemo(() => {
    // Create a map of date -> completed goals count
    const completedGoals = goals.filter(g => g.status === 'done');
    const dateMap: Record<string, number> = {};

    completedGoals.forEach(goal => {
      const date = new Date(goal.updatedAt).toISOString().split('T')[0];
      dateMap[date] = (dateMap[date] || 0) + 1;
    });

    return dateMap;
  }, [goals]);

  const weeksData = useMemo(() => {
    const weeks: { date: Date; count: number }[][] = [];
    const startDate = new Date(selectedYear, 0, 1);
    const endDate = new Date(selectedYear, 11, 31);

    // Find the first Sunday of the year or the last Sunday of previous year
    const firstDay = startDate.getDay();
    const startOffset = firstDay === 0 ? 0 : -firstDay;
    const adjustedStart = new Date(startDate);
    adjustedStart.setDate(adjustedStart.getDate() + startOffset);

    let currentDate = new Date(adjustedStart);
    let currentWeek: { date: Date; count: number }[] = [];

    while (currentDate <= endDate || currentWeek.length > 0) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const isInYear = currentDate.getFullYear() === selectedYear;

      currentWeek.push({
        date: new Date(currentDate),
        count: isInYear ? (contributionData[dateStr] || 0) : -1,
      });

      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }

      currentDate.setDate(currentDate.getDate() + 1);
      if (currentDate > endDate && currentWeek.length === 0) break;
    }

    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }

    return weeks;
  }, [selectedYear, contributionData]);

  const totalContributions = useMemo(() => {
    return Object.entries(contributionData)
      .filter(([date]) => date.startsWith(String(selectedYear)))
      .reduce((sum, [_, count]) => sum + count, 0);
  }, [contributionData, selectedYear]);

  const getContributionLevel = (count: number): string => {
    if (count < 0) return 'bg-transparent';
    if (count === 0) return 'bg-muted/50';
    if (count === 1) return 'bg-status-done/30';
    if (count === 2) return 'bg-status-done/50';
    if (count === 3) return 'bg-status-done/70';
    return 'bg-status-done';
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getMonthLabels = () => {
    const labels: { month: string; position: number }[] = [];
    let lastMonth = -1;

    weeksData.forEach((week, weekIndex) => {
      const firstDayOfWeek = week.find(d => d.count >= 0);
      if (firstDayOfWeek) {
        const month = firstDayOfWeek.date.getMonth();
        if (month !== lastMonth) {
          labels.push({ month: MONTHS[month], position: weekIndex });
          lastMonth = month;
        }
      }
    });

    return labels;
  };

  const monthLabels = getMonthLabels();

  return (
    <Card className="animate-slide-up">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <span className="text-status-done font-semibold">{totalContributions} completed goals</span>
            <span className="text-muted-foreground font-normal">in {selectedYear}</span>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setSelectedYear(prev => prev - 1)}
              disabled={selectedYear <= currentYear - 4}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium w-12 text-center">{selectedYear}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setSelectedYear(prev => prev + 1)}
              disabled={selectedYear >= currentYear}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="w-full">
          {/* Month labels */}
          <div className="flex mb-2">
            <div className="w-8 shrink-0" /> {/* Spacer for day labels */}
            <div className="flex flex-1 gap-1">
              {weeksData.map((_, index) => {
                const label = monthLabels.find(l => l.position === index);
                return (
                  <div key={index} className="flex-1 relative overflow-visible">
                    {label && (
                      <span className="absolute text-xs text-muted-foreground font-medium -left-2">
                        {label.month}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex">
            {/* Day labels */}
            <div className="flex flex-col justify-around pr-2 text-xs text-muted-foreground w-8 shrink-0 h-[100px]">
              {DAYS.map(day => (
                <span key={day}>{day}</span>
              ))}
            </div>

            {/* Contribution grid */}
            <TooltipProvider>
              <div className="flex flex-1 gap-1 h-[100px]">
                {weeksData.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col flex-1 gap-1">
                    {week.map((day, dayIndex) => (
                      <Tooltip key={dayIndex}>
                        <TooltipTrigger asChild>
                          <div
                            className={`w-full flex-1 rounded-[2px] transition-colors ${getContributionLevel(day.count)} ${day.count >= 0 ? 'hover:brightness-90 cursor-pointer' : ''}`}
                          />
                        </TooltipTrigger>
                        {day.count >= 0 && (
                          <TooltipContent>
                            <p className="font-medium">
                              {day.count === 0
                                ? 'No goals completed'
                                : `${day.count} goal${day.count > 1 ? 's' : ''} completed`}
                            </p>
                            <p className="text-muted-foreground text-xs">
                              {formatDate(day.date)}
                            </p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    ))}
                  </div>
                ))}
              </div>
            </TooltipProvider>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-end gap-2 mt-4 text-xs text-muted-foreground">
            <span>Less</span>
            <div className="flex gap-1">
              <div className="w-4 h-3 rounded-[2px] bg-muted/50" />
              <div className="w-4 h-3 rounded-[2px] bg-status-done/30" />
              <div className="w-4 h-3 rounded-[2px] bg-status-done/50" />
              <div className="w-4 h-3 rounded-[2px] bg-status-done/70" />
              <div className="w-4 h-3 rounded-[2px] bg-status-done" />
            </div>
            <span>More</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContributionHeatmap;
