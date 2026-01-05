import React, { useMemo, useState } from 'react';
import { Goal, GoalProgress, GoalHistory } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ContributionHeatmapProps {
  goals: Goal[];
  progress: GoalProgress[];
  history: GoalHistory[];
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Mon', 'Wed', 'Fri'];

const ContributionHeatmap: React.FC<ContributionHeatmapProps> = ({ goals, progress, history }) => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const todayStr = today.toISOString().split('T')[0];

  const [viewMode, setViewMode] = useState<'yearly' | 'monthly'>('monthly');
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  const contributionData = useMemo(() => {
    // Create a map of date -> completed goal count
    const dateMap: Record<string, number> = {};

    // 1. Populate from History (Past completed daily goals)
    if (history && history.length > 0) {
      history.forEach(h => {
        // Only consider daily goals for the heatmap to avoid double counting or confusion with long-term goals
        if (h.period === 'daily') {
          dateMap[h.date] = h.completedCount;
        }
      });
    }

    // 2. Populate for Today (Current active daily goals)
    // We only do this if we don't already have a history record for today (which we shouldn't, as history is for past)
    if (!dateMap[todayStr]) {
      const completedToday = goals.filter(g => g.type === 'daily' && g.status === 'done').length;
      if (completedToday > 0) {
        dateMap[todayStr] = completedToday;
      }
    }

    return dateMap;
  }, [goals, history, todayStr]);


  const weeksData = useMemo(() => {
    const weeks: { date: Date; count: number }[][] = [];
    let startDate: Date;
    let endDate: Date;

    if (viewMode === 'yearly') {
      startDate = new Date(selectedYear, 0, 1);
      endDate = new Date(selectedYear, 11, 31);
    } else {
      startDate = new Date(selectedYear, selectedMonth, 1);
      endDate = new Date(selectedYear, selectedMonth + 1, 0);
    }

    // Find the first Sunday of the period
    const firstDay = startDate.getDay();
    const startOffset = firstDay === 0 ? 0 : -firstDay;
    const adjustedStart = new Date(startDate);
    adjustedStart.setDate(adjustedStart.getDate() + startOffset);

    let currentDate = new Date(adjustedStart);
    let currentWeek: { date: Date; count: number }[] = [];

    // Loop until we cover the end date AND complete the last week
    // or if purely monthly, we might stop at the last covered week
    while (true) {
      if (currentDate > endDate && currentWeek.length === 0) break;

      const dateStr = currentDate.toISOString().split('T')[0];

      let isValidDay = false;
      if (viewMode === 'yearly') {
        isValidDay = currentDate.getFullYear() === selectedYear;
      } else {
        isValidDay = currentDate.getMonth() === selectedMonth && currentDate.getFullYear() === selectedYear;
      }

      currentWeek.push({
        date: new Date(currentDate),
        count: isValidDay ? (contributionData[dateStr] || 0) : -1,
      });

      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Safety break loop is handled by logic, but `while(true)` is risky if dates don't advance. 
    // Logic ensures currentDate increments.
    // Ensure we don't go infinitely if something is weird.
    // (Implicitly trusted logic from previous working code)

    return weeks;
  }, [selectedYear, selectedMonth, viewMode, contributionData]);

  const totalContributions = useMemo(() => {
    return Object.entries(contributionData)
      .filter(([date]) => {
        const d = new Date(date);
        if (viewMode === 'yearly') {
          return d.getFullYear() === selectedYear;
        } else {
          return d.getFullYear() === selectedYear && d.getMonth() === selectedMonth;
        }
      })
      .reduce((sum, [_, count]) => sum + count, 0);
  }, [contributionData, selectedYear, selectedMonth, viewMode]);

  const handlePrevious = () => {
    if (viewMode === 'yearly') {
      setSelectedYear(prev => prev - 1);
    } else {
      if (selectedMonth === 0) {
        setSelectedMonth(11);
        setSelectedYear(prev => prev - 1);
      } else {
        setSelectedMonth(prev => prev - 1);
      }
    }
  };

  const handleNext = () => {
    if (viewMode === 'yearly') {
      setSelectedYear(prev => prev + 1);
    } else {
      if (selectedMonth === 11) {
        setSelectedMonth(0);
        setSelectedYear(prev => prev + 1);
      } else {
        setSelectedMonth(prev => prev + 1);
      }
    }
  };

  const isNextDisabled = () => {
    if (viewMode === 'yearly') {
      return selectedYear >= currentYear;
    }
    return selectedYear > currentYear || (selectedYear === currentYear && selectedMonth >= currentMonth);
  };

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
    if (viewMode === 'monthly') return [];

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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <span className="text-status-done font-semibold">{totalContributions} contributions</span>
            <span className="text-muted-foreground font-normal">
              in {viewMode === 'yearly' ? selectedYear : `${MONTHS[selectedMonth]} ${selectedYear}`}
            </span>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select
              value={viewMode}
              onValueChange={(v: 'yearly' | 'monthly') => setViewMode(v)}
            >
              <SelectTrigger className="w-[110px] h-8 text-xs">
                <SelectValue placeholder="View" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yearly">Yearly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center border rounded-md">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-r-none"
                onClick={handlePrevious}
                disabled={selectedYear <= currentYear - 5} // Arbitrary limit
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium w-24 text-center px-2">
                {viewMode === 'yearly' ? selectedYear : `${MONTHS[selectedMonth]} ${selectedYear}`}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-l-none"
                onClick={handleNext}
                disabled={isNextDisabled()}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
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
                                ? 'No activity'
                                : `${day.count} contribution${day.count > 1 ? 's' : ''}`}
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
