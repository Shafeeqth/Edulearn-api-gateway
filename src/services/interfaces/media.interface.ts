export interface IMediaService {
  uploadImage(
    file: Express.Multer.File
  ): Promise<{ url: string; publicId: string }>;

  uploadFile(
    file: Express.Multer.File
  ): Promise<{ url: string; publicId: string }>;

  deleteMedia(publicId: string): Promise<void>;

  optimizedImageUpload(file: Express.Multer.File): Promise<Express.Multer.File>;
}
