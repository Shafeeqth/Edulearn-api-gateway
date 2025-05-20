import cloudinary from "../config/cloudinary.config";
import { IMediaService } from "./interfaces/media.interface";
import { Readable } from "stream";
import { Multer } from "multer";

export class MediaService implements IMediaService {
  async uploadImage(
    file: Express.Multer.File
  ): Promise<{ url: string; publicId: string }> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "image",
          folder: "edulearn/images",
          format: "auto",
        },
        (error, result) => {
          if (error) return reject(error);
          if (!result) return reject(new Error("Upload failed"));
          resolve({ url: result.secure_url, publicId: result.public_id });
        }
      );

      const readableStream = new Readable();
      readableStream.push(file.buffer);
      readableStream.push(null);
      readableStream.pipe(uploadStream);
    });
  }

  async uploadFile(
    file: Express.Multer.File
  ): Promise<{ url: string; publicId: string }> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "auto",
          folder: "edulearn/files",
        },
        (error, result) => {
          if (error) return reject(error);
          if (!result) return reject(new Error("Medial upload failed"));
          resolve({ url: result.secure_url, publicId: result?.public_id });
        }
      );

      const readableStream = new Readable();
      readableStream.push(file.buffer);
      readableStream.push(null);
      readableStream.pipe(uploadStream);
    });
  }

  async deleteMedia(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId);
  }

  async optimizedImageUpload(
    file: Express.Multer.File
  ): Promise<Express.Multer.File> {
    // TODO
    return file;
  }
}
