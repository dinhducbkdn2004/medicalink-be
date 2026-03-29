import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  Public,
  RequirePermission,
  RequireUpdatePermission,
  RequireDeletePermission,
} from '@app/contracts/decorators';
import { TESTIMONIALS_PATTERNS } from '@app/contracts/patterns';
import { MicroserviceService } from '../utils/microservice.service';
import {
  CreateTestimonialDto,
  UpdateTestimonialDto,
  GetTestimonialsQueryDto,
} from '@app/contracts/dtos';

@Controller('testimonials')
export class TestimonialsController {
  constructor(
    @Inject('CONTENT_SERVICE') private readonly contentClient: ClientProxy,
    private readonly microserviceService: MicroserviceService,
  ) {}

  @Public()
  @Get()
  async findAll(@Query() query: GetTestimonialsQueryDto) {
    return this.microserviceService.sendWithTimeout(
      this.contentClient,
      TESTIMONIALS_PATTERNS.FIND_MANY_PUBLIC,
      query,
    );
  }

  @RequirePermission('testimonials', 'read')
  @Get('admin')
  async findAllAdmin(@Query() query: GetTestimonialsQueryDto) {
    return this.microserviceService.sendWithTimeout(
      this.contentClient,
      TESTIMONIALS_PATTERNS.FIND_MANY,
      query,
    );
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.microserviceService.sendWithTimeout(
      this.contentClient,
      TESTIMONIALS_PATTERNS.FIND_ONE,
      id,
    );
  }

  @RequirePermission('testimonials', 'create')
  @Post()
  async create(@Body() dto: CreateTestimonialDto) {
    return this.microserviceService.sendWithTimeout(
      this.contentClient,
      TESTIMONIALS_PATTERNS.CREATE,
      dto,
    );
  }

  @RequireUpdatePermission('testimonials')
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateTestimonialDto) {
    return this.microserviceService.sendWithTimeout(
      this.contentClient,
      TESTIMONIALS_PATTERNS.UPDATE,
      { ...dto, id },
    );
  }

  @RequireUpdatePermission('testimonials')
  @Patch(':id/toggle-featured')
  async toggleFeatured(@Param('id') id: string) {
    return this.microserviceService.sendWithTimeout(
      this.contentClient,
      TESTIMONIALS_PATTERNS.TOGGLE_FEATURED,
      id,
    );
  }

  @RequireDeletePermission('testimonials')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.microserviceService.sendWithTimeout(
      this.contentClient,
      TESTIMONIALS_PATTERNS.REMOVE,
      id,
    );
  }
}
