import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Heart, Pill, Stethoscope, Activity, Plus, Edit2, Trash2, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addMonths, subMonths, isAfter, isSameDay, isValid } from 'date-fns';
import { z } from 'zod';
import { type Reminder, insertReminderSchema, type InsertReminder } from '@shared/schema';

// Category configuration
type Category = 'medication' | 'appointment' | 'checkup' | 'exercise' | 'vaccination' | 'other';

const CATEGORY_META: Record<Category, { label: string; icon: typeof Pill; bgColor: string; textColor: string; dotColor: string }> = {
  medication: {
    label: 'Medication',
    icon: Pill,
    bgColor: 'bg-blue-50 hover:bg-blue-100',
    textColor: 'text-blue-700',
    dotColor: 'bg-blue-500',
  },
  appointment: {
    label: 'Appointment',
    icon: Stethoscope,
    bgColor: 'bg-green-50 hover:bg-green-100',
    textColor: 'text-green-700',
    dotColor: 'bg-green-500',
  },
  checkup: {
    label: 'Health Checkup',
    icon: Heart,
    bgColor: 'bg-pink-50 hover:bg-pink-100',
    textColor: 'text-pink-700',
    dotColor: 'bg-pink-500',
  },
  exercise: {
    label: 'Exercise',
    icon: Activity,
    bgColor: 'bg-orange-50 hover:bg-orange-100',
    textColor: 'text-orange-700',
    dotColor: 'bg-orange-500',
  },
  vaccination: {
    label: 'Vaccination',
    icon: Stethoscope,
    bgColor: 'bg-purple-50 hover:bg-purple-100',
    textColor: 'text-purple-700',
    dotColor: 'bg-purple-500',
  },
  other: {
    label: 'Other',
    icon: CalendarIcon,
    bgColor: 'bg-gray-50 hover:bg-gray-100',
    textColor: 'text-gray-700',
    dotColor: 'bg-gray-500',
  },
};

// Helper function to safely get category metadata with fallback
const getCategoryMeta = (category: string) => {
  const meta = CATEGORY_META[category as Category];
  if (meta) {
    return meta;
  }
  // Fallback for unknown categories
  return {
    label: 'Other',
    icon: CalendarIcon,
    bgColor: 'bg-gray-50 hover:bg-gray-100',
    textColor: 'text-gray-700',
    dotColor: 'bg-gray-500',
  };
};

// Form validation schema (separate from insert schema)
const reminderFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  reminderType: z.enum(['medication', 'appointment', 'checkup', 'exercise', 'vaccination', 'other']),
  description: z.string().optional(),
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
  period: z.enum(['AM', 'PM']),
}).refine((data) => {
  // Validate time format first
  if (!data.time || !/^\d{1,2}:\d{2}$/.test(data.time)) {
    return false;
  }
  
  // Convert 12-hour format to 24-hour format for validation
  const [hours, minutes] = data.time.split(':');
  const hourNum = parseInt(hours);
  const minuteNum = parseInt(minutes);
  
  if (isNaN(hourNum) || isNaN(minuteNum) || hourNum < 1 || hourNum > 12 || minuteNum < 0 || minuteNum > 59) {
    return false;
  }
  
  let hour24 = hourNum;
  if (data.period === 'PM' && hour24 !== 12) hour24 += 12;
  if (data.period === 'AM' && hour24 === 12) hour24 = 0;
  
  const timeString = `${hour24.toString().padStart(2, '0')}:${minutes}`;
  const scheduledDate = new Date(`${data.date}T${timeString}`);
  
  if (!isValid(scheduledDate)) {
    return false;
  }
  
  return isAfter(scheduledDate, new Date());
}, {
  message: 'Please select a future date and time',
  path: ['date'],
});

type ReminderFormData = z.infer<typeof reminderFormSchema>;

export default function RemindersPage() {
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Initialize form with react-hook-form and zod validation
  const form = useForm<ReminderFormData>({
    resolver: zodResolver(reminderFormSchema),
    defaultValues: {
      title: '',
      reminderType: 'medication',
      description: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      time: '09:00',
      period: 'AM',
    },
  });

  // Edit form for editing existing reminders
  const editForm = useForm<ReminderFormData>({
    resolver: zodResolver(reminderFormSchema),
  });

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
      form.reset({
        title: '',
        reminderType: 'medication',
        description: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        time: '09:00',
        period: 'AM',
      });
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

  const updateReminder = useMutation<Reminder, Error, { id: string; data: Partial<InsertReminder> }>({
    mutationFn: async ({ id, data }) => {
      const response = await apiRequest('PATCH', `/api/reminders/${id}`, data);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Reminder Updated",
        description: "Your reminder has been updated successfully.",
      });
      setEditingReminder(null);
      setIsEditDialogOpen(false);
      editForm.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/reminders'] });
    },
    onError: (error) => {
      toast({
        title: "Failed to Update Reminder",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteReminder = useMutation<{ success: boolean }, Error, string>({
    mutationFn: async (id: string) => {
      const response = await apiRequest('DELETE', `/api/reminders/${id}`);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Reminder Deleted",
        description: "Your reminder has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/reminders'] });
    },
    onError: (error) => {
      toast({
        title: "Failed to Delete Reminder",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  // Convert 12-hour format to 24-hour format
  const convertTo24Hour = (time: string, period: 'AM' | 'PM') => {
    const [hours, minutes] = time.split(':');
    let hour24 = parseInt(hours);
    
    if (period === 'PM' && hour24 !== 12) {
      hour24 += 12;
    } else if (period === 'AM' && hour24 === 12) {
      hour24 = 0;
    }
    
    return `${hour24.toString().padStart(2, '0')}:${minutes}`;
  };

  // Convert 24-hour format to 12-hour format
  const convertTo12Hour = (time24: string) => {
    const [hours, minutes] = time24.split(':');
    const hour24 = parseInt(hours);
    
    if (hour24 === 0) {
      return { time: `12:${minutes}`, period: 'AM' as const };
    } else if (hour24 < 12) {
      return { time: `${hour24}:${minutes}`, period: 'AM' as const };
    } else if (hour24 === 12) {
      return { time: `12:${minutes}`, period: 'PM' as const };
    } else {
      return { time: `${hour24 - 12}:${minutes}`, period: 'PM' as const };
    }
  };

  // Handle form submission
  const onSubmit = (data: ReminderFormData) => {
    const time24 = convertTo24Hour(data.time, data.period);
    const scheduledAt = new Date(`${data.date}T${time24}`);
    
    const reminderData: InsertReminder = {
      title: data.title,
      description: data.description || null,
      reminderType: data.reminderType,
      scheduledAt: scheduledAt,
      userId: 'demo-user-123', // Using demo user ID like the backend
      isCompleted: false,
      isActive: true,
    };

    addReminder.mutate(reminderData);
  };

  // Handle edit form submission
  const onEditSubmit = (data: ReminderFormData) => {
    if (!editingReminder) return;
    
    const time24 = convertTo24Hour(data.time, data.period);
    const scheduledAt = new Date(`${data.date}T${time24}`);
    
    const reminderData: Partial<InsertReminder> = {
      title: data.title,
      description: data.description || null,
      reminderType: data.reminderType,
      scheduledAt: scheduledAt,
    };

    updateReminder.mutate({ id: editingReminder.id, data: reminderData });
  };

  // Handle edit button click
  const handleEdit = (reminder: Reminder) => {
    const reminderDate = new Date(reminder.scheduledAt);
    
    let time = '09:00';
    let period: 'AM' | 'PM' = 'AM';
    let dateStr = format(new Date(), 'yyyy-MM-dd');
    
    if (isValid(reminderDate)) {
      const time24 = format(reminderDate, 'HH:mm');
      const converted = convertTo12Hour(time24);
      time = converted.time;
      period = converted.period;
      dateStr = format(reminderDate, 'yyyy-MM-dd');
    }
    
    editForm.reset({
      title: reminder.title,
      reminderType: reminder.reminderType as Category,
      description: reminder.description || '',
      date: dateStr,
      time: time,
      period: period,
    });
    setEditingReminder(reminder);
    setIsEditDialogOpen(true);
  };

  // Handle delete button click
  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this reminder?')) {
      deleteReminder.mutate(id);
    }
  };

  // Helper functions
  const getRemindersByDate = (date: Date) => {
    return reminders.filter((reminder) => {
      const reminderDate = new Date(reminder.scheduledAt);
      return isValid(reminderDate) && isSameDay(reminderDate, date);
    });
  };

  const getRemindersCountByCategory = (date: Date) => {
    const dayReminders = getRemindersByDate(date);
    const counts: Partial<Record<Category, number>> = {};
    
    dayReminders.forEach(reminder => {
      const category = reminder.reminderType as Category;
      counts[category] = (counts[category] || 0) + 1;
    });
    
    return counts;
  };

  const getDominantCategory = (date: Date): Category | null => {
    const counts = getRemindersCountByCategory(date);
    const entries = Object.entries(counts) as [Category, number][];
    
    if (entries.length === 0) return null;
    
    return entries.reduce((max, current) => 
      current[1] > max[1] ? current : max
    )[0];
  };

  const selectedDateReminders = getRemindersByDate(selectedCalendarDate);
  const activeReminders = reminders.filter((r) => r.isActive);

  // Helper function to check if date has reminders
  const dateHasReminders = (date: Date) => {
    return reminders.some(r => {
      const reminderDate = new Date(r.scheduledAt);
      return isValid(reminderDate) && isSameDay(reminderDate, date);
    });
  };

  const ReminderForm = ({ form, onSubmit, isLoading, submitLabel }: {
    form: ReturnType<typeof useForm<ReminderFormData>>;
    onSubmit: (data: ReminderFormData) => void;
    isLoading: boolean;
    submitLabel: string;
  }) => (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                  {Object.entries(CATEGORY_META).map(([key, meta]) => (
                    <SelectItem key={key} value={key}>
                      {meta.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date</FormLabel>
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

        <div className="grid grid-cols-2 gap-4">
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
                    className="w-full"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="period"
            render={({ field }) => (
              <FormItem>
                <FormLabel>AM/PM</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-time-period">
                      <SelectValue placeholder="AM/PM" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="AM">AM</SelectItem>
                    <SelectItem value="PM">PM</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-colors"
          data-testid="button-add-reminder"
        >
          {isLoading ? 'Saving...' : submitLabel}
        </Button>
      </form>
    </Form>
  );

  return (
    <div className="min-h-screen bg-gray-50/30">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center shadow-sm">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Health Reminders</h1>
              <p className="text-gray-600 mt-1">Stay on top of your wellness with smart reminders</p>
            </div>
          </div>
        </div>

        {/* Main Layout - Responsive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Add Reminder Form - Left Sidebar */}
          <div className="lg:col-span-4 xl:col-span-3">
            <Card className="shadow-sm border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  New Reminder
                </CardTitle>
                <CardDescription className="text-sm text-gray-600">
                  Set up your health reminders
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ReminderForm
                  form={form}
                  onSubmit={onSubmit}
                  isLoading={addReminder.isPending}
                  submitLabel="Create Reminder"
                />
                
                {/* Quick Stats */}
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{activeReminders.length}</div>
                      <div className="text-xs text-gray-500">Active</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">{getRemindersByDate(new Date()).length}</div>
                      <div className="text-xs text-gray-500">Today</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-600">{reminders.length}</div>
                      <div className="text-xs text-gray-500">Total</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Calendar and Reminders - Main Content */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-6">
            
            {/* Calendar Card */}
            <Card className="shadow-sm border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    {format(currentMonth, 'MMMM yyyy')}
                  </CardTitle>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                      className="h-8 w-8 p-0 hover:bg-gray-100 transition-colors"
                      data-testid="button-prev-month"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                      className="h-8 w-8 p-0 hover:bg-gray-100 transition-colors"
                      data-testid="button-next-month"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedCalendarDate}
                  onSelect={(date) => date && setSelectedCalendarDate(date)}
                  month={currentMonth}
                  onMonthChange={setCurrentMonth}
                  data-testid="calendar-main"
                  className="w-full"
                  classNames={{
                    months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 w-full",
                    month: "space-y-4 w-full",
                    caption: "flex justify-center pt-1 relative items-center mb-4",
                    caption_label: "text-lg font-medium",
                    nav: "space-x-1 flex items-center",
                    nav_button: "h-8 w-8 bg-transparent p-0 hover:bg-gray-100 rounded-md transition-colors",
                    nav_button_previous: "absolute left-1",
                    nav_button_next: "absolute right-1",
                    table: "w-full border-collapse space-y-1",
                    head_row: "flex w-full",
                    head_cell: "text-gray-500 rounded-md font-normal text-sm text-center flex-1 h-10 flex items-center justify-center",
                    row: "flex w-full mt-2",
                    cell: "text-center text-sm p-0 relative hover:bg-gray-50 rounded-lg transition-colors flex-1 h-12 flex items-center justify-center",
                    day: "h-10 w-10 p-0 font-normal aria-selected:opacity-100 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-center relative",
                    day_selected: "bg-blue-600 text-white hover:bg-blue-700 hover:text-white focus:bg-blue-600 focus:text-white",
                    day_today: "bg-gray-100 text-gray-900 font-semibold border-2 border-blue-200",
                    day_outside: "text-gray-400 opacity-50",
                    day_disabled: "text-gray-400 opacity-50 cursor-not-allowed",
                    day_hidden: "invisible",
                  }}
                />
                
              </CardContent>
            </Card>

            {/* Reminders List Card */}
            <Card className="shadow-sm border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-900">
                      {isSameDay(selectedCalendarDate, new Date()) ? "Today's Reminders" : `Reminders for ${format(selectedCalendarDate, 'MMM d, yyyy')}`}
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-600">
                      {selectedDateReminders.length === 0 
                        ? 'No reminders scheduled for this day' 
                        : `${selectedDateReminders.length} reminder${selectedDateReminders.length > 1 ? 's' : ''} scheduled`}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-20 w-full rounded-xl" />
                    ))}
                  </div>
                ) : error ? (
                  <div className="text-center py-8 text-red-500" data-testid="error-reminders">
                    Failed to load reminders
                  </div>
                ) : selectedDateReminders.length === 0 ? (
                  <div className="text-center py-12">
                    <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-2">No reminders for this day</p>
                    <p className="text-sm text-gray-400">Add a reminder using the form on the left</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedDateReminders.map((reminder) => {
                      const category = reminder.reminderType as Category;
                      const meta = getCategoryMeta(category);
                      const IconComponent = meta.icon;

                      return (
                        <div
                          key={reminder.id}
                          className={`p-4 rounded-xl border border-gray-100 ${meta.bgColor} transition-colors group hover:shadow-md`}
                          data-testid={`card-reminder-${reminder.id}`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3 flex-1">
                              <div className={`w-10 h-10 ${meta.dotColor} rounded-lg flex items-center justify-center text-white shadow-sm`}>
                                <IconComponent className="h-5 w-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-gray-900 mb-1" data-testid={`text-reminder-title-${reminder.id}`}>
                                  {reminder.title}
                                </h4>
                                <div className="flex items-center space-x-2 mb-2">
                                  <Badge variant="outline" className={`text-xs ${meta.textColor} border-current`}>
                                    {meta.label}
                                  </Badge>
                                  <span className="text-sm text-gray-600" data-testid={`text-reminder-time-${reminder.id}`}>
                                    {(() => {
                                      const date = new Date(reminder.scheduledAt);
                                      return isValid(date) ? format(date, 'h:mm a') : 'Invalid time';
                                    })()}
                                  </span>
                                </div>
                                {reminder.description && (
                                  <p className="text-sm text-gray-600 mt-2" data-testid={`text-reminder-description-${reminder.id}`}>
                                    {reminder.description}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(reminder)}
                                className="h-8 w-8 p-0 hover:bg-white/80 transition-colors"
                                data-testid={`button-edit-${reminder.id}`}
                              >
                                <Edit2 className="h-4 w-4 text-gray-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(reminder.id)}
                                className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 transition-colors"
                                data-testid={`button-delete-${reminder.id}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Show all reminders when there are reminders but none for selected date */}
                {selectedDateReminders.length === 0 && reminders.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-gray-100">
                    <h4 className="font-medium text-gray-900 mb-4">All Upcoming Reminders</h4>
                    <div className="space-y-2">
                      {reminders.slice(0, 5).map((reminder) => {
                        const category = reminder.reminderType as Category;
                        const meta = getCategoryMeta(category);

                        return (
                          <div
                            key={reminder.id}
                            className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <div className="flex items-center space-x-3">
                              <div className={`w-6 h-6 ${meta.dotColor} rounded-full flex items-center justify-center`}>
                                <div className="w-2 h-2 bg-white rounded-full" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 text-sm">{reminder.title}</p>
                                <p className="text-xs text-gray-600">
                                  {(() => {
                                    const date = new Date(reminder.scheduledAt);
                                    return isValid(date) ? format(date, 'MMM d, h:mm a') : 'Invalid date';
                                  })()}
                                </p>
                              </div>
                            </div>
                            <Badge variant="outline" className={`text-xs ${meta.textColor} border-current`}>
                              {meta.label}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Reminder</DialogTitle>
              <DialogDescription>
                Update your reminder details below.
              </DialogDescription>
            </DialogHeader>
            {editingReminder && (
              <ReminderForm
                form={editForm}
                onSubmit={onEditSubmit}
                isLoading={updateReminder.isPending}
                submitLabel="Update Reminder"
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}