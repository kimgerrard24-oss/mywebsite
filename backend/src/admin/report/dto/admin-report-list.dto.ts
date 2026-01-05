// backend/src/admin/report/dto/admin-report-list.dto.ts

import { AdminReportItemDto } from './admin-report-item.dto';

export class AdminReportListDto {
  items!: AdminReportItemDto[];
  meta!: {
    total: number;
    page: number;
    limit: number;
  };

  static from(params: {
    items: any[];
    total: number;
    page: number;
    limit: number;
  }): AdminReportListDto {
    return {
      items: params.items.map(
        AdminReportItemDto.from,
      ),
      meta: {
        total: params.total,
        page: params.page,
        limit: params.limit,
      },
    };
  }
}
