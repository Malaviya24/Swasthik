import { ReminderTests } from '@/components/reminder-tests';

export function TestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Reminder Component Testing Suite
          </h1>
          <p className="text-gray-600">
            Comprehensive automated testing for date/time accuracy, edge cases, and system reliability
          </p>
        </div>
        
        <ReminderTests />
      </div>
    </div>
  );
}