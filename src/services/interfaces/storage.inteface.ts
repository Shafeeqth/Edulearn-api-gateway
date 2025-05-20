export interface IStorageService {
  uploadFile(key: string, body: Buffer, contentType: string): Promise<string>;
  getFileUrl(key: string, expiresIn: number): Promise<string>;
  deleteFile(key: string): Promise<void>;
  getFileStream(key: string): Promise<NodeJS.ReadableStream>;
}
