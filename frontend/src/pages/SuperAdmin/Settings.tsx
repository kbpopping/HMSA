import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ProfilePicture from '../../components/ProfilePicture';

const Settings = () => {
  const navigate = useNavigate();
  const [showUsersDropdown, setShowUsersDropdown] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [telemetryEnabled, setTelemetryEnabled] = useState(true);
  const [profileData, setProfileData] = useState({
    name: 'Super Admin',
    email: 'admin@hmsa.com',
    profilePicture: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (profileData.newPassword !== profileData.confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }
    
    setIsLoading(true);
    setMessage('');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMessage('Password changed successfully!');
      setProfileData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOutAllSessions = async () => {
    if (!window.confirm('Are you sure you want to sign out all sessions? This will log out all devices.')) {
      return;
    }
    
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('All sessions have been signed out successfully');
    } catch (error) {
      alert('Failed to sign out all sessions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleThemeToggle = () => {
    setIsDarkMode(!isDarkMode);
    // In a real app, this would update the theme context/store
    document.documentElement.classList.toggle('dark');
  };

  const handleTelemetryToggle = () => {
    setTelemetryEnabled(!telemetryEnabled);
    // In a real app, this would make an API call to update the setting
  };

  const handleProfilePictureChange = (file: File) => {
    // In a real app, this would upload the file to the server
    console.log('Profile picture changed:', file.name);
    setMessage('Profile picture updated successfully!');
    setTimeout(() => setMessage(''), 3000);
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: 'person' },
    { id: 'security', label: 'Security', icon: 'security' },
    { id: 'preferences', label: 'Preferences', icon: 'settings' },
    { id: 'sessions', label: 'Sessions', icon: 'devices' }
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white flex flex-col p-4 border-r border-[#607AFB]/20 shadow-lg">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#607AFB]/20 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-[#607AFB] text-sm">shield_person</span>
            </div>
            <h1 className="text-xl font-bold text-gray-800">HMSA</h1>
          </div>
          <button className="text-gray-800">
            <span className="material-symbols-outlined">menu</span>
          </button>
        </div>
        
        <nav className="flex-grow space-y-2">
          <Link 
            to="/super/dashboard" 
            className="flex items-center gap-3 px-4 py-2 text-gray-600 rounded hover:bg-[#607AFB]/20 hover:text-gray-800 transition-colors"
          >
            <span className="material-symbols-outlined">dashboard</span>
            <span>Dashboard</span>
          </Link>
          
          <Link 
            to="/super/hospitals" 
            className="flex items-center gap-3 px-4 py-2 text-gray-600 rounded hover:bg-[#607AFB]/20 hover:text-gray-800 transition-colors"
          >
            <span className="material-symbols-outlined">apartment</span>
            <span>Hospitals</span>
          </Link>
          
          {/* Users with dropdown */}
          <div className="relative">
            <button 
              onClick={() => setShowUsersDropdown(!showUsersDropdown)}
              className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-[#607AFB]/20 hover:text-gray-800 transition-colors w-full justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined">group</span>
                <span>Users</span>
              </div>
              <span className={`material-symbols-outlined transition-transform ${showUsersDropdown ? 'rotate-180' : ''}`}>
                expand_more
              </span>
            </button>
            
            {/* Dropdown menu */}
            {showUsersDropdown && (
              <div className="mt-2 ml-4 space-y-2">
                <Link 
                  to="/super/users" 
                  className="flex items-center gap-3 px-4 py-2 text-gray-600 rounded hover:bg-[#607AFB]/20 hover:text-gray-800 transition-colors"
                >
                  <span className="material-symbols-outlined">person</span>
                  <span>Users</span>
                </Link>
                <Link 
                  to="/super/users/roles" 
                  className="flex items-center gap-3 px-4 py-2 text-gray-600 rounded hover:bg-[#607AFB]/20 hover:text-gray-800 transition-colors"
                >
                  <span className="material-symbols-outlined">verified_user</span>
                  <span>Roles</span>
                </Link>
                <Link 
                  to="/super/users/monitoring" 
                  className="flex items-center gap-3 px-4 py-2 text-gray-600 rounded hover:bg-[#607AFB]/20 hover:text-gray-800 transition-colors"
                >
                  <span className="material-symbols-outlined">monitoring</span>
                  <span>Monitoring</span>
                </Link>
              </div>
            )}
          </div>
          
          <Link 
            to="/super/settings" 
            className="flex items-center gap-3 px-4 py-2 rounded-lg bg-[#607AFB] text-white shadow-md"
          >
            <span className="material-symbols-outlined">settings</span>
            <span className="font-semibold">Settings</span>
          </Link>
        </nav>
        
        <div className="mt-auto">
          <div className="border-t border-[#607AFB]/20 pt-4">
            <div className="flex items-center gap-3 mb-4">
              <ProfilePicture
                src={profileData.profilePicture}
                size="md"
                editable={false}
              />
              <div>
                <p className="font-semibold text-gray-800">Super Admin</p>
                <p className="text-sm text-gray-500">admin@hmsa.com</p>
              </div>
            </div>
            <button 
              onClick={() => navigate('/login')}
              className="flex items-center gap-3 px-4 py-2 text-gray-600 rounded hover:bg-[#607AFB]/20 hover:text-gray-800 transition-colors w-full"
            >
              <span className="material-symbols-outlined">logout</span>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Settings</h1>
            <p className="text-gray-600">Manage your account settings and preferences</p>
          </div>

          {/* Message */}
          {message && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.includes('successfully') 
                ? 'bg-green-100 text-green-700 border border-green-200' 
                : 'bg-red-100 text-red-700 border border-red-200'
            }`}>
              {message}
            </div>
          )}

          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-sm mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-[#607AFB] text-[#607AFB]'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  {/* Profile Picture Section */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Profile Picture</h3>
                    <div className="flex items-center gap-6 p-6 border border-gray-200 rounded-lg">
                      <ProfilePicture
                        src={profileData.profilePicture}
                        size="lg"
                        editable={true}
                        onImageChange={handleProfilePictureChange}
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800 mb-2">Update Profile Picture</h4>
                        <p className="text-sm text-gray-600 mb-4">
                          Click on the profile picture to upload a new image. Recommended size: 200x200 pixels. Max file size: 5MB.
                        </p>
                        <div className="flex gap-3">
                          <button
                            onClick={() => document.querySelector('input[type="file"]')?.click()}
                            className="bg-[#607AFB] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#607AFB]/90 transition-colors"
                          >
                            Choose File
                          </button>
                          {profileData.profilePicture && (
                            <button
                              onClick={() => setProfileData(prev => ({ ...prev, profilePicture: '' }))}
                              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
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
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Profile Information</h3>
                    <form onSubmit={handleProfileUpdate} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Full Name
                          </label>
                          <input
                            type="text"
                            value={profileData.name}
                            onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#607AFB] focus:border-[#607AFB]"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address
                          </label>
                          <input
                            type="email"
                            value={profileData.email}
                            onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#607AFB] focus:border-[#607AFB]"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="bg-[#607AFB] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#607AFB]/90 transition-colors disabled:opacity-50"
                        >
                          {isLoading ? 'Updating...' : 'Update Profile'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Change Password</h3>
                    <form onSubmit={handlePasswordChange} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Current Password
                        </label>
                        <input
                          type="password"
                          value={profileData.currentPassword}
                          onChange={(e) => setProfileData(prev => ({ ...prev, currentPassword: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#607AFB] focus:border-[#607AFB]"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            New Password
                          </label>
                          <input
                            type="password"
                            value={profileData.newPassword}
                            onChange={(e) => setProfileData(prev => ({ ...prev, newPassword: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#607AFB] focus:border-[#607AFB]"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Confirm New Password
                          </label>
                          <input
                            type="password"
                            value={profileData.confirmPassword}
                            onChange={(e) => setProfileData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#607AFB] focus:border-[#607AFB]"
                            required
                          />
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="bg-[#607AFB] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#607AFB]/90 transition-colors disabled:opacity-50"
                        >
                          {isLoading ? 'Changing...' : 'Change Password'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Preferences Tab */}
              {activeTab === 'preferences' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Appearance</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-800">Dark Mode</h4>
                          <p className="text-sm text-gray-600">Switch between light and dark themes</p>
                        </div>
                        <button
                          onClick={handleThemeToggle}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            isDarkMode ? 'bg-[#607AFB]' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              isDarkMode ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Privacy & Data</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-800">Telemetry</h4>
                          <p className="text-sm text-gray-600">Help improve the app by sharing anonymous usage data</p>
                        </div>
                        <button
                          onClick={handleTelemetryToggle}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            telemetryEnabled ? 'bg-[#607AFB]' : 'bg-gray-200'
                          }`}
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

              {/* Sessions Tab */}
              {activeTab === 'sessions' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Active Sessions</h3>
                    <div className="space-y-4">
                      <div className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                              <span className="material-symbols-outlined text-green-600 text-sm">computer</span>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-800">Current Session</h4>
                              <p className="text-sm text-gray-600">Windows 10 • Chrome • 192.168.1.100</p>
                              <p className="text-xs text-gray-500">Last active: Now</p>
                            </div>
                          </div>
                          <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">Active</span>
                        </div>
                      </div>

                      <div className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                              <span className="material-symbols-outlined text-gray-600 text-sm">phone_android</span>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-800">Mobile Device</h4>
                              <p className="text-sm text-gray-600">iOS 17 • Safari • 192.168.1.101</p>
                              <p className="text-xs text-gray-500">Last active: 2 hours ago</p>
                            </div>
                          </div>
                          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">Inactive</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-yellow-600 text-sm mt-0.5">warning</span>
                        <div>
                          <h4 className="font-medium text-yellow-800">Sign Out All Sessions</h4>
                          <p className="text-sm text-yellow-700 mt-1">
                            This will sign you out of all devices and require you to log in again.
                          </p>
                          <button
                            onClick={handleSignOutAllSessions}
                            disabled={isLoading}
                            className="mt-3 bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-yellow-700 transition-colors disabled:opacity-50"
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
      </main>
    </div>
  );
};

export default Settings;
