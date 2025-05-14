import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Card } from '@/components/ui/card.jsx';
import { Label } from '@/components/ui/label.jsx';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group.jsx';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs.jsx';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select.jsx';

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  department: z.enum(["CSE", "ISE", "AIML"], {
    required_error: "Department is required",
  }),
});

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(1, "Name is required"),
  role: z.enum(["Student", "Faculty", "HOD"], {
    required_error: "Role is required",
  }),
  department: z.enum(["CSE", "ISE", "AIML"], {
    required_error: "Department is required",
  }),
});

const AuthPage = () => {
  const [selectedRole, setSelectedRole] = useState(null);
  const [, navigate] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();
  const [activeTab, setActiveTab] = useState('login');
  
  // Login form setup
  const loginForm = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: 'csestudent', // Pre-fill with test account
      password: 'password',   // Pre-fill with password
      department: 'CSE',      // Default to CSE department
    }
  });
  
  // Register form setup
  const registerForm = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      password: '',
      name: '',
      role: undefined,
      department: undefined,
    }
  });
  
  // Handle login role selection
  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    loginForm.setValue('role', role);
    loginForm.clearErrors('role');
    
    // Scroll to login form
    document.getElementById('login-section').scrollIntoView({ behavior: 'smooth' });
  };
  
  // Handle login form submission
  const handleLogin = (data) => {
    console.log('Login form submission:', data);
    
    // Simplified direct login - just pass the credentials directly
    loginMutation.mutate({
      username: data.username,
      password: data.password,
      department: data.department || 'CSE'
    }, {
      onSuccess: () => {
        console.log('Login successful from component handler');
      },
      onError: (error) => {
        console.error('Login error handled in component:', error);
        
        // Display specific field errors if needed
        if (error.message.includes('username')) {
          loginForm.setError('username', { 
            type: 'manual', 
            message: 'Invalid username'
          });
        }
        
        if (error.message.includes('password')) {
          loginForm.setError('password', { 
            type: 'manual', 
            message: 'Invalid password'
          });
        }
      }
    });
  };
  
  // Handle registration form submission
  const handleRegister = (data) => {
    registerMutation.mutate(data);
  };
  
  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header Section */}
      <header className="bg-primary text-white">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="material-icons text-accent">school</span>
            <h1 className="text-2xl font-semibold font-montserrat">SpaceHub</h1>
          </div>
          <nav>
            <ul className="flex space-x-6">
              <li><a href="#about" className="hover:text-accent transition-colors duration-200">About</a></li>
              <li><a href="#resources" className="hover:text-accent transition-colors duration-200">Resources</a></li>
              <li><a href="#contact" className="hover:text-accent transition-colors duration-200">Contact</a></li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative">
        <div className="h-[500px] bg-cover bg-center" style={{backgroundImage: "url('https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1920&h=1000')"}}>
          <div className="absolute inset-0 bg-primary bg-opacity-75"></div>
          <div className="container mx-auto px-4 h-full flex items-center relative">
            <div className="text-white max-w-xl">
              <h2 className="text-4xl md:text-5xl font-bold font-montserrat mb-4">Campus Resource Booking Made Simple</h2>
              <p className="text-lg mb-8">Streamline your academic space reservations with our easy-to-use booking platform for labs and seminar halls.</p>
              <Button 
                className="bg-accent hover:bg-opacity-90 text-white py-3 px-6 rounded-lg font-medium font-montserrat transition-all duration-200 shadow-lg transform hover:-translate-y-1"
                onClick={() => document.getElementById('login-section').scrollIntoView({ behavior: 'smooth' })}
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Login Section */}
      <section id="login-section" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold font-montserrat text-center text-primary mb-12">Login to Your Account</h2>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Student Login Card */}
            <div 
              className="bg-white rounded-xl shadow-lg overflow-hidden transition-transform duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
              onClick={() => handleRoleSelect('Student')}
            >
              <div className="h-48 bg-cover bg-center" style={{backgroundImage: "url('https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=400')"}}>
                <div className="h-full w-full bg-primary bg-opacity-40 flex items-center justify-center">
                  <span className="material-icons text-white text-6xl">person</span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold font-montserrat text-primary mb-2">Student Login</h3>
                <p className="text-gray-600 mb-4">Access the booking system to request labs and seminar halls for your academic needs.</p>
                <Button className="w-full bg-secondary hover:bg-opacity-90 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200">
                  Login as Student
                </Button>
              </div>
            </div>
            
            {/* Faculty Login Card */}
            <div 
              className="bg-white rounded-xl shadow-lg overflow-hidden transition-transform duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
              onClick={() => handleRoleSelect('Faculty')}
            >
              <div className="h-48 bg-cover bg-center" style={{backgroundImage: "url('https://images.unsplash.com/photo-1544531585-9847b68c8c86?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=400')"}}>
                <div className="h-full w-full bg-primary bg-opacity-40 flex items-center justify-center">
                  <span className="material-icons text-white text-6xl">school</span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold font-montserrat text-primary mb-2">Faculty Login</h3>
                <p className="text-gray-600 mb-4">Reserve resources for classes, labs, workshops and departmental events.</p>
                <Button className="w-full bg-secondary hover:bg-opacity-90 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200">
                  Login as Faculty
                </Button>
              </div>
            </div>
          </div>
          
          {/* Auth Forms */}
          <Card className="mt-12 max-w-md mx-auto p-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <h3 className="text-2xl font-semibold font-montserrat text-primary mb-6">
                  {selectedRole ? `Login as ${selectedRole}` : 'Login to your account'}
                </h3>
                
                <form onSubmit={loginForm.handleSubmit(handleLogin)}>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="department-select">Department</Label>
                      <select 
                        id="department-select"
                        className="w-full p-2 border border-gray-300 rounded"
                        {...loginForm.register('department')}
                        defaultValue="CSE"
                      >
                        <option value="CSE">Computer Science (CSE)</option>
                        <option value="ISE">Information Science (ISE)</option>
                        <option value="AIML">AI & Machine Learning (AIML)</option>
                      </select>
                      {loginForm.formState.errors.department && (
                        <p className="text-red-500 text-sm mt-1">{loginForm.formState.errors.department.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input 
                        id="username"
                        placeholder="Enter your username" 
                        {...loginForm.register('username')}
                      />
                      {loginForm.formState.errors.username && (
                        <p className="text-red-500 text-sm mt-1">{loginForm.formState.errors.username.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input 
                        id="password"
                        type="password" 
                        placeholder="Enter your password" 
                        {...loginForm.register('password')}
                      />
                      {loginForm.formState.errors.password && (
                        <p className="text-red-500 text-sm mt-1">{loginForm.formState.errors.password.message}</p>
                      )}
                    </div>
                    
                    {loginMutation.isError && (
                      <div className="p-3 bg-red-100 text-red-800 rounded-md">
                        {loginMutation.error.message || 'Login failed. Please check your credentials.'}
                      </div>
                    )}
                    
                    <div className="bg-blue-100 text-blue-800 p-3 rounded-md mb-4">
                      <p className="text-sm font-medium">Test Accounts:</p>
                      <ul className="text-xs space-y-1 mt-1">
                        <li>Student: csestudent / password</li>
                        <li>Faculty: csefaculty / password</li>
                        <li>HOD: csehod / password</li>
                      </ul>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-accent hover:bg-opacity-90"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? 'Signing in...' : 'Sign In'}
                    </Button>
                    
                    {/* Direct testing button */}
                    <div className="mt-4">
                      <Button 
                        type="button"
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => {
                          const testCredentials = {
                            username: 'csestudent',
                            password: 'password',
                            department: 'CSE'
                          };
                          console.log('🔑 Direct login test with:', testCredentials);
                          
                          // Direct fetch for testing
                          fetch('/api/login', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            credentials: 'include',
                            body: JSON.stringify(testCredentials)
                          })
                          .then(res => {
                            console.log('Login response status:', res.status);
                            if (!res.ok) throw new Error(`Login failed: ${res.status}`);
                            return res.json();
                          })
                          .then(data => {
                            console.log('Login success data:', data);
                            // Force refetch user data
                            setTimeout(() => {
                              window.location.href = '/';
                            }, 1000);
                          })
                          .catch(err => {
                            console.error('Direct login error:', err);
                          });
                        }}
                      >
                        Test Direct Login
                      </Button>
                    </div>
                  </div>
                </form>
              </TabsContent>
              
              <TabsContent value="register">
                <h3 className="text-2xl font-semibold font-montserrat text-primary mb-6">
                  Create New Account
                </h3>
                
                <form onSubmit={registerForm.handleSubmit(handleRegister)}>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-name">Full Name</Label>
                      <Input 
                        id="register-name"
                        placeholder="Enter your full name" 
                        {...registerForm.register('name')}
                      />
                      {registerForm.formState.errors.name && (
                        <p className="text-red-500 text-sm mt-1">{registerForm.formState.errors.name.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="register-username">Username</Label>
                      <Input 
                        id="register-username"
                        placeholder="Choose a username" 
                        {...registerForm.register('username')}
                      />
                      {registerForm.formState.errors.username && (
                        <p className="text-red-500 text-sm mt-1">{registerForm.formState.errors.username.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="register-password">Password</Label>
                      <Input 
                        id="register-password"
                        type="password" 
                        placeholder="Choose a password" 
                        {...registerForm.register('password')}
                      />
                      {registerForm.formState.errors.password && (
                        <p className="text-red-500 text-sm mt-1">{registerForm.formState.errors.password.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Role</Label>
                      <RadioGroup 
                        onValueChange={(value) => registerForm.setValue('role', value)}
                        defaultValue={registerForm.watch('role')}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Student" id="student" />
                          <Label htmlFor="student">Student</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Faculty" id="faculty" />
                          <Label htmlFor="faculty">Faculty</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="HOD" id="hod" />
                          <Label htmlFor="hod">HOD (Head of Department)</Label>
                        </div>
                      </RadioGroup>
                      {registerForm.formState.errors.role && (
                        <p className="text-red-500 text-sm mt-1">{registerForm.formState.errors.role.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="register-department">Department</Label>
                      <Select 
                        onValueChange={(value) => registerForm.setValue('department', value)} 
                        defaultValue={registerForm.watch('department')}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Department" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CSE">Computer Science (CSE)</SelectItem>
                          <SelectItem value="ISE">Information Science (ISE)</SelectItem>
                          <SelectItem value="AIML">AI & Machine Learning (AIML)</SelectItem>
                        </SelectContent>
                      </Select>
                      {registerForm.formState.errors.department && (
                        <p className="text-red-500 text-sm mt-1">{registerForm.formState.errors.department.message}</p>
                      )}
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-accent hover:bg-opacity-90"
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? 'Creating Account...' : 'Create Account'}
                    </Button>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold font-montserrat text-center text-primary mb-12">Our Resources</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Computer Labs Card */}
            <div className="bg-white rounded-xl shadow-md p-6 text-center">
              <img src="https://images.unsplash.com/photo-1581091226033-d5c48150dbaa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=400" alt="Modern computer lab with workstations" className="rounded-lg mx-auto mb-6 h-48 w-full object-cover" />
              <h3 className="text-xl font-semibold font-montserrat text-primary mb-2">Computer Labs</h3>
              <p className="text-gray-600">Access state-of-the-art computer labs equipped with the latest software and hardware for your academic projects.</p>
            </div>
            
            {/* Seminar Halls Card */}
            <div className="bg-white rounded-xl shadow-md p-6 text-center">
              <img src="https://images.unsplash.com/photo-1505373877841-8d25f7d46678?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=400" alt="Modern seminar hall with presentation setup" className="rounded-lg mx-auto mb-6 h-48 w-full object-cover" />
              <h3 className="text-xl font-semibold font-montserrat text-primary mb-2">Seminar Halls</h3>
              <p className="text-gray-600">Book premium seminar halls perfect for presentations, workshops, guest lectures and department events.</p>
            </div>
            
            {/* Specialized Labs Card */}
            <div className="bg-white rounded-xl shadow-md p-6 text-center">
              <img src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=400" alt="Specialized research lab with equipment" className="rounded-lg mx-auto mb-6 h-48 w-full object-cover" />
              <h3 className="text-xl font-semibold font-montserrat text-primary mb-2">Specialized Labs</h3>
              <p className="text-gray-600">Utilize specialized facilities for research and experiments in AI, networking, and information science.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-primary text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-6">
                <span className="material-icons text-accent">school</span>
                <h3 className="text-xl font-semibold font-montserrat">SpaceHub</h3>
              </div>
              <p className="text-gray-300">Your one-stop solution for campus resource booking and management.</p>
            </div>
            
            <div>
              <h4 className="text-lg font-medium font-montserrat mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-300 hover:text-accent transition-colors">Home</a></li>
                <li><a href="#about" className="text-gray-300 hover:text-accent transition-colors">About</a></li>
                <li><a href="#resources" className="text-gray-300 hover:text-accent transition-colors">Resources</a></li>
                <li><a href="#contact" className="text-gray-300 hover:text-accent transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-medium font-montserrat mb-4">Contact Us</h4>
              <address className="not-italic text-gray-300">
                <p className="mb-2">University Campus, Tech Avenue</p>
                <p className="mb-2">Bangalore, Karnataka 560001</p>
                <p className="mb-2">Email: support@spacehub.edu</p>
                <p>Phone: +91 8012345678</p>
              </address>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-12 pt-6 text-center text-gray-400">
            <p>&copy; 2023 SpaceHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AuthPage;
