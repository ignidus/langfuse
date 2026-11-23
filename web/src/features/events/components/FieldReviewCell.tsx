import Link from "next/link";
import { Button } from "@/src/components/ui/button";
import { api } from "@/src/utils/api";

export const FIELD_REVIEW_EVIDENCE_NAME = "allied_health_evaluation_evidence";

export function FieldReviewCell({
  projectId,
  traceId,
  observationId,
}: {
  projectId: string;
  traceId: string;
  observationId: string;
}) {
  const latestEvidence = api.events.listCursor.useQuery({
    projectId,
    searchQuery: null,
    searchType: ["id", "content"],
    filter: [
      {
        column: "name",
        type: "string",
        operator: "=",
        value: FIELD_REVIEW_EVIDENCE_NAME,
      },
      { column: "traceId", type: "string", operator: "=", value: traceId },
    ],
    limit: 1,
  });

  if (
    latestEvidence.isFetching ||
    latestEvidence.isError ||
    latestEvidence.data?.observations[0]?.id !== observationId
  )
    return <span aria-hidden="true" />;

  return (
    <Button asChild size="sm" variant="outline">
      <Link
        href={`/project/${projectId}/field-review?traceId=${encodeURIComponent(traceId)}`}
        data-row-click-ignore
        onClick={(event) => event.stopPropagation()}
      >
        View Field Review
      </Link>
    </Button>
  );
}
