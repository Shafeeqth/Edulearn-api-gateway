import { Timestamp } from "google-protobuf/google/protobuf/timestamp_pb";

/**
 * Converts a JavaScript Date or ISO string to google.protobuf.Timestamp.
 * @param date - A JavaScript Date object or ISO string.
 * @returns A google.protobuf.Timestamp object.
 */
export function dateToProtoTimestamp(date: Date | string): Timestamp {
  const timestamp = new Timestamp();
  const dateObj = typeof date === "string" ? new Date(date) : date;

  timestamp.setSeconds(Math.floor(dateObj.getTime() / 1000)); // Convert milliseconds to seconds
  timestamp.setNanos((dateObj.getTime() % 1000) * 1e6); // Convert remaining milliseconds to nanoseconds

  return timestamp;
}

/**
 * Converts a google.protobuf.Timestamp a date Object.
 * @param timestamp - A google.protobuf.Timestamp object.
 * @returns A date object.
 */
export function protoTimestampToDate(timestamp: Timestamp.AsObject): Date {
  const seconds = timestamp.seconds;
  const nanos = timestamp.nanos;

  const milliseconds = seconds * 1000 + nanos / 1e6; // Convert seconds and nanoseconds to milliseconds
  return new Date(milliseconds);
}

export type AsObject = Timestamp.AsObject;
