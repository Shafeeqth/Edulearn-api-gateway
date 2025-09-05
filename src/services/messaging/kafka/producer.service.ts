import { IMessageProducer } from "../interfaces/producer.interface";
import { createProducer } from "./kafka.config";
import { EventMetadata, EventPayload } from "../types/event.type";
import { LoggingService } from "../../../services/observability/logging/logging.service";

const logger = new LoggingService("api-gateway");

export class KafkaProducerService implements IMessageProducer {
  private producer = createProducer();

  async connect(): Promise<void> {
    try {
      await this.producer.connect();
      logger.info("Kafka producer connected successfully");
    } catch (error) {
      logger.error("Failed to connect to Kafka producer :)", {
        error,
      });
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.producer.disconnect();
      logger.info("Kafka producer disconnected successfully");
    } catch (error) {
      logger.error("Failed to disconnect Kafka producer :)", { error });
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

      logger.info(`Published event to ${topic}`, {
        eventType: payload.eventType,
        correlationId: metadata.correlationId,
      });
    } catch (error) {
      logger.error(`Failed to publish event to ${topic}:`, { error });
      throw error;
    }
  }
}
