import { config } from "../../../config";
import { ConsumerConfig, Kafka, Producer, ProducerConfig } from "kafkajs";

const kafka = new Kafka({
  clientId: config.kafka.clientId,
  brokers: config.kafka.brokers,
  ssl: config.kafka.ssl,
  //   sasl: config.kafka.sals.username ? config.kafka.sals : undefined,
});

export const createProducer = (config?: ProducerConfig): Producer => {
  return kafka.producer({
    idempotent: true,
    maxInFlightRequests: 5,
    ...config,
  });
};

export const createConsumer = (groupId: string, config?: ConsumerConfig) => {
  return kafka.consumer({
    groupId,
    sessionTimeout: 30000,
    rebalanceTimeout: 60000,
    heartbeatInterval: 10000,
    ...config,
  });
};

export default kafka;
