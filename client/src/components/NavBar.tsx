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
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
        <div className="flex justify-between items-center h-16 lg:h-18">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 lg:space-x-3 hover:opacity-90 transition-opacity">
            <div className="w-11 h-11 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl flex items-center justify-center shadow-lg">
              <i className="fas fa-robot text-white text-lg lg:text-xl"></i>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg lg:text-xl xl:text-2xl font-bold text-gray-900 leading-tight">Swasthya Mitra</h1>
              <p className="text-xs lg:text-sm text-gray-500 leading-tight">AI Healthcare Assistant</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1 xl:space-x-2">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive(item.href) ? "default" : "ghost"}
                  className={`flex items-center space-x-2 px-3 xl:px-4 py-2 text-sm xl:text-base transition-all ${
                    isActive(item.href) 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                  data-testid={`nav-${item.href.replace('/', '') || 'home'}`}
                >
                  <i className={item.icon}></i>
                  <span className="whitespace-nowrap">{item.label}</span>
                </Button>
              </Link>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2 lg:space-x-3 xl:space-x-4">
            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="lg:px-3 xl:px-4" data-testid="button-language">
                  <i className="fas fa-globe mr-1 lg:mr-2"></i>
                  <span className="hidden md:inline">Language</span>
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
              className="lg:px-3 xl:px-4 font-medium"
              onClick={() => window.open('tel:108')}
              data-testid="button-emergency-nav"
            >
              <i className="fas fa-phone-alt mr-1 lg:mr-2"></i>
              <span className="hidden md:inline">Emergency</span>
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
          <div className="lg:hidden py-3 sm:py-4 border-t border-gray-200 bg-gray-50" data-testid="mobile-menu">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive(item.href) ? "default" : "outline"}
                    className={`w-full flex items-center justify-start space-x-3 px-4 py-3 text-sm font-medium ${
                      isActive(item.href) 
                        ? 'bg-blue-600 text-white shadow-md' 
                        : 'text-gray-700 hover:text-blue-600 bg-white border-gray-300'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    data-testid={`mobile-nav-${item.href.replace('/', '') || 'home'}`}
                  >
                    <i className={`${item.icon} text-base`}></i>
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