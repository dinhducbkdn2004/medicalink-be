export interface ReviewResponseDto {
  id: string;
  rating: number;
  title?: string;
  body?: string;
  publicIds?: string[];
  authorName?: string;
  authorEmail?: string;
  doctorId: string;
  isPublic: boolean;
  createdAt: Date;
}
