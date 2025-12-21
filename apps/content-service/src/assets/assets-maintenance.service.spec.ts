import { Test } from '@nestjs/testing';
import { AssetsMaintenanceService } from './assets-maintenance.service';
import { CLOUDINARY } from './cloudinary.provider';

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
    expect(destroyMock).toHaveBeenNthCalledWith(1, 'img1');
    expect(destroyMock).toHaveBeenNthCalledWith(2, 'img2');
  });

  it('should delete removed IDs in reconcile', async () => {
    destroyMock.mockResolvedValue({ result: 'ok' });

    await service.reconcileEntityAssets(['a', 'b', 'c'], ['b', 'c', 'd']);

    expect(destroyMock).toHaveBeenCalledTimes(1);
    expect(destroyMock).toHaveBeenCalledWith('a');
  });

  it('should return on not found', async () => {
    destroyMock.mockResolvedValue({ result: 'not found' });

    await service.cleanupEntityAssets(['gone']);

    expect(destroyMock).toHaveBeenCalledTimes(1);
    expect(destroyMock).toHaveBeenCalledWith('gone');
  });

  it('should retry on errors and eventually succeed', async () => {
    destroyMock
      .mockRejectedValueOnce(new Error('fail-1'))
      .mockResolvedValueOnce({ result: 'ok' });

    await service.cleanupEntityAssets(['retry-id']);

    expect(destroyMock).toHaveBeenCalledTimes(2);
    expect(destroyMock).toHaveBeenLastCalledWith('retry-id');
  });

  it('should retry on unexpected result', async () => {
    destroyMock
      .mockResolvedValueOnce({ result: 'error' })
      .mockResolvedValueOnce({ result: 'error' });

    await service.cleanupEntityAssets(['bad']);

    expect(destroyMock).toHaveBeenCalledTimes(2);
    expect(destroyMock).toHaveBeenLastCalledWith('bad');
  });
});
