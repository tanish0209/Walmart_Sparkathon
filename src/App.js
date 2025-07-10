import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Truck, BarChart3, Network, MapPin, Home } from 'lucide-react';

// Import components
import DeliveryDashboard from './components/DeliveryDashboard';
import MultiAgentFramework from './components/MultiAgentFramework';
import MultiHopDelivery from './components/MultiHopDelivery';
import WelcomePage from './components/WelcomePage';

// Navigation Component
const Navigation = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Welcome', component: 'welcome' },
    { path: '/dashboard', icon: BarChart3, label: 'Dashboard', component: 'dashboard' },
    { path: '/agents', icon: Network, label: 'Multi-Agent', component: 'agents' },
    { path: '/routing', icon: MapPin, label: 'Route Planning', component: 'routing' }
  ];

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center gap-2">
            <div className='p-2 flex items-center bg-yellow-100 rounded-2xl'>
              <Truck className="w-8 h-8 text-[#FFC220]" />
            </div>

            <h1 className="text-xl font-bold text-blue-900">
              Walmart Delivery Optimization
            </h1>
          </div>

          <div className="flex space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

// Main App Component
function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navigation />

        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<WelcomePage />} />
            <Route path="/dashboard" element={<DeliveryDashboard />} />
            <Route path="/agents" element={<MultiAgentFramework />} />
            <Route path="/routing" element={<MultiHopDelivery />} />
          </Routes>
        </main>

        <footer className="bg-white border-t mt-auto">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
            <div className="text-center text-sm text-gray-500">
              <p>© 2024 Walmart Sparkathon - Real-time Delivery Optimization System</p>
              <p className="mt-1">Powered by React, Flask, Spark, RabbitMQ, and Advanced Optimization Algorithms</p>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;