export class TestimonialResponseDto {
  id: string;
  authorName: string;
  authorAvatar: string | null;
  authorTitle: string | null;
  content: string;
  rating: number | null;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}
