import { KafkaProducerService } from "../kafka/producer.service";
import { EventMetadata, MediaUploadedPayload } from "../types/event.type";

export class publishMediaUploadedEvents {
  constructor(private producer: KafkaProducerService) {}

  async publishMediaUploadEvent(
    payload: MediaUploadedPayload,
    metadata: EventMetadata
  ): Promise<void> {
    const fullPayload: MediaUploadedPayload = {
      ...payload,
      eventType: "media.uploaded",
    };

    this.producer.publish("media-events", fullPayload, metadata);
  }
}
