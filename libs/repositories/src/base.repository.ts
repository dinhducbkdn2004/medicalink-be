import { IBaseRepository } from '@app/contracts';

export abstract class BaseRepository<
  T,
  CreateDto = null,
  UpdateDto = null,
  FilterOptions = any,
> implements IBaseRepository<T, CreateDto, UpdateDto, FilterOptions>
{
  constructor(protected readonly model: any) {}

  async create(data: CreateDto): Promise<T> {
    return await this.model.create({ data });
  }

  async findById(id: string): Promise<T | null> {
    return await this.model.findUnique({ where: { id } });
  }

  async findAll(options?: FilterOptions): Promise<T[]> {
    return await this.model.findMany(options ? { where: options } : {});
  }

  async findMany(options?: {
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
  }> {
    const {
      where,
      skip = 0,
      take = 10,
      orderBy,
      include,
      select,
    } = options || {};

    const [data, total] = await Promise.all([
      this.model.findMany({
        where,
        skip,
        take,
        orderBy,
        include,
        select,
      }),
      this.model.count({ where }),
    ]);

    const page = Math.floor(skip / take) + 1;
    const totalPages = Math.ceil(total / take);

    return {
      data,
      total,
      page,
      limit: take,
      totalPages,
    };
  }

  async findFirst(where: FilterOptions): Promise<T | null> {
    return await this.model.findFirst({ where });
  }

  async update(id: string, data: UpdateDto): Promise<T> {
    return await this.model.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<T> {
    return await this.model.delete({ where: { id } });
  }

  async deleteMany(where: FilterOptions): Promise<{ count: number }> {
    return await this.model.deleteMany({ where });
  }

  async count(where?: FilterOptions): Promise<number> {
    return await this.model.count(where ? { where } : {});
  }

  async exists(where: FilterOptions): Promise<boolean> {
    const count = await this.model.count({ where });
    return count > 0;
  }

  async updateMany(
    where: FilterOptions,
    data: Partial<UpdateDto>,
  ): Promise<{ count: number }> {
    return await this.model.updateMany({ where, data });
  }

  async upsert(where: any, create: CreateDto, update: UpdateDto): Promise<T> {
    return await this.model.upsert({
      where,
      create,
      update,
    });
  }
}
