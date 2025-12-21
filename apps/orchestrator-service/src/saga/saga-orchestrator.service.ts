import { Injectable, Logger } from '@nestjs/common';
import { createId } from '@paralleldrive/cuid2';
import {
  SagaStep,
  SagaContext,
  SagaResult,
  SagaOptions,
} from './interfaces/saga-step.interface';

@Injectable()
export class SagaOrchestratorService {
  private readonly logger = new Logger(SagaOrchestratorService.name);
  private readonly defaultTimeout = 30000; // 30 seconds

  /**
   * Execute a saga workflow with automatic compensation on failure
   */
  async execute<TInput, TOutput>(
    steps: SagaStep[],
    input: TInput,
    options?: SagaOptions,
  ): Promise<SagaResult<TOutput>> {
    const sagaId = createId();
    const startTime = Date.now();
    const executedSteps: string[] = [];
    const compensatedSteps: string[] = [];

    const context: SagaContext = {
      sagaId,
      initialData: input,
      stepOutputs: {},
      metadata: {
        startedAt: new Date(),
        correlationId: options?.correlationId,
        userId: options?.userId,
        ...options?.metadata,
      },
    };

    this.logger.log(`Starting saga ${sagaId} with ${steps.length} steps`);

    // Use currentData to track the output through steps
    let currentData: any = input;

    try {
      // Execute each step sequentially
      for (const step of steps) {
        const stepStartTime = Date.now();

        try {
          // Execute with timeout
          const output = await this.executeWithTimeout(
            () => step.execute(currentData, context),
            step.timeout || options?.timeout || this.defaultTimeout,
          );

          // Store output for next steps
          context.stepOutputs[step.name] = output;
          executedSteps.push(step.name);

          const stepDuration = Date.now() - stepStartTime;
          this.logger.debug(
            `Step ${step.name} completed in ${stepDuration}ms (saga: ${sagaId})`,
          );

          // Update current data for next step
          currentData = output;
        } catch (stepError) {
          this.logger.error(
            `Step ${step.name} failed (saga: ${sagaId}):`,
            stepError.message,
          );

          // Compensate all executed steps in reverse order
          await this.compensate(
            steps,
            executedSteps,
            context,
            compensatedSteps,
          );

          const durationMs = Date.now() - startTime;

          return {
            success: false,
            error: {
              message: `Saga failed at step: ${step.name}`,
              code: 'SAGA_STEP_FAILED',
              step: step.name,
              originalError: stepError,
            },
            metadata: {
              sagaId,
              executedSteps,
              compensatedSteps,
              durationMs,
            },
          };
        }
      }

      const durationMs = Date.now() - startTime;

      this.logger.log(
        `Saga ${sagaId} completed successfully in ${durationMs}ms`,
      );

      return {
        success: true,
        data: currentData as TOutput,
        metadata: {
          sagaId,
          executedSteps,
          compensatedSteps,
          durationMs,
        },
      };
    } catch (error) {
      this.logger.error(`Saga ${sagaId} failed unexpectedly:`, error);

      const durationMs = Date.now() - startTime;

      return {
        success: false,
        error: {
          message: 'Saga execution failed',
          code: 'SAGA_EXECUTION_FAILED',
          originalError: error,
        },
        metadata: {
          sagaId,
          executedSteps,
          compensatedSteps,
          durationMs,
        },
      };
    }
  }

  /**
   * Compensate executed steps in reverse order
   */
  private async compensate(
    allSteps: SagaStep[],
    executedStepNames: string[],
    context: SagaContext,
    compensatedSteps: string[],
  ): Promise<void> {
    this.logger.warn(
      `Starting compensation for ${executedStepNames.length} steps (saga: ${context.sagaId})`,
    );

    // Reverse order for compensation
    const stepsToCompensate = executedStepNames.reverse();

    for (const stepName of stepsToCompensate) {
      const step = allSteps.find((s) => s.name === stepName);

      if (!step) {
        this.logger.warn(`Step ${stepName} not found for compensation`);
        continue;
      }

      if (!step.compensate) {
        this.logger.debug(`Step ${stepName} has no compensation logic`);
        continue;
      }

      try {
        this.logger.debug(`Compensating step: ${stepName}`);

        const output = context.stepOutputs[stepName];
        await step.compensate(output, context);

        compensatedSteps.push(stepName);

        this.logger.debug(`Step ${stepName} compensated successfully`);
      } catch (compensateError) {
        this.logger.error(
          `Failed to compensate step ${stepName}:`,
          compensateError,
        );
        // Continue with other compensations even if one fails
      }
    }

    this.logger.warn(
      `Compensation completed. ${compensatedSteps.length}/${executedStepNames.length} steps compensated`,
    );
  }

  /**
   * Execute a function with timeout
   */
  private async executeWithTimeout<T>(
    fn: () => Promise<T>,
    timeoutMs: number,
  ): Promise<T> {
    return Promise.race([
      fn(),
      new Promise<T>((_, reject) =>
        setTimeout(
          () => reject(new Error(`Operation timed out after ${timeoutMs}ms`)),
          timeoutMs,
        ),
      ),
    ]);
  }

  /**
   * Build a simple saga step
   */
  static createStep<TInput, TOutput>(
    name: string,
    execute: (input: TInput, context: SagaContext) => Promise<TOutput>,
    compensate?: (output: TOutput, context: SagaContext) => Promise<void>,
    options?: {
      timeout?: number;
      retry?: { maxAttempts: number; backoffMs: number };
    },
  ): SagaStep<TInput, TOutput> {
    return {
      name,
      execute,
      compensate,
      timeout: options?.timeout,
      retry: options?.retry,
    };
  }
}
