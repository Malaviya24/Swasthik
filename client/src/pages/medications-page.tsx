import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface Medication {
  id: string;
  name: string;
  genericName: string;
  category: string;
  description: string;
  dosage: string;
  sideEffects: string[];
  precautions: string[];
  interactions: string[];
  price: string;
}

export default function MedicationsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMed, setSelectedMed] = useState<Medication | null>(null);
  const { toast } = useToast();

  const searchMedications = useMutation({
    mutationFn: async (query: string) => {
      const response = await apiRequest('GET', `/api/medications/search?q=${encodeURIComponent(query)}`);
      return await response.json();
    },
    onError: (error) => {
      toast({
        title: "Search Failed",
        description: "Unable to search medications. Please try again.",
        variant: "destructive",
      });
    },
  });

  const popularMedications = [
    { name: "Paracetamol", category: "Pain Relief", description: "Common pain and fever reducer" },
    { name: "Ibuprofen", category: "Anti-inflammatory", description: "Pain relief and inflammation reducer" },
    { name: "Aspirin", category: "Blood Thinner", description: "Pain relief and heart protection" },
    { name: "Crocin", category: "Pain Relief", description: "Fever and headache relief" },
    { name: "Disprin", category: "Pain Relief", description: "Fast-acting pain relief" },
    { name: "Combiflam", category: "Pain Relief", description: "Combination pain and fever relief" }
  ];

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      toast({
        title: "Enter Medicine Name",
        description: "Please enter a medication name to search.",
        variant: "destructive",
      });
      return;
    }
    searchMedications.mutate(searchTerm);
  };

  const handlePopularMedClick = (medName: string) => {
    setSearchTerm(medName);
    searchMedications.mutate(medName);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-pills text-2xl text-white"></i>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Medication Information</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Search for medication information, dosages, side effects, and safety guidelines
          </p>
        </div>

        {/* Search Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <i className="fas fa-search text-blue-600"></i>
              <span>Medicine Search</span>
            </CardTitle>
            <CardDescription>
              Enter the name of a medication to get detailed information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <Input
                placeholder="Enter medication name (e.g., Paracetamol, Aspirin, Crocin...)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1"
                data-testid="input-medication-search"
              />
              <Button
                onClick={handleSearch}
                disabled={searchMedications.isPending}
                className="bg-blue-600 hover:bg-blue-700"
                data-testid="button-search-medication"
              >
                {searchMedications.isPending ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Searching...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <i className="fas fa-search"></i>
                    <span>Search</span>
                  </div>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Popular Medications */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <i className="fas fa-star text-yellow-600"></i>
                  <span>Popular Medications</span>
                </CardTitle>
                <CardDescription>
                  Commonly searched medicines
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {popularMedications.map((med, index) => (
                    <div
                      key={index}
                      className="p-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition-colors"
                      onClick={() => handlePopularMedClick(med.name)}
                      data-testid={`popular-med-${index}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-medium text-gray-900">{med.name}</h3>
                        <Badge variant="outline" className="text-xs">
                          {med.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{med.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Safety Notice */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-red-600">
                  <i className="fas fa-exclamation-triangle"></i>
                  <span>Important Notice</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-gray-700">
                  <p>
                    <strong>⚠️ Always consult a doctor</strong> before taking any medication.
                  </p>
                  <p>
                    <strong>📋 Follow prescribed dosages</strong> and never exceed recommended amounts.
                  </p>
                  <p>
                    <strong>🚫 Check for allergies</strong> and drug interactions before use.
                  </p>
                  <p>
                    <strong>🏥 Contact emergency services</strong> if you experience severe side effects.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search Results */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <i className="fas fa-info-circle text-green-600"></i>
                  <span>Medication Details</span>
                </CardTitle>
                <CardDescription>
                  Detailed information about the selected medication
                </CardDescription>
              </CardHeader>
              <CardContent>
                {searchMedications.isPending ? (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-500">Searching medication database...</p>
                  </div>
                ) : searchMedications.data ? (
                  <div className="space-y-6">
                    {/* Basic Info */}
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">{searchMedications.data.name}</h2>
                      <div className="flex items-center space-x-4 mb-4">
                        <Badge className="bg-blue-100 text-blue-800">{searchMedications.data.category}</Badge>
                        <span className="text-gray-600">Generic: {searchMedications.data.genericName}</span>
                      </div>
                      <p className="text-gray-700">{searchMedications.data.description}</p>
                    </div>

                    <Separator />

                    {/* Dosage */}
                    <div>
                      <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6 shadow-sm">
                        <div className="flex items-center mb-4">
                          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                            <i className="fas fa-capsules text-white text-sm"></i>
                          </div>
                          <h3 className="text-lg font-bold text-blue-900">Dosage Information</h3>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-blue-200">
                          <div className="prose prose-sm max-w-none">
                            <div dangerouslySetInnerHTML={{ 
                              __html: searchMedications.data.dosage
                                .replace(/\\n/g, '<br/>')  // Fix escaped newlines
                                .replace(/\n/g, '<br/>')   // Regular newlines
                                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                            }} />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Side Effects */}
                    <div>
                      <div className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-6 shadow-sm">
                        <div className="flex items-center mb-4">
                          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center mr-3">
                            <i className="fas fa-exclamation-circle text-white text-sm"></i>
                          </div>
                          <h3 className="text-lg font-bold text-orange-900">Possible Side Effects</h3>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-orange-200">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {searchMedications.data.sideEffects.map((effect: string, index: number) => (
                              <div key={index} className="flex items-center space-x-2 p-2 bg-orange-50 rounded-lg">
                                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                <span className="text-orange-800 text-sm">{effect}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Precautions */}
                    <div>
                      <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-xl p-6 shadow-sm">
                        <div className="flex items-center mb-4">
                          <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center mr-3">
                            <i className="fas fa-shield-alt text-white text-sm"></i>
                          </div>
                          <h3 className="text-lg font-bold text-red-900">Important Precautions</h3>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-red-200">
                          <div className="space-y-3">
                            {searchMedications.data.precautions.map((precaution: string, index: number) => (
                              <div key={index} className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg">
                                <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                  <i className="fas fa-exclamation text-white text-xs"></i>
                                </div>
                                <span className="text-red-800 text-sm">{precaution}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Interactions */}
                    <div>
                      <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 rounded-xl p-6 shadow-sm">
                        <div className="flex items-center mb-4">
                          <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center mr-3">
                            <i className="fas fa-exclamation-triangle text-white text-sm"></i>
                          </div>
                          <h3 className="text-lg font-bold text-yellow-900">Drug Interactions</h3>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-yellow-200">
                          <div className="space-y-3">
                            {searchMedications.data.interactions.map((interaction: string, index: number) => (
                              <div key={index} className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                                <div className="w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                  <i className="fas fa-warning text-white text-xs"></i>
                                </div>
                                <span className="text-yellow-800 text-sm">{interaction}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-xl p-6 shadow-sm">
                      <div className="flex items-center mb-4">
                        <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                          <i className="fas fa-rupee-sign text-white text-sm"></i>
                        </div>
                        <h3 className="text-lg font-bold text-green-900">Approximate Price</h3>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-green-200">
                        <div className="prose prose-sm max-w-none">
                          <div dangerouslySetInnerHTML={{ 
                            __html: searchMedications.data.price.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>')
                          }} />
                        </div>
                        <div className="mt-3 pt-3 border-t border-green-200">
                          <p className="text-xs text-green-700">
                            <strong>Note:</strong> Prices are approximate and can vary significantly based on brand, manufacturer, pharmacy, location, and discounts.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <i className="fas fa-search text-4xl text-gray-400 mb-4"></i>
                    <p className="text-gray-500 mb-2">
                      Search for a medication to view detailed information
                    </p>
                    <p className="text-sm text-gray-400">
                      Try searching for common medicines like Paracetamol, Aspirin, or Crocin
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}