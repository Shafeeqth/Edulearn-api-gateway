import { GrpcClient } from "../../../utils/grpc/client";
import { GrpcClientOptions } from "../../../utils/grpc/types";
import { NotificationResponse, NotificationServiceClient, OTPRequest, VerifyOTPRequest } from "./proto/generated/notification";

export class NotificationService {
  private readonly client: GrpcClient<Partial<NotificationServiceClient>>;

  constructor(host: string, port: number) {
    this.client = new GrpcClient({
      protoPath: process.cwd() + "/src/domains/clients/notification/proto/notification.proto",
      packageName: "notification",
      serviceName: "NotificationService",
      host,
      port,
    });
  }

  async sendOtp(
    request: OTPRequest,
    options: GrpcClientOptions = {}
  ): Promise<NotificationResponse> {
    const response = await this.client.unaryCall(
      "sendOtp",
      request,
      options
    );
    return response as NotificationResponse;
  }
  
  async verifyOtp(
    request: VerifyOTPRequest,
    options: GrpcClientOptions = {}
  ): Promise<NotificationResponse> {
    const response = await this.client.unaryCall(
      "verifyOtp",
      request,
      options
    );
    return response as NotificationResponse;
  }
  
  


  close() {
    this.client.close();
  }
}
