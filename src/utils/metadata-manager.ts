import { Metadata } from "@grpc/grpc-js";

export class MetadataManager {
  private _metadata: Metadata;
  
  constructor() {
    this._metadata = new Metadata();
  }

  public set(items: Record<string, any>): MetadataManager {
    for (const [key, value] of Object.entries(items)) {
      try {
        // Serialize value to JSON
        const serializedValue =
          typeof value === "object" ? JSON.stringify(value) : value;

        this._metadata.set(key, serializedValue);
      } catch (error) {
        console.error(`Failed to set up metadata for key"${key}" :)`, error);
        throw error;
      }
    }
    return this;
  }

  public remove(key: string): MetadataManager {
    this._metadata.remove(key);
    return this;
  }

  get metadata(): Metadata {
    return this._metadata;
  }
}
