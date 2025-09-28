import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  SignedIn, 
  SignedOut, 
  SignInButton, 
  SignUpButton 
} from '@clerk/clerk-react';

export default function Landing() {
  const { translate } = useLanguage();
  const features = [
    {
      icon: 'fas fa-robot',
      title: translate('features.ai_powered'),
      description: translate('features.ai_powered_desc')
    },
    {
      icon: 'fas fa-stethoscope',
      title: translate('features.instant_diagnosis'),
      description: translate('features.instant_diagnosis_desc')
    },
    {
      icon: 'fas fa-pills',
      title: translate('features.medication_info'),
      description: translate('features.medication_info_desc')
    },
    {
      icon: 'fas fa-camera',
      title: translate('features.image_analysis'),
      description: translate('features.image_analysis_desc')
    },
    {
      icon: 'fas fa-microphone',
      title: translate('features.voice_interaction'),
      description: translate('features.voice_interaction_desc')
    },
    {
      icon: 'fas fa-map-marker-alt',
      title: translate('features.health_center_finder'),
      description: translate('features.health_center_finder_desc')
    }
  ];

  const languages = [
    { name: 'English', flag: '🇬🇧' },
    { name: 'हिंदी', flag: '🇮🇳' },
    { name: 'বাংলা', flag: '🇧🇩' },
    { name: 'தமிழ்', flag: '🇮🇳' },
    { name: 'తెలుగు', flag: '🇮🇳' },
    { name: 'मराठी', flag: '🇮🇳' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-green-600 text-white">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-16 sm:py-20 md:py-24 lg:py-32 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6 sm:mb-8">
              <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-white/20 backdrop-blur-lg rounded-full flex items-center justify-center">
                <i className="fas fa-robot text-3xl sm:text-4xl lg:text-5xl"></i>
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6 leading-tight" data-testid="heading-hero">
              {translate('app.title')}
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl mb-3 sm:mb-4 text-blue-100">
              {translate('app.subtitle')}
            </p>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-8 max-w-xs sm:max-w-2xl lg:max-w-4xl mx-auto text-blue-50 leading-relaxed px-4">
              {translate('landing.hero_description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 lg:gap-6 justify-center items-center px-4">
              <div className="w-full sm:w-auto max-w-xs">
              <SignedOut>
                <SignUpButton mode="modal">
                  <Button 
                    size="lg" 
                    className="w-full sm:w-auto bg-white text-blue-600 hover:bg-blue-50 px-6 sm:px-8 lg:px-10 py-3 sm:py-4 text-base sm:text-lg lg:text-xl font-semibold shadow-lg hover:shadow-xl transition-all min-w-0 flex-shrink-0"
                    data-testid="button-start-chat"
                  >
                    <i className="fas fa-comments mr-2"></i>
                    {translate('landing.get_started')}
                  </Button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <Link href="/chat">
                  <Button 
                    size="lg" 
                    className="w-full sm:w-auto bg-white text-blue-600 hover:bg-blue-50 px-6 sm:px-8 lg:px-10 py-3 sm:py-4 text-base sm:text-lg lg:text-xl font-semibold shadow-lg hover:shadow-xl transition-all min-w-0 flex-shrink-0"
                    data-testid="button-start-chat"
                  >
                    <i className="fas fa-comments mr-2"></i>
                    {translate('landing.get_started')}
                  </Button>
                </Link>
              </SignedIn>
              </div>
              <div className="w-full sm:w-auto max-w-xs">
              <Button 
                size="lg" 
                className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white px-6 sm:px-8 lg:px-10 py-3 sm:py-4 text-base sm:text-lg lg:text-xl font-semibold shadow-lg hover:shadow-xl transition-all min-w-0 flex-shrink-0"
                data-testid="button-emergency"
                onClick={() => window.open('tel:108')}
              >
                <i className="fas fa-phone-alt mr-2"></i>
                {translate('nav.emergency')}
              </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sign In Section */}
      <div className="py-12 sm:py-16 lg:py-20 bg-gradient-to-r from-blue-50 to-green-50">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 lg:mb-8">
            Ready to Experience AI Healthcare?
          </h2>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-8 lg:mb-10 text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Join thousands of users who trust Swasthik for their healthcare needs. Get personalized health guidance and access to all features.
          </p>
          <SignedOut>
            <SignInButton mode="modal">
              <Button 
                size="lg" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 lg:px-10 py-3 sm:py-4 lg:py-5 text-base sm:text-lg lg:text-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                data-testid="button-signin-section"
              >
                <i className="fas fa-sign-in-alt mr-2"></i>
                {translate('nav.sign_in')} - {translate('landing.get_started')}
              </Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <Link href="/chat">
              <Button 
                size="lg" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 lg:px-10 py-3 sm:py-4 lg:py-5 text-base sm:text-lg lg:text-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                data-testid="button-start-chat-section"
              >
                <i className="fas fa-comments mr-2"></i>
                {translate('landing.get_started')} - Start Chatting
              </Button>
            </Link>
          </SignedIn>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 lg:mb-6">
              {translate('landing.features_heading')}
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-xs sm:max-w-2xl lg:max-w-4xl mx-auto px-4">
              {translate('landing.features_subheading')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg hover:scale-105 transition-all duration-300 border-0 shadow-md" data-testid={`card-feature-${index}`}>
                <CardHeader className="text-center pb-3 sm:pb-4">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-18 lg:h-18 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg">
                    <i className={`${feature.icon} text-xl sm:text-2xl lg:text-3xl text-white`}></i>
                  </div>
                  <CardTitle className="text-lg sm:text-xl lg:text-2xl font-semibold leading-tight">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="text-center text-gray-600 text-sm sm:text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Vaccine Tracker Section */}
      <div className="py-12 sm:py-16 lg:py-20 bg-gradient-to-r from-blue-50 to-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                <i className="fas fa-shield-alt text-3xl sm:text-4xl text-white"></i>
              </div>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 lg:mb-6">
              Vaccine Tracker
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-xs sm:max-w-2xl lg:max-w-4xl mx-auto px-4 mb-6 sm:mb-8">
              Get personalized vaccination schedules and comprehensive vaccine information for India. 
              Stay up-to-date with the latest immunization guidelines from official health authorities.
            </p>
            <Link href="/vaccine-tracker">
              <Button 
                size="lg" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 lg:px-10 py-3 sm:py-4 lg:py-5 text-base sm:text-lg lg:text-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                data-testid="button-vaccine-tracker"
              >
                <i className="fas fa-shield-alt mr-2"></i>
                Access Vaccine Tracker
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Language Support Section */}
      <div className="py-12 sm:py-16 lg:py-20 bg-gradient-to-r from-green-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 lg:mb-6">
            {translate('landing.language_support_heading')}
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8 lg:mb-12 max-w-xs sm:max-w-2xl lg:max-w-4xl mx-auto px-4">
            {translate('landing.language_support_subheading')}
          </p>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-6 max-w-4xl mx-auto">
            {languages.map((lang, index) => (
              <div 
                key={index} 
                className="bg-white rounded-lg p-3 sm:p-4 lg:p-6 shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 flex flex-col items-center"
                data-testid={`lang-${index}`}
              >
                <span className="text-xl sm:text-2xl lg:text-3xl mb-1 sm:mb-2">{lang.flag}</span>
                <span className="font-medium text-gray-800 text-xs sm:text-sm lg:text-base text-center">{lang.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-12 text-center">
            <div className="p-4 sm:p-6 rounded-lg hover:bg-blue-50 transition-colors">
              <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-blue-600 mb-2 sm:mb-3">24/7</div>
              <div className="text-gray-600 text-sm sm:text-base lg:text-lg font-medium">{translate('landing.stats_available_always')}</div>
            </div>
            <div className="p-4 sm:p-6 rounded-lg hover:bg-green-50 transition-colors">
              <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-green-600 mb-2 sm:mb-3">6+</div>
              <div className="text-gray-600 text-sm sm:text-base lg:text-lg font-medium">{translate('landing.stats_languages_supported')}</div>
            </div>
            <div className="p-4 sm:p-6 rounded-lg hover:bg-blue-50 transition-colors">
              <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-blue-600 mb-2 sm:mb-3">95%</div>
              <div className="text-gray-600 text-sm sm:text-base lg:text-lg font-medium">{translate('landing.stats_accuracy_rate')}</div>
            </div>
            <div className="p-4 sm:p-6 rounded-lg hover:bg-green-50 transition-colors">
              <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-green-600 mb-2 sm:mb-3">1000+</div>
              <div className="text-gray-600 text-sm sm:text-base lg:text-lg font-medium">{translate('landing.stats_health_topics')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-12 sm:py-16 lg:py-20 bg-gradient-to-r from-blue-600 to-green-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 lg:mb-8 leading-tight">
            {translate('landing.cta_heading')}
          </h2>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-8 lg:mb-10 text-blue-100 max-w-2xl mx-auto leading-relaxed">
            {translate('landing.cta_subheading')}
          </p>
          <SignedOut>
            <SignUpButton mode="modal">
              <Button 
                size="lg" 
                className="bg-white text-blue-600 hover:bg-blue-50 px-6 sm:px-8 lg:px-10 py-3 sm:py-4 lg:py-5 text-base sm:text-lg lg:text-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                data-testid="button-cta-chat"
              >
                <i className="fas fa-arrow-right mr-2"></i>
                {translate('landing.get_started_now')}
              </Button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <Link href="/chat">
              <Button 
                size="lg" 
                className="bg-white text-blue-600 hover:bg-blue-50 px-6 sm:px-8 lg:px-10 py-3 sm:py-4 lg:py-5 text-base sm:text-lg lg:text-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                data-testid="button-cta-chat"
              >
                <i className="fas fa-arrow-right mr-2"></i>
                {translate('landing.get_started_now')}
              </Button>
            </Link>
          </SignedIn>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 sm:py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
            <div className="sm:col-span-2 lg:col-span-1">
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-3 sm:mb-4">Swasthik</h3>
              <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
                AI-powered healthcare assistant designed for Indian communities. 
                Providing accessible health information and guidance.
              </p>
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400 text-sm sm:text-base">
                <li><Link href="/chat" className="hover:text-white transition-colors">Health Chat</Link></li>
                <li><Link href="/symptom-checker" className="hover:text-white transition-colors">Symptom Checker</Link></li>
                <li><Link href="/medications" className="hover:text-white transition-colors">Medications</Link></li>
                <li><Link href="/health-centers" className="hover:text-white transition-colors">Find Health Centers</Link></li>
                <li><Link href="/vaccine-tracker" className="hover:text-white transition-colors">Vaccine Tracker</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Emergency</h4>
              <p className="text-gray-400 mb-3 sm:mb-4 text-sm sm:text-base">For medical emergencies:</p>
              <Button 
                className="bg-red-600 hover:bg-red-700 px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium transition-all"
                onClick={() => window.open('tel:108')}
                data-testid="button-footer-emergency"
              >
                <i className="fas fa-phone-alt mr-2"></i>
                Call 108
              </Button>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-6 sm:mt-8 lg:mt-12 pt-6 sm:pt-8 text-center text-gray-400">
            <p className="text-xs sm:text-sm">&copy; 2025 Swasthik. Bridging healthcare gaps with AI technology.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}