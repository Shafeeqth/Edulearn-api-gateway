import { S3Service } from "../../services/storage.service";
import { parentPort } from "worker_threads";

const s3Service = new S3Service();

parentPort?.on("message", async (data) => {

    try {
        switch (data.type) {
            case "uploadCourseMedia": {
                const file = {
                    ...data.file,
                    buffer: Buffer.from(data.file.buffer, "base64"),

                }
                const key = `courses/${data.file.courseId}/${Date.now()}-${file.originalname}`;
                await s3Service.uploadFile(key, file.buffer, file.mimetype);

                const url = await s3Service.getFileUrl(key);
                parentPort?.postMessage({url, key});
                break;
            }
            default: 
                throw new Error("Unknown task at `storage.worker`");
        }
    } catch (error) {
        if(error instanceof Error) {

            parentPort?.postMessage({error: error.message})
         
        } else {

            parentPort?.postMessage({error: "Something went wrong in `storage.worker`"}); 
        }
        
    }
})