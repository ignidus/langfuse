import { api } from "@/src/utils/api";
import { Clock, Coins } from "lucide-react";
import { usdFormatter } from "@/src/utils/numbers";

export function AiSummaryReview({
  projectId,
  traceId,
}: {
  projectId: string;
  traceId: string;
}) {
  const summaryReview = api.scores.aiSummaryReview.useQuery(
    {
      projectId,
      traceId,
    },
    {
      enabled: Boolean(projectId && traceId),
    },
  );

  if (summaryReview.isLoading) {
    return (
      <div className="rounded-lg border p-6 text-sm text-muted-foreground">
        Loading AI summary review…
      </div>
    );
  }

  if (summaryReview.error) {
    return (
      <div className="rounded-lg border border-destructive p-6 text-sm text-destructive">
        Unable to load AI summary review: {summaryReview.error.message}
      </div>
    );
  }

  if (!summaryReview.data) {
    return (
      <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
        No AI Summary Quality evaluator score is available for this submission
        yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-card p-6">
        <p className="text-sm font-medium text-muted-foreground">
          AI Summary Quality
        </p>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-4xl font-semibold">
            {summaryReview.data.score ?? "—"}
          </span>
          <span className="text-lg text-muted-foreground">/ 5</span>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Evaluated {new Date(summaryReview.data.timestamp).toLocaleString()}
        </p>

        {/* Evaluation metrics row */}
        <div className="mt-4 flex flex-wrap gap-4 border-t pt-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-mono text-muted-foreground">
              {summaryReview.data.durationMs !== null
                ? `${(summaryReview.data.durationMs / 1000).toFixed(2)}s`
                : "Not recorded"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Coins className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-mono text-muted-foreground">
              {summaryReview.data.estimatedCostUsd !== null
                ? usdFormatter(summaryReview.data.estimatedCostUsd)
                : "Not recorded"}
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-base font-semibold">Evaluator reasoning</h2>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
          {summaryReview.data.reasoning ??
            "No evaluator reasoning was saved for this score."}
        </p>
      </div>
    </div>
  );
}
