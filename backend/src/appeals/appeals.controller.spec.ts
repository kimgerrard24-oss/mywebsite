// backend/src/appeals/appeals.controller.spec.ts

import { Test } from '@nestjs/testing';
import { AppealsController } from './appeals.controller';
import { AppealsService } from './appeals.service';

describe('AppealsController', () => {
  let controller: AppealsController;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [AppealsController],
      providers: [
        {
          provide: AppealsService,
          useValue: {
            createAppeal: jest.fn().mockResolvedValue({
              id: 'appeal-id',
              status: 'PENDING',
            }),
          },
        },
      ],
    }).compile();

    controller =
      module.get<AppealsController>(AppealsController);
  });

  it('should create appeal', async () => {
    const req: any = {
      user: { userId: 'u1', jti: 'j1' },
      ip: '127.0.0.1',
      headers: {},
    };

    const dto: any = {
      targetType: 'POST',
      targetId: 'p1',
      reason: 'unfair moderation',
    };

    const res = await controller.createAppeal(req, dto);
    expect(res.id).toBeDefined();
  });
});
