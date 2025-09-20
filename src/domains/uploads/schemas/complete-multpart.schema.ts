export class CompleteMultipartDto {
  key!: string;
  uploadId!: string;
  parts!: { PartNumber: number; ETag: string }[];
}
