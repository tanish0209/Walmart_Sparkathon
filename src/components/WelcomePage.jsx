import React from "react";
import { Link } from "react-router-dom";
import {
  Truck,
  BarChart3,
  Network,
  MapPin,
  Zap,
  Globe,
  Users,
  Target,
  ArrowRight,
} from "lucide-react";

const walmartBlue = "bg-[#0071CE]";
const walmartYellow = "text-[#FFC220]";
const walmartGradient = "bg-gradient-to-br from-[#0071CE] to-[#004B87]";

const FeatureCard = ({ icon: Icon, title, description, link, linkText }) => (
  <div className="bg-blue-100 rounded-2xl shadow-lg p-6 hover:shadow-2xl transition duration-300 border border-gray-100">
    <div className="flex items-center mb-4">
      <div className="p-3 bg-yellow-100 rounded-xl">
        <Icon className="w-6 h-6 text-[#FFC220]" />
      </div>
      <h3 className="ml-4 text-lg font-semibold text-blue-900">{title}</h3>
    </div>
    <p className="text-gray-600 mb-4 text-sm leading-relaxed">{description}</p>
    <Link
      to={link}
      className="inline-flex items-center text-[#0071CE] hover:text-[#004B87] font-medium text-sm"
    >
      {linkText}
      <ArrowRight className="w-4 h-4 ml-2" />
    </Link>
  </div>
);

const StatCard = ({ number, label, icon: Icon }) => (
  <div className="rounded-2xl p-6 hover:scale-105 duration-300 text-[#FFC220] shadow-md bg-gradient-to-r from-[#0071CE] to-[#004B87]">
    <div className="flex items-center justify-between">
      <div>
        <div className="text-3xl font-bold">{number}</div>
        <div className="text-blue-100 text-sm">{label}</div>
      </div>
      <Icon className="w-8 h-8 text-blue-200" />
    </div>
  </div>
);

const WelcomePage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div
        className={`relative overflow-hidden rounded-2xl ${walmartGradient} py-24`}
      >
        <div className="max-w-7xl mx-auto text-center px-4">
          <h1 className="text-5xl font-extrabold text-white leading-tight">
            Real-time Delivery{" "}
            <span className={walmartYellow}>Optimization System</span>
          </h1>
          <p className="mt-4 text-lg text-blue-100 max-w-2xl mx-auto">
            Revolutionizing last-mile delivery through AI-powered optimization,
            real-time analytics, and intelligent agent collaboration for
            enterprise-scale logistics.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/dashboard"
              className="px-8 py-3 bg-white text-[#0071CE] font-semibold rounded-md shadow hover:bg-blue-100"
            >
              View Dashboard
            </Link>
            <Link
              to="/agents"
              className="px-8 py-3 border border-white text-white font-semibold rounded-md hover:bg-white hover:text-[#0071CE]"
            >
              Explore AI Agents
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <StatCard number="30%" label="Faster Deliveries" icon={Zap} />
            <StatCard number="25%" label="Cost Reduction" icon={Target} />
            <StatCard number="6" label="AI Agents" icon={Users} />
            <StatCard number="Real-time" label="Optimization" icon={Globe} />
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">
              Comprehensive Delivery Solutions
            </h2>
            <p className="mt-2 text-gray-600 max-w-xl mx-auto">
              Cutting-edge technologies that streamline, analyze, and optimize
              your delivery operations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={BarChart3}
              title="Real-time Dashboard"
              description="Live tracking, driver metrics, and analytics that empower data-driven decisions."
              link="/dashboard"
              linkText="View Dashboard"
            />
            <FeatureCard
              icon={Network}
              title="Multi-Agent Framework"
              description="Intelligent agents for planning, optimization, customer support, and more."
              link="/agents"
              linkText="Explore Agents"
            />
            <FeatureCard
              icon={MapPin}
              title="Advanced Route Planning"
              description="AI-powered delivery routing with traffic, time windows, and vehicle constraints."
              link="/routing"
              linkText="Plan Routes"
            />
          </div>
        </div>
      </div>

      {/* Technology Stack */}
      <div className="py-16 ">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Powered by Modern Technology
          </h2>
          <p className="text-gray-600 max-w-xl mx-auto">
            Enterprise-grade tools and frameworks ensure performance,
            scalability, and reliability.
          </p>

          <div className="mt-10 grid grid-cols-2 md:grid-cols-6 gap-4">
            {[
              "React.js",
              "Apache Spark",
              "Apache Kafka",
              "Python",
              "Node.js",
              "Machine Learning",
            ].map((tech) => (
              <div
                key={tech}
                className="bg-blue-500 rounded-md py-2 px-4 text-md font-bold text-yellow-200 shadow-sm"
              >
                {tech}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Key Features */}
      <div className={`py-16 ${walmartBlue} rounded-2xl`}>
        <div className="max-w-7xl mx-auto px-4 text-white text-center">
          <h2 className="text-3xl font-bold mb-10">Key Capabilities</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3  gap-8">
            {[
              {
                title: "Real-time Clustering",
                description: "Smart grouping using geo-temporal algorithms.",
              },
              {
                title: "Dynamic Route Optimization",
                description: "Adaptive planning with AI and traffic awareness.",
              },
              {
                title: "Driver Assignment",
                description: "Matches based on capacity and geographic fit.",
              },
              {
                title: "Live Vehicle Tracking",
                description: "Real-time GPS and predictive ETA analytics.",
              },
              {
                title: "Multi-Agent Coordination",
                description: "Collaborative AI agents handling operations.",
              },
              {
                title: "Performance Analytics",
                description: "Actionable KPIs to drive continuous growth.",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-yellow-100 rounded-xl p-6 shadow-md"
              >
                <h3 className="text-lg text-blue-900 font-semibold mb-2">
                  {feature.title}
                </h3>
                <p className="text-blue-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;
