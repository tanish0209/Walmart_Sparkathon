import axios from 'axios';
import io from 'socket.io-client';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Create axios instance with default config
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Socket.IO connection
let socket = null;

// Initialize socket connection
export const initializeSocket = () => {
  if (!socket) {
    socket = io(API_BASE_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    socket.on('connect', () => {
      console.log('Connected to backend via Socket.IO');
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from backend');
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
  }
  return socket;
};

// Get socket instance
export const getSocket = () => {
  if (!socket) {
    return initializeSocket();
  }
  return socket;
};

// API Service functions
export const apiService = {
  // Dashboard related APIs
  getDashboardData: async () => {
    try {
      const response = await api.get('/dashboard-data');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  },

  // Route optimization
  optimizeRoutes: async (optimizationData) => {
    try {
      const response = await api.post('/optimize-routes', optimizationData);
      return response.data;
    } catch (error) {
      console.error('Error optimizing routes:', error);
      throw error;
    }
  },

  // Multi-hop delivery planning
  planMultiHopDelivery: async (deliveryConfig) => {
    try {
      const response = await api.post('/multi-hop-delivery', deliveryConfig);
      return response.data;
    } catch (error) {
      console.error('Error planning multi-hop delivery:', error);
      throw error;
    }
  },

  // Multi-agent workflow
  triggerAgentWorkflow: async (workflowData) => {
    try {
      const response = await api.post('/agent-workflow', workflowData);
      return response.data;
    } catch (error) {
      console.error('Error triggering agent workflow:', error);
      throw error;
    }
  },

  // Real-time data subscription
  subscribeToRealTimeUpdates: (callback) => {
    const socketInstance = getSocket();
    
    socketInstance.on('data_update', (data) => {
      callback(data);
    });

    return () => {
      socketInstance.off('data_update');
    };
  },

  // Driver tracking
  subscribeToDriverTracking: (callback) => {
    const socketInstance = getSocket();
    
    socketInstance.on('driver_tracking', (data) => {
      callback(data);
    });

    return () => {
      socketInstance.off('driver_tracking');
    };
  },

  // Order updates
  subscribeToOrderUpdates: (callback) => {
    const socketInstance = getSocket();
    
    socketInstance.on('order_updates', (data) => {
      callback(data);
    });

    return () => {
      socketInstance.off('order_updates');
    };
  },

  // Route updates
  subscribeToRouteUpdates: (callback) => {
    const socketInstance = getSocket();
    
    socketInstance.on('route_updates', (data) => {
      callback(data);
    });

    return () => {
      socketInstance.off('route_updates');
    };
  }
};

// Request interceptor for adding auth token if needed
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // Server responded with error status
      console.error('API Error:', error.response.status, error.response.data);
    } else if (error.request) {
      // Request was made but no response received
      console.error('Network Error:', error.request);
    } else {
      // Something else happened
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;