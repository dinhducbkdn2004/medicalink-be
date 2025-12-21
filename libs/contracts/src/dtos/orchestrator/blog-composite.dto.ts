import { PaginationDto } from '../common';
import { IsOptional, IsString } from 'class-validator';

export class BlogCompositeQueryDto extends PaginationDto {
  @IsOptional()
  @IsString({ message: 'Category ID must be a string' })
  categoryId?: string;

  @IsOptional()
  @IsString({ message: 'Author ID must be a string' })
  authorId?: string;

  @IsOptional()
  @IsString({ message: 'Status must be a string' })
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
}

export class BlogPublicCompositeQueryDto extends PaginationDto {
  @IsOptional()
  @IsString({ message: 'Category ID must be a string' })
  categoryId?: string;
}

export interface BlogCompositeData {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  authorId: string;
  categoryId?: string;
  category?: {
    id: string;
    name: string;
    description?: string;
  };
  specialtyIds?: string[];
  tags?: string[];
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  // Composed data
  authorName?: string;
}
