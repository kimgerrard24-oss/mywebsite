// frontend/src/components/report/MyReportList.tsx

import MyReportItem from "./MyReportItem";
import { useMyReports } from "@/hooks/useMyReports";

export default function MyReportList() {
  const {
    items,
    loading,
    error,
    hasMore,
    loadMore,
  } = useMyReports();

  if (error) {
    return (
      <p className="text-sm text-red-600">
        {typeof error === "string"
          ? error
          : "Failed to load reports"}
      </p>
    );
  }

  return (
    <section aria-label="My reports">
      <h2 className="mb-3 text-lg font-semibold">
        My Reports
      </h2>

      {!loading && items.length === 0 && (
        <p className="text-sm text-gray-500">
          You haven't submitted any reports yet.
        </p>
      )}

      {items.length > 0 && (
        <div className="space-y-2">
          {items.map((r) => (
            <MyReportItem
              key={r.id}
              report={r}
            />
          ))}
        </div>
      )}

      {loading && (
        <p className="mt-3 text-sm text-gray-500">
          Loading…
        </p>
      )}

      {hasMore && !loading && (
        <button
          type="button"
          onClick={() => loadMore()}
          className="mt-4 rounded-md border px-3 py-1 text-sm hover:bg-gray-50"
        >
          Load more
        </button>
      )}
    </section>
  );
}
