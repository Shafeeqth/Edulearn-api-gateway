import { App } from './app';

const app = new App();

process.on('SIGINT', async () => await app.shutdown());
process.on('SIGTERM', async () => await app.shutdown());

(async () => {
  try {
    await app.initialize();
  } catch (error) {
    console.error('Error while initializing app :(', error);
    process.exit(1);
  }
})();
