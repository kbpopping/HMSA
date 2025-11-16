import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '../../store/auth';
import { useOnboarding, type OnboardingStep as StepType } from '../../store/onboarding';
import { ClinicianAPI } from '../../api/endpoints';
import OnboardingWizard from '../../components/onboarding/OnboardingWizard';
import OnboardingStep from '../../components/onboarding/OnboardingStep';

const stepTitles = ['Welcome', 'Personal', 'Professional', 'Documents', 'Availability', 'Tour', 'Complete'];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { user, markOnboardingComplete } = useAuth();
  const { currentStep, setStep, nextStep, previousStep, data, updateData, complete } = useOnboarding();
  
  const [currentStepIndex, setCurrentStepIndex] = useState(1);
  const [formData, setFormData] = useState({
    // Personal info
    name: '',
    email: '',
    phone: '',
    address: '',
    emergency_contact_name: '',
    emergency_contact_relationship: '',
    emergency_contact_phone: '',
    
    // Professional info
    specialty: '',
    qualifications: '',
    certifications: '',
    years_of_experience: '',
    
    // Availability
    monday_available: true,
    monday_start: '09:00',
    monday_end: '17:00',
    tuesday_available: true,
    tuesday_start: '09:00',
    tuesday_end: '17:00',
    wednesday_available: true,
    wednesday_start: '09:00',
    wednesday_end: '17:00',
    thursday_available: true,
    thursday_start: '09:00',
    thursday_end: '17:00',
    friday_available: true,
    friday_start: '09:00',
    friday_end: '17:00',
    saturday_available: false,
    saturday_start: '09:00',
    saturday_end: '17:00',
    sunday_available: false,
    sunday_start: '09:00',
    sunday_end: '17:00',
    preferred_duration: '30',
    
    // Tour preference
    take_tour: false,
  });
  
  // Fetch clinician profile to pre-fill data
  const { data: profile } = useQuery({
    queryKey: ['clinician-profile', user?.hospital_id, user?.id],
    queryFn: () => ClinicianAPI.getProfile(user!.hospital_id, user!.id),
    enabled: !!user?.hospital_id && !!user?.id,
  });
  
  // Pre-fill form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData(prev => ({
        ...prev,
        name: profile.name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        address: profile.home_address || '',
        specialty: Array.isArray(profile.specialty) ? profile.specialty.join(', ') : profile.specialty || '',
        qualifications: profile.qualifications || '',
      }));
    }
  }, [profile]);
  
  // Complete onboarding mutation
  const completeOnboardingMutation = useMutation({
    mutationFn: () => ClinicianAPI.completeOnboarding(user!.hospital_id, user!.id),
    onSuccess: () => {
      complete();
      markOnboardingComplete();
      toast.success('Onboarding complete! Welcome to HMSA Clinician Portal');
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 1000);
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to complete onboarding');
    },
  });
  
  const handleNext = () => {
    if (currentStepIndex < stepTitles.length) {
      setCurrentStepIndex(prev => prev + 1);
      nextStep();
    }
  };
  
  const handlePrevious = () => {
    if (currentStepIndex > 1) {
      setCurrentStepIndex(prev => prev - 1);
      previousStep();
    }
  };
  
  const handleComplete = () => {
    completeOnboardingMutation.mutate();
  };
  
  const renderStepContent = () => {
    switch (currentStepIndex) {
      case 1:
        return (
          <OnboardingStep
            title="Welcome to HMSA Clinician Portal!"
            description="Let's get you set up in just a few steps"
          >
            <div className="space-y-6">
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-primary/10 rounded-full mb-6">
                  <span className="material-symbols-outlined text-5xl text-primary">
                    waving_hand
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-foreground-light dark:text-foreground-dark mb-4">
                  Hello, {user?.name || 'there'}!
                </h3>
                <p className="text-subtle-light dark:text-subtle-dark max-w-md mx-auto">
                  We're excited to have you on board. This quick setup will help you get the most out of the platform.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-background-light dark:bg-background-dark rounded-lg text-center">
                  <span className="material-symbols-outlined text-3xl text-primary mb-2 block">
                    person
                  </span>
                  <h4 className="font-semibold text-foreground-light dark:text-foreground-dark mb-1">
                    Personal Info
                  </h4>
                  <p className="text-sm text-subtle-light dark:text-subtle-dark">
                    Update your profile
                  </p>
                </div>
                
                <div className="p-4 bg-background-light dark:bg-background-dark rounded-lg text-center">
                  <span className="material-symbols-outlined text-3xl text-primary mb-2 block">
                    work
                  </span>
                  <h4 className="font-semibold text-foreground-light dark:text-foreground-dark mb-1">
                    Professional Details
                  </h4>
                  <p className="text-sm text-subtle-light dark:text-subtle-dark">
                    Share your expertise
                  </p>
                </div>
                
                <div className="p-4 bg-background-light dark:bg-background-dark rounded-lg text-center">
                  <span className="material-symbols-outlined text-3xl text-primary mb-2 block">
                    schedule
                  </span>
                  <h4 className="font-semibold text-foreground-light dark:text-foreground-dark mb-1">
                    Set Availability
                  </h4>
                  <p className="text-sm text-subtle-light dark:text-subtle-dark">
                    Define your schedule
                  </p>
                </div>
              </div>
            </div>
          </OnboardingStep>
        );
      
      case 2:
        return (
          <OnboardingStep
            title="Personal Information"
            description="Review and update your personal details"
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full h-12 px-4 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full h-12 px-4 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full h-12 px-4 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full h-12 px-4 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Your address"
                  />
                </div>
              </div>
              
              <div className="border-t border-border-light dark:border-border-dark pt-4 mt-6">
                <h4 className="font-semibold text-foreground-light dark:text-foreground-dark mb-4">
                  Emergency Contact
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      value={formData.emergency_contact_name}
                      onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })}
                      className="w-full h-12 px-4 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Contact name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-2">
                      Relationship
                    </label>
                    <input
                      type="text"
                      value={formData.emergency_contact_relationship}
                      onChange={(e) => setFormData({ ...formData, emergency_contact_relationship: e.target.value })}
                      className="w-full h-12 px-4 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="e.g., Spouse"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.emergency_contact_phone}
                      onChange={(e) => setFormData({ ...formData, emergency_contact_phone: e.target.value })}
                      className="w-full h-12 px-4 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>
              </div>
            </div>
          </OnboardingStep>
        );
      
      case 3:
        return (
          <OnboardingStep
            title="Professional Information"
            description="Tell us about your expertise and qualifications"
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-2">
                  Specialty
                </label>
                <input
                  type="text"
                  value={formData.specialty}
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                  className="w-full h-12 px-4 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., Cardiology, Internal Medicine"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-2">
                  Qualifications
                </label>
                <textarea
                  value={formData.qualifications}
                  onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  placeholder="e.g., MD, Board Certified in Cardiology"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-2">
                  Certifications
                </label>
                <textarea
                  value={formData.certifications}
                  onChange={(e) => setFormData({ ...formData, certifications: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  placeholder="List your certifications, licenses, and credentials"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-2">
                  Years of Experience
                </label>
                <input
                  type="number"
                  value={formData.years_of_experience}
                  onChange={(e) => setFormData({ ...formData, years_of_experience: e.target.value })}
                  className="w-full h-12 px-4 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., 10"
                  min="0"
                />
              </div>
            </div>
          </OnboardingStep>
        );
      
      case 4:
        return (
          <OnboardingStep
            title="Document Upload"
            description="Upload important documents (optional for now)"
          >
            <div className="space-y-4">
              <div className="p-8 border-2 border-dashed border-border-light dark:border-border-dark rounded-lg text-center">
                <span className="material-symbols-outlined text-5xl text-subtle-light dark:text-subtle-dark mb-4 block">
                  upload_file
                </span>
                <p className="text-foreground-light dark:text-foreground-dark mb-2">
                  You can upload documents later in Settings
                </p>
                <p className="text-sm text-subtle-light dark:text-subtle-dark">
                  Documents include: Certificates, Licenses, ID, Contracts, etc.
                </p>
              </div>
              
              <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary flex-shrink-0">
                    info
                  </span>
                  <p className="text-sm text-foreground-light dark:text-foreground-dark">
                    Don't worry! You can skip this step now and upload your documents anytime from the Settings page.
                  </p>
                </div>
              </div>
            </div>
          </OnboardingStep>
        );
      
      case 5:
        return (
          <OnboardingStep
            title="Availability & Preferences"
            description="Set your default working hours"
          >
            <div className="space-y-4">
              <div className="space-y-3">
                {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => {
                  const dayKey = day as 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
                  const availableKey = `${day}_available` as keyof typeof formData;
                  const startKey = `${day}_start` as keyof typeof formData;
                  const endKey = `${day}_end` as keyof typeof formData;
                  
                  return (
                    <div key={day} className="flex items-center gap-4 p-3 bg-background-light dark:bg-background-dark rounded-lg">
                      <label className="flex items-center gap-2 flex-shrink-0 w-32">
                        <input
                          type="checkbox"
                          checked={formData[availableKey] as boolean}
                          onChange={(e) => setFormData({ ...formData, [availableKey]: e.target.checked })}
                          className="w-4 h-4 rounded border-border-light dark:border-border-dark text-primary focus:ring-primary"
                        />
                        <span className="text-sm font-medium text-foreground-light dark:text-foreground-dark capitalize">
                          {day}
                        </span>
                      </label>
                      
                      {formData[availableKey] && (
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="time"
                            value={formData[startKey] as string}
                            onChange={(e) => setFormData({ ...formData, [startKey]: e.target.value })}
                            className="flex-1 h-10 px-3 rounded border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark text-foreground-light dark:text-foreground-dark focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                          <span className="text-subtle-light dark:text-subtle-dark">to</span>
                          <input
                            type="time"
                            value={formData[endKey] as string}
                            onChange={(e) => setFormData({ ...formData, [endKey]: e.target.value })}
                            className="flex-1 h-10 px-3 rounded border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark text-foreground-light dark:text-foreground-dark focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-2">
                  Preferred Appointment Duration (minutes)
                </label>
                <input
                  type="number"
                  value={formData.preferred_duration}
                  onChange={(e) => setFormData({ ...formData, preferred_duration: e.target.value })}
                  className="w-full h-12 px-4 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="30"
                  min="15"
                  step="15"
                />
              </div>
            </div>
          </OnboardingStep>
        );
      
      case 6:
        return (
          <OnboardingStep
            title="Take a Quick Tour?"
            description="Get familiar with the platform"
          >
            <div className="space-y-6">
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-primary/10 rounded-full mb-6">
                  <span className="material-symbols-outlined text-5xl text-primary">
                    explore
                  </span>
                </div>
                <p className="text-subtle-light dark:text-subtle-dark max-w-md mx-auto">
                  Would you like a quick tour of the key features? It only takes a minute!
                </p>
              </div>
              
              <label className="flex items-center justify-center gap-3 p-4 bg-background-light dark:bg-background-dark rounded-lg cursor-pointer hover:bg-primary/5 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.take_tour}
                  onChange={(e) => setFormData({ ...formData, take_tour: e.target.checked })}
                  className="w-5 h-5 rounded border-border-light dark:border-border-dark text-primary focus:ring-primary"
                />
                <span className="text-foreground-light dark:text-foreground-dark font-medium">
                  Yes, show me around!
                </span>
              </label>
            </div>
          </OnboardingStep>
        );
      
      case 7:
        return (
          <OnboardingStep
            title="You're All Set!"
            description="Ready to start using HMSA Clinician Portal"
          >
            <div className="space-y-6">
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 dark:bg-green-900/20 rounded-full mb-6">
                  <span className="material-symbols-outlined text-5xl text-green-600 dark:text-green-400">
                    check_circle
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-foreground-light dark:text-foreground-dark mb-4">
                  Onboarding Complete!
                </h3>
                <p className="text-subtle-light dark:text-subtle-dark max-w-md mx-auto">
                  You're ready to access your dashboard and start managing your appointments, patients, and more.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-background-light dark:bg-background-dark rounded-lg">
                  <span className="material-symbols-outlined text-2xl text-primary mb-2 block">
                    event
                  </span>
                  <h4 className="font-semibold text-foreground-light dark:text-foreground-dark mb-1">
                    View Appointments
                  </h4>
                  <p className="text-sm text-subtle-light dark:text-subtle-dark">
                    Check your schedule and upcoming appointments
                  </p>
                </div>
                
                <div className="p-4 bg-background-light dark:bg-background-dark rounded-lg">
                  <span className="material-symbols-outlined text-2xl text-primary mb-2 block">
                    groups
                  </span>
                  <h4 className="font-semibold text-foreground-light dark:text-foreground-dark mb-1">
                    Manage Patients
                  </h4>
                  <p className="text-sm text-subtle-light dark:text-subtle-dark">
                    Access patient records and health information
                  </p>
                </div>
                
                <div className="p-4 bg-background-light dark:bg-background-dark rounded-lg">
                  <span className="material-symbols-outlined text-2xl text-primary mb-2 block">
                    payments
                  </span>
                  <h4 className="font-semibold text-foreground-light dark:text-foreground-dark mb-1">
                    Track Earnings
                  </h4>
                  <p className="text-sm text-subtle-light dark:text-subtle-dark">
                    Monitor your salary and earnings reports
                  </p>
                </div>
                
                <div className="p-4 bg-background-light dark:bg-background-dark rounded-lg">
                  <span className="material-symbols-outlined text-2xl text-primary mb-2 block">
                    settings
                  </span>
                  <h4 className="font-semibold text-foreground-light dark:text-foreground-dark mb-1">
                    Customize Settings
                  </h4>
                  <p className="text-sm text-subtle-light dark:text-subtle-dark">
                    Update your profile and preferences anytime
                  </p>
                </div>
              </div>
            </div>
          </OnboardingStep>
        );
      
      default:
        return null;
    }
  };
  
  return (
    <OnboardingWizard
      currentStep={currentStepIndex}
      totalSteps={stepTitles.length}
      stepTitles={stepTitles}
      onNext={currentStepIndex < stepTitles.length ? handleNext : undefined}
      onPrevious={currentStepIndex > 1 ? handlePrevious : undefined}
      nextLabel={currentStepIndex === stepTitles.length ? 'Get Started' : 'Continue'}
      nextDisabled={false}
      isLoading={completeOnboardingMutation.isPending}
    >
      {currentStepIndex === stepTitles.length && completeOnboardingMutation.isPending ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-subtle-light dark:text-subtle-dark">Setting up your account...</p>
        </div>
      ) : (
        <>
          {currentStepIndex < stepTitles.length ? (
            renderStepContent()
          ) : (
            <>
              {renderStepContent()}
              <div className="mt-6">
                <button
                  onClick={handleComplete}
                  disabled={completeOnboardingMutation.isPending}
                  className="w-full h-14 bg-primary text-white rounded-lg font-semibold text-lg shadow-soft-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {completeOnboardingMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      <span>Setting up...</span>
                    </>
                  ) : (
                    <>
                      <span>Go to Dashboard</span>
                      <span className="material-symbols-outlined">arrow_forward</span>
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </>
      )}
    </OnboardingWizard>
  );
}

