import { Injectable, Inject } from '@nestjs/common';
import { Queue } from 'bullmq';

export interface EmailJobData {
  to: string;
  subject: string;
  body: string;
  template?: string;
  templateData?: Record<string, any>;
}

export interface NotificationJobData {
  userId: string;
  type: 'email' | 'sms' | 'push';
  title: string;
  message: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class QueueService {
  constructor(
    @Inject('EMAIL_QUEUE') private readonly emailQueue: Queue,
    @Inject('NOTIFICATION_QUEUE') private readonly notificationQueue: Queue,
  ) {}

  // Email queue operations
  async addEmailJob(
    data: EmailJobData,
    options?: {
      delay?: number;
      priority?: number;
      attempts?: number;
    },
  ): Promise<void> {
    await this.emailQueue.add('send-email', data, {
      delay: options?.delay,
      priority: options?.priority,
      attempts: options?.attempts || 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    });
  }

  async addBulkEmailJobs(jobs: EmailJobData[]): Promise<void> {
    const jobsWithOptions = jobs.map((job) => ({
      name: 'send-email',
      data: job,
      opts: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
    }));
    await this.emailQueue.addBulk(jobsWithOptions);
  }

  // Notification queue operations
  async addNotificationJob(
    data: NotificationJobData,
    options?: {
      delay?: number;
      priority?: number;
      attempts?: number;
    },
  ): Promise<void> {
    await this.notificationQueue.add('send-notification', data, {
      delay: options?.delay,
      priority: options?.priority,
      attempts: options?.attempts || 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    });
  }

  // Queue management
  async getEmailQueueInfo(): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
  }> {
    const [waiting, active, completed, failed] = await Promise.all([
      this.emailQueue.getWaiting(),
      this.emailQueue.getActive(),
      this.emailQueue.getCompleted(),
      this.emailQueue.getFailed(),
    ]);

    return {
      waiting: waiting.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length,
    };
  }

  async getNotificationQueueInfo(): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
  }> {
    const [waiting, active, completed, failed] = await Promise.all([
      this.notificationQueue.getWaiting(),
      this.notificationQueue.getActive(),
      this.notificationQueue.getCompleted(),
      this.notificationQueue.getFailed(),
    ]);

    return {
      waiting: waiting.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length,
    };
  }

  // Clean up completed/failed jobs
  async cleanEmailQueue(): Promise<void> {
    await this.emailQueue.clean(24 * 60 * 60 * 1000, 100, 'completed'); // Keep last 100 completed jobs for 24h
    await this.emailQueue.clean(7 * 24 * 60 * 60 * 1000, 50, 'failed'); // Keep last 50 failed jobs for 7 days
  }

  async cleanNotificationQueue(): Promise<void> {
    await this.notificationQueue.clean(24 * 60 * 60 * 1000, 100, 'completed');
    await this.notificationQueue.clean(7 * 24 * 60 * 60 * 1000, 50, 'failed');
  }

  // Pause/Resume queues
  async pauseEmailQueue(): Promise<void> {
    await this.emailQueue.pause();
  }

  async resumeEmailQueue(): Promise<void> {
    await this.emailQueue.resume();
  }

  async pauseNotificationQueue(): Promise<void> {
    await this.notificationQueue.pause();
  }

  async resumeNotificationQueue(): Promise<void> {
    await this.notificationQueue.resume();
  }
}
