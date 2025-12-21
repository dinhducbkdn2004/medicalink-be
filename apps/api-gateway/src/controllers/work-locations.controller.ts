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
  CreateWorkLocationDto,
  UpdateWorkLocationDto,
  WorkLocationPublicQueryDto,
  WorkLocationQueryDto,
  WorkLocationDto,
  Public,
  RequireReadPermission,
  RequireUpdatePermission,
  RequireDeletePermission,
} from '@app/contracts';
import { MicroserviceService } from '../utils/microservice.service';

@Controller('work-locations')
export class WorkLocationsController {
  constructor(
    @Inject('PROVIDER_DIRECTORY_SERVICE')
    private readonly providerDirectoryClient: ClientProxy,
    private readonly microserviceService: MicroserviceService,
  ) {}

  // Public - get all active work locations
  @Public()
  @Get('public')
  findAllPublic(@Query() query: WorkLocationPublicQueryDto) {
    const publicQuery = {
      isActive: true,
      page: 1,
      limit: 100,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
      includeMetadata: false,
    };

    return this.microserviceService.sendWithTimeout(
      this.providerDirectoryClient,
      'work-locations.findAll',
      publicQuery,
    );
  }

  // Admin only - get all work locations with flexible filtering
  @RequireReadPermission('work-locations')
  @Get()
  findAll(@Query() query: WorkLocationQueryDto) {
    const adminQuery = {
      ...query,
      includeMetadata: query.includeMetadata ?? true,
    };

    return this.microserviceService.sendWithTimeout(
      this.providerDirectoryClient,
      'work-locations.findAll',
      adminQuery,
    );
  }

  // Public - get work locations stats
  @Public()
  @Get('stats')
  getStats(): Promise<{
    total: number;
    recentlyCreated: number;
  }> {
    return this.microserviceService.sendWithTimeout<{
      total: number;
      recentlyCreated: number;
    }>(this.providerDirectoryClient, 'work-locations.stats', {});
  }

  @RequireReadPermission('work-locations')
  @Get(':id')
  findOne(@Param('id') id: string): Promise<WorkLocationDto> {
    return this.microserviceService.sendWithTimeout<WorkLocationDto>(
      this.providerDirectoryClient,
      'work-locations.findOne',
      id,
    );
  }

  // Admin only - create new work location
  @RequireUpdatePermission('work-locations')
  @Post()
  create(
    @Body() createWorkLocationDto: CreateWorkLocationDto,
  ): Promise<WorkLocationDto> {
    return this.microserviceService.sendWithTimeout<WorkLocationDto>(
      this.providerDirectoryClient,
      'work-locations.create',
      createWorkLocationDto,
    );
  }

  @RequireUpdatePermission('work-locations')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateWorkLocationDto: UpdateWorkLocationDto,
  ): Promise<WorkLocationDto> {
    return this.microserviceService.sendWithTimeout<WorkLocationDto>(
      this.providerDirectoryClient,
      'work-locations.update',
      { id, data: updateWorkLocationDto },
    );
  }

  @RequireDeletePermission('work-locations')
  @Delete(':id')
  remove(@Param('id') id: string): Promise<WorkLocationDto> {
    return this.microserviceService.sendWithTimeout<WorkLocationDto>(
      this.providerDirectoryClient,
      'work-locations.remove',
      id,
    );
  }
}
