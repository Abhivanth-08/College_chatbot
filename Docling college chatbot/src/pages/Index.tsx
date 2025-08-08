import { useEffect, useState } from 'react';
import { 
  Bot, 
  GraduationCap, 
  Home, 
  Utensils, 
  Calendar, 
  Users, 
  MapPin, 
  MessageSquare,
  Star,
  Mail,
  Phone,
  Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import FloatingChatWidget from '@/components/FloatingChatWidget';
import heroImage from '@/assets/hero-college-bg.jpg';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      icon: GraduationCap,
      title: "Admission Information",
      description: "Get instant answers about admission requirements, deadlines, and application procedures."
    },
    {
      icon: Calendar,
      title: "Course Details",
      description: "Explore course curricula, schedules, faculty information, and academic programs."
    },
    {
      icon: Home,
      title: "Hostel Information",
      description: "Find details about hostel facilities, room allocation, and accommodation options."
    },
    {
      icon: Utensils,
      title: "Food Ordering",
      description: "Order food from campus cafeterias and track your meal preferences.",
      comingSoon: true
    },
    {
      icon: MapPin,
      title: "Campus Navigation",
      description: "Get directions to buildings, facilities, and important campus locations.",
      comingSoon: true
    },
    {
      icon: Users,
      title: "Student Services",
      description: "Access information about student activities, clubs, and support services.",
      comingSoon: true
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar />
      
      {/* Hero Section */}
      <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${heroImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          <div className="absolute inset-0 bg-background/60"></div>
        </div>
        
        <div className={`relative z-10 text-center px-4 transition-smooth transform ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <div className="max-w-4xl mx-auto">
            <Bot className="h-20 w-20 mx-auto mb-6 text-primary neon-text float-animation" />
            <h1 className="text-5xl md:text-7xl font-bold mb-6 neon-text">
              KPRIET AI Assistant
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-foreground/90 max-w-2xl mx-auto">
              Your intelligent campus companion for KPR Institute of Engineering and Technology
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="gradient" 
                size="lg" 
                className="text-lg px-8 py-4"
                onClick={() => navigate('/chatbot')}
              >
                <MessageSquare className="h-5 w-5 mr-2" />
                Start Chatting
              </Button>
              <Button 
                variant="neon" 
                size="lg" 
                className="text-lg px-8 py-4"
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Explore Features
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 neon-text-accent">
              About KPRIET AI Assistant
            </h2>
            <p className="text-xl text-foreground/80 max-w-3xl mx-auto leading-relaxed">
              Powered by advanced AI technology, KPRIET Assistant is designed to revolutionize your campus experience. 
              Get instant answers, personalized recommendations, and seamless access to all KPR Institute services.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="glass p-8 text-center glow-hover">
              <Star className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-3 text-foreground">24/7 Availability</h3>
              <p className="text-foreground/70">
                Access information and services anytime, anywhere on campus.
              </p>
            </Card>
            
            <Card className="glass p-8 text-center glow-hover">
              <Bot className="h-12 w-12 mx-auto mb-4 text-accent" />
              <h3 className="text-xl font-semibold mb-3 text-foreground">AI-Powered</h3>
              <p className="text-foreground/70">
                Advanced natural language processing for human-like conversations.
              </p>
            </Card>
            
            <Card className="glass p-8 text-center glow-hover">
              <Users className="h-12 w-12 mx-auto mb-4 text-secondary" />
              <h3 className="text-xl font-semibold mb-3 text-foreground">Personalized</h3>
              <p className="text-foreground/70">
                Tailored responses based on your academic profile and preferences.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 neon-text">
              Powerful Features
            </h2>
            <p className="text-xl text-foreground/80 max-w-3xl mx-auto">
              Discover all the ways KPRIET AI Assistant can enhance your campus experience
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card 
                  key={index} 
                  className="glass p-6 glow-hover transition-smooth hover:scale-105 relative"
                >
                  <Icon className="h-10 w-10 mb-4 text-primary" />
                  <h3 className="text-xl font-semibold mb-3 text-foreground flex items-center gap-2">
                    {feature.title}
                    {feature.comingSoon && (
                      <span className="text-xs bg-accent/20 text-accent px-2 py-1 rounded-full">
                        Coming Soon
                      </span>
                    )}
                  </h3>
                  <p className="text-foreground/70">
                    {feature.description}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Try Chatbot Section */}
      <section id="chatbot" className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 neon-text-accent">
              Try the AI Assistant
            </h2>
            <p className="text-xl text-foreground/80 mb-8">
              Experience the power of AI-driven campus assistance
            </p>
          </div>
          
          <Card className="glass p-8">
            <div className="flex items-center justify-center mb-6">
              <MessageSquare className="h-16 w-16 text-primary neon-text" />
            </div>
            
            {/* Chatbot Integration Container */}
            <div 
              id="chatbot-container" 
              className="min-h-[400px] bg-muted/20 rounded-lg border border-glass-border/30 flex items-center justify-center"
            >
              <div className="text-center">
                <Bot className="h-16 w-16 mx-auto mb-4 text-primary/50" />
                <p className="text-foreground/60 mb-4">
                  Chatbot integration placeholder
                </p>
                <p className="text-sm text-foreground/40">
                  This container is ready for your chatbot implementation
                </p>
                <Button 
                  variant="gradient" 
                  className="mt-4"
                  onClick={() => navigate('/chatbot')}
                >
                  Launch AI Assistant
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 neon-text">
              Contact & Feedback
            </h2>
            <p className="text-xl text-foreground/80">
              Have questions or suggestions? We'd love to hear from you!
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Contact Info */}
            <Card className="glass p-8">
              <h3 className="text-2xl font-semibold mb-6 text-foreground">Get in Touch</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-primary" />
                  <span className="text-foreground/80">support@kpriet.ac.in</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-primary" />
                  <span className="text-foreground/80">+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-primary" />
                  <span className="text-foreground/80">KPRIET Campus, Coimbatore</span>
                </div>
              </div>
            </Card>
            
            {/* Feedback Form */}
            <Card className="glass p-8">
              <h3 className="text-2xl font-semibold mb-6 text-foreground">Send Feedback</h3>
              <form className="space-y-4">
                <input
                  type="text"
                  placeholder="Your Name"
                  className="w-full bg-background/50 border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  type="email"
                  placeholder="Your Email"
                  className="w-full bg-background/50 border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <textarea
                  placeholder="Your Message"
                  rows={4}
                  className="w-full bg-background/50 border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                ></textarea>
                <Button variant="gradient" className="w-full">
                  <Send className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border/30">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Bot className="h-6 w-6 text-primary" />
            <span className="text-lg font-semibold text-foreground">KPRIET AI Assistant</span>
          </div>
          <p className="text-foreground/60">
            © 2024 KPRIET AI Assistant. All rights reserved. Powered by advanced AI technology.
          </p>
        </div>
      </footer>

      {/* Floating Chat Widget */}
      <FloatingChatWidget />
    </div>
  );
};

export default Index;
