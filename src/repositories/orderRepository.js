import order from '../models/order.js';

export class OrderRepository {
  async create(orderData) {
    try {
      const newOrder = new order(orderData);
      return await newOrder.save();
    } catch (error) {
      console.error('Error creating order in MongoDB:', error.message);
      throw new Error('Error saving order to MongoDB.');
    }
  }

  async findById(orderId) {
    try {
      const result = await order.findById(orderId);
      if (!result) throw new Error('Order not found.');
      return result;
    } catch (error) {
      console.error('Error searching the order in MongoDB:', error.message);
      throw new Error('Error retrieving order from MongoDB.');
    }
  }

  async updateById(orderId, updateData) {
    try {
      const updatedOrder = await order.findByIdAndUpdate(orderId, updateData, { new: true });
      if (!updatedOrder) throw new Error('Order not found.');
      return updatedOrder;
    } catch (error) {
      console.error(`Error updating order ${orderId} in MongoDB:`, error.message);
      throw new Error('Error updating order in MonogoDB.');
    }
  }
}