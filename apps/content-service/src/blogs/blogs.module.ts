import { Module } from '@nestjs/common';
import { BlogsController } from './blogs.controller';
import { BlogsService } from './blogs.service';
import { BlogRepository } from './blog.repository';
import { PrismaService } from '../../prisma/prisma.service';
import { RabbitMQService } from '@app/rabbitmq';
import { AssetsModule } from '../assets/assets.module';

@Module({
  imports: [AssetsModule],
  controllers: [BlogsController],
  providers: [BlogsService, BlogRepository, PrismaService, RabbitMQService],
  exports: [BlogsService, BlogRepository],
})
export class BlogsModule {}
