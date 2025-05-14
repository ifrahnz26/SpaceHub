import React, { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { useAuth } from '@/hooks/use-auth';

const AuthenticatedLayout = ({ children, pageTitle }) => {
  const { user, logoutMutation } = useAuth();
  const [location, navigate] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  const navigationItems = [
    { 
      name: 'Dashboard', 
      path: '/', 
      icon: 'dashboard',
      roles: ['Student', 'Faculty', 'HOD'] 
    },
    { 
      name: 'New Booking', 
      path: '/new-booking', 
      icon: 'add_circle',
      roles: ['Student', 'Faculty'] 
    },
    { 
      name: 'My Bookings', 
      path: '/my-bookings', 
      icon: 'list_alt',
      roles: ['Student', 'Faculty', 'HOD'] 
    },
    { 
      name: 'Pending Approvals', 
      path: '/pending-approvals', 
      icon: 'approval',
      roles: ['HOD'] 
    }
  ];
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar Navigation - Desktop */}
      <aside className="w-64 bg-primary text-white hidden md:block">
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center space-x-2">
            <span className="material-icons text-accent">school</span>
            <h1 className="text-xl font-semibold font-montserrat">SpaceHub</h1>
          </div>
        </div>
        
        <nav className="mt-8">
          <ul>
            {navigationItems
              .filter(item => item.roles.includes(user?.role))
              .map((item, index) => (
                <li className="mb-1" key={index}>
                  <Link 
                    href={item.path}
                    className={`flex items-center px-4 py-3 hover:bg-gray-800 transition-colors ${location === item.path ? 'bg-gray-800' : ''}`}
                  >
                    <span className="material-icons mr-3">{item.icon}</span>
                    <span>{item.name}</span>
                  </Link>
                </li>
              ))}
            
            <li className="mt-8">
              <button 
                onClick={handleLogout}
                className="flex items-center px-4 py-3 hover:bg-gray-800 transition-colors w-full text-left"
              >
                <span className="material-icons mr-3">logout</span>
                <span>Logout</span>
              </button>
            </li>
          </ul>
        </nav>
      </aside>
      
      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-gray-50">
        {/* Top Navigation */}
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between p-4">
            <button 
              className="md:hidden text-gray-600"
              onClick={toggleMobileMenu}
            >
              <span className="material-icons">menu</span>
            </button>
            
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">{user?.department} Department</span>
              <div className="flex items-center space-x-2">
                <span className="material-icons text-gray-600">account_circle</span>
                <span className="font-medium text-gray-800">{user?.name}</span>
                <span className="bg-secondary text-white text-xs py-1 px-2 rounded-full">
                  {user?.role}
                </span>
              </div>
            </div>
          </div>
        </header>
        
        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
            onClick={toggleMobileMenu}
          >
            <div 
              className="w-64 bg-primary text-white h-full overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-4 border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="material-icons text-accent">school</span>
                    <h1 className="text-xl font-semibold font-montserrat">SpaceHub</h1>
                  </div>
                  <button 
                    className="text-white"
                    onClick={toggleMobileMenu}
                  >
                    <span className="material-icons">close</span>
                  </button>
                </div>
              </div>
              
              <nav className="mt-8">
                <ul>
                  {navigationItems
                    .filter(item => item.roles.includes(user?.role))
                    .map((item, index) => (
                      <li className="mb-1" key={index}>
                        <Link 
                          href={item.path}
                          className={`flex items-center px-4 py-3 hover:bg-gray-800 transition-colors ${location === item.path ? 'bg-gray-800' : ''}`}
                          onClick={toggleMobileMenu}
                        >
                          <span className="material-icons mr-3">{item.icon}</span>
                          <span>{item.name}</span>
                        </Link>
                      </li>
                    ))}
                  
                  <li className="mt-8">
                    <button 
                      onClick={handleLogout}
                      className="flex items-center px-4 py-3 hover:bg-gray-800 transition-colors w-full text-left"
                    >
                      <span className="material-icons mr-3">logout</span>
                      <span>Logout</span>
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        )}
        
        {/* Page Content */}
        <div className="p-6">
          <h2 className="text-2xl font-semibold font-montserrat text-primary mb-6">{pageTitle}</h2>
          {children}
        </div>
      </main>
    </div>
  );
};

export default AuthenticatedLayout;
