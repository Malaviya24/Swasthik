import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface HealthCenter {
  id: string;
  name: string;
  type: string;
  address: string;
  phone: string;
  rating: number;
  distance: string;
  specialties: string[];
  timings: string;
  emergency: boolean;
}

export default function HealthCentersPage() {
  const [location, setLocation] = useState('');
  const [centerType, setCenterType] = useState('');
  const [centers, setCenters] = useState<HealthCenter[]>([]);
  const { toast } = useToast();

  const searchCenters = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/health-centers/search', data);
      return await response.json();
    },
    onSuccess: (data) => {
      setCenters(data);
      toast({
        title: "Search Complete",
        description: `Found ${data.length} health centers near you.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Search Failed",
        description: "Unable to find health centers. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSearch = () => {
    if (!location.trim()) {
      toast({
        title: "Enter Location",
        description: "Please enter your location to find nearby health centers.",
        variant: "destructive",
      });
      return;
    }

    searchCenters.mutate({
      location,
      type: centerType,
    });
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'hospital': return 'bg-red-100 text-red-800 border-red-300';
      case 'clinic': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'pharmacy': return 'bg-green-100 text-green-800 border-green-300';
      case 'diagnostic': return 'bg-purple-100 text-purple-800 border-purple-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const sampleCenters: HealthCenter[] = [
    {
      id: '1',
      name: 'Apollo Hospital',
      type: 'Hospital',
      address: 'MG Road, Bangalore, Karnataka 560001',
      phone: '+91-80-2692-2222',
      rating: 4.5,
      distance: '2.3 km',
      specialties: ['Cardiology', 'Neurology', 'Oncology', 'Emergency'],
      timings: '24/7',
      emergency: true
    },
    {
      id: '2',
      name: 'Fortis Clinic',
      type: 'Clinic',
      address: 'Brigade Road, Bangalore, Karnataka 560025',
      phone: '+91-80-4068-3333',
      rating: 4.2,
      distance: '1.8 km',
      specialties: ['General Practice', 'Dermatology', 'Pediatrics'],
      timings: '9:00 AM - 9:00 PM',
      emergency: false
    },
    {
      id: '3',
      name: 'MedPlus Pharmacy',
      type: 'Pharmacy',
      address: 'Commercial Street, Bangalore, Karnataka 560001',
      phone: '+91-80-2559-9988',
      rating: 4.0,
      distance: '1.2 km',
      specialties: ['Medications', 'Health Products', 'Vaccines'],
      timings: '8:00 AM - 10:00 PM',
      emergency: false
    }
  ];

  const displayedCenters = centers.length > 0 ? centers : (location ? sampleCenters : []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-map-marker-alt text-2xl text-white"></i>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Health Centers</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Locate nearby hospitals, clinics, pharmacies, and diagnostic centers with directions and contact information
          </p>
        </div>

        {/* Search Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <i className="fas fa-search text-blue-600"></i>
              <span>Search Health Centers</span>
            </CardTitle>
            <CardDescription>
              Find healthcare facilities near your location
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location *
                </label>
                <Input
                  placeholder="Enter your location (e.g., MG Road, Bangalore)"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  data-testid="input-location"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type (optional)
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={centerType}
                  onChange={(e) => setCenterType(e.target.value)}
                  data-testid="select-center-type"
                >
                  <option value="">All Types</option>
                  <option value="hospital">Hospital</option>
                  <option value="clinic">Clinic</option>
                  <option value="pharmacy">Pharmacy</option>
                  <option value="diagnostic">Diagnostic Center</option>
                </select>
              </div>
            </div>
            <Button
              onClick={handleSearch}
              disabled={searchCenters.isPending}
              className="w-full md:w-auto mt-4 bg-blue-600 hover:bg-blue-700"
              data-testid="button-search-centers"
            >
              {searchCenters.isPending ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Searching...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <i className="fas fa-search"></i>
                  <span>Find Health Centers</span>
                </div>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results Section */}
        {searchCenters.isPending ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">Finding health centers near you...</p>
          </div>
        ) : displayedCenters.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Health Centers Near You ({displayedCenters.length})
              </h2>
              <Button
                variant="outline"
                onClick={() => window.open(`https://maps.google.com/maps?q=hospitals+near+${encodeURIComponent(location)}`, '_blank')}
                data-testid="button-view-map"
              >
                <i className="fas fa-map mr-2"></i>
                View on Map
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {displayedCenters.map((center) => (
                <Card key={center.id} className="hover:shadow-lg transition-shadow" data-testid={`center-card-${center.id}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{center.name}</CardTitle>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge className={getTypeColor(center.type)}>
                            {center.type}
                          </Badge>
                          {center.emergency && (
                            <Badge className="bg-red-100 text-red-800 border-red-300">
                              24/7 Emergency
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-1">
                          <i className="fas fa-star text-yellow-500"></i>
                          <span className="font-medium">{center.rating}</span>
                        </div>
                        <span className="text-sm text-gray-500">{center.distance}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-2">
                        <i className="fas fa-map-marker-alt text-gray-400 mt-1"></i>
                        <p className="text-gray-700 text-sm">{center.address}</p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <i className="fas fa-phone text-gray-400"></i>
                        <p className="text-gray-700 text-sm">{center.phone}</p>
                      </div>

                      <div className="flex items-start space-x-2">
                        <i className="fas fa-clock text-gray-400 mt-1"></i>
                        <p className="text-gray-700 text-sm">{center.timings}</p>
                      </div>

                      <Separator />

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Specialties</h4>
                        <div className="flex flex-wrap gap-2">
                          {center.specialties.map((specialty, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {specialty}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`tel:${center.phone}`, '_self')}
                          className="flex-1"
                          data-testid={`button-call-${center.id}`}
                        >
                          <i className="fas fa-phone mr-2"></i>
                          Call
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`https://maps.google.com/maps?q=${encodeURIComponent(center.address)}`, '_blank')}
                          className="flex-1"
                          data-testid={`button-directions-${center.id}`}
                        >
                          <i className="fas fa-directions mr-2"></i>
                          Directions
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : location ? (
          <Card>
            <CardContent className="text-center py-8">
              <i className="fas fa-search text-4xl text-gray-400 mb-4"></i>
              <p className="text-gray-500 mb-2">No health centers found in this area</p>
              <p className="text-sm text-gray-400">Try searching for a different location or check your spelling</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="text-center py-8">
              <i className="fas fa-map-marker-alt text-4xl text-gray-400 mb-4"></i>
              <p className="text-gray-500 mb-2">Enter your location to find nearby health centers</p>
              <p className="text-sm text-gray-400">We'll show hospitals, clinics, pharmacies, and diagnostic centers near you</p>
            </CardContent>
          </Card>
        )}

        {/* Emergency Section */}
        <Card className="mt-8 bg-red-50 border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-red-800">
              <i className="fas fa-ambulance"></i>
              <span>Emergency Services</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={() => window.open('tel:108')}
                data-testid="button-ambulance"
              >
                <i className="fas fa-ambulance mr-2"></i>
                Ambulance: 108
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={() => window.open('tel:102')}
                data-testid="button-fire"
              >
                <i className="fas fa-fire-extinguisher mr-2"></i>
                Fire: 101
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={() => window.open('tel:100')}
                data-testid="button-police"
              >
                <i className="fas fa-shield-alt mr-2"></i>
                Police: 100
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}