import { useRouter } from "next/router";
import Page from "@/src/components/layouts/page";
import { api } from "@/src/utils/api";
import { FieldReviewTable } from "@/src/components/table/use-cases/field-review";

export default function FieldReviewPage() {
  const router = useRouter();
  const projectId = router.query.projectId as string;
  const traceId = router.query.traceId as string;

  return (
    <Page
      headerProps={{
        title: "Field Review",
        help: {
          description:
            "Review field-level evaluations from the Lambda function. Each field shows the extracted value, original PDF evidence, and evaluation result.",
          href: "https://langfuse.com/docs",
        },
      }}
    >
      {projectId && traceId ? (
        <FieldReviewTable projectId={projectId} traceId={traceId} />
      ) : (
        <div className="flex items-center justify-center rounded-lg border border-dashed border-muted-foreground/25 py-8">
          <p className="text-sm text-muted-foreground">
            Loading field review data...
          </p>
        </div>
      )}
    </Page>
  );
}
