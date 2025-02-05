import { connect } from 'amqplib';

let channel;

export const connectRabbitMQ = async () => {
  try {
    const connection = await connect(process.env.RABBITMQ_URL);
    channel = await connection.createChannel();
    console.log('Connection to RabbitMQ successful');
  } catch (err) {
    console.error('Error connecting to RabbitMQ:', err.message);
    process.exit(1);
  }
};

export const getChannel = () => channel;