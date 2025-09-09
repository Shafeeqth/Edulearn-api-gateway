import { CookieOptions, Response as ExpressResponse } from 'express';
import { MappingConfig, ResponseMapper } from './response-mapper';
import { status } from '@grpc/grpc-js';
import { ErrorResponse } from './errorHandler';

export class ResponseWrapper {
  private readonly res: ExpressResponse;

  public constructor(res: ExpressResponse) {
    if (!new.target) {
      new ResponseWrapper(res);
    }
    this.res = res;
  }

  status(code: number): this {
    this.res.status(code);
    return this;
  }

  cookie(
    name: string,
    value: string,
    options?: CookieOptions | Parameters<ExpressResponse['cookie']>[1]
  ): this {
    this.res.cookie(name, value, options);
    return this;
  }

  clearCookie(
    name: string,
    options: Parameters<ExpressResponse['clearCookie']>[1]
  ): this {
    this.res.clearCookie(name, options);
    return this;
  }

  header(name: string, value: string | string[]): this {
    this.res.header(name, value);
    return this;
  }

  set(field: Record<string, string | number | string[]>): this;
  set(field: string, value?: string | string[]): this;
  set(
    fieldOrFields: string | Record<string, string | number | string[]>,
    value?: string | string[]
  ): this {
    this.res.set(fieldOrFields as any, value);
    return this;
  }

  type(type: string): this {
    this.res.type(type);
    return this;
  }

  send(body?: any): void {
    this.res.send();
  }

  json<T>(data: T): void {
    this.res.json(data);
  }

  sendWithMapping<Entity, Response>(
    entity: Entity,
    mappingConfig: MappingConfig<Entity, Response>,
    message?: string
  ): void {
    const mapper = new ResponseMapper<Entity, Response>(mappingConfig);
    this.success(mapper.toResponse(entity), message);
  }

  sendListWithMapping<Entity, Response>(
    entity: Entity[],
    mappingConfig: MappingConfig<Entity, Response>,
    message?: string
  ): void {
    const mapper = new ResponseMapper<Entity, Response>(mappingConfig);
    this.success(mapper.toResponseList(entity), message);
  }

  /**
   * Standard success response
   * @param payload - The data to send in the response
   * @param message - Optional success message
   */
  success<T>(
    payload: T,
    message: string = 'Operation completed successfully'
  ): void {
    this.res.json({
      success: true,
      message,
      data: payload,
    });
  }

  /**
   * Standardized error response
   * @param code - Error code for client-side handling
   * @param message - Error message
   * @param details - Optional additional error details
   */
  error(code: string, message: string, details?: any): void {
    this.res.json({
      success: false,
      message,
      error: {
        errorCode: code,
        details,
      },
    } as ErrorResponse);
  }
}
