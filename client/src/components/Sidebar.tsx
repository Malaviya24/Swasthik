import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onShowSymptomChecker: () => void;
}

const languages = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'हिंदी (Hindi)' },
  { code: 'bn', name: 'বাংলা (Bengali)' },
  { code: 'ta', name: 'தமிழ் (Tamil)' },
  { code: 'te', name: 'తెలుగు (Telugu)' },
  { code: 'mr', name: 'मराठी (Marathi)' },
];

export function Sidebar({ isOpen, onClose, activeTab, onTabChange, onShowSymptomChecker }: SidebarProps) {
  const { user, signOut } = useAuth();
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  const menuItems = [
    { id: 'chat', icon: 'fas fa-comments', label: 'Chat', onClick: () => onTabChange('chat') },
    { id: 'symptom-checker', icon: 'fas fa-stethoscope', label: 'Symptom Checker', onClick: onShowSymptomChecker },
    { id: 'medication-lookup', icon: 'fas fa-pills', label: 'Medications', onClick: () => onTabChange('medication-lookup') },
    { id: 'health-centers', icon: 'fas fa-map-marker-alt', label: 'Find Centers', onClick: () => onTabChange('health-centers') },
    { id: 'reminders', icon: 'fas fa-calendar-check', label: 'Reminders', onClick: () => onTabChange('reminders'), badge: '3' },
    { id: 'health-news', icon: 'fas fa-newspaper', label: 'Health News', onClick: () => onTabChange('health-news') },
  ];

  const getUserInitials = (displayName: string | null | undefined) => {
    if (!displayName) return 'U';
    return displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div 
      className={`sidebar-transition mobile-sidebar lg:translate-x-0 fixed lg:relative z-40 w-80 h-full bg-card border-r border-border shadow-lg lg:shadow-none ${isOpen ? 'open' : ''}`}
      data-testid="sidebar"
    >
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Swasthik</h1>
            <p className="text-sm text-muted-foreground">AI Healthcare Assistant</p>
          </div>
          <button 
            onClick={onClose}
            className="lg:hidden text-muted-foreground"
            data-testid="button-close-sidebar"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        {/* User Info */}
        {user && (
          <div className="mt-4 flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
            <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold">
              <span data-testid="text-user-initials">{getUserInitials(user.displayName)}</span>
            </div>
            <div className="flex-1">
              <p className="font-medium" data-testid="text-user-name">{user.displayName || 'User'}</p>
              <p className="text-xs text-muted-foreground">ID: <span data-testid="text-user-id">{user.uid.slice(0, 8)}</span></p>
            </div>
            <button
              onClick={signOut}
              className="text-xs text-muted-foreground hover:text-foreground"
              data-testid="button-sign-out"
            >
              <i className="fas fa-sign-out-alt"></i>
            </button>
          </div>
        )}
      </div>

      {/* Navigation Menu */}
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={item.onClick}
            className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
              activeTab === item.id 
                ? 'bg-primary text-primary-foreground' 
                : 'hover:bg-muted'
            }`}
            data-testid={`button-nav-${item.id}`}
          >
            <i className={`${item.icon} w-5`}></i>
            <span className="flex-1 text-left">{item.label}</span>
            {item.badge && (
              <span className="bg-accent text-accent-foreground text-xs px-2 py-1 rounded-full">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Language Selector */}
      <div className="p-4 border-t border-border">
        <label className="block text-sm font-medium mb-2">Language</label>
        <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
          <SelectTrigger className="w-full" data-testid="select-language">
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            {languages.map((lang) => (
              <SelectItem key={lang.code} value={lang.code}>
                {lang.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Emergency Button */}
      <div className="p-4">
        <Button 
          className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
          onClick={() => window.open('tel:108')}
          data-testid="button-emergency"
        >
          <i className="fas fa-phone-alt mr-2"></i>
          Emergency: 108
        </Button>
      </div>
    </div>
  );
}
