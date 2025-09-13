import { useState } from 'react';
import { analyzeSymptoms, HealthAnalysis } from '@/lib/gemini';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';

interface SymptomCheckerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onResultReady: (analysis: HealthAnalysis) => void;
}

const commonSymptoms = [
  'Fever (38°C or higher)',
  'Persistent cough',
  'Headache',
  'Body aches',
  'Sore throat',
  'Runny or stuffy nose',
  'Nausea or vomiting',
  'Diarrhea',
  'Loss of appetite',
  'Fatigue or weakness',
  'Difficulty breathing',
  'Chest pain',
  'Abdominal pain',
  'Skin rash',
  'Dizziness',
];

export function SymptomChecker({ open, onOpenChange, onResultReady }: SymptomCheckerProps) {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const handleSymptomChange = (symptom: string, checked: boolean) => {
    setSelectedSymptoms(prev => 
      checked 
        ? [...prev, symptom]
        : prev.filter(s => s !== symptom)
    );
  };

  const handleAnalyze = async () => {
    if (selectedSymptoms.length === 0) {
      toast({
        title: "No symptoms selected",
        description: "Please select at least one symptom to analyze.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const analysis = await analyzeSymptoms(selectedSymptoms);
      onResultReady(analysis);
      onOpenChange(false);
      setSelectedSymptoms([]);
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

  const handleCancel = () => {
    setSelectedSymptoms([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto" data-testid="modal-symptom-checker">
        <DialogHeader>
          <DialogTitle>Symptom Checker</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800">
              <i className="fas fa-exclamation-triangle mr-2"></i>
              This tool provides general information only. Always consult a healthcare professional for medical advice.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium mb-3">What symptoms are you experiencing?</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {commonSymptoms.map((symptom, index) => (
                <label 
                  key={index}
                  className="flex items-center space-x-3 p-3 border border-border rounded-lg hover:bg-muted cursor-pointer"
                  data-testid={`checkbox-symptom-${index}`}
                >
                  <Checkbox 
                    checked={selectedSymptoms.includes(symptom)}
                    onCheckedChange={(checked) => handleSymptomChange(symptom, checked as boolean)}
                  />
                  <span className="text-sm">{symptom}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div className="flex space-x-3">
            <Button 
              onClick={handleAnalyze}
              disabled={selectedSymptoms.length === 0 || isAnalyzing}
              className="flex-1"
              data-testid="button-analyze-symptoms"
            >
              {isAnalyzing ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Analyzing...
                </>
              ) : (
                'Analyze Symptoms'
              )}
            </Button>
            <Button 
              variant="outline" 
              onClick={handleCancel}
              disabled={isAnalyzing}
              data-testid="button-cancel-symptom-checker"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
