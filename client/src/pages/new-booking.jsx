import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth.jsx';
import { useToast } from '@/hooks/use-toast.jsx';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Button } from '@/components/ui/button.jsx';
import { Card } from '@/components/ui/card.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import { Skeleton } from '@/components/ui/skeleton.jsx';
import ResourceCard from '@/components/ResourceCard';
import { apiRequest, queryClient } from '@/lib/queryClient.js';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Validation schema for booking form
const bookingFormSchema = z.object({
  resourceId: z.number().positive({ message: "Please select a resource" }),
  date: z.string().min(1, { message: "Date is required" }),
  startTime: z.string().min(1, { message: "Start time is required" }),
  endTime: z.string().min(1, { message: "End time is required" }),
  purpose: z.string().min(5, { message: "Purpose must be at least 5 characters" }),
  attendees: z.number().positive({ message: "Number of attendees is required" })
}).refine((data) => {
  // Ensure start time is before end time
  return data.startTime < data.endTime;
}, {
  message: "Start time must be before end time",
  path: ["endTime"]
});

const NewBooking = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [selectedDepartment, setSelectedDepartment] = useState(user?.department || 'CSE');
  const [selectedResource, setSelectedResource] = useState(null);
  
  // Form setup
  const { register, handleSubmit, setValue, watch, formState: { errors }, reset } = useForm({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      resourceId: 0,
      date: "",
      startTime: "",
      endTime: "",
      purpose: "",
      attendees: 0
    }
  });
  
  // Fetch resources by department
  const { data: resources, isLoading: isLoadingResources } = useQuery({
    queryKey: ['/api/resources', selectedDepartment],
    queryFn: () => fetch(`/api/resources/${selectedDepartment}`).then(res => res.json()),
  });
  
  // Create booking mutation
  const createBookingMutation = useMutation({
    mutationFn: async (bookingData) => {
      const res = await apiRequest("POST", "/api/bookings", bookingData);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Booking created",
        description: "Your booking request has been submitted successfully!",
      });
      queryClient.invalidateQueries(['/api/bookings']);
      navigate('/my-bookings');
    },
    onError: (error) => {
      toast({
        title: "Failed to create booking",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Handle department selection
  const handleDepartmentSelect = (dept) => {
    setSelectedDepartment(dept);
    setSelectedResource(null);
    setValue('resourceId', 0);
  };
  
  // Handle resource selection
  const handleResourceSelect = (resource) => {
    setSelectedResource(resource);
    setValue('resourceId', resource.id);
  };
  
  // Handle form submission
  const onSubmit = (data) => {
    createBookingMutation.mutate(data);
  };
  
  // Check availability endpoint
  const checkAvailability = async () => {
    const resourceId = watch('resourceId');
    const date = watch('date');
    const startTime = watch('startTime');
    const endTime = watch('endTime');
    
    if (!resourceId || !date || !startTime || !endTime) {
      return;
    }
    
    try {
      const response = await fetch(`/api/check-availability?resourceId=${resourceId}&date=${date}&startTime=${startTime}&endTime=${endTime}`);
      const data = await response.json();
      
      if (!data.available) {
        toast({
          title: "Time slot unavailable",
          description: "The selected time slot is already booked. Please choose a different time.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Time slot available",
          description: "The selected time slot is available!",
        });
      }
    } catch (error) {
      toast({
        title: "Error checking availability",
        description: "Failed to check slot availability.",
        variant: "destructive",
      });
    }
  };
  
  // Get today's date in YYYY-MM-DD format for min date in date input
  const today = new Date().toISOString().split('T')[0];
  
  return (
    <AuthenticatedLayout pageTitle="New Booking Request">
      <Card className="p-6">
        <div className="mb-6">
          <h3 className="text-lg font-medium font-montserrat text-primary mb-4">Select Department & Resource</h3>
          
          <div className="mb-6 border-b border-gray-200">
            <ul className="flex flex-wrap -mb-px text-sm font-medium text-center">
              <li className="mr-2">
                <button 
                  className={`inline-block p-4 rounded-t-lg border-b-2 ${
                    selectedDepartment === 'CSE' 
                      ? 'border-secondary text-secondary' 
                      : 'border-transparent hover:text-gray-600 hover:border-gray-300'
                  }`} 
                  onClick={() => handleDepartmentSelect('CSE')}
                >
                  CSE
                </button>
              </li>
              <li className="mr-2">
                <button 
                  className={`inline-block p-4 rounded-t-lg border-b-2 ${
                    selectedDepartment === 'ISE' 
                      ? 'border-secondary text-secondary' 
                      : 'border-transparent hover:text-gray-600 hover:border-gray-300'
                  }`}
                  onClick={() => handleDepartmentSelect('ISE')}
                >
                  ISE
                </button>
              </li>
              <li className="mr-2">
                <button 
                  className={`inline-block p-4 rounded-t-lg border-b-2 ${
                    selectedDepartment === 'AIML' 
                      ? 'border-secondary text-secondary' 
                      : 'border-transparent hover:text-gray-600 hover:border-gray-300'
                  }`}
                  onClick={() => handleDepartmentSelect('AIML')}
                >
                  AIML
                </button>
              </li>
            </ul>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {isLoadingResources ? (
              <>
                <Skeleton className="h-32 w-full rounded-lg" />
                <Skeleton className="h-32 w-full rounded-lg" />
              </>
            ) : resources && resources.length > 0 ? (
              resources.map((resource) => (
                <ResourceCard 
                  key={resource.id}
                  resource={resource}
                  isSelected={selectedResource?.id === resource.id}
                  onClick={() => handleResourceSelect(resource)}
                />
              ))
            ) : (
              <div className="col-span-2 text-center py-8 text-gray-500">
                No resources found for this department.
              </div>
            )}
          </div>
        </div>
        
        <form className="mt-8" onSubmit={handleSubmit(onSubmit)}>
          <h3 className="text-lg font-medium font-montserrat text-primary mb-4">Booking Details</h3>
          
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <Label htmlFor="booking-date" className="block text-gray-700 mb-2">Date</Label>
              <Input 
                id="booking-date" 
                type="date"
                min={today}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                {...register('date')}
              />
              {errors.date && (
                <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start-time" className="block text-gray-700 mb-2">Start Time</Label>
                <Input 
                  id="start-time" 
                  type="time"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                  {...register('startTime')}
                  onChange={(e) => {
                    register('startTime').onChange(e);
                    // If end time is empty or invalid, set it to start time + 1 hour
                    const startTime = e.target.value;
                    if (startTime && (!watch('endTime') || watch('startTime') >= watch('endTime'))) {
                      const [hours, minutes] = startTime.split(':').map(Number);
                      const endHours = (hours + 1) % 24;
                      setValue('endTime', `${String(endHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`);
                    }
                  }}
                />
                {errors.startTime && (
                  <p className="text-red-500 text-sm mt-1">{errors.startTime.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="end-time" className="block text-gray-700 mb-2">End Time</Label>
                <Input 
                  id="end-time" 
                  type="time"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                  {...register('endTime')}
                />
                {errors.endTime && (
                  <p className="text-red-500 text-sm mt-1">{errors.endTime.message}</p>
                )}
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <Label htmlFor="purpose" className="block text-gray-700 mb-2">Purpose</Label>
            <Textarea 
              id="purpose" 
              rows="3" 
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary" 
              placeholder="Describe the purpose of booking"
              {...register('purpose')}
            ></Textarea>
            {errors.purpose && (
              <p className="text-red-500 text-sm mt-1">{errors.purpose.message}</p>
            )}
          </div>
          
          <div className="mb-6">
            <Label htmlFor="attendees" className="block text-gray-700 mb-2">Number of Attendees</Label>
            <Input 
              id="attendees" 
              type="number" 
              min="1" 
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary" 
              placeholder="Enter expected number of attendees"
              {...register('attendees', { valueAsNumber: true })}
            />
            {errors.attendees && (
              <p className="text-red-500 text-sm mt-1">{errors.attendees.message}</p>
            )}
          </div>
          
          <div className="flex justify-between space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={checkAvailability}
              disabled={!watch('resourceId') || !watch('date') || !watch('startTime') || !watch('endTime')}
            >
              Check Availability
            </Button>
            
            <div className="flex space-x-4">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => {
                  reset();
                  setSelectedResource(null);
                }}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-accent hover:bg-opacity-90 text-white"
                disabled={createBookingMutation.isPending}
              >
                {createBookingMutation.isPending ? 'Submitting...' : 'Submit Request'}
              </Button>
            </div>
          </div>
        </form>
      </Card>
    </AuthenticatedLayout>
  );
};

export default NewBooking;
