import { fork, ForkOptions } from "child_process";
import { IWorkerService } from "./interfaces/woker.interface";
import path from "path";
import { LoggingService } from "@mdshafeeq-repo/edulearn-common";
const logger = new LoggingService("api-gateway");

export class WorkerService implements IWorkerService {
  private workerPath: string;
  private options: ForkOptions;

  public constructor(workerPath: string, options: ForkOptions = {}) {
    this.workerPath = path.join(__dirname, "../utils/workers", workerPath);
    this.options = {
      stdio: ["inherit", "inherit", "inherit", "ipc"],
      ...options,
    };
  }

  async runTask<T>(data: any): Promise<T> {
    return new Promise((resolve, reject) => {
      const worker = fork(this.workerPath, [], this.options);

      worker.on("message", (result: T) => {
        worker.kill();
        resolve(result);
      });

      worker.on("error", (error) => {
        worker.kill();
        logger.logError("worker error", {error});
        reject(error);
      });

      worker.on("exit", (code) => {
        if (code !== 0) {
          logger.logError("Worker stopped with exit code " + code);
          reject(new Error(`Worker stopped with exit code ${code}`));
        }
      });

      worker.send(data);
    });
  }
}
