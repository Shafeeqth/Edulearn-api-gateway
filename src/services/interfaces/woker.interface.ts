export interface IWorkerService {
    runTask<T>(data: any): Promise<T>;
}