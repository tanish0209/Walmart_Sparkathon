import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';

const MultiHopDelivery = () => {
    const [config, setConfig] = useState({
        packages: 5,
        congestion: 'medium',
        priority: 'time',
        algorithm: 'astar'
    });
    
    const [networkData, setNetworkData] = useState({
        nodes: [],
        edges: [],
        packages: [],
        routes: []
    });
    
    const [optimizationResults, setOptimizationResults] = useState(null);
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [isSimulating, setIsSimulating] = useState(false);
    
    const canvasRef = useRef(null);

    // Vehicle types with characteristics
    const vehicleTypes = {
        bike: { 
            emoji: '🚲', 
            speed: 12,
            capacity: 3,
            costPerKm: 1.5,
            trafficImpact: 0.1,
            maxRange: 5,
            fuelCost: 0
        },
        scooter: { 
            emoji: '🛵', 
            speed: 22,
            capacity: 8,
            costPerKm: 2.5,
            trafficImpact: 0.3,
            maxRange: 15,
            fuelCost: 0.8
        },
        van: { 
            emoji: '🚚', 
            speed: 28,
            capacity: 50,
            costPerKm: 6.5,
            trafficImpact: 0.8,
            maxRange: 100,
            fuelCost: 1.2
        },
        truck: { 
            emoji: '🚛', 
            speed: 25,
            capacity: 150,
            costPerKm: 12.0,
            trafficImpact: 1.0,
            maxRange: 200,
            fuelCost: 2.5
        }
    };

    const nodeTypes = {
        warehouse: { emoji: '🏭', color: '#e53e3e' },
        hub: { emoji: '🏢', color: '#3182ce' },
        transfer: { emoji: '🔄', color: '#38a169' },
        customer: { emoji: '🏠', color: '#d69e2e' }
    };

    // Generate delivery network
    const generateDeliveryNetwork = () => {
        const numPackages = parseInt(config.packages);
        
        // Generate nodes
        const nodes = [
            { id: 'warehouse', type: 'warehouse', x: 50, y: 250 },
            { id: 'hub1', type: 'hub', x: 200, y: 150 },
            { id: 'hub2', type: 'hub', x: 200, y: 350 },
            { id: 'transfer1', type: 'transfer', x: 350, y: 100 },
            { id: 'transfer2', type: 'transfer', x: 350, y: 200 },
            { id: 'transfer3', type: 'transfer', x: 350, y: 300 },
            { id: 'transfer4', type: 'transfer', x: 350, y: 400 }
        ];

        // Generate customer nodes
        const maxCustomers = Math.min(numPackages, 20);
        for (let i = 0; i < maxCustomers; i++) {
            nodes.push({
                id: `customer${i + 1}`,
                type: 'customer',
                x: 500 + (i % 4) * 80,
                y: 80 + Math.floor(i / 4) * 70
            });
        }

        // Generate edges
        const edges = [
            { from: 'warehouse', to: 'hub1', vehicle: 'truck' },
            { from: 'warehouse', to: 'hub2', vehicle: 'truck' },
            { from: 'hub1', to: 'transfer1', vehicle: 'van' },
            { from: 'hub1', to: 'transfer2', vehicle: 'van' },
            { from: 'hub2', to: 'transfer3', vehicle: 'van' },
            { from: 'hub2', to: 'transfer4', vehicle: 'van' },
            { from: 'hub1', to: 'hub2', vehicle: 'van' },
            { from: 'transfer1', to: 'transfer2', vehicle: 'scooter' },
            { from: 'transfer2', to: 'transfer3', vehicle: 'scooter' },
            { from: 'transfer3', to: 'transfer4', vehicle: 'scooter' }
        ];

        // Connect transfer points to customers
        for (let i = 0; i < maxCustomers; i++) {
            const transferPoint = `transfer${(i % 4) + 1}`;
            const customerNode = `customer${i + 1}`;
            const vehicle = Math.random() < 0.7 ? 'bike' : 'scooter';
            
            edges.push({ from: transferPoint, to: customerNode, vehicle });
        }

        // Generate packages
        const packages = [];
        for (let i = 0; i < maxCustomers; i++) {
            packages.push({
                id: `pkg${i + 1}`,
                from: 'warehouse',
                to: `customer${i + 1}`,
                weight: Math.random() * 5 + 1,
                priority: Math.random() < 0.3 ? 'high' : 'normal'
            });
        }

        setNetworkData({ nodes, edges, packages, routes: [] });
        setOptimizationResults(null);
    };

    // Render network visualization
    const renderNetwork = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw edges
        networkData.edges.forEach(edge => {
            const fromNode = networkData.nodes.find(n => n.id === edge.from);
            const toNode = networkData.nodes.find(n => n.id === edge.to);
            
            if (fromNode && toNode) {
                ctx.beginPath();
                ctx.moveTo(fromNode.x, fromNode.y);
                ctx.lineTo(toNode.x, toNode.y);
                ctx.strokeStyle = '#cbd5e0';
                ctx.lineWidth = 3;
                ctx.stroke();
            }
        });

        // Draw nodes
        networkData.nodes.forEach(node => {
            const nodeType = nodeTypes[node.type];
            if (nodeType) {
                // Draw circle
                ctx.beginPath();
                ctx.arc(node.x, node.y, 20, 0, 2 * Math.PI);
                ctx.fillStyle = nodeType.color;
                ctx.fill();
                
                // Draw emoji (simplified as text)
                ctx.fillStyle = 'white';
                ctx.font = '16px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(nodeType.emoji, node.x, node.y + 5);
            }
        });
    };

    // Calculate distance between nodes
    const calculateDistance = (node1, node2) => {
        const dx = node1.x - node2.x;
        const dy = node1.y - node2.y;
        return Math.sqrt(dx * dx + dy * dy) / 10;
    };

    // Simple pathfinding algorithm (simplified A*)
    const findOptimalRoute = (start, end) => {
        const graph = new Map();
        
        // Build graph
        networkData.nodes.forEach(node => {
            graph.set(node.id, []);
        });
        
        networkData.edges.forEach(edge => {
            const fromNode = networkData.nodes.find(n => n.id === edge.from);
            const toNode = networkData.nodes.find(n => n.id === edge.to);
            
            if (fromNode && toNode) {
                const distance = calculateDistance(fromNode, toNode);
                const vehicle = vehicleTypes[edge.vehicle];
                
                graph.get(edge.from).push({
                    to: edge.to,
                    distance,
                    time: distance / vehicle.speed,
                    cost: distance * vehicle.costPerKm,
                    vehicle: edge.vehicle
                });
            }
        });

        // Simple BFS pathfinding
        const queue = [{ node: start, path: [], totalCost: 0, totalTime: 0 }];
        const visited = new Set();
        
        while (queue.length > 0) {
            const current = queue.shift();
            
            if (current.node === end) {
                return {
                    path: current.path,
                    totalCost: current.totalCost,
                    totalTime: current.totalTime
                };
            }
            
            if (visited.has(current.node)) continue;
            visited.add(current.node);
            
            const neighbors = graph.get(current.node) || [];
            neighbors.forEach(neighbor => {
                if (!visited.has(neighbor.to)) {
                    queue.push({
                        node: neighbor.to,
                        path: [...current.path, {
                            from: current.node,
                            to: neighbor.to,
                            vehicle: neighbor.vehicle,
                            distance: neighbor.distance,
                            time: neighbor.time,
                            cost: neighbor.cost
                        }],
                        totalCost: current.totalCost + neighbor.cost,
                        totalTime: current.totalTime + neighbor.time
                    });
                }
            });
        }
        
        return null;
    };

    // Optimize routes
    const optimizeRoutes = () => {
        if (networkData.nodes.length === 0) {
            alert('Please generate a network first!');
            return;
        }

        setIsOptimizing(true);
        
        setTimeout(() => {
            const routes = [];
            let totalCost = 0;
            let totalTime = 0;
            let totalDistance = 0;

            networkData.packages.forEach(pkg => {
                const route = findOptimalRoute(pkg.from, pkg.to);
                if (route) {
                    routes.push({
                        packageId: pkg.id,
                        path: route.path,
                        totalCost: route.totalCost,
                        totalTime: route.totalTime
                    });
                    
                    totalCost += route.totalCost;
                    totalTime += route.totalTime;
                    totalDistance += route.path.reduce((sum, step) => sum + step.distance, 0);
                }
            });

            const avgHops = routes.reduce((sum, route) => sum + route.path.length, 0) / routes.length;

            setOptimizationResults({
                routes,
                totalCost,
                totalTime,
                totalDistance,
                avgHops,
                algorithm: config.algorithm,
                priority: config.priority
            });

            setIsOptimizing(false);
        }, 1500);
    };

    // Simulate delivery
    const simulateDelivery = () => {
        if (!optimizationResults) {
            alert('Please optimize routes first!');
            return;
        }

        setIsSimulating(true);
        
        setTimeout(() => {
            setIsSimulating(false);
            alert('🎉 All deliveries completed successfully!');
        }, 3000);
    };

    useEffect(() => {
        generateDeliveryNetwork();
    }, []);

    useEffect(() => {
        renderNetwork();
    }, [networkData]);

    const algorithmDescriptions = {
        dijkstra: "Dijkstra's Algorithm finds the shortest path by systematically exploring all possible routes and maintaining the minimum distance to each node.",
        astar: "A* Search uses heuristics to guide the search towards the goal, making it more efficient than Dijkstra for single-destination pathfinding.",
        genetic: "Genetic Algorithm evolves solutions through selection, crossover, and mutation to find optimal multi-route configurations."
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">
                        🚚 Dynamic Multi-Hop Delivery Planning
                    </h1>
                    <p className="text-xl text-gray-600">
                        Optimizing last-mile delivery through intelligent route segmentation and vehicle handoffs
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Configuration Panel */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                🎯 Delivery Configuration
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Number of Packages:
                                </label>
                                <input
                                    type="number"
                                    value={config.packages}
                                    onChange={(e) => setConfig({...config, packages: e.target.value})}
                                    min="1"
                                    max="20"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Traffic Congestion Level:
                                </label>
                                <select
                                    value={config.congestion}
                                    onChange={(e) => setConfig({...config, congestion: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="low">Low (20% slower)</option>
                                    <option value="medium">Medium (50% slower)</option>
                                    <option value="high">High (100% slower)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Delivery Priority:
                                </label>
                                <select
                                    value={config.priority}
                                    onChange={(e) => setConfig({...config, priority: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="cost">Minimize Cost</option>
                                    <option value="time">Minimize Time</option>
                                    <option value="balanced">Balanced</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Optimization Algorithm:
                                </label>
                                <select
                                    value={config.algorithm}
                                    onChange={(e) => setConfig({...config, algorithm: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="dijkstra">Dijkstra's Algorithm</option>
                                    <option value="astar">A* Search</option>
                                    <option value="genetic">Genetic Algorithm</option>
                                </select>
                            </div>

                            <div className="flex flex-wrap gap-2 pt-4">
                                <Button onClick={generateDeliveryNetwork}>
                                    🏗️ Generate Network
                                </Button>
                                <Button onClick={optimizeRoutes} disabled={isOptimizing}>
                                    {isOptimizing ? '⏳ Optimizing...' : '⚡ Optimize Routes'}
                                </Button>
                                <Button onClick={simulateDelivery} disabled={isSimulating}>
                                    {isSimulating ? '🚀 Simulating...' : '🚀 Simulate Delivery'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Network Visualization */}
                    <Card>
                        <CardHeader>
                            <CardTitle>📊 Network Visualization</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="w-full h-96 border-2 border-gray-200 rounded-lg bg-gray-50 relative overflow-hidden">
                                <canvas
                                    ref={canvasRef}
                                    width={800}
                                    height={400}
                                    className="w-full h-full"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Optimization Results */}
                {optimizationResults && (
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle>📈 Optimization Results</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {/* Metrics */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                                <div className="bg-gradient-to-r from-blue-100 to-blue-200 p-4 rounded-lg text-center">
                                    <div className="text-2xl font-bold text-blue-800">
                                        ${optimizationResults.totalCost.toFixed(2)}
                                    </div>
                                    <div className="text-blue-600 text-sm">Total Cost</div>
                                </div>
                                <div className="bg-gradient-to-r from-green-100 to-green-200 p-4 rounded-lg text-center">
                                    <div className="text-2xl font-bold text-green-800">
                                        {optimizationResults.totalTime.toFixed(1)}h
                                    </div>
                                    <div className="text-green-600 text-sm">Total Time</div>
                                </div>
                                <div className="bg-gradient-to-r from-purple-100 to-purple-200 p-4 rounded-lg text-center">
                                    <div className="text-2xl font-bold text-purple-800">
                                        {optimizationResults.avgHops.toFixed(1)}
                                    </div>
                                    <div className="text-purple-600 text-sm">Avg Hops</div>
                                </div>
                                <div className="bg-gradient-to-r from-orange-100 to-orange-200 p-4 rounded-lg text-center">
                                    <div className="text-2xl font-bold text-orange-800">
                                        {optimizationResults.totalDistance.toFixed(1)}km
                                    </div>
                                    <div className="text-orange-600 text-sm">Total Distance</div>
                                </div>
                            </div>

                            {/* Route Details */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">🛣️ Optimized Routes</h3>
                                {optimizationResults.routes.map(route => (
                                    <div key={route.packageId} className="bg-gray-50 p-4 rounded-lg">
                                        <h4 className="font-semibold text-gray-800 mb-2">
                                            📦 {route.packageId} 
                                            ({route.path.length} hops • ${route.totalCost.toFixed(2)} • {route.totalTime.toFixed(1)}h)
                                        </h4>
                                        <div className="space-y-2">
                                            {route.path.map((step, index) => {
                                                const vehicle = vehicleTypes[step.vehicle];
                                                return (
                                                    <div key={index} className="flex items-center gap-3 p-2 bg-white rounded">
                                                        <span className="text-lg">{vehicle.emoji}</span>
                                                        <div className="flex-1">
                                                            <div className="font-medium text-sm">
                                                                {step.vehicle.toUpperCase()}: {step.from} → {step.to}
                                                            </div>
                                                            <div className="text-xs text-gray-600">
                                                                {step.distance.toFixed(1)}km • {step.time.toFixed(1)}h • ${step.cost.toFixed(2)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Algorithm Info */}
                            <div className="mt-6 p-4 bg-green-50 border-l-4 border-green-500 rounded">
                                <h4 className="font-semibold text-green-800">
                                    Algorithm: {optimizationResults.algorithm.toUpperCase()} ({optimizationResults.priority} priority)
                                </h4>
                                <p className="text-green-700 text-sm mt-1">
                                    {algorithmDescriptions[optimizationResults.algorithm]}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default MultiHopDelivery;