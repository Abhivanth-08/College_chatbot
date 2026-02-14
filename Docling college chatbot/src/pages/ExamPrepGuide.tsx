import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, BookOpen, Search, Sparkles, ListChecks, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';

type ExamType = 'CIAT-1' | 'CIAT-2' | 'SEM';

interface Question {
  id: string;
  text: string;
}

interface Message {
  id: string;
  isUser: boolean;
  html: string;
  timestamp: Date;
}

const mockBank: Record<string, Record<ExamType, Question[]>> = {
  'CS101': {
    'CIAT-1': [
      { id: 'q1', text: 'Explain time complexity of common sorting algorithms.' },
      { id: 'q2', text: 'Describe stack vs queue with real-world examples.' },
      { id: 'q3', text: 'What are hash collisions and how to handle them?' }
    ],
    'CIAT-2': [
      { id: 'q4', text: 'Compare BFS and DFS with use-cases.' },
      { id: 'q5', text: 'Explain dynamic programming with the knapsack problem.' }
    ],
    'SEM': [
      { id: 'q6', text: 'Design a system to index and search documents efficiently.' },
      { id: 'q7', text: 'Discuss Big-O, Big-Theta, and Big-Omega with proofs.' }
    ]
  },
  'MA201': {
    'CIAT-1': [
      { id: 'q8', text: 'State and prove Mean Value Theorem.' },
      { id: 'q9', text: 'Solve linear ODEs using integrating factor.' }
    ],
    'CIAT-2': [
      { id: 'q10', text: 'Explain eigenvalues, eigenvectors and diagonalization.' }
    ],
    'SEM': [
      { id: 'q11', text: 'Applications of Fourier series in signal processing.' }
    ]
  }
};

const formatCourse = (code: string) => code.trim().toUpperCase();

const ExamPrepGuide = () => {
  const navigate = useNavigate();
  const [courseCode, setCourseCode] = useState('');
  const [selectedExam, setSelectedExam] = useState<ExamType | ''>('');
  const [messages, setMessages] = useState<Message[]>([{
    id: 'welcome',
    isUser: false,
    html: "<b>Welcome to Exam Prep Guide.</b> Enter your course code, choose exam type, and get curated important questions.",
    timestamp: new Date()
  }]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const searchQuestions = () => {
    const normalized = formatCourse(courseCode);
    if (!normalized) return;

    setMessages(prev => ([
      ...prev,
      {
        id: `u-${Date.now()}`,
        isUser: true,
        html: `Course: <b>${normalized}</b>${selectedExam ? ` • Exam: <b>${selectedExam}</b>` : ''}`,
        timestamp: new Date()
      }
    ]));

    const bank = mockBank[normalized];
    const examKey: ExamType | undefined = selectedExam ? selectedExam : (Object.keys(bank || {})[0] as ExamType);

    let html = '';
    if (!bank) {
      html = `No data found for <b>${normalized}</b>. Try another code (e.g., <code>CS101</code>, <code>MA201</code>).`;
    } else if (!examKey || !bank[examKey] || bank[examKey].length === 0) {
      html = `No questions for <b>${normalized}</b> - <b>${selectedExam || 'selected exam'}</b>.`;
    } else {
      const items = bank[examKey]
        .map((q, i) => `<li class="mb-2"><span class="text-primary font-medium mr-2">${i + 1}.</span>${q.text}</li>`) 
        .join('');
      html = `
        <div class="space-y-2">
          <div class="flex items-center gap-2">
            <ListChecks class="inline-block h-4 w-4" />
            <span class="font-semibold">Important Questions for ${normalized} — ${examKey}</span>
          </div>
          <ol class="pl-1">${items}</ol>
          <div class="text-xs text-foreground/60 mt-2">Tip: Prioritize understanding concepts, not memorizing answers.</div>
        </div>`;
    }

    setMessages(prev => ([
      ...prev,
      {
        id: `b-${Date.now()}`,
        isUser: false,
        html,
        timestamp: new Date()
      }
    ]));
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col">
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
              <GraduationCap className="h-6 w-6 text-primary neon-text" />
              <span className="text-xl font-bold text-foreground">Exam Prep Guide</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-accent animate-pulse" />
            <span className="text-sm text-foreground/70">Curated important questions</span>
          </div>
        </div>
      </header>

      <div className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <Card className="glass h-full flex flex-col">
          {/* Input controls */}
          <div className="p-6 border-b border-border/30">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_180px_auto] gap-3">
              <div className="relative">
                <input 
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') searchQuestions(); }}
                  placeholder="Enter course code (e.g., CS101)"
                  className="w-full bg-background/50 border border-border rounded-xl pl-10 pr-3 py-3 text-foreground placeholder:text-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <Search className="h-4 w-4 absolute left-3 top-3.5 text-foreground/50" />
              </div>

              <Select onValueChange={(v) => setSelectedExam(v as ExamType)}>
                <SelectTrigger className="w-full bg-background/50 border-border/60">
                  <SelectValue placeholder="Select exam type" />
                </SelectTrigger>
                <SelectContent className="bg-background border-border">
                  <SelectItem value="CIAT-1">CIAT-1</SelectItem>
                  <SelectItem value="CIAT-2">CIAT-2</SelectItem>
                  <SelectItem value="SEM">Semester</SelectItem>
                </SelectContent>
              </Select>

              <Button onClick={searchQuestions} variant="gradient" className="px-6">
                <BookOpen className="h-4 w-4 mr-2" />
                Show Questions
              </Button>
            </div>
            <p className="text-xs text-foreground/50 mt-2">Try sample codes: CS101, MA201</p>
          </div>

          {/* Chat-like stream */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6">
            {messages.map((m) => (
              <div key={m.id} className={`flex items-start space-x-3 ${m.isUser ? 'justify-end' : 'justify-start'}`}>
                {!m.isUser && (
                  <div className="bg-gradient-primary p-2 rounded-full glow-subtle">
                    <BookOpen className="h-4 w-4 text-white" />
                  </div>
                )}

                <div className={`max-w-[80%] p-4 rounded-2xl ${m.isUser ? 'bg-primary text-primary-foreground ml-auto' : 'bg-muted/80 text-foreground glow-subtle'}`}>
                  <div className="text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: m.html }} />
                  <span className="text-xs opacity-60 mt-1 block">{m.timestamp.toLocaleTimeString()}</span>
                </div>

                {m.isUser && (
                  <div className="bg-accent/20 p-2 rounded-full">
                    <BookOpen className="h-4 w-4 text-accent" />
                  </div>
                )}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ExamPrepGuide;


