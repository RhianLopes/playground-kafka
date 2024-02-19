const express = require('express');
const bodyParser = require('body-parser');
const { Kafka } = require('kafkajs');

const app = express();
const port = 3000;

app.use(bodyParser.json());

const brokers = process.env.KAFKA_BROKERS ? process.env.KAFKA_BROKERS.split(',') : [];

const kafka = new Kafka({
  clientId: process.env.KAFKA_CONSUMER_GROUP,
  brokers: brokers,
  sasl: {
    mechanism: 'plain',
    username: process.env.KAFKA_USER,
    password: process.env.KAFKA_SECRET,
  },
});

const consumer = kafka.consumer({ groupId: process.env.KAFKA_CONSUMER_GROUP });

const runConsumer = async () => {
  await consumer.connect();

  await consumer.subscribe({ topic: process.env.KAFKA_TOPIC });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log({
        value: message.value.toString(),
        key: message.key.toString(),
        topic,
        partition,
        offset: message.offset,
      });
    },
  });
};

runConsumer().catch(console.error);

app.get('/health', async (req, res) => {
  res.status(200).send('Running...');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
