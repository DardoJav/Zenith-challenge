import { getChannel } from '../config/rabbitmq.js';
import { OrderRepository } from '../repositories/OrderRepository.js';
import { elasticsearchClient } from '../config/elasticsearch.js';
import { redisClient } from '../config/redis.js';

export class OrderWorker {
  constructor() {
    this.orderRepository = new OrderRepository();
  }

  async processOrders() {
    const channel = getChannel();
    await channel.assertQueue('orders', { durable: true });

    channel.consume('orders', async (msg) => {
      if (msg) {
        const orderId = msg.content.toString();
        try {
          const order = await this.orderRepository.updateById(orderId, { status: 'PROCESSING' });

          if (order) {
            order.status = 'PROCESSING';
            await redisClient.set(`order:${orderId}`, JSON.stringify(order), 'EX', 3600);
          }       

          await new Promise(resolve => setTimeout(resolve, 5000));

          const newStatus = Math.random() > 0.5 ? 'COMPLETED' : 'FAILED';
          const updatedOrder = await this.orderRepository.updateById(orderId, { status: newStatus });

          if (updatedOrder) {
            await redisClient.set(`order:${orderId}`, JSON.stringify(updatedOrder), 'EX', 3600);
          }

          await elasticsearchClient.index({
            index: 'order_logs',
            body: {
              orderId,
              status: newStatus,
              timestamp: new Date(),
            },
          });

          channel.ack(msg);
        } catch (err) {
          console.error(`Error processing order ${orderId}:`, err.message);

          await elasticsearchClient.index({
            index: 'order_logs',
            body: {
              orderId,
              status: 'ERROR',
              error: err.message,
              timestamp: new Date(),
            },
          });

          channel.nack(msg, false, true);
        }
      }
    });
  }
}
