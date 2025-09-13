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
        <div className="relative max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-lg rounded-full flex items-center justify-center">
                <i className="fas fa-robot text-4xl"></i>
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6" data-testid="heading-hero">
              Swasthya Mitra
            </h1>
            <p className="text-xl md:text-2xl mb-4 text-blue-100">
              स्वास्थ्य मित्र - Your AI Healthcare Assistant
            </p>
            <p className="text-lg md:text-xl mb-8 max-w-3xl mx-auto text-blue-50">
              Get instant health guidance, symptom analysis, and medical information in your preferred language. 
              Designed specifically for rural and semi-urban communities across India.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/chat">
                <Button 
                  size="lg" 
                  className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 text-lg font-semibold"
                  data-testid="button-start-chat"
                >
                  <i className="fas fa-comments mr-2"></i>
                  Start Health Chat
                </Button>
              </Link>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white/10 px-8 py-3 text-lg"
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
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Comprehensive Healthcare Features
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need for your health and wellness journey, powered by advanced AI technology
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300" data-testid={`card-feature-${index}`}>
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className={`${feature.icon} text-2xl text-white`}></i>
                  </div>
                  <CardTitle className="text-xl font-semibold">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-gray-600">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Language Support Section */}
      <div className="py-16 bg-gradient-to-r from-green-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Multilingual Healthcare Support
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Get health assistance in your preferred language - breaking barriers to healthcare access
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            {languages.map((lang, index) => (
              <div 
                key={index} 
                className="bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow"
                data-testid={`lang-${index}`}
              >
                <span className="text-2xl mr-2">{lang.flag}</span>
                <span className="font-medium text-gray-800">{lang.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">24/7</div>
              <div className="text-gray-600">Available Always</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-green-600 mb-2">6+</div>
              <div className="text-gray-600">Languages Supported</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">95%</div>
              <div className="text-gray-600">Accuracy Rate</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-green-600 mb-2">1000+</div>
              <div className="text-gray-600">Health Topics</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-gradient-to-r from-blue-600 to-green-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Start Your Health Journey?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of users who trust Swasthya Mitra for their healthcare needs
          </p>
          <Link href="/chat">
            <Button 
              size="lg" 
              className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 text-lg font-semibold"
              data-testid="button-cta-chat"
            >
              <i className="fas fa-arrow-right mr-2"></i>
              Get Started Now
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Swasthya Mitra</h3>
              <p className="text-gray-400">
                AI-powered healthcare assistant designed for Indian communities. 
                Providing accessible health information and guidance.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/chat" className="hover:text-white">Health Chat</Link></li>
                <li><Link href="/symptom-checker" className="hover:text-white">Symptom Checker</Link></li>
                <li><Link href="/medications" className="hover:text-white">Medications</Link></li>
                <li><Link href="/health-centers" className="hover:text-white">Find Health Centers</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Emergency</h4>
              <p className="text-gray-400 mb-2">For medical emergencies:</p>
              <Button 
                className="bg-red-600 hover:bg-red-700"
                onClick={() => window.open('tel:108')}
                data-testid="button-footer-emergency"
              >
                <i className="fas fa-phone-alt mr-2"></i>
                Call 108
              </Button>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Swasthya Mitra. Bridging healthcare gaps with AI technology.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}