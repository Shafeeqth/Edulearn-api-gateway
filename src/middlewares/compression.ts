import compression, { CompressionOptions } from "compression";
import { StorageMemory } from "../shared/constants/storage";
import { Request, Response } from "express";

const getCompressionLevel = (size: number): number => {
  if (size > StorageMemory.MB) return 9; 
  if (size > StorageMemory.KB * 100) return 6; 
  return 3; 
};

export const compress = compression({
  filter: (req: Request, res: Response) => {
    // Only compress responses with specific content types
    const contentType = res.getHeader("Content-Type");
    return (contentType &&  /json|text|javascript|css|html/.test(contentType.toString())
    );
  },
  threshold: StorageMemory.KB, 
  level: 6,
// (req, res) => {
//     // Dynamically adjust compression level based on response size
//     const contentLength = res.getHeader("Content-Length");
//     if (contentLength) {
//       const size = parseInt(contentLength.toString(), 10);
//       return getCompressionLevel(size);
//     }
//     return 6;
//   },
} as CompressionOptions);
