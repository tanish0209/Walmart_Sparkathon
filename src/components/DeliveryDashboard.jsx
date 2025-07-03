import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { MapPin, Truck, Package, Clock, Users, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { apiService } from '../services/api';

const DeliveryDashboard = () => {
    const [orders, setOrders] = useState([]);
    const [clusters, setClusters] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [stats, setStats] = useState({});
    const [selectedRoute, setSelectedRoute] = useState(null);
    const [tracking, setTracking] = useState({});
    const [activeTab, setActiveTab] = useState('overview');
    
    // Real-time data fetching
    useEffect(() => {
        // Initial data fetch
        const fetchDashboardData = async () => {
            try {
                const data = await apiService.getDashboardData();
                setOrders(data.orders || []);
                setClusters(data.clusters || []);
                setRoutes(data.routes || []);
                setDrivers(data.drivers || []);
                setStats(data.stats || {});
                setTracking(data.tracking || {});
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
                // Fallback to mock data on error
                generateMockData();
            }
        };

        // Subscribe to real-time updates
        const unsubscribe = apiService.subscribeToRealTimeUpdates((update) => {
            if (update.type === 'orders_processed') {
                setOrders(update.data.orders || []);
                setClusters(update.data.clusters || []);
            } else if (update.type === 'driver_update') {
                setDrivers(update.data.drivers || []);
                setStats(update.data.stats || {});
            }
        });

        fetchDashboardData();

        return unsubscribe;
    }, []);

    // Fallback mock data generation
    const generateMockData = () => {
        // Generate mock orders
        const mockOrders = Array.from({ length: 50 }, (_, i) => ({
            order_id: `ORD-${String(i + 1).padStart(3, '0')}`,
            latitude: 40.7589 + (Math.random() - 0.5) * 0.1,
            longitude: -73.9851 + (Math.random() - 0.5) * 0.1,
            delivery_time_slot: ['09:00-11:00', '11:00-13:00', '13:00-15:00', '15:00-17:00', '17:00-19:00', '19:00-21:00'][Math.floor(Math.random() * 6)],
            package_size: ['Small', 'Medium', 'Large'][Math.floor(Math.random() * 3)],
            priority: ['High', 'Medium', 'Low'][Math.floor(Math.random() * 3)],
            volume: Math.random() * 0.5 + 0.1,
            weight: Math.random() * 10 + 1,
            status: ['Pending', 'Assigned', 'In Transit', 'Delivered'][Math.floor(Math.random() * 4)]
        }));
        
        // Generate mock clusters
        const mockClusters = Array.from({ length: 8 }, (_, i) => ({
            cluster_id: `CLU-${String(i + 1).padStart(2, '0')}`,
            centroid_lat: 40.7589 + (Math.random() - 0.5) * 0.08,
            centroid_lon: -73.9851 + (Math.random() - 0.5) * 0.08,
            order_count: Math.floor(Math.random() * 8) + 3,
            time_window: ['09:00-11:00', '11:00-13:00', '13:00-15:00', '15:00-17:00', '17:00-19:00', '19:00-21:00'][Math.floor(Math.random() * 6)],
            total_volume: Math.random() * 5 + 2,
            total_weight: Math.random() * 50 + 20,
            estimated_duration: Math.floor(Math.random() * 60) + 30
        }));
        
        // Generate mock routes
        const mockRoutes = Array.from({ length: 6 }, (_, i) => ({
            route_id: `RTE-${String(i + 1).padStart(2, '0')}`,
            driver_id: `DRV-${String(i + 1).padStart(2, '0')}`,
            driver_name: ['Alice Johnson', 'Bob Smith', 'Carol Brown', 'David Wilson', 'Eva Davis', 'Frank Miller'][i],
            total_distance: Math.random() * 50 + 20,
            estimated_duration: Math.floor(Math.random() * 180) + 60,
            delivery_count: Math.floor(Math.random() * 12) + 5,
            status: ['Planning', 'Active', 'Completed'][Math.floor(Math.random() * 3)],
            progress: Math.random(),
            vehicle_type: ['Van', 'Truck', 'Motorcycle'][Math.floor(Math.random() * 3)]
        }));
        
        // Generate mock drivers
        const mockDrivers = Array.from({ length: 10 }, (_, i) => ({
            driver_id: `DRV-${String(i + 1).padStart(2, '0')}`,
            name: ['Alice Johnson', 'Bob Smith', 'Carol Brown', 'David Wilson', 'Eva Davis', 'Frank Miller', 'Grace Lee', 'Henry Chen', 'Iris Garcia', 'Jack Taylor'][i],
            status: ['Available', 'On Route', 'Break', 'Offline'][Math.floor(Math.random() * 4)],
            current_load_volume: Math.random() * 8,
            vehicle_capacity_volume: 10,
            current_load_weight: Math.random() * 800,
            vehicle_capacity_weight: 1000,
            deliveries_today: Math.floor(Math.random() * 15),
            rating: 4.0 + Math.random() * 1.0,
            vehicle_type: ['Van', 'Truck', 'Motorcycle'][Math.floor(Math.random() * 3)]
        }));
        
        // Generate mock stats
        const mockStats = {
            pending_orders: mockOrders.filter(o => o.status === 'Pending').length,
            active_clusters: mockClusters.length,
            active_routes: mockRoutes.filter(r => r.status === 'Active').length,
            available_drivers: mockDrivers.filter(d => d.status === 'Available').length,
            total_drivers: mockDrivers.length,
            completed_deliveries: Math.floor(Math.random() * 150) + 200,
            avg_delivery_time: Math.floor(Math.random() * 30) + 25,
            efficiency_score: Math.floor(Math.random() * 20) + 80
        };
        
        // Generate mock tracking
        const mockTracking = {};
        mockRoutes.forEach(route => {
            if (route.status === 'Active') {
                mockTracking[route.route_id] = {
                    route_id: route.route_id,
                    driver_id: route.driver_id,
                    current_latitude: 40.7589 + (Math.random() - 0.5) * 0.1,
                    current_longitude: -73.9851 + (Math.random() - 0.5) * 0.1,
                    progress: Math.random(),
                    status: 'In Transit',
                    next_delivery: `ORD-${String(Math.floor(Math.random() * 50) + 1).padStart(3, '0')}`,
                    eta: new Date(Date.now() + Math.random() * 7200000).toLocaleTimeString()
                };
            }
        });
        
        setOrders(mockOrders);
        setClusters(mockClusters);
        setRoutes(mockRoutes);
        setDrivers(mockDrivers);
        setStats(mockStats);
        setTracking(mockTracking);
    };
    
    // Color schemes for different elements
    const getClusterColor = (index) => {
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#FF9FF3'];
        return colors[index % colors.length];
    };
    
    const getTimeSlotColor = (timeSlot) => {
        const colors = {
            '09:00-11:00': '#FF6B6B',
            '11:00-13:00': '#4ECDC4',
            '13:00-15:00': '#45B7D1',
            '15:00-17:00': '#96CEB4',
            '17:00-19:00': '#FECA57',
            '19:00-21:00': '#FF9FF3'
        };
        return colors[timeSlot] || '#999999';
    };
    
    const getStatusColor = (status) => {
        const colors = {
            'Pending': '#FFA500',
            'Assigned': '#4169E1',
            'Active': '#32CD32',
            'In Transit': '#FF69B4',
            'Completed': '#228B22',
            'Available': '#32CD32',
            'On Route': '#FF69B4',
            'Break': '#FFA500',
            'Offline': '#808080'
        };
        return colors[status] || '#999999';
    };
    
    // Prepare chart data
    const ordersByTimeSlot = orders.reduce((acc, order) => {
        acc[order.delivery_time_slot] = (acc[order.delivery_time_slot] || 0) + 1;
        return acc;
    }, {});
    
    const timeSlotChartData = Object.entries(ordersByTimeSlot).map(([timeSlot, count]) => ({
        timeSlot,
        orders: count
    }));
    
    const driverUtilizationData = drivers.slice(0, 6).map(driver => ({
        name: driver.name.split(' ')[0],
        volumeUtilization: Math.round(driver.current_load_volume / driver.vehicle_capacity_volume * 100),
        weightUtilization: Math.round(driver.current_load_weight / driver.vehicle_capacity_weight * 100)
    }));
    
    const deliveryTrendData = Array.from({ length: 7 }, (_, i) => ({
        day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
        deliveries: Math.floor(Math.random() * 50) + 80,
        efficiency: Math.floor(Math.random() * 20) + 75
    }));
    
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                            <Truck className="mr-3 text-blue-600" />
                            Real-time Delivery Optimization Dashboard
                        </h1>
                        <div className="flex items-center space-x-4">
                            <div className="text-sm text-gray-600 flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                Last updated: {new Date().toLocaleTimeString()}
                            </div>
                            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        </div>
                    </div>
                </div>
            </header>
            
            {/* Stats Overview */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center">
                            <Package className="w-8 h-8 text-blue-600" />
                            <div className="ml-4">
                                <div className="text-2xl font-bold text-gray-900">{stats.pending_orders || 0}</div>
                                <div className="text-sm text-gray-600">Pending Orders</div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center">
                            <MapPin className="w-8 h-8 text-green-600" />
                            <div className="ml-4">
                                <div className="text-2xl font-bold text-gray-900">{stats.active_clusters || 0}</div>
                                <div className="text-sm text-gray-600">Active Clusters</div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center">
                            <TrendingUp className="w-8 h-8 text-purple-600" />
                            <div className="ml-4">
                                <div className="text-2xl font-bold text-gray-900">{stats.active_routes || 0}</div>
                                <div className="text-sm text-gray-600">Active Routes</div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center">
                            <Users className="w-8 h-8 text-orange-600" />
                            <div className="ml-4">
                                <div className="text-2xl font-bold text-gray-900">{stats.available_drivers || 0}/{stats.total_drivers || 0}</div>
                                <div className="text-sm text-gray-600">Available Drivers</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Tab Navigation */}
                <div className="border-b border-gray-200 mb-6">
                    <nav className="-mb-px flex space-x-8">
                        {['overview', 'clusters', 'routes', 'drivers'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`py-2 px-1 border-b-2 font-medium text-sm capitalize transition-colors ${
                                    activeTab === tab
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </nav>
                </div>
                
                {/* Tab Content */}
                {activeTab === 'overview' && (
                    <div className="space-y-8">
                        {/* Performance Metrics */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-2xl font-bold text-gray-900">{stats.completed_deliveries || 0}</div>
                                        <div className="text-sm text-gray-600">Completed Today</div>
                                    </div>
                                    <CheckCircle className="w-8 h-8 text-green-500" />
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-2xl font-bold text-gray-900">{stats.avg_delivery_time || 0} min</div>
                                        <div className="text-sm text-gray-600">Avg Delivery Time</div>
                                    </div>
                                    <Clock className="w-8 h-8 text-blue-500" />
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-2xl font-bold text-gray-900">{stats.efficiency_score || 0}%</div>
                                        <div className="text-sm text-gray-600">Efficiency Score</div>
                                    </div>
                                    <TrendingUp className="w-8 h-8 text-purple-500" />
                                </div>
                            </div>
                        </div>
                        
                        {/* Charts */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                                <h3 className="text-lg font-semibold mb-4">Orders by Time Slot</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={timeSlotChartData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="timeSlot" />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="orders" fill="#4ECDC4" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                            
                            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                                <h3 className="text-lg font-semibold mb-4">Driver Utilization</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={driverUtilizationData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="volumeUtilization" fill="#45B7D1" name="Volume %" />
                                        <Bar dataKey="weightUtilization" fill="#96CEB4" name="Weight %" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                        
                        {/* Weekly Trend */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <h3 className="text-lg font-semibold mb-4">Weekly Delivery Trend</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={deliveryTrendData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="day" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="deliveries" stroke="#4ECDC4" strokeWidth={3} name="Deliveries" />
                                    <Line type="monotone" dataKey="efficiency" stroke="#FF6B6B" strokeWidth={3} name="Efficiency %" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}
                
                {activeTab === 'clusters' && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold">Active Delivery Clusters</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Cluster ID
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Orders
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Time Window
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Location
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Load
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Duration
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {clusters.map((cluster, index) => (
                                        <tr key={cluster.cluster_id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {cluster.cluster_id}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <span className="flex items-center">
                                                    <Package className="w-4 h-4 mr-1" />
                                                    {cluster.order_count}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <span 
                                                    className="px-3 py-1 text-xs font-semibold rounded-full text-white"
                                                    style={{ backgroundColor: getTimeSlotColor(cluster.time_window) }}
                                                >
                                                    {cluster.time_window}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <span className="flex items-center">
                                                    <MapPin className="w-4 h-4 mr-1" />
                                                    {cluster.centroid_lat.toFixed(4)}, {cluster.centroid_lon.toFixed(4)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <div>
                                                    <div>{cluster.total_volume.toFixed(2)} m³</div>
                                                    <div className="text-xs text-gray-400">{cluster.total_weight.toFixed(1)} kg</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <span className="flex items-center">
                                                    <Clock className="w-4 h-4 mr-1" />
                                                    {cluster.estimated_duration} min
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
                
                {activeTab === 'routes' && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold">Optimized Routes</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Route ID
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Driver
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Distance
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Duration
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Deliveries
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Progress
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {routes.map((route) => (
                                        <tr key={route.route_id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {route.route_id}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <div>
                                                    <div className="font-medium">{route.driver_name}</div>
                                                    <div className="text-xs text-gray-400">{route.vehicle_type}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {route.total_distance.toFixed(1)} km
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <span className="flex items-center">
                                                    <Clock className="w-4 h-4 mr-1" />
                                                    {route.estimated_duration} min
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <span className="flex items-center">
                                                    <Package className="w-4 h-4 mr-1" />
                                                    {route.delivery_count}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <span 
                                                    className="px-3 py-1 text-xs font-semibold rounded-full text-white"
                                                    style={{ backgroundColor: getStatusColor(route.status) }}
                                                >
                                                    {route.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <div className="flex items-center">
                                                    <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                                        <div 
                                                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                                            style={{ width: `${route.progress * 100}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-xs">{Math.round(route.progress * 100)}%</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
                
                {activeTab === 'drivers' && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold">Driver Status</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                            {drivers.map((driver) => (
                                <div key={driver.driver_id} className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                <Users className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <div className="ml-3">
                                                <div className="font-medium text-gray-900">{driver.name}</div>
                                                <div className="text-sm text-gray-500">{driver.driver_id}</div>
                                            </div>
                                        </div>
                                        <span 
                                            className="px-2 py-1 text-xs font-semibold rounded-full text-white"
                                            style={{ backgroundColor: getStatusColor(driver.status) }}
                                        >
                                            {driver.status}
                                        </span>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Vehicle:</span>
                                            <span className="font-medium">{driver.vehicle_type}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Deliveries Today:</span>
                                            <span className="font-medium">{driver.deliveries_today}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Rating:</span>
                                            <span className="font-medium">⭐ {driver.rating.toFixed(1)}</span>
                                        </div>
                                        
                                        <div className="mt-3">
                                            <div className="text-sm text-gray-600 mb-1">Volume Utilization</div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div 
                                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                                    style={{ width: `${Math.min(100, (driver.current_load_volume / driver.vehicle_capacity_volume * 100))}%` }}
                                                ></div>
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                {driver.current_load_volume.toFixed(1)} / {driver.vehicle_capacity_volume} m³
                                            </div>
                                        </div>
                                        
                                        <div className="mt-2">
                                            <div className="text-sm text-gray-600 mb-1">Weight Utilization</div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div 
                                                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                                                    style={{ width: `${Math.min(100, (driver.current_load_weight / driver.vehicle_capacity_weight * 100))}%` }}
                                                ></div>
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                {driver.current_load_weight.toFixed(0)} / {driver.vehicle_capacity_weight} kg
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                {/* Live Tracking Section */}
                {Object.keys(tracking).length > 0 && (
                    <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold flex items-center">
                                <AlertCircle className="w-5 h-5 mr-2 text-orange-500" />
                                Live Vehicle Tracking
                            </h3>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {Object.values(tracking).map((track) => (
                                    <div key={track.route_id} className="border border-gray-200 rounded-lg p-4 bg-gradient-to-r from-blue-50 to-indigo-50">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center">
                                                <Truck className="w-5 h-5 text-blue-600 mr-2" />
                                                <span className="font-medium">Route {track.route_id}</span>
                                            </div>
                                            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                        </div>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Driver:</span>
                                                <span className="font-medium">{track.driver_id}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Next Delivery:</span>
                                                <span className="font-medium">{track.next_delivery}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">ETA:</span>
                                                <span className="font-medium">{track.eta}</span>
                                            </div>
                                            <div className="mt-3">
                                                <div className="flex justify-between text-xs text-gray-600 mb-1">
                                                    <span>Progress</span>
                                                    <span>{Math.round(track.progress * 100)}%</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div 
                                                        className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500"
                                                        style={{ width: `${track.progress * 100}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DeliveryDashboard;
                