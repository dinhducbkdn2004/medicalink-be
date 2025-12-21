import { AssetEntityType } from './asset-entity-type.enum';

export class AssetResponseDto {
  id: string;
  entityType: AssetEntityType;
  entityId: string;
  publicId: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}
