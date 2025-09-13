import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface Reminder {
  id: string;
  title: string;
  type: 'medication' | 'appointment' | 'checkup' | 'exercise' | 'other';
  description: string;
  time: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
  active: boolean;
  nextReminder: string;
}

export default function RemindersPage() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newReminder, setNewReminder] = useState({
    title: '',
    type: 'medication' as const,
    description: '',
    time: '',
    frequency: 'daily' as const,
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Sample reminders for demo
  const sampleReminders: Reminder[] = [
    {
      id: '1',
      title: 'Take Blood Pressure Medication',
      type: 'medication',
      description: 'Amlodipine 5mg - Take with breakfast',
      time: '08:00',
      frequency: 'daily',
      active: true,
      nextReminder: 'Today at 8:00 AM'
    },
    {
      id: '2',
      title: 'Doctor Appointment',
      type: 'appointment',
      description: 'Cardiology consultation - Dr. Smith',
      time: '14:30',
      frequency: 'monthly',
      active: true,
      nextReminder: 'March 15 at 2:30 PM'
    },
    {
      id: '3',
      title: 'Morning Exercise',
      type: 'exercise',
      description: '30 minutes walking in the park',
      time: '06:30',
      frequency: 'daily',
      active: true,
      nextReminder: 'Tomorrow at 6:30 AM'
    }
  ];

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
        type: 'medication',
        description: '',
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
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const response = await apiRequest('PATCH', `/api/reminders/${id}`, { active });
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
    if (!newReminder.title.trim() || !newReminder.time) {
      toast({
        title: "Missing Information",
        description: "Please fill in the title and time fields.",
        variant: "destructive",
      });
      return;
    }

    addReminder.mutate({
      ...newReminder,
      id: Date.now().toString(),
      active: true,
      nextReminder: calculateNextReminder(newReminder.time, newReminder.frequency),
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-calendar-check text-2xl text-white"></i>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Health Reminders</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Set and manage reminders for medications, appointments, exercises, and health checkups
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add Reminder Form */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <i className="fas fa-plus text-green-600"></i>
                  <span>Add New Reminder</span>
                </CardTitle>
                <CardDescription>
                  Create a new health reminder
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title *
                    </label>
                    <Input
                      placeholder="e.g., Take vitamins"
                      value={newReminder.title}
                      onChange={(e) => setNewReminder({ ...newReminder, title: e.target.value })}
                      data-testid="input-reminder-title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={newReminder.type}
                      onChange={(e) => setNewReminder({ ...newReminder, type: e.target.value as any })}
                      data-testid="select-reminder-type"
                    >
                      <option value="medication">Medication</option>
                      <option value="appointment">Appointment</option>
                      <option value="checkup">Health Checkup</option>
                      <option value="exercise">Exercise</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time *
                    </label>
                    <Input
                      type="time"
                      value={newReminder.time}
                      onChange={(e) => setNewReminder({ ...newReminder, time: e.target.value })}
                      data-testid="input-reminder-time"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Frequency
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={newReminder.frequency}
                      onChange={(e) => setNewReminder({ ...newReminder, frequency: e.target.value as any })}
                      data-testid="select-reminder-frequency"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description (optional)
                    </label>
                    <Textarea
                      placeholder="Additional notes..."
                      value={newReminder.description}
                      onChange={(e) => setNewReminder({ ...newReminder, description: e.target.value })}
                      rows={3}
                      data-testid="textarea-reminder-description"
                    />
                  </div>

                  <Button
                    onClick={handleAddReminder}
                    disabled={addReminder.isPending}
                    className="w-full bg-green-600 hover:bg-green-700"
                    data-testid="button-add-reminder"
                  >
                    {addReminder.isPending ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Adding...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <i className="fas fa-plus"></i>
                        <span>Add Reminder</span>
                      </div>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <i className="fas fa-chart-pie text-blue-600"></i>
                  <span>Quick Stats</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Active Reminders</span>
                    <Badge className="bg-green-100 text-green-800">
                      {sampleReminders.filter(r => r.active).length}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Due Today</span>
                    <Badge className="bg-orange-100 text-orange-800">2</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">This Week</span>
                    <Badge className="bg-blue-100 text-blue-800">7</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Reminders List */}
          <div className="lg:col-span-2">
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
                {sampleReminders.length > 0 ? (
                  <div className="space-y-4">
                    {sampleReminders.map((reminder) => (
                      <div
                        key={reminder.id}
                        className={`border rounded-lg p-4 transition-all ${
                          reminder.active ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-gray-50 opacity-60'
                        }`}
                        data-testid={`reminder-${reminder.id}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <i className={`${getTypeIcon(reminder.type)} text-lg`}></i>
                              <h3 className="font-semibold text-gray-900">{reminder.title}</h3>
                              <Badge className={getTypeColor(reminder.type)}>
                                {reminder.type}
                              </Badge>
                              {reminder.active && (
                                <Badge className="bg-green-100 text-green-800">Active</Badge>
                              )}
                            </div>
                            
                            {reminder.description && (
                              <p className="text-gray-600 text-sm mb-2">{reminder.description}</p>
                            )}
                            
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>
                                <i className="fas fa-clock mr-1"></i>
                                {reminder.time}
                              </span>
                              <span>
                                <i className="fas fa-repeat mr-1"></i>
                                {reminder.frequency}
                              </span>
                              <span>
                                <i className="fas fa-bell mr-1"></i>
                                {reminder.nextReminder}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2 ml-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleReminder.mutate({ id: reminder.id, active: !reminder.active })}
                              data-testid={`button-toggle-${reminder.id}`}
                            >
                              <i className={`fas ${reminder.active ? 'fa-pause' : 'fa-play'} mr-1`}></i>
                              {reminder.active ? 'Pause' : 'Resume'}
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
                      <p className="text-sm text-gray-600">Allow snoozing reminders for 5 minutes</p>
                    </div>
                    <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors">
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1"></span>
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}