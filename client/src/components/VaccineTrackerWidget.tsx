import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Calendar, Users, TrendingUp } from 'lucide-react';
import { Link } from 'wouter';
import { vaccineEngine } from '@/lib/vaccine';

interface VaccineTrackerWidgetProps {
  className?: string;
}

export function VaccineTrackerWidget({ className }: VaccineTrackerWidgetProps) {
  const [stats, setStats] = useState({
    totalVaccines: 0,
    verifiedVaccines: 0,
    averageConfidence: 0
  });

  React.useEffect(() => {
    const vaccines = vaccineEngine.getAllVaccines();
    const verified = vaccines.filter(v => v.verification_status === 'verified').length;
    const avgConfidence = vaccines.reduce((sum, v) => sum + v.confidence, 0) / vaccines.length;
    
    setStats({
      totalVaccines: vaccines.length,
      verifiedVaccines: verified,
      averageConfidence: avgConfidence
    });
  }, []);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Vaccine Tracker</h2>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Comprehensive vaccine information and personalized schedules for India
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Vaccines</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalVaccines}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Verified</p>
                <p className="text-2xl font-bold text-gray-900">{stats.verifiedVaccines}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Confidence</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(stats.averageConfidence * 100)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span>Personalized Schedules</span>
            </CardTitle>
            <CardDescription>
              Get custom vaccination schedules based on your age, medical conditions, and location
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Age-based recommendations</li>
              <li>• Medical condition filtering</li>
              <li>• Regional variations</li>
              <li>• Due date calculations</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-green-600" />
              <span>Verified Information</span>
            </CardTitle>
            <CardDescription>
              All vaccine data verified against official sources like MoHFW, WHO, and ICMR
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Official source citations</li>
              <li>• Confidence scoring</li>
              <li>• Regular updates</li>
              <li>• Quality assurance</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* CTA */}
      <div className="text-center">
        <Link href="/vaccine-tracker">
          <Button 
            size="lg" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            <Shield className="w-5 h-5 mr-2" />
            Access Full Vaccine Tracker
          </Button>
        </Link>
      </div>
    </div>
  );
}
