import { Router } from 'express';
// import { createOrder, getOrder, getOrderLogs } from '../controllers/orderController.js';
import { OrderController } from '../controllers/OrderController.js';

const orderRoutes = Router();
const orderController = new OrderController();

orderRoutes.post('/orders', orderController.createOrder);
orderRoutes.get('/orders/:orderId', orderController.getOrder);
orderRoutes.get('/logs/orders/:orderId', orderController.getOrderLogs);

export default orderRoutes;