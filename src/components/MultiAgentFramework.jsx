import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Play, Pause, RotateCcw, MessageCircle, Truck, MapPin, AlertTriangle, Leaf, User, Calendar } from 'lucide-react';

// Agent definitions
const agents = {
  PlannerAgent: {
    name: "Planner Agent",
    role: "Assigns deliveries and schedules",
    icon: Calendar,
    color: "bg-blue-500",
    responsibilities: ["Route planning", "Delivery scheduling", "Resource allocation"]
  },
  CXAgent: {
    name: "CX Agent", 
    role: "Talks to customer and handles feedback",
    icon: User,
    color: "bg-green-500",
    responsibilities: ["Customer communication", "Feedback handling", "Issue resolution"]
  },
  RouteOptimizer: {
    name: "Route Optimizer",
    role: "Replans based on conditions", 
    icon: MapPin,
    color: "bg-purple-500",
    responsibilities: ["Real-time optimization", "Traffic analysis", "Route adjustments"]
  },
  DriverSupport: {
    name: "Driver Support",
    role: "Answers driver queries",
    icon: Truck,
    color: "bg-orange-500", 
    responsibilities: ["Driver assistance", "Query resolution", "Support coordination"]
  },
  ESGAgent: {
    name: "ESG Agent",
    role: "Minimizes emissions",
    icon: Leaf,
    color: "bg-emerald-500",
    responsibilities: ["Emission tracking", "Eco-friendly routing", "Sustainability metrics"]
  },
  IncidentHandler: {
    name: "Incident Handler",
    role: "Responds to disruptions",
    icon: AlertTriangle,
    color: "bg-red-500",
    responsibilities: ["Emergency response", "Disruption management", "Crisis coordination"]
  }
};

// Workflow states and transitions
const workflowStates = [
  {
    id: 'initial',
    name: 'Initial Planning',
    agent: 'PlannerAgent',
    message: 'Creating delivery schedule for 50 packages across 5 zones',
    nextStates: ['esg_check', 'route_optimization']
  },
  {
    id: 'esg_check',
    name: 'ESG Analysis',
    agent: 'ESGAgent',
    message: 'Analyzing routes for carbon footprint. Recommending electric vehicles for Zone A.',
    nextStates: ['route_optimization']
  },
  {
    id: 'route_optimization',
    name: 'Route Optimization',
    agent: 'RouteOptimizer',
    message: 'Optimizing routes with traffic data. Estimated 15% time reduction achieved.',
    nextStates: ['customer_notification']
  },
  {
    id: 'customer_notification',
    name: 'Customer Notification',
    agent: 'CXAgent',
    message: 'Sending delivery notifications to customers. ETA: 2-4 PM window.',
    nextStates: ['driver_briefing']
  },
  {
    id: 'driver_briefing',
    name: 'Driver Briefing',
    agent: 'DriverSupport',
    message: 'Briefing drivers on optimized routes and special delivery instructions.',
    nextStates: ['incident_monitoring']
  },
  {
    id: 'incident_monitoring',
    name: 'Active Monitoring',
    agent: 'IncidentHandler',
    message: 'Monitoring deliveries. Alert: Traffic jam on Route 3 detected.',
    nextStates: ['route_reoptimization']
  },
  {
    id: 'route_reoptimization',
    name: 'Route Re-optimization',
    agent: 'RouteOptimizer',
    message: 'Rerouting affected deliveries. Alternative route calculated.',
    nextStates: ['customer_update']
  },
  {
    id: 'customer_update',
    name: 'Customer Update',
    agent: 'CXAgent',
    message: 'Updating customers about delay. New ETA: 2:30-4:30 PM.',
    nextStates: ['driver_update']
  },
  {
    id: 'driver_update',
    name: 'Driver Update',
    agent: 'DriverSupport',
    message: 'Sending new route to Driver #3. Navigation updated in real-time.',
    nextStates: ['completion']
  },
  {
    id: 'completion',
    name: 'Workflow Complete',
    agent: 'PlannerAgent',
    message: 'All deliveries completed successfully. Performance metrics logged.',
    nextStates: []
  }
];

// Message exchange patterns
const messageExchanges = [
  { from: 'PlannerAgent', to: 'ESGAgent', message: 'Please analyze route sustainability' },
  { from: 'ESGAgent', to: 'PlannerAgent', message: 'Route optimized for 20% less emissions' },
  { from: 'PlannerAgent', to: 'RouteOptimizer', message: 'Optimize these 5 delivery routes' },
  { from: 'RouteOptimizer', to: 'CXAgent', message: 'Routes ready, ETAs calculated' },
  { from: 'CXAgent', to: 'DriverSupport', message: 'Customer preferences noted' },
  { from: 'IncidentHandler', to: 'RouteOptimizer', message: 'Traffic incident on Route 3' },
  { from: 'RouteOptimizer', to: 'DriverSupport', message: 'Alternative route provided' },
  { from: 'DriverSupport', to: 'CXAgent', message: 'Driver needs customer contact info' }
];

const MultiAgentFramework = () => {
  const [currentStateIndex, setCurrentStateIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [completedStates, setCompletedStates] = useState([]);
  const [activeMessages, setActiveMessages] = useState([]);
  const [messageIndex, setMessageIndex] = useState(0);

  const currentState = workflowStates[currentStateIndex];

  useEffect(() => {
    let interval;
    if (isRunning && currentStateIndex < workflowStates.length - 1) {
      interval = setInterval(() => {
        setCompletedStates(prev => [...prev, currentStateIndex]);
        setCurrentStateIndex(prev => prev + 1);
        
        // Add message exchange
        if (messageIndex < messageExchanges.length) {
          setActiveMessages(prev => [...prev, messageExchanges[messageIndex]]);
          setMessageIndex(prev => prev + 1);
        }
      }, 3000);
    } else if (currentStateIndex >= workflowStates.length - 1) {
      setIsRunning(false);
    }
    return () => clearInterval(interval);
  }, [isRunning, currentStateIndex, messageIndex]);

  const startWorkflow = () => {
    setIsRunning(true);
  };

  const pauseWorkflow = () => {
    setIsRunning(false);
  };

  const resetWorkflow = () => {
    setIsRunning(false);
    setCurrentStateIndex(0);
    setCompletedStates([]);
    setActiveMessages([]);
    setMessageIndex(0);
  };

  const getAgentIcon = (agentKey) => {
    const IconComponent = agents[agentKey]?.icon || MessageCircle;
    return IconComponent;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Multi-Agent Collaboration Framework
          </h1>
          <p className="text-xl text-gray-600">
            LangGraph-based Delivery Management System
          </p>
        </div>

        {/* Control Panel */}
        <div className="flex justify-center gap-4 mb-8">
          <Button 
            onClick={startWorkflow} 
            disabled={isRunning}
            className="flex items-center gap-2"
          >
            <Play size={16} />
            Start Workflow
          </Button>
          <Button 
            onClick={pauseWorkflow}
            disabled={!isRunning}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Pause size={16} />
            Pause
          </Button>
          <Button 
            onClick={resetWorkflow}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RotateCcw size={16} />
            Reset
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Agent Overview */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Agent Network
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(agents).map(([key, agent]) => {
                    const IconComponent = agent.icon;
                    const isActive = currentState?.agent === key;
                    return (
                      <div 
                        key={key}
                        className={`p-3 rounded-lg border transition-all duration-300 ${
                          isActive 
                            ? 'border-blue-500 bg-blue-50 shadow-md' 
                            : 'border-gray-200 bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${agent.color} text-white`}>
                            <IconComponent size={16} />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-sm">{agent.name}</h3>
                            <p className="text-xs text-gray-600">{agent.role}</p>
                          </div>
                          {isActive && (
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Workflow Visualization */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Workflow Execution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {workflowStates.map((state, index) => {
                    const isCompleted = completedStates.includes(index);
                    const isCurrent = index === currentStateIndex;
                    const IconComponent = getAgentIcon(state.agent);
                    const agent = agents[state.agent];
                    
                    return (
                      <div key={state.id} className="flex items-start gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`p-3 rounded-full transition-all duration-300 ${
                            isCompleted 
                              ? 'bg-green-500 text-white' 
                              : isCurrent 
                                ? `${agent?.color} text-white animate-pulse`
                                : 'bg-gray-200 text-gray-500'
                          }`}>
                            <IconComponent size={20} />
                          </div>
                          {index < workflowStates.length - 1 && (
                            <div className={`w-0.5 h-12 mt-2 transition-all duration-300 ${
                              isCompleted ? 'bg-green-500' : 'bg-gray-300'
                            }`} />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className={`p-4 rounded-lg transition-all duration-300 ${
                            isCurrent 
                              ? 'bg-blue-50 border-l-4 border-blue-500' 
                              : isCompleted
                                ? 'bg-green-50 border-l-4 border-green-500'
                                : 'bg-gray-50'
                          }`}>
                            <h3 className="font-semibold text-sm mb-1">
                              {state.name}
                            </h3>
                            <p className="text-xs text-gray-600 mb-2">
                              Agent: {agents[state.agent]?.name}
                            </p>
                            <p className="text-sm text-gray-800">
                              {state.message}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Inter-Agent Communication */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Inter-Agent Communication Log</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {activeMessages.map((msg, index) => {
                  const fromAgent = agents[msg.from];
                  const toAgent = agents[msg.to];
                  return (
                    <div 
                      key={index}
                      className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg animate-fade-in"
                    >
                      <div className={`p-2 rounded-lg ${fromAgent?.color} text-white`}>
                        {React.createElement(fromAgent?.icon || MessageCircle, { size: 16 })}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm">
                          <span className="font-semibold">{fromAgent?.name}</span>
                          <span className="text-gray-500 mx-2">→</span>
                          <span className="font-semibold">{toAgent?.name}</span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">{msg.message}</p>
                      </div>
                      <div className={`p-2 rounded-lg ${toAgent?.color} text-white`}>
                        {React.createElement(toAgent?.icon || MessageCircle, { size: 16 })}
                      </div>
                    </div>
                  );
                })}
                {activeMessages.length === 0 && (
                  <p className="text-gray-500 text-center py-8">
                    No messages yet. Start the workflow to see agent communication.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Agent Responsibilities */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(agents).map(([key, agent]) => {
            const IconComponent = agent.icon;
            return (
              <Card key={key} className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <div className={`p-2 rounded-lg ${agent.color} text-white`}>
                      <IconComponent size={16} />
                    </div>
                    {agent.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">{agent.role}</p>
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-gray-800">Key Responsibilities:</h4>
                    <ul className="space-y-1">
                      {agent.responsibilities.map((resp, index) => (
                        <li key={index} className="text-xs text-gray-600 flex items-center gap-2">
                          <div className="w-1 h-1 bg-gray-400 rounded-full" />
                          {resp}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default MultiAgentFramework;