import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useLanguage, LANGUAGES } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChatHistory } from '@/components/ChatHistory';
import { ChatSession, ChatHistoryService } from '@/lib/chatHistory';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onShowSymptomChecker: () => void;
  onLoadSession?: (session: ChatSession) => void;
  onNewChat?: () => void;
}

export function Sidebar({ isOpen, onClose, activeTab, onTabChange, onShowSymptomChecker, onLoadSession, onNewChat }: SidebarProps) {
  const { user, signOut } = useAuth();
  const { currentLanguage, setLanguage, translate } = useLanguage();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [location] = useLocation();

  const loadSessions = () => {
    const chatSessions = ChatHistoryService.getSessions();
    setSessions(chatSessions);
  };

  useEffect(() => {
    if (location === '/chat') {
      loadSessions();
    }
  }, [location]);

  const menuItems = [
    { id: 'chat', icon: 'fas fa-comments', label: translate('sidebar.chat'), href: '/chat' },
    { id: 'symptom-checker', icon: 'fas fa-stethoscope', label: translate('sidebar.symptom_checker'), href: '/symptom-checker' },
    { id: 'medications', icon: 'fas fa-pills', label: translate('sidebar.medications'), href: '/medications' },
    { id: 'health-centers', icon: 'fas fa-map-marker-alt', label: translate('sidebar.find_centers'), href: '/health-centers' },
    { id: 'reminders', icon: 'fas fa-calendar-check', label: translate('sidebar.reminders'), href: '/reminders' },
    { id: 'health-news', icon: 'fas fa-newspaper', label: translate('sidebar.health_news'), href: '/health-news' },
  ];

  const getUserInitials = (displayName: string | null | undefined) => {
    if (!displayName) return 'U';
    return displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div 
      className={`sidebar-transition mobile-sidebar lg:translate-x-0 fixed lg:relative z-40 w-80 h-full bg-white border-r border-gray-200 shadow-lg lg:shadow-none ${isOpen ? 'open' : ''}`}
      data-testid="sidebar"
    >
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <Link href="/" className="hover:opacity-80 transition-all duration-300 ease-in-out cursor-pointer transform hover:scale-105">
            <div>
              <h1 className="text-xl font-bold text-foreground">{translate('app.title')}</h1>
              <p className="text-sm text-muted-foreground">{translate('app.subtitle')}</p>
            </div>
          </Link>
          <button 
            onClick={onClose}
            className="lg:hidden text-muted-foreground"
            data-testid="button-close-sidebar"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        {/* User Info - ChatGPT Style with Real User Data */}
        {user && (
          <div className="mt-4 flex items-center space-x-3 p-2 hover:bg-muted/50 rounded-lg transition-colors">
            {user.imageUrl ? (
              <img 
                src={user.imageUrl} 
                alt={user.displayName || 'User'} 
                className="w-8 h-8 rounded-full object-cover"
                data-testid="user-avatar"
              />
            ) : (
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                <span data-testid="text-user-initials">{getUserInitials(user.displayName)}</span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate" data-testid="text-user-name">
                {user.fullName || user.displayName || user.firstName || 'User'}
              </p>
              <p className="text-xs text-muted-foreground">Free Plan</p>
            </div>
            <button
              onClick={signOut}
              className="text-muted-foreground hover:text-foreground hover:bg-muted/50 px-2 py-1 rounded text-xs transition-colors flex items-center space-x-1"
              data-testid="button-sign-out"
              title="Sign out"
            >
              <i className="fas fa-sign-out-alt text-xs"></i>
              <span>Sign out</span>
            </button>
          </div>
        )}
      </div>

      {/* Chat Controls - Only show when on chat page */}
      {location === '/chat' && onLoadSession && onNewChat && (
        <div className="px-4 py-2">
          <Button 
            onClick={onNewChat}
            className="w-full bg-transparent hover:bg-muted text-foreground border border-border hover:border-border/80 justify-start h-10"
            data-testid="button-new-chat-sidebar"
          >
            <i className="fas fa-plus mr-3 text-sm"></i>
            {translate('chat.history.new_chat')}
          </Button>
          
          {/* Direct Chat History Display */}
          <div className="mt-3">
            <h3 className="text-xs font-medium text-muted-foreground mb-2 px-2">Recent Chats</h3>
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {sessions.length === 0 ? (
                <p className="text-xs text-muted-foreground px-2 py-1">No previous conversations</p>
              ) : (
                sessions.slice(0, 10).map((session) => (
                  <button
                    key={session.id}
                    onClick={() => onLoadSession(session)}
                    className="w-full text-left px-2 py-2 rounded hover:bg-muted/50 transition-colors group"
                    data-testid={`chat-session-${session.id}`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-foreground truncate flex-1">{session.title}</p>
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            ChatHistoryService.deleteSession(session.id);
                            loadSessions();
                          }}
                          className="text-muted-foreground hover:text-destructive p-1 rounded"
                          data-testid={`delete-session-${session.id}`}
                        >
                          <i className="fas fa-trash text-xs"></i>
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(session.updatedAt).toLocaleDateString()} • {session.messages.length} messages
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Navigation Menu */}
      <nav className="px-4 py-2 space-y-1">
        {menuItems.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors text-sm ${
              location === item.href 
                ? 'bg-muted text-foreground' 
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
            data-testid={`button-nav-${item.id}`}
          >
            <i className={`${item.icon} w-4 text-sm`}></i>
            <span className="flex-1 text-left">{item.label}</span>
            {item.badge && (
              <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                {item.badge}
              </span>
            )}
          </Link>
        ))}
      </nav>

      {/* Language Selector */}
      <div className="px-4 py-2 border-t border-border">
        <Select value={currentLanguage} onValueChange={setLanguage}>
          <SelectTrigger className="w-full h-8 text-xs" data-testid="select-language">
            <SelectValue placeholder={translate('sidebar.select_language')} />
          </SelectTrigger>
          <SelectContent>
            {LANGUAGES.map((lang) => (
              <SelectItem key={lang.code} value={lang.code} className="text-xs">
                {lang.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Emergency Button */}
      <div className="px-4 py-2">
        <Button 
          className="w-full bg-red-500 hover:bg-red-600 text-white text-xs h-8"
          onClick={() => window.open('tel:108')}
          data-testid="button-emergency"
        >
          <i className="fas fa-phone-alt mr-2 text-xs"></i>
          {translate('sidebar.emergency')}
        </Button>
      </div>
    </div>
  );
}
