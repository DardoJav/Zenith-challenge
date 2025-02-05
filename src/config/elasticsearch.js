import { Client } from '@elastic/elasticsearch';

const client = new Client({ node: process.env.ELASTICSEARCH_URL });

client.ping()
  .then(() => console.log('Connection to Elasticsearch successful'))
  .catch((err) => {
    console.error('Error connecting to Elasticsearch:', err.message);
    process.exit(1);
  });

export const elasticsearchClient = client;