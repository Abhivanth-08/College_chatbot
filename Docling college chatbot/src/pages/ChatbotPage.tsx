import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, ArrowLeft, Sparkles, Brain, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const ChatbotPage = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm KPRIET AI Assistant. I'm here to help you with information about KPR Institute of Engineering and Technology. How can I assist you today?",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const newUserMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMessage]);
    const currentInputText = inputText;
    setInputText('');
    setIsTyping(true);

    try {
      const response = await axios.post('http://localhost:8000/ask', {
        question: currentInputText,
      });

      console.log("Backend response:", response.data);

      let botText = "Sorry, something went wrong.";
      if (response.data.answer) {
        botText = response.data.answer;
      } else if (response.data.error) {
        botText = "Error: " + response.data.error;
      }

      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: botText,
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);

    } catch (error) {
      console.error("Error fetching bot response:", error);
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm having trouble connecting. Please try again later.",
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const suggestedQuestions = [
    "Tell me about admission process",
    "What courses do you offer?",
    "Campus facilities and infrastructure",
    "Placement opportunities"
  ];

  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col">
      {/* Header */}
      <header className="border-b border-border/30 bg-background/10 backdrop-blur-lg">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/')}
              className="text-foreground hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
            <div className="flex items-center space-x-2">
              <Brain className="h-6 w-6 text-primary neon-text" />
              <span className="text-xl font-bold text-foreground">KPRIET AI Assistant</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-accent animate-pulse" />
            <span className="text-sm text-foreground/70">Powered by AI</span>
          </div>
        </div>
      </header>

      {/* Main Chat Container */}
      <div className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <Card className="glass h-full flex flex-col">
          {/* Chat Messages */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start space-x-3 ${
                  message.isUser ? 'justify-end' : 'justify-start'
                }`}
              >
                {!message.isUser && (
                  <div className="bg-gradient-primary p-2 rounded-full glow-subtle">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                )}
                
                <div
                  className={`max-w-[80%] p-4 rounded-2xl ${
                    message.isUser
                      ? 'bg-primary text-primary-foreground ml-auto'
                      : 'bg-muted/80 text-foreground'
                  } ${message.isUser ? '' : 'glow-subtle'}`}
                >
                  <div
                    className="text-sm leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: message.text }}></div>
                  <span className="text-xs opacity-60 mt-1 block">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>

                {message.isUser && (
                  <div className="bg-accent/20 p-2 rounded-full">
                    <User className="h-4 w-4 text-accent" />
                  </div>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-start space-x-3">
                <div className="bg-gradient-primary p-2 rounded-full glow-subtle">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="bg-muted/80 p-4 rounded-2xl glow-subtle">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.1s]"></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Questions */}
          {messages.length === 1 && (
            <div className="px-6 pb-4">
              <p className="text-sm text-foreground/70 mb-3">Try asking about:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => setInputText(question)}
                    className="text-xs glass hover:bg-primary/10"
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-6 border-t border-border/30">
            <div className="flex space-x-3">
              <div className="flex-1 relative">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Ask me anything about KPRIET..."
                  className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 pr-12 text-foreground placeholder:text-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary resize-none min-h-[50px] max-h-32"
                  rows={1}
                />
                <div className="absolute right-3 top-3 flex items-center space-x-1">
                  <Zap className="h-4 w-4 text-primary/50" />
                </div>
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={!inputText.trim() || isTyping}
                variant="gradient"
                size="lg"
                className="px-6 glow-hover"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-foreground/40 mt-2 text-center">
              Press Enter to send • Shift+Enter for new line
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ChatbotPage;
