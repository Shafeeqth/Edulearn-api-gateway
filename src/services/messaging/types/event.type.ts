export interface EventMetadata {
  correlationId?: string;
  userId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  [key: string]: any;
}

export interface EventPayload {
  eventType: string;
  [key: string]: any;
}

// Typed event interfaces
export interface CourseUploadedPayload extends EventPayload {
  eventType: "course.content.uploaded";
  courseId: string;
  fileKey: string;
  fileUrl: string;
  fileSize: number;
  contentType: string;
  uploadDuration: number;
}

export interface MediaUploadedPayload extends EventPayload {
  eventType: "media.uploaded";
  mediaType: "image" | "video" | "document";
  publicId: string;
  url: string;
  format: string;
  bytes: number;
}

// Union type
export type DomainEventPayload = CourseUploadedPayload | MediaUploadedPayload;
