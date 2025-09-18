import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { ChatInterface } from '@/components/ChatInterface';
import { MessageInput } from '@/components/MessageInput';
import { Sidebar } from '@/components/Sidebar';
import { SymptomChecker } from '@/components/SymptomChecker';
import { ChatHistory } from '@/components/ChatHistory';
import { useChat } from '@/hooks/use-chat';
import { useAuth } from '@/hooks/use-auth';
import { useIsMobile } from '@/hooks/use-mobile';
import { HealthAnalysis } from '@/lib/gemini';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Chat() {
  const { user, loading, login, authError, isAuthAvailable } = useAuth();
  const { messages, isLoading, sendMessage, clearChat, loadSession } = useChat();
  const isMobile = useIsMobile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [showSymptomChecker, setShowSymptomChecker] = useState(false);

  // Listen for custom event to open symptom checker
  useEffect(() => {
    const handleOpenSymptomChecker = () => {
      setShowSymptomChecker(true);
    };

    window.addEventListener('openSymptomChecker', handleOpenSymptomChecker);
    
    return () => {
      window.removeEventListener('openSymptomChecker', handleOpenSymptomChecker);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-primary mb-4"></i>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Skip authentication requirement - allow direct access to chat
  const skipAuth = true;
  
  if (!user && !skipAuth) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white mx-auto mb-4">
              <i className="fas fa-robot text-2xl"></i>
            </div>
            <CardTitle className="text-2xl">Welcome to Swasthik</CardTitle>
            <p className="text-muted-foreground">Your AI Healthcare Assistant</p>
          </CardHeader>
          <CardContent>
            {authError && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800">
                  <i className="fas fa-exclamation-triangle mr-2"></i>
                  {authError}
                </p>
                {!isAuthAvailable && (
                  <p className="text-xs text-amber-700 mt-1">
                    The app will work in demo mode with limited features.
                  </p>
                )}
              </div>
            )}
            <Button 
              onClick={login} 
              className="w-full"
              disabled={!isAuthAvailable}
              data-testid="button-login"
            >
              <i className="fab fa-google mr-2"></i>
              {isAuthAvailable ? 'Sign in with Google' : 'Authentication Unavailable'}
            </Button>
            <p className="text-xs text-muted-foreground mt-4 text-center">
              Sign in to access personalized health assistance, save your conversations, and set health reminders.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSymptomAnalysis = (analysis: HealthAnalysis) => {
    const analysisMessage = `**🏥 Swasthik Health Analysis Report**

**📋 Possible Conditions:**
${analysis.possibleConditions.map(condition => `• ${condition}`).join('\n')}

**⚡ Severity Level:** ${analysis.severity.toUpperCase()}

**💡 Medical Recommendations:**
${analysis.recommendations.map(rec => `• ${rec}`).join('\n')}

**🚨 When to Seek Immediate Help:**
${analysis.whenToSeekHelp.map(help => `• ${help}`).join('\n')}

**🏠 Safe Self-Care Steps:**
${analysis.selfCareSteps.map(step => `• ${step}`).join('\n')}

**🛡️ Prevention Tips:**
${analysis.preventiveTips.map(tip => `• ${tip}`).join('\n')}

**⏰ Urgency Assessment:**
${analysis.urgency}

**🩺 Doctor's Note:**
${analysis.disclaimer}`;

    sendMessage(analysisMessage);
  };

  return (
    <div className="min-h-screen bg-gray-50" data-testid="page-chat">
      <div className="flex h-screen">
        {/* Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onShowSymptomChecker={() => setShowSymptomChecker(true)}
          onLoadSession={loadSession}
          onNewChat={clearChat}
        />
        
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-white">
          {/* Clean Header for All Screen Sizes */}
          <div className="bg-white border-b border-gray-200">
            <div className="flex items-center justify-between px-6 py-4">
              {/* Left: Menu Button (Mobile/Tablet) or Spacer (Desktop) */}
              <div className="flex items-center">
                <Button
                  onClick={() => setIsSidebarOpen(true)}
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg px-3 py-2 lg:hidden"
                  data-testid="button-open-sidebar"
                >
                  <i className="fas fa-bars text-sm"></i>
                </Button>
                <div className="hidden lg:block w-8"></div>
              </div>
              
              {/* Center: Logo and Brand */}
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                  <i className="fas fa-robot text-white text-sm"></i>
                </div>
                <span className="text-sm font-medium text-gray-900">Swasthik AI</span>
              </div>
              
              {/* Right: Quick Check Button */}
              <Button
                onClick={() => setShowSymptomChecker(true)}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-3 py-2"
                data-testid="button-symptom-checker"
              >
                <i className="fas fa-stethoscope text-xs"></i>
                <span className="ml-2 text-xs hidden sm:inline">Quick Check</span>
              </Button>
            </div>
          </div>
          
          {/* Chat Content Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
          <ChatInterface
            messages={messages}
            isLoading={isLoading}
            onClearChat={clearChat}
          />
        </div>

          {/* Message Input Area */}
          <div className="bg-white border-t border-gray-200">
          <MessageInput
            onSendMessage={sendMessage}
            disabled={isLoading}
          />
        </div>
        </div>
      </div>

      {/* Symptom Checker Modal */}
      <SymptomChecker
        open={showSymptomChecker}
        onOpenChange={setShowSymptomChecker}
        onResultReady={handleSymptomAnalysis}
      />
    </div>
  );
}
