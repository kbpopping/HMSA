import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ProfileState = {
  name: string;
  email: string;
  profilePicture: string;
  updateProfile: (data: { name?: string; email?: string; profilePicture?: string }) => void;
  resetProfile: () => void;
};

/**
 * Profile Store - Manages user profile data
 * 
 * PRODUCTION: Sync with backend API on update
 */
export const useProfile = create<ProfileState>()(
  persist(
    (set) => ({
      name: 'Dr. Evelyn Reed',
      email: 'admin@hospital.com',
      profilePicture: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDOqNgv11Cnx2gmDnVO9M-ENpIeWQ4-ObRIMQ_Y1gI_8CvEaffQ5lrgbIsxm2qKqUg0ZFYnioS-cujcfnL8cs8fCmnZXH6EPe1nzpqn7b_P-PjcChca2JfrTSqrVQ12K21tfWOuO4vJ1oV9K4DT8kp99K1pJ3MSbC_3unW4Dt1ghHcbRglxdUWleC5s5Lk4C31EVzKvI8kuCuSte9RIMzdxi1RuAgiec0d9u4kR_r1TiLL-rvudIsOsdJlLDGPTUoDydbTDTl9CYIU',
      
      updateProfile: (data) => {
        set((state) => ({
          ...state,
          ...data,
        }));
      },
      
      resetProfile: () => {
        set({
          name: 'Dr. Evelyn Reed',
          email: 'admin@hospital.com',
          profilePicture: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDOqNgv11Cnx2gmDnVO9M-ENpIeWQ4-ObRIMQ_Y1gI_8CvEaffQ5lrgbIsxm2qKqUg0ZFYnioS-cujcfnL8cs8fCmnZXH6EPe1nzpqn7b_P-PjcChca2JfrTSqrVQ12K21tfWOuO4vJ1oV9K4DT8kp99K1pJ3MSbC_3unW4Dt1ghHcbRglxdUWleC5s5Lk4C31EVzKvI8kuCuSte9RIMzdxi1RuAgiec0d9u4kR_r1TiLL-rvudIsOsdJlLDGPTUoDydbTDTl9CYIU',
        });
      },
    }),
    {
      name: 'hospital-profile-storage',
    }
  )
);

