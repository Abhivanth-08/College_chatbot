import { useState, useEffect } from 'react';
import { Menu, X, Bot, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsOpen(false);
    }
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-smooth ${
      scrolled ? 'glass backdrop-blur-lg' : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Bot className="h-8 w-8 text-primary neon-text" />
            <span className="text-xl font-bold neon-text">KPRIET AI</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => scrollToSection('hero')}
              className="text-foreground hover:text-primary transition-smooth"
            >
              Home
            </button>
            <button 
              onClick={() => scrollToSection('about')}
              className="text-foreground hover:text-primary transition-smooth"
            >
              About
            </button>
            <button 
              onClick={() => scrollToSection('features')}
              className="text-foreground hover:text-primary transition-smooth"
            >
              Features
            </button>
            <button 
              onClick={() => scrollToSection('chatbot')}
              className="text-foreground hover:text-primary transition-smooth"
            >
              Try Bot
            </button>
            <button 
              onClick={() => scrollToSection('contact')}
              className="text-foreground hover:text-primary transition-smooth"
            >
              Contact
            </button>
            <Button variant="default" className="bg-gradient-primary glow-hover">
              <MessageCircle className="h-4 w-4 mr-2" />
              Chat Now
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-foreground hover:text-primary transition-smooth"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-4 glass rounded-lg p-4">
            <button 
              onClick={() => scrollToSection('hero')}
              className="block w-full text-left text-foreground hover:text-primary transition-smooth"
            >
              Home
            </button>
            <button 
              onClick={() => scrollToSection('about')}
              className="block w-full text-left text-foreground hover:text-primary transition-smooth"
            >
              About
            </button>
            <button 
              onClick={() => scrollToSection('features')}
              className="block w-full text-left text-foreground hover:text-primary transition-smooth"
            >
              Features
            </button>
            <button 
              onClick={() => scrollToSection('chatbot')}
              className="block w-full text-left text-foreground hover:text-primary transition-smooth"
            >
              Try Bot
            </button>
            <button 
              onClick={() => scrollToSection('contact')}
              className="block w-full text-left text-foreground hover:text-primary transition-smooth"
            >
              Contact
            </button>
            <Button variant="default" className="w-full bg-gradient-primary glow-hover">
              <MessageCircle className="h-4 w-4 mr-2" />
              Chat Now
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;