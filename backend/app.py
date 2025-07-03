from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import pika
import json
import threading
import time
import os
from datetime import datetime
import uuid
from pyspark.sql import SparkSession
from pyspark.sql.functions import *
from pyspark.sql.types import *
import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# Initialize Spark Session
spark = SparkSession.builder \
    .appName("WalmartDeliveryOptimization") \
    .config("spark.sql.adaptive.enabled", "true") \
    .config("spark.sql.adaptive.coalescePartitions.enabled", "true") \
    .getOrCreate()

# RabbitMQ Configuration
RABBITMQ_HOST = os.getenv('RABBITMQ_HOST', 'localhost')
RABBITMQ_PORT = int(os.getenv('RABBITMQ_PORT', 5672))
RABBITMQ_USER = os.getenv('RABBITMQ_USER', 'admin')
RABBITMQ_PASS = os.getenv('RABBITMQ_PASS', 'admin123')

# Global variables for storing processed data
delivery_data = {
    'orders': [],
    'clusters': [],
    'routes': [],
    'drivers': [],
    'stats': {},
    'tracking': {}
}

class DeliveryOptimizer:
    def __init__(self):
        self.scaler = StandardScaler()
        
    def cluster_orders(self, orders_df):
        """Cluster orders based on location and time windows"""
        if len(orders_df) < 2:
            return orders_df
            
        # Prepare features for clustering
        features = orders_df[['latitude', 'longitude', 'delivery_time_numeric']].values
        
        # Determine optimal number of clusters
        n_clusters = min(8, max(2, len(orders_df) // 6))
        
        # Perform clustering
        kmeans = KMeans(n_clusters=n_clusters, random_state=42)
        clusters = kmeans.fit_predict(features)
        
        orders_df['cluster_id'] = clusters
        return orders_df
    
    def optimize_routes(self, clustered_orders):
        """Optimize routes using Spark for parallel processing"""
        # Convert to Spark DataFrame
        spark_df = spark.createDataFrame(clustered_orders)
        
        # Group by cluster and calculate route metrics
        route_metrics = spark_df.groupBy('cluster_id').agg(
            count('order_id').alias('order_count'),
            avg('latitude').alias('centroid_lat'),
            avg('longitude').alias('centroid_lon'),
            sum('volume').alias('total_volume'),
            sum('weight').alias('total_weight'),
            collect_list('order_id').alias('order_ids')
        ).collect()
        
        optimized_routes = []
        for route in route_metrics:
            route_dict = {
                'cluster_id': f"CLU-{route['cluster_id']:02d}",
                'centroid_lat': route['centroid_lat'],
                'centroid_lon': route['centroid_lon'],
                'order_count': route['order_count'],
                'total_volume': route['total_volume'],
                'total_weight': route['total_weight'],
                'order_ids': route['order_ids'],
                'estimated_duration': self.calculate_route_duration(route),
                'time_window': self.assign_time_window(route)
            }
            optimized_routes.append(route_dict)
        
        return optimized_routes
    
    def calculate_route_duration(self, route):
        """Calculate estimated route duration"""
        base_time = 30  # Base time in minutes
        time_per_order = 8  # Minutes per order
        distance_factor = route['total_volume'] * 2  # Volume impact
        
        return int(base_time + (route['order_count'] * time_per_order) + distance_factor)
    
    def assign_time_window(self, route):
        """Assign optimal time window based on route characteristics"""
        time_windows = [
            '09:00-11:00', '11:00-13:00', '13:00-15:00',
            '15:00-17:00', '17:00-19:00', '19:00-21:00'
        ]
        
        # Simple assignment based on cluster_id
        return time_windows[route['cluster_id'] % len(time_windows)]

optimizer = DeliveryOptimizer()

def get_rabbitmq_connection():
    """Establish RabbitMQ connection"""
    try:
        credentials = pika.PlainCredentials(RABBITMQ_USER, RABBITMQ_PASS)
        connection = pika.BlockingConnection(
            pika.ConnectionParameters(host=RABBITMQ_HOST, port=RABBITMQ_PORT, credentials=credentials)
        )
        return connection
    except Exception as e:
        print(f"Failed to connect to RabbitMQ: {e}")
        return None

def setup_rabbitmq_queues():
    """Setup RabbitMQ queues"""
    connection = get_rabbitmq_connection()
    if connection:
        channel = connection.channel()
        
        # Declare queues
        channel.queue_declare(queue='order_data', durable=True)
        channel.queue_declare(queue='route_optimization', durable=True)
        channel.queue_declare(queue='driver_updates', durable=True)
        channel.queue_declare(queue='tracking_updates', durable=True)
        
        connection.close()

def consume_order_data():
    """Consume order data from RabbitMQ"""
    connection = get_rabbitmq_connection()
    if not connection:
        return
        
    channel = connection.channel()
    
    def process_order_data(ch, method, properties, body):
        try:
            data = json.loads(body)
            
            # Process orders with Spark
            if 'orders' in data:
                orders_df = pd.DataFrame(data['orders'])
                
                # Add time numeric representation for clustering
                time_mapping = {
                    '09:00-11:00': 1, '11:00-13:00': 2, '13:00-15:00': 3,
                    '15:00-17:00': 4, '17:00-19:00': 5, '19:00-21:00': 6
                }
                orders_df['delivery_time_numeric'] = orders_df['delivery_time_slot'].map(time_mapping)
                
                # Cluster orders
                clustered_orders = optimizer.cluster_orders(orders_df)
                
                # Optimize routes
                optimized_routes = optimizer.optimize_routes(clustered_orders)
                
                # Update global data
                delivery_data['orders'] = clustered_orders.to_dict('records')
                delivery_data['clusters'] = optimized_routes
                
                # Emit real-time updates
                socketio.emit('data_update', {
                    'type': 'orders_processed',
                    'data': delivery_data
                })
                
                print(f"Processed {len(orders_df)} orders into {len(optimized_routes)} routes")
            
            ch.basic_ack(delivery_tag=method.delivery_tag)
            
        except Exception as e:
            print(f"Error processing order data: {e}")
            ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)
    
    channel.basic_consume(queue='order_data', on_message_callback=process_order_data)
    
    print("Starting to consume order data...")
    channel.start_consuming()

def consume_driver_updates():
    """Consume driver updates from RabbitMQ"""
    connection = get_rabbitmq_connection()
    if not connection:
        return
        
    channel = connection.channel()
    
    def process_driver_update(ch, method, properties, body):
        try:
            data = json.loads(body)
            
            if 'drivers' in data:
                delivery_data['drivers'] = data['drivers']
                
                # Calculate stats
                delivery_data['stats'] = {
                    'total_drivers': len(data['drivers']),
                    'available_drivers': len([d for d in data['drivers'] if d['status'] == 'Available']),
                    'active_routes': len([d for d in data['drivers'] if d['status'] == 'On Route']),
                    'pending_orders': len([o for o in delivery_data['orders'] if o.get('status') == 'Pending']),
                    'completed_deliveries': np.random.randint(200, 300),
                    'avg_delivery_time': np.random.randint(25, 35),
                    'efficiency_score': np.random.randint(80, 95)
                }
                
                # Emit real-time updates
                socketio.emit('data_update', {
                    'type': 'driver_update',
                    'data': delivery_data
                })
            
            ch.basic_ack(delivery_tag=method.delivery_tag)
            
        except Exception as e:
            print(f"Error processing driver update: {e}")
            ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)
    
    channel.basic_consume(queue='driver_updates', on_message_callback=process_driver_update)
    channel.start_consuming()

# API Routes
@app.route('/api/dashboard-data', methods=['GET'])
def get_dashboard_data():
    """Get current dashboard data"""
    return jsonify(delivery_data)

@app.route('/api/optimize-routes', methods=['POST'])
def optimize_routes():
    """Trigger route optimization"""
    try:
        data = request.json
        
        # Send to RabbitMQ for processing
        connection = get_rabbitmq_connection()
        if connection:
            channel = connection.channel()
            
            message = {
                'type': 'route_optimization',
                'data': data,
                'timestamp': datetime.now().isoformat()
            }
            
            channel.basic_publish(
                exchange='',
                routing_key='route_optimization',
                body=json.dumps(message),
                properties=pika.BasicProperties(delivery_mode=2)
            )
            
            connection.close()
            
            return jsonify({'status': 'success', 'message': 'Route optimization queued'})
        else:
            return jsonify({'status': 'error', 'message': 'Failed to connect to message queue'}), 500
            
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/multi-hop-delivery', methods=['POST'])
def multi_hop_delivery():
    """Handle multi-hop delivery planning"""
    try:
        data = request.json
        
        # Process with Spark
        packages = data.get('packages', 5)
        priority = data.get('priority', 'time')
        algorithm = data.get('algorithm', 'astar')
        
        # Generate mock network data
        network_data = {
            'nodes': [
                {'id': 'warehouse', 'type': 'warehouse', 'x': 50, 'y': 250},
                {'id': 'hub1', 'type': 'hub', 'x': 200, 'y': 150},
                {'id': 'hub2', 'type': 'hub', 'x': 200, 'y': 350},
            ],
            'packages': packages,
            'optimized_routes': [],
            'total_cost': np.random.uniform(50, 150),
            'total_time': np.random.uniform(2, 8),
            'total_distance': np.random.uniform(20, 100)
        }
        
        # Add customer nodes
        for i in range(min(packages, 10)):
            network_data['nodes'].append({
                'id': f'customer{i+1}',
                'type': 'customer',
                'x': 500 + (i % 4) * 80,
                'y': 80 + (i // 4) * 70
            })
        
        return jsonify({
            'status': 'success',
            'network': network_data,
            'algorithm': algorithm,
            'priority': priority
        })
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/agent-workflow', methods=['POST'])
def trigger_agent_workflow():
    """Trigger multi-agent workflow"""
    try:
        data = request.json
        
        # Send to RabbitMQ for agent processing
        connection = get_rabbitmq_connection()
        if connection:
            channel = connection.channel()
            
            message = {
                'type': 'agent_workflow',
                'workflow_type': data.get('workflow_type', 'delivery_planning'),
                'data': data,
                'timestamp': datetime.now().isoformat()
            }
            
            channel.basic_publish(
                exchange='',
                routing_key='agent_workflow',
                body=json.dumps(message),
                properties=pika.BasicProperties(delivery_mode=2)
            )
            
            connection.close()
            
            return jsonify({'status': 'success', 'message': 'Agent workflow triggered'})
        else:
            return jsonify({'status': 'error', 'message': 'Failed to connect to message queue'}), 500
            
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@socketio.on('connect')
def handle_connect():
    """Handle client connection"""
    print('Client connected')
    emit('connected', {'data': 'Connected to Walmart Delivery Optimization'})

@socketio.on('disconnect')
def handle_disconnect():
    """Handle client disconnection"""
    print('Client disconnected')

def start_rabbitmq_consumers():
    """Start RabbitMQ consumers in separate threads"""
    
    def consumer_thread(consumer_func):
        while True:
            try:
                consumer_func()
            except Exception as e:
                print(f"Consumer error: {e}")
                time.sleep(5)  # Wait before retrying
    
    # Start consumers
    threading.Thread(target=consumer_thread, args=(consume_order_data,), daemon=True).start()
    threading.Thread(target=consumer_thread, args=(consume_driver_updates,), daemon=True).start()

if __name__ == '__main__':
    # Setup RabbitMQ
    setup_rabbitmq_queues()
    
    # Start RabbitMQ consumers
    start_rabbitmq_consumers()
    
    # Start Flask app
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)