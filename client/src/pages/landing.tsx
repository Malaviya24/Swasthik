import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'wouter';

export default function Landing() {
  const features = [
    {
      icon: 'fas fa-robot',
      title: 'AI Health Assistant',
      description: 'Get instant health guidance powered by advanced AI technology trained for Indian healthcare needs'
    },
    {
      icon: 'fas fa-stethoscope',
      title: 'Symptom Checker',
      description: 'Analyze your symptoms with our intelligent symptom checker and get personalized health recommendations'
    },
    {
      icon: 'fas fa-pills',
      title: 'Medicine Information',
      description: 'Search and get detailed information about medications, dosages, and potential side effects'
    },
    {
      icon: 'fas fa-camera',
      title: 'Image Analysis',
      description: 'Upload photos of health conditions and get AI-powered analysis and medical guidance'
    },
    {
      icon: 'fas fa-microphone',
      title: 'Voice Interaction',
      description: 'Speak your health concerns and receive voice responses in your preferred language'
    },
    {
      icon: 'fas fa-map-marker-alt',
      title: 'Health Center Finder',
      description: 'Find nearby hospitals, clinics, and healthcare facilities with directions and contact details'
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
              Swasthya Mitra
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl mb-3 sm:mb-4 text-blue-100">
              स्वास्थ्य मित्र - Your AI Healthcare Assistant
            </p>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-8 max-w-xs sm:max-w-2xl lg:max-w-4xl mx-auto text-blue-50 leading-relaxed px-4">
              Get instant health guidance, symptom analysis, and medical information in your preferred language. 
              Designed specifically for rural and semi-urban communities across India.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 lg:gap-6 justify-center items-center px-4">
              <Link href="/chat">
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto bg-white text-blue-600 hover:bg-blue-50 px-6 sm:px-8 lg:px-10 py-3 sm:py-4 text-base sm:text-lg lg:text-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                  data-testid="button-start-chat"
                >
                  <i className="fas fa-comments mr-2"></i>
                  Start Health Chat
                </Button>
              </Link>
              <Button 
                size="lg" 
                className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white border-2 border-red-600 hover:border-red-700 px-6 sm:px-8 lg:px-10 py-3 sm:py-4 text-base sm:text-lg lg:text-xl font-medium transition-all shadow-lg"
                data-testid="button-emergency"
                onClick={() => window.open('tel:108')}
              >
                <i className="fas fa-phone-alt mr-2"></i>
                Emergency: 108
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 lg:mb-6">
              Comprehensive Healthcare Features
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-xs sm:max-w-2xl lg:max-w-4xl mx-auto px-4">
              Everything you need for your health and wellness journey, powered by advanced AI technology
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

      {/* Language Support Section */}
      <div className="py-12 sm:py-16 lg:py-20 bg-gradient-to-r from-green-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 lg:mb-6">
            Multilingual Healthcare Support
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8 lg:mb-12 max-w-xs sm:max-w-2xl lg:max-w-4xl mx-auto px-4">
            Get health assistance in your preferred language - breaking barriers to healthcare access
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
              <div className="text-gray-600 text-sm sm:text-base lg:text-lg font-medium">Available Always</div>
            </div>
            <div className="p-4 sm:p-6 rounded-lg hover:bg-green-50 transition-colors">
              <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-green-600 mb-2 sm:mb-3">6+</div>
              <div className="text-gray-600 text-sm sm:text-base lg:text-lg font-medium">Languages Supported</div>
            </div>
            <div className="p-4 sm:p-6 rounded-lg hover:bg-blue-50 transition-colors">
              <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-blue-600 mb-2 sm:mb-3">95%</div>
              <div className="text-gray-600 text-sm sm:text-base lg:text-lg font-medium">Accuracy Rate</div>
            </div>
            <div className="p-4 sm:p-6 rounded-lg hover:bg-green-50 transition-colors">
              <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-green-600 mb-2 sm:mb-3">1000+</div>
              <div className="text-gray-600 text-sm sm:text-base lg:text-lg font-medium">Health Topics</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-12 sm:py-16 lg:py-20 bg-gradient-to-r from-blue-600 to-green-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 lg:mb-8 leading-tight">
            Ready to Start Your Health Journey?
          </h2>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-8 lg:mb-10 text-blue-100 max-w-2xl mx-auto leading-relaxed">
            Join thousands of users who trust Swasthya Mitra for their healthcare needs
          </p>
          <Link href="/chat">
            <Button 
              size="lg" 
              className="bg-white text-blue-600 hover:bg-blue-50 px-6 sm:px-8 lg:px-10 py-3 sm:py-4 lg:py-5 text-base sm:text-lg lg:text-xl font-semibold shadow-lg hover:shadow-xl transition-all"
              data-testid="button-cta-chat"
            >
              <i className="fas fa-arrow-right mr-2"></i>
              Get Started Now
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 sm:py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
            <div className="sm:col-span-2 lg:col-span-1">
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-3 sm:mb-4">Swasthya Mitra</h3>
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
            <p className="text-xs sm:text-sm">&copy; 2024 Swasthya Mitra. Bridging healthcare gaps with AI technology.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}