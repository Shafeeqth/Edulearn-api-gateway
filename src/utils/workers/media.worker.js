import { MediaService } from "../../services/media.service";
import { parentPort } from "worker_threads";

const mediaService = new MediaService();

parentPort?.on("message", async (data) => {
  try {
    switch (data.type) {
      case "uploadImage": {
        const file = {
          ...data.file,
          buffer: Buffer.from(data.file.buffer, "base64"),
        };

        const result = await mediaService.uploadImage(file);
        parentPort?.postMessage(result);
        break;
      }
      case "uploadFile": {
        const file = {
          ...data.file,
          buffer: Buffer.from(data.file.buffer, "base64"),
        };

        const result = await mediaService.uploadFile(file);
        parentPort?.postMessage(result);
        break;
      }
      case "deleteMedia": {
        await mediaService.deleteMedia(data.publicId);
        parentPort?.postMessage({ success: true });
        break;
      }
      default:
        throw new Error("Unknown task type");
    }
  } catch (error) {
    if (error instanceof Error) {
      parentPort?.postMessage({
        error: error?.message || "Error while media processing",
      });
    }
  }
});
