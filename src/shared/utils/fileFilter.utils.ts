import { FileFilterCallback } from "multer";

export const fileFilter = (
  _: any,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  const allowedImageTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
  ];
  const allowedFileTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/plain",
  ];

  if (file.fieldname === "image") {
    if (allowedImageTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid image file type"));
    }
  } else if (file.fieldname === "file" || file.fieldname === "files") {
    if (allowedFileTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid document file type"));
    }
  } else {
    cb(new Error("Invalid filed name"));
  }
};
