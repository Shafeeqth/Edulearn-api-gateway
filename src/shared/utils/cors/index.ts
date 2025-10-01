import { HttpStatus } from '@/shared/constants/http-status';
import { CorsOptions } from 'cors';
import { config } from '@/config/dev-config';

const allowedOrigins = config.cors.allowedOrigins;
const allowedMethods = config.cors.allowedMethods;

export const corsOptions: CorsOptions = {
  origin: (requestOrigin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!requestOrigin) return callback(null, true);

    if (allowedOrigins.includes(requestOrigin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS policy violation'));
    }
  },
  credentials: true,
  methods: allowedMethods,
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'X-Request-ID',
    'Idempotency-Key',
  ],
  optionsSuccessStatus: HttpStatus.NO_CONTENT,
  maxAge: 86400, // 24 hours
};
