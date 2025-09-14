import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { analyzeSymptoms, HealthAnalysis } from '@/lib/gemini';
import { CheckCircle, Circle, ArrowLeft, ArrowRight, X, ClipboardList, AlertTriangle, Check, ChartLine, ListCheck, Info } from 'lucide-react';

interface Question {
  id: string;
  question: string;
  type: 'yes_no' | 'multiple_choice' | 'text';
  options?: string[];
}

const symptomQuestions: Question[] = [
  {
    id: 'fever',
    question: 'Are you experiencing fever or feeling abnormally hot?',
    type: 'yes_no'
  },
  {
    id: 'pain_location',
    question: 'Where are you experiencing pain? (Select all that apply)',
    type: 'multiple_choice',
    options: ['Head', 'Throat', 'Chest', 'Abdomen', 'Back', 'Limbs', 'No pain']
  },
  {
    id: 'respiratory',
    question: 'Do you have any breathing-related symptoms?',
    type: 'multiple_choice',
    options: ['Cough', 'Difficulty breathing', 'Runny nose', 'Stuffy nose', 'None']
  },
  {
    id: 'digestive',
    question: 'Are you experiencing any digestive issues?',
    type: 'multiple_choice',
    options: ['Nausea', 'Vomiting', 'Diarrhea', 'Constipation', 'Loss of appetite', 'None']
  },
  {
    id: 'energy',
    question: 'How is your energy level?',
    type: 'multiple_choice',
    options: ['Very tired/fatigued', 'Slightly tired', 'Normal energy', 'Restless/hyperactive']
  },
  {
    id: 'duration',
    question: 'How long have you been experiencing these symptoms?',
    type: 'multiple_choice',
    options: ['Less than 1 day', '1-3 days', '4-7 days', 'More than 1 week']
  },
  {
    id: 'other_symptoms',
    question: 'Do you have any other symptoms not mentioned above?',
    type: 'text'
  }
];

export default function SymptomCheckerPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [customSymptoms, setCustomSymptoms] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<HealthAnalysis | null>(null);
  const [showResults, setShowResults] = useState(false);
  const { toast } = useToast();

  const currentQuestion = symptomQuestions[currentStep];
  const isLastStep = currentStep === symptomQuestions.length - 1;

  const handleAnswer = (questionId: string, answer: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleMultipleChoice = (questionId: string, option: string) => {
    const currentAnswers = answers[questionId] || [];
    const isSelected = currentAnswers.includes(option);
    const isExclusiveOption = option === 'None' || option === 'No pain';
    
    if (isSelected) {
      // Remove the selected option
      setAnswers(prev => ({
        ...prev,
        [questionId]: currentAnswers.filter((a: string) => a !== option)
      }));
    } else {
      // Add the option
      let newAnswers;
      if (isExclusiveOption) {
        // If selecting None/No pain, clear all other options
        newAnswers = [option];
      } else {
        // If selecting a regular option, remove None/No pain if they exist
        const filteredAnswers = currentAnswers.filter((a: string) => a !== 'None' && a !== 'No pain');
        newAnswers = [...filteredAnswers, option];
      }
      
      setAnswers(prev => ({
        ...prev,
        [questionId]: newAnswers
      }));
    }
  };

  const handleNext = () => {
    if (currentStep < symptomQuestions.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const compileSymptoms = () => {
    const symptoms = [];
    
    // Mapping for yes/no questions to symptom descriptions
    const yesNoSymptomMap: Record<string, string> = {
      'fever': 'fever or elevated body temperature'
    };
    
    // Process each answer
    Object.entries(answers).forEach(([questionId, answer]) => {
      const question = symptomQuestions.find(q => q.id === questionId);
      if (!question || !answer) return;

      if (question.type === 'yes_no' && answer === 'yes') {
        const symptomDescription = yesNoSymptomMap[questionId] || questionId;
        symptoms.push(symptomDescription);
      } else if (question.type === 'multiple_choice' && Array.isArray(answer)) {
        answer.forEach((a: string) => {
          if (a !== 'None' && a !== 'No pain') {
            symptoms.push(a.toLowerCase());
          }
        });
      } else if (question.type === 'text' && answer.trim()) {
        symptoms.push(answer.trim());
      }
    });

    // Add custom symptoms
    if (customSymptoms.trim()) {
      symptoms.push(customSymptoms.trim());
    }

    return symptoms;
  };

  const handleAnalyze = async () => {
    const symptoms = compileSymptoms();
    
    if (symptoms.length === 0) {
      toast({
        title: "No symptoms provided",
        description: "Please answer the questions to describe your symptoms.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const analysisResult = await analyzeSymptoms(symptoms);
      setAnalysis(analysisResult);
      setShowResults(true);
      toast({
        title: "Analysis Complete",
        description: "Your comprehensive health analysis is ready.",
      });
    } catch (error) {
      console.error('Error analyzing symptoms:', error);
      toast({
        title: "Analysis failed",
        description: "Failed to analyze symptoms. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setAnswers({});
    setCustomSymptoms('');
    setAnalysis(null);
    setShowResults(false);
  };

  const canProceed = () => {
    if (!currentQuestion) return false;
    const answer = answers[currentQuestion.id];
    
    if (currentQuestion.type === 'text') {
      return true; // Text fields are optional
    }
    
    return answer !== undefined && answer !== null && (
      currentQuestion.type === 'yes_no' ? answer !== '' :
      Array.isArray(answer) ? answer.length > 0 : true
    );
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const renderQuestionContent = () => {
    if (!currentQuestion) return null;

    switch (currentQuestion.type) {
      case 'yes_no':
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant={answers[currentQuestion.id] === 'yes' ? 'default' : 'outline'}
                onClick={() => handleAnswer(currentQuestion.id, 'yes')}
                className="h-12"
                data-testid={`yes-${currentQuestion.id}`}
                aria-pressed={answers[currentQuestion.id] === 'yes'}
              >
                <Check className="w-4 h-4 mr-2" />
                Yes
              </Button>
              <Button
                variant={answers[currentQuestion.id] === 'no' ? 'default' : 'outline'}
                onClick={() => handleAnswer(currentQuestion.id, 'no')}
                className="h-12"
                data-testid={`no-${currentQuestion.id}`}
                aria-pressed={answers[currentQuestion.id] === 'no'}
              >
                <X className="w-4 h-4 mr-2" />
                No
              </Button>
            </div>
          </div>
        );

      case 'multiple_choice':
        const selectedOptions = answers[currentQuestion.id] || [];
        return (
          <div className="space-y-2">
            {currentQuestion.options?.map((option, index) => (
              <Button
                key={index}
                variant={selectedOptions.includes(option) ? 'default' : 'outline'}
                onClick={() => handleMultipleChoice(currentQuestion.id, option)}
                className="w-full justify-start h-auto py-3 px-4"
                data-testid={`option-${currentQuestion.id}-${index}`}
                aria-pressed={selectedOptions.includes(option)}
              >
                <div className="flex items-center space-x-3">
                  {selectedOptions.includes(option) ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <Circle className="w-4 h-4" />
                  )}
                  <span>{option}</span>
                </div>
              </Button>
            ))}
            <p className="text-xs text-gray-500 mt-2">
              <Info className="w-3 h-3 mr-1 inline" />
              You can select multiple options
            </p>
          </div>
        );

      case 'text':
        return (
          <div className="space-y-3">
            <Textarea
              placeholder="Please describe any additional symptoms you're experiencing..."
              value={currentQuestion.id === 'other_symptoms' ? customSymptoms : answers[currentQuestion.id] || ''}
              onChange={(e) => {
                if (currentQuestion.id === 'other_symptoms') {
                  setCustomSymptoms(e.target.value);
                } else {
                  handleAnswer(currentQuestion.id, e.target.value);
                }
              }}
              rows={4}
              className="resize-none"
              data-testid={`input-${currentQuestion.id}`}
            />
          </div>
        );

      default:
        return null;
    }
  };

  // Show results screen if analysis is complete
  if (showResults && analysis) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Results Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <ChartLine className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Health Analysis Report</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Comprehensive AI-powered symptom analysis with personalized recommendations
            </p>
          </div>

          {/* Comprehensive Results Display */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Overview */}
            <div className="space-y-6">
              {/* Severity and Conditions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <ClipboardList className="w-5 h-5 text-blue-600" />
                    <span>Assessment Overview</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Severity Level:</span>
                    <Badge className={getSeverityColor(analysis.severity)}>
                      {analysis.severity.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Possible Conditions</h3>
                    <div className="space-y-2">
                      {analysis.possibleConditions.map((condition, index) => (
                        <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <span className="text-blue-800 font-medium">{condition}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* When to Seek Help */}
              <Card className="border-orange-200">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-orange-700">
                    <AlertTriangle className="w-5 h-5" />
                    <span>When to Seek Help</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {analysis.whenToSeekHelp.map((help, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <AlertTriangle className="w-4 h-4 text-orange-600 mt-0.5" />
                        <span className="text-gray-700 text-sm">{help}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Recommendations & Care */}
            <div className="space-y-6">
              {/* Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-green-700">
                    <CheckCircle className="w-5 h-5" />
                    <span>Recommendations</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {analysis.recommendations.map((rec, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                        <span className="text-gray-700 text-sm">{rec}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Self-Care Steps */}
              <Card className="border-green-200">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-green-700">
                    <Check className="w-5 h-5" />
                    <span>Self-Care Steps</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {analysis.selfCareSteps.map((step, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <Check className="w-4 h-4 text-green-600 mt-0.5" />
                        <span className="text-gray-700 text-sm">{step}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Prevention Tips */}
              <Card className="border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-blue-700">
                    <Info className="w-5 h-5" />
                    <span>Prevention Tips</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {analysis.preventiveTips.map((tip, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <Info className="w-4 h-4 text-blue-600 mt-0.5" />
                        <span className="text-gray-700 text-sm">{tip}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Urgency Assessment */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-purple-700">
                <AlertTriangle className="w-5 h-5" />
                <span>Urgency Assessment</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">{analysis.urgency}</p>
            </CardContent>
          </Card>

          {/* Emergency Notice */}
          {analysis.severity === 'high' && (
            <Card className="mt-8 bg-red-50 border-red-200">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-3 mb-4">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                  <span className="font-bold text-red-800 text-lg">Seek Immediate Medical Attention</span>
                </div>
                <p className="text-red-700 mb-4">
                  Your symptoms may indicate a serious condition. Please contact a healthcare provider immediately.
                </p>
                <Button
                  className="bg-red-600 hover:bg-red-700 text-white"
                  onClick={() => window.open('tel:108')}
                  data-testid="button-emergency-call"
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Call Emergency: 108
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Medical Disclaimer */}
          <Card className="mt-8 bg-amber-50 border-amber-200">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-amber-800 mb-2">Important Medical Disclaimer</h3>
                  <p className="text-amber-700 text-sm leading-relaxed">{analysis.disclaimer}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4 mt-8">
            <Button onClick={handleRestart} variant="outline" className="px-8">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Take Another Assessment
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <ClipboardList className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Symptom Checker</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Answer a few questions to get personalized health insights and recommendations
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2" data-testid="progress-info">
            <span>Question {currentStep + 1} of {symptomQuestions.length}</span>
            <span>{Math.round(((currentStep + 1) / symptomQuestions.length) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / symptomQuestions.length) * 100}%` }}
              data-testid="progress-bar-fill"
            />
          </div>
        </div>

        {/* Medical Disclaimer */}
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg mb-8" data-testid="medical-disclaimer">
          <p className="text-sm text-amber-800">
            <AlertTriangle className="w-4 h-4 mr-2 inline" />
            This tool provides general information only. Always consult a healthcare professional for medical advice.
          </p>
        </div>

        {/* Question Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl text-gray-900">
              {currentQuestion?.question}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderQuestionContent()}
          </CardContent>
        </Card>

        {/* Summary of Answers (show on last step) */}
        {isLastStep && Object.keys(answers).length > 0 && (
          <Card className="bg-blue-50 border-blue-200 mb-8">
            <CardContent className="pt-4">
              <h4 className="font-medium text-blue-900 mb-3">
                <ListCheck className="w-4 h-4 mr-2 inline" />
                Summary of Your Responses
              </h4>
              <div className="space-y-2 text-sm">
                {Object.entries(answers).map(([questionId, answer]) => {
                  const question = symptomQuestions.find(q => q.id === questionId);
                  if (!question || !answer || (Array.isArray(answer) && answer.length === 0)) return null;
                  
                  return (
                    <div key={questionId} className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                      <div>
                        <span className="font-medium">{question.question.split('?')[0]}:</span>
                        <span className="ml-2 text-blue-800">
                          {Array.isArray(answer) ? answer.join(', ') : answer}
                        </span>
                      </div>
                    </div>
                  );
                })}
                {customSymptoms.trim() && (
                  <div className="flex items-start space-x-2" data-testid="additional-symptoms-summary">
                    <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                    <div>
                      <span className="font-medium">Additional symptoms:</span>
                      <span className="ml-2 text-blue-800">{customSymptoms}</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation Buttons */}
        <div className="flex space-x-3">
          <Button 
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0 || isAnalyzing}
            className="flex-1"
            data-testid="button-previous"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          {isLastStep ? (
            <Button 
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="flex-1 bg-green-600 hover:bg-green-700"
              data-testid="button-analyze-symptoms"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Analyzing...
                </>
              ) : (
                <>
                  <ChartLine className="w-4 h-4 mr-2" />
                  Get Analysis Report
                </>
              )}
            </Button>
          ) : (
            <Button 
              onClick={handleNext}
              disabled={!canProceed() || isAnalyzing}
              className="flex-1"
              data-testid="button-next"
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}

          <Button 
            variant="outline" 
            onClick={handleRestart}
            disabled={isAnalyzing}
            data-testid="button-cancel-symptom-checker"
            className="px-4"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}