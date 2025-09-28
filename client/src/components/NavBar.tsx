import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useLanguage, LANGUAGES } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { 
  SignedIn, 
  SignedOut, 
  SignInButton, 
  SignUpButton, 
  UserButton 
} from '@clerk/clerk-react';

interface NavBarProps {
  onShowSymptomChecker?: () => void;
}

export function NavBar({ onShowSymptomChecker }: NavBarProps) {
  const [location] = useLocation();
  const { currentLanguage, setLanguage, translate } = useLanguage();

  const navItems = [
    { href: '/symptom-checker', label: translate('nav.symptom_checker'), icon: 'fas fa-stethoscope' },
    { href: '/medications', label: translate('nav.medications'), icon: 'fas fa-pills' },
    { href: '/health-centers', label: translate('nav.find_centers'), icon: 'fas fa-map-marker-alt' },
    { href: '/reminders', label: translate('nav.reminders'), icon: 'fas fa-calendar-check' },
    { href: '/health-news', label: translate('nav.health_news'), icon: 'fas fa-newspaper' },
    { href: '/vaccine-tracker', label: 'Vaccine Tracker', icon: 'fas fa-shield-alt' }
  ];

  const languages = LANGUAGES;

  const isActive = (href: string) => {
    if (href === '/' && location === '/') return true;
    if (href !== '/' && location.startsWith(href)) return true;
    return false;
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="flex justify-between items-center h-16 lg:h-18 max-w-full">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 lg:space-x-3 hover:opacity-90 transition-opacity flex-shrink-0">
            <div className="w-11 h-11 lg:w-12 lg:h-12 xl:w-14 xl:h-14 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl flex items-center justify-center shadow-lg">
              <i className="fas fa-robot text-white text-lg lg:text-xl xl:text-2xl"></i>
            </div>
            <div className="hidden sm:block flex-shrink-0">
              <h1 className="text-lg lg:text-xl xl:text-2xl 2xl:text-3xl font-bold text-gray-900 leading-tight">{translate('app.title')}</h1>
              <p className="text-xs lg:text-sm xl:text-base text-gray-500 leading-tight">{translate('app.subtitle')}</p>
            </div>
          </Link>


          {/* Right Side Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4 xl:space-x-6 2xl:space-x-8 flex-shrink-0">
            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="px-3 sm:px-4 xl:px-6 h-9 xl:h-10 text-sm xl:text-base" data-testid="button-language">
                  <i className="fas fa-globe mr-2"></i>
                  <span className="hidden sm:inline">{translate('nav.language')}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {languages.map((lang) => (
                  <DropdownMenuItem 
                    key={lang.code} 
                    data-testid={`lang-option-${lang.code}`}
                    onClick={() => setLanguage(lang.code)}
                    className={currentLanguage === lang.code ? 'bg-blue-50' : ''}
                  >
                    <span className="mr-2">{lang.flag}</span>
                    {lang.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Features Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="default" size="sm" className="bg-blue-600 hover:bg-blue-700 px-3 sm:px-4 xl:px-6 h-9 xl:h-10 text-sm xl:text-base" data-testid="button-features-menu">
                  <i className="fas fa-bars mr-2"></i>
                  <span className="hidden sm:inline">{translate('nav.features')}</span>
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
                  <span className="font-medium">{translate('nav.emergency')}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Authentication */}
            <SignedOut>
              <SignInButton mode="modal">
                <Button variant="outline" size="sm" className="px-3 sm:px-4 xl:px-6 h-9 xl:h-10 text-sm xl:text-base">
                  <i className="fas fa-sign-in-alt mr-1 sm:mr-2"></i>
                  <span className="hidden sm:inline">{translate('nav.sign_in')}</span>
                  <span className="sm:hidden">Sign In</span>
                </Button>
              </SignInButton>
            </SignedOut>

            <SignedIn>
              <UserButton 
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "w-9 h-9 xl:w-10 xl:h-10"
                  }
                }}
              />
            </SignedIn>
          </div>
        </div>

      </div>
    </nav>
  );
}