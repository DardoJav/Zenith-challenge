  import order from '../models/order.js';
  import { OrderService } from '../services/OrderService.js';

  export class OrderController {
    constructor() {
      this.orderService = new OrderService();
    }
  
    createOrder = async (req, res, next) => {
      try {
        const { userId, products } = req.body;
  
        if (!userId || !Array.isArray(products) || products.length === 0) {
          return res.status(400).json({ message: 'Invalid data. userId and at least one product are required.' });
        }
        const newOrder = new order({ userId, products });
  
        const orderResult = await this.orderService.createOrder(newOrder);
    
        return res.status(201).json({ orderId: orderResult._id, status: 'PENDING' });
      } catch (error) {
        next(error);
      }
    };
  
    getOrder = async (req, res) => {
      try {
        const order = await this.orderService.getOrderById(req.params.orderId);
        return res.status(200).json(order);
      } catch (error) {
        res.status(404).json({ message: error.message });
      }
    };
  
    getOrderLogs = async (req, res) => {
      try {
        const logs = await this.orderService.getOrderLogsById(req.params.orderId);
        res.status(200).json(logs);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    };
  }