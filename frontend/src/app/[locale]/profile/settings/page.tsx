'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { 
  User, 
  Shield, 
  Eye, 
  Lock, 
  Smartphone, 
  Trash2, 
  Download, 
  AlertTriangle,
  Key,
  Database,
  FileText
} from 'lucide-react';

interface SettingToggle {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

interface SettingSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  settings: SettingToggle[];
}

export default function SettingsPage() {
  const t = useTranslations('Settings');
  
  // Profile Settings
  const [profileData, setProfileData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    bio: 'Software developer with 5+ years of experience in web development.',
    location: 'New York, USA',
    website: 'https://johndoe.dev'
  });

  // Privacy Settings
  const [privacySettings, setPrivacySettings] = useState<SettingToggle[]>([
    {
      id: 'profile_visibility',
      label: 'Public Profile',
      description: 'Make your profile visible to employers and other users',
      enabled: true
    },
    {
      id: 'contact_info',
      label: 'Show Contact Information',
      description: 'Display your email and phone number on your profile',
      enabled: false
    },
    {
      id: 'activity_status',
      label: 'Show Activity Status',
      description: 'Let others see when you were last active',
      enabled: true
    },
    {
      id: 'search_engines',
      label: 'Search Engine Indexing',
      description: 'Allow search engines to index your profile',
      enabled: false
    }
  ]);

  // Security Settings
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: false,
    loginAlerts: true,
    sessionTimeout: '4 hours',
    lastPasswordChange: '2 months ago'
  });

  const [activeTab, setActiveTab] = useState('profile');

  const handleProfileChange = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const togglePrivacySetting = (id: string) => {
    setPrivacySettings(prev => 
      prev.map(setting => 
        setting.id === id ? { ...setting, enabled: !setting.enabled } : setting
      )
    );
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
    { id: 'privacy', label: 'Privacy', icon: <Eye className="w-4 h-4" /> },
    { id: 'security', label: 'Security', icon: <Shield className="w-4 h-4" /> },
    { id: 'data', label: 'Data & Privacy', icon: <Database className="w-4 h-4" /> }
  ];

  const renderProfileSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-textc mb-4">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-textc mb-1">First Name</label>
            <input
              type="text"
              value={profileData.firstName}
              onChange={(e) => handleProfileChange('firstName', e.target.value)}
              className="w-full p-3 border border-textc/20 rounded-lg bg-componentbgc text-textc"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-textc mb-1">Last Name</label>
            <input
              type="text"
              value={profileData.lastName}
              onChange={(e) => handleProfileChange('lastName', e.target.value)}
              className="w-full p-3 border border-textc/20 rounded-lg bg-componentbgc text-textc"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-textc mb-1">Email</label>
            <input
              type="email"
              value={profileData.email}
              onChange={(e) => handleProfileChange('email', e.target.value)}
              className="w-full p-3 border border-textc/20 rounded-lg bg-componentbgc text-textc"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-textc mb-1">Phone</label>
            <input
              type="tel"
              value={profileData.phone}
              onChange={(e) => handleProfileChange('phone', e.target.value)}
              className="w-full p-3 border border-textc/20 rounded-lg bg-componentbgc text-textc"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-textc mb-1">Bio</label>
            <textarea
              value={profileData.bio}
              onChange={(e) => handleProfileChange('bio', e.target.value)}
              rows={3}
              className="w-full p-3 border border-textc/20 rounded-lg bg-componentbgc text-textc"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-textc mb-1">Location</label>
            <input
              type="text"
              value={profileData.location}
              onChange={(e) => handleProfileChange('location', e.target.value)}
              className="w-full p-3 border border-textc/20 rounded-lg bg-componentbgc text-textc"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-textc mb-1">Website</label>
            <input
              type="url"
              value={profileData.website}
              onChange={(e) => handleProfileChange('website', e.target.value)}
              className="w-full p-3 border border-textc/20 rounded-lg bg-componentbgc text-textc"
            />
          </div>
        </div>
        <div className="mt-6">
          <button className="bg-primaryc text-white px-6 py-2 rounded-lg hover:bg-primaryc/90 transition-colors">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );

  const renderPrivacySettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-textc mb-4">Privacy Controls</h3>
        <div className="space-y-4">
          {privacySettings.map((setting) => (
            <div key={setting.id} className="flex items-center justify-between p-4 border border-textc/10 rounded-lg">
              <div>
                <h4 className="font-medium text-textc">{setting.label}</h4>
                <p className="text-sm text-textc/70">{setting.description}</p>
              </div>
              <button
                onClick={() => togglePrivacySetting(setting.id)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  setting.enabled ? 'bg-primaryc' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    setting.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-textc mb-4">Account Security</h3>
        <div className="space-y-4">
          <div className="p-4 border border-textc/10 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-primaryc" />
                <span className="font-medium text-textc">Password</span>
              </div>
              <button className="text-primaryc hover:text-primaryc/80 text-sm">Change</button>
            </div>
            <p className="text-sm text-textc/70">Last changed {securitySettings.lastPasswordChange}</p>
          </div>
          
          <div className="p-4 border border-textc/10 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-primaryc" />
                <span className="font-medium text-textc">Two-Factor Authentication</span>
              </div>
              <button
                onClick={() => setSecuritySettings(prev => ({ ...prev, twoFactorEnabled: !prev.twoFactorEnabled }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  securitySettings.twoFactorEnabled ? 'bg-primaryc' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    securitySettings.twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <p className="text-sm text-textc/70">Add an extra layer of security to your account</p>
          </div>
          
          <div className="p-4 border border-textc/10 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-primaryc" />
                <span className="font-medium text-textc">Login Alerts</span>
              </div>
              <button
                onClick={() => setSecuritySettings(prev => ({ ...prev, loginAlerts: !prev.loginAlerts }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  securitySettings.loginAlerts ? 'bg-primaryc' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    securitySettings.loginAlerts ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <p className="text-sm text-textc/70">Get notified of new login attempts</p>
          </div>
          
          <div className="p-4 border border-textc/10 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-primaryc" />
                <span className="font-medium text-textc">Session Timeout</span>
              </div>
              <select 
                value={securitySettings.sessionTimeout}
                onChange={(e) => setSecuritySettings(prev => ({ ...prev, sessionTimeout: e.target.value }))}
                className="p-2 border border-textc/20 rounded bg-componentbgc text-textc"
              >
                <option value="1 hour">1 hour</option>
                <option value="4 hours">4 hours</option>
                <option value="8 hours">8 hours</option>
                <option value="Never">Never</option>
              </select>
            </div>
            <p className="text-sm text-textc/70">Automatically log out after inactivity</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDataPrivacy = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-textc mb-4">Data & Privacy</h3>
        <div className="space-y-4">
          <div className="p-4 border border-textc/10 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Download className="w-4 h-4 text-primaryc" />
              <span className="font-medium text-textc">Download Your Data</span>
            </div>
            <p className="text-sm text-textc/70 mb-3">Get a copy of all your data in a downloadable format</p>
            <button className="bg-primaryc text-white px-4 py-2 rounded-lg hover:bg-primaryc/90 transition-colors">
              Request Data Export
            </button>
          </div>
          
          <div className="p-4 border border-textc/10 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-primaryc" />
              <span className="font-medium text-textc">Privacy Policy</span>
            </div>
            <p className="text-sm text-textc/70 mb-3">Read our privacy policy and terms of service</p>
            <div className="flex gap-2">
              <button className="text-primaryc hover:text-primaryc/80 text-sm">Privacy Policy</button>
              <button className="text-primaryc hover:text-primaryc/80 text-sm">Terms of Service</button>
            </div>
          </div>
          
          <div className="p-4 border border-red-200 bg-red-50/10 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span className="font-medium text-red-600">Danger Zone</span>
            </div>
            <p className="text-sm text-textc/70 mb-3">Permanently delete your account and all associated data</p>
            <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2">
              <Trash2 className="w-4 h-4" />
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-textc mb-2">Settings</h1>
          <p className="text-textc/70">Manage your account settings and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primaryc text-white'
                      : 'text-textc hover:bg-textc/5'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-componentbgc rounded-xl shadow-md p-6">
              {activeTab === 'profile' && renderProfileSettings()}
              {activeTab === 'privacy' && renderPrivacySettings()}
              {activeTab === 'security' && renderSecuritySettings()}
              {activeTab === 'data' && renderDataPrivacy()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 