import clsx from 'clsx';
import { type ScheduleItem, type ScheduleType, type ScheduleStatus } from '../../api/endpoints';
import { formatDate, formatTime, getDayOfWeek } from '../../utils/date';

type ScheduleListViewProps = {
  schedules: ScheduleItem[];
  onScheduleClick: (schedule: ScheduleItem) => void;
  onApprove: (scheduleId: string) => void;
  onReject: (scheduleId: string, reason?: string) => void;
  onAccept: (scheduleId: string) => void;
  onComplete: (scheduleId: string) => void;
  onUpdate: (scheduleId: string, data: Partial<ScheduleItem>) => void;
  typeColors: Record<ScheduleType, string>;
  statusColors: Record<ScheduleStatus, { bg: string; text: string; border: string }>;
  isLoading: boolean;
};

export default function ScheduleListView({
  schedules,
  onScheduleClick,
  onApprove,
  onReject,
  onAccept,
  onComplete,
  typeColors,
  statusColors,
  isLoading,
}: ScheduleListViewProps) {
  if (isLoading) {
    return (
      <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-soft border border-border-light dark:border-border-dark p-12">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }
  
  if (schedules.length === 0) {
    return (
      <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-soft border border-border-light dark:border-border-dark p-12">
        <div className="text-center">
          <span className="material-symbols-outlined text-5xl text-subtle-light dark:text-subtle-dark mb-4 block">
            event_busy
          </span>
          <p className="text-subtle-light dark:text-subtle-dark">No schedules found</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-soft border border-border-light dark:border-border-dark">
      <div className="p-6 space-y-3">
        {schedules.map((schedule) => (
          <div
            key={schedule.id}
            className="p-4 bg-background-light dark:bg-background-dark rounded-lg border border-border-light dark:border-border-dark hover:shadow-soft transition-shadow"
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Left: Schedule Info */}
              <div className="flex-1">
                <div className="flex items-start gap-4">
                  <div
                    className={clsx(
                      'w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0',
                      typeColors[schedule.type] || 'bg-gray-500'
                    )}
                  >
                    <span className="material-symbols-outlined text-white text-xl">
                      {schedule.type === 'surgery' ? 'medical_services' :
                       schedule.type === 'appointment' ? 'event' :
                       schedule.type === 'task' ? 'task' :
                       schedule.type === 'meeting' ? 'groups' :
                       schedule.type === 'training' ? 'school' :
                       schedule.type === 'consultation' ? 'stethoscope' :
                       schedule.type === 'on-call' ? 'phone_in_talk' :
                       schedule.type === 'break' ? 'coffee' :
                       'calendar_month'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <h3 className="font-semibold text-foreground-light dark:text-foreground-dark">
                        {schedule.title}
                      </h3>
                      <span
                        className={clsx(
                          'px-2 py-0.5 rounded text-xs font-medium border capitalize',
                          statusColors[schedule.status].bg,
                          statusColors[schedule.status].text,
                          statusColors[schedule.status].border
                        )}
                      >
                        {schedule.status}
                      </span>
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark border border-border-light dark:border-border-dark capitalize">
                        {schedule.type}
                      </span>
                      {schedule.priority && schedule.priority !== 'low' && (
                        <span className={clsx(
                          'px-2 py-0.5 rounded text-xs font-medium',
                          schedule.priority === 'urgent' && 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300',
                          schedule.priority === 'high' && 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300',
                          schedule.priority === 'medium' && 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300'
                        )}>
                          {schedule.priority} priority
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-subtle-light dark:text-subtle-dark">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>calendar_today</span>
                        {formatDate(schedule.date)} ({getDayOfWeek(schedule.date)})
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>schedule</span>
                        {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                      </span>
                      {schedule.location && (
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>location_on</span>
                          {schedule.location}
                        </span>
                      )}
                      {schedule.room && (
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>meeting_room</span>
                          {schedule.room}
                        </span>
                      )}
                      {schedule.assignedBy && (
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>person</span>
                          Assigned by {schedule.assignedBy}
                        </span>
                      )}
                    </div>
                    {schedule.description && (
                      <p className="text-sm text-subtle-light dark:text-subtle-dark mt-2">
                        {schedule.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Right: Actions */}
              <div className="flex items-center gap-2 flex-wrap">
                {schedule.status === 'pending' && schedule.requiresApproval && (
                  <>
                    <button
                      onClick={() => onApprove(String(schedule.id))}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>check</span>
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        const reason = prompt('Reason for rejection (optional):');
                        onReject(String(schedule.id), reason || undefined);
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 text-sm"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
                      Reject
                    </button>
                  </>
                )}
                {schedule.status === 'approved' && (
                  <button
                    onClick={() => onAccept(String(schedule.id))}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>check_circle</span>
                    Accept
                  </button>
                )}
                {(schedule.status === 'accepted' || schedule.status === 'approved') && schedule.status !== 'completed' && (
                  <button
                    onClick={() => onComplete(String(schedule.id))}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 text-sm"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>done</span>
                    Mark Done
                  </button>
                )}
                <button
                  onClick={() => onScheduleClick(schedule)}
                  className="p-2 rounded-lg border border-border-light dark:border-border-dark hover:bg-background-light dark:hover:bg-background-dark transition-colors"
                >
                  <span className="material-symbols-outlined text-foreground-light dark:text-foreground-dark">more_vert</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

