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
            <CardTitle className="text-2xl">Welcome to Swasthya Mitra</CardTitle>
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
    const analysisMessage = `**Symptom Analysis Results:**

**Possible Condition:** ${analysis.condition}

**Key Symptoms:** ${analysis.symptoms.join(', ')}

**Urgency Level:** ${analysis.urgency.toUpperCase()}

**Recommendations:**
${analysis.recommendations.map(rec => `• ${rec}`).join('\n')}

**Important Disclaimer:** ${analysis.disclaimer}`;

    sendMessage(analysisMessage);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50" data-testid="page-chat">
      {/* Chat Container */}
      <div className="flex-1 max-w-7xl mx-auto w-full bg-white shadow-lg rounded-t-lg overflow-hidden m-2 sm:m-4 lg:m-6">
        {/* Chat Header */}
        <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white p-3 sm:p-4 lg:p-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center space-x-3 min-w-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <i className="fas fa-robot text-lg sm:text-xl lg:text-2xl"></i>
              </div>
              <div className="min-w-0">
                <h2 className="font-semibold text-base sm:text-lg lg:text-xl truncate">Swasthya Mitra AI</h2>
                <p className="text-xs sm:text-sm text-blue-100">
                  <span className="inline-block w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                  Online - Ready to help
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-3 flex-wrap gap-2">
              <Button 
                onClick={() => setShowSymptomChecker(true)}
                variant="secondary"
                size="sm"
                className="bg-white/20 hover:bg-white/30 text-white border-white/30 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
                data-testid="button-symptom-checker"
              >
                <i className="fas fa-stethoscope mr-1 sm:mr-2"></i>
                <span className="hidden sm:inline">Symptom Checker</span>
                <span className="sm:hidden">Symptoms</span>
              </Button>
              <Button 
                onClick={clearChat}
                variant="secondary"
                size="sm"
                className="bg-white/20 hover:bg-white/30 text-white border-white/30 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
                data-testid="button-clear-chat"
              >
                <i className="fas fa-trash mr-1 sm:mr-2"></i>
                <span className="hidden sm:inline">Clear</span>
                <span className="sm:hidden">Clear</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col h-[calc(100vh-8rem)] sm:h-[calc(100vh-10rem)] lg:h-[calc(100vh-12rem)]">
          <ChatInterface
            messages={messages}
            isLoading={isLoading}
            onClearChat={clearChat}
          />
          
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
