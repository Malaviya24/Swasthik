import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { SignInButton, SignedIn, SignedOut } from '@clerk/clerk-react';
import { useLocation } from 'wouter';
import { useEffect } from 'react';
import RemindersPage from './reminders-page';

export default function LoginRedirect() {
  const { translate } = useLanguage();
  const [, setLocation] = useLocation();

  const handleGoBack = () => {
    setLocation('/');
  };

  return (
    <>
      <SignedOut>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center px-4">
          <Card className="w-full max-w-md mx-auto shadow-lg">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <i className="fas fa-lock text-2xl text-white"></i>
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                {translate('auth.login_required')}
              </CardTitle>
              <CardDescription className="text-gray-600">
                {translate('auth.login_required_desc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <p className="text-gray-600 mb-6">
                  {translate('auth.login_required_message')}
                </p>
                
                <div className="space-y-3">
                  <SignInButton mode="modal">
                    <Button 
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                      data-testid="button-login-redirect"
                    >
                      <i className="fas fa-sign-in-alt mr-2"></i>
                      {translate('nav.sign_in')}
                    </Button>
                  </SignInButton>
                  
                  <Button 
                    variant="outline" 
                    className="w-full py-3 text-lg"
                    onClick={handleGoBack}
                    data-testid="button-go-back"
                  >
                    <i className="fas fa-arrow-left mr-2"></i>
                    {translate('auth.go_back')}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </SignedOut>
      
      <SignedIn>
        <RemindersPage />
      </SignedIn>
    </>
  );
}
