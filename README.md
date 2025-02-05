# Order Management System

## Objective

This project is a backend application developed using Node.js that manages an order system and processes events asynchronously. The system exposes RESTful endpoints and is fully functional and testable via Postman or using the Swagger exposed in this document.

## Overview

The application provides an API for managing orders, handling asynchronous processing via RabbitMQ, caching recent orders using Redis, storing order data in MongoDB, and logging events in Elasticsearch.

## Architecture

- The system follows a microservices-inspired architecture using multiple technologies:
    - MongoDB: Stores order details and statuses.
    - Redis: Caches recent orders for fast retrieval.
    - RabbitMQ: Manages asynchronous event processing.
    - Elasticsearch: Stores logs for order processing tracking.
    - Express.js: Handles API requests and responses.

- The API is structured into the following layers:
    - Controller: Handles HTTP requests and responses.
    - Service: Contains the business logic.
    - Repository: Interacts with the database using Mongoose.
    - Worker: Processes asynchronous tasks using RabbitMQ.

## Implementation Details
### Order processing worker:
- A RabbitMQ consumer processes orders asynchronously.
- The order status is updated to PROCESSING and then set to either COMPLETED or FAILED.
- Logs are stored in Elasticsearch for tracking.

### Layers:
**Controller Layer**
- Handles HTTP requests.
- Validates inputs and manages responses.
**Service Layer**
- Business logic for order management.
- Delegates database operations to the repository.
- Communicates with the worker for asynchronous processing.
**Repository Layer**
- Direct interaction with the database using Mongoose.
- Executes queries and applies optimizations.
**Worker Layer**
- Processes background jobs using RabbitMQ.
- Handles tasks such as indexing orders in Elasticsearch.

## API Documentation

### 1. Create an Order
- **Endpoint:** POST /api/orders
- **Request Body:** 
```
{
  "userId": "12345",
  "products": [
    { "productId": "p1", "quantity": 2 },
    { "productId": "p2", "quantity": 1 }
  ]
}
```
- **Response:**
```
{
  "orderId": "o123",
  "status": "PENDING"
}
```
- **Action:**
    - Saves the order in MongoDB with status **PENDING**.
    - Publishes a message to RabbitMQ for further processing.

### 2. Retrieve an Order
- **Endpoint:** GET /api/orders/:orderId
- **Response:** 
```
{
  "orderId": "o123",
  "userId": "12345",
  "products": [
    { "productId": "p1", "quantity": 2 },
    { "productId": "p2", "quantity": 1 }
  ],
  "status": "COMPLETED"
}
```
- **Action:**
    - Checks Redis cache for the order.
    - If not found, fetches it from MongoDB and caches it in Redis.

### 3. Retrieve Order Logs
- **Endpoint:** GET /api/logs/orders/:orderId
- **Response:** 
```
[
  {
    "orderId": "o123",
    "status": "PROCESSING",
    "timestamp": "2024-01-01T12:00:00Z"
  },
  {
    "orderId": "o123",
    "status": "COMPLETED",
    "timestamp": "2024-01-01T12:05:00Z"
  }
]
```
- **Action:**
    - Retrieves logs from Elasticsearch for debugging and tracking.

## Error Handling
- **validations:**
    - Ensures consistent error messages.
    - Logs errors for debugging.
    - Uses structured error handling at each layer.
- **Code responses:**
    - Validation Errors: Invalid input data returns a 400 Bad Request response.
    - Database Errors: Issues with MongoDB or Redis return a 500 Internal Server Error.
    - Not Found: If an order does not exist, a 404 Not Found response is returned

## Performance Optimization
- Uses Redis caching to reduce database queries.
- Implements asynchronous processing with RabbitMQ to improve system responsiveness.
- Uses Elasticsearch for efficient log searching and debugging.

## How to run locally

### Prerequisites
- Install Docker and Docker Compose.
- Clone the repository:
```
git clone https://github.com/DardoJav/Zenith-challenge.git
```
- Create a .env file with:
```
MONGO_URI=mongodb://mongo:27017/ordersdb
REDIS_HOST=redis
RABBITMQ_URL=amqp://rabbitmq
ELASTICSEARCH_URL=http://elasticsearch:9200
```

### Running with Docker
- Start the application:
```
docker-compose up --build
```
- The API will be available at **http://localhost:3000**
- Additional commands:
    - Shut down all the volumes/services running: *docker-compose down --volumes*
    - Remove and delete all the volumes/services: *docker-compose down --volumes --rmi all*

### Running Locally without Docker
1. Install dependencies:
```
npm install
```
2. Start MongoDB, Redis, RabbitMQ, and Elasticsearch manually.
3. Run the application:
```
npm start
```

## Swagger URL for testing after deploy and connection to Mongo Database
- After deploy process is complete, will be expossed a Swagger doc to test the different endpoints:
[SWAGGER LINK](http://localhost:3000/api-docs/#)
- To check the database data in testing process, you can use MongoDB Compass and connect to **mongodb://localhost:27017**

### Environment Variables
- MONGO_URI: MongoDB connection string
- REDIS_HOST: Redis host address
- RABBITMQ_URL: RabbitMQ connection URL
- ELASTICSEARCH_URL: Elasticsearch connection URL
