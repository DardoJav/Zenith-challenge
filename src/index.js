import dotenv from 'dotenv';
import express from 'express';
import orderRoutes from './routes/orderRoutes.js';
import { connectDB }from './config/database.js';
import { connectRabbitMQ } from './config/rabbitmq.js';
import { elasticsearchClient } from './config/elasticsearch.js';
import { OrderWorker } from './workers/OrderWorker.js';
import { errorHandler } from './middlewares/errorHandler.js';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();

const swaggerDocument = YAML.load(resolve(__dirname, './docs/swagger.yml'));

app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/api', orderRoutes);
app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDB();

    await connectRabbitMQ();

    await elasticsearchClient.ping();

    const orderWorker = new OrderWorker();
    await orderWorker.processOrders();

    const PORT = process.env.PORT || 3000;

    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

  } catch (error) {
    console.error('Error starting the application:', error.message);
    process.exit(1);
  }
};

startServer();