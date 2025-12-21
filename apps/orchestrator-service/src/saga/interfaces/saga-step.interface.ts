/**
 * Represents a single step in a saga workflow
 */
export interface SagaStep<TInput = any, TOutput = any> {
  /**
   * Unique name for this step
   */
  name: string;

  /**
   * Execute the step's main action
   */
  execute: (input: TInput, context: SagaContext) => Promise<TOutput>;

  /**
   * Compensate (rollback) this step if something fails later
   * If null, this step cannot be compensated
   */
  compensate?:
    | ((output: TOutput, context: SagaContext) => Promise<void>)
    | null;

  /**
   * Optional timeout for this step in milliseconds
   */
  timeout?: number;

  /**
   * Optional retry configuration
   */
  retry?: {
    maxAttempts: number;
    backoffMs: number;
  };
}

/**
 * Context passed through saga execution
 */
export interface SagaContext {
  /**
   * Unique ID for this saga execution
   */
  sagaId: string;

  /**
   * Original input data
   */
  initialData: any;

  /**
   * Accumulated outputs from completed steps
   */
  stepOutputs: Record<string, any>;

  /**
   * Metadata for tracking
   */
  metadata: {
    startedAt: Date;
    userId?: string;
    correlationId?: string;
    [key: string]: any;
  };
}

/**
 * Result of saga execution
 */
export interface SagaResult<T = any> {
  /**
   * Success status
   */
  success: boolean;

  /**
   * Final result data
   */
  data?: T;

  /**
   * Error if failed
   */
  error?: {
    message: string;
    code?: string;
    step?: string;
    originalError?: any;
  };

  /**
   * Execution metadata
   */
  metadata: {
    sagaId: string;
    executedSteps: string[];
    compensatedSteps: string[];
    durationMs: number;
  };
}

/**
 * Options for saga execution
 */
export interface SagaOptions {
  /**
   * Timeout for entire saga in milliseconds
   */
  timeout?: number;

  /**
   * Custom correlation ID for tracking
   */
  correlationId?: string;

  /**
   * User ID for audit
   */
  userId?: string;

  /**
   * Additional metadata
   */
  metadata?: Record<string, any>;
}
