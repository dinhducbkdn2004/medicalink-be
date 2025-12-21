import { Controller, Inject } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { v2 as Cloudinary, SignApiOptions } from 'cloudinary';
import { CloudinarySignatureResponse } from '@app/contracts';
import { CLOUDINARY } from './cloudinary.provider';
import { ConfigService } from '@nestjs/config';

@Controller('assets')
export class AssetsController {
  constructor(
    @Inject(CLOUDINARY) private readonly cloudinary: typeof Cloudinary,
    private readonly configService: ConfigService,
  ) {}

  @MessagePattern('assets.generate_upload_signature')
  generateUploadSignature(): CloudinarySignatureResponse {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const folder =
      this.configService.get<string>('SERVICE_NAME', { infer: true }) ||
      'medicalink';

    // Use only essential parameters for signature generation
    const uploadParams: SignApiOptions = {
      timestamp,
      folder,
    };

    // Generate signature with minimal parameters
    const signature = this.cloudinary.utils.api_sign_request(
      uploadParams,
      this.cloudinary.config().api_secret as string,
    );

    return {
      signature,
      timestamp,
      folder,
      apiKey: this.cloudinary.config().api_key as string,
      cloudName: this.cloudinary.config().cloud_name as string,
    };
  }
}
