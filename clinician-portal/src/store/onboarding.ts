import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type OnboardingStep = 
  | 'welcome'
  | 'personal-info'
  | 'professional-info'
  | 'documents'
  | 'availability'
  | 'app-tour'
  | 'complete';

type OnboardingData = {
  // Personal Info
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  emergency_contact?: {
    name?: string;
    relationship?: string;
    phone?: string;
  };
  profile_picture?: string;
  
  // Professional Info
  specialty?: string | string[];
  qualifications?: string;
  certifications?: string[];
  years_of_experience?: number;
  
  // Documents
  documents?: Array<{ id: string; name: string; type: string }>;
  
  // Availability
  availability?: {
    monday?: { available: boolean; startTime?: string; endTime?: string };
    tuesday?: { available: boolean; startTime?: string; endTime?: string };
    wednesday?: { available: boolean; startTime?: string; endTime?: string };
    thursday?: { available: boolean; startTime?: string; endTime?: string };
    friday?: { available: boolean; startTime?: string; endTime?: string };
    saturday?: { available: boolean; startTime?: string; endTime?: string };
    sunday?: { available: boolean; startTime?: string; endTime?: string };
    preferredDuration?: number;
  };
  
  // App Tour
  takeTour?: boolean;
};

type OnboardingState = {
  isComplete: boolean;
  currentStep: OnboardingStep;
  data: OnboardingData;
  
  // Actions
  setStep: (step: OnboardingStep) => void;
  nextStep: () => void;
  previousStep: () => void;
  updateData: (data: Partial<OnboardingData>) => void;
  complete: () => void;
  reset: () => void;
};

const steps: OnboardingStep[] = [
  'welcome',
  'personal-info',
  'professional-info',
  'documents',
  'availability',
  'app-tour',
  'complete',
];

export const useOnboarding = create<OnboardingState>()(
  persist(
    (set, get) => ({
      isComplete: false,
      currentStep: 'welcome',
      data: {},
      
      setStep: (step: OnboardingStep) => {
        set({ currentStep: step });
      },
      
      nextStep: () => {
        const { currentStep } = get();
        const currentIndex = steps.indexOf(currentStep);
        if (currentIndex < steps.length - 1) {
          set({ currentStep: steps[currentIndex + 1] });
        }
      },
      
      previousStep: () => {
        const { currentStep } = get();
        const currentIndex = steps.indexOf(currentStep);
        if (currentIndex > 0) {
          set({ currentStep: steps[currentIndex - 1] });
        }
      },
      
      updateData: (newData: Partial<OnboardingData>) => {
        const { data } = get();
        set({
          data: {
            ...data,
            ...newData,
          },
        });
      },
      
      complete: () => {
        set({ isComplete: true, currentStep: 'complete' });
      },
      
      reset: () => {
        set({
          isComplete: false,
          currentStep: 'welcome',
          data: {},
        });
      },
    }),
    {
      name: 'clinician-onboarding-storage',
    }
  )
);

