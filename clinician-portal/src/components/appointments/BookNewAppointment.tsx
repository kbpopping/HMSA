import { useState, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import clsx from 'clsx';
import { useAuth } from '../../store/auth';
import { ClinicianAPI, type Patient } from '../../api/endpoints';
import { formatDate } from '../../utils/date';

type BookNewAppointmentProps = {
  patients: Patient[];
  onClose: () => void;
  onSuccess: () => void;
};

export default function BookNewAppointment({ patients, onClose, onSuccess }: BookNewAppointmentProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [service, setService] = useState('');
  const [room, setRoom] = useState('');
  
  // Filter patients based on search
  const filteredPatients = useMemo(() => {
    if (!searchQuery) return patients.slice(0, 10);
    const query = searchQuery.toLowerCase();
    return patients.filter(p =>
      p.first_name.toLowerCase().includes(query) ||
      p.last_name.toLowerCase().includes(query) ||
      p.mrn.toLowerCase().includes(query) ||
      p.email?.toLowerCase().includes(query) ||
      p.phone?.toLowerCase().includes(query)
    ).slice(0, 10);
  }, [patients, searchQuery]);
  
  // Generate available time slots (9 AM to 5 PM, 30-minute intervals)
  const availableSlots = useMemo(() => {
    const slots: string[] = [];
    for (let hour = 9; hour < 17; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    return slots;
  }, []);
  
  // Format time for display
  const formatTimeDisplay = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };
  
  // Create appointment mutation
  const createMutation = useMutation({
    mutationFn: async (data: {
      patient_id: number;
      appointment_date: string;
      appointment_time: string;
      reason?: string;
      room?: string;
    }) => {
      return ClinicianAPI.createAppointment(user!.hospital_id, data);
    },
    onSuccess: () => {
      toast.success('Appointment booked successfully!');
      queryClient.invalidateQueries({ queryKey: ['appointments', user?.hospital_id, user?.id] });
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to book appointment');
    },
  });
  
  const handleConfirmBooking = () => {
    if (!selectedPatient || !selectedTime || !service) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    const appointmentDate = selectedDate.toISOString().split('T')[0];
    const [hours, minutes] = selectedTime.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    const formattedTime = `${displayHour}:${minutes} ${ampm}`;
    
    createMutation.mutate({
      patient_id: selectedPatient.id,
      appointment_date: appointmentDate,
      appointment_time: formattedTime,
      reason: service,
    });
  };
  
  // Calendar navigation
  const currentMonth = selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const firstDayOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
  const lastDayOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();
  
  const navigateMonth = (direction: 'prev' | 'next') => {
    setSelectedDate(prev => {
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
      selectedDate.getMonth() === today.getMonth() &&
      selectedDate.getFullYear() === today.getFullYear()
    );
  };
  
  const isSelected = (day: number) => {
    return day === selectedDate.getDate();
  };
  
  const handleDateClick = (day: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(day);
    setSelectedDate(newDate);
  };
  
  return (
    <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-soft border border-border-light dark:border-border-dark">
      {/* Header */}
      <div className="p-6 border-b border-border-light dark:border-border-dark">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground-light dark:text-foreground-dark">
              Book New Appointment
            </h2>
            <p className="text-sm text-subtle-light dark:text-subtle-dark mt-1">
              Step {step} of 3
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-background-light dark:hover:bg-background-dark transition-colors"
          >
            <span className="material-symbols-outlined text-foreground-light dark:text-foreground-dark">close</span>
          </button>
        </div>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Patient Search & Details */}
          <div className="space-y-6">
            {/* Patient Search */}
            <div>
              <h3 className="text-lg font-semibold text-foreground-light dark:text-foreground-dark mb-4">
                Patient Search
              </h3>
              <div className="relative mb-4">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-subtle-light dark:text-subtle-dark">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Search by MRN, Name, Email, or Phone"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-12 pl-10 pr-4 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark placeholder-subtle-light dark:placeholder-subtle-dark focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <button className="w-full h-12 bg-primary/10 text-primary rounded-lg font-medium hover:bg-primary/20 transition-colors flex items-center justify-center gap-2">
                <span className="material-symbols-outlined">add</span>
                Add New Patient
              </button>
              
              {/* Patient Results */}
              {searchQuery && filteredPatients.length > 0 && (
                <div className="mt-4 space-y-2 max-h-60 overflow-y-auto">
                  {filteredPatients.map((patient) => (
                    <button
                      key={patient.id}
                      onClick={() => {
                        setSelectedPatient(patient);
                        setSearchQuery('');
                        setStep(2);
                      }}
                      className={clsx(
                        'w-full p-3 rounded-lg border text-left transition-colors',
                        selectedPatient?.id === patient.id
                          ? 'bg-primary/10 border-primary'
                          : 'bg-background-light dark:bg-background-dark border-border-light dark:border-border-dark hover:bg-card-light dark:hover:bg-card-dark'
                      )}
                    >
                      <p className="font-medium text-foreground-light dark:text-foreground-dark">
                        {patient.first_name} {patient.last_name}
                      </p>
                      <p className="text-sm text-subtle-light dark:text-subtle-dark">
                        MRN: {patient.mrn} {patient.email && `• ${patient.email}`}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Appointment Details */}
            {selectedPatient && (
              <div>
                <h3 className="text-lg font-semibold text-foreground-light dark:text-foreground-dark mb-4">
                  Appointment Details
                </h3>
                <div className="space-y-4">
                  {/* Service / Reason */}
                  <div>
                    <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-2">
                      Service / Reason for Visit
                    </label>
                    <select
                      value={service}
                      onChange={(e) => setService(e.target.value)}
                      className="w-full h-12 px-4 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Select Service</option>
                      <option value="Annual Physical">Annual Physical</option>
                      <option value="Follow-up Consultation">Follow-up Consultation</option>
                      <option value="Cardiac Evaluation">Cardiac Evaluation</option>
                      <option value="General Checkup">General Checkup</option>
                      <option value="Emergency Visit">Emergency Visit</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  
                  {/* Assigned Clinician */}
                  <div>
                    <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-2">
                      Assigned Clinician
                    </label>
                    <div className="w-full h-12 px-4 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark flex items-center">
                      <span className="text-foreground-light dark:text-foreground-dark">
                        {user?.name} (You)
                      </span>
                    </div>
                  </div>
                  
                  {/* Room / Resource */}
                  <div>
                    <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-2">
                      Room / Resource (Optional)
                    </label>
                    <select
                      value={room}
                      onChange={(e) => setRoom(e.target.value)}
                      className="w-full h-12 px-4 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Select Room</option>
                      <option value="Room 201">Room 201</option>
                      <option value="Room 202">Room 202</option>
                      <option value="Room 301">Room 301</option>
                      <option value="Room 302">Room 302</option>
                      <option value="Consultation Room A">Consultation Room A</option>
                      <option value="Consultation Room B">Consultation Room B</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Right Column: Calendar & Available Slots */}
          <div className="space-y-6">
            {/* Calendar */}
            <div>
              <h3 className="text-lg font-semibold text-foreground-light dark:text-foreground-dark mb-4">
                Select Date
              </h3>
              <div className="bg-background-light dark:bg-background-dark rounded-lg p-4">
                {/* Calendar Header */}
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => navigateMonth('prev')}
                    className="p-2 rounded-lg hover:bg-card-light dark:hover:bg-card-dark transition-colors"
                  >
                    <span className="material-symbols-outlined text-foreground-light dark:text-foreground-dark">chevron_left</span>
                  </button>
                  <h4 className="font-semibold text-foreground-light dark:text-foreground-dark">
                    {currentMonth}
                  </h4>
                  <button
                    onClick={() => navigateMonth('next')}
                    className="p-2 rounded-lg hover:bg-card-light dark:hover:bg-card-dark transition-colors"
                  >
                    <span className="material-symbols-outlined text-foreground-light dark:text-foreground-dark">chevron_right</span>
                  </button>
                </div>
                
                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day) => (
                    <div key={day} className="text-center text-sm font-medium text-subtle-light dark:text-subtle-dark py-2">
                      {day}
                    </div>
                  ))}
                </div>
                
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: startingDayOfWeek }).map((_, i) => (
                    <div key={`empty-${i}`} className="aspect-square"></div>
                  ))}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    return (
                      <button
                        key={day}
                        onClick={() => handleDateClick(day)}
                        className={clsx(
                          'aspect-square rounded-lg transition-colors text-sm font-medium',
                          isSelected(day)
                            ? 'bg-primary text-white'
                            : isToday(day)
                            ? 'bg-primary/20 text-primary'
                            : 'hover:bg-card-light dark:hover:bg-card-dark text-foreground-light dark:text-foreground-dark'
                        )}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            
            {/* Available Slots */}
            {selectedDate && (
              <div>
                <h3 className="text-lg font-semibold text-foreground-light dark:text-foreground-dark mb-4">
                  Available Slots for {formatDate(selectedDate.toISOString())}
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot}
                      onClick={() => {
                        setSelectedTime(slot);
                        setStep(3);
                      }}
                      className={clsx(
                        'h-12 rounded-lg border font-medium transition-colors',
                        selectedTime === slot
                          ? 'bg-primary text-white border-primary'
                          : 'bg-background-light dark:bg-background-dark border-border-light dark:border-border-dark text-foreground-light dark:text-foreground-dark hover:bg-card-light dark:hover:bg-card-dark'
                      )}
                    >
                      {formatTimeDisplay(slot)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Booking Summary */}
        {selectedPatient && selectedTime && service && (
          <div className="mt-6 p-6 bg-background-light dark:bg-background-dark rounded-lg border border-border-light dark:border-border-dark">
            <h3 className="text-lg font-semibold text-foreground-light dark:text-foreground-dark mb-4">
              Booking Summary
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-subtle-light dark:text-subtle-dark">Patient:</span>
                <span className="font-medium text-foreground-light dark:text-foreground-dark">
                  {selectedPatient.first_name} {selectedPatient.last_name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-subtle-light dark:text-subtle-dark">Service:</span>
                <span className="font-medium text-foreground-light dark:text-foreground-dark">{service}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-subtle-light dark:text-subtle-dark">Clinician:</span>
                <span className="font-medium text-foreground-light dark:text-foreground-dark">{user?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-subtle-light dark:text-subtle-dark">Date & Time:</span>
                <span className="font-medium text-foreground-light dark:text-foreground-dark">
                  {formatDate(selectedDate.toISOString())}, {formatTimeDisplay(selectedTime)}
                </span>
              </div>
              {room && (
                <div className="flex justify-between">
                  <span className="text-subtle-light dark:text-subtle-dark">Room:</span>
                  <span className="font-medium text-foreground-light dark:text-foreground-dark">{room}</span>
                </div>
              )}
            </div>
            
            <button
              onClick={handleConfirmBooking}
              disabled={createMutation.isPending}
              className="w-full mt-6 h-12 bg-primary text-white rounded-lg font-semibold shadow-soft hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {createMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Booking...</span>
                </>
              ) : (
                <>
                  <span>Confirm Booking</span>
                  <span className="material-symbols-outlined">arrow_forward</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

