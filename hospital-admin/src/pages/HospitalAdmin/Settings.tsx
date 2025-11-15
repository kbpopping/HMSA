import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useNavigate, useSearchParams } from 'react-router-dom';
import clsx from 'clsx';
import AppShell from '../../components/layout/AppShell';
import ProfilePicture from '../../components/ProfilePicture';
import { HospitalAPI } from '../../api/endpoints';
import { useAuth } from '../../store/auth';
import { useProfile } from '../../store/profile';
import { useUI } from '../../store/ui';
import { useTwoFactor } from '../../store/twoFactor';
import { useNotifications } from '../../store/notifications';
import TextField from '../../components/forms/TextField';
import Select from '../../components/forms/Select';
import Spinner from '../../components/feedback/Spinner';
import PasswordField from '../../components/forms/PasswordField';

type TabType = 'hospital-profile' | 'user-profile' | 'api-keys' | 'preferences' | 'security';

/**
 * Settings Page
 * 
 * Features:
 * - Hospital profile form (name, country, timezone)
 * - User profile (name, email, profile picture)
 * - API keys section (placeholder)
 * - Preferences (theme, telemetry)
 * - Security (password change, 2FA, sign out all sessions)
 */
const Settings = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, logout } = useAuth();
  const hospitalId = user?.hospital_id || '1';
  const profile = useProfile();
  const updateProfile = useProfile((state) => state.updateProfile);
  const { theme, toggleTheme } = useUI();
  const { enabled: twoFactorEnabled, method: twoFactorMethod, enable2FA, disable2FA, setBackupCodes } = useTwoFactor();
  const { addNotification } = useNotifications();

  // Get tab from URL query parameter, default to 'hospital-profile'
  const tabFromUrl = searchParams.get('tab') as TabType | null;
  const validTabs: TabType[] = ['hospital-profile', 'user-profile', 'api-keys', 'preferences', 'security'];
  const isValidTab = tabFromUrl && validTabs.includes(tabFromUrl);
  
  // State
  const [activeTab, setActiveTab] = useState<TabType>(isValidTab ? tabFromUrl : 'hospital-profile');

  // Update active tab when URL query parameter changes
  useEffect(() => {
    if (tabFromUrl && validTabs.includes(tabFromUrl) && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl, activeTab]);

  // Handle tab change - update both state and URL
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };
  const [telemetryEnabled, setTelemetryEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  // Hospital profile form state
  const [hospitalForm, setHospitalForm] = useState({
    name: '',
    country: '',
    timezone: '',
  });

  // User profile form state
  const [profileData, setProfileData] = useState({
    name: profile.name || 'Dr. Evelyn Reed',
    email: profile.email || 'admin@hospital.com',
    profilePicture: profile.profilePicture || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPasswordFields, setShowPasswordFields] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // 2FA setup state
  const [twoFactorSetup, setTwoFactorSetup] = useState({
    step: 'select' as 'select' | 'qr' | 'verify' | 'backup',
    selectedMethod: null as 'google' | 'authenticator' | null,
    qrCode: '',
    secret: '',
    verificationCode: '',
    backupCodes: [] as string[],
  });

  // Fetch hospital data
  const { data: hospital, isLoading: hospitalLoading } = useQuery({
    queryKey: ['hospital', 'me', hospitalId],
    queryFn: async () => {
      try {
        const result = await HospitalAPI.me(hospitalId);
        return result;
      } catch (err) {
        console.error('Error fetching hospital:', err);
        return null;
      }
    },
    staleTime: 0, // Always refetch to get latest data
  });

  // Initialize hospital form when data loads
  useEffect(() => {
    if (hospital) {
      setHospitalForm({
        name: hospital.name || '',
        country: hospital.country || '',
        timezone: hospital.timezone || 'America/Los_Angeles',
      });
    }
  }, [hospital]);

  // Initialize profile data from store on mount and sync when store updates
  useEffect(() => {
    setProfileData(prev => ({
      ...prev,
      name: profile.name || prev.name || 'Dr. Evelyn Reed',
      email: profile.email || prev.email || 'admin@hospital.com',
      profilePicture: profile.profilePicture || prev.profilePicture || '',
    }));
  }, [profile.name, profile.email, profile.profilePicture]);

  // Update hospital mutation
  const updateHospitalMutation = useMutation({
    mutationFn: async (payload: { name?: string; country?: string; timezone?: string }) => {
      return HospitalAPI.updateHospital(hospitalId, payload);
    },
    onSuccess: async () => {
      // Invalidate and refetch all hospital-related queries to ensure updates are reflected everywhere
      await queryClient.invalidateQueries({ queryKey: ['hospital', 'me'], exact: false });
      await queryClient.invalidateQueries({ queryKey: ['hospital'], exact: false });
      // Force refetch the current hospital query
      await queryClient.refetchQueries({ queryKey: ['hospital', 'me', hospitalId] });
      toast.success('Hospital profile updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update hospital profile');
    },
  });

  // Handle hospital profile save
  const handleSaveHospitalProfile = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[Settings] Updating hospital with:', hospitalForm);
    updateHospitalMutation.mutate(hospitalForm);
  };

  // Handle user profile update
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    
    try {
      updateProfile({
        name: profileData.name,
        email: profileData.email,
        profilePicture: profileData.profilePicture,
      });
      
      toast.success('Profile updated successfully!');
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      const errorMsg = 'Failed to update profile';
      setMessage(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profileData.currentPassword) {
      setMessage('Please enter your current password');
      toast.error('Please enter your current password');
      return;
    }
    
    if (profileData.newPassword.length < 6) {
      setMessage('New password must be at least 6 characters');
      toast.error('New password must be at least 6 characters');
      return;
    }
    
    if (profileData.newPassword !== profileData.confirmPassword) {
      setMessage('Passwords do not match');
      toast.error('Passwords do not match');
      return;
    }
    
    setIsLoading(true);
    setMessage('');
    
    try {
      // Mock password update
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Password changed successfully!');
      setMessage('Password changed successfully!');
      setProfileData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
      setTimeout(() => setMessage(''), 3000);
      
      // Add notification
      addNotification({
        type: 'system_alert',
        title: 'Password Changed',
        message: `Your password has been successfully updated. If this wasn't you, please contact support immediately.`,
        route: '/hospital/settings',
      });
    } catch (error: any) {
      const errorMsg = error?.message || 'Failed to change password';
      setMessage(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle sign out all sessions
  const handleSignOutAllSessions = async () => {
    if (!window.confirm('Are you sure you want to sign out all sessions? This will log out all devices.')) {
      return;
    }
    
    setIsLoading(true);
    try {
      // Mock sign out
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('All sessions have been signed out successfully');
      await handleLogout();
    } catch (error) {
      toast.error('Failed to sign out all sessions');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle theme toggle
  const handleThemeToggle = () => {
    toggleTheme();
  };

  // Handle telemetry toggle
  const handleTelemetryToggle = () => {
    setTelemetryEnabled(!telemetryEnabled);
    toast.success(`Telemetry ${!telemetryEnabled ? 'enabled' : 'disabled'}`);
  };

  // Handle profile picture change
  const handleProfilePictureChange = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      updateProfile({ profilePicture: imageUrl });
      setProfileData(prev => ({ ...prev, profilePicture: imageUrl }));
      toast.success('Profile picture updated successfully!');
      setMessage('Profile picture updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    };
    reader.readAsDataURL(file);
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  // 2FA Functions
  const generateQRCode = (secret: string, email: string): string => {
    const otpAuthUrl = `otpauth://totp/HMSA:${email}?secret=${secret}&issuer=HMSA`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpAuthUrl)}`;
  };

  const generateSecret = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let secret = '';
    for (let i = 0; i < 32; i++) {
      secret += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return secret;
  };

  const generateBackupCodes = (): string[] => {
    const codes: string[] = [];
    for (let i = 0; i < 10; i++) {
      codes.push(Math.random().toString(36).substring(2, 10).toUpperCase());
    }
    return codes;
  };

  const handle2FASetup = (method: 'google' | 'authenticator') => {
    const secret = generateSecret();
    const qrCode = generateQRCode(secret, profileData.email);
    
    setTwoFactorSetup({
      step: 'qr',
      selectedMethod: method,
      qrCode,
      secret,
      verificationCode: '',
      backupCodes: [],
    });
  };

  const handle2FAVerify = () => {
    if (twoFactorSetup.verificationCode.length !== 6) {
      toast.error('Please enter a 6-digit verification code');
      return;
    }
    
    const backupCodes = generateBackupCodes();
    setTwoFactorSetup(prev => ({ ...prev, step: 'backup', backupCodes }));
  };

  const handle2FAComplete = () => {
    if (!twoFactorSetup.selectedMethod) return;
    
    enable2FA(twoFactorSetup.selectedMethod, twoFactorSetup.secret);
    setBackupCodes(twoFactorSetup.backupCodes);
    
    toast.success('Two-factor authentication enabled successfully!');
    setTwoFactorSetup({
      step: 'select',
      selectedMethod: null,
      qrCode: '',
      secret: '',
      verificationCode: '',
      backupCodes: [],
    });
  };

  const handle2FADisable = () => {
    if (!window.confirm('Are you sure you want to disable two-factor authentication? This will make your account less secure.')) {
      return;
    }
    
    disable2FA();
    toast.success('Two-factor authentication disabled');
  };

  // Countries list
  const countries = [
    { value: '', label: 'Select a country' },
    { value: 'USA', label: 'United States' },
    { value: 'Canada', label: 'Canada' },
    { value: 'UK', label: 'United Kingdom' },
    { value: 'Australia', label: 'Australia' },
    { value: 'Germany', label: 'Germany' },
    { value: 'France', label: 'France' },
    { value: 'Nigeria', label: 'Nigeria' },
    { value: 'South Africa', label: 'South Africa' },
    { value: 'Kenya', label: 'Kenya' },
  ];

  // Timezones list
  const timezones = [
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'Europe/London', label: 'GMT (London)' },
    { value: 'Europe/Paris', label: 'CET (Paris)' },
    { value: 'Asia/Dubai', label: 'GST (Dubai)' },
    { value: 'Asia/Tokyo', label: 'JST (Tokyo)' },
    { value: 'Australia/Sydney', label: 'AEST (Sydney)' },
    { value: 'Africa/Lagos', label: 'WAT (Lagos)' },
    { value: 'Africa/Johannesburg', label: 'SAST (Johannesburg)' },
    { value: 'Africa/Nairobi', label: 'EAT (Nairobi)' },
  ];

  const tabs = [
    { id: 'hospital-profile' as TabType, label: 'Hospital Profile', icon: 'business' },
    { id: 'user-profile' as TabType, label: 'User Profile', icon: 'person' },
    { id: 'api-keys' as TabType, label: 'API Keys', icon: 'key' },
    { id: 'preferences' as TabType, label: 'Preferences', icon: 'settings' },
    { id: 'security' as TabType, label: 'Security', icon: 'security' },
  ];

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-4 sm:mb-6 lg:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground-light dark:text-foreground-dark mb-1 sm:mb-2">
            Settings
          </h1>
          <p className="text-sm sm:text-base text-subtle-light dark:text-subtle-dark">
            Manage your account settings and preferences
          </p>
        </header>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.includes('successfully') 
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800' 
              : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
          }`}>
            {message}
          </div>
        )}

        {/* Tabs */}
        <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-soft mb-4 sm:mb-6">
          <div className="border-b border-border-light dark:border-border-dark overflow-x-auto">
            <nav className="flex space-x-4 sm:space-x-8 px-3 sm:px-6 min-w-max sm:min-w-0">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center gap-1 sm:gap-2 py-3 sm:py-4 px-1 sm:px-2 border-b-2 font-medium text-xs sm:text-sm transition-colors touch-manipulation whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-subtle-light dark:text-subtle-dark hover:text-foreground-light dark:hover:text-foreground-dark hover:border-border-light dark:hover:border-border-dark'
                  }`}
                >
                  <span className="material-symbols-outlined text-base sm:text-lg">{tab.icon}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-4 sm:p-6">
            {/* Hospital Profile Tab */}
            {activeTab === 'hospital-profile' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-foreground-light dark:text-foreground-dark mb-3 sm:mb-4">
                    Hospital Information
                  </h3>
                  {hospitalLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Spinner size="lg" />
                    </div>
                  ) : (
                    <form onSubmit={handleSaveHospitalProfile} className="space-y-4 max-w-2xl">
                      <TextField
                        label="Hospital Name"
                        value={hospitalForm.name}
                        onChange={(e) => setHospitalForm({ ...hospitalForm, name: e.target.value })}
                        required
                      />
                      <Select
                        label="Country"
                        value={hospitalForm.country}
                        onChange={(e) => setHospitalForm({ ...hospitalForm, country: e.target.value })}
                        options={countries}
                        required
                      />
                      <Select
                        label="Timezone"
                        value={hospitalForm.timezone}
                        onChange={(e) => setHospitalForm({ ...hospitalForm, timezone: e.target.value })}
                        options={timezones}
                        required
                      />
                      <div className="flex justify-end gap-3 pt-4">
                        <button
                          type="submit"
                          disabled={updateHospitalMutation.isPending}
                          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {updateHospitalMutation.isPending ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            )}

            {/* User Profile Tab */}
            {activeTab === 'user-profile' && (
              <div className="space-y-6">
                {/* Profile Picture Section */}
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-foreground-light dark:text-foreground-dark mb-3 sm:mb-4">
                    Profile Picture
                  </h3>
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 p-4 sm:p-6 border border-border-light dark:border-border-dark rounded-lg bg-background-light dark:bg-background-dark">
                    <ProfilePicture
                      src={profileData.profilePicture || profile.profilePicture || ''}
                      size="lg"
                      editable={true}
                      onImageChange={handleProfilePictureChange}
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground-light dark:text-foreground-dark mb-2">
                        Update Profile Picture
                      </h4>
                      <p className="text-sm text-subtle-light dark:text-subtle-dark mb-4">
                        Click on the profile picture to upload a new image. Recommended size: 200x200 pixels. Max file size: 5MB.
                      </p>
                      <div className="flex gap-3">
                        <button
                          onClick={() => document.querySelector('input[type="file"]')?.click()}
                          className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                        >
                          Choose File
                        </button>
                        {profileData.profilePicture && (
                          <button
                            onClick={() => {
                              const defaultPic = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDOqNgv11Cnx2gmDnVO9M-ENpIeWQ4-ObRIMQ_Y1gI_8CvEaffQ5lrgbIsxm2qKqUg0ZFYnioS-cujcfnL8cs8fCmnZXH6EPe1nzpqn7b_P-PjcChca2JfrTSqrVQ12K21tfWOuO4vJ1oV9K4DT8kp99K1pJ3MSbC_3unW4Dt1ghHcbRglxdUWleC5s5Lk4C31EVzKvI8kuCuSte9RIMzdxi1RuAgiec0d9u4kR_r1TiLL-rvudIsOsdJlLDGPTUoDydbTDTl9CYIU';
                              updateProfile({ profilePicture: defaultPic });
                              setProfileData(prev => ({ ...prev, profilePicture: defaultPic }));
                            }}
                            className="bg-subtle-light dark:bg-subtle-dark text-foreground-light dark:text-foreground-dark px-4 py-2 rounded-lg text-sm font-medium hover:bg-subtle-light/80 dark:hover:bg-subtle-dark/80 transition-colors"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Profile Information Section */}
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-foreground-light dark:text-foreground-dark mb-3 sm:mb-4">
                    Profile Information
                  </h3>
                  <form onSubmit={handleProfileUpdate} className="space-y-3 sm:space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <TextField
                        label="Full Name"
                        value={profileData.name}
                        onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                      />
                      <TextField
                        label="Email Address"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full sm:w-auto bg-primary text-white px-6 py-2.5 sm:py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 text-sm sm:text-base touch-manipulation"
                      >
                        {isLoading ? 'Updating...' : 'Update Profile'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* API Keys Tab */}
            {activeTab === 'api-keys' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-foreground-light dark:text-foreground-dark mb-4">
                    API Keys
                  </h3>
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-yellow-600 dark:text-yellow-400">
                        info
                      </span>
                      <div>
                        <h4 className="font-medium text-yellow-800 dark:text-yellow-300 mb-1">
                          Coming Soon
                        </h4>
                        <p className="text-sm text-yellow-700 dark:text-yellow-400">
                          API key management for partner integrations will be available in a future update.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-foreground-light dark:text-foreground-dark mb-3 sm:mb-4">
                    Appearance
                  </h3>
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-center justify-between p-3 sm:p-4 border border-border-light dark:border-border-dark rounded-lg bg-background-light dark:bg-background-dark">
                      <div className="flex-1 min-w-0 pr-4">
                        <h4 className="font-medium text-sm sm:text-base text-foreground-light dark:text-foreground-dark">
                          Dark Mode
                        </h4>
                        <p className="text-xs sm:text-sm text-subtle-light dark:text-subtle-dark">
                          Switch between light and dark themes
                        </p>
                      </div>
                      <button
                        onClick={handleThemeToggle}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 touch-manipulation ${
                          theme === 'dark' ? 'bg-primary' : 'bg-subtle-light dark:bg-subtle-dark'
                        }`}
                        aria-label="Toggle dark mode"
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-foreground-light dark:text-foreground-dark mb-3 sm:mb-4">
                    Privacy & Data
                  </h3>
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-center justify-between p-3 sm:p-4 border border-border-light dark:border-border-dark rounded-lg bg-background-light dark:bg-background-dark">
                      <div className="flex-1 min-w-0 pr-4">
                        <h4 className="font-medium text-sm sm:text-base text-foreground-light dark:text-foreground-dark">
                          Telemetry
                        </h4>
                        <p className="text-xs sm:text-sm text-subtle-light dark:text-subtle-dark">
                          Help improve the app by sharing anonymous usage data
                        </p>
                      </div>
                      <button
                        onClick={handleTelemetryToggle}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 touch-manipulation ${
                          telemetryEnabled ? 'bg-primary' : 'bg-subtle-light dark:bg-subtle-dark'
                        }`}
                        aria-label="Toggle telemetry"
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            telemetryEnabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                {/* Change Password Section */}
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-foreground-light dark:text-foreground-dark mb-3 sm:mb-4">
                    Change Password
                  </h3>
                  <form onSubmit={handlePasswordChange} className="space-y-3 sm:space-y-4">
                    <PasswordField
                      label="Current Password"
                      value={profileData.currentPassword}
                      onChange={(e) => setProfileData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      required
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <PasswordField
                        label="New Password"
                        value={profileData.newPassword}
                        onChange={(e) => setProfileData(prev => ({ ...prev, newPassword: e.target.value }))}
                        required
                      />
                      <PasswordField
                        label="Confirm New Password"
                        value={profileData.confirmPassword}
                        onChange={(e) => setProfileData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full sm:w-auto bg-primary text-white px-6 py-2.5 sm:py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 text-sm sm:text-base touch-manipulation"
                      >
                        {isLoading ? 'Changing...' : 'Change Password'}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Two-Factor Authentication Section */}
                <div className="border-t border-border-light dark:border-border-dark pt-4 sm:pt-6">
                  <h3 className="text-base sm:text-lg font-semibold text-foreground-light dark:text-foreground-dark mb-3 sm:mb-4">
                    Two-Factor Authentication
                  </h3>
                  
                  {!twoFactorEnabled ? (
                    <div className="space-y-3 sm:space-y-4">
                      {twoFactorSetup.step === 'select' && (
                        <div className="p-3 sm:p-4 border border-border-light dark:border-border-dark rounded-lg bg-background-light dark:bg-background-dark">
                          <p className="text-xs sm:text-sm text-subtle-light dark:text-subtle-dark mb-3 sm:mb-4">
                            Add an extra layer of security to your account by enabling two-factor authentication.
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            <button
                              onClick={() => handle2FASetup('google')}
                              className="p-3 sm:p-4 border border-border-light dark:border-border-dark rounded-lg hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors text-left touch-manipulation"
                            >
                              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                                <span className="material-symbols-outlined text-primary text-lg sm:text-xl">phone_android</span>
                                <h4 className="font-medium text-sm sm:text-base text-foreground-light dark:text-foreground-dark">
                                  Google Authenticator
                                </h4>
                              </div>
                              <p className="text-xs sm:text-sm text-subtle-light dark:text-subtle-dark">
                                Use Google Authenticator app to generate verification codes
                              </p>
                            </button>
                            <button
                              onClick={() => handle2FASetup('authenticator')}
                              className="p-3 sm:p-4 border border-border-light dark:border-border-dark rounded-lg hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors text-left touch-manipulation"
                            >
                              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                                <span className="material-symbols-outlined text-primary text-lg sm:text-xl">security</span>
                                <h4 className="font-medium text-sm sm:text-base text-foreground-light dark:text-foreground-dark">
                                  Authenticator App
                                </h4>
                              </div>
                              <p className="text-xs sm:text-sm text-subtle-light dark:text-subtle-dark">
                                Use any authenticator app (Authy, Microsoft Authenticator, etc.)
                              </p>
                            </button>
                          </div>
                        </div>
                      )}

                      {twoFactorSetup.step === 'qr' && (
                        <div className="p-3 sm:p-4 border border-border-light dark:border-border-dark rounded-lg bg-background-light dark:bg-background-dark">
                          <p className="text-xs sm:text-sm text-subtle-light dark:text-subtle-dark mb-3 sm:mb-4">
                            Scan this QR code with your authenticator app:
                          </p>
                          <div className="flex flex-col items-center gap-3 sm:gap-4">
                            <img src={twoFactorSetup.qrCode} alt="QR Code" className="w-40 h-40 sm:w-48 sm:h-48 border border-border-light dark:border-border-dark rounded-lg" />
                            <div className="w-full">
                              <p className="text-xs text-subtle-light dark:text-subtle-dark mb-2">Or enter this code manually:</p>
                              <code className="block p-2 bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded text-sm font-mono text-foreground-light dark:text-foreground-dark break-all">
                                {twoFactorSetup.secret}
                              </code>
                            </div>
                            <div className="w-full">
                              <label className="block text-xs sm:text-sm font-medium text-foreground-light dark:text-foreground-dark mb-2">
                                Enter verification code from your app
                              </label>
                              <input
                                type="text"
                                value={twoFactorSetup.verificationCode}
                                onChange={(e) => setTwoFactorSetup(prev => ({ ...prev, verificationCode: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
                                placeholder="000000"
                                className="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-lg bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark focus:ring-primary focus:border-primary text-center text-xl sm:text-2xl tracking-widest"
                                maxLength={6}
                              />
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                              <button
                                onClick={() => setTwoFactorSetup({ step: 'select', selectedMethod: null, qrCode: '', secret: '', verificationCode: '', backupCodes: [] })}
                                className="w-full sm:w-auto px-4 py-2.5 sm:py-2 border border-border-light dark:border-border-dark rounded-lg text-foreground-light dark:text-foreground-dark hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors text-sm sm:text-base touch-manipulation"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={handle2FAVerify}
                                disabled={twoFactorSetup.verificationCode.length !== 6}
                                className="w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 text-sm sm:text-base touch-manipulation"
                              >
                                Verify
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {twoFactorSetup.step === 'backup' && (
                        <div className="p-3 sm:p-4 border border-yellow-200 dark:border-yellow-800 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                          <div className="flex items-start gap-2 sm:gap-3 mb-3 sm:mb-4">
                            <span className="material-symbols-outlined text-yellow-600 dark:text-yellow-400 text-lg sm:text-xl flex-shrink-0">warning</span>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm sm:text-base text-yellow-800 dark:text-yellow-300 mb-2">
                                Save Your Backup Codes
                              </h4>
                              <p className="text-xs sm:text-sm text-yellow-700 dark:text-yellow-400 mb-3 sm:mb-4">
                                These codes can be used to access your account if you lose your authenticator device. Store them in a safe place.
                              </p>
                              <div className="grid grid-cols-2 gap-2 mb-3 sm:mb-4">
                                {twoFactorSetup.backupCodes.map((code, idx) => (
                                  <code key={idx} className="p-2 bg-white dark:bg-background-dark border border-yellow-200 dark:border-yellow-800 rounded text-xs sm:text-sm font-mono text-center break-all">
                                    {code}
                                  </code>
                                ))}
                              </div>
                              <button
                                onClick={handle2FAComplete}
                                className="w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm sm:text-base touch-manipulation"
                              >
                                I've Saved My Backup Codes
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-4 border border-green-200 dark:border-green-800 rounded-lg bg-green-50 dark:bg-green-900/20">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-green-600 dark:text-green-400">check_circle</span>
                          <div>
                            <h4 className="font-medium text-green-800 dark:text-green-300">
                              Two-Factor Authentication is enabled
                            </h4>
                            <p className="text-sm text-green-700 dark:text-green-400">
                              Method: {twoFactorMethod === 'google' ? 'Google Authenticator' : 'Authenticator App'}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={handle2FADisable}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        >
                          Disable
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Sign Out All Sessions Section */}
                <div className="border-t border-border-light dark:border-border-dark pt-4 sm:pt-6">
                  <h3 className="text-base sm:text-lg font-semibold text-foreground-light dark:text-foreground-dark mb-3 sm:mb-4">
                    Active Sessions
                  </h3>
                  <div className="space-y-3 sm:space-y-4">
                    <div className="p-3 sm:p-4 border border-border-light dark:border-border-dark rounded-lg bg-background-light dark:bg-background-dark">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-xs sm:text-sm">computer</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm sm:text-base text-foreground-light dark:text-foreground-dark">
                              Current Session
                            </h4>
                            <p className="text-xs sm:text-sm text-subtle-light dark:text-subtle-dark break-words">
                              Windows 10 • Chrome • 192.168.1.100
                            </p>
                            <p className="text-xs text-subtle-light dark:text-subtle-dark">Last active: Now</p>
                          </div>
                        </div>
                        <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full whitespace-nowrap">
                          Active
                        </span>
                      </div>
                    </div>

                    <div className="p-3 sm:p-4 border border-border-light dark:border-border-dark rounded-lg bg-background-light dark:bg-background-dark">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-subtle-light/20 dark:bg-subtle-dark/20 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="material-symbols-outlined text-subtle-light dark:text-subtle-dark text-xs sm:text-sm">phone_android</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm sm:text-base text-foreground-light dark:text-foreground-dark">
                              Mobile Device
                            </h4>
                            <p className="text-xs sm:text-sm text-subtle-light dark:text-subtle-dark break-words">
                              iOS 17 • Safari • 192.168.1.101
                            </p>
                            <p className="text-xs text-subtle-light dark:text-subtle-dark">Last active: 2 hours ago</p>
                          </div>
                        </div>
                        <span className="px-2 py-1 text-xs bg-subtle-light/20 dark:bg-subtle-dark/20 text-subtle-light dark:text-subtle-dark rounded-full whitespace-nowrap">
                          Inactive
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <div className="flex items-start gap-2 sm:gap-3">
                      <span className="material-symbols-outlined text-yellow-600 dark:text-yellow-400 text-base sm:text-lg flex-shrink-0 mt-0.5">warning</span>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm sm:text-base text-yellow-800 dark:text-yellow-300">
                          Sign Out All Sessions
                        </h4>
                        <p className="text-xs sm:text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                          This will sign you out of all devices and require you to log in again.
                        </p>
                        <button
                          onClick={handleSignOutAllSessions}
                          disabled={isLoading}
                          className="mt-3 w-full sm:w-auto bg-yellow-600 dark:bg-yellow-700 text-white px-4 py-2.5 sm:py-2 rounded-lg text-sm font-medium hover:bg-yellow-700 dark:hover:bg-yellow-800 transition-colors disabled:opacity-50 touch-manipulation"
                        >
                          {isLoading ? 'Signing out...' : 'Sign Out All Sessions'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default Settings;
