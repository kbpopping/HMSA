import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type TwoFactorState = {
  enabled: boolean;
  method: 'google' | 'authenticator' | null;
  secret?: string; // QR code secret for authenticator
  backupCodes?: string[]; // Backup codes
  enable2FA: (method: 'google' | 'authenticator', secret?: string) => void;
  disable2FA: () => void;
  setBackupCodes: (codes: string[]) => void;
};

/**
 * Two-Factor Authentication Store
 * 
 * PRODUCTION: Sync with backend API
 */
export const use2FA = create<TwoFactorState>()(
  persist(
    (set) => ({
      enabled: false,
      method: null,
      secret: undefined,
      backupCodes: undefined,
      
      enable2FA: (method, secret) => {
        set({
          enabled: true,
          method,
          secret,
        });
      },
      
      disable2FA: () => {
        set({
          enabled: false,
          method: null,
          secret: undefined,
          backupCodes: undefined,
        });
      },
      
      setBackupCodes: (codes) => {
        set({ backupCodes: codes });
      },
    }),
    {
      name: '2fa-storage',
    }
  )
);

