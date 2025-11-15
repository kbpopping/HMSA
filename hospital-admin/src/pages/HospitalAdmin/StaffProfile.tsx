import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import clsx from 'clsx';
import AppShell from '../../components/layout/AppShell';
import { HospitalAPI, Clinician, StaffEmploymentFinancial, StaffMedicalInfo, StaffPatientsReports, StaffReports, StaffDocumentsData, StaffDocument, StaffUpdateData, StaffUpdateDraft } from '../../api/endpoints';
import { useAuth } from '../../store/auth';
import TextField from '../../components/forms/TextField';
import PhoneField from '../../components/forms/PhoneField';
import DateTimePicker from '../../components/forms/DateTimePicker';
import Select from '../../components/forms/Select';
import Spinner from '../../components/feedback/Spinner';
import EmptyState from '../../components/feedback/EmptyState';
import Modal from '../../components/modals/Modal';

type TabType = 'overview' | 'employment' | 'medical' | 'patients' | 'documents';

/**
 * Employment/Financial Tab Component
 */
const EmploymentFinancialTab = ({ hospitalId, staffId }: { hospitalId: string; staffId: string }) => {
  const { data: employmentData, isLoading, error } = useQuery<StaffEmploymentFinancial>({
    queryKey: ['hospital', 'staff', 'employment-financial', hospitalId, staffId],
    queryFn: () => HospitalAPI.getStaffEmploymentFinancial(hospitalId, staffId),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !employmentData) {
    return (
      <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-red-700 dark:text-red-300">
          Error loading employment and financial information. Please try refreshing the page.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Bank Account Information Card */}
      <div className="bg-card-light dark:bg-card-dark p-6 rounded-xl shadow-soft">
        <h3 className="text-xl font-semibold mb-6 text-foreground-light dark:text-foreground-dark">
          Bank Account Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="text-sm font-medium text-primary mb-1">
              Bank Name
            </h4>
            <p className="font-semibold text-foreground-light dark:text-foreground-dark text-lg">
              {employmentData.bankAccount.bankName}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-primary mb-1">
              Account Number
            </h4>
            <p className="font-semibold text-foreground-light dark:text-foreground-dark text-lg">
              {employmentData.bankAccount.accountNumber}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-primary mb-1">
              Routing Number
            </h4>
            <p className="font-semibold text-foreground-light dark:text-foreground-dark text-lg">
              {employmentData.bankAccount.routingNumber}
            </p>
          </div>
        </div>
      </div>

      {/* Current Salary & Benefits Card */}
      <div className="bg-card-light dark:bg-card-dark p-6 rounded-xl shadow-soft">
        <h3 className="text-xl font-semibold mb-6 text-foreground-light dark:text-foreground-dark">
          Current Salary & Benefits
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-primary mb-1">
              Base Salary
            </h4>
            <p className="font-semibold text-foreground-light dark:text-foreground-dark text-lg">
              {employmentData.salaryAndBenefits.baseSalary || 'Not set'}
            </p>
          </div>
          {employmentData.salaryAndBenefits.netSalary && (
            <div>
              <h4 className="text-sm font-medium text-primary mb-1">
                Net Salary (After Deductions)
              </h4>
              <p className="font-semibold text-primary text-lg">
                {employmentData.salaryAndBenefits.netSalary}
              </p>
            </div>
          )}
          {employmentData.salaryAndBenefits.taxDeductions && (
            <div>
              <h4 className="text-sm font-medium text-primary mb-1">
                Tax Deductions
              </h4>
              <p className="font-semibold text-foreground-light dark:text-foreground-dark text-lg">
                {employmentData.salaryAndBenefits.taxDeductions}
              </p>
            </div>
          )}
          <div>
            <h4 className="text-sm font-medium text-primary mb-1">
              Healthcare Benefits
            </h4>
            <p className="font-semibold text-foreground-light dark:text-foreground-dark text-lg">
              {employmentData.salaryAndBenefits.healthcareBenefits || 'Not set'}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-primary mb-1">
              Bonus Structure
            </h4>
            <p className="font-semibold text-foreground-light dark:text-foreground-dark text-lg">
              {employmentData.salaryAndBenefits.bonusStructure || 'Not set'}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-primary mb-1">
              Retirement Plan
            </h4>
            <p className="font-semibold text-foreground-light dark:text-foreground-dark text-lg">
              {employmentData.salaryAndBenefits.retirementPlan || 'Not set'}
            </p>
          </div>
        </div>
      </div>

      {/* Recent Promotions Card */}
      <div className="bg-card-light dark:bg-card-dark p-6 rounded-xl shadow-soft">
        <h3 className="text-xl font-semibold mb-6 text-foreground-light dark:text-foreground-dark">
          Recent Promotions
        </h3>
        {employmentData.promotions && employmentData.promotions.length > 0 ? (
          <div className="space-y-4">
            {employmentData.promotions.map((promotion, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-xl">
                    arrow_upward
                  </span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground-light dark:text-foreground-dark text-lg">
                    {promotion.title}
                  </p>
                  <p className="text-sm text-subtle-light dark:text-subtle-dark">
                    {promotion.date}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-subtle-light dark:text-subtle-dark">
            No promotions recorded.
          </p>
        )}
      </div>
    </div>
  );
};

/**
 * Medical Info Tab Component with Password Protection
 */
const MedicalInfoTab = ({ hospitalId, staffId }: { hospitalId: string; staffId: string }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const sessionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const SESSION_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds
  const passwordInputRef = useRef<HTMLInputElement>(null);

  // Handle session expiration
  const handleSessionExpire = useCallback(() => {
    setIsAuthenticated(false);
    setShowPasswordModal(true);
    setSessionStartTime(null);
    sessionStorage.removeItem(`medical_info_session_${staffId}`);
    sessionStorage.removeItem(`medical_info_session_time_${staffId}`);
    toast.info('Session expired. Please enter your password again.');
  }, [staffId]);

  // Check if session is still valid on mount
  useEffect(() => {
    const sessionToken = sessionStorage.getItem(`medical_info_session_${staffId}`);
    const sessionTime = sessionStorage.getItem(`medical_info_session_time_${staffId}`);
    
    if (sessionToken && sessionTime) {
      const sessionStart = parseInt(sessionTime, 10);
      const now = Date.now();
      const timeElapsed = now - sessionStart;
      
      // If session is still valid (less than 10 minutes), restore authentication
      if (timeElapsed < SESSION_DURATION) {
        setIsAuthenticated(true);
        setSessionStartTime(sessionStart);
        // Set timeout for remaining time
        const remainingTime = SESSION_DURATION - timeElapsed;
        sessionTimeoutRef.current = setTimeout(() => {
          handleSessionExpire();
        }, remainingTime);
      } else {
        // Session expired, clear storage
        sessionStorage.removeItem(`medical_info_session_${staffId}`);
        sessionStorage.removeItem(`medical_info_session_time_${staffId}`);
        setShowPasswordModal(true);
      }
    } else {
      // No session found, show password modal
      setShowPasswordModal(true);
    }
  }, [staffId, SESSION_DURATION, handleSessionExpire]);

  // Set up session timeout
  useEffect(() => {
    if (!isAuthenticated || !sessionStartTime) return;

    // Clear any existing timeout
    if (sessionTimeoutRef.current) {
      clearTimeout(sessionTimeoutRef.current);
    }

    // Set new timeout for 10 minutes from session start
    sessionTimeoutRef.current = setTimeout(() => {
      handleSessionExpire();
    }, SESSION_DURATION);

    return () => {
      if (sessionTimeoutRef.current) {
        clearTimeout(sessionTimeoutRef.current);
      }
    };
  }, [isAuthenticated, sessionStartTime, SESSION_DURATION, handleSessionExpire]);

  // Handle modal close (click outside or close button)
  const handleCloseModal = useCallback(() => {
    setShowPasswordModal(false);
    setPassword('');
    setShowPassword(false);
  }, []);

  // Focus password input when modal opens
  useEffect(() => {
    if (showPasswordModal && passwordInputRef.current) {
      setTimeout(() => {
        passwordInputRef.current?.focus();
      }, 100);
    }
  }, [showPasswordModal]);

  // Verify password mutation
  const verifyPasswordMutation = useMutation({
    mutationFn: (pwd: string) => HospitalAPI.verifyMedicalInfoPassword(hospitalId, pwd),
    onSuccess: (data) => {
      const now = Date.now();
      setIsAuthenticated(true);
      setShowPasswordModal(false);
      setPassword('');
      setShowPassword(false);
      setSessionStartTime(now);
      
      // Store session in sessionStorage
      sessionStorage.setItem(`medical_info_session_${staffId}`, data.token);
      sessionStorage.setItem(`medical_info_session_time_${staffId}`, now.toString());
      
      toast.success('Access granted');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Invalid password. Please try again.');
      setPassword('');
    },
  });

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      toast.error('Please enter your password');
      return;
    }
    setIsVerifying(true);
    verifyPasswordMutation.mutate(password);
    setTimeout(() => setIsVerifying(false), 500);
  };

  // Fetch medical info only if authenticated
  const { data: medicalData, isLoading, error } = useQuery<StaffMedicalInfo>({
    queryKey: ['hospital', 'staff', 'medical-info', hospitalId, staffId],
    queryFn: () => HospitalAPI.getStaffMedicalInfo(hospitalId, staffId),
    enabled: isAuthenticated,
  });

  // Password Modal
  if (showPasswordModal) {
    return (
      <Modal
        isOpen={showPasswordModal}
        onClose={handleCloseModal}
        title="Medical Information Access"
        size="md"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <span className="material-symbols-outlined text-yellow-600 dark:text-yellow-400">lock</span>
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              This information is confidential and protected under HIPAA. Please enter your password to access medical records.
            </p>
          </div>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="w-full">
              <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-2">
                Password
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <input
                  ref={passwordInputRef}
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full h-12 rounded-lg border px-4 pr-12 text-foreground-light dark:text-foreground-dark placeholder-subtle-light dark:placeholder-subtle-dark bg-background-light dark:bg-background-dark focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors border-border-light dark:border-border-dark"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-subtle-light dark:text-subtle-dark hover:text-foreground-light dark:hover:text-foreground-dark transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <span className="material-symbols-outlined text-xl">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-4 py-2 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isVerifying || verifyPasswordMutation.isPending}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isVerifying || verifyPasswordMutation.isPending ? 'Verifying...' : 'Verify & Access'}
              </button>
            </div>
          </form>
        </div>
      </Modal>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !medicalData) {
    return (
      <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-red-700 dark:text-red-300">
          Error loading medical information. Please try refreshing the page.
        </p>
      </div>
    );
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Cleared':
      case 'Pass':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'Negative':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-8">
      {/* Occupational Health & Medical Information Card */}
      <div className="bg-card-light dark:bg-card-dark p-6 rounded-xl shadow-soft">
        <div className="flex items-start justify-between mb-6">
          <h3 className="text-xl font-semibold text-foreground-light dark:text-foreground-dark">
            Occupational Health & Medical Information
          </h3>
          <div className="flex items-center gap-2 text-sm text-subtle-light dark:text-subtle-dark">
            <span className="material-symbols-outlined text-base">lock</span>
            <span>Confidential</span>
          </div>
        </div>

        {/* Two-column layout for first section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Medical Conditions & Allergies Card */}
            <div className="bg-background-light dark:bg-background-dark p-4 rounded-lg border border-border-light dark:border-border-dark">
              <h4 className="text-base font-semibold text-foreground-light dark:text-foreground-dark mb-4">
                Medical Conditions & Allergies
              </h4>
              <div className="space-y-4">
                <div>
                  <h5 className="text-sm font-medium text-primary mb-1">
                    Conditions:
                  </h5>
                  <p className="font-semibold text-foreground-light dark:text-foreground-dark text-lg">
                    {medicalData.conditions}
                  </p>
                </div>
                <div>
                  <h5 className="text-sm font-medium text-primary mb-1">
                    Allergies:
                  </h5>
                  <p className="font-semibold text-foreground-light dark:text-foreground-dark text-lg">
                    {medicalData.allergies}
                  </p>
                </div>
              </div>
            </div>

            {/* Emergency Contact Card */}
            <div className="bg-background-light dark:bg-background-dark p-4 rounded-lg border border-border-light dark:border-border-dark">
              <h4 className="text-base font-semibold text-foreground-light dark:text-foreground-dark mb-4">
                Emergency Contact
              </h4>
              <div className="space-y-4">
                <div>
                  <h5 className="text-sm font-medium text-primary mb-1">
                    Name:
                  </h5>
                  <p className="font-semibold text-foreground-light dark:text-foreground-dark text-lg">
                    {medicalData.emergencyContact.name}
                  </p>
                </div>
                <div>
                  <h5 className="text-sm font-medium text-primary mb-1">
                    Relationship:
                  </h5>
                  <p className="font-semibold text-foreground-light dark:text-foreground-dark text-lg">
                    {medicalData.emergencyContact.relationship}
                  </p>
                </div>
                <div>
                  <h5 className="text-sm font-medium text-primary mb-1">
                    Contact:
                  </h5>
                  <p className="font-semibold text-foreground-light dark:text-foreground-dark text-lg">
                    {medicalData.emergencyContact.contact}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Immunization & Vaccination History */}
          <div className="bg-background-light dark:bg-background-dark p-4 rounded-lg border border-border-light dark:border-border-dark">
            <h4 className="text-base font-semibold text-foreground-light dark:text-foreground-dark mb-4">
              Immunization & Vaccination History
            </h4>
            <div className="space-y-3">
              {medicalData.immunizations.map((immunization, index) => (
                <div key={index} className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary text-xl mt-0.5">check_circle</span>
                  <div>
                    <p className="font-semibold text-foreground-light dark:text-foreground-dark text-lg">
                      {immunization.name}
                    </p>
                    <p className="text-sm text-subtle-light dark:text-subtle-dark">
                      {immunization.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Work-Related Medical Assessments Card */}
      <div className="bg-card-light dark:bg-card-dark p-6 rounded-xl shadow-soft">
        <h3 className="text-xl font-semibold mb-6 text-foreground-light dark:text-foreground-dark">
          Work-Related Medical Assessments
        </h3>
        <div className="space-y-4">
          {medicalData.assessments.map((assessment, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 border border-border-light dark:border-border-dark rounded-lg hover:bg-background-light dark:hover:bg-background-dark transition-colors"
            >
              <div className="flex-1">
                <p className="font-semibold text-foreground-light dark:text-foreground-dark text-lg mb-1">
                  {assessment.title}
                </p>
                <p className="text-sm text-subtle-light dark:text-subtle-dark">
                  Completed: {assessment.completedDate}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={clsx(
                    'px-3 py-1 rounded-full text-xs font-semibold',
                    getStatusBadgeColor(assessment.status)
                  )}
                >
                  {assessment.status}
                </span>
                <button
                  className="p-2 rounded-lg hover:bg-background-light dark:hover:bg-background-dark text-subtle-light dark:text-subtle-dark hover:text-foreground-light dark:hover:text-foreground-dark transition-colors"
                  onClick={() => {
                    toast.info(`Viewing ${assessment.title}`);
                  }}
                  aria-label={`View ${assessment.title}`}
                >
                  <span className="material-symbols-outlined">visibility</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Data Privacy & Security Disclaimer */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 flex items-start gap-3">
        <span className="material-symbols-outlined text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5">shield</span>
        <div className="flex-1">
          <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium mb-1">
            Data Privacy & Security:
          </p>
          <p className="text-xs text-yellow-700 dark:text-yellow-300">
            This information is confidential and protected under HIPAA and internal data security policies. Access is logged and restricted to authorized personnel for occupational health and safety purposes only.
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * Patients/Reports Tab Component (for Clinicians and Nurses)
 */
const PatientsReportsTab = ({ hospitalId, staffId, staffName, category }: { hospitalId: string; staffId: string; staffName: string; category?: string }) => {
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly'>('weekly');
  const navigate = useNavigate();

  const { data: reportsData, isLoading, error } = useQuery<StaffPatientsReports>({
    queryKey: ['hospital', 'staff', 'patients-reports', hospitalId, staffId, timeframe],
    queryFn: () => HospitalAPI.getStaffPatientsReportsWithTimeframe(hospitalId, staffId, timeframe),
  });

  const handleExportData = () => {
    if (!reportsData) return;
    
    // Generate export data
    const exportData = {
      staffName: reportsData.summary.name,
      specialty: reportsData.summary.specialty,
      totalPatientsAttended: reportsData.totalPatientsAttended,
      assignedPatients: reportsData.assignedPatients,
      activityReport: reportsData.activityReport,
      exportDate: new Date().toISOString(),
    };

    const content = JSON.stringify(exportData, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${staffName.replace(/\s+/g, '_')}_patients_reports_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    toast.success('Data exported successfully');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getSinceDate = (dateJoined: string) => {
    const date = new Date(dateJoined);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !reportsData) {
    return (
      <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-red-700 dark:text-red-300">
          Error loading patients and reports. Please try refreshing the page.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main Content - Left Side (2/3 width) */}
      <div className="lg:col-span-2 space-y-8">
        {/* Header with Export Button */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground-light dark:text-foreground-dark">
            Patients & Reports
          </h2>
          <button
            onClick={handleExportData}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 font-medium"
          >
            <span className="material-symbols-outlined text-base">download</span>
            <span>Export Data</span>
          </button>
        </div>

        {/* Assigned Patients Section */}
        <div className="bg-card-light dark:bg-card-dark p-6 rounded-xl shadow-soft">
          <h3 className="text-xl font-semibold mb-6 text-foreground-light dark:text-foreground-dark">
            Assigned Patients
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-light dark:border-border-dark">
                  <th className="text-left py-3 px-4 font-semibold text-foreground-light dark:text-foreground-dark">
                    Patient Name
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground-light dark:text-foreground-dark">
                    MRN
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground-light dark:text-foreground-dark">
                    Last Appointment
                  </th>
                </tr>
              </thead>
              <tbody>
                {reportsData.assignedPatients.map((patient) => (
                  <tr
                    key={patient.id}
                    className="border-b border-border-light dark:border-border-dark hover:bg-background-light dark:hover:bg-background-dark transition-colors cursor-pointer"
                    onClick={() => navigate(`/hospital/patients/${patient.id}`)}
                  >
                    <td className="py-3 px-4 text-foreground-light dark:text-foreground-dark">
                      {patient.name}
                    </td>
                    <td className="py-3 px-4 text-subtle-light dark:text-subtle-dark">
                      {patient.mrn}
                    </td>
                    <td className="py-3 px-4 text-subtle-light dark:text-subtle-dark">
                      {formatDate(patient.lastAppointment)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 text-center">
            <button
              onClick={() => navigate(`/hospital/staff/${category || 'staff'}/${staffId}/all-patients`)}
              className="text-primary hover:text-primary/80 font-medium transition-colors"
            >
              View All Patients
            </button>
          </div>
        </div>

        {/* Activity Reports Section */}
        <div className="bg-card-light dark:bg-card-dark p-6 rounded-xl shadow-soft">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-foreground-light dark:text-foreground-dark">
              Activity Reports
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => setTimeframe('weekly')}
                className={clsx(
                  'px-4 py-2 rounded-lg font-medium transition-colors',
                  timeframe === 'weekly'
                    ? 'bg-primary text-white'
                    : 'bg-background-light dark:bg-background-dark text-subtle-light dark:text-subtle-dark hover:text-foreground-light dark:hover:text-foreground-dark'
                )}
              >
                Weekly
              </button>
              <button
                onClick={() => setTimeframe('monthly')}
                className={clsx(
                  'px-4 py-2 rounded-lg font-medium transition-colors',
                  timeframe === 'monthly'
                    ? 'bg-primary text-white'
                    : 'bg-background-light dark:bg-background-dark text-subtle-light dark:text-subtle-dark hover:text-foreground-light dark:hover:text-foreground-dark'
                )}
              >
                Monthly
              </button>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-primary mb-1">Consultations:</h4>
              <p className="text-foreground-light dark:text-foreground-dark">
                {timeframe === 'monthly' && reportsData.activityReport.monthly
                  ? reportsData.activityReport.monthly.consultations
                  : reportsData.activityReport.consultations}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-primary mb-1">Procedures Performed:</h4>
              <p className="text-foreground-light dark:text-foreground-dark">
                {timeframe === 'monthly' && reportsData.activityReport.monthly
                  ? reportsData.activityReport.monthly.proceduresPerformed
                  : reportsData.activityReport.proceduresPerformed}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-primary mb-1">Key Observations/Highlights:</h4>
              <p className="text-foreground-light dark:text-foreground-dark">
                {timeframe === 'monthly' && reportsData.activityReport.monthly
                  ? reportsData.activityReport.monthly.keyObservations
                  : reportsData.activityReport.keyObservations}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar (1/3 width) */}
      <div className="space-y-6">
        {/* Total Patients Attended Card */}
        <div className="bg-card-light dark:bg-card-dark p-6 rounded-xl shadow-soft">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-2xl">people</span>
            </div>
            <div>
              <p className="text-sm font-medium text-subtle-light dark:text-subtle-dark">
                Total Patients Attended
              </p>
              <p className="text-3xl font-bold text-primary mt-1">
                {reportsData.totalPatientsAttended.toLocaleString()}
              </p>
            </div>
          </div>
          <p className="text-xs text-subtle-light dark:text-subtle-dark">
            Since {getSinceDate(reportsData.dateJoined)}
          </p>
        </div>

        {/* Clinician Summary Card */}
        <div className="bg-card-light dark:bg-card-dark p-6 rounded-xl shadow-soft">
          <div className="flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-primary text-5xl">person</span>
            </div>
            <h4 className="text-lg font-semibold text-foreground-light dark:text-foreground-dark mb-1">
              {reportsData.summary.name}
            </h4>
            <p className="text-sm text-primary mb-3">
              {Array.isArray(reportsData.summary.specialty) 
                ? reportsData.summary.specialty.join(', ') 
                : reportsData.summary.specialty}
            </p>
            <p className="text-sm text-subtle-light dark:text-subtle-dark">
              {reportsData.summary.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Reports Tab Component (for Non-Clinicians)
 */
const ReportsTab = ({ hospitalId, staffId, staffName, staffRole }: { hospitalId: string; staffId: string; staffName: string; staffRole: string }) => {
  const navigate = useNavigate();

  const { data: reportsData, isLoading, error } = useQuery<StaffReports>({
    queryKey: ['hospital', 'staff', 'reports', hospitalId, staffId],
    queryFn: () => HospitalAPI.getStaffReports(hospitalId, staffId),
  });

  const handleExportData = () => {
    if (!reportsData) return;
    
    const exportData = {
      staffName: reportsData.summary.name,
      role: reportsData.summary.role,
      reports: reportsData.reports,
      exportDate: new Date().toISOString(),
    };

    const content = JSON.stringify(exportData, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${staffName.replace(/\s+/g, '_')}_reports_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    toast.success('Data exported successfully');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !reportsData) {
    return (
      <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-red-700 dark:text-red-300">
          Error loading reports. Please try refreshing the page.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main Content - Left Side (2/3 width) */}
      <div className="lg:col-span-2 space-y-8">
        {/* Header with Export Button */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground-light dark:text-foreground-dark">
            Reports
          </h2>
          <button
            onClick={handleExportData}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 font-medium"
          >
            <span className="material-symbols-outlined text-base">download</span>
            <span>Export Data</span>
          </button>
        </div>

        {/* Weekly Summary Section */}
        {reportsData.weeklySummary && (
          <div className="bg-card-light dark:bg-card-dark p-6 rounded-xl shadow-soft">
            <h3 className="text-xl font-semibold mb-6 text-foreground-light dark:text-foreground-dark">
              Weekly Summary (Last 30 Days)
            </h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-primary mb-1">Tasks Completed:</h4>
                <p className="text-foreground-light dark:text-foreground-dark">
                  {reportsData.weeklySummary.tasksCompletedLabel}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-primary mb-1">Key Metrics:</h4>
                <p className="text-foreground-light dark:text-foreground-dark">
                  {reportsData.weeklySummary.keyMetrics}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-primary mb-1">Highlights:</h4>
                <p className="text-foreground-light dark:text-foreground-dark">
                  {reportsData.weeklySummary.highlights}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Reports List */}
        <div className="bg-card-light dark:bg-card-dark p-6 rounded-xl shadow-soft">
          <h3 className="text-xl font-semibold mb-6 text-foreground-light dark:text-foreground-dark">
            Activity Reports
          </h3>
          <div className="space-y-4">
            {reportsData.reports.map((report) => (
              <div
                key={report.id}
                className="p-4 border border-border-light dark:border-border-dark rounded-lg hover:bg-background-light dark:hover:bg-background-dark transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground-light dark:text-foreground-dark text-lg mb-1">
                      {report.title}
                    </h4>
                    <div className="flex items-center gap-3 text-sm text-subtle-light dark:text-subtle-dark">
                      <span>{report.type}</span>
                      <span>•</span>
                      <span>{formatDate(report.date)}</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-foreground-light dark:text-foreground-dark mt-2">
                  {report.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Sidebar (1/3 width) */}
      <div className="space-y-6">
        {/* Staff Summary Card */}
        <div className="bg-card-light dark:bg-card-dark p-6 rounded-xl shadow-soft">
          <div className="flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-primary text-5xl">person</span>
            </div>
            <h4 className="text-lg font-semibold text-foreground-light dark:text-foreground-dark mb-1">
              {reportsData.summary.name}
            </h4>
            <p className="text-sm text-primary mb-3">
              {reportsData.summary.role}
            </p>
            <p className="text-sm text-subtle-light dark:text-subtle-dark">
              {reportsData.summary.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Documents Tab Component
 */
const DocumentsTab = ({ hospitalId, staffId }: { hospitalId: string; staffId: string }) => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<string>('other');
  const [customCategory, setCustomCategory] = useState<string>('');
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [description, setDescription] = useState<string>('');
  
  // Standard document categories
  const standardCategories = [
    { value: 'cv', label: 'CV' },
    { value: 'license', label: 'License' },
    { value: 'certification', label: 'Certification' },
    { value: 'employment', label: 'Employment' },
    { value: 'health', label: 'Health' },
    { value: 'contract', label: 'Contract' },
    { value: 'id', label: 'ID Card' },
    { value: 'other', label: 'Other' },
  ];

  const { data: documentsData, isLoading, error } = useQuery<StaffDocumentsData>({
    queryKey: ['hospital', 'staff', 'documents', hospitalId, staffId],
    queryFn: () => HospitalAPI.getStaffDocuments(hospitalId, staffId),
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => {
      const finalType = showCustomCategory && customCategory.trim() ? customCategory.trim().toLowerCase() : documentType;
      return HospitalAPI.uploadStaffDocument(hospitalId, staffId, file, finalType, description || undefined);
    },
    onSuccess: () => {
      toast.success('Document uploaded successfully');
      queryClient.invalidateQueries({ queryKey: ['hospital', 'staff', 'documents', hospitalId, staffId] });
      setShowUploadModal(false);
      setSelectedFile(null);
      setDocumentType('other');
      setCustomCategory('');
      setShowCustomCategory(false);
      setDescription('');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to upload document');
    },
    onSettled: () => {
      setIsUploading(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (documentId: string) => HospitalAPI.deleteStaffDocument(hospitalId, staffId, documentId),
    onSuccess: () => {
      toast.success('Document deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['hospital', 'staff', 'documents', hospitalId, staffId] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete document');
    },
  });

  const downloadMutation = useMutation({
    mutationFn: (documentId: string) => HospitalAPI.downloadStaffDocument(hospitalId, staffId, documentId),
    onSuccess: () => {
      toast.success('Document download started');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to download document');
    },
  });

  const handleViewDocument = (doc: StaffDocument) => {
    try {
      // Create a proper blob based on file type for viewing
      let blob: Blob;
      
      if (doc.fileType === 'application/pdf') {
        const pdfContent = createMockPDF(doc.fileName, doc);
        blob = new Blob([pdfContent], { type: 'application/pdf' });
      } else if (doc.fileType.startsWith('image/')) {
        const svgContent = createMockImage(doc.fileName, doc);
        blob = new Blob([svgContent], { type: 'image/svg+xml' });
      } else {
        const textContent = createMockDocument(doc.fileName, doc);
        blob = new Blob([textContent], { type: 'text/plain' });
      }
      
      const url = window.URL.createObjectURL(blob);
      const newWindow = window.open(url, '_blank');
      if (newWindow) {
        // Clean up the URL after the window is closed or after 5 minutes
        setTimeout(() => window.URL.revokeObjectURL(url), 300000);
      } else {
        window.URL.revokeObjectURL(url);
        toast.error('Please allow pop-ups to view documents');
      }
    } catch (error) {
      toast.error('Failed to open document');
    }
  };

  // Helper functions for creating mock file content
  const createMockPDF = (fileName: string, doc: StaffDocument): string => {
    const content = `Document: ${fileName}\n\nFile Size: ${(doc.fileSize / 1024).toFixed(2)} KB\nFile Type: ${doc.fileType}\nUploaded: ${new Date(doc.uploadedAt).toLocaleString()}\n\nThis is a mock PDF document. In production, this would contain the actual file content.`;
    
    let pdf = '%PDF-1.4\n';
    pdf += '1 0 obj\n';
    pdf += '<< /Type /Catalog /Pages 2 0 R >>\n';
    pdf += 'endobj\n';
    pdf += '2 0 obj\n';
    pdf += '<< /Type /Pages /Kids [3 0 R] /Count 1 >>\n';
    pdf += 'endobj\n';
    pdf += '3 0 obj\n';
    pdf += '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\n';
    pdf += 'endobj\n';
    
    const contentStream = `BT\n/F1 12 Tf\n50 750 Td\n(${content.replace(/[()\\]/g, '\\$&').replace(/\n/g, '\\n')}) Tj\nET`;
    pdf += '4 0 obj\n';
    pdf += `<< /Length ${contentStream.length} >>\n`;
    pdf += 'stream\n';
    pdf += contentStream + '\n';
    pdf += 'endstream\n';
    pdf += 'endobj\n';
    pdf += '5 0 obj\n';
    pdf += '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\n';
    pdf += 'endobj\n';
    
    const xrefOffset = pdf.length;
    pdf += 'xref\n';
    pdf += '0 6\n';
    pdf += '0000000000 65535 f \n';
    pdf += '0000000009 00000 n \n';
    pdf += '0000000058 00000 n \n';
    pdf += '0000000115 00000 n \n';
    pdf += '0000000250 00000 n \n';
    pdf += '0000000350 00000 n \n';
    pdf += 'trailer\n';
    pdf += '<< /Size 6 /Root 1 0 R >>\n';
    pdf += 'startxref\n';
    pdf += `${xrefOffset}\n`;
    pdf += '%%EOF';
    
    return pdf;
  };

  const createMockImage = (fileName: string, doc: StaffDocument): string => {
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
  <rect width="800" height="600" fill="#f0f0f0"/>
  <text x="400" y="250" font-family="Arial" font-size="24" text-anchor="middle" fill="#333">
    ${fileName}
  </text>
  <text x="400" y="300" font-family="Arial" font-size="16" text-anchor="middle" fill="#666">
    File Size: ${(doc.fileSize / 1024).toFixed(2)} KB
  </text>
  <text x="400" y="330" font-family="Arial" font-size="14" text-anchor="middle" fill="#999">
    Uploaded: ${new Date(doc.uploadedAt).toLocaleString()}
  </text>
  <text x="400" y="360" font-family="Arial" font-size="12" text-anchor="middle" fill="#999">
    This is a mock image. In production, this would show the actual image.
  </text>
</svg>`;
  };

  const createMockDocument = (fileName: string, doc: StaffDocument): string => {
    return `Document: ${fileName}

File Size: ${(doc.fileSize / 1024).toFixed(2)} KB
File Type: ${doc.fileType}
Uploaded: ${new Date(doc.uploadedAt).toLocaleString()}
${doc.description ? `Description: ${doc.description}` : ''}

This is a mock document. In production, this would contain the actual file content.

---
Generated by Hospital Management System
`;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
      setShowUploadModal(true);
    }
  };

  const handleUpload = () => {
    if (!selectedFile) {
      toast.error('Please select a file');
      return;
    }
    setIsUploading(true);
    uploadMutation.mutate(selectedFile);
  };

  const handleDelete = (documentId: string, fileName: string) => {
    if (window.confirm(`Are you sure you want to delete "${fileName}"?\n\nThis action cannot be undone.`)) {
      deleteMutation.mutate(documentId);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getDocumentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      cv: 'CV',
      license: 'License',
      certification: 'Certification',
      employment: 'Employment',
      health: 'Health',
      contract: 'Contract',
      id: 'ID Card',
      other: 'Other',
    };
    // If not in standard labels, capitalize first letter of each word
    if (labels[type.toLowerCase()]) {
      return labels[type.toLowerCase()];
    }
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return 'image';
    if (fileType === 'application/pdf') return 'picture_as_pdf';
    if (fileType.includes('word')) return 'description';
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return 'table_chart';
    return 'description';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !documentsData) {
    return (
      <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-red-700 dark:text-red-300">
          Error loading documents. Please try refreshing the page.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Upload Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground-light dark:text-foreground-dark">
          Uploaded Documents
        </h2>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 font-medium"
        >
          <span className="material-symbols-outlined text-base">upload</span>
          <span>Upload New Document</span>
        </button>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
        className="hidden"
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
      />

      {/* Documents Table */}
      {documentsData.documents.length === 0 ? (
        <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-soft p-12">
          <EmptyState
            icon="description"
            title="No documents uploaded"
            description="Upload documents to keep them organized and easily accessible."
          />
        </div>
      ) : (
        <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-background-light dark:bg-background-dark border-b border-border-light dark:border-border-dark">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground-light dark:text-foreground-dark">
                    Document Name
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground-light dark:text-foreground-dark">
                    Category
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground-light dark:text-foreground-dark">
                    Upload Date
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-foreground-light dark:text-foreground-dark">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light dark:divide-border-dark">
                {documentsData.documents.map((doc) => (
                  <tr
                    key={doc.id}
                    className="hover:bg-background-light dark:hover:bg-background-dark transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-subtle-light dark:text-subtle-dark">
                          {getFileIcon(doc.fileType)}
                        </span>
                        <span className="font-medium text-foreground-light dark:text-foreground-dark">
                          {doc.fileName}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-foreground-light dark:text-foreground-dark">
                        {getDocumentTypeLabel(doc.documentType)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-subtle-light dark:text-subtle-dark">
                        {new Date(doc.uploadedAt).toISOString().split('T')[0]}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => handleViewDocument(doc)}
                          className="p-2 rounded-lg hover:bg-background-light dark:hover:bg-background-dark text-subtle-light dark:text-subtle-dark hover:text-primary transition-colors"
                          title="View Document"
                        >
                          <span className="material-symbols-outlined">visibility</span>
                        </button>
                        <button
                          onClick={() => downloadMutation.mutate(doc.id)}
                          disabled={downloadMutation.isPending}
                          className="p-2 rounded-lg hover:bg-background-light dark:hover:bg-background-dark text-subtle-light dark:text-subtle-dark hover:text-primary transition-colors"
                          title="Download"
                        >
                          <span className="material-symbols-outlined">download</span>
                        </button>
                        <button
                          onClick={() => handleDelete(doc.id, doc.fileName)}
                          disabled={deleteMutation.isPending}
                          className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-subtle-light dark:text-subtle-dark hover:text-red-600 dark:hover:text-red-400 transition-colors"
                          title="Delete Document"
                        >
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => {
          setShowUploadModal(false);
          setSelectedFile(null);
          setDocumentType('other');
          setDescription('');
        }}
        title="Upload Document"
      >
        <div className="space-y-4">
          {selectedFile && (
            <div className="p-4 bg-background-light dark:bg-background-dark rounded-lg border border-border-light dark:border-border-dark">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-2xl">
                  {getFileIcon(selectedFile.type)}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground-light dark:text-foreground-dark truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-sm text-subtle-light dark:text-subtle-dark">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
              </div>
            </div>
          )}

          <Select
            label="Document Category"
            value={showCustomCategory ? 'custom' : documentType}
            onChange={(e) => {
              if (e.target.value === 'custom') {
                setShowCustomCategory(true);
                setDocumentType('other');
              } else {
                setShowCustomCategory(false);
                setDocumentType(e.target.value);
              }
            }}
            options={[
              ...standardCategories,
              { value: 'custom', label: '+ Create New Category' },
            ]}
          />

          {showCustomCategory && (
            <TextField
              label="Custom Category Name"
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              placeholder="Enter category name (e.g., Training Certificate)"
              required
            />
          )}

          <div className="w-full">
            <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-2">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description for this document"
              rows={3}
              className="w-full rounded-lg border px-4 py-2 text-foreground-light dark:text-foreground-dark placeholder-subtle-light dark:placeholder-subtle-dark bg-background-light dark:bg-background-dark focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors border-border-light dark:border-border-dark resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => {
                setShowUploadModal(false);
                setSelectedFile(null);
                setDocumentType('other');
                setCustomCategory('');
                setShowCustomCategory(false);
                setDescription('');
              }}
              className="px-4 py-2 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={isUploading || !selectedFile || (showCustomCategory && !customCategory.trim())}
              className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isUploading ? (
                <>
                  <Spinner size="sm" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-base">upload</span>
                  <span>Upload</span>
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// Step 6: Review Component (defined before UpdateInformationWizard to avoid hoisting issues)
const Step6Review = ({
  formData,
  profilePicturePreview,
  onEditStep,
}: {
  formData: Partial<StaffUpdateData>;
  profilePicturePreview?: string;
  onEditStep: (step: number) => void;
}) => {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-foreground-light dark:text-foreground-dark mb-4">
        Review & Confirm Information
      </h3>
      <p className="text-sm text-subtle-light dark:text-subtle-dark mb-6">
        Please review all the information below. Click "Edit" on any section to make changes.
      </p>

      {/* Overview Section */}
      <div className="bg-card-light dark:bg-card-dark p-6 rounded-xl shadow-soft border border-border-light dark:border-border-dark">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-foreground-light dark:text-foreground-dark">
            Step 1: Overview
          </h4>
          <button
            onClick={() => onEditStep(1)}
            className="px-3 py-1.5 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm font-medium flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-base">edit</span>
            <span>Edit</span>
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {profilePicturePreview && (
            <div className="md:col-span-2 mb-4">
              <label className="block text-sm font-medium text-primary mb-2">Profile Picture</label>
              <div className="w-32 h-32 rounded-lg border-2 border-primary/30 overflow-hidden">
                <img
                  src={profilePicturePreview}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-primary mb-1">Name</label>
            <p className="text-foreground-light dark:text-foreground-dark">{formData.overview?.name || 'N/A'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-primary mb-1">Email</label>
            <p className="text-foreground-light dark:text-foreground-dark">{formData.overview?.email || 'N/A'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-primary mb-1">Phone</label>
            <p className="text-foreground-light dark:text-foreground-dark">{formData.overview?.phone || 'N/A'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-primary mb-1">Marital Status</label>
            <p className="text-foreground-light dark:text-foreground-dark">{formData.overview?.marital_status || 'N/A'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-primary mb-1">Next of Kin</label>
            <p className="text-foreground-light dark:text-foreground-dark">
              {formData.overview?.next_of_kin_name || 'N/A'}
              {formData.overview?.next_of_kin_relationship && ` (${formData.overview.next_of_kin_relationship})`}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-primary mb-1">Home Address</label>
            <p className="text-foreground-light dark:text-foreground-dark">{formData.overview?.home_address || 'N/A'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-primary mb-1">Qualifications</label>
            <p className="text-foreground-light dark:text-foreground-dark">{formData.overview?.qualifications || 'N/A'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-primary mb-1">Date Joined</label>
            <p className="text-foreground-light dark:text-foreground-dark">{formData.overview?.date_joined || 'N/A'}</p>
          </div>
          {formData.overview?.specialty && (
            <div>
              <label className="block text-sm font-medium text-primary mb-1">Specialty</label>
              <p className="text-foreground-light dark:text-foreground-dark">
                {Array.isArray(formData.overview.specialty) 
                  ? formData.overview.specialty.join(', ') 
                  : formData.overview.specialty}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Employment Section */}
      <div className="bg-card-light dark:bg-card-dark p-6 rounded-xl shadow-soft border border-border-light dark:border-border-dark">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-foreground-light dark:text-foreground-dark">
            Step 2: Employment/Financial
          </h4>
          <button
            onClick={() => onEditStep(2)}
            className="px-3 py-1.5 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm font-medium flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-base">edit</span>
            <span>Edit</span>
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-primary mb-1">Bank Name</label>
            <p className="text-foreground-light dark:text-foreground-dark">
              {formData.employment?.bankAccount?.bankName || 'N/A'}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-primary mb-1">Account Number</label>
            <p className="text-foreground-light dark:text-foreground-dark">
              {formData.employment?.bankAccount?.accountNumber || 'N/A'}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-primary mb-1">Routing Number</label>
            <p className="text-foreground-light dark:text-foreground-dark">
              {formData.employment?.bankAccount?.routingNumber || 'N/A'}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-primary mb-1">Base Salary</label>
            <p className="text-foreground-light dark:text-foreground-dark">
              {formData.employment?.salaryAndBenefits?.baseSalary || 'N/A'}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-primary mb-1">Healthcare Benefits</label>
            <p className="text-foreground-light dark:text-foreground-dark">
              {formData.employment?.salaryAndBenefits?.healthcareBenefits || 'N/A'}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-primary mb-1">Bonus Structure</label>
            <p className="text-foreground-light dark:text-foreground-dark">
              {formData.employment?.salaryAndBenefits?.bonusStructure || 'N/A'}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-primary mb-1">Retirement Plan</label>
            <p className="text-foreground-light dark:text-foreground-dark">
              {formData.employment?.salaryAndBenefits?.retirementPlan || 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Medical Section */}
      <div className="bg-card-light dark:bg-card-dark p-6 rounded-xl shadow-soft border border-border-light dark:border-border-dark">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-foreground-light dark:text-foreground-dark">
            Step 3: Medical Info
          </h4>
          <button
            onClick={() => onEditStep(3)}
            className="px-3 py-1.5 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm font-medium flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-base">edit</span>
            <span>Edit</span>
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-primary mb-1">Medical Conditions</label>
            <p className="text-foreground-light dark:text-foreground-dark">{formData.medical?.conditions || 'N/A'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-primary mb-1">Allergies</label>
            <p className="text-foreground-light dark:text-foreground-dark">{formData.medical?.allergies || 'N/A'}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-primary mb-1">Emergency Contact Name</label>
              <p className="text-foreground-light dark:text-foreground-dark">
                {formData.medical?.emergencyContact?.name || 'N/A'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-primary mb-1">Relationship</label>
              <p className="text-foreground-light dark:text-foreground-dark">
                {formData.medical?.emergencyContact?.relationship || 'N/A'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-primary mb-1">Contact</label>
              <p className="text-foreground-light dark:text-foreground-dark">
                {formData.medical?.emergencyContact?.contact || 'N/A'}
              </p>
            </div>
          </div>
          {formData.medical?.immunizations && formData.medical.immunizations.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-primary mb-2">Immunizations</label>
              <div className="space-y-2">
                {formData.medical.immunizations.map((imm, index) => (
                  <div key={index} className="flex items-center gap-2 text-foreground-light dark:text-foreground-dark">
                    <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
                    <span>{imm.name} - {imm.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {formData.medical?.assessments && formData.medical.assessments.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-primary mb-2">Medical Assessments</label>
              <div className="space-y-2">
                {formData.medical.assessments.map((assessment, index) => (
                  <div key={index} className="p-3 bg-background-light dark:bg-background-dark rounded-lg">
                    <p className="font-medium text-foreground-light dark:text-foreground-dark">{assessment.title}</p>
                    <p className="text-sm text-subtle-light dark:text-subtle-dark">
                      {assessment.completedDate} - {assessment.status}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Patients/Reports Section (if applicable) */}
      {formData.patientsReports && (
        <div className="bg-card-light dark:bg-card-dark p-6 rounded-xl shadow-soft border border-border-light dark:border-border-dark">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-foreground-light dark:text-foreground-dark">
              Step 4: Patients/Reports
            </h4>
            <button
              onClick={() => onEditStep(4)}
              className="px-3 py-1.5 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm font-medium flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-base">edit</span>
              <span>Edit</span>
            </button>
          </div>
          <div className="space-y-4">
            {formData.patientsReports.activityReport?.consultations && (
              <div>
                <label className="block text-sm font-medium text-primary mb-1">Consultations</label>
                <p className="text-foreground-light dark:text-foreground-dark">
                  {formData.patientsReports.activityReport.consultations}
                </p>
              </div>
            )}
            {formData.patientsReports.activityReport?.proceduresPerformed && (
              <div>
                <label className="block text-sm font-medium text-primary mb-1">Procedures Performed</label>
                <p className="text-foreground-light dark:text-foreground-dark">
                  {formData.patientsReports.activityReport.proceduresPerformed}
                </p>
              </div>
            )}
            {formData.patientsReports.activityReport?.keyObservations && (
              <div>
                <label className="block text-sm font-medium text-primary mb-1">Key Observations</label>
                <p className="text-foreground-light dark:text-foreground-dark">
                  {formData.patientsReports.activityReport.keyObservations}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Documents Section */}
      <div className="bg-card-light dark:bg-card-dark p-6 rounded-xl shadow-soft border border-border-light dark:border-border-dark">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-foreground-light dark:text-foreground-dark">
            Step 5: Documents
          </h4>
          <button
            onClick={() => onEditStep(5)}
            className="px-3 py-1.5 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm font-medium flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-base">edit</span>
            <span>Edit</span>
          </button>
        </div>
        {formData.documents && formData.documents.length > 0 ? (
          <div className="space-y-3">
            {formData.documents.map((doc, index) => (
              <div
                key={index}
                className="p-3 bg-background-light dark:bg-background-dark rounded-lg border border-border-light dark:border-border-dark flex items-center gap-3"
              >
                <span className="material-symbols-outlined text-primary text-xl">description</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground-light dark:text-foreground-dark truncate">
                    {doc.file?.name || 'Document'}
                  </p>
                  <p className="text-sm text-subtle-light dark:text-subtle-dark">
                    {doc.documentType} {doc.description && `• ${doc.description}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-subtle-light dark:text-subtle-dark">No documents uploaded</p>
        )}
      </div>
    </div>
  );
};

/**
 * Update Information Wizard Component
 * Multi-step form for updating all staff information
 */
const UpdateInformationWizard = ({
  isOpen,
  onClose,
  hospitalId,
  staffId,
  staffMember,
  onComplete,
}: {
  isOpen: boolean;
  onClose: () => void;
  hospitalId: string;
  staffId: string;
  staffMember: Clinician;
  onComplete: () => void;
}) => {
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6; // Added review step
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Store profile picture as base64 string for persistence
  const [profilePictureBase64, setProfilePictureBase64] = useState<string | undefined>(
    staffMember.profile_picture
  );
  
  // Form data state
  const [formData, setFormData] = useState<Partial<StaffUpdateData>>({
    overview: {
      name: staffMember.name || '',
      email: staffMember.email || '',
      phone: staffMember.phone || '',
      marital_status: staffMember.marital_status || '',
      next_of_kin_name: staffMember.next_of_kin?.name || '',
      next_of_kin_relationship: staffMember.next_of_kin?.relationship || '',
      home_address: staffMember.home_address || '',
      qualifications: staffMember.qualifications || '',
      date_joined: staffMember.date_joined || '',
      specialty: Array.isArray(staffMember.specialty) ? staffMember.specialty.join(', ') : (staffMember.specialty || ''),
      profile_picture: staffMember.profile_picture,
    },
    employment: {
      bankAccount: {},
      salaryAndBenefits: {},
    },
    medical: {
      emergencyContact: {},
    },
    documents: [],
  });

  // Load existing draft on mount
  const { data: existingDraft } = useQuery<StaffUpdateDraft | null>({
    queryKey: ['hospital', 'staff', 'update-draft', hospitalId, staffId],
    queryFn: () => HospitalAPI.getStaffUpdateDraft(hospitalId, staffId),
    enabled: isOpen,
  });

  // Load draft data if exists
  useEffect(() => {
    if (existingDraft && isOpen) {
      setFormData(existingDraft.data);
      setCurrentStep(existingDraft.currentStep);
      // Restore profile picture preview if it exists
      if (existingDraft.data.overview?.profile_picture) {
        const pic = existingDraft.data.overview.profile_picture;
        if (typeof pic === 'string') {
          setProfilePictureBase64(pic);
        }
      }
      toast.info(`Resuming from step ${existingDraft.currentStep} of ${totalSteps}`);
    }
  }, [existingDraft, isOpen, totalSteps]);

  // Auto-save draft on step change or data change
  const saveDraftMutation = useMutation({
    mutationFn: ({ data, step }: { data: Partial<StaffUpdateData>; step: number }) =>
      HospitalAPI.saveStaffUpdateDraft(hospitalId, staffId, data, step),
    onSuccess: () => {
      // Silent save - no toast notification to avoid spam
    },
  });

  // Auto-save when form data changes (excluding File objects)
  useEffect(() => {
    if (isOpen && currentStep > 0) {
      const timeoutId = setTimeout(() => {
        // Prepare data for saving (convert File to base64 for profile picture)
        const dataToSave = { ...formData };
        if (dataToSave.overview?.profile_picture instanceof File) {
          // Convert File to base64 for persistence
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64String = reader.result as string;
            setProfilePictureBase64(base64String);
            saveDraftMutation.mutate({
              data: {
                ...dataToSave,
                overview: {
                  ...dataToSave.overview,
                  profile_picture: base64String,
                  name: dataToSave.overview?.name || '',
                },
              },
              step: currentStep,
            });
          };
          reader.readAsDataURL(dataToSave.overview.profile_picture);
        } else {
          // For documents, we'll save metadata only (not the actual files)
          const documentsMetadata = dataToSave.documents?.map(doc => ({
            fileName: doc.file.name,
            fileSize: doc.file.size,
            fileType: doc.file.type,
            documentType: doc.documentType,
            description: doc.description,
          }));
          saveDraftMutation.mutate({
            data: {
              ...dataToSave,
              documents: documentsMetadata as any, // Store metadata only
            },
            step: currentStep,
          });
        }
      }, 1000); // Debounce for 1 second
      return () => clearTimeout(timeoutId);
    }
  }, [formData, currentStep, isOpen]);

  // Submit final update
  const submitMutation = useMutation({
    mutationFn: (data: StaffUpdateData) =>
      HospitalAPI.submitStaffUpdate(hospitalId, staffId, data),
    onSuccess: async () => {
      toast.success('Staff information updated successfully!');
      await queryClient.invalidateQueries({ queryKey: ['hospital', 'clinicians'], exact: false });
      await queryClient.invalidateQueries({ queryKey: ['hospital', 'staff'], exact: false });
      onComplete();
      onClose();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update staff information');
    },
  });

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      // Save draft
      saveDraftMutation.mutate({ data: formData, step: currentStep + 1 });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      // Save draft
      saveDraftMutation.mutate({ data: formData, step: currentStep - 1 });
    }
  };

  const handleSaveAndQuit = async () => {
    setIsSaving(true);
    try {
      await saveDraftMutation.mutateAsync({ data: formData, step: currentStep });
      toast.success('Progress saved. You can continue later.');
      onClose();
    } catch (error) {
      toast.error('Failed to save progress');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.overview?.name?.trim()) {
      toast.error('Name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      // Convert form data to StaffUpdateData format
      const updateData: StaffUpdateData = {
        overview: {
          name: formData.overview.name,
          email: formData.overview.email,
          phone: formData.overview.phone,
          marital_status: formData.overview.marital_status,
          next_of_kin_name: formData.overview.next_of_kin_name,
          next_of_kin_relationship: formData.overview.next_of_kin_relationship,
          home_address: formData.overview.home_address,
          qualifications: formData.overview.qualifications,
          date_joined: formData.overview.date_joined,
          specialty: formData.overview.specialty,
          profile_picture: formData.overview.profile_picture,
        },
        employment: formData.employment || {
          bankAccount: {},
          salaryAndBenefits: {},
        },
        medical: formData.medical || {
          emergencyContact: {},
        },
        documents: formData.documents || [],
      };

      await submitMutation.mutateAsync(updateData);
    } catch (error) {
      // Error handled by mutation
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFormData = (section: keyof StaffUpdateData, data: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section], ...data },
    }));
  };

  const updateNestedFormData = (section: keyof StaffUpdateData, subsection: string, data: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subsection]: { ...(prev[section] as any)?.[subsection], ...data },
      },
    }));
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Update Staff Information"
      size="xl"
    >
      <div className="space-y-6">
        {/* Progress Indicator */}
        <div className="bg-background-light dark:bg-background-dark p-4 rounded-lg border border-border-light dark:border-border-dark">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground-light dark:text-foreground-dark">
              Step {currentStep} of {totalSteps}
            </span>
            <span className="text-sm text-subtle-light dark:text-subtle-dark">
              {Math.round((currentStep / totalSteps) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-3 text-xs text-subtle-light dark:text-subtle-dark">
            <span>Step {currentStep}: {getStepTitle(currentStep)}</span>
            <span>{totalSteps - currentStep} steps remaining</span>
          </div>
        </div>

        {/* Step Content */}
        <div className="min-h-[400px]">
          {currentStep === 1 && (
            <Step1Overview
              formData={formData.overview || {}}
              onChange={(data) => updateFormData('overview', data)}
              staffMember={staffMember}
              profilePicturePreview={profilePictureBase64}
              onProfilePictureChange={(base64, file) => {
                setProfilePictureBase64(base64);
                updateFormData('overview', { profile_picture: file });
              }}
            />
          )}
          {currentStep === 2 && (
            <Step2Employment
              formData={formData.employment || { bankAccount: {}, salaryAndBenefits: {} }}
              onChange={(data) => updateFormData('employment', data)}
            />
          )}
          {currentStep === 3 && (
            <Step3Medical
              formData={formData.medical || { emergencyContact: {} }}
              onChange={(data) => updateFormData('medical', data)}
            />
          )}
          {currentStep === 4 && (
            <Step4PatientsReports
              formData={formData.patientsReports}
              onChange={(data) => updateFormData('patientsReports', data)}
              isClinicianOrNurse={staffMember.role?.toLowerCase() === 'clinician' || staffMember.role?.toLowerCase() === 'nurse'}
            />
          )}
          {currentStep === 5 && (
            <Step5Documents
              formData={formData.documents || []}
              onChange={(data) => updateFormData('documents', data)}
              hospitalId={hospitalId}
              staffId={staffId}
            />
          )}
          {currentStep === 6 && (
            <Step6Review
              formData={formData}
              profilePicturePreview={profilePictureBase64}
              onEditStep={(step: number) => setCurrentStep(step)}
            />
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-border-light dark:border-border-dark">
          <div className="flex gap-3">
            <button
              onClick={handleSaveAndQuit}
              disabled={isSaving}
              className="px-4 py-2 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save & Quit'}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
          <div className="flex gap-3">
            {currentStep > 1 && (
              <button
                onClick={handlePrevious}
                className="px-4 py-2 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium"
              >
                Previous
              </button>
            )}
            {currentStep < totalSteps ? (
              <button
                onClick={handleNext}
                className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors font-medium"
              >
                {currentStep === totalSteps - 1 ? 'Review' : 'Next'}
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Spinner size="sm" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-base">check</span>
                    <span>Complete Update</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

// Helper function to get step title
const getStepTitle = (step: number): string => {
  const titles = {
    1: 'Overview',
    2: 'Employment/Financial',
    3: 'Medical Info',
    4: 'Patients/Reports',
    5: 'Documents',
    6: 'Review & Submit',
  };
  return titles[step as keyof typeof titles] || '';
};

// Step 1: Overview Component
const Step1Overview = ({
  formData,
  onChange,
  staffMember,
  profilePicturePreview,
  onProfilePictureChange,
}: {
  formData: Partial<StaffUpdateData['overview']>;
  onChange: (data: Partial<StaffUpdateData['overview']>) => void;
  staffMember: Clinician;
  profilePicturePreview?: string;
  onProfilePictureChange?: (base64: string, file: File) => void;
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localPreview, setLocalPreview] = useState<string | undefined>(
    profilePicturePreview || (formData.profile_picture as string)
  );

  // Update preview when prop changes (e.g., when navigating back to this step)
  useEffect(() => {
    if (profilePicturePreview) {
      setLocalPreview(profilePicturePreview);
    } else if (formData.profile_picture && typeof formData.profile_picture === 'string') {
      setLocalPreview(formData.profile_picture);
    }
  }, [profilePicturePreview, formData.profile_picture]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('File must be an image');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      // Store the File object in form data
      onChange({ profile_picture: file });
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64String = e.target?.result as string;
        setLocalPreview(base64String);
        // Notify parent component to update base64 state
        if (onProfilePictureChange) {
          onProfilePictureChange(base64String, file);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-foreground-light dark:text-foreground-dark mb-4">
        Personal & Professional Information
      </h3>

      {/* Profile Picture */}
      <div className="bg-card-light dark:bg-card-dark p-4 rounded-lg border border-border-light dark:border-border-dark">
        <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-2">
          Profile Picture
        </label>
        <div className="flex items-center gap-4">
          <div className="w-24 h-24 rounded-lg border-2 border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center overflow-hidden">
            {localPreview ? (
              <img
                src={localPreview}
                alt="Profile"
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback if image fails to load
                  setLocalPreview(undefined);
                  onChange({ profile_picture: undefined });
                }}
              />
            ) : (
              <span className="material-symbols-outlined text-4xl text-subtle-light dark:text-subtle-dark">person</span>
            )}
          </div>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm font-medium"
            >
              {localPreview ? 'Change Picture' : 'Upload Picture'}
            </button>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="space-y-4">
        <TextField
          label="Full Name"
          value={formData.name || ''}
          onChange={(e) => onChange({ name: e.target.value })}
          required
        />
        <Select
          label="Marital Status"
          value={formData.marital_status || ''}
          onChange={(e) => onChange({ marital_status: e.target.value })}
          options={[
            { value: '', label: 'Select marital status' },
            { value: 'Single', label: 'Single' },
            { value: 'Married', label: 'Married' },
            { value: 'Divorced', label: 'Divorced' },
            { value: 'Widowed', label: 'Widowed' },
          ]}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextField
            label="Next of Kin"
            value={formData.next_of_kin_name || ''}
            onChange={(e) => onChange({ next_of_kin_name: e.target.value })}
            placeholder="Name"
          />
          <TextField
            label="Relationship"
            value={formData.next_of_kin_relationship || ''}
            onChange={(e) => onChange({ next_of_kin_relationship: e.target.value })}
            placeholder="e.g., Brother, Spouse"
          />
        </div>
        <TextField
          label="Home Address"
          value={formData.home_address || ''}
          onChange={(e) => onChange({ home_address: e.target.value })}
          placeholder="Street address, City, State"
        />
      </div>

      {/* Professional Information */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-foreground-light dark:text-foreground-dark mt-6 mb-2">
          Professional Information
        </h4>
        <TextField
          label="Qualifications"
          value={formData.qualifications || ''}
          onChange={(e) => onChange({ qualifications: e.target.value })}
          placeholder="e.g., MD, Cardiology Fellowship"
        />
        <DateTimePicker
          label="Date Joined"
          type="date"
          value={formData.date_joined || ''}
          onChange={(e) => onChange({ date_joined: e.target.value })}
          max={new Date().toISOString().split('T')[0]}
        />
        {staffMember.role === 'Clinician' && (
          <Select
            label="Specialty"
            value={formData.specialty || ''}
            onChange={(e) => onChange({ specialty: e.target.value })}
            options={[
              { value: '', label: 'Select specialty' },
              { value: 'Cardiology', label: 'Cardiology' },
              { value: 'Pediatrics', label: 'Pediatrics' },
              { value: 'General Medicine', label: 'General Medicine' },
              { value: 'Orthopedics', label: 'Orthopedics' },
              { value: 'Neurology', label: 'Neurology' },
              { value: 'Dermatology', label: 'Dermatology' },
              { value: 'Oncology', label: 'Oncology' },
              { value: 'Psychiatry', label: 'Psychiatry' },
              { value: 'Emergency Medicine', label: 'Emergency Medicine' },
              { value: 'Internal Medicine', label: 'Internal Medicine' },
              { value: 'Surgery', label: 'Surgery' },
              { value: 'Radiology', label: 'Radiology' },
              { value: 'Anesthesiology', label: 'Anesthesiology' },
              { value: 'Pathology', label: 'Pathology' },
              { value: 'Other', label: 'Other' },
            ]}
          />
        )}
        <TextField
          label="Email"
          type="email"
          value={formData.email || ''}
          onChange={(e) => onChange({ email: e.target.value })}
        />
        <PhoneField
          label="Phone"
          value={formData.phone || ''}
          onChange={(e) => onChange({ phone: e.target.value })}
        />
      </div>
    </div>
  );
};

// Step 2: Employment/Financial Component
const Step2Employment = ({
  formData,
  onChange,
}: {
  formData: Partial<StaffUpdateData['employment']>;
  onChange: (data: Partial<StaffUpdateData['employment']>) => void;
}) => {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-foreground-light dark:text-foreground-dark mb-4">
        Employment & Financial Information
      </h3>

      {/* Bank Account Information */}
      <div className="bg-card-light dark:bg-card-dark p-4 rounded-lg border border-border-light dark:border-border-dark">
        <h4 className="text-lg font-semibold text-foreground-light dark:text-foreground-dark mb-4">
          Bank Account Information
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <TextField
            label="Bank Name"
            value={formData.bankAccount?.bankName || ''}
            onChange={(e) => onChange({
              bankAccount: { ...formData.bankAccount, bankName: e.target.value },
            })}
          />
          <TextField
            label="Account Number"
            value={formData.bankAccount?.accountNumber || ''}
            onChange={(e) => onChange({
              bankAccount: { ...formData.bankAccount, accountNumber: e.target.value },
            })}
          />
          <TextField
            label="Routing Number"
            value={formData.bankAccount?.routingNumber || ''}
            onChange={(e) => onChange({
              bankAccount: { ...formData.bankAccount, routingNumber: e.target.value },
            })}
          />
        </div>
      </div>

      {/* Salary & Benefits */}
      <div className="bg-card-light dark:bg-card-dark p-4 rounded-lg border border-border-light dark:border-border-dark">
        <h4 className="text-lg font-semibold text-foreground-light dark:text-foreground-dark mb-4">
          Salary & Benefits
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextField
            label="Base Salary"
            value={formData.salaryAndBenefits?.baseSalary || ''}
            onChange={(e) => onChange({
              salaryAndBenefits: { ...formData.salaryAndBenefits, baseSalary: e.target.value },
            })}
            placeholder="e.g., $250,000 / Annum"
          />
          <TextField
            label="Healthcare Benefits"
            value={formData.salaryAndBenefits?.healthcareBenefits || ''}
            onChange={(e) => onChange({
              salaryAndBenefits: { ...formData.salaryAndBenefits, healthcareBenefits: e.target.value },
            })}
            placeholder="e.g., Premium Family Plan"
          />
          <TextField
            label="Bonus Structure"
            value={formData.salaryAndBenefits?.bonusStructure || ''}
            onChange={(e) => onChange({
              salaryAndBenefits: { ...formData.salaryAndBenefits, bonusStructure: e.target.value },
            })}
            placeholder="e.g., Performance-based, up to 15%"
          />
          <TextField
            label="Retirement Plan"
            value={formData.salaryAndBenefits?.retirementPlan || ''}
            onChange={(e) => onChange({
              salaryAndBenefits: { ...formData.salaryAndBenefits, retirementPlan: e.target.value },
            })}
            placeholder="e.g., 401(k) with 6% Employer Match"
          />
        </div>
      </div>
    </div>
  );
};

// Step 3: Medical Info Component
const Step3Medical = ({
  formData,
  onChange,
}: {
  formData: Partial<StaffUpdateData['medical']>;
  onChange: (data: Partial<StaffUpdateData['medical']>) => void;
}) => {
  const [immunizations, setImmunizations] = useState<Array<{ name: string; status: string }>>(
    formData.immunizations || []
  );
  const [assessments, setAssessments] = useState<Array<{
    title: string;
    completedDate: string;
    status: 'Cleared' | 'Pass' | 'Negative' | 'Pending';
  }>>(formData.assessments || []);

  const addImmunization = () => {
    const newList = [...immunizations, { name: '', status: '' }];
    setImmunizations(newList);
    onChange({ immunizations: newList });
  };

  const removeImmunization = (index: number) => {
    const newList = immunizations.filter((_, i) => i !== index);
    setImmunizations(newList);
    onChange({ immunizations: newList });
  };

  const updateImmunization = (index: number, field: 'name' | 'status', value: string) => {
    const newList = [...immunizations];
    newList[index] = { ...newList[index], [field]: value };
    setImmunizations(newList);
    onChange({ immunizations: newList });
  };

  const addAssessment = () => {
    const newList = [...assessments, { title: '', completedDate: '', status: 'Pending' as const }];
    setAssessments(newList);
    onChange({ assessments: newList });
  };

  const removeAssessment = (index: number) => {
    const newList = assessments.filter((_, i) => i !== index);
    setAssessments(newList);
    onChange({ assessments: newList });
  };

  const updateAssessment = (index: number, field: string, value: any) => {
    const newList = [...assessments];
    newList[index] = { ...newList[index], [field]: value };
    setAssessments(newList);
    onChange({ assessments: newList });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-foreground-light dark:text-foreground-dark mb-4">
        Medical Information
      </h3>

      {/* Medical Conditions & Allergies */}
      <div className="bg-card-light dark:bg-card-dark p-4 rounded-lg border border-border-light dark:border-border-dark">
        <h4 className="text-lg font-semibold text-foreground-light dark:text-foreground-dark mb-4">
          Medical Conditions & Allergies
        </h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-primary mb-1">Conditions</label>
            <textarea
              value={formData.conditions || ''}
              onChange={(e) => onChange({ conditions: e.target.value })}
              placeholder="e.g., None Declared"
              rows={2}
              className="w-full rounded-lg border px-4 py-2 text-foreground-light dark:text-foreground-dark placeholder-subtle-light dark:placeholder-subtle-dark bg-background-light dark:bg-background-dark focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors border-border-light dark:border-border-dark resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-primary mb-1">Allergies</label>
            <textarea
              value={formData.allergies || ''}
              onChange={(e) => onChange({ allergies: e.target.value })}
              placeholder="e.g., Penicillin (Anaphylaxis)"
              rows={2}
              className="w-full rounded-lg border px-4 py-2 text-foreground-light dark:text-foreground-dark placeholder-subtle-light dark:placeholder-subtle-dark bg-background-light dark:bg-background-dark focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors border-border-light dark:border-border-dark resize-none"
            />
          </div>
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="bg-card-light dark:bg-card-dark p-4 rounded-lg border border-border-light dark:border-border-dark">
        <h4 className="text-lg font-semibold text-foreground-light dark:text-foreground-dark mb-4">
          Emergency Contact
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <TextField
            label="Name"
            value={formData.emergencyContact?.name || ''}
            onChange={(e) => onChange({
              emergencyContact: { ...formData.emergencyContact, name: e.target.value },
            })}
          />
          <TextField
            label="Relationship"
            value={formData.emergencyContact?.relationship || ''}
            onChange={(e) => onChange({
              emergencyContact: { ...formData.emergencyContact, relationship: e.target.value },
            })}
          />
          <TextField
            label="Contact"
            value={formData.emergencyContact?.contact || ''}
            onChange={(e) => onChange({
              emergencyContact: { ...formData.emergencyContact, contact: e.target.value },
            })}
            placeholder="Phone number"
          />
        </div>
      </div>

      {/* Immunizations */}
      <div className="bg-card-light dark:bg-card-dark p-4 rounded-lg border border-border-light dark:border-border-dark">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-foreground-light dark:text-foreground-dark">
            Immunization & Vaccination History
          </h4>
          <button
            onClick={addImmunization}
            className="px-3 py-1.5 rounded-lg bg-primary text-white text-sm hover:bg-primary/90 transition-colors flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-base">add</span>
            <span>Add</span>
          </button>
        </div>
        <div className="space-y-3">
          {immunizations.map((immunization, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-background-light dark:bg-background-dark rounded-lg">
              <TextField
                value={immunization.name}
                onChange={(e) => updateImmunization(index, 'name', e.target.value)}
                placeholder="Immunization name"
                className="flex-1"
              />
              <TextField
                value={immunization.status}
                onChange={(e) => updateImmunization(index, 'status', e.target.value)}
                placeholder="Status (e.g., Completed)"
                className="flex-1"
              />
              <button
                onClick={() => removeImmunization(index)}
                className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400"
              >
                <span className="material-symbols-outlined">delete</span>
              </button>
            </div>
          ))}
          {immunizations.length === 0 && (
            <p className="text-sm text-subtle-light dark:text-subtle-dark text-center py-4">
              No immunizations added. Click "Add" to add one.
            </p>
          )}
        </div>
      </div>

      {/* Work-Related Medical Assessments */}
      <div className="bg-card-light dark:bg-card-dark p-4 rounded-lg border border-border-light dark:border-border-dark">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-foreground-light dark:text-foreground-dark">
            Work-Related Medical Assessments
          </h4>
          <button
            onClick={addAssessment}
            className="px-3 py-1.5 rounded-lg bg-primary text-white text-sm hover:bg-primary/90 transition-colors flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-base">add</span>
            <span>Add</span>
          </button>
        </div>
        <div className="space-y-3">
          {assessments.map((assessment, index) => (
            <div key={index} className="p-3 bg-background-light dark:bg-background-dark rounded-lg space-y-3">
              <TextField
                label="Assessment Title"
                value={assessment.title}
                onChange={(e) => updateAssessment(index, 'title', e.target.value)}
                placeholder="e.g., Annual Health Screening"
              />
              <div className="grid grid-cols-2 gap-3">
                <DateTimePicker
                  label="Completed Date"
                  type="date"
                  value={assessment.completedDate}
                  onChange={(e) => updateAssessment(index, 'completedDate', e.target.value)}
                />
                <Select
                  label="Status"
                  value={assessment.status}
                  onChange={(e) => updateAssessment(index, 'status', e.target.value)}
                  options={[
                    { value: 'Cleared', label: 'Cleared' },
                    { value: 'Pass', label: 'Pass' },
                    { value: 'Negative', label: 'Negative' },
                    { value: 'Pending', label: 'Pending' },
                  ]}
                />
              </div>
              <button
                onClick={() => removeAssessment(index)}
                className="w-full px-3 py-2 rounded-lg border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors text-sm font-medium"
              >
                Remove Assessment
              </button>
            </div>
          ))}
          {assessments.length === 0 && (
            <p className="text-sm text-subtle-light dark:text-subtle-dark text-center py-4">
              No assessments added. Click "Add" to add one.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// Step 4: Patients/Reports Component (for clinicians/nurses)
const Step4PatientsReports = ({
  formData,
  onChange,
  isClinicianOrNurse,
}: {
  formData?: Partial<StaffUpdateData['patientsReports']>;
  onChange: (data: Partial<StaffUpdateData['patientsReports']>) => void;
  isClinicianOrNurse: boolean;
}) => {
  if (!isClinicianOrNurse) {
    return (
      <div className="text-center py-12">
        <p className="text-subtle-light dark:text-subtle-dark">
          This section is only applicable for clinicians and nurses.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-foreground-light dark:text-foreground-dark mb-4">
        Patients & Reports Information
      </h3>
      <div className="bg-card-light dark:bg-card-dark p-4 rounded-lg border border-border-light dark:border-border-dark">
        <p className="text-sm text-subtle-light dark:text-subtle-dark mb-4">
          Activity reports and patient assignments are typically managed through the system automatically.
          You can add notes or observations below.
        </p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-primary mb-1">Consultations</label>
            <textarea
              value={formData?.activityReport?.consultations || ''}
              onChange={(e) => onChange({
                activityReport: { ...formData?.activityReport, consultations: e.target.value },
              })}
              placeholder="e.g., 42 consultations this week."
              rows={2}
              className="w-full rounded-lg border px-4 py-2 text-foreground-light dark:text-foreground-dark placeholder-subtle-light dark:placeholder-subtle-dark bg-background-light dark:bg-background-dark focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors border-border-light dark:border-border-dark resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-primary mb-1">Procedures Performed</label>
            <textarea
              value={formData?.activityReport?.proceduresPerformed || ''}
              onChange={(e) => onChange({
                activityReport: { ...formData?.activityReport, proceduresPerformed: e.target.value },
              })}
              placeholder="e.g., 5 cardiac catheterizations, 2 angioplasties."
              rows={2}
              className="w-full rounded-lg border px-4 py-2 text-foreground-light dark:text-foreground-dark placeholder-subtle-light dark:placeholder-subtle-dark bg-background-light dark:bg-background-dark focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors border-border-light dark:border-border-dark resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-primary mb-1">Key Observations</label>
            <textarea
              value={formData?.activityReport?.keyObservations || ''}
              onChange={(e) => onChange({
                activityReport: { ...formData?.activityReport, keyObservations: e.target.value },
              })}
              placeholder="e.g., Noted an unusual trend..."
              rows={3}
              className="w-full rounded-lg border px-4 py-2 text-foreground-light dark:text-foreground-dark placeholder-subtle-light dark:placeholder-subtle-dark bg-background-light dark:bg-background-dark focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors border-border-light dark:border-border-dark resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Step 5: Documents Component
const Step5Documents = ({
  formData,
  onChange,
  hospitalId,
  staffId,
}: {
  formData: Array<{ file: File; documentType: string; description?: string }>;
  onChange: (data: Array<{ file: File; documentType: string; description?: string }>) => void;
  hospitalId: string;
  staffId: string;
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<string>('other');
  const [customCategory, setCustomCategory] = useState<string>('');
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [description, setDescription] = useState<string>('');

  const standardCategories = [
    { value: 'cv', label: 'CV' },
    { value: 'license', label: 'License' },
    { value: 'certification', label: 'Certification' },
    { value: 'employment', label: 'Employment' },
    { value: 'health', label: 'Health' },
    { value: 'contract', label: 'Contract' },
    { value: 'id', label: 'ID Card' },
    { value: 'other', label: 'Other' },
  ];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate all files
    const invalidFiles = files.filter(file => file.size > 10 * 1024 * 1024);
    if (invalidFiles.length > 0) {
      toast.error(`${invalidFiles.length} file(s) exceed 10MB limit`);
      return;
    }

    // If multiple files, add them all directly
    if (files.length > 1) {
      const newDocs = files.map(file => ({
        file,
        documentType: 'other',
        description: undefined,
      }));
      onChange([...formData, ...newDocs]);
      toast.success(`${files.length} documents added`);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    // Single file - show modal for category selection
    setSelectedFile(files[0]);
    setShowUploadModal(true);
  };

  const handleAddDocument = () => {
    if (!selectedFile) return;
    const finalType = showCustomCategory && customCategory.trim() ? customCategory.trim().toLowerCase() : documentType;
    const newDoc = {
      file: selectedFile,
      documentType: finalType,
      description: description || undefined,
    };
    onChange([...formData, newDoc]);
    setShowUploadModal(false);
    setSelectedFile(null);
    setDocumentType('other');
    setCustomCategory('');
    setShowCustomCategory(false);
    setDescription('');
    toast.success('Document added');
  };

  const removeDocument = (index: number) => {
    const newList = formData.filter((_, i) => i !== index);
    onChange(newList);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const getDocumentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      cv: 'CV',
      license: 'License',
      certification: 'Certification',
      employment: 'Employment',
      health: 'Health',
      contract: 'Contract',
      id: 'ID Card',
      other: 'Other',
    };
    if (labels[type.toLowerCase()]) {
      return labels[type.toLowerCase()];
    }
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-foreground-light dark:text-foreground-dark mb-4">
        Upload Documents
      </h3>

      <div className="bg-card-light dark:bg-card-dark p-4 rounded-lg border border-border-light dark:border-border-dark">
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          className="hidden"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full px-4 py-3 rounded-lg border-2 border-dashed border-primary/50 bg-primary/5 dark:bg-primary/10 hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors flex items-center justify-center gap-2 font-medium text-primary"
        >
          <span className="material-symbols-outlined">upload</span>
          <span>Add Documents (Multiple files allowed)</span>
        </button>
      </div>

      {/* Documents List */}
      {formData.length > 0 && (
        <div className="space-y-3">
          {formData.map((doc, index) => (
            <div
              key={index}
              className="p-4 bg-background-light dark:bg-background-dark rounded-lg border border-border-light dark:border-border-dark flex items-center justify-between"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="material-symbols-outlined text-primary text-2xl">description</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground-light dark:text-foreground-dark truncate">
                    {doc.file.name}
                  </p>
                  <div className="flex items-center gap-3 text-sm text-subtle-light dark:text-subtle-dark">
                    <span>{getDocumentTypeLabel(doc.documentType)}</span>
                    <span>•</span>
                    <span>{formatFileSize(doc.file.size)}</span>
                  </div>
                  {doc.description && (
                    <p className="text-xs text-subtle-light dark:text-subtle-dark mt-1">
                      {doc.description}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => removeDocument(index)}
                className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 flex-shrink-0"
              >
                <span className="material-symbols-outlined">delete</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {formData.length === 0 && (
        <div className="text-center py-12 bg-card-light dark:bg-card-dark rounded-lg border border-border-light dark:border-border-dark">
          <p className="text-subtle-light dark:text-subtle-dark">
            No documents added yet. Click "Add Document" to upload files.
          </p>
        </div>
      )}

      {/* Upload Modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => {
          setShowUploadModal(false);
          setSelectedFile(null);
          setDocumentType('other');
          setCustomCategory('');
          setShowCustomCategory(false);
          setDescription('');
        }}
        title="Add Document"
      >
        <div className="space-y-4">
          {selectedFile && (
            <div className="p-4 bg-background-light dark:bg-background-dark rounded-lg border border-border-light dark:border-border-dark">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-2xl">description</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground-light dark:text-foreground-dark truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-sm text-subtle-light dark:text-subtle-dark">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
              </div>
            </div>
          )}

          <Select
            label="Document Category"
            value={showCustomCategory ? 'custom' : documentType}
            onChange={(e) => {
              if (e.target.value === 'custom') {
                setShowCustomCategory(true);
                setDocumentType('other');
              } else {
                setShowCustomCategory(false);
                setDocumentType(e.target.value);
              }
            }}
            options={[
              ...standardCategories,
              { value: 'custom', label: '+ Create New Category' },
            ]}
          />

          {showCustomCategory && (
            <TextField
              label="Custom Category Name"
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              placeholder="Enter category name"
              required
            />
          )}

          <div className="w-full">
            <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-2">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description for this document"
              rows={2}
              className="w-full rounded-lg border px-4 py-2 text-foreground-light dark:text-foreground-dark placeholder-subtle-light dark:placeholder-subtle-dark bg-background-light dark:bg-background-dark focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors border-border-light dark:border-border-dark resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => {
                setShowUploadModal(false);
                setSelectedFile(null);
                setDocumentType('other');
                setCustomCategory('');
                setShowCustomCategory(false);
                setDescription('');
              }}
              className="px-4 py-2 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleAddDocument}
              disabled={!selectedFile || (showCustomCategory && !customCategory.trim())}
              className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Document
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

/**
 * Staff Profile Page
 * 
 * Features:
 * - View and edit staff member information
 * - Tabs: Overview, Employment/Financial, Medical Info, Patients/Reports, Documents
 * - Overview tab with Personal Information, Professional Information, and Profile Picture
 */
const StaffProfile = () => {
  const { category, staffId } = useParams<{ category: string; staffId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const hospitalId = user?.hospital_id || '1';

  // Convert route format back to role name
  const roleName = useMemo(() => {
    if (!category) return '';
    const nameMap: Record<string, string> = {
      'support-staff': 'Support Staff',
      'clinicians': 'Clinician',
      'nurse': 'Nurse',
      'nurses': 'Nurse',
      'security': 'Security',
      'receptionist': 'Receptionist',
      'receptionists': 'Receptionist',
      'clinician': 'Clinician',
    };
    if (nameMap[category]) return nameMap[category];
    return category
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }, [category]);

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [formData, setFormData] = useState({
    name: '',
    specialty: '',
    email: '',
    phone: '',
    marital_status: '',
    next_of_kin_name: '',
    next_of_kin_relationship: '',
    home_address: '',
    qualifications: '',
    date_joined: '',
  });
  const [profilePicture, setProfilePicture] = useState<string | undefined>(undefined);
  const [isUploadingPicture, setIsUploadingPicture] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showUpdateWizard, setShowUpdateWizard] = useState(false);

  // Fetch all staff to find the specific member
  const { data: allStaff = [], isLoading, error } = useQuery<Clinician[]>({
    queryKey: ['hospital', 'clinicians', hospitalId],
    queryFn: async () => {
      try {
        const result = await HospitalAPI.listClinicians(hospitalId);
        return Array.isArray(result) ? result : [];
      } catch (err) {
        console.error('Error fetching staff:', err);
        return [];
      }
    },
  });

  // Find the specific staff member
  const staffMember = allStaff.find((s) => s.id === Number(staffId));

  // Initialize form data
  useEffect(() => {
    if (staffMember) {
      const specialtyValue = Array.isArray(staffMember.specialty) 
        ? staffMember.specialty.join(', ') 
        : (staffMember.specialty || '');
      setFormData({
        name: staffMember.name || '',
        specialty: specialtyValue,
        email: staffMember.email || '',
        phone: staffMember.phone || '',
        marital_status: staffMember.marital_status || '',
        next_of_kin_name: staffMember.next_of_kin?.name || '',
        next_of_kin_relationship: staffMember.next_of_kin?.relationship || '',
        home_address: staffMember.home_address || '',
        qualifications: staffMember.qualifications || '',
        date_joined: staffMember.date_joined || '',
      });
      setProfilePicture(staffMember.profile_picture);
    }
  }, [staffMember]);

  // Update staff mutation
  const updateMutation = useMutation({
    mutationFn: (payload: any) => {
      if (!staffId) throw new Error('Staff ID is required');
      return HospitalAPI.updateClinician(hospitalId, staffId, payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['hospital', 'clinicians'], exact: false });
      await queryClient.invalidateQueries({ queryKey: ['hospital', 'staff-roles'], exact: false });
      toast.success('Staff information updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update staff member');
    },
  });

  // Upload profile picture mutation
  const uploadPictureMutation = useMutation({
    mutationFn: (file: File) => {
      if (!staffId) throw new Error('Staff ID is required');
      return HospitalAPI.uploadStaffProfilePicture(hospitalId, staffId, file);
    },
    onSuccess: async (data) => {
      setProfilePicture(data.profile_picture);
      await queryClient.invalidateQueries({ queryKey: ['hospital', 'clinicians'], exact: false });
      toast.success('Profile picture updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to upload profile picture');
    },
  });

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('File must be an image');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setIsUploadingPicture(true);
    try {
      await uploadPictureMutation.mutateAsync(file);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      // Error is handled by mutation
    } finally {
      setIsUploadingPicture(false);
    }
  };

  // Handle form submission
  const handleUpdateInformation = () => {
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }
    
    // Validate email format if provided
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    updateMutation.mutate({
      name: formData.name.trim(),
      specialty: formData.specialty || undefined,
      email: formData.email.trim() || undefined,
      phone: formData.phone.trim() || undefined,
      marital_status: formData.marital_status || undefined,
      next_of_kin: formData.next_of_kin_name || formData.next_of_kin_relationship
        ? {
            name: formData.next_of_kin_name || undefined,
            relationship: formData.next_of_kin_relationship || undefined,
          }
        : undefined,
      home_address: formData.home_address || undefined,
      qualifications: formData.qualifications || undefined,
      date_joined: formData.date_joined || undefined,
    });
  };

  if (isLoading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[400px]">
          <Spinner size="lg" />
        </div>
      </AppShell>
    );
  }

  if (error || !staffMember) {
    return (
      <AppShell>
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-700 dark:text-red-300">
              Staff member not found. Please check the staff ID.
            </p>
            <button
              onClick={() => navigate(`/hospital/staff/${category}`)}
              className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Back to {roleName}
            </button>
          </div>
        </div>
      </AppShell>
    );
  }

  // Extract staff name with fallback
  const staffFullName = staffMember.name || 'Unknown Staff';

  // Determine if staff is a clinician or nurse
  const isClinicianOrNurse = useMemo(() => {
    const role = staffMember.role?.toLowerCase() || '';
    return role === 'clinician' || role === 'nurse' || role === 'nurses';
  }, [staffMember.role]);

  // Determine the tab label for Patients/Reports
  const patientsReportsTabLabel = isClinicianOrNurse ? 'Patients/Reports' : 'Reports';

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          {/* Breadcrumb */}
          <div className="mb-4 flex items-center gap-2 text-sm text-subtle-light dark:text-subtle-dark">
            <button
              onClick={() => navigate('/hospital/staff')}
              className="hover:text-foreground-light dark:hover:text-foreground-dark transition-colors"
            >
              Staff
            </button>
            <span>/</span>
            <button
              onClick={() => navigate(`/hospital/staff/${category}`)}
              className="hover:text-foreground-light dark:hover:text-foreground-dark transition-colors"
            >
              {roleName}
            </button>
          </div>

          {/* Title and Update Button */}
          <div className="flex items-start justify-between">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground-light dark:text-foreground-dark">
              {staffFullName}
            </h1>
            <button
              onClick={() => setShowUpdateWizard(true)}
              className="h-11 px-4 rounded-lg font-semibold bg-primary text-white shadow-soft hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-base">edit</span>
              <span>Update Information</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-border-light dark:border-border-dark mb-8">
          <nav className="flex space-x-8 overflow-x-auto">
            {[
              { id: 'overview' as TabType, label: 'Overview' },
              { id: 'employment' as TabType, label: 'Employment/Financial' },
              { id: 'medical' as TabType, label: 'Medical Info' },
              { id: 'patients' as TabType, label: patientsReportsTabLabel },
              { id: 'documents' as TabType, label: 'Documents' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  'px-1 py-4 border-b-2 font-semibold transition-colors whitespace-nowrap',
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-subtle-light dark:text-subtle-dark hover:text-primary hover:border-primary/50'
                )}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - 2/3 width */}
            <div className="lg:col-span-2 space-y-8">
              {/* Personal Information Card */}
              <div className="bg-card-light dark:bg-card-dark p-6 rounded-xl shadow-soft">
                <h3 className="text-xl font-semibold mb-6 text-foreground-light dark:text-foreground-dark">
                  Personal Information
                </h3>
                <div className="space-y-4">
                  <TextField
                    label="Full Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                  <Select
                    label="Marital Status"
                    value={formData.marital_status}
                    onChange={(e) => setFormData({ ...formData, marital_status: e.target.value })}
                    options={[
                      { value: '', label: 'Select marital status' },
                      { value: 'Single', label: 'Single' },
                      { value: 'Married', label: 'Married' },
                      { value: 'Divorced', label: 'Divorced' },
                      { value: 'Widowed', label: 'Widowed' },
                    ]}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <TextField
                      label="Next of Kin"
                      value={formData.next_of_kin_name}
                      onChange={(e) => setFormData({ ...formData, next_of_kin_name: e.target.value })}
                      placeholder="Name"
                    />
                    <TextField
                      label="Relationship"
                      value={formData.next_of_kin_relationship}
                      onChange={(e) => setFormData({ ...formData, next_of_kin_relationship: e.target.value })}
                      placeholder="e.g., Brother, Spouse"
                    />
                  </div>
                  <TextField
                    label="Home Address"
                    value={formData.home_address}
                    onChange={(e) => setFormData({ ...formData, home_address: e.target.value })}
                    placeholder="Street address, City, State"
                  />
                </div>
              </div>

              {/* Professional Information Card */}
              <div className="bg-card-light dark:bg-card-dark p-6 rounded-xl shadow-soft">
                <h3 className="text-xl font-semibold mb-6 text-foreground-light dark:text-foreground-dark">
                  Professional Information
                </h3>
                <div className="space-y-4">
                  <TextField
                    label="Qualifications"
                    value={formData.qualifications}
                    onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })}
                    placeholder="e.g., MD, Cardiology Fellowship"
                  />
                  <DateTimePicker
                    label="Date Joined"
                    type="date"
                    value={formData.date_joined}
                    onChange={(e) => setFormData({ ...formData, date_joined: e.target.value })}
                    max={new Date().toISOString().split('T')[0]}
                  />
                  {staffMember.role === 'Clinician' && (
                    <Select
                      label="Specialty"
                      value={formData.specialty}
                      onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                      options={[
                        { value: '', label: 'Select specialty' },
                        { value: 'Cardiology', label: 'Cardiology' },
                        { value: 'Pediatrics', label: 'Pediatrics' },
                        { value: 'General Medicine', label: 'General Medicine' },
                        { value: 'Orthopedics', label: 'Orthopedics' },
                        { value: 'Neurology', label: 'Neurology' },
                        { value: 'Dermatology', label: 'Dermatology' },
                        { value: 'Oncology', label: 'Oncology' },
                        { value: 'Psychiatry', label: 'Psychiatry' },
                        { value: 'Emergency Medicine', label: 'Emergency Medicine' },
                        { value: 'Internal Medicine', label: 'Internal Medicine' },
                        { value: 'Surgery', label: 'Surgery' },
                        { value: 'Radiology', label: 'Radiology' },
                        { value: 'Anesthesiology', label: 'Anesthesiology' },
                        { value: 'Pathology', label: 'Pathology' },
                        { value: 'Other', label: 'Other' },
                      ]}
                    />
                  )}
                  <TextField
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                  <PhoneField
                    label="Phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Right Column - 1/3 width */}
            <div className="space-y-8">
              {/* Profile Picture Card */}
              <div className="bg-card-light dark:bg-card-dark p-6 rounded-xl shadow-soft">
                <h3 className="text-xl font-semibold mb-6 text-foreground-light dark:text-foreground-dark">
                  Profile Picture
                </h3>
                <div className="flex items-center justify-center">
                  <div className="w-full max-w-[280px] aspect-[3/4] rounded-lg border-2 border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center overflow-hidden relative">
                    {profilePicture ? (
                      <img
                        src={profilePicture}
                        alt={staffFullName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-subtle-light dark:text-subtle-dark">
                        <span className="material-symbols-outlined text-8xl">person</span>
                      </div>
                    )}
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="profile-picture-upload"
                  disabled={isUploadingPicture}
                />
                <label
                  htmlFor="profile-picture-upload"
                  className={clsx(
                    "mt-4 w-full h-11 px-4 rounded-lg font-semibold bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark text-foreground-light dark:text-foreground-dark hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 cursor-pointer",
                    isUploadingPicture && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {isUploadingPicture ? (
                    <>
                      <Spinner size="sm" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-base">photo_camera</span>
                      <span>{profilePicture ? 'Change Picture' : 'Upload Picture'}</span>
                    </>
                  )}
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Employment/Financial Tab */}
        {activeTab === 'employment' && <EmploymentFinancialTab hospitalId={hospitalId} staffId={staffId || ''} />}

        {/* Medical Info Tab */}
        {activeTab === 'medical' && <MedicalInfoTab hospitalId={hospitalId} staffId={staffId || ''} />}

        {/* Patients/Reports Tab */}
        {activeTab === 'patients' && (
          isClinicianOrNurse ? (
            <PatientsReportsTab 
              hospitalId={hospitalId} 
              staffId={staffId || ''} 
              staffName={staffFullName}
              category={category}
            />
          ) : (
            <ReportsTab 
              hospitalId={hospitalId} 
              staffId={staffId || ''} 
              staffName={staffFullName}
              staffRole={staffMember.role || 'Staff'}
            />
          )
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <DocumentsTab hospitalId={hospitalId} staffId={staffId || ''} />
        )}
      </div>

      {/* Update Information Wizard */}
      {staffMember && (
        <UpdateInformationWizard
          isOpen={showUpdateWizard}
          onClose={() => setShowUpdateWizard(false)}
          hospitalId={hospitalId}
          staffId={staffId || ''}
          staffMember={staffMember}
          onComplete={async () => {
            await queryClient.invalidateQueries({ queryKey: ['hospital', 'clinicians'], exact: false });
            await queryClient.invalidateQueries({ queryKey: ['hospital', 'staff'], exact: false });
          }}
        />
      )}
    </AppShell>
  );
};

export default StaffProfile;
