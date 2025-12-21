export interface PostResponseDto<T = any> {
  success: boolean;
  message: string;
  data?: T;
}
