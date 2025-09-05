import compression, { CompressionOptions } from 'compression';
import { StorageMemory } from '../shared/constants/storage';
import { Request, Response } from 'express';

const getCompressionLevel = (size: number): number => {
  if (size > StorageMemory.MB) return 9;
  if (size > StorageMemory.KB * 100) return 6;
  return 3;
};

export const compress = compression({
  filter: (req: Request, res: Response) => {
    // Skip compression for small responses and binary data
    const contentType = res.getHeader('Content-Type');
    if (!contentType) return false;

    const contentTypeStr = contentType.toString();

    // Don't compress binary data, images, or already compressed formats
    if (
      /image|audio|video|application\/pdf|application\/zip/.test(contentTypeStr)
    ) {
      return false;
    }

    // Only compress text-based content types
    return /json|text|javascript|css|html|xml/.test(contentTypeStr);
  },
  threshold: StorageMemory.KB * 2, // Increase threshold to 2KB
  level: 6,
  // Enable dynamic compression level based on response size
  // level: (req: Request, res: Response) => {
  //   const contentLength = res.getHeader('Content-Length');
  //   if (contentLength) {
  //     const size = parseInt(contentLength.toString(), 10);
  //     return getCompressionLevel(size);
  //   }
  //   return 6;
  // },
  // Add windowBits for better compression
  windowBits: 15,
  // Add memLevel for memory usage optimization
  memLevel: 8,
} as CompressionOptions);
