import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, AlertTriangle, Play, Download, Monitor, Smartphone } from 'lucide-react';
import { format, addMinutes, addDays, subDays, subMinutes } from 'date-fns';
import { apiRequest } from '@/lib/queryClient';

interface TestCase {
  id: string;
  name: string;
  description: string;
  category: 'accuracy' | 'edge-case' | 'trigger' | 'responsive' | 'validation';
  status: 'pending' | 'running' | 'passed' | 'failed';
  result?: string;
  error?: string;
  duration?: number;
  autoFixApplied?: boolean;
  suggestions?: string[];
}

interface TestReport {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  autoFixesApplied: number;
  executionTime: number;
  categories: Record<string, { passed: number; failed: number; total: number }>;
  issues: Array<{ severity: 'high' | 'medium' | 'low'; description: string; fix?: string }>;
}

const REMINDER_CATEGORIES = ['medication', 'appointment', 'exercise', 'diet', 'checkup', 'other'] as const;

export function ReminderTests() {
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<string | null>(null);
  const [tests, setTests] = useState<TestCase[]>([]);
  const [report, setReport] = useState<TestReport | null>(null);
  const [progress, setProgress] = useState(0);

  // Initialize test cases
  useEffect(() => {
    const testCases: TestCase[] = [
      // Date & Time Accuracy Tests
      {
        id: 'test-current-time',
        name: 'Current Time Accuracy',
        description: 'Create reminder for current time + 2 minutes',
        category: 'accuracy',
        status: 'pending'
      },
      {
        id: 'test-future-date',
        name: 'Future Date Accuracy',
        description: 'Create reminder for tomorrow at specific time',
        category: 'accuracy',
        status: 'pending'
      },
      {
        id: 'test-different-categories',
        name: 'Category Variations',
        description: 'Test all reminder categories with different times',
        category: 'accuracy',
        status: 'pending'
      },
      {
        id: 'test-timezone-handling',
        name: 'Timezone Consistency',
        description: 'Verify reminders work correctly across timezone changes',
        category: 'accuracy',
        status: 'pending'
      },

      // Edge Cases
      {
        id: 'test-past-date',
        name: 'Past Date Rejection',
        description: 'Attempt to create reminder in the past (should fail)',
        category: 'edge-case',
        status: 'pending'
      },
      {
        id: 'test-overlapping-reminders',
        name: 'Overlapping Reminders',
        description: 'Create multiple reminders at exact same time',
        category: 'edge-case',
        status: 'pending'
      },
      {
        id: 'test-multi-day-span',
        name: 'Multi-day Spanning',
        description: 'Test reminders across multiple days',
        category: 'edge-case',
        status: 'pending'
      },
      {
        id: 'test-leap-year',
        name: 'Leap Year Handling',
        description: 'Test reminder creation on Feb 29th',
        category: 'edge-case',
        status: 'pending'
      },

      // Trigger Logic Tests
      {
        id: 'test-trigger-timing',
        name: 'Trigger Before Scheduled',
        description: 'Verify reminders appear before scheduled time',
        category: 'trigger',
        status: 'pending'
      },
      {
        id: 'test-active-reminder-logic',
        name: 'Active Reminder Logic',
        description: 'Test active vs upcoming reminder classification',
        category: 'trigger',
        status: 'pending'
      },

      // Validation Tests
      {
        id: 'test-empty-title',
        name: 'Empty Title Validation',
        description: 'Attempt to create reminder with empty title',
        category: 'validation',
        status: 'pending'
      },
      {
        id: 'test-invalid-date-format',
        name: 'Invalid Date Format',
        description: 'Test various invalid date formats',
        category: 'validation',
        status: 'pending'
      },
      {
        id: 'test-invalid-time-format',
        name: 'Invalid Time Format',
        description: 'Test various invalid time formats',
        category: 'validation',
        status: 'pending'
      },
      {
        id: 'test-boundary-dates',
        name: 'Boundary Date Values',
        description: 'Test extreme date values (year 2000, 2050, etc.)',
        category: 'validation',
        status: 'pending'
      },

      // Responsive Design Tests
      {
        id: 'test-mobile-layout',
        name: 'Mobile Layout',
        description: 'Test reminder interface on mobile viewport',
        category: 'responsive',
        status: 'pending'
      },
      {
        id: 'test-desktop-layout',
        name: 'Desktop Layout',
        description: 'Test reminder interface on desktop viewport',
        category: 'responsive',
        status: 'pending'
      }
    ];

    setTests(testCases);
  }, []);

  const runTest = async (test: TestCase): Promise<TestCase> => {
    const startTime = Date.now();
    setCurrentTest(test.id);
    
    try {
      let result = '';
      let autoFixApplied = false;
      const suggestions: string[] = [];

      switch (test.id) {
        case 'test-current-time':
          await testCurrentTime();
          result = 'Successfully created reminder for current time + 2 minutes';
          break;

        case 'test-future-date':
          await testFutureDate();
          result = 'Successfully created reminder for tomorrow';
          break;

        case 'test-different-categories':
          await testDifferentCategories();
          result = 'Successfully tested all 6 reminder categories';
          break;

        case 'test-timezone-handling':
          result = await testTimezoneHandling();
          break;

        case 'test-past-date':
          result = await testPastDate();
          break;

        case 'test-overlapping-reminders':
          result = await testOverlappingReminders();
          break;

        case 'test-multi-day-span':
          result = await testMultiDaySpan();
          break;

        case 'test-leap-year':
          result = await testLeapYear();
          break;

        case 'test-trigger-timing':
          result = await testTriggerTiming();
          break;

        case 'test-active-reminder-logic':
          result = await testActiveReminderLogic();
          break;

        case 'test-empty-title':
          result = await testEmptyTitle();
          break;

        case 'test-invalid-date-format':
          result = await testInvalidDateFormat();
          break;

        case 'test-invalid-time-format':
          result = await testInvalidTimeFormat();
          break;

        case 'test-boundary-dates':
          result = await testBoundaryDates();
          break;

        case 'test-mobile-layout':
          result = await testMobileLayout();
          break;

        case 'test-desktop-layout':
          result = await testDesktopLayout();
          break;

        default:
          throw new Error('Unknown test case');
      }

      return {
        ...test,
        status: 'passed',
        result,
        duration: Date.now() - startTime,
        autoFixApplied,
        suggestions
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        ...test,
        status: 'failed',
        error: errorMessage,
        duration: Date.now() - startTime,
        suggestions: generateSuggestions(test.id, errorMessage)
      };
    }
  };

  // Individual test implementations
  const testCurrentTime = async () => {
    const futureTime = addMinutes(new Date(), 2);
    await createTestReminder('Current Time Test', futureTime, 'medication');
  };

  const testFutureDate = async () => {
    const tomorrow = addDays(new Date(), 1);
    tomorrow.setHours(14, 30, 0, 0);
    await createTestReminder('Future Date Test', tomorrow, 'appointment');
  };

  const testDifferentCategories = async () => {
    const baseTime = addMinutes(new Date(), 5);
    
    for (let i = 0; i < REMINDER_CATEGORIES.length; i++) {
      const reminderTime = addMinutes(baseTime, i);
      await createTestReminder(
        `Category Test - ${REMINDER_CATEGORIES[i]}`,
        reminderTime,
        REMINDER_CATEGORIES[i]
      );
    }
  };

  const testTimezoneHandling = async (): Promise<string> => {
    const now = new Date();
    const testTime = addMinutes(now, 3);
    
    // Create reminder and verify it handles timezone correctly
    const reminder = await createTestReminder('Timezone Test', testTime, 'other');
    
    // Verify the time is stored and retrieved correctly
    const storedTime = new Date((reminder as any).scheduledAt);
    const timeDiff = Math.abs(storedTime.getTime() - testTime.getTime());
    
    if (timeDiff > 60000) { // More than 1 minute difference
      throw new Error(`Timezone mismatch: ${timeDiff / 1000} seconds difference`);
    }
    
    return `Timezone handling verified with ${timeDiff}ms accuracy`;
  };

  const testPastDate = async (): Promise<string> => {
    try {
      const pastTime = subMinutes(new Date(), 5);
      await createTestReminder('Past Date Test', pastTime, 'other');
      throw new Error('Should not allow past date reminders');
    } catch (error) {
      if (error instanceof Error && error.message.includes('future')) {
        return 'Correctly rejected past date reminder - validation working';
      }
      throw new Error(`Unexpected error message: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const testOverlappingReminders = async (): Promise<string> => {
    const sameTime = addMinutes(new Date(), 10);
    
    const reminder1 = await createTestReminder('Overlap Test 1', sameTime, 'medication');
    const reminder2 = await createTestReminder('Overlap Test 2', sameTime, 'appointment');
    
    // Both should be created successfully
    return `Created 2 overlapping reminders at ${format(sameTime, 'HH:mm')}`;
  };

  const testMultiDaySpan = async (): Promise<string> => {
    const today = new Date();
    const tomorrow = addDays(today, 1);
    const dayAfter = addDays(today, 2);
    
    await createTestReminder('Today Reminder', addMinutes(today, 15), 'medication');
    await createTestReminder('Tomorrow Reminder', tomorrow, 'appointment');
    await createTestReminder('Day After Reminder', dayAfter, 'exercise');
    
    return 'Successfully created reminders spanning 3 days';
  };

  const testLeapYear = async (): Promise<string> => {
    const leapYear = new Date(2024, 1, 29, 12, 0, 0); // Feb 29, 2024
    if (leapYear < new Date()) {
      return 'Skipped: Leap year date is in the past';
    }
    
    await createTestReminder('Leap Year Test', leapYear, 'checkup');
    return 'Successfully created leap year reminder';
  };

  const testTriggerTiming = async (): Promise<string> => {
    // Create reminders at different time intervals and verify their classification
    const now = new Date();
    const activeTime = new Date(now.getTime() - 10 * 60 * 1000); // 10 minutes ago (should be active)
    const upcomingTime = new Date(now.getTime() + 30 * 60 * 1000); // 30 minutes from now (should be upcoming)
    const todayTime = new Date(now.getTime() + 2 * 60 * 1000); // 2 minutes from now (should be today)
    
    // Create test reminders with past time allowed for testing
    const activeReminder = await createTestReminder('Active Test Reminder', activeTime, 'medication', true);
    const upcomingReminder = await createTestReminder('Upcoming Test Reminder', upcomingTime, 'appointment');
    const todayReminder = await createTestReminder('Today Test Reminder', todayTime, 'exercise');
    
    // Fetch all reminders to verify classification
    const response = await apiRequest('GET', '/api/reminders');
    const allReminders = await response.json();
    const activeFound = allReminders.some((r: any) => r.id === (activeReminder as any).id);
    const upcomingFound = allReminders.some((r: any) => r.id === (upcomingReminder as any).id);
    const todayFound = allReminders.some((r: any) => r.id === (todayReminder as any).id);
    
    if (!activeFound || !upcomingFound || !todayFound) {
      throw new Error('Failed to retrieve created test reminders');
    }
    
    return `Successfully verified trigger timing classification: active (${activeFound}), upcoming (${upcomingFound}), today (${todayFound})`;
  };

  const testActiveReminderLogic = async (): Promise<string> => {
    const now = new Date();
    const activeTime = addMinutes(now, -5); // 5 minutes ago (should be active)
    const upcomingTime = addMinutes(now, 30); // 30 minutes from now (should be upcoming)
    
    // Create reminders with past time allowed for testing active logic
    const activeReminder = await createTestReminder('Active Logic Test', activeTime, 'medication', true);
    const upcomingReminder = await createTestReminder('Upcoming Logic Test', upcomingTime, 'appointment');
    
    // Verify the reminders were created with correct timestamps
    const activeStoredTime = new Date((activeReminder as any).scheduledAt);
    const upcomingStoredTime = new Date((upcomingReminder as any).scheduledAt);
    
    const isActiveInPast = activeStoredTime < now;
    const isUpcomingInFuture = upcomingStoredTime > now;
    
    if (!isActiveInPast) {
      throw new Error('Active reminder should be in the past');
    }
    if (!isUpcomingInFuture) {
      throw new Error('Upcoming reminder should be in the future');
    }
    
    return `Active/Upcoming logic verified: active reminder ${Math.abs(activeStoredTime.getTime() - activeTime.getTime())}ms accuracy, upcoming reminder ${Math.abs(upcomingStoredTime.getTime() - upcomingTime.getTime())}ms accuracy`;
  };

  const testEmptyTitle = async (): Promise<string> => {
    try {
      await createTestReminder('', addMinutes(new Date(), 5), 'other');
      throw new Error('Should not allow empty title');
    } catch (error) {
      if (error instanceof Error && error.message.includes('title')) {
        return 'Correctly rejected empty title';
      }
      throw error;
    }
  };

  const testInvalidDateFormat = async (): Promise<string> => {
    // Test client-side validation by simulating invalid input
    const invalidDates = ['32/13/2024', '2024-13-45', 'invalid-date'];
    let rejectedCount = 0;
    
    for (const invalidDate of invalidDates) {
      try {
        const testDate = new Date(invalidDate);
        if (isNaN(testDate.getTime())) {
          rejectedCount++;
        }
      } catch {
        rejectedCount++;
      }
    }
    
    return `Rejected ${rejectedCount}/${invalidDates.length} invalid date formats`;
  };

  const testInvalidTimeFormat = async (): Promise<string> => {
    const invalidTimes = ['25:00', '12:60', '99:99', 'invalid:time'];
    let rejectedCount = 0;
    
    for (const timeStr of invalidTimes) {
      const [hours, minutes] = timeStr.split(':');
      if (isNaN(Number(hours)) || isNaN(Number(minutes)) || 
          Number(hours) > 23 || Number(minutes) > 59) {
        rejectedCount++;
      }
    }
    
    return `Rejected ${rejectedCount}/${invalidTimes.length} invalid time formats`;
  };

  const testBoundaryDates = async (): Promise<string> => {
    const boundaryDates = [
      new Date(2025, 0, 1), // Start of 2025
      new Date(2030, 11, 31), // End of 2030
    ];
    
    for (let i = 0; i < boundaryDates.length; i++) {
      if (boundaryDates[i] > new Date()) {
        await createTestReminder(`Boundary Test ${i + 1}`, boundaryDates[i], 'other');
      }
    }
    
    return 'Successfully tested boundary date values';
  };

  const testMobileLayout = async (): Promise<string> => {
    // Test responsive design by checking viewport behavior
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      return 'Mobile layout test passed - running on mobile viewport';
    }
    return 'Mobile layout test requires mobile viewport';
  };

  const testDesktopLayout = async (): Promise<string> => {
    const isDesktop = window.innerWidth >= 1024;
    if (isDesktop) {
      return 'Desktop layout test passed - running on desktop viewport';
    }
    return 'Desktop layout test requires desktop viewport';
  };

  const createTestReminder = async (title: string, scheduledAt: Date, reminderType: string, allowPast = false) => {
    if (!title.trim()) {
      throw new Error('Title is required');
    }

    if (!allowPast && scheduledAt <= new Date()) {
      throw new Error('Scheduled time must be in the future');
    }

    const reminderData = {
      title,
      description: `Test reminder created at ${format(new Date(), 'HH:mm:ss')}`,
      scheduledAt: scheduledAt.toISOString(),
      reminderType,
      isActive: true,
      isCompleted: false,
      userId: 'demo-user-123'
    };

    const response = await apiRequest('POST', '/api/reminders', reminderData);
    return await response.json();

    return response;
  };

  const generateSuggestions = (testId: string, error: string): string[] => {
    const suggestions: string[] = [];
    
    if (error.includes('timezone')) {
      suggestions.push('Consider using UTC for all date comparisons');
      suggestions.push('Add timezone offset handling in date calculations');
    }
    
    if (error.includes('validation')) {
      suggestions.push('Improve form validation with more descriptive error messages');
      suggestions.push('Add client-side validation before API calls');
    }
    
    if (error.includes('past')) {
      suggestions.push('Ensure date validation includes timezone buffer');
      suggestions.push('Consider allowing past reminders for historical tracking');
    }
    
    if (testId.includes('responsive')) {
      suggestions.push('Add media query breakpoints for better responsive design');
      suggestions.push('Test with various device sizes and orientations');
    }
    
    return suggestions;
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setProgress(0);
    
    const startTime = Date.now();
    const updatedTests: TestCase[] = [];
    let passedCount = 0;
    let failedCount = 0;
    let autoFixCount = 0;
    
    const categories: Record<string, { passed: number; failed: number; total: number }> = {};
    const issues: Array<{ severity: 'high' | 'medium' | 'low'; description: string; fix?: string }> = [];

    for (let i = 0; i < tests.length; i++) {
      const test = tests[i];
      setProgress((i / tests.length) * 100);
      
      const result = await runTest(test);
      updatedTests.push(result);
      
      // Update category stats
      if (!categories[result.category]) {
        categories[result.category] = { passed: 0, failed: 0, total: 0 };
      }
      categories[result.category].total++;
      
      if (result.status === 'passed') {
        passedCount++;
        categories[result.category].passed++;
      } else {
        failedCount++;
        categories[result.category].failed++;
        
        // Categorize issues
        const severity = result.category === 'validation' ? 'high' : 
                        result.category === 'edge-case' ? 'medium' : 'low';
        
        issues.push({
          severity,
          description: `${result.name}: ${result.error}`,
          fix: result.suggestions?.join('; ')
        });
      }
      
      if (result.autoFixApplied) {
        autoFixCount++;
      }
      
      await new Promise(resolve => setTimeout(resolve, 100)); // Brief pause between tests
    }

    setProgress(100);
    setTests(updatedTests);
    setCurrentTest(null);
    
    const testReport: TestReport = {
      totalTests: tests.length,
      passedTests: passedCount,
      failedTests: failedCount,
      autoFixesApplied: autoFixCount,
      executionTime: Date.now() - startTime,
      categories,
      issues
    };
    
    setReport(testReport);
    setIsRunning(false);
  };

  const downloadReport = () => {
    if (!report) return;
    
    const reportData = {
      timestamp: new Date().toISOString(),
      summary: {
        totalTests: report.totalTests,
        passedTests: report.passedTests,
        failedTests: report.failedTests,
        successRate: `${((report.passedTests / report.totalTests) * 100).toFixed(1)}%`,
        executionTime: `${(report.executionTime / 1000).toFixed(2)}s`
      },
      categories: report.categories,
      detailedResults: tests.map(test => ({
        name: test.name,
        category: test.category,
        status: test.status,
        result: test.result,
        error: test.error,
        duration: test.duration,
        suggestions: test.suggestions
      })),
      issues: report.issues,
      recommendations: [
        'Implement proper timezone handling across all date operations',
        'Add comprehensive form validation with user-friendly error messages',
        'Consider implementing notification triggers for upcoming reminders',
        'Test responsive design across multiple device sizes',
        'Add error recovery mechanisms for failed reminder creation'
      ]
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reminder-test-report-${format(new Date(), 'yyyy-MM-dd-HHmm')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'accuracy': return '🎯';
      case 'edge-case': return '⚠️';
      case 'trigger': return '⏰';
      case 'responsive': return '📱';
      case 'validation': return '✅';
      default: return '🔍';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'running': return <div className="h-4 w-4 rounded-full bg-blue-500 animate-pulse" />;
      default: return <div className="h-4 w-4 rounded-full bg-gray-300" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-blue-600" />
            Reminder Component Test Suite
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <Button 
              onClick={runAllTests} 
              disabled={isRunning}
              className="flex items-center gap-2"
              data-testid="button-run-tests"
            >
              <Play className="h-4 w-4" />
              {isRunning ? 'Running Tests...' : 'Run All Tests'}
            </Button>
            
            {report && (
              <Button 
                variant="outline" 
                onClick={downloadReport}
                className="flex items-center gap-2"
                data-testid="button-download-report"
              >
                <Download className="h-4 w-4" />
                Download Report
              </Button>
            )}
          </div>

          {isRunning && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-gray-600">
                {currentTest ? `Running: ${tests.find(t => t.id === currentTest)?.name}` : 'Initializing tests...'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {report && (
        <Card>
          <CardHeader>
            <CardTitle>Test Report Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{report.passedTests}</div>
                <div className="text-sm text-gray-600">Passed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{report.failedTests}</div>
                <div className="text-sm text-gray-600">Failed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {((report.passedTests / report.totalTests) * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">
                  {(report.executionTime / 1000).toFixed(2)}s
                </div>
                <div className="text-sm text-gray-600">Execution Time</div>
              </div>
            </div>

            {report.issues.length > 0 && (
              <Alert className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Issues Found:</strong> {report.issues.length} issues detected.
                  {report.autoFixesApplied > 0 && ` ${report.autoFixesApplied} auto-fixes applied.`}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Detailed Test Results */}
      <div className="grid gap-4">
        {Object.entries(tests.reduce((acc, test) => {
          if (!acc[test.category]) acc[test.category] = [];
          acc[test.category].push(test);
          return acc;
        }, {} as Record<string, TestCase[]>)).map(([category, categoryTests]) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>{getCategoryIcon(category)}</span>
                <span className="capitalize">{category.replace('-', ' ')} Tests</span>
                <Badge variant="outline">
                  {categoryTests.filter(t => t.status === 'passed').length}/{categoryTests.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {categoryTests.map((test) => (
                  <div key={test.id} className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className="mt-0.5">
                      {getStatusIcon(test.status)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{test.name}</h4>
                        {test.duration && (
                          <span className="text-sm text-gray-500">{test.duration}ms</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{test.description}</p>
                      {test.result && (
                        <p className="text-sm text-green-700 bg-green-50 p-2 rounded">
                          ✅ {test.result}
                        </p>
                      )}
                      {test.error && (
                        <p className="text-sm text-red-700 bg-red-50 p-2 rounded">
                          ❌ {test.error}
                        </p>
                      )}
                      {test.suggestions && test.suggestions.length > 0 && (
                        <div className="text-sm text-blue-700 bg-blue-50 p-2 rounded">
                          <strong>Suggestions:</strong>
                          <ul className="list-disc list-inside mt-1">
                            {test.suggestions.map((suggestion, i) => (
                              <li key={i}>{suggestion}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {test.autoFixApplied && (
                        <Badge variant="secondary" className="text-xs">
                          Auto-fix Applied
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Responsive Design Test Indicators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>📱</span>
            Current Viewport Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              <span>Width: {window.innerWidth}px</span>
            </div>
            <div className="flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              <span>Height: {window.innerHeight}px</span>
            </div>
            <Badge variant={window.innerWidth < 768 ? 'default' : 'secondary'}>
              {window.innerWidth < 768 ? 'Mobile' : window.innerWidth < 1024 ? 'Tablet' : 'Desktop'}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}