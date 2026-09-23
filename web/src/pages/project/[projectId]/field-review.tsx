import { useRouter } from "next/router";
import Page from "@/src/components/layouts/page";
import { FieldReviewTable } from "@/src/components/table/use-cases/field-review";

export default function FieldReviewPage() {
  const router = useRouter();
  const projectId = router.query.projectId as string;
  const traceId = router.query.traceId as string;

  if (!traceId) {
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
      headerProps={{
        title: "Field Review",
        help: {
          description:
            "Review field-level evaluations from the Lambda function. Each field shows the extracted value, original PDF evidence, and evaluation result.",
          href: "https://langfuse.com/docs",
        },
      }}
    >
      <FieldReviewTable projectId={projectId} traceId={traceId} />
    </Page>
  );
}
