import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface SymptomAnalysis {
  possibleConditions: string[];
  severity: 'low' | 'medium' | 'high';
  recommendations: string[];
  urgency: string;
}

export default function SymptomCheckerPage() {
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [duration, setDuration] = useState('');
  const [analysis, setAnalysis] = useState<SymptomAnalysis | null>(null);
  const { toast } = useToast();

  const analyzeSymptoms = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/analyze-symptoms', data);
      return await response.json();
    },
    onSuccess: (data) => {
      setAnalysis(data);
      toast({
        title: "Analysis Complete",
        description: "Your symptoms have been analyzed. Please review the results below.",
      });
    },
    onError: (error) => {
      toast({
        title: "Analysis Failed",
        description: "Unable to analyze symptoms. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAnalyze = () => {
    if (!symptoms.trim()) {
      toast({
        title: "Missing Information",
        description: "Please describe your symptoms.",
        variant: "destructive",
      });
      return;
    }

    analyzeSymptoms.mutate({
      age: parseInt(age) || null,
      gender,
      symptoms,
      duration,
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-stethoscope text-2xl text-white"></i>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Symptom Checker</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Describe your symptoms and get AI-powered analysis with health recommendations. 
            This is not a substitute for professional medical advice.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <i className="fas fa-clipboard-list text-blue-600"></i>
                <span>Symptom Information</span>
              </CardTitle>
              <CardDescription>
                Please provide details about your symptoms for accurate analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Age (optional)
                  </label>
                  <Input
                    type="number"
                    placeholder="25"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    data-testid="input-age"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender (optional)
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    data-testid="select-gender"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Symptoms *
                </label>
                <Textarea
                  placeholder="Describe your symptoms in detail (e.g., headache, fever, cough, nausea...)"
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  rows={4}
                  data-testid="textarea-symptoms"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (optional)
                </label>
                <Input
                  placeholder="How long have you had these symptoms? (e.g., 2 days, 1 week)"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  data-testid="input-duration"
                />
              </div>

              <Button
                onClick={handleAnalyze}
                disabled={analyzeSymptoms.isPending}
                className="w-full bg-blue-600 hover:bg-blue-700"
                data-testid="button-analyze"
              >
                {analyzeSymptoms.isPending ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Analyzing...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <i className="fas fa-search"></i>
                    <span>Analyze Symptoms</span>
                  </div>
                )}
              </Button>

              {/* Disclaimer */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <i className="fas fa-exclamation-triangle text-yellow-600 mt-0.5"></i>
                  <div className="text-sm text-yellow-800">
                    <strong>Important:</strong> This tool provides general health information only. 
                    Always consult with a healthcare professional for proper diagnosis and treatment.
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Analysis Results */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <i className="fas fa-chart-line text-green-600"></i>
                <span>Analysis Results</span>
              </CardTitle>
              <CardDescription>
                AI-powered symptom analysis and recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!analysis ? (
                <div className="text-center py-8">
                  <i className="fas fa-robot text-4xl text-gray-400 mb-4"></i>
                  <p className="text-gray-500">
                    Enter your symptoms and click "Analyze" to get AI-powered health insights
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Severity Badge */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Severity Level:</span>
                    <Badge className={getSeverityColor(analysis.severity)}>
                      {analysis.severity.toUpperCase()}
                    </Badge>
                  </div>

                  <Separator />

                  {/* Possible Conditions */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <i className="fas fa-list-ul text-blue-600 mr-2"></i>
                      Possible Conditions
                    </h3>
                    <div className="space-y-2">
                      {analysis.possibleConditions.map((condition, index) => (
                        <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <span className="text-blue-800 font-medium">{condition}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Recommendations */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <i className="fas fa-lightbulb text-green-600 mr-2"></i>
                      Recommendations
                    </h3>
                    <div className="space-y-2">
                      {analysis.recommendations.map((rec, index) => (
                        <div key={index} className="flex items-start space-x-2">
                          <i className="fas fa-check-circle text-green-600 mt-1"></i>
                          <span className="text-gray-700">{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Urgency */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                      <i className="fas fa-clock text-orange-600 mr-2"></i>
                      Urgency Level
                    </h3>
                    <p className="text-gray-700">{analysis.urgency}</p>
                  </div>

                  {/* Emergency Notice */}
                  {analysis.severity === 'high' && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <i className="fas fa-exclamation-circle text-red-600"></i>
                        <span className="font-semibold text-red-800">Seek Immediate Medical Attention</span>
                      </div>
                      <p className="text-red-700 text-sm mb-3">
                        Your symptoms may indicate a serious condition. Please contact a healthcare provider immediately.
                      </p>
                      <Button
                        className="bg-red-600 hover:bg-red-700 text-white"
                        onClick={() => window.open('tel:108')}
                        data-testid="button-emergency-call"
                      >
                        <i className="fas fa-phone-alt mr-2"></i>
                        Call Emergency: 108
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}