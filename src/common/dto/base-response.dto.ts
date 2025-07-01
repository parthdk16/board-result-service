// src/common/dto/base-response.dto.ts
export class BaseResponseDto<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: any;
  timestamp: string;

  constructor(success: boolean, message: string, data?: T, error?: any) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.error = error;
    this.timestamp = new Date().toISOString();
  }

  static success<T>(message: string, data?: T): BaseResponseDto<T> {
    return new BaseResponseDto(true, message, data);
  }

  static error<T>(message: string, error?: any): BaseResponseDto<T> {
    return new BaseResponseDto(false, message, undefined, error);
  }
}
