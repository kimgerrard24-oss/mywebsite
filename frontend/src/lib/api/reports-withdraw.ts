// frontend/src/lib/api/reports-withdraw.ts

import { client } from "@/lib/api/api";

/**
 * POST /reports/:id/withdraw
 */
export async function withdrawReport(
  reportId: string,
): Promise<void> {
  await client.post(
    `/reports/${reportId}/withdraw`,
  );
}
