import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Truck, 
  BarChart3, 
  Network, 
  MapPin, 
  Zap, 
  Globe, 
  Users, 
  Target,
  ArrowRight
} from 'lucide-react';

const FeatureCard = ({ icon: Icon, title, description, link, linkText }) => (
  <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
    <div className="flex items-center mb-4">
      <div className="p-3 bg-blue-100 rounded-lg">
        <Icon className="w-6 h-6 text-blue-600" />
      </div>
      <h3 className="ml-4 text-xl font-semibold text-gray-900">{title}</h3>
    </div>
    <p className="text-gray-600 mb-4">{description}</p>
    <Link
      to={link}
      className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
    >
      {linkText}
      <ArrowRight className="w-4 h-4 ml-2" />
    </Link>
  </div>
);

const StatCard = ({ number, label, icon: Icon }) => (
  <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
    <div className="flex items-center justify-between">
      <div>
        <div className="text-3xl font-bold">{number}</div>
        <div className="text-blue-100">{label}</div>
      </div>
      <Icon className="w-8 h-8 text-blue-200" />
    </div>
  </div>
);

const WelcomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 sm:pb-16 md:pb-20 lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="text-center">
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block">Real-time Delivery</span>
                  <span className="block text-blue-600">Optimization System</span>
                </h1>
                <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                  Revolutionizing last-mile delivery through AI-powered route optimization, 
                  multi-agent collaboration, and real-time analytics for Walmart's supply chain.
                </p>
                <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
                  <div className="rounded-md shadow">
                    <Link
                      to="/dashboard"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
                    >
                      View Dashboard
                    </Link>
                  </div>
                  <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                    <Link
                      to="/agents"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
                    >
                      Explore AI Agents
                    </Link>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard number="30%" label="Faster Deliveries" icon={Zap} />
            <StatCard number="25%" label="Cost Reduction" icon={Target} />
            <StatCard number="6" label="AI Agents" icon={Users} />
            <StatCard number="Real-time" label="Optimization" icon={Globe} />
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Comprehensive Delivery Solutions
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
              Our integrated platform combines cutting-edge technologies to optimize every aspect of delivery operations.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
            <FeatureCard
              icon={BarChart3}
              title="Real-time Dashboard"
              description="Monitor delivery operations with live tracking, performance metrics, and interactive visualizations. Get insights into driver utilization, route efficiency, and customer satisfaction."
              link="/dashboard"
              linkText="View Dashboard"
            />
            
            <FeatureCard
              icon={Network}
              title="Multi-Agent Framework"
              description="AI-powered agent collaboration system featuring specialized agents for planning, customer experience, route optimization, driver support, ESG compliance, and incident handling."
              link="/agents"
              linkText="Explore Agents"
            />
            
            <FeatureCard
              icon={MapPin}
              title="Advanced Route Planning"
              description="Dynamic multi-hop delivery optimization using Dijkstra's algorithm, A* search, and genetic algorithms. Handles traffic conditions, vehicle constraints, and time windows."
              link="/routing"
              linkText="Plan Routes"
            />
          </div>
        </div>
      </div>

      {/* Technology Stack */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Powered by Modern Technology
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
              Built with enterprise-grade technologies for scalability and reliability.
            </p>
          </div>

          <div className="mt-12">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-6 lg:grid-cols-6">
              {[
                'React.js', 'Apache Spark', 'Apache Kafka', 
                'Python', 'Node.js', 'Machine Learning'
              ].map((tech) => (
                <div key={tech} className="col-span-1 flex justify-center md:col-span-1">
                  <div className="bg-gray-100 rounded-lg px-4 py-2 text-center">
                    <span className="text-sm font-medium text-gray-700">{tech}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Key Features */}
      <div className="py-16 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              Key Capabilities
            </h2>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: 'Real-time Clustering',
                description: 'Smart order grouping using geospatial and temporal clustering algorithms'
              },
              {
                title: 'Dynamic Route Optimization',
                description: 'AI-powered route planning that adapts to traffic and delivery constraints'
              },
              {
                title: 'Driver Assignment',
                description: 'Intelligent matching of drivers to routes based on capacity and location'
              },
              {
                title: 'Live Vehicle Tracking',
                description: 'Real-time GPS tracking with predictive ETA calculations'
              },
              {
                title: 'Multi-Agent Coordination',
                description: 'Specialized AI agents working together for optimal delivery orchestration'
              },
              {
                title: 'Performance Analytics',
                description: 'Comprehensive metrics and KPIs for continuous improvement'
              }
            ].map((feature, index) => (
              <div key={index} className="text-center">
                <div className="bg-blue-500 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-blue-100 text-sm">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;