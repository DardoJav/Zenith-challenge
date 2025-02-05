import { redisClient } from '../config/redis.js';
import { OrderRepository } from '../repositories/OrderRepository.js';
import { getChannel } from '../config/rabbitmq.js';
import { elasticsearchClient } from '../config/elasticsearch.js';

const CACHE_EXPIRATION = 3600;

export class OrderService {
  constructor() {
    this.orderRepository = new OrderRepository();
  }

  async createOrder(orderData) {
    try {
      if (!orderData.userId || !Array.isArray(orderData.products) || orderData.products.length === 0) {
        throw new Error('Invalid order data.');
      }

      orderData.products.forEach(product => {
        if (!product.productId || typeof product.quantity !== 'number' || product.quantity <= 0) {
          throw new Error('Each product must have a valid productId and a quantity greater than 0.');
        }
      });

      orderData.status = 'PENDING';
      const newOrder = await this.orderRepository.create(orderData);

      await redisClient.set(`order:${newOrder._id}`, JSON.stringify(newOrder), 'EX', CACHE_EXPIRATION);

      try {
        const channel = getChannel();
        if (channel) {
          await channel.sendToQueue('orders', Buffer.from(newOrder._id.toString()));
        }
      } catch (err) {
        console.error('Error sending command to RabbitMQ:', err.message);
      }

      return newOrder;
    } catch (error) {
      console.error('Error creating the order:', error.message);
      throw error;
    }
  }

  async getOrderById(orderId) {
    try {
      const cachedOrder = await redisClient.get(`order:${orderId}`);
      if (cachedOrder) return JSON.parse(cachedOrder);
      
      const order = await this.orderRepository.findById(orderId);
      
      await redisClient.set(`order:${orderId}`, JSON.stringify(order), 'EX', CACHE_EXPIRATION);
      
      return order;
    } catch (error) {
      console.error('Error trying to get the order:', error.message);
      throw error;
    }
  }

  async getOrderLogsById(orderId) {
    try {
      const { hits } = await elasticsearchClient.search({
        index: 'order_logs',
        body: {
          query: { match: { orderId } },
        },
      });

      return hits.hits.map(hit => hit._source);
    } catch (error) {
      console.error(`Error getting logs for order ${orderId}:`, error.message);
      throw new Error('Could not obtain order logs.');
    }
  }
}