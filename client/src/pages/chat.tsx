import { useState } from 'react';
import { ChatInterface } from '@/components/ChatInterface';
import { MessageInput } from '@/components/MessageInput';
import { Sidebar } from '@/components/Sidebar';
import { SymptomChecker } from '@/components/SymptomChecker';
import { useChat } from '@/hooks/use-chat';
import { useAuth } from '@/hooks/use-auth';
import { HealthAnalysis } from '@/lib/gemini';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Chat() {
  const { user, loading, login, authError, isAuthAvailable } = useAuth();
  const { messages, isLoading, sendMessage, clearChat } = useChat();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [showSymptomChecker, setShowSymptomChecker] = useState(false);

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
    const analysisMessage = `**🏥 Comprehensive Health Analysis Report**

**📋 Possible Conditions:**
${analysis.possibleConditions.map(condition => `• ${condition}`).join('\n')}

**⚡ Severity Level:** ${analysis.severity.toUpperCase()}

**💡 Recommendations:**
${analysis.recommendations.map(rec => `• ${rec}`).join('\n')}

**🚨 When to Seek Immediate Help:**
${analysis.whenToSeekHelp.map(help => `• ${help}`).join('\n')}

**🏠 Safe Self-Care Steps:**
${analysis.selfCareSteps.map(step => `• ${step}`).join('\n')}

**🛡️ Prevention Tips:**
${analysis.preventiveTips.map(tip => `• ${tip}`).join('\n')}

**⏰ Urgency Assessment:**
${analysis.urgency}

**⚠️ Important Medical Disclaimer:**
${analysis.disclaimer}`;

    sendMessage(analysisMessage);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50" data-testid="page-chat">
      {/* Modern Chat Container */}
      <div className="max-w-6xl mx-auto h-screen flex flex-col p-4">
        {/* Enhanced Chat Header */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-green-600 rounded-t-2xl shadow-xl">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    <i className="fas fa-robot text-2xl text-white"></i>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Swasthik AI</h1>
                  <p className="text-blue-100 text-sm flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                    Online • Ready to assist with your health
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Button 
                  onClick={() => setShowSymptomChecker(true)}
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border border-white/30 transition-all duration-200 hover:scale-105"
                  data-testid="button-symptom-checker"
                >
                  <i className="fas fa-stethoscope mr-2"></i>
                  Quick Check
                </Button>
                <Button 
                  onClick={clearChat}
                  variant="outline"
                  className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border-white/30 transition-all duration-200"
                  data-testid="button-clear-chat"
                >
                  <i className="fas fa-refresh mr-2"></i>
                  New Chat
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Content Area */}
        <div className="flex-1 bg-white/80 backdrop-blur-sm border-x border-gray-200 flex flex-col overflow-hidden">
          <ChatInterface
            messages={messages}
            isLoading={isLoading}
            onClearChat={clearChat}
          />
        </div>

        {/* Message Input Area */}
        <div className="bg-white/90 backdrop-blur-sm rounded-b-2xl border border-t-0 border-gray-200 shadow-xl">
          <MessageInput
            onSendMessage={sendMessage}
            disabled={isLoading}
          />
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
