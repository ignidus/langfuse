import Link from "next/link";
import { ClipboardCheck } from "lucide-react";
import { api } from "@/src/utils/api";
import { Button } from "@/src/components/ui/button";
import { PublishTraceSwitch } from "@/src/components/publish-object-switch";
import { DeleteTraceButton } from "@/src/components/deleteButton";

/**
 * Trace-level header actions shared by the peek and standalone trace page.
 * Share and Delete render disabled when the user lacks the relevant project
 * scope; Field Review navigation is omitted on shared-only trace pages.
 *
 * `layout="toolbar"` (default) is the inline icon row; `layout="menu"` renders
 * the same controls as full-width labeled rows for the peek's overflow popover
 * (whole row clickable) — Share keeps its URL popover, Delete its confirm.
 *
 * Delete always targets the whole trace (same as the page, even when reached
 * from an observation/event row — the surface shows that trace). Behavior
 * differs only by surface:
 * - **page**: pass `deleteRedirectUrl` → navigates to the list after delete.
 * - **peek**: pass `onAfterDelete` (e.g. `closePeek`) → closes in place. It
 *   receives the deleted trace id so the peek can stay open if K/J-navigation
 *   already moved on to another trace (LFE-10535). We invalidate broadly
 *   because the peek is hosted over many different lists (traces, observations,
 *   events, sessions, experiments, datasets), each backed by a different query
 *   — so the deleted row disappears everywhere.
 */
export function TraceDetailActions({
  traceId,
  projectId,
  isPublic,
  shareUrl,
  name,
  timestamp,
  deleteRedirectUrl,
  onAfterDelete,
  showFieldReview = true,
  size = "icon-xs",
  layout = "toolbar",
}: {
  traceId: string;
  projectId: string;
  isPublic: boolean;
  shareUrl?: string;
  name?: string | null;
  timestamp?: Date;
  deleteRedirectUrl?: string;
  onAfterDelete?: (deletedTraceId: string) => void;
  showFieldReview?: boolean;
  size?: "icon" | "icon-xs";
  layout?: "toolbar" | "menu";
}) {
  const utils = api.useUtils();
  const isMenu = layout === "menu";

  // The page path navigates away (redirectUrl) and never calls this. The peek
  // path is hosted over many different lists, so invalidate all queries to
  // refresh whichever list is behind the peek, then close it. We hand the
  // deleted trace id to onAfterDelete so the peek can skip closing when it has
  // already navigated to a different trace (LFE-10535).
  const onDeleteInvalidate = () => {
    utils.invalidate();
    onAfterDelete?.(traceId);
  };

  if (isMenu) {
    return (
      <div className="flex w-full flex-col gap-0.5">
        <PublishTraceSwitch
          projectId={projectId}
          traceId={traceId}
          timestamp={timestamp}
          isPublic={isPublic}
          shareUrl={shareUrl}
          label="Share"
        />
        {showFieldReview && (
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="w-full justify-start font-normal"
          >
            <Link
              href={`/project/${projectId}/field-review?traceId=${encodeURIComponent(traceId)}`}
            >
              <ClipboardCheck className="mr-2 h-4 w-4" aria-hidden="true" />
              View Field Review
            </Link>
          </Button>
        )}
        <DeleteTraceButton
          itemId={traceId}
          projectId={projectId}
          redirectUrl={deleteRedirectUrl}
          invalidateFunc={onDeleteInvalidate}
          deleteConfirmation={name ?? ""}
          variant="ghost"
          size="sm"
          className="w-full justify-start font-normal"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-row items-center gap-1">
      {showFieldReview && (
        <Button
          asChild
          variant="ghost"
          size={size}
          aria-label="View Field Review"
          title="View Field Review"
        >
          <Link
            href={`/project/${projectId}/field-review?traceId=${encodeURIComponent(traceId)}`}
          >
            <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
          </Link>
        </Button>
      )}
      <PublishTraceSwitch
        projectId={projectId}
        traceId={traceId}
        timestamp={timestamp}
        isPublic={isPublic}
        shareUrl={shareUrl}
        size={size}
        tooltip={isPublic ? "Shared (public)" : "Share"}
      />
      <DeleteTraceButton
        itemId={traceId}
        projectId={projectId}
        redirectUrl={deleteRedirectUrl}
        invalidateFunc={onDeleteInvalidate}
        deleteConfirmation={name ?? ""}
        icon
        // Match Publish so both icons share one row height and a ghost (not
        // boxed "outline") style.
        size={size}
        variant="ghost"
      />
    </div>
  );
}
