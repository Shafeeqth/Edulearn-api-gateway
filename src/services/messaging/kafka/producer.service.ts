import { LoggingService } from "@mdshafeeq-repo/edulearn-common";
import { IMessageProducer } from "../interfaces/producer.interface";
import { createProducer } from "./kafka.config";
import { EventMetadata, EventPayload } from "../types/event.type";

const logger = new LoggingService("api-gateway");

export class KafkaProducerService implements IMessageProducer {
  private producer = createProducer();

  async connect(): Promise<void> {
    try {
      await this.producer.connect();
      logger.logInfo("Kafka producer connected successfully");
    } catch (error) {
      logger.logError("Failed to connect to Kafka producer :)", {
        error,
      });
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.producer.disconnect();
      logger.logInfo("Kafka producer disconnected successfully");
    } catch (error) {
      logger.logError("Failed to disconnect Kafka producer :)", { error });
    }
  }

  async publish<T extends EventPayload>(
    topic: string,
    payload: T,
    metadata: EventMetadata
  ): Promise<void> {
    try {
      await this.producer.send({
        topic,
        messages: [
          {
            key: metadata.correlationId || "none",
            value: JSON.stringify({
              payload,
              metadata: {
                ...metadata,
                timestamp: new Date().toISOString(),
                source: "edulearn-api-gateway",
              },
            }),
            headers: {
              "event-type": payload.eventType,
              "content-type": "application/json",
            },
          },
        ],
      });

      logger.logInfo(`Published event to ${topic}`, {
        eventType: payload.eventType,
        correlationId: metadata.correlationId,
      });
    } catch (error) {
      logger.logError(`Failed to publish event to ${topic}:`, { error });
      throw error;
    }
  }
}
