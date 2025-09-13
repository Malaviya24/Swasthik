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


          {/* Right Side Actions */}
          <div className="flex items-center space-x-3">
            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="px-3" data-testid="button-language">
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

            {/* Features Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="default" size="sm" className="bg-blue-600 hover:bg-blue-700 px-3" data-testid="button-features-menu">
                  <i className="fas fa-bars mr-2"></i>
                  <span className="hidden sm:inline">Features</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {navItems.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <DropdownMenuItem className="flex items-center space-x-3 p-3 cursor-pointer" data-testid={`menu-${item.href.replace('/', '')}`}>
                      <i className={`${item.icon} text-blue-600 w-4`}></i>
                      <span className="font-medium">{item.label}</span>
                    </DropdownMenuItem>
                  </Link>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="flex items-center space-x-3 p-3 cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => window.open('tel:108')}
                  data-testid="menu-emergency"
                >
                  <i className="fas fa-phone-alt w-4"></i>
                  <span className="font-medium">Emergency: 108</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

      </div>
    </nav>
  );
}