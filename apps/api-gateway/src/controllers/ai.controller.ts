import { Body, Controller, HttpCode, Inject, Post } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  Public,
  DoctorRecommendationRequestDto,
  SpecialtySuggestionRequestDto,
} from '@app/contracts';
import { AI_PATTERNS } from '@app/contracts/patterns';
import { MicroserviceService } from '../utils/microservice.service';

/**
 * REST prefix `/api/ai/*` — khớp frontend (vd. `POST /api/ai/recommend-doctor`) và tài liệu.
 * Logic RPC giống `DoctorRecommendationController` (`/api/doctors/profile/recommend`).
 */
@Controller('ai')
export class AiController {
  constructor(
    @Inject('AI_SERVICE') private readonly aiClient: ClientProxy,
    private readonly microserviceService: MicroserviceService,
  ) {}

  @Public()
  @Post(['recommend', 'recommend-doctor'])
  @HttpCode(200)
  async recommend(@Body() body: DoctorRecommendationRequestDto) {
    return this.microserviceService.sendWithTimeout(
      this.aiClient,
      AI_PATTERNS.DOCTOR_RECOMMENDATION,
      body,
      { timeoutMs: 90000 },
    );
  }

  /** Gợi ý chuyên khoa (NLU) — user xác nhận trên UI trước khi gọi recommend-doctor. */
  @Public()
  @Post('suggest-specialties')
  @HttpCode(200)
  async suggestSpecialties(@Body() body: SpecialtySuggestionRequestDto) {
    return this.microserviceService.sendWithTimeout(
      this.aiClient,
      AI_PATTERNS.SPECIALTY_SUGGESTION,
      body,
      { timeoutMs: 60000 },
    );
  }
}
