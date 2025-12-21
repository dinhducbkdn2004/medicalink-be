import { Logger } from '@nestjs/common';

/**
 * Helper utilities for composition operations
 */
export class CompositionHelper {
  /**
   * Safely merge objects with null/undefined checks
   */
  static safeMerge<T extends object>(
    ...sources: Array<Partial<T> | null | undefined>
  ): Partial<T> {
    return sources.reduce<Partial<T>>((acc, source) => {
      if (!source) return acc;
      return { ...acc, ...source };
    }, {} as Partial<T>);
  }

  /**
   * Extract IDs from array of objects
   */
  static extractIds<T extends { id: string }>(items: T[]): string[] {
    return items.map((item) => item.id);
  }

  /**
   * Create a map from array by key selector
   */
  static toMap<T, K extends string | number>(
    items: T[],
    keySelector: (item: T) => K,
  ): Map<K, T> {
    const map = new Map<K, T>();
    for (const item of items) {
      map.set(keySelector(item), item);
    }
    return map;
  }

  /**
   * Find item in array by predicate, log warning if not found
   */
  static findWithWarning<T>(
    items: T[],
    predicate: (item: T) => boolean,
    logger: Logger,
    warningMessage: string,
  ): T | undefined {
    const found = items.find(predicate);
    if (!found) {
      logger.warn(warningMessage);
    }
    return found;
  }

  /**
   * Batch array into chunks for parallel processing
   */
  static batchArray<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    return batches;
  }

  /**
   * Filter out null/undefined items with type safety
   */
  static filterNulls<T>(items: (T | null | undefined)[]): T[] {
    return items.filter(
      (item): item is T => item !== null && item !== undefined,
    );
  }

  /**
   * Merge two arrays by matching key
   */
  static mergeArraysByKey<T, U, K extends string | number>(
    primary: T[],
    secondary: U[],
    primaryKeySelector: (item: T) => K,
    secondaryKeySelector: (item: U) => K,
    merger: (primary: T, secondary: U | undefined) => any,
  ): any[] {
    const secondaryMap = this.toMap(secondary, secondaryKeySelector);
    return primary.map((primaryItem) => {
      const key = primaryKeySelector(primaryItem);
      const secondaryItem = secondaryMap.get(key);
      return merger(primaryItem, secondaryItem);
    });
  }

  /**
   * Create a timestamp metadata object
   */
  static createTimestampMetadata(
    createdAt?: Date,
    updatedAt?: Date,
  ): {
    createdAt?: Date;
    updatedAt?: Date;
  } {
    return {
      createdAt,
      updatedAt,
    };
  }

  /**
   * Calculate duration in milliseconds
   */
  static calculateDuration(startTime: number): number {
    return Date.now() - startTime;
  }

  /**
   * Format duration for logging
   */
  static formatDuration(durationMs: number): string {
    if (durationMs < 1000) {
      return `${durationMs}ms`;
    }
    return `${(durationMs / 1000).toFixed(2)}s`;
  }

  /**
   * Deep clone an object (for immutable operations)
   */
  static deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }

  /**
   * Check if all required fields are present
   */
  static hasAllRequiredFields<T extends object>(
    obj: Partial<T>,
    requiredFields: (keyof T)[],
  ): obj is T {
    return requiredFields.every(
      (field) => obj[field] !== undefined && obj[field] !== null,
    );
  }

  /**
   * Create pagination response
   */
  static createPaginationMeta(
    page: number,
    limit: number,
    total: number,
  ): {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  } {
    const totalPages = Math.ceil(total / limit);
    return {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }

  /**
   * Retry operation with exponential backoff
   */
  static async retry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delayMs: number = 1000,
    logger?: Logger,
  ): Promise<T> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        if (attempt === maxRetries) {
          throw error;
        }
        const delay = delayMs * Math.pow(2, attempt - 1);
        logger?.debug(
          `Retry attempt ${attempt}/${maxRetries}, waiting ${delay}ms`,
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
    throw new Error('Retry failed');
  }
}
