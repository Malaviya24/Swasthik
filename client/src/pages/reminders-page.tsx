import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Heart, Pill, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addMonths, subMonths, isAfter } from 'date-fns';
import { z } from 'zod';
import { type Reminder, insertReminderSchema, type InsertReminder } from '@shared/schema';

// Extended validation schema for client-side validation
const reminderFormSchema = insertReminderSchema.extend({
  date: z.string(), // Date input as string
  time: z.string().min(1, 'Time is required'),
}).refine((data) => {
  // Validate that the scheduled date/time is in the future
  const scheduledDate = new Date(`${data.date}T${data.time}`);
  return isAfter(scheduledDate, new Date());
}, {
  message: 'Please select a future date and time',
  path: ['date'], // Show error on date field
});

type ReminderFormData = z.infer<typeof reminderFormSchema>;

export default function RemindersPage() {
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [notificationSettings, setNotificationSettings] = useState({
    browserNotifications: true,
    soundAlerts: false,
    snoozeOption: true,
  });
  const { toast } = useToast();

  // Initialize form with react-hook-form and zod validation
  const form = useForm<ReminderFormData>({
    resolver: zodResolver(reminderFormSchema),
    defaultValues: {
      title: '',
      reminderType: 'medication',
      description: '',
      userId: '', // This will be set when we have auth
      scheduledAt: new Date().toISOString(),
      date: format(new Date(), 'yyyy-MM-dd'),
      time: '',
      isCompleted: false,
      isActive: true,
    },
  });

  // Load notification settings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('notificationSettings');
    if (saved) {
      setNotificationSettings(JSON.parse(saved));
    }
  }, []);

  // Save notification settings to localStorage
  useEffect(() => {
    localStorage.setItem('notificationSettings', JSON.stringify(notificationSettings));
  }, [notificationSettings]);

  // Fetch reminders from API
  const { data: reminders = [], isLoading, error } = useQuery<Reminder[]>({
    queryKey: ['/api/reminders'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/reminders');
      return await response.json();
    },
  });

  const addReminder = useMutation<Reminder, Error, InsertReminder>({
    mutationFn: async (reminder: InsertReminder) => {
      const response = await apiRequest('POST', '/api/reminders', reminder);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Reminder Added",
        description: "Your health reminder has been set successfully.",
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/reminders'] });
    },
    onError: (error) => {
      toast({
        title: "Failed to Add Reminder",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = (data: ReminderFormData) => {
    // Combine date and time into scheduledAt
    const scheduledAt = new Date(`${data.date}T${data.time}`);
    
    const reminderData: InsertReminder = {
      title: data.title,
      description: data.description || '',
      reminderType: data.reminderType,
      scheduledAt: scheduledAt.toISOString(),
      userId: data.userId || 'temp-user', // TODO: Get from auth context
      isCompleted: false,
      isActive: true,
    };

    addReminder.mutate(reminderData);
  };

  // Handle browser notification permission
  const handleNotificationToggle = async (type: keyof typeof notificationSettings, enabled: boolean) => {
    if (type === 'browserNotifications' && enabled) {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          toast({
            title: "Permission Denied",
            description: "Browser notifications require permission to work.",
            variant: "destructive",
          });
          return;
        }
      } else {
        toast({
          title: "Not Supported",
          description: "Your browser doesn't support notifications.",
          variant: "destructive",
        });
        return;
      }
    }
    
    setNotificationSettings(prev => ({ ...prev, [type]: enabled }));
  };

  // Helper functions
  const getDateKey = (date: Date) => {
    if (!date || isNaN(date.getTime())) {
      return '';
    }
    return format(date, 'yyyy-MM-dd');
  };

  const getRemindersByDate = (date: Date) => {
    const dateKey = getDateKey(date);
    if (!dateKey) return [];
    
    return reminders.filter((reminder: Reminder) => {
      const reminderDate = new Date(reminder.scheduledAt);
      if (!reminderDate || isNaN(reminderDate.getTime())) {
        return false;
      }
      return getDateKey(reminderDate) === dateKey;
    });
  };

  const selectedDateReminders = getRemindersByDate(selectedCalendarDate);
  const todayReminders = getRemindersByDate(new Date());
  const activeReminders = reminders.filter((r: Reminder) => r.isActive);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex h-screen">
        {/* Left Sidebar - New Reminder Form */}
        <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-6 overflow-y-auto">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">New Reminder</h2>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Reminder Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reminder Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Take morning vitamins"
                        {...field}
                        data-testid="input-reminder-title"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Category */}
              <FormField
                control={form.control}
                name="reminderType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-reminder-type">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="medication">Medication</SelectItem>
                        <SelectItem value="appointment">Appointment</SelectItem>
                        <SelectItem value="checkup">Health Checkup</SelectItem>
                        <SelectItem value="exercise">Exercise</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Schedule Date */}
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Schedule Date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        data-testid="input-reminder-date"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Time */}
              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time</FormLabel>
                    <FormControl>
                      <Input
                        type="time"
                        {...field}
                        data-testid="input-reminder-time"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Notes */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any specific instructions or details..."
                        rows={3}
                        {...field}
                        data-testid="textarea-reminder-description"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Create Button */}
              <Button
                type="submit"
                disabled={addReminder.isPending}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                data-testid="button-add-reminder"
              >
                {addReminder.isPending ? 'Creating...' : 'Create Reminder'}
              </Button>
            </form>
          </Form>

          {/* Health Overview Stats */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Health Overview</h3>
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
              </div>
            ) : error ? (
              <div className="text-center py-4 text-red-500 dark:text-red-400" data-testid="error-health-overview">
                Failed to load reminder stats
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Active</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200" data-testid="badge-active-count">
                    {activeReminders.length}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Today</span>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200" data-testid="badge-today-count">
                    {todayReminders.length}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total</span>
                  <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200" data-testid="badge-total-count">
                    {reminders.length}
                  </Badge>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-8 py-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <Heart className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Health Reminders</h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Stay on top of your health with smart reminders for medications, appointments, and wellness activities
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1 flex">
            {/* Calendar Area */}
            <div className="flex-1 p-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                {/* Calendar Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {format(currentMonth, 'MMMM yyyy')}
                  </h2>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                      data-testid="button-prev-month"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                      data-testid="button-next-month"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Calendar */}
                <Calendar
                  mode="single"
                  selected={selectedCalendarDate}
                  onSelect={(date) => {
                    if (date) {
                      setSelectedCalendarDate(date);
                    }
                  }}
                  month={currentMonth}
                  onMonthChange={setCurrentMonth}
                  data-testid="calendar-main"
                  className="w-full"
                  classNames={{
                    months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                    month: "space-y-4",
                    caption: "flex justify-center pt-1 relative items-center",
                    caption_label: "text-lg font-medium",
                    nav: "space-x-1 flex items-center",
                    nav_button: "h-8 w-8 bg-transparent p-0 hover:bg-gray-100 rounded-md transition-colors",
                    nav_button_previous: "absolute left-1",
                    nav_button_next: "absolute right-1",
                    table: "w-full border-collapse space-y-1",
                    head_row: "flex",
                    head_cell: "text-gray-500 rounded-md w-12 font-normal text-sm text-center",
                    row: "flex w-full mt-2",
                    cell: "text-center text-sm p-0 relative hover:bg-gray-50 rounded-md transition-colors",
                    day: "h-12 w-12 p-0 font-normal aria-selected:opacity-100 hover:bg-gray-100 rounded-md transition-colors flex items-center justify-center",
                    day_selected: "bg-blue-600 text-white hover:bg-blue-700 hover:text-white focus:bg-blue-600 focus:text-white",
                    day_today: "bg-gray-100 text-gray-900 font-medium",
                    day_outside: "text-gray-400 opacity-50",
                    day_disabled: "text-gray-400 opacity-50 cursor-not-allowed",
                    day_hidden: "invisible",
                  }}
                />
              </div>

              {/* Your Reminders Section */}
              <div className="mt-8">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Your Reminders</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">Upcoming health reminders</p>
                  
                  {reminders.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      No reminders set yet. Create your first reminder using the form on the left sidebar.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {reminders.slice(0, 5).map((reminder: UIReminder) => (
                        <div key={reminder.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Pill className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{reminder.title}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {format(new Date(reminder.scheduledAt), 'MMM d, yyyy at h:mm a')}
                              </p>
                            </div>
                          </div>
                          <Badge variant={reminder.isActive ? "default" : "secondary"}>
                            {reminder.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Sidebar - Selected Date & Notification Settings */}
            <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 p-6">
              {/* Selected Date */}
              <div className="mb-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">
                    {format(selectedCalendarDate, 'MMM d')}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {selectedDateReminders.length === 0
                      ? 'No reminders scheduled for this day'
                      : `${selectedDateReminders.length} reminder${selectedDateReminders.length > 1 ? 's' : ''} scheduled`
                    }
                  </div>
                </div>

                {selectedDateReminders.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {selectedDateReminders.map((reminder: Reminder) => (
                      <div key={reminder.id} className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="font-medium text-blue-900 dark:text-blue-100">{reminder.title}</p>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          {format(new Date(reminder.scheduledAt), 'h:mm a')}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Notification Settings */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Notification Settings</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Manage how you receive alerts</p>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Browser Notifications</p>
                    </div>
                    <Switch
                      checked={notificationSettings.browserNotifications}
                      onCheckedChange={(checked) => handleNotificationToggle('browserNotifications', checked)}
                      data-testid="switch-browser-notifications"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Sound Alerts</p>
                    </div>
                    <Switch
                      checked={notificationSettings.soundAlerts}
                      onCheckedChange={(checked) => handleNotificationToggle('soundAlerts', checked)}
                      data-testid="switch-sound-alerts"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Snooze Option (5-15 minutes)</p>
                    </div>
                    <Switch
                      checked={notificationSettings.snoozeOption}
                      onCheckedChange={(checked) => handleNotificationToggle('snoozeOption', checked)}
                      data-testid="switch-snooze-option"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}