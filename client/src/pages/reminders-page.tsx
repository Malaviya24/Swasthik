import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { type Reminder } from '@shared/schema';

// Extended interface for UI-specific fields
interface UIReminder extends Reminder {
  frequency?: 'daily' | 'weekly' | 'monthly' | 'custom';
}

export default function RemindersPage() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newReminder, setNewReminder] = useState({
    title: '',
    reminderType: 'medication' as const,
    description: '',
    date: new Date(),
    time: '',
    frequency: 'daily' as const,
  });
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date>(new Date());
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch reminders from API
  const { data: reminders = [], isLoading } = useQuery({
    queryKey: ['/api/reminders'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/reminders');
      return await response.json();
    },
  });

  const addReminder = useMutation({
    mutationFn: async (reminder: any) => {
      const response = await apiRequest('POST', '/api/reminders', reminder);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Reminder Added",
        description: "Your health reminder has been set successfully.",
      });
      setShowAddForm(false);
      setNewReminder({
        title: '',
        reminderType: 'medication',
        description: '',
        date: new Date(),
        time: '',
        frequency: 'daily',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/reminders'] });
    },
    onError: () => {
      toast({
        title: "Failed to Add Reminder",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  const toggleReminder = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const response = await apiRequest('PATCH', `/api/reminders/${id}`, { isActive });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Reminder Updated",
        description: "Reminder status has been changed.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/reminders'] });
    },
  });

  const deleteReminder = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('DELETE', `/api/reminders/${id}`);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Reminder Deleted",
        description: "The reminder has been removed.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/reminders'] });
    },
  });

  const handleAddReminder = () => {
    if (!newReminder.title.trim() || !newReminder.time || !newReminder.date) {
      toast({
        title: "Missing Information",
        description: "Please fill in the title, date, and time fields.",
        variant: "destructive",
      });
      return;
    }

    // Create scheduledAt by combining the selected date and time
    const [hours, minutes] = newReminder.time.split(':').map(Number);
    const scheduledAt = new Date(newReminder.date);
    scheduledAt.setHours(hours, minutes, 0, 0);

    // Check if the datetime is in the past
    if (scheduledAt <= new Date()) {
      toast({
        title: "Invalid Date/Time",
        description: "Please select a future date and time for the reminder.",
        variant: "destructive",
      });
      return;
    }

    addReminder.mutate({
      title: newReminder.title,
      description: newReminder.description || '',
      reminderType: newReminder.reminderType,
      scheduledAt: scheduledAt.toISOString(),
      isActive: true,
    });
  };

  const calculateNextReminder = (time: string, frequency: string) => {
    // Simple calculation for demo
    const now = new Date();
    const [hours, minutes] = time.split(':').map(Number);
    const nextDate = new Date(now);
    nextDate.setHours(hours, minutes, 0, 0);
    
    if (nextDate <= now) {
      nextDate.setDate(nextDate.getDate() + 1);
    }
    
    return `${nextDate.toLocaleDateString()} at ${nextDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'medication': return 'fas fa-pills';
      case 'appointment': return 'fas fa-calendar-check';
      case 'checkup': return 'fas fa-stethoscope';
      case 'exercise': return 'fas fa-running';
      default: return 'fas fa-bell';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'medication': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'appointment': return 'bg-green-100 text-green-800 border-green-300';
      case 'checkup': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'exercise': return 'bg-orange-100 text-orange-800 border-orange-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // Calendar helper functions with validation
  const getDateKey = (date: Date) => {
    if (!date || isNaN(date.getTime())) {
      return '';
    }
    return format(date, 'yyyy-MM-dd');
  };

  const getRemindersByDate = (date: Date) => {
    const dateKey = getDateKey(date);
    if (!dateKey) return [];
    
    return reminders.filter((reminder: UIReminder) => {
      const reminderDate = new Date(reminder.scheduledAt);
      if (!reminderDate || isNaN(reminderDate.getTime())) {
        return false;
      }
      return getDateKey(reminderDate) === dateKey;
    });
  };

  const getDaysWithReminders = () => {
    const daysWithReminders = new Set<string>();
    reminders.forEach((reminder: UIReminder) => {
      const reminderDate = new Date(reminder.scheduledAt);
      if (reminderDate && !isNaN(reminderDate.getTime())) {
        const dateKey = getDateKey(reminderDate);
        if (dateKey) {
          daysWithReminders.add(dateKey);
        }
      }
    });
    return daysWithReminders;
  };

  const selectedDateReminders = getRemindersByDate(selectedCalendarDate);

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <i className="fas fa-calendar-check text-3xl text-white"></i>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Health Reminders</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Stay on top of your health with smart reminders for medications, appointments, and wellness activities
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Add Reminder Form */}
          <div className="lg:col-span-1">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-emerald-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center space-x-3 text-xl">
                  <i className="fas fa-plus-circle text-2xl"></i>
                  <span>New Reminder</span>
                </CardTitle>
                <CardDescription className="text-blue-100">
                  Create a personalized health reminder
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                      Reminder Title *
                    </label>
                    <Input
                      placeholder="e.g., Take morning vitamins"
                      value={newReminder.title}
                      onChange={(e) => setNewReminder({ ...newReminder, title: e.target.value })}
                      data-testid="input-reminder-title"
                      className="h-12 border-2 border-gray-200 focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                      Category
                    </label>
                    <select
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors bg-white h-12"
                      value={newReminder.reminderType}
                      onChange={(e) => setNewReminder({ ...newReminder, reminderType: e.target.value as any })}
                      data-testid="select-reminder-type"
                    >
                      <option value="medication">💊 Medication</option>
                      <option value="appointment">📅 Appointment</option>
                      <option value="checkup">🩺 Health Checkup</option>
                      <option value="exercise">🏃 Exercise</option>
                      <option value="other">📋 Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                      Schedule Date *
                    </label>
                    <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal h-12 border-2 border-gray-200 hover:border-blue-300",
                            !newReminder.date && "text-muted-foreground"
                          )}
                          data-testid="button-reminder-date"
                        >
                          <CalendarIcon className="mr-3 h-5 w-5 text-blue-600" />
                          {newReminder.date ? format(newReminder.date, "EEEE, MMMM d, yyyy") : <span>Select date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={newReminder.date}
                          onSelect={(date) => {
                            if (date) {
                              setNewReminder({ ...newReminder, date });
                              setIsDatePickerOpen(false);
                            }
                          }}
                          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                          initialFocus
                          data-testid="calendar-reminder-date"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                      Time *
                    </label>
                    <Input
                      type="time"
                      value={newReminder.time}
                      onChange={(e) => setNewReminder({ ...newReminder, time: e.target.value })}
                      data-testid="input-reminder-time"
                      className="h-12 border-2 border-gray-200 focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                      Frequency
                    </label>
                    <select
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors bg-white h-12"
                      value={newReminder.frequency}
                      onChange={(e) => setNewReminder({ ...newReminder, frequency: e.target.value as any })}
                      data-testid="select-reminder-frequency"
                    >
                      <option value="daily">🔄 Daily</option>
                      <option value="weekly">📅 Weekly</option>
                      <option value="monthly">🗓️ Monthly</option>
                      <option value="custom">⚙️ Custom</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                      Notes (optional)
                    </label>
                    <Textarea
                      placeholder="Add any additional details or instructions..."
                      value={newReminder.description}
                      onChange={(e) => setNewReminder({ ...newReminder, description: e.target.value })}
                      rows={3}
                      data-testid="textarea-reminder-description"
                      className="border-2 border-gray-200 focus:border-blue-500 transition-colors resize-none"
                    />
                  </div>

                  <Button
                    onClick={handleAddReminder}
                    disabled={addReminder.isPending}
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white font-semibold shadow-lg transition-all duration-200 transform hover:scale-105"
                    data-testid="button-add-reminder"
                  >
                    {addReminder.isPending ? (
                      <div className="flex items-center space-x-3">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Creating Reminder...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-3">
                        <i className="fas fa-plus-circle text-lg"></i>
                        <span>Create Reminder</span>
                      </div>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="mt-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-emerald-600 to-blue-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center space-x-3 text-lg">
                  <i className="fas fa-chart-line text-xl"></i>
                  <span>Health Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-5">
                  <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
                        <i className="fas fa-check text-white text-sm"></i>
                      </div>
                      <span className="font-medium text-emerald-800">Active Reminders</span>
                    </div>
                    <Badge className="bg-emerald-600 text-white px-3 py-1 text-sm font-semibold">
                      {reminders.filter((r: UIReminder) => r.isActive).length}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center">
                        <i className="fas fa-clock text-white text-sm"></i>
                      </div>
                      <span className="font-medium text-amber-800">Due Today</span>
                    </div>
                    <Badge className="bg-amber-600 text-white px-3 py-1 text-sm font-semibold">
                      {getRemindersByDate(new Date()).length}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                        <i className="fas fa-calendar-week text-white text-sm"></i>
                      </div>
                      <span className="font-medium text-blue-800">Total Reminders</span>
                    </div>
                    <Badge className="bg-blue-600 text-white px-3 py-1 text-sm font-semibold">
                      {reminders.length}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Calendar View */}
          <div className="xl:col-span-2">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center space-x-3 text-xl">
                  <CalendarIcon className="h-6 w-6" />
                  <span>Calendar View</span>
                </CardTitle>
                <CardDescription className="text-purple-100">
                  Select a date to view and manage your reminders
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <Calendar
                  mode="single"
                  selected={selectedCalendarDate}
                  onSelect={(date) => date && setSelectedCalendarDate(date)}
                  className="rounded-xl border-2 border-gray-200 mx-auto shadow-sm"
                  modifiers={{
                    hasReminders: Array.from(getDaysWithReminders()).map(dateStr => new Date(dateStr))
                  }}
                  modifiersStyles={{
                    hasReminders: {
                      backgroundColor: '#6366f1',
                      color: 'white',
                      fontWeight: 'bold',
                      borderRadius: '8px'
                    }
                  }}
                  data-testid="calendar-view"
                />
                <div className="mt-6 text-center bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg">
                  <p className="text-lg font-semibold text-gray-800">
                    Selected: <span className="text-purple-600">{format(selectedCalendarDate, "EEEE, MMMM d, yyyy")}</span>
                  </p>
                  <p className="text-sm text-gray-600 mt-2 flex items-center justify-center space-x-2">
                    <i className="fas fa-info-circle text-purple-500"></i>
                    <span>Purple dates have scheduled reminders</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Day Detail - Reminders for Selected Date */}
          <div className="xl:col-span-1">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center space-x-3 text-lg">
                  <i className="fas fa-list-check text-xl"></i>
                  <span>{format(selectedCalendarDate, "MMM d")}</span>
                </CardTitle>
                <CardDescription className="text-indigo-100">
                  {selectedDateReminders.length} reminder{selectedDateReminders.length !== 1 ? 's' : ''} scheduled
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {selectedDateReminders.length > 0 ? (
                  <div className="space-y-4">
                    {selectedDateReminders.map((reminder: UIReminder) => (
                      <div
                        key={reminder.id}
                        className={`border-2 rounded-xl p-4 transition-all shadow-sm ${
                          reminder.isActive ? 'border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50' : 'border-gray-200 bg-gray-50 opacity-60'
                        }`}
                        data-testid={`selected-date-reminder-${reminder.id}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <i className={`${getTypeIcon(reminder.reminderType)} text-sm`}></i>
                              <h4 className="font-medium text-gray-900 text-sm">{reminder.title}</h4>
                              {reminder.isActive && (
                                <Badge className="bg-green-100 text-green-800 text-xs">Active</Badge>
                              )}
                            </div>
                            
                            {reminder.description && (
                              <p className="text-gray-600 text-xs mb-2">{reminder.description}</p>
                            )}
                            
                            <div className="flex items-center space-x-3 text-xs text-gray-500">
                              <span>
                                <i className="fas fa-clock mr-1"></i>
                                {new Date(reminder.scheduledAt).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}
                              </span>
                              <Badge className={`${getTypeColor(reminder.reminderType)} text-xs`}>
                                {reminder.reminderType}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-1 ml-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleReminder.mutate({ id: reminder.id, isActive: !reminder.isActive })}
                              data-testid={`button-day-toggle-${reminder.id}`}
                              className="h-7 w-7 p-0"
                            >
                              <i className={`fas ${reminder.isActive ? 'fa-pause' : 'fa-play'} text-xs`}></i>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700 h-7 w-7 p-0"
                              onClick={() => deleteReminder.mutate(reminder.id)}
                              data-testid={`button-day-delete-${reminder.id}`}
                            >
                              <i className="fas fa-trash text-xs"></i>
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-calendar-day text-2xl text-gray-400"></i>
                    </div>
                    <p className="text-gray-600 font-medium mb-2">No reminders scheduled</p>
                    <p className="text-sm text-gray-500 leading-relaxed">Select a purple date on the calendar<br />or create a new reminder</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* All Reminders List */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <i className="fas fa-list text-blue-600"></i>
                  <span>Your Reminders</span>
                </CardTitle>
                <CardDescription>
                  Manage your active health reminders
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading reminders...</p>
                  </div>
                ) : reminders.length > 0 ? (
                  <div className="space-y-4">
                    {reminders.map((reminder: UIReminder) => (
                      <div
                        key={reminder.id}
                        className={`border rounded-lg p-4 transition-all ${
                          reminder.isActive ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-gray-50 opacity-60'
                        }`}
                        data-testid={`reminder-${reminder.id}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <i className={`${getTypeIcon(reminder.reminderType)} text-lg`}></i>
                              <h3 className="font-semibold text-gray-900">{reminder.title}</h3>
                              <Badge className={getTypeColor(reminder.reminderType)}>
                                {reminder.reminderType}
                              </Badge>
                              {reminder.isActive && (
                                <Badge className="bg-green-100 text-green-800">Active</Badge>
                              )}
                            </div>
                            
                            {reminder.description && (
                              <p className="text-gray-600 text-sm mb-2">{reminder.description}</p>
                            )}
                            
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>
                                <i className="fas fa-clock mr-1"></i>
                                {new Date(reminder.scheduledAt).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}
                              </span>
                              <span>
                                <i className="fas fa-repeat mr-1"></i>
                                {reminder.frequency || 'once'}
                              </span>
                              <span>
                                <i className="fas fa-bell mr-1"></i>
                                {new Date(reminder.scheduledAt).toLocaleDateString()} at {new Date(reminder.scheduledAt).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2 ml-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleReminder.mutate({ id: reminder.id, isActive: !reminder.isActive })}
                              data-testid={`button-toggle-${reminder.id}`}
                            >
                              <i className={`fas ${reminder.isActive ? 'fa-pause' : 'fa-play'} mr-1`}></i>
                              {reminder.isActive ? 'Pause' : 'Resume'}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => deleteReminder.mutate(reminder.id)}
                              data-testid={`button-delete-${reminder.id}`}
                            >
                              <i className="fas fa-trash"></i>
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <i className="fas fa-calendar-plus text-4xl text-gray-400 mb-4"></i>
                    <p className="text-gray-500 mb-2">No reminders set yet</p>
                    <p className="text-sm text-gray-400">Create your first health reminder using the form on the left</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <i className="fas fa-cog text-gray-600"></i>
                  <span>Notification Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">Browser Notifications</h4>
                      <p className="text-sm text-gray-600">Receive notifications in your browser</p>
                    </div>
                    <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors">
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6"></span>
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">Sound Alerts</h4>
                      <p className="text-sm text-gray-600">Play sound when reminders are due</p>
                    </div>
                    <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors">
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6"></span>
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">Snooze Option</h4>
                      <p className="text-sm text-gray-600">Allow snoozing reminders for 5–15 minutes</p>
                    </div>
                    <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors" data-testid="toggle-snooze">
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6"></span>
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}