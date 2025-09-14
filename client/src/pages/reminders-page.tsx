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
import { CalendarIcon, Clock, Plus, BarChart3, CheckCircle, Calendar as CalendarLucide, List, Pill, Users, Stethoscope, Activity, Bell, Trash2, Settings, CalendarPlus, PlusCircle, ChartLine, CalendarDays, Repeat, Play, Pause } from 'lucide-react';
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
      case 'medication': return Pill;
      case 'appointment': return CalendarLucide;
      case 'checkup': return Stethoscope;
      case 'exercise': return Activity;
      default: return Bell;
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
            <CalendarLucide className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Health Reminders</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Stay on top of your health with smart reminders for medications, appointments, and wellness activities
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Add Reminder Form */}
          <div className="xl:col-span-3">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-emerald-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center space-x-3 text-xl">
                  <PlusCircle className="h-6 w-6" />
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
                      className="h-12 border-2 border-gray-200 focus:border-blue-500 transition-all duration-300 hover:border-blue-400 hover:shadow-md focus:shadow-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                      Category
                    </label>
                    <select
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-all duration-300 bg-white h-12 hover:border-blue-400 hover:shadow-md cursor-pointer"
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
                      📅 Schedule Date *
                    </label>
                    <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-medium h-14 border-2 border-gray-300 hover:border-blue-500 hover:shadow-md transition-all duration-200 bg-white rounded-xl",
                            !newReminder.date && "text-gray-500"
                          )}
                          data-testid="button-reminder-date"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                              <CalendarIcon className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className="flex flex-col items-start">
                              <span className="text-xs text-gray-500 uppercase tracking-wide">Date</span>
                              <span className="text-sm font-medium text-gray-900">
                                {newReminder.date ? format(newReminder.date, "EEE, MMM d, yyyy") : "Select date"}
                              </span>
                            </div>
                          </div>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 shadow-2xl border-0 rounded-2xl" align="start">
                        <div className="bg-white rounded-2xl overflow-hidden">
                          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white">
                            <h3 className="font-semibold text-lg">Select Date</h3>
                            <p className="text-blue-100 text-sm">Choose when you want to be reminded</p>
                          </div>
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
                            className="p-4"
                            classNames={{
                              months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                              month: "space-y-4",
                              caption: "flex justify-center pt-1 relative items-center",
                              caption_label: "text-lg font-semibold text-gray-900",
                              nav: "space-x-1 flex items-center",
                              nav_button: "h-8 w-8 bg-transparent p-0 hover:bg-blue-100 rounded-lg transition-colors",
                              nav_button_previous: "absolute left-1",
                              nav_button_next: "absolute right-1",
                              table: "w-full border-collapse space-y-1",
                              head_row: "flex",
                              head_cell: "text-gray-500 rounded-md w-8 font-normal text-[0.8rem]",
                              row: "flex w-full mt-2",
                              cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-blue-100 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20 [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-blue-50 [&:has([aria-selected].day-range-middle)]:rounded-none",
                              day: "h-8 w-8 p-0 font-normal aria-selected:opacity-100 hover:bg-blue-50 rounded-lg transition-colors",
                              day_range_end: "day-range-end",
                              day_selected: "bg-blue-600 text-white hover:bg-blue-700 hover:text-white focus:bg-blue-600 focus:text-white font-semibold",
                              day_today: "bg-blue-100 text-blue-900 font-semibold",
                              day_outside: "text-gray-400 opacity-50",
                              day_disabled: "text-gray-400 opacity-50 cursor-not-allowed",
                              day_hidden: "invisible",
                            }}
                          />
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                      🕐 Time *
                    </label>
                    <div className="relative">
                      <Input
                        type="time"
                        value={newReminder.time}
                        onChange={(e) => setNewReminder({ ...newReminder, time: e.target.value })}
                        data-testid="input-reminder-time"
                        className="h-14 pl-14 border-2 border-gray-300 focus:border-blue-500 transition-all duration-200 bg-white rounded-xl text-base font-medium hover:border-blue-400 hover:shadow-md"
                      />
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                        <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                          <Clock className="h-4 w-4 text-indigo-600" />
                        </div>
                      </div>
                      <div className="absolute left-14 top-2 text-xs text-gray-500 uppercase tracking-wide">
                        Time
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                      Frequency
                    </label>
                    <select
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-all duration-300 bg-white h-12 hover:border-blue-400 hover:shadow-md cursor-pointer"
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
                      className="border-2 border-gray-200 focus:border-blue-500 transition-all duration-300 resize-none hover:border-blue-400 hover:shadow-md"
                    />
                  </div>

                  <Button
                    onClick={handleAddReminder}
                    disabled={addReminder.isPending}
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white font-semibold shadow-lg transition-all duration-200 hover:shadow-xl"
                    data-testid="button-add-reminder"
                  >
                    {addReminder.isPending ? (
                      <div className="flex items-center space-x-3">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Creating Reminder...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-3">
                        <PlusCircle className="h-5 w-5" />
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
                  <BarChart3 className="h-5 w-5" />
                  <span>Health Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-5">
                  <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-5 w-5 text-white" />
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
                        <Clock className="h-5 w-5 text-white" />
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
                        <CalendarLucide className="h-5 w-5 text-white" />
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
          <div className="xl:col-span-6">
            <Card className="shadow-2xl border-0 bg-white rounded-3xl overflow-hidden">
              <CardHeader className="bg-white border-b border-gray-100 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <CalendarIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold text-gray-900">
                        {format(selectedCalendarDate, "MMMM yyyy")}
                      </CardTitle>
                      <CardDescription className="text-gray-600 text-base">
                        Select a date to view reminders
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-2 bg-blue-50 px-3 py-2 rounded-lg">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm font-medium text-blue-700">Has Reminders</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="bg-white">
                  <Calendar
                    mode="single"
                    selected={selectedCalendarDate}
                    onSelect={(date) => date && setSelectedCalendarDate(date)}
                    className="w-full"
                    modifiers={{
                      hasReminders: Array.from(getDaysWithReminders()).map(dateStr => new Date(dateStr))
                    }}
                    modifiersClassNames={{
                      hasReminders: "bg-blue-600 text-white font-semibold rounded-lg ring-2 ring-blue-300 ring-offset-1"
                    }}
                    data-testid="calendar-view"
                    classNames={{
                      months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 w-full",
                      month: "space-y-4 w-full",
                      caption: "flex justify-center pt-4 pb-2 relative items-center",
                      caption_label: "text-xl font-bold text-gray-900",
                      nav: "space-x-2 flex items-center",
                      nav_button: "h-9 w-9 bg-gray-100 hover:bg-blue-100 p-0 rounded-lg transition-colors",
                      nav_button_previous: "absolute left-4",
                      nav_button_next: "absolute right-4",
                      table: "w-full border-collapse mx-4",
                      head_row: "grid grid-cols-7 bg-gray-50 rounded-lg mb-2",
                      head_cell: "text-gray-600 font-semibold text-sm py-2 text-center uppercase tracking-wide",
                      row: "grid grid-cols-7 mb-1",
                      cell: "text-center p-1 relative [&:has([aria-selected])]:bg-blue-50 focus-within:relative focus-within:z-20",
                      day: "h-10 w-10 mx-auto p-0 font-medium hover:bg-blue-50 rounded-lg transition-colors cursor-pointer flex items-center justify-center",
                      day_range_end: "day-range-end",
                      day_selected: "bg-blue-600 text-white hover:bg-blue-700 focus:bg-blue-600 focus:text-white font-bold ring-2 ring-blue-300",
                      day_today: "bg-blue-100 text-blue-900 font-bold border-2 border-blue-400",
                      day_outside: "text-gray-400 opacity-50",
                      day_disabled: "text-gray-400 opacity-30 cursor-not-allowed hover:bg-transparent",
                      day_hidden: "invisible",
                    }}
                  />
                </div>
                <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 p-6 border-t border-gray-100">
                  <div className="text-center">
                    <div className="inline-flex items-center space-x-3 bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-200">
                      <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                      <p className="text-lg font-semibold text-gray-800">
                        <span className="text-blue-600">{format(selectedCalendarDate, "EEEE, MMMM d")}</span>
                      </p>
                    </div>
                    <p className="text-sm text-gray-600 mt-3">
                      {getRemindersByDate(selectedCalendarDate).length} reminder{getRemindersByDate(selectedCalendarDate).length !== 1 ? 's' : ''} scheduled for this day
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Day Detail - Reminders for Selected Date */}
          <div className="xl:col-span-3">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center space-x-3 text-lg">
                  <List className="h-5 w-5" />
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
                              {(() => { const Icon = getTypeIcon(reminder.reminderType); return <Icon className="h-4 w-4 text-gray-600" />; })()}
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
                                <Clock className="h-4 w-4 mr-1" />
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
                              {reminder.isActive ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700 h-7 w-7 p-0"
                              onClick={() => deleteReminder.mutate(reminder.id)}
                              data-testid={`button-day-delete-${reminder.id}`}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CalendarDays className="h-8 w-8 text-gray-400" />
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
                <List className="h-5 w-5 text-blue-600" />
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
                              {(() => { const Icon = getTypeIcon(reminder.reminderType); return <Icon className="h-5 w-5 text-gray-600" />; })()}
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
                                <Clock className="h-4 w-4 mr-1" />
                                {new Date(reminder.scheduledAt).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}
                              </span>
                              <span>
                                <Repeat className="h-4 w-4 mr-1" />
                                {reminder.frequency || 'once'}
                              </span>
                              <span>
                                <Bell className="h-4 w-4 mr-1" />
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
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CalendarPlus className="h-16 w-16 text-gray-400 mb-4" />
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
                  <Settings className="h-4 w-4 text-gray-600" />
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