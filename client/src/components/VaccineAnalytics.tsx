import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { 
  TrendingUp, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw,
  Download,
  Calendar,
  Users,
  Activity
} from 'lucide-react';
import { vaccineEngine } from '@/lib/vaccine';
import { vaccineVerificationService, VerificationResult } from '@/lib/vaccineVerification';
import { VaccineRecord } from '@/lib/vaccine';

interface VaccineAnalyticsProps {
  className?: string;
}

interface AnalyticsData {
  totalVaccines: number;
  verifiedVaccines: number;
  needsVerification: number;
  averageConfidence: number;
  mandatoryVaccines: number;
  recommendedVaccines: number;
  optionalVaccines: number;
  verificationReport: {
    total: number;
    verified: number;
    needsVerification: number;
    confidence: number;
    lastUpdated: string;
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export function VaccineAnalytics({ className }: VaccineAnalyticsProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      const vaccines = vaccineEngine.getAllVaccines();
      const verificationReport = await vaccineVerificationService.getVerificationReport(vaccines);
      
      const analyticsData: AnalyticsData = {
        totalVaccines: vaccines.length,
        verifiedVaccines: verificationReport.verified,
        needsVerification: verificationReport.needsVerification,
        averageConfidence: verificationReport.confidence,
        mandatoryVaccines: vaccines.filter(v => v.mandatory_status === 'mandatory').length,
        recommendedVaccines: vaccines.filter(v => v.mandatory_status === 'recommended').length,
        optionalVaccines: vaccines.filter(v => v.mandatory_status === 'optional').length,
        verificationReport
      };

      setAnalytics(analyticsData);
      setLastUpdated(new Date().toLocaleString());
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshAnalytics = async () => {
    await loadAnalytics();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'text-green-600';
      case 'needs_verification': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600';
    if (confidence >= 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span>Loading analytics...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-gray-500">
              Failed to load analytics data
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Prepare chart data
  const statusData = [
    { name: 'Verified', value: analytics.verifiedVaccines, color: '#10B981' },
    { name: 'Needs Verification', value: analytics.needsVerification, color: '#F59E0B' }
  ];

  const mandatoryStatusData = [
    { name: 'Mandatory', value: analytics.mandatoryVaccines, color: '#EF4444' },
    { name: 'Recommended', value: analytics.recommendedVaccines, color: '#3B82F6' },
    { name: 'Optional', value: analytics.optionalVaccines, color: '#6B7280' }
  ];

  const confidenceData = [
    { name: 'High (90%+)', value: analytics.averageConfidence >= 0.9 ? 1 : 0 },
    { name: 'Medium (70-89%)', value: analytics.averageConfidence >= 0.7 && analytics.averageConfidence < 0.9 ? 1 : 0 },
    { name: 'Low (<70%)', value: analytics.averageConfidence < 0.7 ? 1 : 0 }
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Vaccine Analytics</h2>
          <p className="text-gray-600">Comprehensive insights into vaccine database and verification status</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshAnalytics}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {/* Export functionality */}}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Vaccines</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalVaccines}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Verified</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.verifiedVaccines}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Needs Verification</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.needsVerification}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Confidence</p>
                <p className={`text-2xl font-bold ${getConfidenceColor(analytics.averageConfidence)}`}>
                  {Math.round(analytics.averageConfidence * 100)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Verification Status Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Verification Status</CardTitle>
            <CardDescription>Distribution of vaccine verification status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Mandatory Status Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Vaccine Categories</CardTitle>
            <CardDescription>Distribution by mandatory status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mandatoryStatusData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Verification Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Verification Progress</CardTitle>
          <CardDescription>Overall verification status and confidence levels</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Verification Progress</span>
              <span>{analytics.verifiedVaccines} / {analytics.totalVaccines}</span>
            </div>
            <Progress 
              value={(analytics.verifiedVaccines / analytics.totalVaccines) * 100} 
              className="h-2"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Average Confidence</span>
              <span className={getConfidenceColor(analytics.averageConfidence)}>
                {Math.round(analytics.averageConfidence * 100)}%
              </span>
            </div>
            <Progress 
              value={analytics.averageConfidence * 100} 
              className="h-2"
            />
          </div>

          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>Last updated: {lastUpdated}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4" />
              <span>Cache: {vaccineVerificationService.getCacheStats().total} entries</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Source Reliability */}
      <Card>
        <CardHeader>
          <CardTitle>Source Reliability</CardTitle>
          <CardDescription>Trusted sources and verification methods</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium text-green-900">MoHFW</p>
                <p className="text-sm text-green-700">Ministry of Health & Family Welfare</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-900">WHO</p>
                <p className="text-sm text-blue-700">World Health Organization</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-purple-600" />
              <div>
                <p className="font-medium text-purple-900">ICMR</p>
                <p className="text-sm text-purple-700">Indian Council of Medical Research</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
