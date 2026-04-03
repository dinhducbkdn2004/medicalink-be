import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AssetsMaintenanceService } from './assets-maintenance.service';
import { CLOUDINARY } from './cloudinary.provider';

const TEST_FOLDER = 'medicalink';
const pathId = (publicId: string) => `${TEST_FOLDER}/${publicId}`;

// Unit tests for AssetsMaintenanceService
describe('AssetsMaintenanceService', () => {
  let service: AssetsMaintenanceService;
  let destroyMock: jest.Mock;

  beforeEach(async () => {
    destroyMock = jest.fn();

    const moduleRef = await Test.createTestingModule({
      providers: [
        AssetsMaintenanceService,
        {
          provide: ConfigService,
          useValue: {
            get: jest
              .fn()
              .mockImplementation((key: string) =>
                key === 'SERVICE_NAME' ? TEST_FOLDER : undefined,
              ),
          },
        },
        {
          provide: CLOUDINARY,
          useValue: {
            uploader: {
              destroy: destroyMock,
            },
          },
        },
      ],
    }).compile();

    service = moduleRef.get(AssetsMaintenanceService);
    destroyMock.mockReset();
  });

  it('should do nothing for empty array', async () => {
    await service.cleanupEntityAssets([]);
    expect(destroyMock).not.toHaveBeenCalled();
  });

  it('should deduplicate and ignore empty strings', async () => {
    destroyMock.mockResolvedValue({ result: 'ok' });

    await service.cleanupEntityAssets(['img1', '', 'img2', 'img1']);

    expect(destroyMock).toHaveBeenCalledTimes(2);
    expect(destroyMock).toHaveBeenNthCalledWith(1, pathId('img1'));
    expect(destroyMock).toHaveBeenNthCalledWith(2, pathId('img2'));
  });

  it('should delete removed IDs in reconcile', async () => {
    destroyMock.mockResolvedValue({ result: 'ok' });

    await service.reconcileEntityAssets(['a', 'b', 'c'], ['b', 'c', 'd']);

    expect(destroyMock).toHaveBeenCalledTimes(1);
    expect(destroyMock).toHaveBeenCalledWith(pathId('a'));
  });

  it('should return on not found', async () => {
    destroyMock.mockResolvedValue({ result: 'not found' });

    await service.cleanupEntityAssets(['gone']);

    expect(destroyMock).toHaveBeenCalledTimes(1);
    expect(destroyMock).toHaveBeenCalledWith(pathId('gone'));
  });

  it('should swallow Cloudinary rejections (single attempt)', async () => {
    destroyMock.mockRejectedValueOnce(new Error('fail-1'));

    await expect(
      service.cleanupEntityAssets(['retry-id']),
    ).resolves.toBeUndefined();

    expect(destroyMock).toHaveBeenCalledTimes(1);
    expect(destroyMock).toHaveBeenCalledWith(pathId('retry-id'));
  });

  it('should call destroy once and ignore result payload', async () => {
    destroyMock.mockResolvedValueOnce({ result: 'error' });

    await service.cleanupEntityAssets(['bad']);

    expect(destroyMock).toHaveBeenCalledTimes(1);
    expect(destroyMock).toHaveBeenCalledWith(pathId('bad'));
  });
});
