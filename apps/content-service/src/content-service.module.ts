import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BlogsModule } from './blogs/blogs.module';
import { QuestionsModule } from './questions/questions.module';
import { ReviewsModule } from './reviews/reviews.module';
import { AssetsModule } from './assets/assets.module';
import { ContentStatsModule } from './content-stats/content-stats.module';
import { FaqsModule } from './faqs/faqs.module';
import { TestimonialsModule } from './testimonials/testimonials.module';
import { HealthController } from './health/health.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { RabbitMQModule } from '@app/rabbitmq';
import { MicroserviceClientsModule } from './clients/microservice-clients.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    RabbitMQModule,
    MicroserviceClientsModule,
    PrismaModule,
    BlogsModule,
    QuestionsModule,
    ReviewsModule,
    AssetsModule,
    ContentStatsModule,
    FaqsModule,
    TestimonialsModule,
  ],
  controllers: [HealthController],
})
export class ContentServiceModule {}
