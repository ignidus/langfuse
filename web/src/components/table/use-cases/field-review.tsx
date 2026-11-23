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
  category:
    | "identity_contact"
    | "coverage_claims_documents"
    | "operations_class_staffing";
  workatoValue: string | null;
  originalPdfValue: string | null;
  result: string;
  evaluatorReason: string | null;
  timestamp: string;
};

type ResultFilter = "all" | "correct" | "needs_review" | "incorrect";

export function FieldReviewTable({
  projectId,
  traceId,
}: {
  projectId: string;
  traceId: string;
}) {
  return (
    <FieldReviewTableForTrace
      key={JSON.stringify([projectId, traceId])}
      projectId={projectId}
      traceId={traceId}
    />
  );
}

function FieldReviewTableForTrace({
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
  const {
    data: fieldCategoryReviews,
    isLoading: isCategoryReviewsLoading,
    error: categoryReviewsError,
  } = api.scores.fieldCategoryReviews.useQuery(
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
        mapValue: (value) => value || undefined,
      }),
      createTextTableColumn({
        header: "Field",
        accessorKey: "field",
      }),
      createTextTableColumn({
        header: "Workato extracted value",
        accessorKey: "workatoValue",
        mapValue: (value) => value || undefined,
      }),
      createTextTableColumn({
        header: "Original PDF evidence",
        accessorKey: "originalPdfValue",
        mapValue: (value) => value || undefined,
      }),
      createStatusTableColumn<FieldReviewRow, string>({
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
          return undefined;
        },
      }),
      createTextTableColumn({
        header: "Evaluator reason / PDF page reference",
        accessorKey: "evaluatorReason",
        mapValue: (value) => value || undefined,
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
                    const normalized = row.result.toLowerCase();
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
      {(
        [
          { id: "identity_contact", title: "Identity & Contact" },
          {
            id: "coverage_claims_documents",
            title: "Coverage, Claims & Documents",
          },
          {
            id: "operations_class_staffing",
            title: "Operations, Class & Staffing",
          },
        ] as const
      ).map(({ id, title }) => {
        const categoryReview = fieldCategoryReviews?.[id] ?? null;
        const hasSavedRows = fieldReviewData?.some(
          (row) => row.category === id,
        );
        const rows = filteredData.filter((row) => row.category === id);

        return (
          <details key={id} open className="rounded-lg border">
            <summary className="cursor-pointer px-4 py-3 font-medium">
              {title}
            </summary>
            <div className="px-4 pb-4">
              {isCategoryReviewsLoading ? (
                <p className="py-2 text-sm text-muted-foreground">
                  Loading category evaluation…
                </p>
              ) : categoryReviewsError ? (
                <p className="py-2 text-sm text-destructive">
                  Error loading category evaluation: {categoryReviewsError.message}
                </p>
              ) : categoryReview ? (
                <div className="mb-4 space-y-2 border-b pb-4">
                  <p className="text-sm font-bold">
                    {categoryReview.verdict?.replace(/_/g, " ") ??
                      "Verdict unavailable"}
                  </p>
                  <p className="whitespace-pre-wrap break-words text-sm leading-6 text-muted-foreground">
                    {categoryReview.reasoning?.trim()
                      ? categoryReview.reasoning
                      : "Reasoning was not recorded for this evaluation."}
                  </p>
                </div>
              ) : null}
              {isLoading || hasSavedRows ? (
                <SimpleDataTable
                  columns={columns}
                  data={rows}
                  isLoading={isLoading}
                  noResults={
                    <p className="py-4 text-center text-sm text-muted-foreground">
                      No fields match the selected result filter.
                    </p>
                  }
                  presentation="default"
                />
              ) : isCategoryReviewsLoading ? (
                <p className="py-4 text-sm text-muted-foreground">
                  Loading field results…
                </p>
              ) : categoryReviewsError ? null : categoryReview ? (
                <p className="py-4 text-sm text-muted-foreground">
                  No individual field results are available for this evaluation.
                </p>
              ) : (
                <p className="py-4 text-sm text-muted-foreground">
                  No evaluation result is recorded for this category.
                </p>
              )}
            </div>
          </details>
        );
      })}
    </div>
  );
}
