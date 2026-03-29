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
import { FAQS_PATTERNS } from '@app/contracts/patterns';
import { MicroserviceService } from '../utils/microservice.service';
import {
  CreateFaqDto,
  UpdateFaqDto,
  GetFaqsQueryDto,
} from '@app/contracts/dtos';

@Controller('faqs')
export class FaqsController {
  constructor(
    @Inject('CONTENT_SERVICE') private readonly contentClient: ClientProxy,
    private readonly microserviceService: MicroserviceService,
  ) {}

  @Public()
  @Get()
  async findAll(@Query() query: GetFaqsQueryDto) {
    return this.microserviceService.sendWithTimeout(
      this.contentClient,
      FAQS_PATTERNS.FIND_MANY_PUBLIC,
      query,
    );
  }

  @RequirePermission('faqs', 'read')
  @Get('admin')
  async findAllAdmin(@Query() query: GetFaqsQueryDto) {
    return this.microserviceService.sendWithTimeout(
      this.contentClient,
      FAQS_PATTERNS.FIND_MANY,
      query,
    );
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.microserviceService.sendWithTimeout(
      this.contentClient,
      FAQS_PATTERNS.FIND_ONE,
      id,
    );
  }

  @RequirePermission('faqs', 'create')
  @Post()
  async create(@Body() dto: CreateFaqDto) {
    return this.microserviceService.sendWithTimeout(
      this.contentClient,
      FAQS_PATTERNS.CREATE,
      dto,
    );
  }

  @RequireUpdatePermission('faqs')
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateFaqDto) {
    return this.microserviceService.sendWithTimeout(
      this.contentClient,
      FAQS_PATTERNS.UPDATE,
      { ...dto, id },
    );
  }

  @RequireUpdatePermission('faqs')
  @Patch(':id/toggle-active')
  async toggleActive(@Param('id') id: string) {
    return this.microserviceService.sendWithTimeout(
      this.contentClient,
      FAQS_PATTERNS.TOGGLE_ACTIVE,
      id,
    );
  }

  @RequireDeletePermission('faqs')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.microserviceService.sendWithTimeout(
      this.contentClient,
      FAQS_PATTERNS.REMOVE,
      id,
    );
  }
}
