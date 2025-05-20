import { EventMetadata, EventPayload } from "../types/event.type";

export interface IMessageProducer {
  publish<T extends EventPayload>(
    topic: string,
    payload: T,
    metadata: EventMetadata
  ): Promise<void>;
}
