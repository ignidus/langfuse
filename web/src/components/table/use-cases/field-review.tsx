import { useMemo, useState } from "react";
import { api } from "@/src/utils/api";
import { SimpleDataTable } from "@/src/components/table/simple-data-table";
import { createTextTableColumn } from "@/src/components/design-system/table/columns/createTextTableColumn";
import { createStatusTableColumn } from "@/src/components/design-system/table/columns/createStatusTableColumn";
import {
  type LangfuseColumnDef,
} from "@/src/components/table/types";

export type FieldReviewRow = {
  id: string;
  workatoJobId: string | null;
  field: string;
  workatoValue: string | null;
  originalPdfValue: string | null;
  result: string;
  evaluatorReason: string | null;
  timestamp: Date;
};

type ResultFilter = "all" | "correct" | "needs_review" | "incorrect";

export function FieldReviewTable({
  projectId,
  traceId,
}: {
  projectId: string;
  traceId: string;
}) {
  const [resultFilter, setResultFilter] = useState<ResultFilter>("all");

  // Fetch field review data
  const { data: fieldReviewData, isLoading, error } = api.scores.fieldReview.useQuery(
    { projectId, traceId },
    { enabled: !!projectId && !!traceId },
  );

  // Filter data based on result status
  const filteredData = useMemo(() => {
    if (!fieldReviewData) return [];

    if (resultFilter === "all") {
      return fieldReviewData;
    }

    return fieldReviewData.filter((row) => {
      const normalizedResult = row.result.toLowerCase() as string;
      const normalizedFilter = resultFilter.toLowerCase().replace(/-/g, "_");
      return normalizedResult === normalizedFilter;
    });
  }, [fieldReviewData, resultFilter]);

  // Column definitions
  const columns: LangfuseColumnDef<FieldReviewRow>[] = useMemo(
    () => [
      createTextTableColumn({
        header: "Workato Job ID",
        accessorKey: "workatoJobId",
        cell: (value) => value || <span className="text-muted-foreground">—</span>,
      }),
      createTextTableColumn({
        header: "Field",
        accessorKey: "field",
      }),
      createTextTableColumn({
        header: "Workato extracted value",
        accessorKey: "workatoValue",
        cell: (value) =>
          value ? (
            <span className="font-mono text-xs">{value}</span>
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
      }),
      createTextTableColumn({
        header: "Original PDF evidence",
        accessorKey: "originalPdfValue",
        cell: (value) =>
          value ? (
            <span className="font-mono text-xs">{value}</span>
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
      }),
      createStatusTableColumn({
        header: "Result",
        accessorKey: "result",
        getStatus: (value) => {
          if (!value) return undefined;
          const normalized = String(value)
            .toLowerCase()
            .replace(/-/g, "_");
          if (normalized === "correct") return "completed";
          if (normalized === "needs_review") return "pending";
          if (normalized === "incorrect") return "error";
          return "partial" as any;
        },
      }),
      createTextTableColumn({
        header: "Evaluator reason / PDF page reference",
        accessorKey: "evaluatorReason",
        cell: (value) =>
          value ? (
            <span className="text-xs">{value}</span>
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
      }),
    ],
    [],
  );

  if (error) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-dashed border-destructive/25 bg-destructive/5 py-8">
        <p className="text-sm text-destructive">
          Error loading field review data: {error.message}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter Tabs */}
      <div className="flex gap-2 border-b">
        {(
          [
            { value: "all" as const, label: "All" },
            { value: "correct" as const, label: "Correct" },
            { value: "needs_review" as const, label: "Needs review" },
            { value: "incorrect" as const, label: "Incorrect" },
          ] as const
        ).map((filter) => (
          <button
            key={filter.value}
            onClick={() => setResultFilter(filter.value)}
            className={`px-3 py-2 text-sm font-medium transition-colors ${
              resultFilter === filter.value
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {filter.label}
            {fieldReviewData && (
              <span className="ml-2 text-xs">
                (
                {
                  fieldReviewData.filter((row) => {
                    if (filter.value === "all") return true;
                    const normalized = row.result
                      .toLowerCase()
                      .replace(/_/g, "_");
                    const normalizedFilter = filter.value
                      .toLowerCase()
                      .replace(/-/g, "_");
                    return normalized === normalizedFilter;
                  }).length
                }
                )
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <SimpleDataTable
        columns={columns}
        data={filteredData}
        isLoading={isLoading}
        noResults={
          <div className="flex flex-col items-center gap-2 py-8">
            <p className="text-sm font-medium text-muted-foreground">
              No field review data
            </p>
            <p className="text-xs text-muted-foreground">
              No field scores matching the criteria were found for this trace.
            </p>
          </div>
        }
        presentation="default"
      />
    </div>
  );
}
