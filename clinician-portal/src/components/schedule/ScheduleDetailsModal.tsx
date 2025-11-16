import { useState } from 'react';
import clsx from 'clsx';
import { type ScheduleItem, type ScheduleType, type ScheduleStatus } from '../../api/endpoints';
import { formatDate, formatTime, getDayOfWeek } from '../../utils/date';

type ScheduleDetailsModalProps = {
  schedule: ScheduleItem;
  onClose: () => void;
  onApprove: () => void;
  onReject: (reason?: string) => void;
  onAccept: () => void;
  onComplete: () => void;
  onUpdate: (data: Partial<ScheduleItem>) => void;
  typeColors: Record<ScheduleType, string>;
  statusColors: Record<ScheduleStatus, { bg: string; text: string; border: string }>;
  isLoading: boolean;
};

export default function ScheduleDetailsModal({
  schedule,
  onClose,
  onApprove,
  onReject,
  onAccept,
  onComplete,
  onUpdate,
  typeColors,
  statusColors,
  isLoading,
}: ScheduleDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: schedule.title,
    description: schedule.description || '',
    date: schedule.date,
    startTime: schedule.startTime,
    endTime: schedule.endTime,
    location: schedule.location || '',
    room: schedule.room || '',
    notes: schedule.notes || '',
  });
  
  const handleSave = () => {
    onUpdate(editData);
    setIsEditing(false);
  };
  
  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-card-light dark:bg-card-dark rounded-xl shadow-soft-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-border-light dark:border-border-dark">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className={clsx(
                  'w-16 h-16 rounded-lg flex items-center justify-center',
                  typeColors[schedule.type] || 'bg-gray-500'
                )}
              >
                <span className="material-symbols-outlined text-white text-3xl">
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
              <div>
                <h2 className="text-2xl font-bold text-foreground-light dark:text-foreground-dark">
                  {isEditing ? 'Edit Schedule' : schedule.title}
                </h2>
                <div className="flex items-center gap-2 mt-2">
                  <span
                    className={clsx(
                      'px-3 py-1 rounded-lg text-sm font-medium border capitalize',
                      statusColors[schedule.status].bg,
                      statusColors[schedule.status].text,
                      statusColors[schedule.status].border
                    )}
                  >
                    {schedule.status}
                  </span>
                  <span className="px-3 py-1 rounded-lg text-sm font-medium bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark border border-border-light dark:border-border-dark capitalize">
                    {schedule.type}
                  </span>
                  {schedule.priority && schedule.priority !== 'low' && (
                    <span className={clsx(
                      'px-3 py-1 rounded-lg text-sm font-medium',
                      schedule.priority === 'urgent' && 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300',
                      schedule.priority === 'high' && 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300',
                      schedule.priority === 'medium' && 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300'
                    )}>
                      {schedule.priority} priority
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-background-light dark:hover:bg-background-dark"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          {isEditing ? (
            /* Edit Mode */
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={editData.title}
                  onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                  className="w-full h-12 px-4 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-2">
                  Description
                </label>
                <textarea
                  value={editData.description}
                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={editData.date}
                    onChange={(e) => setEditData({ ...editData, date: e.target.value })}
                    className="w-full h-12 px-4 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-2">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={editData.startTime}
                    onChange={(e) => setEditData({ ...editData, startTime: e.target.value })}
                    className="w-full h-12 px-4 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-2">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={editData.endTime}
                    onChange={(e) => setEditData({ ...editData, endTime: e.target.value })}
                    className="w-full h-12 px-4 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={editData.location}
                    onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                    className="w-full h-12 px-4 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-2">
                    Room
                  </label>
                  <input
                    type="text"
                    value={editData.room}
                    onChange={(e) => setEditData({ ...editData, room: e.target.value })}
                    className="w-full h-12 px-4 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-2">
                  Notes
                </label>
                <textarea
                  value={editData.notes}
                  onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>
              
              <div className="flex items-center justify-end gap-4 pt-4 border-t border-border-light dark:border-border-dark">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-6 h-12 border border-border-light dark:border-border-dark text-foreground-light dark:text-foreground-dark rounded-lg font-semibold hover:bg-background-light dark:hover:bg-background-dark transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="px-6 h-12 bg-primary text-white rounded-lg font-semibold shadow-soft hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save Changes
                </button>
              </div>
            </div>
          ) : (
            /* View Mode */
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-subtle-light dark:text-subtle-dark">Date & Time</label>
                  <p className="text-foreground-light dark:text-foreground-dark font-semibold mt-1">
                    {formatDate(schedule.date)} ({getDayOfWeek(schedule.date)})
                  </p>
                  <p className="text-subtle-light dark:text-subtle-dark">
                    {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                  </p>
                </div>
                
                {schedule.location && (
                  <div>
                    <label className="text-sm font-medium text-subtle-light dark:text-subtle-dark">Location</label>
                    <p className="text-foreground-light dark:text-foreground-dark font-semibold mt-1">
                      {schedule.location}
                    </p>
                    {schedule.room && (
                      <p className="text-subtle-light dark:text-subtle-dark">Room: {schedule.room}</p>
                    )}
                  </div>
                )}
                
                {schedule.assignedBy && (
                  <div>
                    <label className="text-sm font-medium text-subtle-light dark:text-subtle-dark">Assigned By</label>
                    <p className="text-foreground-light dark:text-foreground-dark font-semibold mt-1">
                      {schedule.assignedBy}
                    </p>
                  </div>
                )}
                
                {schedule.patientName && (
                  <div>
                    <label className="text-sm font-medium text-subtle-light dark:text-subtle-dark">Patient</label>
                    <p className="text-foreground-light dark:text-foreground-dark font-semibold mt-1">
                      {schedule.patientName}
                    </p>
                  </div>
                )}
              </div>
              
              {schedule.description && (
                <div>
                  <label className="text-sm font-medium text-subtle-light dark:text-subtle-dark">Description</label>
                  <p className="text-foreground-light dark:text-foreground-dark mt-1">
                    {schedule.description}
                  </p>
                </div>
              )}
              
              {schedule.notes && (
                <div>
                  <label className="text-sm font-medium text-subtle-light dark:text-subtle-dark">Notes</label>
                  <p className="text-foreground-light dark:text-foreground-dark mt-1">
                    {schedule.notes}
                  </p>
                </div>
              )}
              
              {/* Actions */}
              <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-border-light dark:border-border-dark">
                {schedule.status === 'pending' && schedule.requiresApproval && (
                  <>
                    <button
                      onClick={onApprove}
                      disabled={isLoading}
                      className="px-6 h-12 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined">check</span>
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        const reason = prompt('Reason for rejection (optional):');
                        onReject(reason || undefined);
                      }}
                      disabled={isLoading}
                      className="px-6 h-12 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined">close</span>
                      Reject
                    </button>
                  </>
                )}
                {schedule.status === 'approved' && (
                  <button
                    onClick={onAccept}
                    disabled={isLoading}
                    className="px-6 h-12 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined">check_circle</span>
                    Accept
                  </button>
                )}
                {(schedule.status === 'accepted' || schedule.status === 'approved') && schedule.status !== 'completed' && (
                  <button
                    onClick={onComplete}
                    disabled={isLoading}
                    className="px-6 h-12 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined">done</span>
                    Mark as Completed
                  </button>
                )}
                {schedule.status !== 'completed' && schedule.status !== 'cancelled' && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-6 h-12 border border-border-light dark:border-border-dark text-foreground-light dark:text-foreground-dark rounded-lg font-semibold hover:bg-background-light dark:hover:bg-background-dark transition-colors flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined">edit</span>
                    Edit
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

