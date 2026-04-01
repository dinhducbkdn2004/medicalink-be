import { Body, Controller, HttpCode, Inject, Post } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Public, DoctorRecommendationRequestDto } from '@app/contracts';
import { AI_PATTERNS } from '@app/contracts/patterns';
import { MicroserviceService } from '../utils/microservice.service';

@Controller('doctors/profile')
export class DoctorRecommendationController {
  constructor(
    @Inject('AI_SERVICE') private readonly aiClient: ClientProxy,
    private readonly microserviceService: MicroserviceService,
  ) {}

  /**
   * Gợi ý bác sĩ theo triệu chứng (RAG). Public.
   * Alias cùng payload: POST /api/ai/recommend | /api/ai/recommend-doctor (xem {@link AiController}).
   */
  @Public()
  @Post('recommend')
  @HttpCode(200)
  async recommend(@Body() body: DoctorRecommendationRequestDto) {
    return this.microserviceService.sendWithTimeout(
      this.aiClient,
      AI_PATTERNS.DOCTOR_RECOMMENDATION,
      body,
      { timeoutMs: 90000 },
    );
  }
}
