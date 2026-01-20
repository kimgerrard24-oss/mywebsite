// backend/src/follows/follow-request/tests/get-incoming-follow-requests.spec.ts

import { Test } from '@nestjs/testing';
import { FollowRequestsService } from '../follow-requests.service';

describe('FollowRequestsService.getIncomingRequests', () => {
  let service: FollowRequestsService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [FollowRequestsService],
    }).compile();

    service =
      module.get(FollowRequestsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // production project should add:
  // - banned user
  // - locked account
  // - pagination
});
