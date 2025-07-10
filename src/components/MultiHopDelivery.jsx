import React, { useState, useRef, useEffect, useCallback } from "react";

const VEHICLE_TYPES = {
  bike: { emoji: "🚲", speed: 1.5, capacity: 5, color: "#3b82f6" },
  scooter: { emoji: "🛵", speed: 2.5, capacity: 10, color: "#f97316" },
  van: { emoji: "🚚", speed: 3.5, capacity: 20, color: "#8b5cf6" },
};

const DRIVER_NAMES = [
  "Alex",
  "Jordan",
  "Sam",
  "Riley",
  "Casey",
  "Morgan",
  "Taylor",
  "Jamie",
];

const MultiHopDelivery = () => {
  // Core state
  const [drivers, setDrivers] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [handoffPoints, setHandoffPoints] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [stats, setStats] = useState({
    activeDeliveries: 0,
    avgDeliveryTime: 15,
    efficiencyScore: 85,
    avgFatigue: 0,
    wellbeingScore: 100,
  });

  // Controls state
  const [congestionLevel, setCongestionLevel] = useState(50);
  const [deliveryVolume, setDeliveryVolume] = useState(30);
  const [visualizationMode, setVisualizationMode] = useState("all");

  // Canvas state
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const [canvasSize, setCanvasSize] = useState({ width: 1200, height: 600 });
  const [viewOffset, setViewOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Animation refs for smooth movement
  const driverPositionsRef = useRef([]);
  const lastUpdateRef = useRef(Date.now());

  // Initialize system
  useEffect(() => {
    initializeSystem();
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Handle canvas resize
  const handleResize = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      setCanvasSize({ width: rect.width, height: rect.height });
      canvas.width = rect.width;
      canvas.height = rect.height;
    }
  };

  // Initialize system
  const initializeSystem = () => {
    // Create drivers
    const newDrivers = DRIVER_NAMES.map((name, i) => {
      const vehicleType = Object.keys(VEHICLE_TYPES)[i % 3];
      const cols = 4;
      const rows = 2;
      const xSpacing = (canvasSize.width - 200) / (cols - 1);
      const ySpacing = (canvasSize.height - 200) / (rows - 1);
      const col = i % cols;
      const row = Math.floor(i / cols);

      return {
        id: i,
        name,
        vehicle: vehicleType,
        position: {
          x: 100 + col * xSpacing + (Math.random() - 0.5) * 30,
          y: 100 + row * ySpacing + (Math.random() - 0.5) * 30,
        },
        fatigue: 10 + Math.random() * 20,
        deliveriesCompleted: 0,
        currentDelivery: null,
        isResting: false,
        speed: VEHICLE_TYPES[vehicleType].speed,
        capacity: VEHICLE_TYPES[vehicleType].capacity,
      };
    });

    // Create handoff points
    const hubCount = 5;
    const newHandoffPoints = Array.from({ length: hubCount }, (_, i) => ({
      id: i,
      position: {
        x: canvasSize.width * (0.2 + (i % 3) * 0.3),
        y: canvasSize.height * (0.25 + Math.floor(i / 3) * 0.5),
      },
      type: "transfer_hub",
    }));

    setDrivers(newDrivers);
    setHandoffPoints(newHandoffPoints);
    driverPositionsRef.current = newDrivers.map((d) => ({ ...d.position }));
  };

  // Generate new deliveries
  const generateDeliveries = useCallback(() => {
    const numDeliveries = Math.floor(deliveryVolume / 10);
    const newDeliveries = Array.from({ length: numDeliveries }, (_, i) => ({
      id: `${Date.now()}-${i}`,
      pickup: {
        x: 50 + Math.random() * (canvasSize.width - 100),
        y: 50 + Math.random() * (canvasSize.height - 100),
      },
      dropoff: {
        x: 50 + Math.random() * (canvasSize.width - 100),
        y: 50 + Math.random() * (canvasSize.height - 100),
      },
      priority: Math.random() > 0.7 ? "high" : "normal",
      weight: 1 + Math.random() * 9,
      status: "pending",
      hops: [],
      createdAt: Date.now(),
    }));

    setDeliveries((prev) => [...prev, ...newDeliveries]);

    // Auto-optimize routes for new deliveries
    setTimeout(() => optimizeRoutes(newDeliveries), 100);
  }, [deliveryVolume, canvasSize]);

  // Optimize routes with multi-hop logic
  const optimizeRoutes = useCallback(
    (newDeliveries = null) => {
      const deliveriesToOptimize =
        newDeliveries || deliveries.filter((d) => d.status === "pending");

      const optimizedDeliveries = deliveriesToOptimize.map((delivery) => {
        const directDistance = Math.hypot(
          delivery.dropoff.x - delivery.pickup.x,
          delivery.dropoff.y - delivery.pickup.y
        );

        const hops = [];
        let currentPos = delivery.pickup;

        // Determine if multi-hop is beneficial
        const needsMultiHop =
          (congestionLevel > 70 || directDistance > canvasSize.width / 2) &&
          Math.random() > 0.3;

        if (needsMultiHop && handoffPoints.length > 0) {
          // Find nearest hub
          const nearestHub = handoffPoints.reduce((nearest, hub) => {
            const dist = Math.hypot(
              currentPos.x - hub.position.x,
              currentPos.y - hub.position.y
            );
            const nearestDist = Math.hypot(
              currentPos.x - nearest.position.x,
              currentPos.y - nearest.position.y
            );
            return dist < nearestDist ? hub : nearest;
          });

          hops.push({
            from: currentPos,
            to: nearestHub.position,
            vehicle: "bike",
            distance: Math.hypot(
              currentPos.x - nearestHub.position.x,
              currentPos.y - nearestHub.position.y
            ),
          });

          currentPos = nearestHub.position;
        }

        // Final hop to destination
        hops.push({
          from: currentPos,
          to: delivery.dropoff,
          vehicle: directDistance > canvasSize.width / 3 ? "van" : "scooter",
          distance: Math.hypot(
            currentPos.x - delivery.dropoff.x,
            currentPos.y - delivery.dropoff.y
          ),
        });

        return { ...delivery, hops, status: "optimized" };
      });

      setDeliveries((prev) => {
        const unchanged = prev.filter(
          (d) => !deliveriesToOptimize.find((opt) => opt.id === d.id)
        );
        return [...unchanged, ...optimizedDeliveries];
      });

      // Assign to drivers
      assignDeliveries();
    },
    [deliveries, congestionLevel, handoffPoints, canvasSize]
  );

  // Assign deliveries to available drivers
  const assignDeliveries = useCallback(() => {
    setDeliveries((prevDeliveries) => {
      const updatedDeliveries = [...prevDeliveries];

      setDrivers((prevDrivers) => {
        return prevDrivers.map((driver) => {
          if (
            !driver.currentDelivery &&
            !driver.isResting &&
            driver.fatigue < 80
          ) {
            const availableDelivery = updatedDeliveries.find(
              (d) =>
                (d.status === "optimized" || d.status === "pending") &&
                d.hops.length > 0 &&
                d.hops[0].vehicle === driver.vehicle
            );

            if (availableDelivery) {
              availableDelivery.status = "assigned";
              availableDelivery.assignedDriver = driver.id;
              availableDelivery.currentHop = 0;

              return {
                ...driver,
                currentDelivery: availableDelivery,
              };
            }
          }
          return driver;
        });
      });

      return updatedDeliveries;
    });
  }, []);

  // Animation loop
  useEffect(() => {
    if (!isRunning) return;

    const animate = () => {
      const now = Date.now();
      const deltaTime = (now - lastUpdateRef.current) / 1000; // Convert to seconds
      lastUpdateRef.current = now;

      // Update driver positions and fatigue
      setDrivers((prevDrivers) => {
        return prevDrivers.map((driver, idx) => {
          const pos = driverPositionsRef.current[idx];
          let updatedDriver = { ...driver };

          if (
            driver.currentDelivery &&
            driver.currentDelivery.status === "assigned"
          ) {
            const delivery = driver.currentDelivery;
            const currentHop = delivery.hops[delivery.currentHop || 0];

            if (currentHop) {
              const target =
                currentHop === delivery.hops[0]
                  ? delivery.pickup
                  : currentHop.to;
              const dx = target.x - pos.x;
              const dy = target.y - pos.y;
              const distance = Math.hypot(dx, dy);

              if (distance > 3) {
                // Move towards target
                const moveDistance = driver.speed * 30 * deltaTime; // 30 pixels per second base speed
                const moveX = (dx / distance) * moveDistance;
                const moveY = (dy / distance) * moveDistance;

                driverPositionsRef.current[idx] = {
                  x: pos.x + moveX,
                  y: pos.y + moveY,
                };

                // Increase fatigue
                updatedDriver.fatigue = Math.min(
                  100,
                  driver.fatigue + deltaTime * 0.5
                );
              } else {
                // Reached waypoint
                if (delivery.currentHop < delivery.hops.length - 1) {
                  // Move to next hop
                  delivery.currentHop++;
                } else {
                  // Delivery completed
                  updatedDriver.deliveriesCompleted++;
                  updatedDriver.currentDelivery = null;
                  updatedDriver.fatigue = Math.min(100, driver.fatigue + 2);

                  // Mark delivery as completed
                  setDeliveries((prev) =>
                    prev.map((d) =>
                      d.id === delivery.id
                        ? { ...d, status: "completed", completedAt: now }
                        : d
                    )
                  );

                  // Check if needs rest
                  if (updatedDriver.fatigue > 80) {
                    updatedDriver.isResting = true;
                    setTimeout(() => {
                      setDrivers((prev) =>
                        prev.map((d) =>
                          d.id === driver.id
                            ? {
                                ...d,
                                fatigue: d.fatigue * 0.6,
                                isResting: false,
                              }
                            : d
                        )
                      );
                    }, 5000);
                  }
                }
              }
            }
          } else if (!driver.isResting && driver.fatigue > 0) {
            // Natural fatigue recovery
            updatedDriver.fatigue = Math.max(
              0,
              driver.fatigue - deltaTime * 0.3
            );
          }

          return updatedDriver;
        });
      });

      // Update stats
      updateStats();

      // Continue animation
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRunning]);

  // Update statistics
  const updateStats = useCallback(() => {
    setStats((prev) => {
      const activeDeliveries = deliveries.filter(
        (d) => d.status !== "completed"
      ).length;
      const avgFatigue =
        drivers.reduce((sum, d) => sum + d.fatigue, 0) / (drivers.length || 1);
      const wellbeingScore = Math.max(0, 100 - avgFatigue * 0.8);

      return {
        ...prev,
        activeDeliveries,
        avgDeliveryTime: 15 + Math.floor(Math.random() * 10),
        efficiencyScore: 80 + Math.floor(Math.random() * 15),
        avgFatigue: Math.floor(avgFatigue),
        wellbeingScore: Math.floor(wellbeingScore),
      };
    });
  }, [drivers, deliveries]);

  // Cleanup old deliveries
  useEffect(() => {
    const interval = setInterval(() => {
      setDeliveries((prev) =>
        prev.filter((d) => {
          if (d.status === "completed" && d.completedAt) {
            return Date.now() - d.completedAt < 5000;
          }
          return true;
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Auto-generate deliveries
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        generateDeliveries();
      }
      assignDeliveries();
    }, 3000);

    return () => clearInterval(interval);
  }, [isRunning, generateDeliveries, assignDeliveries]);

  // Canvas drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply transformations
    ctx.save();
    ctx.translate(viewOffset.x, viewOffset.y);
    ctx.scale(scale, scale);

    // Draw grid
    ctx.strokeStyle = "rgba(0, 0, 0, 0.03)";
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Draw handoff points
    handoffPoints.forEach((hub, idx) => {
      // Glow
      const gradient = ctx.createRadialGradient(
        hub.position.x,
        hub.position.y,
        0,
        hub.position.x,
        hub.position.y,
        25
      );
      gradient.addColorStop(0, "rgba(251, 146, 60, 0.3)");
      gradient.addColorStop(1, "rgba(251, 146, 60, 0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(hub.position.x - 25, hub.position.y - 25, 50, 50);

      // Hub
      ctx.beginPath();
      ctx.arc(hub.position.x, hub.position.y, 15, 0, Math.PI * 2);
      ctx.fillStyle = "#fff";
      ctx.fill();
      ctx.strokeStyle = "#fb923c";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = "#fb923c";
      ctx.font = "bold 12px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`H${idx + 1}`, hub.position.x, hub.position.y);
    });

    // Filter deliveries by visualization mode
    let visibleDeliveries = deliveries;
    if (visualizationMode === "active") {
      visibleDeliveries = deliveries.filter((d) => d.status === "assigned");
    } else if (visualizationMode === "priority") {
      visibleDeliveries = deliveries.filter((d) => d.priority === "high");
    }

    // Draw delivery routes
    visibleDeliveries.forEach((delivery) => {
      if (delivery.status === "completed") return;

      // Draw route
      if (delivery.hops.length > 0) {
        ctx.beginPath();
        ctx.moveTo(delivery.pickup.x, delivery.pickup.y);
        delivery.hops.forEach((hop) => {
          ctx.lineTo(hop.to.x, hop.to.y);
        });

        ctx.strokeStyle = delivery.priority === "high" ? "#ef4444" : "#3b82f6";
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.5;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.globalAlpha = 1;
      }

      // Draw pickup
      ctx.beginPath();
      ctx.arc(delivery.pickup.x, delivery.pickup.y, 8, 0, Math.PI * 2);
      ctx.fillStyle = delivery.priority === "high" ? "#ef4444" : "#10b981";
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.font = "bold 10px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("P", delivery.pickup.x, delivery.pickup.y);

      // Draw dropoff
      ctx.beginPath();
      ctx.arc(delivery.dropoff.x, delivery.dropoff.y, 8, 0, Math.PI * 2);
      ctx.fillStyle = delivery.priority === "high" ? "#dc2626" : "#f97316";
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.fillText("D", delivery.dropoff.x, delivery.dropoff.y);
    });

    // Draw drivers
    drivers.forEach((driver, idx) => {
      const pos = driverPositionsRef.current[idx];

      // Shadow
      ctx.beginPath();
      ctx.arc(pos.x, pos.y + 2, 20, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
      ctx.fill();

      // Driver circle
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 20, 0, Math.PI * 2);
      ctx.fillStyle = "#fff";
      ctx.fill();
      ctx.strokeStyle = "#e5e7eb";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Vehicle emoji
      ctx.font = "18px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(VEHICLE_TYPES[driver.vehicle].emoji, pos.x, pos.y);

      // Fatigue indicator
      const fatigueAngle = (driver.fatigue / 100) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 23, -Math.PI / 2, -Math.PI / 2 + fatigueAngle);
      ctx.strokeStyle =
        driver.fatigue < 30
          ? "#10b981"
          : driver.fatigue < 70
          ? "#f59e0b"
          : "#ef4444";
      ctx.lineWidth = 3;
      ctx.stroke();

      // Name
      ctx.fillStyle = "#1f2937";
      ctx.font = "11px sans-serif";
      ctx.fillText(driver.name, pos.x, pos.y + 35);

      // Status
      if (driver.isResting) {
        ctx.fillStyle = "#f59e0b";
        ctx.font = "10px sans-serif";
        ctx.fillText("Resting", pos.x, pos.y + 47);
      }
    });

    ctx.restore();
  }, [
    drivers,
    deliveries,
    handoffPoints,
    viewOffset,
    scale,
    visualizationMode,
  ]);

  // Canvas interactions
  const handleCanvasMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - rect.left - viewOffset.x,
      y: e.clientY - rect.top - viewOffset.y,
    });
  };

  const handleCanvasMouseMove = (e) => {
    if (!isDragging) return;
    const rect = canvasRef.current.getBoundingClientRect();
    setViewOffset({
      x: e.clientX - rect.left - dragStart.x,
      y: e.clientY - rect.top - dragStart.y,
    });
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleWheel = (e) => {
      e.preventDefault(); // Now allowed
      const scaleDelta = e.deltaY > 0 ? 0.9 : 1.1;
      setScale((prev) => Math.max(0.5, Math.min(2, prev * scaleDelta)));
    };

    canvas.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      canvas.removeEventListener("wheel", handleWheel);
    };
  }, []);

  // Control handlers
  const handleStart = () => {
    setIsRunning(true);
    if (deliveries.length === 0) {
      generateDeliveries();
    }
  };

  const handleStop = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setDeliveries([]);
    initializeSystem();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <span className="text-3xl">🚚</span>
            Multi-Hop Delivery System Route Planning
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500">Active Deliveries</div>
            <div className="text-2xl font-bold text-gray-900">
              {stats.activeDeliveries}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500">Avg. Delivery Time</div>
            <div className="text-2xl font-bold text-gray-900">
              {stats.avgDeliveryTime} min
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500">Efficiency Score</div>
            <div className="text-2xl font-bold text-green-600">
              {stats.efficiencyScore}%
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500">Avg. Fatigue</div>
            <div className="text-2xl font-bold text-orange-600">
              {stats.avgFatigue}%
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500">Wellbeing Score</div>
            <div className="text-2xl font-bold text-blue-600">
              {stats.wellbeingScore}%
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Canvas */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Route Visualization
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setVisualizationMode("all")}
                  className={`px-3 py-1 rounded text-sm ${
                    visualizationMode === "all"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setVisualizationMode("active")}
                  className={`px-3 py-1 rounded text-sm ${
                    visualizationMode === "active"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  Active
                </button>
                <button
                  onClick={() => setVisualizationMode("priority")}
                  className={`px-3 py-1 rounded text-sm ${
                    visualizationMode === "priority"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  Priority
                </button>
              </div>
            </div>
            <canvas
              ref={canvasRef}
              className="w-full h-[400px] border border-gray-200 rounded cursor-grab active:cursor-grabbing"
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              onMouseLeave={handleCanvasMouseUp}
            />
            <div className="mt-2 text-xs text-gray-500 flex justify-between">
              <span>Drag to pan • Scroll to zoom</span>
              <span>Scale: {Math.round(scale * 100)}%</span>
            </div>
          </div>

          {/* Controls & Drivers */}
          <div className="space-y-4">
            {/* Controls */}
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Controls
              </h2>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <button
                    onClick={generateDeliveries}
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Generate Deliveries
                  </button>
                  <button
                    onClick={() => optimizeRoutes()}
                    className="flex-1 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
                  >
                    Optimize Routes
                  </button>
                </div>
                <div className="flex gap-2">
                  {!isRunning ? (
                    <button
                      onClick={handleStart}
                      className="flex-1 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      Start Simulation
                    </button>
                  ) : (
                    <button
                      onClick={handleStop}
                      className="flex-1 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Stop Simulation
                    </button>
                  )}
                  <button
                    onClick={handleReset}
                    className="flex-1 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                  >
                    Reset
                  </button>
                </div>

                <div>
                  <label className="text-sm text-gray-600">
                    Delivery Volume: {deliveryVolume}/hour
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={deliveryVolume}
                    onChange={(e) => setDeliveryVolume(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600">
                    Traffic Congestion: {congestionLevel}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={congestionLevel}
                    onChange={(e) => setCongestionLevel(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Driver List */}
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Drivers
              </h2>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {drivers.map((driver) => (
                  <div
                    key={driver.id}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">
                        {VEHICLE_TYPES[driver.vehicle].emoji}
                      </span>
                      <div>
                        <div className="font-medium text-sm">{driver.name}</div>
                        <div className="text-xs text-gray-500">
                          {driver.isResting
                            ? "Resting"
                            : driver.currentDelivery
                            ? "Delivering"
                            : "Available"}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500">
                        Deliveries: {driver.deliveriesCompleted}
                      </div>
                      <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden mt-1">
                        <div
                          className={`h-full transition-all duration-300 ${
                            driver.fatigue < 30
                              ? "bg-green-500"
                              : driver.fatigue < 70
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                          style={{ width: `${driver.fatigue}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Delivery List */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Active Deliveries
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left">ID</th>
                  <th className="px-3 py-2 text-left">Priority</th>
                  <th className="px-3 py-2 text-left">Status</th>
                  <th className="px-3 py-2 text-left">Assigned To</th>
                  <th className="px-3 py-2 text-left">Hops</th>
                  <th className="px-3 py-2 text-left">Weight</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {deliveries
                  .filter((d) => d.status !== "completed")
                  .slice(0, 10)
                  .map((delivery) => {
                    const assignedDriver = drivers.find(
                      (d) => d.id === delivery.assignedDriver
                    );
                    return (
                      <tr key={delivery.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2">
                          {delivery.id.split("-")[1]}
                        </td>
                        <td className="px-3 py-2">
                          <span
                            className={`px-2 py-1 text-xs rounded ${
                              delivery.priority === "high"
                                ? "bg-red-100 text-red-700"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {delivery.priority}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <span
                            className={`px-2 py-1 text-xs rounded ${
                              delivery.status === "assigned"
                                ? "bg-green-100 text-green-700"
                                : delivery.status === "optimized"
                                ? "bg-purple-100 text-purple-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {delivery.status}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          {assignedDriver?.name || "-"}
                        </td>
                        <td className="px-3 py-2">{delivery.hops.length}</td>
                        <td className="px-3 py-2">
                          {delivery.weight.toFixed(1)} kg
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
            {deliveries.filter((d) => d.status !== "completed").length > 10 && (
              <div className="text-center py-2 text-sm text-gray-500">
                And{" "}
                {deliveries.filter((d) => d.status !== "completed").length - 10}{" "}
                more...
              </div>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Legend</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span>Pickup Point (Normal)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded-full"></div>
              <span>Pickup Point (High Priority)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
              <span>Dropoff Point</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-400 rounded-full"></div>
              <span>Transfer Hub</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 bg-blue-500"></div>
              <span>Normal Route</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 bg-red-500"></div>
              <span>High Priority Route</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">🚲</span>
              <span>Bike (Short Distance)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">🛵</span>
              <span>Scooter (Medium Distance)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">🚚</span>
              <span>Van (Long Distance)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultiHopDelivery;
