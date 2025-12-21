export interface IBaseRepository<T, CreateDto, UpdateDto, FilterOptions = any> {
  /**
   * Create a new entity
   * @param data - Data to create the entity
   * @returns Promise of created entity
   */
  create(data: CreateDto): Promise<T>;

  /**
   * Find entity by ID
   * @param id - Entity ID
   * @returns Promise of entity or null if not found
   */
  findById(id: string): Promise<T | null>;

  /**
   * Find all entities with optional filtering
   * @param options - Filter and pagination options
   * @returns Promise of entities array
   */
  findAll(options?: FilterOptions): Promise<T[]>;

  /**
   * Find entities with pagination
   * @param options - Filter, pagination and sorting options
   * @returns Promise of paginated result
   */
  findMany(options?: {
    where?: FilterOptions;
    skip?: number;
    take?: number;
    orderBy?: any;
    include?: any;
    select?: any;
  }): Promise<{
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;

  /**
   * Find first entity matching criteria
   * @param where - Filter criteria
   * @returns Promise of entity or null
   */
  findFirst(where: FilterOptions): Promise<T | null>;

  /**
   * Update entity by ID
   * @param id - Entity ID
   * @param data - Data to update
   * @returns Promise of updated entity
   */
  update(id: string, data: UpdateDto): Promise<T>;

  /**
   * Delete entity by ID
   * @param id - Entity ID
   * @returns Promise of deleted entity
   */
  delete(id: string): Promise<T>;

  /**
   * Delete many entities
   * @param where - Filter criteria for deletion
   * @returns Promise of deletion count
   */
  deleteMany(where: FilterOptions): Promise<{ count: number }>;

  /**
   * Count entities matching criteria
   * @param where - Filter criteria
   * @returns Promise of count
   */
  count(where?: FilterOptions): Promise<number>;

  /**
   * Check if entity exists
   * @param where - Filter criteria
   * @returns Promise of boolean
   */
  exists(where: FilterOptions): Promise<boolean>;

  /**
   * Update many entities
   * @param where - Filter criteria
   * @param data - Data to update
   * @returns Promise of update count
   */
  updateMany(
    where: FilterOptions,
    data: Partial<UpdateDto>,
  ): Promise<{ count: number }>;

  /**
   * Upsert entity (create if not exists, update if exists)
   * @param where - Unique identifier
   * @param create - Data for creation
   * @param update - Data for update
   * @returns Promise of entity
   */
  upsert(where: any, create: CreateDto, update: UpdateDto): Promise<T>;
}
