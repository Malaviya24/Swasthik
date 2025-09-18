import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { ChatHistoryService, ChatSession } from '@/lib/chatHistory';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatDistanceToNow } from 'date-fns';

interface ChatHistoryProps {
  onLoadSession: (session: ChatSession) => void;
  onNewChat: () => void;
}

export function ChatHistory({ onLoadSession, onNewChat }: ChatHistoryProps) {
  const { translate } = useLanguage();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = () => {
    const chatSessions = ChatHistoryService.getSessions();
    setSessions(chatSessions);
  };

  const handleLoadSession = (session: ChatSession) => {
    onLoadSession(session);
    setIsOpen(false);
  };

  const handleDeleteSession = (sessionId: string) => {
    ChatHistoryService.deleteSession(sessionId);
    loadSessions();
  };

  const handleClearAll = () => {
    if (window.confirm(translate('chat.history.clear_all_confirm'))) {
      ChatHistoryService.clearAllSessions();
      loadSessions();
    }
  };

  const formatDate = (date: Date) => {
    return formatDistanceToNow(date, { addSuffix: true });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted/50 h-8 text-xs"
          data-testid="button-chat-history"
        >
          <i className="fas fa-history mr-2 text-xs"></i>
          {translate('chat.history.title')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <i className="fas fa-history mr-2 text-blue-600"></i>
              {translate('chat.history.title')}
            </span>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onNewChat}
                className="text-xs"
              >
                <i className="fas fa-plus mr-1"></i>
                {translate('chat.history.new_chat')}
              </Button>
              {sessions.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="text-xs">
                      <i className="fas fa-ellipsis-v"></i>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleClearAll} className="text-red-600">
                      <i className="fas fa-trash mr-2"></i>
                      {translate('chat.history.clear_all')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-96">
          {sessions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <i className="fas fa-comments text-4xl mb-4 text-gray-300"></i>
              <p className="text-sm">{translate('chat.history.empty')}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sessions.map((session) => (
                <Card 
                  key={session.id} 
                  className="cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-[1.02]"
                  onClick={() => handleLoadSession(session)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm text-gray-900 truncate">
                          {session.title}
                        </h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {session.messages.length} {translate('chat.history.messages')}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {formatDate(session.updatedAt)}
                          </span>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 w-6 p-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <i className="fas fa-ellipsis-v text-xs"></i>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleLoadSession(session)}>
                            <i className="fas fa-folder-open mr-2"></i>
                            {translate('chat.history.load')}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDeleteSession(session.id)}
                            className="text-red-600"
                          >
                            <i className="fas fa-trash mr-2"></i>
                            {translate('chat.history.delete')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
