import { Controller, Post, Body, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { MicroserviceService } from '../utils/microservice.service';
import { CloudinarySignatureResponse } from '@app/contracts';

@Controller('utilities')
export class UtilitiesController {
  constructor(
    @Inject('CONTENT_SERVICE') private readonly contentClient: ClientProxy,
    private readonly microserviceService: MicroserviceService,
  ) {}

  @Post('upload-signature')
  async generateUploadSignature(): Promise<CloudinarySignatureResponse> {
    return this.microserviceService.sendWithTimeout<CloudinarySignatureResponse>(
      this.contentClient,
      'assets.generate_upload_signature',
      {},
    );
  }
}
