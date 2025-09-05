import multer from "multer";
import { StorageMemory } from "@/shared/constants/storage";
import { fileFilter } from "@/shared/utils/fileFilter.utils";

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: StorageMemory.MB * 10, // 10 MB
  },
  fileFilter: fileFilter,
});

export const uploadSingleImage = upload.single("image");
export const uploadSingleFile = upload.single("file");
export const uploadMultipleFiles = upload.array("files", 5);
