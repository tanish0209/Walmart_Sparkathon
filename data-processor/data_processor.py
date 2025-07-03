import pika
import json
import time
import threading
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import os
import random
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler

# RabbitMQ Configuration
RABBITMQ_HOST = os.getenv('RABBITMQ_HOST', 'localhost')
RABBITMQ_PORT = int(os.getenv('RABBITMQ_PORT', 5672))
RABBITMQ_USER = os.getenv('RABBITMQ_USER', 'admin')
RABBITMQ_PASS = os.getenv('RABBITMQ_PASS', 'admin123')

class DeliveryDataProcessor:
    def __init__(self):
        self.scaler = StandardScaler()
        self.connection = None
        self.channel = None
        self.setup_connection()
        
    def setup_connection(self):
        """Setup RabbitMQ connection"""
        try:
            credentials = pika.PlainCredentials(RABBITMQ_USER, RABBITMQ_PASS)
            self.connection = pika.BlockingConnection(
                pika.ConnectionParameters(host=RABBITMQ_HOST, port=RABBITMQ_PORT, credentials=credentials)
            )
            self.channel = self.connection.channel()
            
            # Declare queues
            self.channel.queue_declare(queue='order_data', durable=True)
            self.channel.queue_declare(queue='driver_updates', durable=True)
            self.channel.queue_declare(queue='tracking_updates', durable=True)
            self.channel.queue_declare(queue='route_optimization', durable=True)
            self.channel.queue_declare(queue='agent_workflow', durable=True)
            
            print("Connected to RabbitMQ successfully")
            
        except Exception as e:
            print(f"Failed to connect to RabbitMQ: {e}")
            
    def generate_order_data(self, num_orders=50):
        """Generate realistic order data"""
        time_slots = ['09:00-11:00', '11:00-13:00', '13:00-15:00', '15:00-17:00', '17:00-19:00', '19:00-21:00']
        package_sizes = ['Small', 'Medium', 'Large']
        priorities = ['High', 'Medium', 'Low']
        statuses = ['Pending', 'Assigned', 'In Transit', 'Delivered']
        
        orders = []
        for i in range(num_orders):
            order = {
                'order_id': f'ORD-{str(i + 1).zfill(3)}',
                'latitude': 40.7589 + (random.random() - 0.5) * 0.1,
                'longitude': -73.9851 + (random.random() - 0.5) * 0.1,
                'delivery_time_slot': random.choice(time_slots),
                'package_size': random.choice(package_sizes),
                'priority': random.choice(priorities),
                'volume': random.uniform(0.1, 0.6),
                'weight': random.uniform(1, 11),
                'status': random.choice(statuses),
                'created_at': datetime.now().isoformat(),
                'customer_id': f'CUST-{random.randint(1000, 9999)}',
                'delivery_address': f'{random.randint(100, 999)} Main St, New York, NY',
                'phone': f'+1-{random.randint(100, 999)}-{random.randint(100, 999)}-{random.randint(1000, 9999)}'
            }
            orders.append(order)
        
        return orders
    
    def generate_driver_data(self, num_drivers=10):
        """Generate realistic driver data"""
        driver_names = [
            'Alice Johnson', 'Bob Smith', 'Carol Brown', 'David Wilson', 
            'Eva Davis', 'Frank Miller', 'Grace Lee', 'Henry Chen', 
            'Iris Garcia', 'Jack Taylor'
        ]
        
        vehicle_types = ['Van', 'Truck', 'Motorcycle']
        statuses = ['Available', 'On Route', 'Break', 'Offline']
        
        drivers = []
        for i in range(num_drivers):
            driver = {
                'driver_id': f'DRV-{str(i + 1).zfill(2)}',
                'name': driver_names[i],
                'status': random.choice(statuses),
                'current_load_volume': random.uniform(0, 8),
                'vehicle_capacity_volume': 10,
                'current_load_weight': random.uniform(0, 800),
                'vehicle_capacity_weight': 1000,
                'deliveries_today': random.randint(0, 15),
                'rating': round(random.uniform(4.0, 5.0), 1),
                'vehicle_type': random.choice(vehicle_types),
                'current_location': {
                    'latitude': 40.7589 + (random.random() - 0.5) * 0.1,
                    'longitude': -73.9851 + (random.random() - 0.5) * 0.1
                },
                'last_update': datetime.now().isoformat(),
                'phone': f'+1-{random.randint(100, 999)}-{random.randint(100, 999)}-{random.randint(1000, 9999)}'
            }
            drivers.append(driver)
        
        return drivers
    
    def generate_tracking_data(self, active_routes):
        """Generate real-time tracking data"""
        tracking_data = {}
        
        for route in active_routes:
            if route['status'] == 'Active':
                tracking_data[route['route_id']] = {
                    'route_id': route['route_id'],
                    'driver_id': route['driver_id'],
                    'current_latitude': 40.7589 + (random.random() - 0.5) * 0.1,
                    'current_longitude': -73.9851 + (random.random() - 0.5) * 0.1,
                    'progress': random.random(),
                    'status': 'In Transit',
                    'next_delivery': f'ORD-{str(random.randint(1, 50)).zfill(3)}',
                    'eta': (datetime.now() + timedelta(minutes=random.randint(10, 120))).strftime('%H:%M'),
                    'speed': random.uniform(15, 45),  # km/h
                    'fuel_level': random.uniform(0.2, 1.0),
                    'temperature': random.uniform(-5, 35),  # Celsius
                    'last_update': datetime.now().isoformat()
                }
        
        return tracking_data
    
    def publish_order_data(self):
        """Publish order data to RabbitMQ"""
        try:
            orders = self.generate_order_data(random.randint(30, 70))
            
            message = {
                'type': 'order_batch',
                'orders': orders,
                'timestamp': datetime.now().isoformat(),
                'batch_id': f'BATCH-{int(time.time())}'
            }
            
            self.channel.basic_publish(
                exchange='',
                routing_key='order_data',
                body=json.dumps(message),
                properties=pika.BasicProperties(delivery_mode=2)
            )
            
            print(f"Published {len(orders)} orders to queue")
            
        except Exception as e:
            print(f"Error publishing order data: {e}")
    
    def publish_driver_updates(self):
        """Publish driver updates to RabbitMQ"""
        try:
            drivers = self.generate_driver_data()
            
            message = {
                'type': 'driver_status_update',
                'drivers': drivers,
                'timestamp': datetime.now().isoformat()
            }
            
            self.channel.basic_publish(
                exchange='',
                routing_key='driver_updates',
                body=json.dumps(message),
                properties=pika.BasicProperties(delivery_mode=2)
            )
            
            print(f"Published {len(drivers)} driver updates to queue")
            
        except Exception as e:
            print(f"Error publishing driver updates: {e}")
    
    def publish_tracking_updates(self):
        """Publish tracking updates to RabbitMQ"""
        try:
            # Generate mock active routes
            active_routes = [
                {'route_id': f'RTE-{str(i+1).zfill(2)}', 'driver_id': f'DRV-{str(i+1).zfill(2)}', 'status': 'Active'}
                for i in range(random.randint(3, 6))
            ]
            
            tracking_data = self.generate_tracking_data(active_routes)
            
            message = {
                'type': 'tracking_update',
                'tracking_data': tracking_data,
                'timestamp': datetime.now().isoformat()
            }
            
            self.channel.basic_publish(
                exchange='',
                routing_key='tracking_updates',
                body=json.dumps(message),
                properties=pika.BasicProperties(delivery_mode=2)
            )
            
            print(f"Published tracking updates for {len(tracking_data)} routes")
            
        except Exception as e:
            print(f"Error publishing tracking updates: {e}")
    
    def simulate_real_time_data(self):
        """Simulate real-time data generation"""
        print("Starting real-time data simulation...")
        
        # Initial data burst
        self.publish_order_data()
        self.publish_driver_updates()
        
        # Continuous updates
        while True:
            try:
                # Publish updates at different intervals
                current_time = datetime.now()
                
                # Order data every 30 seconds
                if current_time.second % 30 == 0:
                    self.publish_order_data()
                
                # Driver updates every 15 seconds
                if current_time.second % 15 == 0:
                    self.publish_driver_updates()
                
                # Tracking updates every 10 seconds
                if current_time.second % 10 == 0:
                    self.publish_tracking_updates()
                
                time.sleep(1)
                
            except KeyboardInterrupt:
                print("Stopping data simulation...")
                break
            except Exception as e:
                print(f"Error in simulation loop: {e}")
                time.sleep(5)
    
    def process_agent_workflow(self):
        """Process agent workflow requests"""
        def workflow_callback(ch, method, properties, body):
            try:
                data = json.loads(body)
                workflow_type = data.get('workflow_type', 'delivery_planning')
                
                print(f"Processing agent workflow: {workflow_type}")
                
                # Simulate agent processing time
                time.sleep(random.uniform(2, 5))
                
                # Generate agent workflow results
                workflow_results = {
                    'workflow_id': f'WF-{int(time.time())}',
                    'type': workflow_type,
                    'status': 'completed',
                    'results': {
                        'planner_agent': 'Route planning completed',
                        'cx_agent': 'Customer notifications sent',
                        'route_optimizer': 'Routes optimized for efficiency',
                        'driver_support': 'Driver briefings completed',
                        'esg_agent': 'Environmental impact minimized',
                        'incident_handler': 'Monitoring active'
                    },
                    'timestamp': datetime.now().isoformat()
                }
                
                print(f"Completed workflow: {workflow_type}")
                ch.basic_ack(delivery_tag=method.delivery_tag)
                
            except Exception as e:
                print(f"Error processing workflow: {e}")
                ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)
        
        self.channel.basic_consume(queue='agent_workflow', on_message_callback=workflow_callback)
        print("Started agent workflow processor")
        self.channel.start_consuming()
    
    def close_connection(self):
        """Close RabbitMQ connection"""
        if self.connection and not self.connection.is_closed:
            self.connection.close()
            print("RabbitMQ connection closed")

def main():
    processor = DeliveryDataProcessor()
    
    try:
        # Start workflow processor in a separate thread
        workflow_thread = threading.Thread(target=processor.process_agent_workflow, daemon=True)
        workflow_thread.start()
        
        # Start real-time data simulation
        processor.simulate_real_time_data()
        
    except KeyboardInterrupt:
        print("Shutting down data processor...")
    finally:
        processor.close_connection()

if __name__ == "__main__":
    main()