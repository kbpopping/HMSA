import { useState, useMemo } from 'react';
import clsx from 'clsx';
import { type Appointment } from '../../api/endpoints';
import { formatDate, getDayOfWeek } from '../../utils/date';

type CalendarViewProps = {
  appointments: Appointment[];
  onAppointmentClick: (appointment: Appointment) => void;
};

export default function CalendarView({ appointments, onAppointmentClick }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'week' | 'month'>('week');
  
  const currentMonth = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();
  
  // Group appointments by date
  const appointmentsByDate = useMemo(() => {
    const grouped: Record<string, Appointment[]> = {};
    appointments.forEach(apt => {
      const date = apt.appointment_date;
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(apt);
    });
    return grouped;
  }, [appointments]);
  
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };
  
  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };
  
  const getAppointmentsForDay = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return appointmentsByDate[dateStr] || [];
  };
  
  const statusColors: Record<string, string> = {
    scheduled: 'bg-blue-500',
    confirmed: 'bg-green-500',
    completed: 'bg-gray-500',
    cancelled: 'bg-yellow-500',
    'no-show': 'bg-red-500',
  };
  
  // Get week view dates
  const getWeekDates = () => {
    const today = new Date();
    const currentDay = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - currentDay);
    
    const weekDates: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      weekDates.push(date);
    }
    return weekDates;
  };
  
  const weekDates = getWeekDates();
  
  return (
    <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-soft border border-border-light dark:border-border-dark">
      {/* Header */}
      <div className="p-6 border-b border-border-light dark:border-border-dark">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-foreground-light dark:text-foreground-dark">
              Calendar View
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setView('week')}
                className={clsx(
                  'px-4 py-2 rounded-lg font-medium transition-colors',
                  view === 'week'
                    ? 'bg-primary text-white'
                    : 'bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark hover:bg-card-light dark:hover:bg-card-dark'
                )}
              >
                Week
              </button>
              <button
                onClick={() => setView('month')}
                className={clsx(
                  'px-4 py-2 rounded-lg font-medium transition-colors',
                  view === 'month'
                    ? 'bg-primary text-white'
                    : 'bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark hover:bg-card-light dark:hover:bg-card-dark'
                )}
              >
                Month
              </button>
            </div>
          </div>
          
          {view === 'month' && (
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-2 rounded-lg hover:bg-background-light dark:hover:bg-background-dark transition-colors"
              >
                <span className="material-symbols-outlined text-foreground-light dark:text-foreground-dark">chevron_left</span>
              </button>
              <h3 className="font-semibold text-foreground-light dark:text-foreground-dark min-w-[150px] text-center">
                {currentMonth}
              </h3>
              <button
                onClick={() => navigateMonth('next')}
                className="p-2 rounded-lg hover:bg-background-light dark:hover:bg-background-dark transition-colors"
              >
                <span className="material-symbols-outlined text-foreground-light dark:text-foreground-dark">chevron_right</span>
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Calendar Content */}
      <div className="p-6">
        {view === 'week' ? (
          /* Week View */
          <div className="space-y-4">
            <div className="grid grid-cols-7 gap-4">
              {weekDates.map((date, index) => {
                const dateStr = date.toISOString().split('T')[0];
                const dayAppointments = appointmentsByDate[dateStr] || [];
                const isTodayDate = date.toDateString() === new Date().toDateString();
                
                return (
                  <div key={index} className="border border-border-light dark:border-border-dark rounded-lg p-3 min-h-[200px]">
                    <div className={clsx(
                      'text-center mb-2 pb-2 border-b border-border-light dark:border-border-dark',
                      isTodayDate && 'bg-primary/10 rounded'
                    )}>
                      <p className="text-xs text-subtle-light dark:text-subtle-dark">{getDayOfWeek(dateStr)}</p>
                      <p className={clsx(
                        'text-lg font-semibold',
                        isTodayDate ? 'text-primary' : 'text-foreground-light dark:text-foreground-dark'
                      )}>
                        {date.getDate()}
                      </p>
                    </div>
                    <div className="space-y-1">
                      {dayAppointments.slice(0, 3).map((apt) => (
                        <button
                          key={apt.id}
                          onClick={() => onAppointmentClick(apt)}
                          className={clsx(
                            'w-full p-2 rounded text-left text-xs text-white truncate',
                            statusColors[apt.status] || 'bg-gray-500'
                          )}
                          title={`${apt.patient_name} - ${apt.appointment_time}`}
                        >
                          {apt.appointment_time} - {apt.patient_name}
                        </button>
                      ))}
                      {dayAppointments.length > 3 && (
                        <p className="text-xs text-subtle-light dark:text-subtle-dark text-center">
                          +{dayAppointments.length - 3} more
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Month View */
          <div className="bg-background-light dark:bg-background-dark rounded-lg p-4">
            {/* Calendar Days Header */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day) => (
                <div key={day} className="text-center text-sm font-medium text-subtle-light dark:text-subtle-dark py-2">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: startingDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square"></div>
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const dayAppointments = appointmentsByDate[dateStr] || [];
                
                return (
                  <div
                    key={day}
                    className={clsx(
                      'aspect-square border border-border-light dark:border-border-dark rounded-lg p-1',
                      isToday(day) && 'ring-2 ring-primary'
                    )}
                  >
                    <div className={clsx(
                      'text-xs font-medium mb-1',
                      isToday(day) ? 'text-primary' : 'text-foreground-light dark:text-foreground-dark'
                    )}>
                      {day}
                    </div>
                    <div className="space-y-0.5">
                      {dayAppointments.slice(0, 2).map((apt) => (
                        <button
                          key={apt.id}
                          onClick={() => onAppointmentClick(apt)}
                          className={clsx(
                            'w-full px-1 py-0.5 rounded text-[10px] text-white truncate',
                            statusColors[apt.status] || 'bg-gray-500'
                          )}
                          title={`${apt.patient_name} - ${apt.appointment_time}`}
                        >
                          {apt.appointment_time}
                        </button>
                      ))}
                      {dayAppointments.length > 2 && (
                        <p className="text-[10px] text-subtle-light dark:text-subtle-dark">
                          +{dayAppointments.length - 2}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      
      {/* Legend */}
      <div className="p-6 border-t border-border-light dark:border-border-dark">
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-sm font-medium text-foreground-light dark:text-foreground-dark">Legend:</span>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-500"></div>
            <span className="text-xs text-subtle-light dark:text-subtle-dark">Scheduled</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500"></div>
            <span className="text-xs text-subtle-light dark:text-subtle-dark">Confirmed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gray-500"></div>
            <span className="text-xs text-subtle-light dark:text-subtle-dark">Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-yellow-500"></div>
            <span className="text-xs text-subtle-light dark:text-subtle-dark">Cancelled</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-500"></div>
            <span className="text-xs text-subtle-light dark:text-subtle-dark">No Show</span>
          </div>
        </div>
      </div>
    </div>
  );
}

