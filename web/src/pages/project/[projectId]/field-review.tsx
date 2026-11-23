import { useRouter } from "next/router";
import Page from "@/src/components/layouts/page";
import { api } from "@/src/utils/api";
import { FieldReviewTable } from "@/src/components/table/use-cases/field-review";
import { AiSummaryReview } from "@/src/components/table/use-cases/ai-summary-review";

export default function FieldReviewPage() {
  const router = useRouter();
  const projectId = router.query.projectId as string;
  const traceId = router.query.traceId as string;
  const decisionQuality = api.scores.decisionQualityReview.useQuery(
    { projectId, traceId },
    { enabled: !!projectId && !!traceId },
  );

  if (!traceId) {
    return (
      <Page
        scrollable
        headerProps={{
          title: "Field Review",
          help: {
            description:
              "Review field-level evaluations and AI summary quality for a submission.",
            href: "https://langfuse.com/docs",
          },
        }}
      >
        <div className="flex h-full items-center justify-center rounded-lg border border-dashed">
          <p className="text-sm text-muted-foreground">
            Please select a trace to review field-level results.
          </p>
        </div>
      </Page>
    );
  }

  return (
    <Page
      scrollable
      headerProps={{
        title: "Field Review",
        help: {
          description:
            "Review field-level evaluations and AI summary quality for a submission.",
          href: "https://langfuse.com/docs",
        },
      }}
    >
      <div className="space-y-6">
        <section aria-labelledby="ai-summary-review-heading">
          <h2
            id="ai-summary-review-heading"
            className="mb-3 text-lg font-semibold"
          >
            AI Summary Review
          </h2>
          <AiSummaryReview projectId={projectId} traceId={traceId} />
        </section>

        <section aria-labelledby="decision-quality-heading">
          <h2 id="decision-quality-heading" className="mb-3 text-lg font-semibold">
            Decision Quality
          </h2>
          <div className="space-y-2 rounded-lg border p-4">
            {decisionQuality.isLoading ? (
              <p className="text-sm text-muted-foreground">
                Loading decision quality…
              </p>
            ) : decisionQuality.isError ? (
              <p className="text-sm text-destructive">
                Could not load the decision quality score.
              </p>
            ) : decisionQuality.data ? (
              <>
                <p className="text-sm font-medium">
                  {decisionQuality.data.verdict?.replace(/_/g, " ") ??
                    "Verdict unavailable"}
                </p>
                <p className="whitespace-pre-wrap break-words text-sm leading-6 text-muted-foreground">
                  {decisionQuality.data.reasoning?.trim()
                    ? decisionQuality.data.reasoning
                    : "Reasoning was not recorded for this evaluation."}
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Not evaluated</p>
            )}
          </div>
        </section>

        <section aria-labelledby="field-review-heading">
          <h2 id="field-review-heading" className="mb-3 text-lg font-semibold">
            Field-Level Review
          </h2>
          <FieldReviewTable projectId={projectId} traceId={traceId} />
        </section>
      </div>
    </Page>
  );
}
