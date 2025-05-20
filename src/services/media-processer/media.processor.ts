import { WorkerService } from "../../services/worker.service";

export interface UploadImageResponseDto {
  image: string;
  type: string;
  size: string;
}

export class MediaProcessor {
  constructor(
    private workerService: WorkerService = new WorkerService("media.worker.js")
  ) {}

  async uploadImage(
    file: Express.Multer.File
  ): Promise<UploadImageResponseDto> {
    return this.workerService.runTask<UploadImageResponseDto>({
      type: "uploadImage",
      file: {
        buffer: file.buffer.toString("base64"),
        originalname: file.originalname,
        mimetype: file.mimetype,
      },
    });
  }

  async uploadFile(file: Express.Multer.File): Promise<UploadImageResponseDto> {
    return this.workerService.runTask<UploadImageResponseDto>({
      type: "uploadFile",
      file: {
        buffer: file.buffer.toString("base64"),
        originalname: file.originalname,
        mimetype: file.mimetype,
      },
    });
  }
  async deleteMedia(publicId: string): Promise<void> {
    return this.workerService.runTask<void>({
      type: "deleteMedia",
      publicId,
    });
  }
}
