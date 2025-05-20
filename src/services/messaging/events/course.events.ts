import { KafkaProducerService } from "../kafka/producer.service";
import { CourseUploadedPayload, EventMetadata } from "../types/event.type";

export class CourseEvents {
  constructor(private producer: KafkaProducerService) {}

  async publishCourseMaterialUploadedEvent(
    payload: CourseUploadedPayload,
    metadata: EventMetadata
  ): Promise<void> {
    const fullPayload: CourseUploadedPayload = {
      ...payload,
      eventType: "course.content.uploaded",
    };
    await this.producer.publish("course-events", fullPayload, metadata);
  }
}
