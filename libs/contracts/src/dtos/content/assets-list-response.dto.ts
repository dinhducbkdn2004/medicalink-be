import { AssetResponseDto } from './asset-response.dto';

export class AssetsListResponseDto {
  data: AssetResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
