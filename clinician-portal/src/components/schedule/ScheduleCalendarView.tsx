import { useMemo } from 'react';
import clsx from 'clsx';
import { type ScheduleItem, type ScheduleType, type ScheduleStatus } from '../../api/endpoints';
import { formatDate, getDayOfWeek, isToday } from '../../utils/date';

type ScheduleCalendarViewProps = {
  schedules: ScheduleItem[];
  view: 'week' | 'month' | 'previous-week' | 'previous-month';
  onScheduleClick: (schedule: ScheduleItem) => void;
  typeColors: Record<ScheduleType, string>;
  statusColors: Record<ScheduleStatus, { bg: string; text: string; border: string }>;
  isLoading: boolean;
};

export default function ScheduleCalendarView({
  schedules,
  view,
  onScheduleClick,
  typeColors,
  statusColors,
  isLoading,
}: ScheduleCalendarViewProps) {
  // Group schedules by date
  const schedulesByDate = useMemo(() => {
    const grouped: Record<string, ScheduleItem[]> = {};
    schedules.forEach(schedule => {
      if (!grouped[schedule.date]) {
        grouped[schedule.date] = [];
      }
      grouped[schedule.date].push(schedule);
    });
    return grouped;
  }, [schedules]);
  
  // Get dates for current view
  const getViewDates = () => {
    const today = new Date();
    const dates: Date[] = [];
    
    if (view === 'week' || view === 'previous-week') {
      const startDate = new Date(today);
      if (view === 'previous-week') {
        startDate.setDate(today.getDate() - 7);
      }
      startDate.setDate(startDate.getDate() - startDate.getDay()); // Start of week (Sunday)
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        dates.push(date);
      }
    } else {
      // Month view
      const month = view === 'previous-month' ? today.getMonth() - 1 : today.getMonth();
      const year = view === 'previous-month' && month === -1 ? today.getFullYear() - 1 : today.getFullYear();
      const actualMonth = month === -1 ? 11 : month;
      
      const firstDay = new Date(year, actualMonth, 1);
      const lastDay = new Date(year, actualMonth + 1, 0);
      const daysInMonth = lastDay.getDate();
      const startingDayOfWeek = firstDay.getDay();
      
      // Add empty cells for days before month starts
      for (let i = 0; i < startingDayOfWeek; i++) {
        dates.push(new Date(year, actualMonth, -i));
      }
      
      // Add all days in month
      for (let day = 1; day <= daysInMonth; day++) {
        dates.push(new Date(year, actualMonth, day));
      }
    }
    
    return dates;
  };
  
  const viewDates = getViewDates();
  const isMonthView = view === 'month' || view === 'previous-month';
  
  if (isLoading) {
    return (
      <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-soft border border-border-light dark:border-border-dark p-12">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-soft border border-border-light dark:border-border-dark">
      {isMonthView ? (
        /* Month View */
        <div className="p-6">
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day) => (
              <div key={day} className="text-center text-sm font-medium text-subtle-light dark:text-subtle-dark py-2">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {viewDates.map((date, index) => {
              const dateStr = date.toISOString().split('T')[0];
              const daySchedules = schedulesByDate[dateStr] || [];
              const isCurrentMonth = date.getMonth() === (view === 'previous-month' ? new Date().getMonth() - 1 : new Date().getMonth());
              const isTodayDate = isToday(dateStr);
              
              if (!isCurrentMonth && daySchedules.length === 0) {
                return <div key={index} className="aspect-square"></div>;
              }
              
              return (
                <div
                  key={index}
                  className={clsx(
                    'aspect-square border border-border-light dark:border-border-dark rounded-lg p-1 min-h-[100px]',
                    isTodayDate && 'ring-2 ring-primary',
                    !isCurrentMonth && 'opacity-40'
                  )}
                >
                  <div className={clsx(
                    'text-xs font-medium mb-1',
                    isTodayDate ? 'text-primary' : 'text-foreground-light dark:text-foreground-dark'
                  )}>
                    {date.getDate()}
                  </div>
                  <div className="space-y-0.5 overflow-y-auto max-h-[calc(100%-20px)]">
                    {daySchedules.slice(0, 3).map((schedule) => (
                      <button
                        key={schedule.id}
                        onClick={() => onScheduleClick(schedule)}
                        className={clsx(
                          'w-full px-1 py-0.5 rounded text-[10px] text-white truncate text-left',
                          typeColors[schedule.type] || 'bg-gray-500'
                        )}
                        title={`${schedule.title} - ${schedule.startTime}`}
                      >
                        {schedule.startTime} - {schedule.title}
                      </button>
                    ))}
                    {daySchedules.length > 3 && (
                      <p className="text-[10px] text-subtle-light dark:text-subtle-dark px-1">
                        +{daySchedules.length - 3} more
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Week View */
        <div className="p-6">
          <div className="grid grid-cols-7 gap-4">
            {viewDates.map((date, index) => {
              const dateStr = date.toISOString().split('T')[0];
              const daySchedules = schedulesByDate[dateStr] || [];
              const isTodayDate = isToday(dateStr);
              
              return (
                <div
                  key={index}
                  className={clsx(
                    'border border-border-light dark:border-border-dark rounded-lg p-3 min-h-[300px]',
                    isTodayDate && 'bg-primary/5 ring-2 ring-primary'
                  )}
                >
                  <div className={clsx(
                    'text-center mb-3 pb-2 border-b border-border-light dark:border-border-dark',
                    isTodayDate && 'bg-primary/10 rounded px-2'
                  )}>
                    <p className="text-xs text-subtle-light dark:text-subtle-dark">{getDayOfWeek(dateStr)}</p>
                    <p className={clsx(
                      'text-lg font-semibold',
                      isTodayDate ? 'text-primary' : 'text-foreground-light dark:text-foreground-dark'
                    )}>
                      {date.getDate()}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    {daySchedules.length === 0 ? (
                      <p className="text-xs text-subtle-light dark:text-subtle-dark text-center py-4">
                        No schedules
                      </p>
                    ) : (
                      daySchedules.map((schedule) => (
                        <button
                          key={schedule.id}
                          onClick={() => onScheduleClick(schedule)}
                          className={clsx(
                            'w-full p-2 rounded text-left text-xs text-white',
                            typeColors[schedule.type] || 'bg-gray-500'
                          )}
                        >
                          <div className="font-medium truncate">{schedule.title}</div>
                          <div className="text-white/80 text-[10px]">
                            {schedule.startTime} - {schedule.endTime}
                          </div>
                          {schedule.status === 'pending' && (
                            <div className="mt-1 text-[10px] bg-yellow-600 px-1 rounded">
                              Pending
                            </div>
                          )}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Legend */}
      <div className="p-6 border-t border-border-light dark:border-border-dark">
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-sm font-medium text-foreground-light dark:text-foreground-dark">Types:</span>
          {Object.entries(typeColors).slice(0, 6).map(([type, color]) => (
            <div key={type} className="flex items-center gap-2">
              <div className={clsx('w-4 h-4 rounded', color)}></div>
              <span className="text-xs text-subtle-light dark:text-subtle-dark capitalize">{type}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

