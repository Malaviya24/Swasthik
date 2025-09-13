import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';

interface NavBarProps {
  onShowSymptomChecker?: () => void;
}

export function NavBar({ onShowSymptomChecker }: NavBarProps) {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { href: '/symptom-checker', label: 'Symptom Checker', icon: 'fas fa-stethoscope' },
    { href: '/medications', label: 'Medications', icon: 'fas fa-pills' },
    { href: '/health-centers', label: 'Find Centers', icon: 'fas fa-map-marker-alt' },
    { href: '/reminders', label: 'Reminders', icon: 'fas fa-calendar-check' },
    { href: '/health-news', label: 'Health News', icon: 'fas fa-newspaper' }
  ];

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
    { code: 'bn', name: 'বাংলা', flag: '🇧🇩' },
    { code: 'ta', name: 'தமிழ்', flag: '🇮🇳' },
    { code: 'te', name: 'తెలుగు', flag: '🇮🇳' },
    { code: 'mr', name: 'मराठी', flag: '🇮🇳' }
  ];

  const isActive = (href: string) => {
    if (href === '/' && location === '/') return true;
    if (href !== '/' && location.startsWith(href)) return true;
    return false;
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
              <i className="fas fa-robot text-white text-lg"></i>
            </div>
            <div className="hidden md:block">
              <h1 className="text-xl font-bold text-gray-900">Swasthya Mitra</h1>
              <p className="text-xs text-gray-500">AI Healthcare Assistant</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive(item.href) ? "default" : "ghost"}
                  className={`flex items-center space-x-2 px-3 py-2 text-sm ${
                    isActive(item.href) 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                  data-testid={`nav-${item.href.replace('/', '') || 'home'}`}
                >
                  <i className={item.icon}></i>
                  <span>{item.label}</span>
                </Button>
              </Link>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" data-testid="button-language">
                  <i className="fas fa-globe mr-2"></i>
                  <span className="hidden sm:inline">Language</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {languages.map((lang) => (
                  <DropdownMenuItem key={lang.code} data-testid={`lang-option-${lang.code}`}>
                    <span className="mr-2">{lang.flag}</span>
                    {lang.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Emergency Button */}
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => window.open('tel:108')}
              data-testid="button-emergency-nav"
            >
              <i className="fas fa-phone-alt mr-2"></i>
              <span className="hidden sm:inline">Emergency</span>
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-200" data-testid="mobile-menu">
            <div className="grid grid-cols-2 gap-2">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive(item.href) ? "default" : "outline"}
                    className={`w-full flex items-center justify-start space-x-2 px-3 py-2 text-sm ${
                      isActive(item.href) 
                        ? 'bg-blue-600 text-white' 
                        : 'text-gray-700 hover:text-blue-600'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    data-testid={`mobile-nav-${item.href.replace('/', '') || 'home'}`}
                  >
                    <i className={item.icon}></i>
                    <span>{item.label}</span>
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}