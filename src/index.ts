import { App } from './app';
import { LoggingService } from './services/observability/logging/logging.service';

const app = new App();
const logger = LoggingService.getInstance();

process.on('SIGINT', () => setTimeout(async () => await app.shutdown(), 1000));
process.on('SIGTERM', () => setTimeout(async () => await app.shutdown(), 1000));

(async () => {
  try {
    await app.initialize();
  } catch (error) {
    logger.error('Error while initializing app :(', { error });
    process.exit(1);
  }
})();
