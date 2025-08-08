import { useState } from 'react';
import { MessageCircle, X, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const FloatingChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  return (
    <>
      {/* Chat Toggle Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-gradient-primary glow-hover pulse-glow float-animation"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}

      {/* Chat Widget */}
      {isOpen && (
        <div className={`fixed bottom-6 right-6 z-50 transition-smooth ${
          isMinimized ? 'w-80 h-12' : 'w-80 h-96 md:w-96 md:h-[500px]'
        }`}>
          <div className="glass rounded-2xl h-full flex flex-col overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-primary p-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MessageCircle className="h-5 w-5 text-primary-foreground" />
                <span className="font-semibold text-primary-foreground">KPRIET AI</span>
              </div>
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="h-8 w-8 p-0 text-primary-foreground hover:bg-white/20"
                >
                  <Minimize2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 p-0 text-primary-foreground hover:bg-white/20"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Chat Content */}
            {!isMinimized && (
              <div className="flex-1 flex flex-col">
                {/* Messages Area */}
                <div className="flex-1 p-4 overflow-y-auto">
                  <div id="chatbot-container" className="h-full">
                    {/* Placeholder for chatbot integration */}
                    <div className="flex flex-col space-y-4">
                      <div className="bg-muted rounded-lg p-3 max-w-[80%]">
                        <p className="text-sm">👋 Hi! I'm your KPRIET Assistant. How can I help you today?</p>
                      </div>
                      <div className="bg-muted rounded-lg p-3 max-w-[80%]">
                        <p className="text-sm">I can help you with:</p>
                        <ul className="text-xs mt-2 space-y-1">
                          <li>• Admission information</li>
                          <li>• Course details</li>
                          <li>• Hostel information</li>
                          <li>• Food ordering</li>
                          <li>• Campus facilities</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-border">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Type your message..."
                      className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <Button 
                      size="sm" 
                      className="bg-gradient-primary glow-hover"
                    >
                      Send
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingChatWidget;